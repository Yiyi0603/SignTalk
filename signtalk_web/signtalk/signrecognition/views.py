from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import base64
import cv2
import numpy as np
import mediapipe as mp
import torch
import sys
import os

# 尝试导入TensorFlow，如果失败则跳过CNN模型
try:
    import tensorflow as tf
    TENSORFLOW_AVAILABLE = True
except ImportError as e:
    print(f"TensorFlow导入失败: {e}")
    TENSORFLOW_AVAILABLE = False

# 添加模型路径 - 使用相对路径
mediapipe_sl_path = os.path.join(os.path.dirname(__file__), '../models/mediapipe-sl')
cnn_model_path = os.path.join(os.path.dirname(__file__), '../models/cnn')
sys.path.append(mediapipe_sl_path)

try:
    from model import HandModel
    from tools.landmark_handle import landmark_handle
except ImportError as e:
    print(f"MediaPipe-SL导入错误: {e}")
    HandModel = None
    landmark_handle = None

# 手语标签 - MediaPipe模型 (与原始模型完全一致，只有11个标签)
MEDIAPIPE_LABELS = ["不好", "梦想", "好的", "微笑", "会", "我爱你", "我", "不", "思考", "看", "你"]

# ASL字母标签 - CNN模型
ASL_LABELS = [str(i) for i in range(10)] + [chr(65 + i) for i in range(26)]  # 0-9, A-Z

# 初始化MediaPipe - 降低检测阈值以提高手部检测成功率
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.5,  # 降低检测阈值
    min_tracking_confidence=0.5    # 降低跟踪阈值
)

# 初始化模型
mediapipe_model = None
cnn_model = None

# 加载MediaPipe模型
if HandModel:
    try:
        mediapipe_model = HandModel()
        model_path = os.path.join(mediapipe_sl_path, 'model_t9_39.pth')
        if os.path.exists(model_path):
            # 直接尝试加载模型
            try:
                state_dict = torch.load(model_path, map_location='cpu', weights_only=False)
                mediapipe_model.load_state_dict(state_dict)
                mediapipe_model.eval()
                print("MediaPipe手语识别模型加载成功")
            except Exception as load_error:
                print(f"模型文件加载失败: {load_error}")
                mediapipe_model = None
                print("MediaPipe模型加载失败，无法使用")
        else:
            print(f"模型文件不存在: {model_path}")
            mediapipe_model = None
    except Exception as e:
        print(f"MediaPipe模型加载失败: {e}")
        mediapipe_model = None

# 暂时禁用CNN模型，专注于MediaPipe模型
cnn_model = None
print("CNN模型暂时禁用，专注于MediaPipe模型")

def preprocess_for_cnn(image, hand_landmarks):
    """
    为CNN模型预处理图像 - 修复输入形状匹配问题
    """
    try:
        # 获取手部边界框
        h, w = image.shape[:2]
        landmarks = [(lm.x * w, lm.y * h) for lm in hand_landmarks.landmark]
        x_coords, y_coords = zip(*landmarks)
        x_min, x_max = int(min(x_coords)), int(max(x_coords))
        y_min, y_max = int(min(y_coords)), int(max(y_coords))
        
        # 添加边距
        margin = 20
        x_min = max(0, x_min - margin)
        y_min = max(0, y_min - margin)
        x_max = min(w, x_max + margin)
        y_max = min(h, y_max + margin)
        
        # 提取手部区域
        roi = image[y_min:y_max, x_min:x_max]
        
        # 调整大小到128x128（匹配模型期望的输入尺寸）
        roi = cv2.resize(roi, (128, 128))
        
        # 保持RGB格式（3通道），不转换为灰度图
        if len(roi.shape) == 3 and roi.shape[2] == 3:
            # 已经是RGB格式
            pass
        elif len(roi.shape) == 3:
            # 如果是BGR，转换为RGB
            roi = cv2.cvtColor(roi, cv2.COLOR_BGR2RGB)
        else:
            # 如果是灰度图，转换为RGB
            roi = cv2.cvtColor(roi, cv2.COLOR_GRAY2RGB)
        
        # 归一化到0-1范围
        roi = roi.astype('float32') / 255.0
        
        # 添加批次维度
        roi = np.expand_dims(roi, axis=0)
        
        return roi
    except Exception as e:
        print(f"CNN预处理错误: {e}")
        return None

@csrf_exempt
@require_http_methods(["POST"])
def recognize_sign_language(request):
    """
    手语识别API - 使用真实的模型进行识别
    """
    try:
        data = json.loads(request.body)
        image_data = data.get('image')
        
        if not image_data:
            return JsonResponse({'error': '没有提供图像数据'}, status=400)
        
        # 解码base64图像
        image_bytes = base64.b64decode(image_data.split(',')[1])
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            return JsonResponse({'error': '图像解码失败'}, status=400)
        
        # 转换颜色空间
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # 手部检测
        results = hands.process(image_rgb)
        
        if not results.multi_hand_landmarks:
            return JsonResponse({
                'success': False,
                'message': '未检测到手部'
            })
        
        hand_landmarks = results.multi_hand_landmarks[0]
        
        # 优先使用MediaPipe模型进行识别
        if mediapipe_model and landmark_handle:
            try:
                # 提取手部关键点
                landmarks = []
                for landmark in hand_landmarks.landmark:
                    x = int(landmark.x * image.shape[1])
                    y = int(landmark.y * image.shape[0])
                    landmarks.append([x, y])
                
                # 处理关键点
                processed_landmarks = landmark_handle(landmarks)
                
                if len(processed_landmarks) >= 42:  # 21个点 * 2坐标 = 42
                    # 确保输入数据长度正确
                    if len(processed_landmarks) > 48:
                        processed_landmarks = processed_landmarks[:48]
                    elif len(processed_landmarks) < 48:
                        processed_landmarks.extend([0] * (48 - len(processed_landmarks)))
                    
                    input_tensor = torch.tensor(processed_landmarks, dtype=torch.float32)
                    with torch.no_grad():
                        output = mediapipe_model(input_tensor.unsqueeze(0))
                        probabilities = torch.softmax(output, dim=1)
                        confidence, predicted = torch.max(probabilities, 1)
                    
                    # 确保索引在有效范围内（0-10，对应11个标签）
                    predicted_index = predicted.item()
                    if predicted_index < len(MEDIAPIPE_LABELS):
                        predicted_label = MEDIAPIPE_LABELS[predicted_index]
                        confidence_score = confidence.item()
                        
                        if confidence_score > 0.1:  # 降低阈值
                            return JsonResponse({
                                'success': True,
                                'label': predicted_label,
                                'confidence': confidence_score,
                                'model_type': 'mediapipe',
                                'message': f'MediaPipe识别: {predicted_label}'
                            })
                    else:
                        print(f"预测索引超出范围: {predicted_index}, 最大索引: {len(MEDIAPIPE_LABELS)-1}")
            except Exception as e:
                print(f"MediaPipe模型推理错误: {e}")
        
        # 如果MediaPipe模型失败，尝试使用CNN模型
        if cnn_model and TENSORFLOW_AVAILABLE:
            try:
                # 预处理图像
                preprocessed_img = preprocess_for_cnn(image, hand_landmarks)
                
                if preprocessed_img is not None:
                    # 进行预测
                    predictions = cnn_model.predict(preprocessed_img, verbose=0)
                    predicted_class = np.argmax(predictions, axis=1)[0]
                    confidence_score = np.max(predictions)
                    predicted_label = ASL_LABELS[predicted_class]
                    
                    # 添加调试信息
                    print(f"CNN预测结果: 类别={predicted_class}, 标签={predicted_label}, 置信度={confidence_score:.4f}")
                    print(f"所有预测概率: {predictions[0][:5]}")  # 显示前5个类别的概率
                    
                    if confidence_score > 0.1:  # 进一步降低阈值
                        return JsonResponse({
                            'success': True,
                            'label': predicted_label,
                            'confidence': float(confidence_score),
                            'model_type': 'cnn',
                            'message': f'CNN识别: {predicted_label}'
                        })
            except Exception as e:
                print(f"CNN模型推理错误: {e}")
        
        # 如果两个模型都失败，返回未识别
        return JsonResponse({
            'success': False,
            'message': '手语识别失败，请调整手势或光照条件'
        })
            
    except Exception as e:
        print(f"手语识别API错误: {e}")
        return JsonResponse({
            'success': False,
            'message': f'服务器错误: {str(e)}'
        }, status=500)
