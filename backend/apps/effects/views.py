from rest_framework import viewsets
from rest_framework.response import Response
from .models import Effect, EffectCategory
from .serializers import EffectSerializer, EffectCategorySerializer

class EffectCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EffectCategory.objects.all()
    serializer_class = EffectCategorySerializer

class EffectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Effect.objects.filter(is_active=True)
    serializer_class = EffectSerializer
    
    def get_queryset(self):
        """Filter effects by category if specified"""
        queryset = self.queryset
        category = self.request.query_params.get('category', None)
        
        if category:
            queryset = queryset.filter(category__slug=category)
        
        return queryset