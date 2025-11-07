#!/usr/bin/env python
"""
SignTalk 手语识别系统启动脚本
"""
import os
import sys
import subprocess
import django
from django.core.management import execute_from_command_line

def check_dependencies():
    """检查依赖是否安装"""
    print("🔍 检查依赖...")
    try:
        import torch
        import cv2
        import mediapipe
        import numpy
        print("✅ 所有依赖已安装")
        return True
    except ImportError as e:
        print(f"❌ 缺少依赖: {e}")
        print("请运行: pip install -r requirements.txt")
        return False

def check_model_file():
    """检查模型文件是否存在"""
    print("🔍 检查模型文件...")
    model_path = "signrecognition/model_files/checkpoints/model_t9_39.pth"
    if os.path.exists(model_path):
        print("✅ 模型文件存在")
        return True
    else:
        print(f"❌ 模型文件不存在: {model_path}")
        print("请确保模型文件已正确复制到checkpoints目录")
        return False

def run_migrations():
    """运行数据库迁移"""
    print("🔄 运行数据库迁移...")
    try:
        execute_from_command_line(['manage.py', 'makemigrations'])
        execute_from_command_line(['manage.py', 'migrate'])
        print("✅ 数据库迁移完成")
        return True
    except Exception as e:
        print(f"❌ 数据库迁移失败: {e}")
        return False

def start_server():
    """启动Django服务器"""
    print("🚀 启动Django服务器...")
    try:
        execute_from_command_line(['manage.py', 'runserver'])
    except KeyboardInterrupt:
        print("\n👋 服务器已停止")
    except Exception as e:
        print(f"❌ 启动服务器失败: {e}")

def main():
    """主函数"""
    print("🎯 SignTalk 手语识别系统启动器")
    print("=" * 50)
    
    # 设置Django环境
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'signtalk.settings')
    django.setup()
    
    # 检查依赖
    if not check_dependencies():
        return
    
    # 检查模型文件
    if not check_model_file():
        return
    
    # 运行迁移
    if not run_migrations():
        return
    
    print("\n" + "=" * 50)
    print("🎉 所有检查通过！")
    print("📡 API端点:")
    print("  - 手语识别: POST /api/v1/sign-recognition/recognize/")
    print("  - 模型信息: GET /api/v1/sign-recognition/model-info/")
    print("  - 标签列表: GET /api/v1/sign-recognition/labels/")
    print("=" * 50)
    
    # 启动服务器
    start_server()

if __name__ == "__main__":
    main()




