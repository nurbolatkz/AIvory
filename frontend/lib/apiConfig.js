// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    // Effects API
    EFFECT_CATEGORIES: `${API_BASE_URL}/effects/categories/`,
    EFFECTS: `${API_BASE_URL}/effects/effects/`,
    
    // Images API
    UPLOAD_IMAGE: `${API_BASE_URL}/images/images/`,
    APPLY_EFFECT: (imageId) => `${API_BASE_URL}/images/images/${imageId}/apply_effect/`,
    PROCESSED_STATUS: (processedId) => `${API_BASE_URL}/images/processed_images/${processedId}/`,
  },
  TIMEOUT: 10000, // 10 seconds for regular requests
  PROCESSING_TIMEOUT: 120000, // 120 seconds for image processing requests
};

export default API_CONFIG;