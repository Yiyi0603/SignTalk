#!/usr/bin/env python
"""
简化版手语识别API测试脚本（不依赖MediaPipe）
"""
import requests
import json
import numpy as np

# API端点
BASE_URL = "http://localhost:8000/api/v1/sign-recognition"

def test_model_info():
    """测试模型信息API"""
    print("🔍 测试模型信息API...")
    try:
        response = requests.get(f"{BASE_URL}/model-info/")
        if response.status_code == 200:
            data = response.json()
            print("✅ 模型信息获取成功:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
        else:
            print(f"❌ 模型信息获取失败: {response.status_code}")
            print(f"响应内容: {response.text}")
    except Exception as e:
        print(f"❌ 请求失败: {e}")

def test_available_labels():
    """测试可识别标签API"""
    print("\n🔍 测试可识别标签API...")
    try:
        response = requests.get(f"{BASE_URL}/labels/")
        if response.status_code == 200:
            data = response.json()
            print("✅ 标签列表获取成功:")
            print(f"可识别的标签: {data['labels']}")
            print(f"标签数量: {data['count']}")
        else:
            print(f"❌ 标签列表获取失败: {response.status_code}")
            print(f"响应内容: {response.text}")
    except Exception as e:
        print(f"❌ 请求失败: {e}")

def test_recognition_with_sample_data():
    """使用示例数据测试识别功能"""
    print("\n🔍 测试手语识别功能...")
    
    # 生成48维的测试数据（模拟手部关键点特征）
    np.random.seed(42)
    test_landmarks = np.random.randn(48).tolist()
    
    # 准备请求数据
    data = {
        "landmarks_data": test_landmarks
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

def test_automatic_test():
    """测试自动测试功能"""
    print("\n🔍 测试自动测试功能...")
    try:
        response = requests.get(f"{BASE_URL}/test/")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ 自动测试成功:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
        else:
            print(f"❌ 自动测试失败: {response.status_code}")
            print(f"响应内容: {response.text}")
    except Exception as e:
        print(f"❌ 请求失败: {e}")

def main():
    """主测试函数"""
    print("🚀 开始测试简化版手语识别API集成...")
    print("=" * 60)
    
    # 测试各个API端点
    test_model_info()
    test_available_labels()
    test_recognition_with_sample_data()
    test_automatic_test()
    
    print("\n" + "=" * 60)
    print("🎉 测试完成!")
    print("\n📝 使用说明:")
    print("1. 确保Django服务器正在运行: python manage.py runserver")
    print("2. 模型文件应该位于: signrecognition/model_files/checkpoints/model_t9_39.pth")
    print("3. 如果模型文件不存在，API会返回相应的错误信息")

if __name__ == "__main__":
    main()




