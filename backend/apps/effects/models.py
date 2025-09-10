from django.db import models
from django.contrib.auth.models import User
import uuid

class EffectCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class Effect(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    category = models.ForeignKey(EffectCategory, on_delete=models.CASCADE)
    user_description = models.TextField()  # What users see
    hidden_prompt = models.TextField()     # AI prompt (secret)
    thumbnail = models.ImageField(upload_to='effect_thumbnails/')
    
    # Processing parameters
    strength = models.FloatField(default=0.7)
    preserve_faces = models.BooleanField(default=True)
    max_resolution = models.CharField(max_length=20, default="2048x2048")
    output_format = models.CharField(max_length=10, default="jpeg")
    
    is_active = models.BooleanField(default=True)
    is_premium = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name