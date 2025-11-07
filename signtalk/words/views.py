# views.py
from rest_framework import generics
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from .models import Category, Word
from .serializers import CategorySerializer, WordSerializer

class CategoryList(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class WordList(generics.ListAPIView):
    serializer_class = WordSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]  # 添加搜索过滤器
    filterset_fields = ['category']  # 使用 category 作为过滤参数名
    search_fields = ['word', 'pinyin']  # 允许搜索的字段

    def get_queryset(self):
        return Word.objects.all()

class WordDetail(generics.RetrieveAPIView):
    queryset = Word.objects.all()
    serializer_class = WordSerializer