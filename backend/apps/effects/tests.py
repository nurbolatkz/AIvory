from django.test import TestCase
from django.contrib.auth.models import User
from .models import EffectCategory, Effect
import uuid

class EffectModelTest(TestCase):
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
            hidden_prompt='A secret prompt for AI',
            strength=0.8,
            preserve_faces=True,
            is_active=True,
            is_premium=False
        )
    
    def test_effect_category_str(self):
        """Test the string representation of EffectCategory"""
        self.assertEqual(str(self.category), 'Test Category')
    
    def test_effect_str(self):
        """Test the string representation of Effect"""
        self.assertEqual(str(self.effect), 'Test Effect')
    
    def test_effect_uuid_primary_key(self):
        """Test that Effect uses UUID as primary key"""
        self.assertIsInstance(self.effect.id, uuid.UUID)
    
    def test_effect_defaults(self):
        """Test default values for Effect model"""
        effect = Effect.objects.create(
            name='Default Effect',
            slug='default-effect',
            category=self.category,
            user_description='An effect with default values',
            hidden_prompt='Default prompt'
        )
        
        self.assertEqual(effect.strength, 0.7)
        self.assertEqual(effect.preserve_faces, True)
        self.assertEqual(effect.max_resolution, "2048x2048")
        self.assertEqual(effect.output_format, "jpeg")
        self.assertEqual(effect.is_active, True)
        self.assertEqual(effect.is_premium, False)