# SignTalk
数据集：kaggle网站上开源的ASL（美国标准手语数据集）;获取地址：https://www.kaggle.com/datasets/ayuraj/asl-dataset?resource=download

Python环境：3.8（对版本要求严格）

CNN_Recognition.py：初版CNN卷积神经网络训练模型进行模型训练
注意：tensorflow要2.10.0版本

SL_Recognition.py:手语识别程序，利用OpenCV库获取摄像头并调用训练好的模型进行识别用户做出的手势（准确度低)
