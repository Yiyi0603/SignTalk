import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, BatchNormalization, Dropout
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import cv2
import numpy as np
import os

# 设置参数
img_size = (64, 64)
batch_size = 32
num_classes = 36  # ASL数据集有36个类别（0-9,A-Z）

# 定义数据集目录
data_dir = "D:\\聋哑人辅助系统\\SignTalk\\ASL"


# 自定义数据生成器以转换为HSV
class HSVImageDataGenerator(ImageDataGenerator):
    def standardize(self, x):
        if self.featurewise_center:
            x -= self.mean
        if self.featurewise_std_normalization:
            x /= self.std
        if self.samplewise_center:
            x -= np.mean(x, keepdims=True)
        if self.samplewise_std_normalization:
            x /= np.std(x, keepdims=True)
        if self.zca_whitening:
            flat_x = np.reshape(x, (-1, np.prod(x.shape[-3:])))
            sigma = np.dot(flat_x.T, flat_x) / flat_x.shape[0]
            u, s, _ = np.linalg.svd(sigma)
            principal_components = np.dot(u, np.diag(1. / np.sqrt(s + self.zca_epsilon)))
            x = np.dot(flat_x, principal_components)
            x = np.reshape(x, x.shape)
        if self.rescale:
            x *= self.rescale
        if self.preprocessing_function:
            x = self.preprocessing_function(x)
        if self.data_format == 'channels_first':
            if x.ndim == 3:
                x = x.transpose(2, 0, 1)
            elif x.ndim == 4:
                x = x.transpose(0, 3, 1, 2)
        return x


def preprocess_image(image):
    image = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
    return image


# 使用自定义的ImageDataGenerator进行数据增强和预处理
datagen = HSVImageDataGenerator(
    rescale=1.0 / 255.0,
    validation_split=0.2,  # 使用20%的数据进行验证
    preprocessing_function=preprocess_image
)

# 加载训练数据
train_generator = datagen.flow_from_directory(
    data_dir,
    target_size=img_size,
    batch_size=batch_size,
    class_mode='categorical',
    subset='training'
)

# 加载验证数据
validation_generator = datagen.flow_from_directory(
    data_dir,
    target_size=img_size,
    batch_size=batch_size,
    class_mode='categorical',
    subset='validation'
)

# 构建改进的CNN模型
model = Sequential([
    Conv2D(32, (3, 3), activation='relu', input_shape=(img_size[0], img_size[1], 3)),
    BatchNormalization(),
    MaxPooling2D((2, 2)),
    Dropout(0.25),

    Conv2D(64, (3, 3), activation='relu'),
    BatchNormalization(),
    MaxPooling2D((2, 2)),
    Dropout(0.25),

    Conv2D(128, (3, 3), activation='relu'),
    BatchNormalization(),
    MaxPooling2D((2, 2)),
    Dropout(0.25),

    Flatten(),
    Dense(128, activation='relu'),
    BatchNormalization(),
    Dropout(0.5),
    Dense(num_classes, activation='softmax')
])

# 编译模型
model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

# 训练模型
model.fit(
    train_generator,
    epochs=30,  # 可以根据需要调整
    validation_data=validation_generator
)

# 保存模型
model.save('asl_cnn_model.h5')