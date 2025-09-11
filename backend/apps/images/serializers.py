from rest_framework import serializers
from .models import ImageUpload, ProcessedImage

class ImageUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageUpload
        fields = ['id', 'original_image', 'original_filename', 'file_size', 
                 'image_width', 'image_height', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

class ProcessedImageSerializer(serializers.ModelSerializer):
    effect_name = serializers.CharField(source='effect_applied.name', read_only=True)
    original_image_url = serializers.URLField(source='original_upload.original_image.url', read_only=True)
    processed_image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProcessedImage
        fields = ['id', 'processed_image', 'processed_image_url', 'effect_name', 'original_image_url',
                 'processing_time', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_processed_image_url(self, obj):
        if obj.processed_image:
            return obj.processed_image.url
        return None
