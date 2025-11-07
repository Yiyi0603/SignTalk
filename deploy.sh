#!/bin/bash

echo "========================================"
echo "SignTalk 前端部署脚本"
echo "========================================"
echo

cd "$(dirname "$0")/signtalk" || exit 1

echo "[1/3] 检查前端依赖..."
cd fronted || exit 1
if [ ! -d "node_modules" ]; then
    echo "安装前端依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[错误] 前端依赖安装失败"
        exit 1
    fi
fi

echo "[2/3] 构建前端..."
npm run build
if [ $? -ne 0 ]; then
    echo "[错误] 前端构建失败"
    exit 1
fi

echo "[3/3] 检查静态文件..."
cd ..
if [ -f "static/index.html" ]; then
    echo "[成功] 前端构建完成！"
    echo
    echo "静态文件位置: static/"
    echo
    echo "现在可以启动Django服务器："
    echo "  python manage.py runserver 0.0.0.0:8000"
    echo
    echo "以及信令服务器（在另一个终端）："
    echo "  cd fronted/server"
    echo "  node main.js"
    echo
else
    echo "[警告] 未找到构建后的index.html文件"
    echo "请检查构建过程是否成功"
fi

