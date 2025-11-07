from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import User
from .serializers import UserSerializer
from django.contrib.auth.hashers import check_password


@api_view(['POST'])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': '注册成功'}, status=status.HTTP_201_CREATED)
    # 格式化验证错误为统一的消息格式
    error_messages = []
    for field, errors in serializer.errors.items():
        error_messages.append(f"{field}: {', '.join(errors)}")
    return Response(
        {'message': '注册失败: ' + '; '.join(error_messages)}, 
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['POST'])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = User.objects.filter(username=username).first()
    if user and check_password(password, user.password):
        return Response({'message': '登录成功'}, status=status.HTTP_200_OK)
    return Response({'message': '用户名或密码错误'}, status=status.HTTP_401_UNAUTHORIZED)