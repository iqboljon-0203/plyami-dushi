import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import candles from '../data/candles';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { 
  LogOut, 
  Settings, 
  Layout, 
  MessageSquare, 
  Save, 
  RefreshCcw, 
  Edit3,
  Moon,
  Sun,
  Plus,
  Upload,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const { refreshCategories } = useAppContext();
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [poll, setPoll] = useState(null);
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('categories'); // 'categories', 'poll', or 'about'
  const [editingItem, setEditingItem] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newCat, setNewCat] = useState({ id: '', description_ru: '', description_en: '', image_url: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('id');
      
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .select('*')
        .single();

      const { data: aboutData, error: aboutError } = await supabase
        .from('about_content')
        .select('*')
        .single();

      if (catError) throw catError;
      if (pollError && pollError.code !== 'PGRST116') throw pollError;
      if (aboutError && aboutError.code !== 'PGRST116') throw aboutError;

      setCategories(catData);
      setPoll(pollData);
      setAbout(aboutData);
    } catch (error) {
      toast.error('Error fetching data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const uploadImage = async (file) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('categories')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('categories')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      toast.error('Image upload failed: ' + error.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const updateCategory = async (id, updates) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      toast.success('Category updated successfully');
      setEditingItem(null);
      fetchData();
    } catch (error) {
      toast.error('Update failed: ' + error.message);
    }
  };

  const addCategory = async () => {
    if (!newCat.id) return toast.error('Category ID is required');
    try {
      const { error } = await supabase
        .from('categories')
        .insert([newCat]);

      if (error) throw error;
      toast.success('Category added successfully');
      setIsAdding(false);
      setNewCat({ id: '', description_ru: '', description_en: '', image_url: '' });
      fetchData();
      refreshCategories();
    } catch (error) {
      toast.error('Failed to add: ' + error.message);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Category deleted');
      fetchData();
      refreshCategories();
    } catch (error) {
      toast.error('Delete failed: ' + error.message);
    }
  };

  const syncLocalCategories = async () => {
    setLoading(true);
    try {
      const formatted = candles.map(c => ({
        id: c.id,
        image_url: c.image,
        description_ru: t(`candles.${c.id}.description`, { lng: 'ru' }),
        description_en: t(`candles.${c.id}.description`, { lng: 'en' })
      }));

      const { error } = await supabase
        .from('categories')
        .upsert(formatted);

      if (error) throw error;
      toast.success('Synced all local categories to database!');
      fetchData();
      refreshCategories();
    } catch (error) {
      toast.error('Sync failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updatePoll = async (updates) => {
    try {
      const { error } = await supabase
        .from('polls')
        .update(updates)
        .eq('id', poll.id);

      if (error) throw error;
      toast.success('Poll updated successfully');
      fetchData();
    } catch (error) {
      toast.error('Poll update failed: ' + error.message);
    }
  };

  const updateAbout = async (updates) => {
    try {
      const { error } = await supabase
        .from('about_content')
        .update(updates)
        .eq('id', about.id);

      if (error) throw error;
      toast.success('About Me updated successfully');
      fetchData();
    } catch (error) {
      toast.error('Update failed: ' + error.message);
    }
  };

  const resetPoll = async () => {
    if (!window.confirm('Are you sure you want to reset all votes to zero?')) return;
    updatePoll({ yes_votes: 0, no_votes: 0 });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mystic-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-mystic-red border-t-transparent rounded-full animate-spin"></div>
          <p className="text-mystic-gray-muted text-xs tracking-widest uppercase animate-pulse">Consulting the Oracle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-mystic-white font-sans selection:bg-mystic-red/30">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-mystic-black border-r border-mystic-red/10 p-6 z-50">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-8 h-8 bg-mystic-red rounded flex items-center justify-center font-bold">I</div>
          <span className="font-heading text-xl tracking-wide">Irodiana</span>
        </div>

        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'categories' ? 'bg-mystic-red text-white' : 'text-mystic-gray-muted hover:bg-white/5'}`}
          >
            <Layout size={18} />
            <span className="text-sm font-medium">Categories</span>
          </button>
          <button
            onClick={() => setActiveTab('poll')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'poll' ? 'bg-mystic-red text-white' : 'text-mystic-gray-muted hover:bg-white/5'}`}
          >
            <MessageSquare size={18} />
            <span className="text-sm font-medium">Poll Settings</span>
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'about' ? 'bg-mystic-red text-white' : 'text-mystic-gray-muted hover:bg-white/5'}`}
          >
            <Settings size={18} />
            <span className="text-sm font-medium">About Me</span>
          </button>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-mystic-gray-muted hover:text-white hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/20"
          >
            <LogOut size={16} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
       <main className="pl-64 p-10 min-h-screen relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-mystic-red/5 blur-[150px] -z-10" />

        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-heading mb-2">
              {activeTab === 'categories' ? 'Product Catalog' : activeTab === 'poll' ? 'Mystic Inquiries' : 'Legacy of the Flame'}
            </h1>
            <p className="text-mystic-gray-muted text-sm">
              Dashboard / {activeTab === 'categories' ? 'Categories' : activeTab === 'poll' ? 'Poll' : 'About Me'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-2 bg-mystic-black rounded-full px-4 py-2 border border-mystic-red/15 text-[10px] tracking-widest uppercase font-bold text-mystic-red">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live Sanctum
            </div>
            {activeTab === 'categories' && (
              <button 
                onClick={() => setIsAdding(true)}
                className="px-6 py-2 bg-mystic-red text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-red-600 transition-all cursor-pointer shadow-lg shadow-mystic-red/20"
              >
                + New Category
              </button>
            )}
          </div>
        </header>

        {activeTab === 'categories' ? (
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              {isAdding && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-mystic-red/5 border border-mystic-red/30 rounded-xl p-6 mb-4 overflow-hidden"
                >
                  <h3 className="text-sm font-bold text-mystic-red uppercase tracking-widest mb-4">Create New Category</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-mystic-gray-muted font-bold">Category ID (e.g. red)</label>
                      <input
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-mystic-red/50 outline-none"
                        value={newCat.id}
                        onChange={(e) => setNewCat({...newCat, id: e.target.value.toLowerCase()})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-mystic-gray-muted font-bold">Category Image</label>
                      <div className="flex items-center gap-4">
                        <label className="flex-grow flex items-center justify-center gap-2 bg-black/40 border border-dashed border-white/20 rounded-lg p-3 text-xs text-mystic-gray-muted hover:border-mystic-red/50 cursor-pointer transition-all">
                          {uploading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                          {newCat.image_url ? 'Change Image' : 'Select from device'}
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const url = await uploadImage(file);
                                if (url) setNewCat({ ...newCat, image_url: url });
                              }
                            }}
                          />
                        </label>
                        {newCat.image_url && (
                          <div className="w-12 h-12 rounded border border-white/10 overflow-hidden">
                            <img src={newCat.image_url} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-mystic-gray-muted font-bold">RU Description</label>
                      <textarea
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-mystic-red/50 outline-none h-20"
                        value={newCat.description_ru}
                        onChange={(e) => setNewCat({...newCat, description_ru: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-mystic-gray-muted font-bold">EN Description</label>
                      <textarea
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-mystic-red/50 outline-none h-20"
                        value={newCat.description_en}
                        onChange={(e) => setNewCat({...newCat, description_en: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addCategory} className="px-6 py-2 bg-mystic-red text-white text-[10px] font-bold uppercase rounded cursor-pointer">Save New</button>
                    <button onClick={() => setIsAdding(false)} className="px-6 py-2 bg-white/5 text-mystic-gray-muted text-[10px] font-bold uppercase rounded cursor-pointer">Cancel</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {categories.length === 0 && !isAdding ? (
              <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl flex flex-col items-center gap-6">
                <div>
                  <p className="text-mystic-gray-muted italic mb-2">The catalog is currently empty.</p>
                  <p className="text-[10px] text-mystic-red font-bold uppercase tracking-widest opacity-50">Choose an action below</p>
                </div>
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsAdding(true)}
                    className="px-6 py-3 bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-white/10 transition-all cursor-pointer"
                  >
                    Create Custom
                  </button>
                  <button 
                    onClick={syncLocalCategories}
                    className="px-8 py-3 bg-mystic-red text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-red-600 transition-all cursor-pointer shadow-lg shadow-mystic-red/20 flex items-center gap-2"
                  >
                    <Plus size={14} /> Import {candles.length} Local Candles
                  </button>
                </div>
              </div>
            ) : (
              categories.map((cat) => (
                <motion.div
                  layout
                  key={cat.id}
                  className="bg-mystic-gray/20 backdrop-blur-sm border border-white/5 rounded-xl p-6 hover:border-mystic-red/20 transition-all group"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-white/10">
                      <img 
                        src={cat.image_url || 'https://via.placeholder.com/150'} 
                        alt={cat.id} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <h2 className="text-xl font-heading text-mystic-white uppercase tracking-wider">{cat.id}</h2>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-mystic-red/10 text-mystic-red font-bold uppercase">Active</span>
                        </div>
                        <button 
                          onClick={() => deleteCategory(cat.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-500/50 hover:text-red-500 transition-all cursor-pointer p-2"
                        >
                          <RefreshCcw size={14} className="rotate-45" />
                        </button>
                      </div>

                      {editingItem?.id === cat.id ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] uppercase text-mystic-gray-muted font-bold">RU Description</label>
                              <textarea
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-mystic-red/50 outline-none h-24"
                                value={editingItem.description_ru}
                                onChange={(e) => setEditingItem({...editingItem, description_ru: e.target.value})}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] uppercase text-mystic-gray-muted font-bold">EN Description</label>
                              <textarea
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-mystic-red/50 outline-none h-24"
                                value={editingItem.description_en}
                                onChange={(e) => setEditingItem({...editingItem, description_en: e.target.value})}
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase text-mystic-gray-muted font-bold">Update Image</label>
                            <label className="flex items-center justify-center gap-2 bg-black/40 border border-dashed border-white/20 rounded-lg p-3 text-xs text-mystic-gray-muted hover:border-mystic-red/50 cursor-pointer transition-all">
                              {uploading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                              Replace stored image
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    const url = await uploadImage(file);
                                    if (url) setEditingItem({ ...editingItem, image_url: url });
                                  }
                                }}
                              />
                            </label>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateCategory(cat.id, {
                                description_ru: editingItem.description_ru,
                                description_en: editingItem.description_en,
                                image_url: editingItem.image_url
                              })}
                              className="flex items-center gap-2 px-4 py-2 bg-mystic-red rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
                            >
                              <Save size={14} /> Save Changes
                            </button>
                            <button
                              onClick={() => setEditingItem(null)}
                              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <p className="text-[10px] uppercase text-mystic-red font-bold mb-1 opacity-60">Russian</p>
                              <p className="text-sm text-mystic-gray-muted leading-relaxed line-clamp-3 italic">"{cat.description_ru}"</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase text-mystic-red font-bold mb-1 opacity-60">English</p>
                              <p className="text-sm text-mystic-gray-muted leading-relaxed line-clamp-3 italic">"{cat.description_en}"</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setEditingItem(cat)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-mystic-red/20 hover:text-mystic-white rounded-lg text-[10px] font-bold uppercase tracking-widest text-mystic-gray-muted transition-all cursor-pointer"
                          >
                            <Edit3 size={12} /> Edit Content
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        ) : activeTab === 'poll' ? (
          <div className="max-w-2xl">
            {poll ? (
              <div className="bg-mystic-gray/20 backdrop-blur-sm border border-white/5 rounded-xl p-8 space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase text-mystic-red font-bold tracking-widest">Question (RU)</label>
                    <input
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-4 text-sm focus:border-mystic-red/50 outline-none"
                      value={poll.question_ru}
                      onChange={(e) => setPoll({...poll, question_ru: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase text-mystic-red font-bold tracking-widest">Question (EN)</label>
                    <input
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-4 text-sm focus:border-mystic-red/50 outline-none"
                      value={poll.question_en}
                      onChange={(e) => setPoll({...poll, question_en: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="bg-green-500/5 rounded-2xl p-6 border border-green-500/20 text-center">
                    <span className="text-4xl font-heading text-green-500 block mb-2">{poll.yes_votes}</span>
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-green-500/60 leading-none">Positive Energy (Yes)</span>
                  </div>
                  <div className="bg-red-500/5 rounded-2xl p-6 border border-red-500/20 text-center">
                    <span className="text-4xl font-heading text-red-500 block mb-2">{poll.no_votes}</span>
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-red-500/60 leading-none">Skeptics (No)</span>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => updatePoll({
                      question_ru: poll.question_ru,
                      question_en: poll.question_en
                    })}
                    className="flex-grow flex items-center justify-center gap-2 py-4 bg-mystic-red text-white font-bold uppercase text-xs tracking-[0.2em] rounded-xl shadow-lg shadow-mystic-red/20 cursor-pointer"
                  >
                    <Save size={16} /> Update Question
                  </button>
                  <button
                    onClick={resetPoll}
                    className="px-6 py-4 bg-white/5 hover:bg-red-500/10 hover:text-red-500 border border-white/10 hover:border-red-500/30 rounded-xl transition-all cursor-pointer"
                    title="Reset Votes"
                  >
                    <RefreshCcw size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center p-20 border border-dashed border-white/10 rounded-2xl">
                <p className="text-mystic-gray-muted italic">No active poll found in the sanctum.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl space-y-8">
            {about && (
              <div className="bg-mystic-gray/20 backdrop-blur-sm border border-white/5 rounded-xl p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase text-mystic-red font-bold tracking-widest">Main Title (RU)</label>
                    <input
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-mystic-red/50 outline-none"
                      value={about.title_ru}
                      onChange={(e) => setAbout({...about, title_ru: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase text-mystic-red font-bold tracking-widest">Main Title (EN)</label>
                    <input
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-mystic-red/50 outline-none"
                      value={about.title_en}
                      onChange={(e) => setAbout({...about, title_en: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase text-mystic-red font-bold tracking-widest">Subtitle (RU)</label>
                    <input
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-mystic-red/50 outline-none"
                      value={about.subtitle_ru}
                      onChange={(e) => setAbout({...about, subtitle_ru: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase text-mystic-red font-bold tracking-widest">Subtitle (EN)</label>
                    <input
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-mystic-red/50 outline-none"
                      value={about.subtitle_en}
                      onChange={(e) => setAbout({...about, subtitle_en: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase text-mystic-red font-bold tracking-widest">Description (RU)</label>
                    <textarea
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-mystic-red/50 outline-none h-32"
                      value={about.description_ru}
                      onChange={(e) => setAbout({...about, description_ru: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase text-mystic-red font-bold tracking-widest">Description (EN)</label>
                    <textarea
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-mystic-red/50 outline-none h-32"
                      value={about.description_en}
                      onChange={(e) => setAbout({...about, description_en: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-black/20 border border-white/5 rounded-lg space-y-3">
                    <p className="text-[10px] uppercase text-mystic-red font-bold">Years Stat</p>
                    <input
                      className="w-full bg-transparent border-b border-white/10 py-1 text-sm outline-none focus:border-mystic-red"
                      value={about.stat_years_value}
                      placeholder="Value (e.g. 15+)"
                      onChange={(e) => setAbout({...about, stat_years_value: e.target.value})}
                    />
                  </div>
                  <div className="p-4 bg-black/20 border border-white/5 rounded-lg space-y-3">
                    <p className="text-[10px] uppercase text-mystic-red font-bold">Rituals Stat</p>
                    <input
                      className="w-full bg-transparent border-b border-white/10 py-1 text-sm outline-none focus:border-mystic-red"
                      value={about.stat_rituals_value}
                      placeholder="Value (e.g. 2,000+)"
                      onChange={(e) => setAbout({...about, stat_rituals_value: e.target.value})}
                    />
                  </div>
                  <div className="p-4 bg-black/20 border border-white/5 rounded-lg space-y-3">
                    <p className="text-[10px] uppercase text-mystic-red font-bold">Clients Stat</p>
                    <input
                      className="w-full bg-transparent border-b border-white/10 py-1 text-sm outline-none focus:border-mystic-red"
                      value={about.stat_clients_value}
                      placeholder="Value (e.g. 500+)"
                      onChange={(e) => setAbout({...about, stat_clients_value: e.target.value})}
                    />
                  </div>
                </div>

                <button
                  onClick={() => updateAbout(about)}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-mystic-red text-white font-bold uppercase text-xs tracking-[0.2em] rounded-xl shadow-lg shadow-mystic-red/20 cursor-pointer"
                >
                  <Save size={16} /> Save Sanctuary Profile
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
