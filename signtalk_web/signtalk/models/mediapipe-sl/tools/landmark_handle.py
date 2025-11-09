import numpy as np

def landmark_handle(hand_landmarks):
    """
    处理手部关键点数据，进行标准化
    """
    if not hand_landmarks or len(hand_landmarks) == 0:
        return []
    
    # 转换为numpy数组
    landmarks = np.array(hand_landmarks)
    
    # 计算手部中心点
    center_x = np.mean(landmarks[:, 0])
    center_y = np.mean(landmarks[:, 1])
    
    # 计算到中心点的最大距离
    distances = np.sqrt((landmarks[:, 0] - center_x)**2 + (landmarks[:, 1] - center_y)**2)
    max_distance = np.max(distances)
    
    # 避免除零
    if max_distance == 0:
        max_distance = 1
    
    # 标准化坐标
    normalized_landmarks = []
    for landmark in landmarks:
        x = (landmark[0] - center_x) / max_distance
        y = (landmark[1] - center_y) / max_distance
        normalized_landmarks.append([x, y])
    
    # 展平为一维数组
    flattened = []
    for landmark in normalized_landmarks:
        flattened.extend(landmark)
    
    return flattened