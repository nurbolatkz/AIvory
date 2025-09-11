from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ProcessedImage
from .serializers import ProcessedImageSerializer

class ProcessedImageViewSet(viewsets.ModelViewSet):
    queryset = ProcessedImage.objects.all()
    serializer_class = ProcessedImageSerializer
    lookup_field = 'id'  # Explicitly set the lookup field
    
    @action(detail=True, methods=['get'])
    def processing_status(self, request, pk=None):
        """
        Get the processing status of an image
        """
        try:
            # Get the processed image record
            processed_image = self.get_object()
            serializer = self.get_serializer(processed_image)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ProcessedImage.DoesNotExist:
            return Response({
                'error': 'Processed image not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': f'Error retrieving status: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)