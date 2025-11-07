from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.views import View
import json
import base64
import numpy as np
from .services import sign_recognition_service


@method_decorator(csrf_exempt, name='dispatch')
class SignRecognitionView(View):
    """手语识别API视图"""
    
    def post(self, request):
        """处理手语识别请求"""
        try:
            # 解析请求数据
            data = json.loads(request.body)
            image_data = data.get('image_data')
            
            if not image_data:
                return JsonResponse({
                    'success': False,
                    'message': '缺少图像数据'
                }, status=400)
            
            # 进行手语识别
            result = sign_recognition_service.recognize_from_image(image_data)
            
            return JsonResponse(result)
            
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'message': '无效的JSON数据'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'服务器错误: {str(e)}'
            }, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class ModelInfoView(View):
    """模型信息API视图"""
    
    def get(self, request):
        """获取模型信息"""
        try:
            model_info = sign_recognition_service.get_model_info()
            return JsonResponse({
                'success': True,
                'data': model_info
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'获取模型信息失败: {str(e)}'
            }, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class AvailableLabelsView(View):
    """可识别标签API视图"""
    
    def get(self, request):
        """获取可识别的标签列表"""
        try:
            labels = sign_recognition_service.get_available_labels()
            return JsonResponse({
                'success': True,
                'labels': labels,
                'count': len(labels)
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'获取标签列表失败: {str(e)}'
            }, status=500)