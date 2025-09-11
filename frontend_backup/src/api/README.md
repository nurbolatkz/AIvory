# API Integration Documentation

This document explains how to use the API integration in the TrendRider application.

## File Structure

```
src/
├── api/
│   ├── FetchManager.js     # Main API client
│   ├── apiConfig.js        # API configuration
│   ├── index.js            # API exports
│   └── testApi.js          # API testing utilities
├── config/
│   └── apiConfig.js        # API configuration (alternative location)
├── hooks/
│   ├── useEffects.js       # Hook for fetching effects data
│   └── useImageProcessor.js # Hook for image processing
└── components/
    └── ...                 # Components using the API
```

## Configuration

The API configuration is located in `src/config/apiConfig.js`:

```javascript
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
  },
  TIMEOUT: 10000, // 10 seconds
};
```

## FetchManager

The `FetchManager` class provides a wrapper around the fetch API with error handling and convenience methods:

```javascript
import fetchManager from './api/FetchManager';

// Get effect categories
const categories = await fetchManager.getEffectCategories();

// Get effects (with optional category filter)
const effects = await fetchManager.getEffects('vintage');

// Upload an image
const imageData = await fetchManager.uploadImage(imageFile);

// Apply an effect to an image
const processedData = await fetchManager.applyEffect(imageId, effectId);
```

## Hooks

### useEffects

A custom hook for fetching effects data:

```javascript
import { useEffects } from '../hooks/useEffects';

const MyComponent = () => {
  const { effects, categories, loading, error } = useEffects();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {effects.map(effect => (
        <div key={effect.id}>{effect.name}</div>
      ))}
    </div>
  );
};
```

### useImageProcessor

A custom hook for handling image uploads and effect application:

```javascript
import { useImageProcessor } from '../hooks/useImageProcessor';

const MyComponent = () => {
  const { 
    uploadedImage, 
    processedImage, 
    processing, 
    error,
    uploadImage,
    applyEffect
  } = useImageProcessor();
  
  const handleUpload = async (file) => {
    try {
      const imageData = await uploadImage(file);
      console.log('Uploaded:', imageData);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };
  
  const handleApplyEffect = async (imageId, effectId) => {
    try {
      const processedData = await applyEffect(imageId, effectId);
      console.log('Processed:', processedData);
    } catch (err) {
      console.error('Processing failed:', err);
    }
  };
  
  return (
    <div>
      {processing && <div>Processing...</div>}
      {error && <div>Error: {error}</div>}
    </div>
  );
};
```

## Usage in Components

The main integration points are in the `TrendRider.js` component, which uses the hooks to fetch data and process images:

```javascript
import { useEffects } from './hooks/useEffects';
import { useImageProcessor } from './hooks/useImageProcessor';

const TrendRider = () => {
  const { effects, loading, error } = useEffects();
  const { 
    uploadedImage, 
    processing, 
    uploadImage,
    applyEffect
  } = useImageProcessor();
  
  // ... rest of component
};
```

## Error Handling

All API methods will throw errors that should be caught and handled appropriately:

```javascript
try {
  const data = await fetchManager.getEffects();
} catch (error) {
  // Handle network errors, timeouts, HTTP errors, etc.
  console.error('API Error:', error.message);
}
```

## Testing

Unit tests for the API integration are located in `src/api/FetchManager.test.js` and can be run with:

```bash
npm test
```