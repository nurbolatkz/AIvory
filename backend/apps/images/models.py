from django.db import models
from django.contrib.auth.models import User
from apps.effects.models import Effect
import uuid

class ImageUpload(models.Model):
    STATUS_CHOICES = [
        ('uploaded', 'Uploaded'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    original_image = models.ImageField(upload_to='uploads/')
    original_filename = models.CharField(max_length=255)
    file_size = models.IntegerField()  # in bytes
    image_width = models.IntegerField()
    image_height = models.IntegerField()
    
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Upload {self.id} - {self.original_filename}"

class ProcessedImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    original_upload = models.ForeignKey(ImageUpload, on_delete=models.CASCADE)
    effect_applied = models.ForeignKey(Effect, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    
    processed_image = models.ImageField(upload_to='processed/')
    processing_time = models.FloatField(default=0.0)  # seconds
    status = models.CharField(max_length=20, choices=ImageUpload.STATUS_CHOICES, default='processing')
    error_message = models.TextField(blank=True, null=True)
    
    # Metadata
    gemini_response_data = models.JSONField(default=dict)
    processing_params = models.JSONField(default=dict)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Processed {self.id} - {self.effect_applied.name}"

class UserUsage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    month = models.DateField()  # First day of month
    effects_used = models.IntegerField(default=0)
    premium_effects_used = models.IntegerField(default=0)
    
    class Meta:
        unique_together = ['user', 'month']