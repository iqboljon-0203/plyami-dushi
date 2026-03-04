import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import candles from '../data/candles';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');
  const [categories, setCategories] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [polls, setPolls] = useState([]);
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch everything in parallel
      const [catRes, pollsRes, aboutRes] = await Promise.all([
        supabase.from('categories').select('*').order('id'),
        supabase.from('polls').select('*').order('id', { ascending: false }),
        supabase.from('about_content').select('*').maybeSingle()
      ]);

      if (catRes.error) console.error('Error fetching categories:', catRes.error);
      if (pollsRes.error) console.error('Error fetching polls:', pollsRes.error);
      if (aboutRes.error) console.error('Error fetching about:', aboutRes.error);

      setDbCategories(catRes.data || []);
      setPolls(pollsRes.data || []);
      setAbout(aboutRes.data);
      
    } catch (error) {
      console.error('Context initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Combine local and DB categories for the UI
  useEffect(() => {
    if (dbCategories.length === 0) {
      // Fallback to local data if DB is empty
      setCategories(candles.map(c => ({
        ...c,
        image_url: c.image,
        dbData: null
      })));
    } else {
      // DB is the source of truth
      setCategories(dbCategories.map(dbCat => ({
        id: dbCat.id,
        color: dbCat.color,
        image_url: dbCat.image_url,
        dbData: dbCat
      })));
    }
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
    polls,
    about,
    loading,
    refreshData: fetchData
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
