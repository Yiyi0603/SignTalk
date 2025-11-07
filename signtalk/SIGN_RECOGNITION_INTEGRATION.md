# SignTalk 手语识别系统集成

本项目将SignTalk_Model中的手语识别模型成功集成到Django Web应用中。

## 🚀 功能特性

- **实时手语识别**: 基于MediaPipe和PyTorch的手语识别
- **RESTful API**: 提供标准化的API接口
- **多标签支持**: 支持11种手语词汇识别
- **Web集成**: 与现有Django Web应用无缝集成

## 📁 项目结构

```
signtalk_web/signtalk/
├── signrecognition/           # 手语识别应用
│   ├── model_files/          # 模型文件目录
│   │   ├── model.py          # 神经网络模型定义
│   │   ├── tools/            # 工具函数
│   │   │   ├── landmark_handle.py
│   │   │   ├── draw_landmarks.py
│   │   │   ├── calc_landmark_list.py
│   │   │   ├── draw_bounding_rect.py
│   │   │   └── draw_rect_text.py
│   │   └── checkpoints/      # 模型权重文件
│   │       └── model_t9_39.pth
│   ├── services.py           # 手语识别服务类
│   ├── views.py              # API视图
│   └── urls.py               # URL配置
├── requirements.txt          # 项目依赖
└── test_sign_recognition.py # 测试脚本
```

## 🛠️ 安装和配置

### 1. 安装依赖

```bash
cd signtalk_web/signtalk
pip install -r requirements.txt
```

### 2. 数据库迁移

```bash
python manage.py makemigrations
python manage.py migrate
```

### 3. 启动服务器

```bash
python manage.py runserver
```

## 📡 API接口

### 1. 手语识别

**端点**: `POST /api/v1/sign-recognition/recognize/`

**请求体**:
```json
{
    "image_data": "base64编码的图像数据"
}
```

**响应**:
```json
{
    "success": true,
    "label": "good",
    "confidence": 8.5,
    "message": "识别结果: good (置信度: 8.50)"
}
```

### 2. 获取模型信息

**端点**: `GET /api/v1/sign-recognition/model-info/`

**响应**:
```json
{
    "success": true,
    "data": {
        "model_path": "/path/to/model.pth",
        "labels": ["bad", "dream", "good", ...],
        "label_count": 11,
        "model_loaded": true
    }
}
```

### 3. 获取可识别标签

**端点**: `GET /api/v1/sign-recognition/labels/`

**响应**:
```json
{
    "success": true,
    "labels": ["bad", "dream", "good", "smile", "hui", "iloveyou", "me", "no", "think", "watch", "you"],
    "count": 11
}
```

## 🧪 测试

运行测试脚本验证集成是否成功:

```bash
python test_sign_recognition.py
```

## 🎯 支持的手语词汇

当前模型支持以下11种手语词汇的识别:

1. **bad** - 坏的
2. **dream** - 梦想
3. **good** - 好的
4. **smile** - 微笑
5. **hui** - 会
6. **iloveyou** - 我爱你
7. **me** - 我
8. **no** - 不
9. **think** - 思考
10. **watch** - 看
11. **you** - 你

## 🔧 技术栈

- **后端框架**: Django 4.2.17
- **机器学习**: PyTorch 2.4.1
- **计算机视觉**: OpenCV 4.10.0.84, MediaPipe 0.10.11
- **API**: Django REST Framework
- **图像处理**: NumPy, Pillow

## 📝 使用示例

### Python客户端示例

```python
import requests
import base64
import cv2

# 读取图像
image = cv2.imread('hand_sign.jpg')
_, buffer = cv2.imencode('.jpg', image)
image_base64 = base64.b64encode(buffer).decode('utf-8')

# 发送识别请求
response = requests.post(
    'http://localhost:8000/api/v1/sign-recognition/recognize/',
    json={'image_data': image_base64}
)

result = response.json()
print(f"识别结果: {result['label']}")
print(f"置信度: {result['confidence']}")
```

### JavaScript客户端示例

```javascript
// 将canvas图像转换为base64
const canvas = document.getElementById('videoCanvas');
const imageData = canvas.toDataURL('image/jpeg').split(',')[1];

// 发送识别请求
fetch('/api/v1/sign-recognition/recognize/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        image_data: imageData
    })
})
.then(response => response.json())
.then(data => {
    console.log('识别结果:', data.label);
    console.log('置信度:', data.confidence);
});
```

## 🚨 注意事项

1. **模型文件**: 确保 `model_t9_39.pth` 文件存在于 `checkpoints/` 目录中
2. **依赖版本**: 严格按照 `requirements.txt` 中的版本安装依赖
3. **图像格式**: 支持JPEG格式的图像数据
4. **性能**: 首次加载模型可能需要几秒钟时间
5. **内存**: 模型运行需要足够的内存支持

## 🔄 更新日志

- **v1.0.0**: 初始版本，集成手语识别模型到Django Web应用
- 支持11种手语词汇识别
- 提供RESTful API接口
- 完整的错误处理和日志记录




