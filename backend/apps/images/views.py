from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from PIL import Image
import uuid
from .models import ImageUpload, ProcessedImage
from .serializers import ImageUploadSerializer, ProcessedImageSerializer
from .services import GeminiImageProcessor
from apps.effects.models import Effect

class ImageUploadViewSet(viewsets.ModelViewSet):
    queryset = ImageUpload.objects.all()
    serializer_class = ImageUploadSerializer
    parser_classes = (MultiPartParser, FormParser)
    
    def create(self, request):
        """
        Upload image endpoint
        """
        try:
            uploaded_file = request.FILES['image']
            
            # Validate file
            if not self._is_valid_image(uploaded_file):
                return Response({
                    'error': 'Invalid image file. Please upload JPEG, PNG, or WebP.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get image dimensions
            # We need to reset the file pointer after validation
            uploaded_file.seek(0)
            image = Image.open(uploaded_file)
            width, height = image.size
            
            # Reset the file pointer again before saving
            uploaded_file.seek(0)
            
            # Create upload record
            upload = ImageUpload.objects.create(
                user=request.user if request.user.is_authenticated else None,
                original_image=uploaded_file,
                original_filename=uploaded_file.name,
                file_size=uploaded_file.size,
                image_width=width,
                image_height=height
            )
            
            serializer = self.get_serializer(upload)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': f'Upload failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def apply_effect(self, request, pk=None):
        """
        Apply effect to uploaded image
        """
        try:
            upload = self.get_object()
            effect_id = request.data.get('effect_id')
            
            if not effect_id:
                return Response({
                    'error': 'effect_id is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get effect
            try:
                effect = Effect.objects.get(id=effect_id, is_active=True)
            except Effect.DoesNotExist:
                return Response({
                    'error': 'Effect not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Check user limits (if authenticated)
            if request.user.is_authenticated:
                if not self._check_user_limits(request.user, effect):
                    return Response({
                        'error': 'Usage limit exceeded. Please upgrade your plan.'
                    }, status=status.HTTP_403_FORBIDDEN)
            
            # Create processing record
            processed = ProcessedImage.objects.create(
                original_upload=upload,
                effect_applied=effect,
                user=request.user if request.user.is_authenticated else None,
                status='processing'
            )
            
            # Process image with Gemini
            processor = GeminiImageProcessor()
            # Reset file pointer before processing
            upload.original_image.file.seek(0)
            result = processor.process_image(
                upload.original_image.file,
                effect.hidden_prompt,
                effect.strength,
                effect.preserve_faces
            )
            
            if result['success']:
                # For now, we'll simulate image processing
                # In production, you'd integrate with actual image editing service
                processed.status = 'completed'
                processed.processing_time = result['processing_time']
                processed.gemini_response_data = {
                    'response': result['gemini_response'],
                    'prompt_used': result['enhanced_prompt']
                }
                processed.save()
                
                # Update user usage
                if request.user.is_authenticated:
                    self._update_user_usage(request.user, effect)
                
                serializer = ProcessedImageSerializer(processed)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                processed.status = 'failed'
                processed.error_message = result['error']
                processed.save()
                
                return Response({
                    'error': 'Image processing failed',
                    'details': result['error']
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            return Response({
                'error': f'Processing failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _is_valid_image(self, uploaded_file):
        """Validate uploaded file is a valid image"""
        try:
            image = Image.open(uploaded_file)
            return image.format.lower() in ['jpeg', 'jpg', 'png', 'webp']
        except:
            return False
    
    def _check_user_limits(self, user, effect):
        """Check if user can use this effect"""
        from datetime import datetime
        from apps.images.models import UserUsage
        
        current_month = datetime.now().replace(day=1).date()
        usage, created = UserUsage.objects.get_or_create(
            user=user, 
            month=current_month
        )
        
        # Free tier limits
        # Check if user has a profile with is_premium field
        is_premium = False
        if hasattr(user, 'userprofile'):
            is_premium = user.userprofile.is_premium
        
        if not is_premium:  # Free tier
            if usage.effects_used >= 5:  # Free limit
                return False
            if effect.is_premium:
                return False
        
        return True
    
    def _update_user_usage(self, user, effect):
        """Update user's monthly usage"""
        from datetime import datetime
        from apps.images.models import UserUsage
        
        current_month = datetime.now().replace(day=1).date()
        usage, created = UserUsage.objects.get_or_create(
            user=user, 
            month=current_month
        )
        
        usage.effects_used += 1
        if effect.is_premium:
            usage.premium_effects_used += 1
        usage.save()