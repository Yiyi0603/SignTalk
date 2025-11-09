import cv2
import numpy as np

def draw_landmarks(image, hand_landmarks):
    """
    在图像上绘制手部关键点
    """
    if not hand_landmarks or len(hand_landmarks) == 0:
        return image
    
    # 手部关键点连接关系
    connections = [
        [0, 1], [1, 2], [2, 3], [3, 4],  # 拇指
        [0, 5], [5, 6], [6, 7], [7, 8],  # 食指
        [5, 9], [9, 10], [10, 11], [11, 12],  # 中指
        [9, 13], [13, 14], [14, 15], [15, 16],  # 无名指
        [13, 17], [17, 18], [18, 19], [19, 20],  # 小指
        [0, 17]  # 手掌
    ]
    
    # 绘制连接线
    for connection in connections:
        if len(hand_landmarks) > max(connection):
            pt1 = tuple(map(int, hand_landmarks[connection[0]]))
            pt2 = tuple(map(int, hand_landmarks[connection[1]]))
            cv2.line(image, pt1, pt2, (0, 255, 0), 2)
    
    # 绘制关键点
    for landmark in hand_landmarks:
        x, y = int(landmark[0]), int(landmark[1])
        cv2.circle(image, (x, y), 3, (0, 0, 255), -1)
    
    return image