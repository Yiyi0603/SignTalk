import os
import sys
import cv2
import mediapipe as mp
import torch
import numpy as np
from django.conf import settings

# 添加模型文件路径到系统路径
model_files_path = os.path.join(os.path.dirname(__file__), 'model_files')
if model_files_path not in sys.path:
    sys.path.insert(0, model_files_path)

# 使用importlib直接导入，避免路径问题
import importlib.util

# 导入 model
model_path = os.path.join(model_files_path, 'model.py')
spec = importlib.util.spec_from_file_location("model", model_path)
model_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(model_module)
HandModel = model_module.HandModel

# 导入 tools.landmark_handle
landmark_handle_path = os.path.join(model_files_path, 'tools', 'landmark_handle.py')
spec = importlib.util.spec_from_file_location("landmark_handle", landmark_handle_path)
landmark_handle_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(landmark_handle_module)
landmark_handle = landmark_handle_module.landmark_handle

# 导入 tools.calc_landmark_list
calc_landmark_list_path = os.path.join(model_files_path, 'tools', 'calc_landmark_list.py')
spec = importlib.util.spec_from_file_location("calc_landmark_list", calc_landmark_list_path)
calc_landmark_list_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(calc_landmark_list_module)
calc_landmark_list = calc_landmark_list_module.calc_landmark_list


class SignRecognitionService:
    """手语识别服务类"""
    
    def __init__(self):
        self.model_path = os.path.join(os.path.dirname(__file__), 'model_files', 'checkpoints', 'model_t9_39.pth')
        self.label = ["bad", "dream", "good", "smile", "hui", "iloveyou", "me", "no", "think", "watch", "you"]
        
        # 初始化模型
        self.model = HandModel()
        if os.path.exists(self.model_path):
            state_dict = torch.load(self.model_path, map_location='cpu')
            self.model.load_state_dict(state_dict)
            self.model.eval()
        else:
            raise FileNotFoundError(f"模型文件未找到: {self.model_path}")
        
        # 初始化MediaPipe
        self.mp_hands = mp.solutions.hands
        # 注意：不在这里创建 Hands 实例，而是在每次调用时创建新的实例
        # 这样可以避免时间戳不匹配的问题
        self.hands_config = {
            'static_image_mode': True,
            'max_num_hands': 1,
            'min_detection_confidence': 0.75,
            'min_tracking_confidence': 0.75
        }
    
    def recognize_from_image(self, image_data):
        """
        从图像数据中识别手语
        
        Args:
            image_data: 图像数据 (numpy array 或 base64 编码的字符串)
            
        Returns:
            dict: 包含识别结果的字典
        """
        try:
            # 处理图像数据
            if isinstance(image_data, str):
                # 如果是base64编码的字符串
                import base64
                image_bytes = base64.b64decode(image_data)
                nparr = np.frombuffer(image_bytes, np.uint8)
                image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            else:
                # 如果是numpy array
                image = image_data
            
            # 转换颜色空间
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # 为每次调用创建新的 Hands 实例，避免时间戳不匹配问题
            # 这样可以确保每次处理都是独立的，不会受到之前调用的影响
            hands = self.mp_hands.Hands(**self.hands_config)
            
            try:
                # 处理手部检测
                results = hands.process(image_rgb)
            finally:
                # 确保资源被释放
                hands.close()
            
            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    # 计算关键点坐标
                    landmark_list = calc_landmark_list(image, hand_landmarks)
                    
                    # 处理关键点数据
                    processed_landmarks = landmark_handle(landmark_list)
                    
                    # 进行预测
                    with torch.no_grad():
                        input_tensor = torch.tensor(processed_landmarks).unsqueeze(0)
                        output = self.model(input_tensor)
                        # 使用带温度的 softmax，缓解过度自信（温度>1更平滑）
                        temperature = 2.0
                        probs = torch.softmax(output / temperature, dim=1)
                        confidence_val, index = probs.max(dim=1)
                        predicted_label = self.label[index.item()]
                        prob = float(confidence_val.item())
                        # 转成百分比并做上限裁剪，避免 100.00% 的视觉误导
                        confidence_pct = max(0.0, min(prob * 100.0, 99.99))
                        return {
                            'success': True,
                            'label': predicted_label,
                            'confidence': float(f"{confidence_pct:.2f}"),
                            'message': f'识别结果: {predicted_label} (置信度: {confidence_pct:.2f}%)'
                        }
            
            return {
                'success': False,
                'label': None,
                'confidence': 0.0,
                'message': '未检测到手部'
            }
            
        except Exception as e:
            return {
                'success': False,
                'label': None,
                'confidence': 0.0,
                'message': f'识别过程中发生错误: {str(e)}'
            }
    
    def get_available_labels(self):
        """获取可识别的标签列表"""
        return self.label
    
    def get_model_info(self):
        """获取模型信息"""
        return {
            'model_path': self.model_path,
            'labels': self.label,
            'label_count': len(self.label),
            'model_loaded': os.path.exists(self.model_path)
        }


# 全局服务实例
sign_recognition_service = SignRecognitionService()




