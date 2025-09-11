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
            
            # Process the image asynchronously
            from threading import Thread
            import time
            
            def process_image_task(processed_id, upload_file, effect_obj, user=None):
                try:
                    # Choose processing method based on effect type
                    processor = GeminiImageProcessor()
                    
                    if effect_obj.slug == 'center-stage':
                        # Use specialized processing for Center Stage effect
                        result = processor.process_center_stage_effect(
                            upload_file.file,
                            effect_obj.hidden_prompt
                        )
                    else:
                        # Use standard processing with the effect's hidden prompt
                        result = processor.process_image(
                            upload_file.file,
                            effect_obj.hidden_prompt,
                            effect_obj.strength,
                            effect_obj.preserve_faces
                        )
                    
                    # Update the processed image record
                    processed_record = ProcessedImage.objects.get(id=processed_id)
                    if result['success']:
                        processed_record.status = 'completed'
                        processed_record.processing_time = result['processing_time']
                        processed_record.gemini_response_data = {
                            'response': result['gemini_response'],
                            'prompt_used': result['enhanced_prompt'],
                            'effect_type': result.get('effect_type', 'standard')
                        }
                        
                        # Save the processed image if available
                        if 'edited_image_data' in result and result['edited_image_data']:
                            image_data = result['edited_image_data']
                            filename = f"processed_{processed_id}.png"
                            processed_record.processed_image.save(
                                filename,
                                ContentFile(image_data),
                                save=True
                            )
                        
                        # Update user usage
                        if user and user.is_authenticated:
                            self._update_user_usage(user, effect_obj)
                    else:
                        processed_record.status = 'failed'
                        processed_record.error_message = result['error']
                    
                    processed_record.save()
                except Exception as e:
                    # Update the processed image record with error
                    try:
                        processed_record = ProcessedImage.objects.get(id=processed_id)
                        processed_record.status = 'failed'
                        processed_record.error_message = str(e)
                        processed_record.save()
                    except ProcessedImage.DoesNotExist:
                        pass  # Record was deleted
            
            # Start processing in background thread
            thread = Thread(target=process_image_task, args=(processed.id, upload.original_image, effect, request.user))
            thread.start()
            
            # Return immediately with processing status
            serializer = ProcessedImageSerializer(processed)
            return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
                
        except Exception as e:
            return Response({
                'error': f'Processing failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def processing_status(self, request, pk=None):
        """
        Get the processing status of an image
        """
        try:
            # Get the processed image record
            processed_image = ProcessedImage.objects.get(id=pk)
            serializer = ProcessedImageSerializer(processed_image)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ProcessedImage.DoesNotExist:
            return Response({
                'error': 'Processed image not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': f'Error retrieving status: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def process_async(self, request, pk=None):
        """
        Process image with effect asynchronously
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
            
            # Process the image asynchronously (in a real implementation, this would be done in a background task)
            # For now, we'll simulate async processing with a delay
            from threading import Thread
            import time
            
            def process_image_task(processed_id, upload_file, effect_obj):
                try:
                    # Simulate processing time
                    time.sleep(5)  # Simulate 5 seconds of processing time
                    
                    # Choose processing method based on effect type
                    processor = GeminiImageProcessor()
                    
                    if effect_obj.slug == 'center-stage':
                        # Use specialized processing for Center Stage effect
                        # Reset file pointer before processing
                        upload_file.file.seek(0)
                        result = processor.process_center_stage_effect(
                            upload_file.file,
                            effect_obj.hidden_prompt
                        )
                    else:
                        # Use standard processing
                        # Reset file pointer before processing
                        upload_file.file.seek(0)
                        result = processor.process_image(
                            upload_file.file,
                            effect_obj.hidden_prompt,
                            effect_obj.strength,
                            effect_obj.preserve_faces
                        )
                    
                    # Update the processed image record
                    processed_record = ProcessedImage.objects.get(id=processed_id)
                    if result['success']:
                        processed_record.status = 'completed'
                        processed_record.processing_time = result['processing_time']
                        processed_record.gemini_response_data = {
                            'response': result['gemini_response'],
                            'prompt_used': result['enhanced_prompt'],
                            'effect_type': result.get('effect_type', 'standard'),
                            'image_analysis': result.get('image_analysis', '')
                        }
                        
                        # Save the processed image if available
                        if 'edited_image_data' in result and result['edited_image_data']:
                            image_data = result['edited_image_data']
                            filename = f"processed_{processed_id}.png"
                            processed_record.processed_image.save(
                                filename,
                                ContentFile(image_data),
                                save=False
                            )
                        
                        processed_record.save()
                        
                        # Update user usage
                        if request.user.is_authenticated:
                            self._update_user_usage(request.user, effect_obj)
                    else:
                        processed_record.status = 'failed'
                        processed_record.error_message = result['error']
                        processed_record.save()
                except Exception as e:
                    # Update the processed image record with error
                    try:
                        processed_record = ProcessedImage.objects.get(id=processed_id)
                        processed_record.status = 'failed'
                        processed_record.error_message = str(e)
                        processed_record.save()
                    except ProcessedImage.DoesNotExist:
                        pass  # Record was deleted
            
            # Start processing in background thread
            thread = Thread(target=process_image_task, args=(processed.id, upload.original_image, effect))
            thread.start()
            
            # Return immediately with processing status
            serializer = ProcessedImageSerializer(processed)
            return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
                
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