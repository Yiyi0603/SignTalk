import os
import sys
import torch
import numpy as np
from django.conf import settings

# 添加模型文件路径到系统路径
sys.path.append(os.path.join(os.path.dirname(__file__), 'model_files'))

from model import HandModel


class SimpleSignRecognitionService:
    """简化版手语识别服务类（不依赖MediaPipe）"""
    
    def __init__(self):
        self.model_path = os.path.join(os.path.dirname(__file__), 'model_files', 'checkpoints', 'model_t9_39.pth')
        self.label = ["bad", "dream", "good", "smile", "hui", "iloveyou", "me", "no", "think", "watch", "you"]
        
        # 初始化模型
        self.model = HandModel()
        if os.path.exists(self.model_path):
            state_dict = torch.load(self.model_path, map_location='cpu')
            self.model.load_state_dict(state_dict)
            self.model.eval()
            self.model_loaded = True
        else:
            self.model_loaded = False
            print(f"警告: 模型文件未找到: {self.model_path}")
    
    def recognize_from_landmarks(self, landmarks_data):
        """
        从手部关键点数据中识别手语
        
        Args:
            landmarks_data: 48维的手部关键点特征向量
            
        Returns:
            dict: 包含识别结果的字典
        """
        try:
            if not self.model_loaded:
                return {
                    'success': False,
                    'label': None,
                    'confidence': 0.0,
                    'message': '模型未加载'
                }
            
            # 确保输入数据格式正确
            if len(landmarks_data) != 48:
                return {
                    'success': False,
                    'label': None,
                    'confidence': 0.0,
                    'message': f'输入数据维度错误，期望48维，实际{len(landmarks_data)}维'
                }
            
            # 转换为tensor并进行预测
            with torch.no_grad():
                input_tensor = torch.tensor(landmarks_data, dtype=torch.float32).unsqueeze(0)
                output = self.model(input_tensor)
                index, confidence = output.topk(1)[1][0], output.topk(1)[0][0]
                
                predicted_label = self.label[index.item()]
                confidence_score = confidence.item()
                
                return {
                    'success': True,
                    'label': predicted_label,
                    'confidence': confidence_score,
                    'message': f'识别结果: {predicted_label} (置信度: {confidence_score:.2f})'
                }
            
        except Exception as e:
            return {
                'success': False,
                'label': None,
                'confidence': 0.0,
                'message': f'识别过程中发生错误: {str(e)}'
            }
    
    def generate_test_landmarks(self):
        """生成测试用的手部关键点数据"""
        # 生成48维的随机测试数据（模拟手部关键点特征）
        np.random.seed(42)  # 固定随机种子以便复现
        test_landmarks = np.random.randn(48).tolist()
        return test_landmarks
    
    def get_available_labels(self):
        """获取可识别的标签列表"""
        return self.label
    
    def get_model_info(self):
        """获取模型信息"""
        return {
            'model_path': self.model_path,
            'labels': self.label,
            'label_count': len(self.label),
            'model_loaded': self.model_loaded,
            'model_exists': os.path.exists(self.model_path)
        }


# 全局服务实例
simple_sign_recognition_service = SimpleSignRecognitionService()




