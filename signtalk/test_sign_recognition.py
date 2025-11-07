#!/usr/bin/env python
"""
手语识别API测试脚本
"""
import requests
import base64
import cv2
import numpy as np
import json

# API端点
BASE_URL = "http://localhost:8000/api/v1/sign-recognition"

def test_model_info():
    """测试模型信息API"""
    print("测试模型信息API...")
    try:
        response = requests.get(f"{BASE_URL}/model-info/")
        if response.status_code == 200:
            data = response.json()
            print("✅ 模型信息获取成功:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
        else:
            print(f"❌ 模型信息获取失败: {response.status_code}")
    except Exception as e:
        print(f"❌ 请求失败: {e}")

def test_available_labels():
    """测试可识别标签API"""
    print("\n测试可识别标签API...")
    try:
        response = requests.get(f"{BASE_URL}/labels/")
        if response.status_code == 200:
            data = response.json()
            print("✅ 标签列表获取成功:")
            print(f"可识别的标签: {data['labels']}")
            print(f"标签数量: {data['count']}")
        else:
            print(f"❌ 标签列表获取失败: {response.status_code}")
    except Exception as e:
        print(f"❌ 请求失败: {e}")

def test_recognition_with_sample_image():
    """使用示例图像测试识别功能"""
    print("\n测试手语识别功能...")
    
    # 创建一个简单的测试图像 (黑色背景)
    test_image = np.zeros((480, 640, 3), dtype=np.uint8)
    
    # 编码为base64
    _, buffer = cv2.imencode('.jpg', test_image)
    image_base64 = base64.b64encode(buffer).decode('utf-8')
    
    # 准备请求数据
    data = {
        "image_data": image_base64
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/recognize/",
            json=data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ 手语识别请求成功:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
        else:
            print(f"❌ 手语识别请求失败: {response.status_code}")
            print(f"响应内容: {response.text}")
    except Exception as e:
        print(f"❌ 请求失败: {e}")

def main():
    """主测试函数"""
    print("🚀 开始测试手语识别API集成...")
    print("=" * 50)
    
    # 测试各个API端点
    test_model_info()
    test_available_labels()
    test_recognition_with_sample_image()
    
    print("\n" + "=" * 50)
    print("🎉 测试完成!")

if __name__ == "__main__":
    main()




