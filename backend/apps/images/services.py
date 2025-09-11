import google.generativeai as genai
from PIL import Image
import io
import base64
from django.conf import settings
from django.core.files.base import ContentFile
import time
from .gemini_client import ImageGenerationClient

class GeminiImageProcessor:
    def __init__(self):
        self.api_key = getattr(settings, 'GEMINI_API_KEY', None)
        if self.api_key:
            genai.configure(api_key=self.api_key)
        self.gemini_client = ImageGenerationClient()
    
    def process_image(self, image_file, effect_prompt, strength=0.7, preserve_faces=True):
        """
        Process image with Gemini Vision API
        """
        # If no API key is configured, return a mock response
        if not self.api_key:
            return {
                'success': True,
                'processing_time': 0.1,
                'gemini_response': 'Mock response: This is a simulated image processing result',
                'enhanced_prompt': self._build_full_prompt(effect_prompt, strength, preserve_faces)
            }
        
        try:
            start_time = time.time()
            
            # Read image bytes
            image_file.seek(0)
            image_bytes = image_file.read()
            
            # Build enhanced prompt
            full_prompt = self._build_full_prompt(effect_prompt, strength, preserve_faces)
            
            # Generate the actual edited image using Gemini API
            edited_image_data = self.gemini_client.edit_image_with_text(image_bytes, full_prompt)
            
            if edited_image_data is None:
                return {
                    'success': False,
                    'error': 'No image data returned from Gemini API',
                    'processing_time': time.time() - start_time
                }
            
            return {
                'success': True,
                'processing_time': time.time() - start_time,
                'gemini_response': f"Applied effect: {effect_prompt}",
                'enhanced_prompt': full_prompt,
                'edited_image_data': edited_image_data
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'processing_time': time.time() - start_time
            }
    
    def process_center_stage_effect(self, image_file, base_prompt):
        """
        Specialized processing for Center Stage effect
        """
        try:
            start_time = time.time()
            
            # Read image bytes
            image_file.seek(0)
            image_bytes = image_file.read()
            
            # For Center Stage effect, we'll use a predefined prompt
            enhanced_prompt = f"""
            Transform this image with the following effect:
            {base_prompt}
            
            Requirements:
            - Focus on the main subject
            - Create a dramatic background
            - Keep the subject well-lit and clear
            - Maintain natural colors
            - Ensure high quality output
            """
            
            # Generate the actual edited image using Gemini API
            edited_image_data = self.gemini_client.edit_image_with_text(image_bytes, enhanced_prompt)
            
            if edited_image_data is None:
                return {
                    'success': False,
                    'error': 'No image data returned from Gemini API',
                    'processing_time': time.time() - start_time
                }
            
            return {
                'success': True,
                'processing_time': time.time() - start_time,
                'gemini_response': f"Applied center stage effect: {base_prompt}",
                'enhanced_prompt': enhanced_prompt,
                'effect_type': 'center_stage',
                'edited_image_data': edited_image_data
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
        base_instructions = """You are an expert photo editor. Apply the following effect to this image:"""
        
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
        """