// src/api/FetchManager.test.js
import fetchManager from './FetchManager';

// Mock the global fetch function
global.fetch = jest.fn();

describe('FetchManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch effect categories', async () => {
    // Mock response
    const mockCategories = [
      { id: 1, name: 'Vintage', slug: 'vintage', description: 'Vintage photo effects' }
    ];
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockCategories)
    });

    const categories = await fetchManager.getEffectCategories();
    
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/effects/categories/',
      expect.objectContaining({
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
    );
    
    expect(categories).toEqual(mockCategories);
  });

  it('should fetch effects', async () => {
    // Mock response
    const mockEffects = [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Vintage Photo',
        slug: 'vintage-photo',
        category_name: 'Vintage',
        user_description: 'Apply a vintage look to your photos',
        thumbnail: 'http://localhost:8000/media/effect_thumbnails/vintage.jpg',
        is_premium: false
      }
    ];
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockEffects)
    });

    const effects = await fetchManager.getEffects();
    
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/effects/effects/',
      expect.objectContaining({
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
    );
    
    expect(effects).toEqual(mockEffects);
  });

  it('should handle fetch errors', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Internal server error' })
    });

    await expect(fetchManager.getEffectCategories()).rejects.toThrow('Internal server error');
  });
});