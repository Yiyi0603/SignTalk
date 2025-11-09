import numpy as np

def calc_landmark_list(hand_landmarks):
    """
    计算手部关键点列表
    """
    if not hand_landmarks or len(hand_landmarks) == 0:
        return []
    
    landmarks = []
    for landmark in hand_landmarks:
        landmarks.append([landmark.x, landmark.y])
    
    return landmarks