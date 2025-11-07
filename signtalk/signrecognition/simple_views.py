from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
import json
from .simple_services import simple_sign_recognition_service
from .services import sign_recognition_service


@method_decorator(csrf_exempt, name='dispatch')
class SimpleSignRecognitionView(View):
    """简化版手语识别API视图"""
    
    def post(self, request):
        """处理手语识别请求（支持两种输入：landmarks_data 或 image_data）"""
        try:
            # 解析请求数据
            data = json.loads(request.body)
            landmarks_data = data.get('landmarks_data')
            image_data = data.get('image_data')

            # 优先使用 landmarks_data（48维关键点），否则尝试使用 image_data（base64 图像）
            if landmarks_data:
                result = simple_sign_recognition_service.recognize_from_landmarks(landmarks_data)
                return JsonResponse(result)
            elif image_data:
                result = sign_recognition_service.recognize_from_image(image_data)
                return JsonResponse(result)
            else:
                return JsonResponse({
                    'success': False,
                    'message': '缺少手部关键点数据或图像数据'
                }, status=400)
            
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
class SimpleModelInfoView(View):
    """简化版模型信息API视图"""
    
    def get(self, request):
        """获取模型信息"""
        try:
            model_info = simple_sign_recognition_service.get_model_info()
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
class SimpleAvailableLabelsView(View):
    """简化版可识别标签API视图"""
    
    def get(self, request):
        """获取可识别的标签列表"""
        try:
            labels = simple_sign_recognition_service.get_available_labels()
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


@method_decorator(csrf_exempt, name='dispatch')
class TestRecognitionView(View):
    """测试识别API视图"""
    
    def get(self, request):
        """使用测试数据进行识别"""
        try:
            # 生成测试数据
            test_landmarks = simple_sign_recognition_service.generate_test_landmarks()
            
            # 进行识别
            result = simple_sign_recognition_service.recognize_from_landmarks(test_landmarks)
            
            return JsonResponse({
                'success': True,
                'test_data': test_landmarks,
                'recognition_result': result
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'测试失败: {str(e)}'
            }, status=500)




