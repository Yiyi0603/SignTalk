@echo off
chcp 65001 >nul
echo ========================================
echo SignTalk 前端部署脚本
echo ========================================
echo.

cd /d "%~dp0signtalk"

echo [1/3] 检查前端依赖...
cd fronted
if not exist "node_modules" (
    echo 安装前端依赖...
    call npm install
    if errorlevel 1 (
        echo [错误] 前端依赖安装失败
        pause
        exit /b 1
    )
)

echo [2/3] 构建前端...
call npm run build
if errorlevel 1 (
    echo [错误] 前端构建失败
    pause
    exit /b 1
)

echo [3/3] 检查静态文件...
cd ..
if exist "static\index.html" (
    echo [成功] 前端构建完成！
    echo.
    echo 静态文件位置: static\
    echo.
    echo 现在可以启动Django服务器：
    echo   python manage.py runserver 0.0.0.0:8000
    echo.
    echo 以及信令服务器（在另一个终端）：
    echo   cd fronted\server
    echo   node main.js
    echo.
) else (
    echo [警告] 未找到构建后的index.html文件
    echo 请检查构建过程是否成功
)

pause

