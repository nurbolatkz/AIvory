from django.contrib import admin
from .models import ImageUpload, ProcessedImage, UserUsage

@admin.register(ImageUpload)
class ImageUploadAdmin(admin.ModelAdmin):
    list_display = ('id', 'original_filename', 'user', 'file_size', 'uploaded_at')
    list_filter = ('uploaded_at', 'user')
    search_fields = ('original_filename', 'id')
    readonly_fields = ('id', 'uploaded_at')

@admin.register(ProcessedImage)
class ProcessedImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'original_upload', 'effect_applied', 'user', 'status', 'created_at')
    list_filter = ('status', 'effect_applied', 'created_at', 'user')
    search_fields = ('id', 'original_upload__original_filename')
    readonly_fields = ('id', 'created_at')

@admin.register(UserUsage)
class UserUsageAdmin(admin.ModelAdmin):
    list_display = ('user', 'month', 'effects_used', 'premium_effects_used')
    list_filter = ('month', 'user')
    search_fields = ('user__username', 'user__email')