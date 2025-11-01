import cv2
import mediapipe as mp
import time
import torch as t
from model import HandModel
from tools.landmark_handle import landmark_handle
from tools.draw_landmarks import draw_landmarks
from tools.calc_landmark_list import calc_landmark_list
from tools.draw_bounding_rect import draw_bounding_rect
import numpy as np
from tools.draw_rect_text import draw_rect_txt

model_path = 'checkpoints/model_t9_39.pth'
# model_path = 'checkpoints/model_39.pth'
# label = ["also", "attractive", "beautiful", "believe", "de", "doubt", "dream", "express", "eye", "give", "handLang",
#          "have",
#          "many",
#          "me", "method", "no", "only", "over", "please", "put", "say", "smile", "star", "use_accept_give", "very",
#          "watch",
#          "you"]

# label = ["bad", "foolish", "good","hate","iloveyou","me","you"]t2

# label = ["bad", "dream","good", "happy", "hate","home","hui","iloveyou","lei", "me","mood","no","renshi","smile",
# "think","very","watch","you",
# ]t4

# label = ["bad", "dream","good", "happy", "hate","home","hui","iloveyou","lei", "me","no","renshi","smile",
# "think","very","watch","you",
# ]t5

# label = ["bad", "dream","good","hate","hui","iloveyou","lei", "me","no","smile",
# "think","very","watch","you",
# ]t6


# label = ["bad", "dream","good","hate","hui","iloveyou","me","no",
# "think","watch","you",
# ]t7

# label = ["bad", "dream","good","hate","hui","iloveyou","me","no",
# "think","watch","you",
# ]t8

label = ["bad", "dream","good","smile","hui","iloveyou","me","no",
"think","watch","you",
]

# model_path = 'checkpoints/model_u_39.pth'自己数据集第一版
label_num = len(label)

background_flag = 0
background_color = 128

model = HandModel()
state_dict = t.load(model_path)
model.load_state_dict(state_dict)

mp_drawing = mp.solutions.drawing_utils
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.75,
    min_tracking_confidence=0.75)
cap = cv2.VideoCapture(0)
# cap = cv2.VideoCapture("./Video/static/eye_1.mp4")

FrameCount = 0
time1 = time.time()
fps = 0
while True:
    ret, frame = cap.read()
    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    frame = cv2.flip(frame, 1)
    results = hands.process(frame)
    frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)

    hand_local = []
    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            # mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
            for i in range(21):
                x = min(int(hand_landmarks.landmark[i].x * frame.shape[1]), frame.shape[1] - 1)
                y = min(int(hand_landmarks.landmark[i].y * frame.shape[0]), frame.shape[0] - 1)
                hand_local.append([x, y])

            if background_flag:
                frame = np.zeros(frame.shape, np.uint8)
                frame.fill(128)

            # 自己填骨架的色
            draw_landmarks(frame, hand_local)
            brect = draw_bounding_rect(frame, hand_local)
            # brect是框架的四个点坐标
            hand_local = landmark_handle(hand_local)

    if hand_local:
        output = model(t.tensor(hand_local))
        index, value = output.topk(1)[1][0], output.topk(1)[0][0]
        this_label = label[index]
        draw_rect_txt(frame, this_label + ":" + str(value), brect)

        if value > 9:
            cv2.putText(frame,
                        this_label,
                        (30, 50),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        1.5,
                        (255, 255, 255),
                        3)

    time2 = time.time()
    FrameCount += 1
    if time2 - time1 >= 0.5:
        if FrameCount > 0:
            fps = round(FrameCount / (time2 - time1), 2)
            time1 = time.time()
            FrameCount = 0

    cv2.putText(frame,
                str(fps),
                (5, 15),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (255, 255, 255),
                1)

    cv2.imshow('MediaPipe Hands', frame)
    if cv2.waitKey(1) & 0xFF == 27:
        break
cap.release()
