// src/hooks/useEffects.js
import { useState, useEffect } from 'react';
import { fetchManager } from '../api';

export const useEffects = () => {
  const [effects, setEffects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch effect categories
        const categoriesData = await fetchManager.getEffectCategories();
        setCategories(categoriesData);

        // Fetch all effects
        const effectsData = await fetchManager.getEffects();
        setEffects(effectsData);
      } catch (err) {
        setError(err.message || 'Error fetching data');
        console.error('Error fetching effects data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { effects, categories, loading, error };
};