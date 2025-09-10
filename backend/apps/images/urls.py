from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ImageUploadViewSet

router = DefaultRouter()
router.register(r'images', ImageUploadViewSet)

urlpatterns = router.urls