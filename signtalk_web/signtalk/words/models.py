# models.py

from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Word(models.Model):
    word = models.CharField(max_length=100)
    pinyin = models.CharField(max_length=100)
    video_url = models.URLField()
    description = models.TextField(blank=True)
    category = models.ForeignKey(Category, related_name='words', on_delete=models.CASCADE)

    def __str__(self):
        return self.word
