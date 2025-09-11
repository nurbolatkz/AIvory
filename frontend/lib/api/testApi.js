// src/api/testApi.js
import { fetchManager } from './index';

// Test function to verify API integration
export const testApiIntegration = async () => {
  try {
    console.log('Testing API integration...');
    
    // Test 1: Get effect categories
    console.log('Fetching effect categories...');
    const categories = await fetchManager.getEffectCategories();
    console.log('Categories:', categories);
    
    // Test 2: Get effects
    console.log('Fetching effects...');
    const effects = await fetchManager.getEffects();
    console.log('Effects:', effects);
    
    console.log('API integration test completed successfully!');
    return { categories, effects };
  } catch (error) {
    console.error('API integration test failed:', error);
    throw error;
  }
};