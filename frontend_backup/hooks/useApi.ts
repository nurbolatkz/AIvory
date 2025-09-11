'use client';

import { useState, useEffect } from 'react';
import { fetchManager } from '@/src/api';

export interface Effect {
  id: string;
  name: string;
  slug: string;
  category_name: string;
  user_description: string;
  thumbnail: string;
  is_premium: boolean;
  difficulty?: string;
  users?: string;
  likes?: string;
  badge?: string;
  description?: string;
  tags?: string[];
  creator?: string;
  featured?: boolean;
  preview?: string; // Add preview property
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  count?: number;
  icon?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const useApi = () => {
  const [effects, setEffects] = useState<Effect[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch effect categories
        const categoriesResponse = await fetchManager.getEffectCategories();
        // Extract results array from paginated response
        const categoriesData = categoriesResponse.results || (Array.isArray(categoriesResponse) ? categoriesResponse : []);
        const categoriesWithDefaults = categoriesData.map((category: any) => ({
          ...category,
          count: 0, // Will be updated when we fetch effects
          icon: getCategoryIcon(category.name)
        }));
        setCategories(categoriesWithDefaults);

        // Fetch all effects
        const effectsResponse = await fetchManager.getEffects();
        // Extract results array from paginated response
        const effectsData = effectsResponse.results || (Array.isArray(effectsResponse) ? effectsResponse : []);
        const effectsWithDefaults = effectsData.map((effect: any) => ({
          ...effect,
          id: effect.id,
          name: effect.name,
          preview: effect.thumbnail, // Map thumbnail to preview for consistency
          users: '0k', // Default value, would be better to get from API
          likes: '0k', // Default value, would be better to get from API
          difficulty: getDifficultyFromCategory(effect.category_name),
          badge: getBadgeFromEffect(effect),
          description: effect.user_description,
          tags: [], // Would be better to get from API
          creator: 'Unknown', // Would be better to get from API
          featured: false // Would be better to get from API
        }));
        setEffects(effectsWithDefaults);
      } catch (err: any) {
        setError(err.message || 'Error fetching data');
        console.error('Error fetching API data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCategoryIcon = (categoryName: string): string => {
    const iconMap: Record<string, string> = {
      'Beginner': '🌟',
      'Intermediate': '⚡',
      'Expert': '👑',
      'Viral': '🔥',
      'Premium': '💎',
      'New': '✨',
      'Trending': '🔥',
      'Hot': '⚡'
    };
    return iconMap[categoryName] || '🎨';
  };

  const getDifficultyFromCategory = (categoryName: string): string => {
    const difficultyMap: Record<string, string> = {
      'beginner': 'Beginner',
      'intermediate': 'Intermediate',
      'expert': 'Expert'
    };
    return difficultyMap[categoryName.toLowerCase()] || 'Beginner';
  };

  const getBadgeFromEffect = (effect: any): string => {
    if (effect.is_premium) return '💎 Premium';
    if (effect.category_name.toLowerCase().includes('trending')) return '🔥 Trending';
    if (effect.category_name.toLowerCase().includes('viral')) return '🌈 Viral';
    if (effect.category_name.toLowerCase().includes('new')) return '✨ New';
    if (effect.category_name.toLowerCase().includes('hot')) return '⚡ Hot';
    return '🎨 Effect';
  };

  return { effects, categories, loading, error };
};