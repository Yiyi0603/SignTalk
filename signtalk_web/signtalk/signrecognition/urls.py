from django.urls import path
from . import views

urlpatterns = [
    path('recognize/', views.recognize_sign_language, name='recognize_sign_language'),
]
