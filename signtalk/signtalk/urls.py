# urls.py
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from userauth.views import register, login
from words.views import CategoryList, WordList, WordDetail
from .views import frontend_view

urlpatterns = [
    path('admin/', admin.site.urls),
    # API路由
    path('api/register/', register, name='register'),
    path('api/login/', login, name='login'),
    path('api/v1/categories/', CategoryList.as_view()),
    path('api/v1/words/', WordList.as_view()),
    path('api/v1/words/<int:pk>/', WordDetail.as_view()),
    path('api/v1/sign-recognition/', include('signrecognition.urls')),
]

# 静态文件服务配置
static_root = settings.STATICFILES_DIRS[0] if settings.STATICFILES_DIRS else None

if static_root:
    if settings.DEBUG:
        # 开发环境：Django自动提供静态文件
        urlpatterns += static(settings.STATIC_URL, document_root=static_root)
    else:
        # 生产环境：手动配置静态文件服务
        urlpatterns.append(
            re_path(r'^static/(?P<path>.*)$', serve, {'document_root': static_root})
        )
    
    # 处理前端构建后的 assets 路径（CSS、JS 等）
    # 前端构建后的文件在 static/assets/ 目录，但 URL 路径是 /assets/
    import os
    assets_dir = os.path.join(static_root, 'assets')
    if os.path.exists(assets_dir):
        urlpatterns.append(
            re_path(r'^assets/(?P<path>.*)$', serve, {'document_root': assets_dir})
        )

# 前端路由（SPA）- 必须放在最后，作为catch-all
# 所有非API、非admin、非static、非assets路径都返回前端index.html
urlpatterns.append(
    re_path(r'^(?!api|admin|static|assets).*$', frontend_view, name='frontend')
)