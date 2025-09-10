from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EffectViewSet, EffectCategoryViewSet

router = DefaultRouter()
router.register(r'effects', EffectViewSet)
router.register(r'categories', EffectCategoryViewSet)

urlpatterns = router.urls