from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ImageUploadViewSet
from .views_processed import ProcessedImageViewSet

router = DefaultRouter()
router.register(r'images', ImageUploadViewSet)
router.register(r'processed_images', ProcessedImageViewSet)

urlpatterns = router.urls