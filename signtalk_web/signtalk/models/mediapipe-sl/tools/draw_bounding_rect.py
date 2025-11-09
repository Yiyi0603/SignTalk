import cv2
import numpy as np

def draw_bounding_rect(image, hand_landmarks):
    """
    绘制手部边界框
    """
    if not hand_landmarks or len(hand_landmarks) == 0:
        return None
    
    # 计算边界框
    x_coords = [landmark[0] for landmark in hand_landmarks]
    y_coords = [landmark[1] for landmark in hand_landmarks]
    
    x_min, x_max = min(x_coords), max(x_coords)
    y_min, y_max = min(y_coords), max(y_coords)
    
    # 添加边距
    margin = 20
    x_min = max(0, x_min - margin)
    y_min = max(0, y_min - margin)
    x_max = min(image.shape[1], x_max + margin)
    y_max = min(image.shape[0], y_max + margin)
    
    # 绘制边界框
    cv2.rectangle(image, (x_min, y_min), (x_max, y_max), (255, 0, 0), 2)
    
    return (x_min, y_min, x_max, y_max)