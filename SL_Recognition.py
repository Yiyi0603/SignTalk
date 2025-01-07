import tensorflow as tf
import cv2
import numpy as np

# 加载保存的模型
model = tf.keras.models.load_model('asl_cnn_model.h5')

# 如果你有类别的映射，可以从索引映射回类别名称
index_to_label = {i: chr(65 + i) for i in range(10)}  # 类别为0-9,A-Z
index_to_label.update({i + 10: chr(65 + i) for i in range(26)})

# 设置图像大小
img_size = (64, 64)

# 预处理输入图像
def preprocess_image(image):
    # 转换为HSV颜色空间
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    lower_hsv = np.array([0, 20, 70], dtype=np.uint8)
    upper_hsv = np.array([20, 255, 255], dtype=np.uint8)
    mask = cv2.inRange(hsv, lower_hsv, upper_hsv)
    mask = cv2.GaussianBlur(mask, (5, 5), 0)

    # 查找轮廓
    contours, _ = cv2.findContours(mask, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    if contours and len(contours) > 0:
        contour = max(contours, key=cv2.contourArea)
        if cv2.contourArea(contour) > 1000:
            x, y, w, h = cv2.boundingRect(contour)
            roi = image[y:y + h, x:x + w]
            roi = cv2.resize(roi, img_size)
            roi = roi.astype('float32') / 255.0
            roi = np.expand_dims(roi, axis=0)
            return roi, (x, y, w, h)
    return None, None

# 尝试使用不同的视频捕获后端
for backend in [cv2.CAP_DSHOW, cv2.CAP_MSMF, cv2.CAP_V4L2]:
    print(f"尝试使用视频捕获后端: {backend}")
    cap = cv2.VideoCapture(0, backend)

    if not cap.isOpened():
        print(f"无法使用后端 {backend} 打开摄像头")
        continue

    print(f"成功使用后端 {backend} 打开摄像头")
    break
else:
    print("所有视频捕获后端均无法打开摄像头")
    exit()

while True:
    # 读取一帧图像
    ret, frame = cap.read()
    if not ret:
        print("无法获取摄像头图像")
        break

    # 翻转图像，避免镜像效果
    frame = cv2.flip(frame, 1)

    # 预处理图像
    preprocessed_img, bbox = preprocess_image(frame)

    if preprocessed_img is not None:
        # 进行预测
        predictions = model.predict(preprocessed_img)
        predicted_class = np.argmax(predictions, axis=1)[0]
        predicted_label = index_to_label[predicted_class]

        # 显示预测结果
        x, y, w, h = bbox
        cv2.putText(frame, f"Predicted: {predicted_label}", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)

    # 显示图像
    cv2.imshow('Hand Gesture Recognition', frame)

    # 按'q'键退出
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# 释放摄像头并关闭所有窗口
cap.release()
cv2.destroyAllWindows()