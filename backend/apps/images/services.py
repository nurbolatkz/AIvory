import google.generativeai as genai
from PIL import Image
import io
import base64
from django.conf import settings
from django.core.files.base import ContentFile
import time

class GeminiImageProcessor:
    def __init__(self):
        api_key = getattr(settings, 'GEMINI_API_KEY', None)
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        else:
            self.model = None
    
    def process_image(self, image_file, effect_prompt, strength=0.7, preserve_faces=True):
        """
        Process image with Gemini Vision API
        """
        # If no API key is configured, return a mock response
        if not self.model:
            return {
                'success': True,
                'processing_time': 0.1,
                'gemini_response': 'Mock response: This is a simulated image processing result',
                'enhanced_prompt': self._build_full_prompt(effect_prompt, strength, preserve_faces)
            }
        
        try:
            start_time = time.time()
            
            # Prepare image for Gemini
            image = Image.open(image_file)
            
            # Optimize image size for API
            max_size = (1024, 1024)
            if image.size[0] > max_size[0] or image.size[1] > max_size[1]:
                image.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Build enhanced prompt
            full_prompt = self._build_full_prompt(effect_prompt, strength, preserve_faces)
            
            # Call Gemini API
            response = self.model.generate_content([
                full_prompt,
                image
            ])
            
            processing_time = time.time() - start_time
            
            # Handle response (Note: Gemini doesn't directly edit images yet)
            # For now, we'll return the text description and use it with image generation
            # In practice, you might need to use other APIs like Stability AI or Midjourney
            
            return {
                'success': True,
                'processing_time': processing_time,
                'gemini_response': response.text,
                'enhanced_prompt': full_prompt
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'processing_time': time.time() - start_time
            }
    
    def _build_full_prompt(self, effect_prompt, strength, preserve_faces):
        """
        Build comprehensive prompt for image editing
        """
        base_instructions = """You are an expert photo editor. Analyze this image and provide detailed instructions for applying the following effect:"""
        
        strength_instruction = f"Apply the effect with {int(strength * 100)}% intensity."
        
        face_instruction = "Preserve natural facial features and skin texture." if preserve_faces else ""
        
        quality_instruction = """Maintain high image quality, sharp details, and proper exposure. Ensure the result looks professional and natural."""
        
        return f"""
        {base_instructions}
        
        EFFECT TO APPLY:
        {effect_prompt}
        
        TECHNICAL REQUIREMENTS:
        - {strength_instruction}
        - {face_instruction}
        - {quality_instruction}
        
        Provide step-by-step editing instructions that would achieve this effect.
        """