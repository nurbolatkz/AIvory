from django.test import TestCase, override_settings
from unittest.mock import patch, MagicMock
from .services import GeminiImageProcessor

class GeminiImageProcessorTest(TestCase):
    def setUp(self):
        # Create a mock settings object for testing
        self.mock_settings = MagicMock()
        self.mock_settings.GEMINI_API_KEY = 'test-api-key'
        
    @patch('apps.images.services.genai.configure')
    @patch('apps.images.services.genai.GenerativeModel')
    def test_init_with_api_key(self, mock_model, mock_configure):
        """Test that the processor initializes correctly with API key"""
        with override_settings(GEMINI_API_KEY='test-api-key'):
            processor = GeminiImageProcessor()
            
            # Check that genai.configure was called
            mock_configure.assert_called_once_with(api_key='test-api-key')
            
            # Check that GenerativeModel was created with correct model name
            mock_model.assert_called_once_with('gemini-2.0-flash-exp')
    
    @patch('apps.images.services.genai.GenerativeModel')
    def test_init_without_api_key(self, mock_model):
        """Test that the processor handles missing API key gracefully"""
        with override_settings(GEMINI_API_KEY=None):
            processor = GeminiImageProcessor()
            
            # Check that GenerativeModel was not called
            mock_model.assert_not_called()
            self.assertIsNone(processor.model)
    
    @patch('apps.images.services.Image')
    def test_process_image_without_api_key(self, mock_pil_image):
        """Test image processing without API key returns mock response"""
        with override_settings(GEMINI_API_KEY=None):
            processor = GeminiImageProcessor()
            
            # Mock the image
            mock_image = MagicMock()
            mock_pil_image.open.return_value = mock_image
            mock_image.size = (800, 600)
            
            # Call the method
            result = processor.process_image(
                image_file=MagicMock(),
                effect_prompt="Turn into a painting",
                strength=0.8,
                preserve_faces=True
            )
            
            # Assertions
            self.assertTrue(result['success'])
            self.assertEqual(result['processing_time'], 0.1)
            self.assertIn('Mock response', result['gemini_response'])
            self.assertIn('Turn into a painting', result['enhanced_prompt'])
    
    @patch('apps.images.services.Image')
    @patch('apps.images.services.genai.GenerativeModel')
    def test_process_image_success(self, mock_model, mock_pil_image):
        """Test successful image processing with API key"""
        with override_settings(GEMINI_API_KEY='test-api-key'):
            # Mock the image
            mock_image = MagicMock()
            mock_pil_image.open.return_value = mock_image
            mock_image.size = (800, 600)  # Less than max_size
            
            # Mock the model response
            mock_response = MagicMock()
            mock_response.text = "Detailed editing instructions"
            mock_instance = MagicMock()
            mock_instance.generate_content.return_value = mock_response
            mock_model.return_value = mock_instance
            
            # Create processor
            processor = GeminiImageProcessor()
            
            # Call the method
            result = processor.process_image(
                image_file=MagicMock(),
                effect_prompt="Turn into a painting",
                strength=0.8,
                preserve_faces=True
            )
            
            # Assertions
            self.assertTrue(result['success'])
            self.assertIn('processing_time', result)
            self.assertIn('gemini_response', result)
            self.assertIn('enhanced_prompt', result)
            self.assertEqual(result['gemini_response'], "Detailed editing instructions")
    
    @patch('apps.images.services.Image')
    @patch('apps.images.services.genai.GenerativeModel')
    def test_process_image_with_resize(self, mock_model, mock_pil_image):
        """Test that large images are resized"""
        with override_settings(GEMINI_API_KEY='test-api-key'):
            # Mock the image
            mock_image = MagicMock()
            mock_pil_image.open.return_value = mock_image
            mock_image.size = (2000, 1500)  # Larger than max_size (1024, 1024)
            
            # Mock the thumbnail method
            mock_image.thumbnail = MagicMock()
            
            # Mock the model response
            mock_response = MagicMock()
            mock_response.text = "Detailed editing instructions"
            mock_instance = MagicMock()
            mock_instance.generate_content.return_value = mock_response
            mock_model.return_value = mock_instance
            
            # Create processor
            processor = GeminiImageProcessor()
            
            # Call the method
            result = processor.process_image(
                image_file=MagicMock(),
                effect_prompt="Turn into a painting",
                strength=0.8,
                preserve_faces=True
            )
            
            # Assertions
            mock_image.thumbnail.assert_called_once()
            self.assertTrue(result['success'])
    
    @patch('apps.images.services.Image')
    @patch('apps.images.services.genai.GenerativeModel')
    def test_process_image_exception(self, mock_model, mock_pil_image):
        """Test handling of exceptions during processing"""
        with override_settings(GEMINI_API_KEY='test-api-key'):
            # Mock the image to raise an exception
            mock_pil_image.open.side_effect = Exception("Image processing error")
            
            # Create processor
            processor = GeminiImageProcessor()
            
            # Call the method
            result = processor.process_image(
                image_file=MagicMock(),
                effect_prompt="Turn into a painting",
                strength=0.8,
                preserve_faces=True
            )
            
            # Assertions
            self.assertFalse(result['success'])
            self.assertIn('error', result)
            self.assertIn('processing_time', result)