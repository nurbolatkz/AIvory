from django.test import TestCase
from django.contrib.auth.models import User
from apps.effects.models import EffectCategory, Effect
from .models import ImageUpload, ProcessedImage, UserUsage
import uuid
from datetime import date

class ImageModelTest(TestCase):
    def setUp(self):
        # Create a user for foreign key relationships
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # Create an effect category
        self.category = EffectCategory.objects.create(
            name='Test Category',
            slug='test-category',
            description='A test category'
        )
        
        # Create an effect
        self.effect = Effect.objects.create(
            name='Test Effect',
            slug='test-effect',
            category=self.category,
            user_description='A test effect for users',
            hidden_prompt='A secret prompt for AI'
        )
        
        # Create an image upload
        self.image_upload = ImageUpload.objects.create(
            user=self.user,
            original_filename='test.jpg',
            file_size=1024,
            image_width=800,
            image_height=600
        )
        
        # Create a processed image
        self.processed_image = ProcessedImage.objects.create(
            original_upload=self.image_upload,
            effect_applied=self.effect,
            user=self.user,
            processing_time=2.5,
            status='completed'
        )
        
        # Create user usage record
        self.current_month = date.today().replace(day=1)
        self.user_usage = UserUsage.objects.create(
            user=self.user,
            month=self.current_month,
            effects_used=3,
            premium_effects_used=1
        )
    
    def test_image_upload_str(self):
        """Test the string representation of ImageUpload"""
        expected = f"Upload {self.image_upload.id} - test.jpg"
        self.assertEqual(str(self.image_upload), expected)
    
    def test_processed_image_str(self):
        """Test the string representation of ProcessedImage"""
        expected = f"Processed {self.processed_image.id} - Test Effect"
        self.assertEqual(str(self.processed_image), expected)
    
    def test_user_usage_unique_together(self):
        """Test that UserUsage has unique together constraint"""
        # Try to create another UserUsage with the same user and month
        with self.assertRaises(Exception):
            UserUsage.objects.create(
                user=self.user,
                month=self.current_month,
                effects_used=5,
                premium_effects_used=2
            )
    
    def test_processed_image_defaults(self):
        """Test default values for ProcessedImage model"""
        processed_image = ProcessedImage.objects.create(
            original_upload=self.image_upload,
            effect_applied=self.effect,
            user=self.user
        )
        
        self.assertEqual(processed_image.status, 'processing')
        self.assertEqual(processed_image.gemini_response_data, {})
        self.assertEqual(processed_image.processing_params, {})