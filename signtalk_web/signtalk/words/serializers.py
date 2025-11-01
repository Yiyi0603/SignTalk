# serializers.py
from rest_framework import serializers
from .models import Category, Word

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class WordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Word
        fields = ['id', 'word', 'pinyin', 'video_url', 'description', 'category']