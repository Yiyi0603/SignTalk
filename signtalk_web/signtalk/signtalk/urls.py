# urls.py
from django.contrib import admin
from django.urls import path
from userauth.views import register, login
from words.views import CategoryList, WordList,WordDetail

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/register/', register, name='register'),
    path('api/login/', login, name='login'),
    path('api/v1/categories/', CategoryList.as_view()),  # 直接使用 path 注册
    path('api/v1/words/', WordList.as_view()),
path('api/v1/words/<int:pk>/', WordDetail.as_view()),  # 新增单个词汇详情端点
]