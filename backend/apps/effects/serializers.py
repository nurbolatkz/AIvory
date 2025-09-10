from rest_framework import serializers
from .models import Effect, EffectCategory

class EffectCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = EffectCategory
        fields = ['id', 'name', 'slug', 'description']

class EffectSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Effect
        fields = ['id', 'name', 'slug', 'category_name', 'user_description', 
                 'thumbnail', 'is_premium']
        # Note: hidden_prompt is excluded for security