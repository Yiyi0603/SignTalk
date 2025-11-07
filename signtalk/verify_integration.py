#!/usr/bin/env python
"""
简单的手语识别模型验证脚本
"""
import os
import sys
import torch

# 添加模型文件路径
sys.path.append(os.path.join(os.path.dirname(__file__), 'signrecognition', 'model_files'))

def test_model_loading():
    """测试模型加载"""
    print("🔍 测试模型加载...")
    
    try:
        from model import HandModel
        
        # 检查模型文件是否存在
        model_path = os.path.join('signrecognition', 'model_files', 'checkpoints', 'model_t9_39.pth')
        if os.path.exists(model_path):
            print(f"✅ 模型文件存在: {model_path}")
            
            # 尝试加载模型
            model = HandModel()
            state_dict = torch.load(model_path, map_location='cpu')
            model.load_state_dict(state_dict)
            model.eval()
            
            print("✅ 模型加载成功")
            
            # 测试模型推理
            test_input = torch.randn(1, 48)
            with torch.no_grad():
                output = model(test_input)
                print(f"✅ 模型推理成功，输出形状: {output.shape}")
                
            return True
        else:
            print(f"❌ 模型文件不存在: {model_path}")
            return False
            
    except Exception as e:
        print(f"❌ 模型加载失败: {e}")
        return False

def test_django_integration():
    """测试Django集成"""
    print("\n🔍 测试Django集成...")
    
    try:
        import django
        from django.conf import settings
        
        # 设置Django环境
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'signtalk.settings')
        django.setup()
        
        print("✅ Django环境设置成功")
        
        # 测试应用导入
        from signrecognition.simple_services import simple_sign_recognition_service
        print("✅ 手语识别服务导入成功")
        
        # 测试服务功能
        model_info = simple_sign_recognition_service.get_model_info()
        print(f"✅ 模型信息获取成功: {model_info['model_loaded']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Django集成测试失败: {e}")
        return False

def main():
    """主函数"""
    print("🚀 SignTalk 手语识别模型验证")
    print("=" * 50)
    
    # 测试模型加载
    model_ok = test_model_loading()
    
    # 测试Django集成
    django_ok = test_django_integration()
    
    print("\n" + "=" * 50)
    if model_ok and django_ok:
        print("🎉 所有测试通过！模型已成功嵌入到Django项目中")
        print("\n📡 可用的API端点:")
        print("  - GET  /api/v1/sign-recognition/model-info/")
        print("  - GET  /api/v1/sign-recognition/labels/")
        print("  - GET  /api/v1/sign-recognition/test/")
        print("  - POST /api/v1/sign-recognition/recognize/")
    else:
        print("❌ 部分测试失败，请检查错误信息")
    
    print("\n🚀 启动服务器命令:")
    print("  python manage.py runserver")

if __name__ == "__main__":
    main()



