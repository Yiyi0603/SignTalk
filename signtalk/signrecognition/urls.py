from django.urls import path
from . import simple_views

urlpatterns = [
    path('recognize/', simple_views.SimpleSignRecognitionView.as_view(), name='simple_sign_recognition'),
    path('model-info/', simple_views.SimpleModelInfoView.as_view(), name='simple_model_info'),
    path('labels/', simple_views.SimpleAvailableLabelsView.as_view(), name='simple_available_labels'),
    path('test/', simple_views.TestRecognitionView.as_view(), name='test_recognition'),
]
