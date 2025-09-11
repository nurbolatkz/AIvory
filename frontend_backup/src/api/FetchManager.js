// FetchManager.js
import { API_CONFIG } from '../config/apiConfig';

class FetchManager {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.processingTimeout = API_CONFIG.PROCESSING_TIMEOUT;
  }

  // Generic fetch method with error handling
  async fetch(url, options = {}, isProcessingRequest = false) {
    try {
      const timeoutDuration = isProcessingRequest ? this.processingTimeout : this.timeout;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

      // Log the request for debugging
      console.log('Fetching:', url, options);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Try to parse error response, but handle case where there's no JSON
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          // If JSON parsing fails, use text response or default message
          try {
            const text = await response.text();
            errorData = { error: text || `HTTP error! status: ${response.status}` };
          } catch (textError) {
            errorData = { error: `HTTP error! status: ${response.status}` };
          }
        }
        
        console.error('API Error Response:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Handle case where there's no response body
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        // For non-JSON responses, return the text directly
        return await response.text();
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  // GET request
  async get(endpoint, isProcessingRequest = false) {
    return this.fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }, isProcessingRequest);
  }

  // POST request
  async post(endpoint, data, isFormData = false, isProcessingRequest = false) {
    const options = {
      method: 'POST',
      headers: isFormData ? {} : {
        'Content-Type': 'application/json',
      },
    };

    if (isFormData) {
      // For FormData, let the browser set the Content-Type with boundary
      options.body = data;
      console.log('Sending FormData request to:', endpoint);
    } else {
      options.body = JSON.stringify(data);
      console.log('Sending JSON request to:', endpoint, data);
    }

    return this.fetch(endpoint, options, isProcessingRequest);
  }

  // GET effect categories
  async getEffectCategories() {
    return this.get(API_CONFIG.ENDPOINTS.EFFECT_CATEGORIES);
  }

  // GET effects with optional category filter
  async getEffects(category = null) {
    let url = API_CONFIG.ENDPOINTS.EFFECTS;
    if (category) {
      url += `?category=${category}`;
    }
    return this.get(url);
  }

  // POST upload image
  async uploadImage(imageFile) {
    // Log what we're receiving for debugging
    console.log('uploadImage in FetchManager called with:', imageFile);
    console.log('Type of imageFile:', typeof imageFile);
    if (imageFile && typeof imageFile === 'object') {
      console.log('imageFile constructor name:', imageFile.constructor.name);
      console.log('imageFile keys:', Object.keys(imageFile));
    }
    
    // Handle the case where a string is passed (e.g., 'camera')
    if (typeof imageFile === 'string') {
      throw new Error('Camera capture not implemented. Please upload an image file.');
    }
    
    // Validate input
    if (!imageFile) {
      throw new Error('No image file provided');
    }

    let formData;
    
    // Handle case where a FormData object is passed directly
    if (imageFile instanceof FormData) {
      formData = imageFile;
      console.log('Using provided FormData object');
    } else {
      // Create FormData for File/Blob objects
      formData = new FormData();
      
      // Handle both File objects and other data types
      if (imageFile instanceof File) {
        formData.append('image', imageFile);
        console.log('Appending File object with name:', imageFile.name);
      } else if (imageFile instanceof Blob) {
        formData.append('image', imageFile, 'image.jpg');
        console.log('Appending Blob object');
      } else {
        throw new Error('Invalid image file type. Expected File, Blob, or FormData object.');
      }
    }

    // Log FormData contents for debugging
    console.log('FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
      if (value instanceof File || value instanceof Blob) {
        console.log(`  File details: name=${value.name}, size=${value.size}, type=${value.type}`);
      }
    }

    return this.post(API_CONFIG.ENDPOINTS.UPLOAD_IMAGE, formData, true);
  }

  // POST apply effect to image (async)
  async applyEffect(imageId, effectId) {
    const url = API_CONFIG.ENDPOINTS.APPLY_EFFECT(imageId);
    const formData = new FormData();
    formData.append('effect_id', effectId);
    
    console.log('Sending applyEffect request to:', url);
    console.log('Form data:', {
      effect_id: effectId
    });
    
    // Get the response object
    const response = await this.post(url, formData, true, true);
    
    console.log('Raw applyEffect response:', response);
    
    // If response is a string, try to parse it as JSON
    if (typeof response === 'string') {
      try {
        const parsed = JSON.parse(response);
        console.log('Parsed applyEffect string response:', parsed);
        return parsed;
      } catch (e) {
        // If parsing fails, return a generic success response
        console.warn('Failed to parse applyEffect response:', e);
        return {
          id: imageId,
          status: 'processing',
          message: 'Processing started successfully'
        };
      }
    }
    
    console.log('Returning applyEffect response:', response);
    return response;
  }
  
  // GET processed image status
  async getProcessedStatus(processedId) {
    const url = API_CONFIG.ENDPOINTS.PROCESSED_STATUS(processedId);
    console.log('Polling status for:', processedId);
    console.log('Status URL:', url);
    
    try {
      const response = await this.get(url, true);
      console.log('Raw status response:', response);
      
      if (typeof response === 'string') {
        try {
          const parsed = JSON.parse(response);
          console.log('Parsed status response:', parsed);
          return parsed;
        } catch (e) {
          console.warn('Failed to parse status response:', e);
          return {
            id: processedId,
            status: 'failed',
            error_message: 'Invalid response format from server'
          };
        }
      }
      
      console.log('Returning status response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching processed status:', error);
      throw error;
    }
  }

}

// Export singleton instance
const fetchManager = new FetchManager();
export default fetchManager;