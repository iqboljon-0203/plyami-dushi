import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import candles from '../data/candles';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');
  const [categories, setCategories] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories from Supabase
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*');
      
      if (error) throw error;
      setDbCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Combine local and DB categories
  useEffect(() => {
    // Start with local candles
    const localMap = new Map(candles.map(c => [c.id, c]));
    
    // Add or override with DB categories
    dbCategories.forEach(dbCat => {
      const existing = localMap.get(dbCat.id);
      if (existing) {
        // Update existing local candle with DB data
        localMap.set(dbCat.id, {
          ...existing,
          image: dbCat.image_url || existing.image,
          // We keep color from local constants for now
          // description/title will come from i18n but we can fallback to DB
          dbData: dbCat
        });
      } else {
        // It's a brand new category
        localMap.set(dbCat.id, {
          id: dbCat.id,
          color: '#8B0000', // Default mystic red for new ones
          image: dbCat.image_url,
          dbData: dbCat
        });
      }
    });

    setCategories(Array.from(localMap.values()));
  }, [dbCategories]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const value = {
    theme,
    toggleTheme,
    categories,
    loading,
    refreshCategories: fetchCategories
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
