import requests
import json
import base64
import os
from django.conf import settings

class ImageGenerationClient:
    """
    A client for various image generation and editing tasks using the Gemini API.
    """

    def __init__(self):
        """
        Initializes the client with the Gemini API key and sets up the base URL.
        """
        self.api_key = getattr(settings, 'GEMINI_API_KEY', None)
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/"
        self.headers = {
            "Content-Type": "application/json",
        }

    def _make_request(self, model_name: str, payload: dict, is_imagen_model=False):
        """
        A private helper method to send a request to the specified Gemini model.

        Args:
            model_name: The name of the model to use.
            payload: The dictionary containing the request body.
            is_imagen_model: A flag to use the specific endpoint for Imagen models.

        Returns:
            The JSON response from the API or None on error.
        """
        if not self.api_key:
            return None
            
        if is_imagen_model:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key={self.api_key}"
        else:
            url = f"{self.base_url}{model_name}:generateContent?key={self.api_key}"

        try:
            response = requests.post(url, headers=self.headers, data=json.dumps(payload))
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as err:
            print(f"HTTP Error: {err}")
            print(f"Response Content: {err.response.text}")
            return None
        except requests.exceptions.RequestException as err:
            print(f"Request Error: {err}")
            return None

    def generate_image_from_text(self, prompt: str):
        """
        Generates an image from a text prompt using the Imagen 3 model.

        Args:
            prompt: The text prompt for the image.

        Returns:
            Image data as bytes or None on error.
        """
        print("--- Generating Image from Text ---")
        payload = {
            "instances": {"prompt": prompt},
            "parameters": {"sampleCount": 1}
        }
        response = self._make_request("imagen-3.0-generate-002", payload, is_imagen_model=True)
        
        if response and response.get("predictions"):
            base64_data = response["predictions"][0]["bytesBase64Encoded"]
            image_data = base64.b64decode(base64_data)
            return image_data
        else:
            print("Image generation failed.")
            return None

    def edit_image_with_text(self, image_bytes: bytes, prompt: str, mime_type: str = "image/jpeg"):
        """
        Edits an existing image using a text-based instruction.

        This method uses the gemini-2.5-flash-image-preview model.
        The image is passed as base64-encoded inline data.

        Args:
            image_bytes: The image bytes to be edited.
            prompt: The text prompt for the edit.
            mime_type: The MIME type of the image.

        Returns:
            Edited image data as bytes or None on error.
        """
        print("--- Editing Image with Text ---")
        
        # Convert image bytes to base64
        base64_image = base64.b64encode(image_bytes).decode("utf-8")

        payload = {
            "contents": [
                {
                    "parts": [
                        {"inlineData": {"mimeType": mime_type, "data": base64_image}},
                        {"text": prompt}
                    ]
                }
            ],
            "generationConfig": {
                "responseModalities": ["IMAGE"]
            }
        }
        response = self._make_request("gemini-2.5-flash-image-preview", payload)
        
        if response and response.get("candidates"):
            # Get the first candidate's content
            candidate = response["candidates"][0]
            if "content" in candidate and "parts" in candidate["content"]:
                parts = candidate["content"]["parts"]
                # Look for the part with inlineData
                for part in parts:
                    if "inlineData" in part and "data" in part["inlineData"]:
                        base64_data = part["inlineData"]["data"]
                        image_data = base64.b64decode(base64_data)
                        return image_data
            
            print("Edited image generation failed. No image data in response.")
            return None
        else:
            print("Edited image generation failed.")
            return None

    def compose_image_from_multiple(self, image_paths: list, prompt: str):
        """
        Composes a new image by combining multiple input images and a text prompt.

        This method uses the gemini-2.5-flash-image-preview model and passes
        multiple images as inline data in the request.

        Args:
            image_paths: A list of file paths to the input images.
            prompt: The text prompt for the composition.

        Returns:
            Composed image data as bytes or None on error.
        """
        print("--- Composing Image from Multiple Inputs ---")
        parts = []
        for path in image_paths:
            if not os.path.exists(path):
                print(f"Error: Image file not found at {path}")
                return None
            with open(path, "rb") as f:
                image_bytes = f.read()
                base64_image = base64.b64encode(image_bytes).decode("utf-8")
                parts.append({"inlineData": {"mimeType": "image/jpeg", "data": base64_image}})
        
        parts.append({"text": prompt})
        
        payload = {
            "contents": [{"parts": parts}],
            "generationConfig": {
                "responseModalities": ["IMAGE"]
            }
        }
        response = self._make_request("gemini-2.5-flash-image-preview", payload)
        
        if response and response.get("candidates"):
            part = response["candidates"][0]["content"]["parts"][0]
            if part.get("inlineData"):
                base64_data = part["inlineData"]["data"]
                image_data = base64.b64decode(base64_data)
                return image_data
            else:
                print("Composed image generation failed. No image data in response.")
                return None
        else:
            print("Composed image generation failed.")
            return None

    def generate_image_with_text(self, prompt: str):
        """
        Generates an image with high-precision text rendering using Imagen 3.
        
        This is essentially a specialized text-to-image prompt.

        Args:
            prompt: The prompt, which should explicitly ask for text to be rendered.

        Returns:
            Image data as bytes or None on error.
        """
        print("--- Generating Image with High-Precision Text ---")
        # High-precision text rendering is a capability of Imagen 3.
        # It's achieved by providing a clear and specific prompt.
        payload = {
            "instances": {"prompt": prompt},
            "parameters": {"sampleCount": 1}
        }
        response = self._make_request("imagen-3.0-generate-002", payload, is_imagen_model=True)
        
        if response and response.get("predictions"):
            base64_data = response["predictions"][0]["bytesBase64Encoded"]
            image_data = base64.b64decode(base64_data)
            return image_data
        else:
            print("Image generation with text failed.")
            return None