// Example frontend integration with the Photo Effects API

class PhotoEffectsAPI {
  constructor(baseUrl = 'http://localhost:8000/api') {
    this.baseUrl = baseUrl;
  }

  // Get all effect categories
  async getEffectCategories() {
    try {
      const response = await fetch(`${this.baseUrl}/effects/categories/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching effect categories:', error);
      throw error;
    }
  }

  // Get all effects, optionally filtered by category
  async getEffects(category = null) {
    try {
      let url = `${this.baseUrl}/effects/effects/`;
      if (category) {
        url += `?category=${category}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching effects:', error);
      throw error;
    }
  }

  // Upload an image
  async uploadImage(imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(`${this.baseUrl}/images/images/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  // Apply an effect to an uploaded image
  async applyEffect(imageId, effectId) {
    try {
      const response = await fetch(`${this.baseUrl}/images/images/${imageId}/apply_effect/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ effect_id: effectId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error applying effect:', error);
      throw error;
    }
  }
}

// Example usage:
/*
const api = new PhotoEffectsAPI();

// Get effect categories
api.getEffectCategories()
  .then(categories => {
    console.log('Categories:', categories);
  })
  .catch(error => {
    console.error('Failed to get categories:', error);
  });

// Get all effects
api.getEffects()
  .then(effects => {
    console.log('Effects:', effects);
  })
  .catch(error => {
    console.error('Failed to get effects:', error);
  });

// Get effects from a specific category
api.getEffects('vintage')
  .then(effects => {
    console.log('Vintage effects:', effects);
  })
  .catch(error => {
    console.error('Failed to get vintage effects:', error);
  });

// Upload an image and apply an effect
const fileInput = document.getElementById('imageUpload');
fileInput.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (file) {
    try {
      // Upload the image
      const uploadResult = await api.uploadImage(file);
      console.log('Upload result:', uploadResult);
      
      // Get the first available effect
      const effects = await api.getEffects();
      if (effects.length > 0) {
        const effectId = effects[0].id;
        
        // Apply the effect
        const processResult = await api.applyEffect(uploadResult.id, effectId);
        console.log('Process result:', processResult);
        
        // Display the result
        const resultImage = document.getElementById('resultImage');
        resultImage.src = processResult.processed_image;
      }
    } catch (error) {
      console.error('Image processing failed:', error);
    }
  }
});
*/

export default PhotoEffectsAPI;