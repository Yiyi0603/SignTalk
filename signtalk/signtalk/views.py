"""
Django视图，用于提供前端页面（SPA）
"""
from django.http import HttpResponse
from django.conf import settings
import os


def _load_index_html():
    """按优先级加载 index.html 内容。"""
    # 1) 优先使用构建后的静态目录
    static_dir = os.path.join(settings.BASE_DIR, 'static')
    index_path = os.path.join(static_dir, 'index.html')
    if os.path.exists(index_path):
        with open(index_path, 'r', encoding='utf-8') as f:
            return f.read()

    # 2) 退回使用源码 fronted 下的 index.html（开发时）
    fronted_dir = os.path.join(settings.BASE_DIR, 'fronted')
    fronted_index = os.path.join(fronted_dir, 'index.html')
    if os.path.exists(fronted_index):
        with open(fronted_index, 'r', encoding='utf-8') as f:
            content = f.read()
            # 开发时将 /src/main.js 指向静态路由，尽可能避免路径问题
            return content.replace('/src/main.js', '/static/src/main.js')

    # 3) 最后返回兜底页面
    return (
        '<!DOCTYPE html>'
        '<html lang="zh-CN">'
        '<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">'
        '<title>SignTalk - 前端未构建</title>'
        '<style>body{font-family:Arial,sans-serif;text-align:center;padding:50px}.error{color:#e74c3c}</style>'
        '</head><body>'
        '<h1 class="error">前端文件未找到</h1>'
        '<p>请先构建前端：cd fronted && npm run build</p>'
        '</body></html>'
    )


def frontend_view(request, *args, **kwargs):
    """返回单页应用入口页面。"""
    content = _load_index_html()
    return HttpResponse(content, content_type='text/html')

