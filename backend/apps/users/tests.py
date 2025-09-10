from django.test import TestCase
from django.contrib.auth.models import User
from .models import UserProfile

class UserModelTest(TestCase):
    def setUp(self):
        # Create a user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # Create a user profile
        self.user_profile = UserProfile.objects.create(
            user=self.user,
            is_premium=True,
            subscription_tier='premium'
        )
    
    def test_user_profile_str(self):
        """Test the string representation of UserProfile"""
        expected = f"{self.user.username} - {self.user_profile.subscription_tier}"
        self.assertEqual(str(self.user_profile), expected)
    
    def test_user_profile_defaults(self):
        """Test default values for UserProfile model"""
        # Create a user without profile first
        user2 = User.objects.create_user(
            username='testuser2',
            email='test2@example.com',
            password='testpass123'
        )
        
        # Create a profile with defaults
        profile = UserProfile.objects.create(user=user2)
        
        self.assertEqual(profile.is_premium, False)
        self.assertEqual(profile.subscription_tier, 'free')
    
    def test_user_profile_one_to_one_relationship(self):
        """Test that UserProfile has a one-to-one relationship with User"""
        self.assertEqual(self.user_profile.user, self.user)
        self.assertEqual(UserProfile.objects.filter(user=self.user).count(), 1)