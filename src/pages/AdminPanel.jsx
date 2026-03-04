import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import candles from '../data/candles';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { 
  LogOut, 
  Layout, 
  MessageSquare, 
  Save, 
  Edit3,
  Plus,
  Upload,
  Loader2,
  Trash2,
  User,
  ExternalLink,
  ChevronRight,
  Database,
  RefreshCcw,
  Menu,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const StatCard = ({ stat, index, onUpdate, onDelete }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative group">
    <div className="space-y-4">
      <input 
        className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-3 text-2xl font-heading text-mystic-red outline-none text-center focus:border-mystic-red/40"
        value={stat.value || ''} 
        placeholder="100+"
        onChange={(e) => onUpdate(index, 'value', e.target.value)} 
      />
      <div className="space-y-2">
        <input 
          className="w-full bg-transparent text-[10px] uppercase font-bold text-mystic-gray-muted text-center outline-none border-b border-white/5 focus:border-mystic-red/30"
          value={stat.label_ru || ''} 
          placeholder="Метка (RU)"
          onChange={(e) => onUpdate(index, 'label_ru', e.target.value)} 
        />
        <input 
          className="w-full bg-transparent text-[10px] uppercase font-bold text-mystic-gray-muted text-center outline-none opacity-40 focus:opacity-100"
          value={stat.label_en || ''} 
          placeholder="Метка (EN)"
          onChange={(e) => onUpdate(index, 'label_en', e.target.value)} 
        />
      </div>
    </div>
    <button 
      onClick={() => onDelete(index)} 
      className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg cursor-pointer z-10"
    >
      <Trash2 size={14} />
    </button>
  </div>
);

const AdminPanel = () => {
  const { refreshData } = useAppContext();
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [polls, setPolls] = useState([]);
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('categories'); 
  const [editingItem, setEditingItem] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingPoll, setEditingPoll] = useState(null);
  const [isAddingPoll, setIsAddingPoll] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newCat, setNewCat] = useState({ 
    id: '', label_ru: '', label_en: '', title_ru: '', title_en: '', 
    description_ru: '', description_en: '', element_ru: '', element_en: '',
    properties_ru: '', properties_en: '', image_url: '', color: '#ffffff' 
  });
  const [newPoll, setNewPoll] = useState({
    question_ru: '', question_en: '', is_active: false,
    options: [{ label_ru: 'Да', label_en: 'Yes', votes: 0 }, { label_ru: 'Нет', label_en: 'No', votes: 0 }]
  });
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, pollsRes, aboutRes] = await Promise.all([
        supabase.from('categories').select('*').order('id'),
        supabase.from('polls').select('*').order('id', { ascending: false }),
        supabase.from('about_content').select('*').maybeSingle()
      ]);

      if (catRes.error) throw catRes.error;
      setCategories(catRes.data || []);
      setPolls(pollsRes.data || []);
      setAbout(aboutRes.data);
    } catch (error) {
      toast.error('Связь с Оракулом прервана: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const uploadImage = async (file) => {
    if (!file) return null;
    setUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const { error: uploadError } = await supabase.storage.from('categories').upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
      
      if (uploadError) {
        if (uploadError.message.includes('bucket not found')) {
          throw new Error('Supabase Storage: "categories" bucket not found. Please create a public "categories" bucket in your Supabase Dashboard.');
        }
        throw uploadError;
      }

      const { data } = supabase.storage.from('categories').getPublicUrl(fileName);
      return data.publicUrl;
    } catch (error) {
      console.error('Upload Error:', error);
      toast.error('Ошибка загрузки мистического образа: ' + error.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  // --- Category Actions ---
  const saveCategory = async (id, data) => {
    try {
      const { error } = await supabase.from('categories').upsert({ id, ...data });
      if (error) throw error;
      toast.success('Категория кристаллизована');
      setEditingItem(null);
      setIsAdding(false);
      fetchData();
      refreshData();
    } catch (error) {
      toast.error('Алхимия не удалась: ' + error.message);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm(`Изгнать "${id}" из бытия?`)) return;
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      toast.success('Удалено из базы данных');
      fetchData();
      refreshData();
    } catch (error) {
      toast.error('Изгнание не удалось: ' + error.message);
    }
  };

  // --- Poll Actions ---
  const savePoll = async (pollObj) => {
    const toastId = toast.loading('Предсказание опроса...');
    try {
      const { error } = await supabase.from('polls').upsert(pollObj);
      if (error) throw error;
      toast.success('Будущее опроса предсказано', { id: toastId });
      setEditingPoll(null);
      setIsAddingPoll(false);
      fetchData();
      refreshData();
    } catch (error) {
      toast.error('Предсказание не удалось: ' + error.message, { id: toastId });
    }
  };

  const activatePoll = async (id) => {
    const toastId = toast.loading('Изменение реальности...');
    try {
      // First de-activate all
      await supabase.from('polls').update({ is_active: false }).neq('id', id);
      // Then activate this one
      const { error } = await supabase.from('polls').update({ is_active: true }).eq('id', id);
      if (error) throw error;
      toast.success('Частота настроена', { id: toastId });
      fetchData();
      refreshData();
    } catch (error) {
      toast.error('Настройка не удалась: ' + error.message, { id: toastId });
    }
  };

  const deletePoll = async (id) => {
    if (!window.confirm('Изгнать этот призыв?')) return;
    try {
      const { error } = await supabase.from('polls').delete().eq('id', id);
      if (error) throw error;
      toast.success('Призыв удален');
      fetchData();
      refreshData();
    } catch (error) { toast.error(error.message); }
  };

  const addPollOption = (p, setP) => {
    const options = [...(p.options || [])];
    options.push({ label_ru: 'Новый вариант', label_en: 'New Option', votes: 0 });
    setP({ ...p, options });
  };

  // --- About Actions ---
  const saveAbout = async () => {
    const toastId = toast.loading('Гравировка в вечности...');
    try {
      const { error } = await supabase.from('about_content').upsert(about);
      if (error) throw error;
      toast.success('Наследие увековечено', { id: toastId });
      fetchData();
      refreshData();
    } catch (error) {
      toast.error('Ритуал не удался: ' + error.message, { id: toastId });
    }
  };

  const updateStat = (index, field, value) => {
    const newStats = [...(about.stats || [])];
    newStats[index] = { ...newStats[index], [field]: value };
    setAbout({ ...about, stats: newStats });
  };

  const deleteStat = (index) => {
    if (!window.confirm('Удалить эту статистику?')) return;
    const newStats = about.stats.filter((_, i) => i !== index);
    setAbout({ ...about, stats: newStats });
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <Loader2 className="animate-spin text-mystic-red" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080808] text-mystic-white font-sans selection:bg-mystic-red/40 flex flex-col lg:flex-row">
      {/* Sidebar Mobile Toggle Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`w-72 bg-mystic-black border-r border-white/5 p-8 flex flex-col fixed h-full z-40 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-14 px-2">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-mystic-red/20 rounded-xl border border-mystic-red/30 flex items-center justify-center text-mystic-red font-heading text-xl">I</div>
            <span className="font-heading text-2xl tracking-tighter uppercase">IRODIANA</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-mystic-gray-muted hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-2 flex-grow">
          {[
            { id: 'categories', label: 'Категории', icon: Layout },
            { id: 'poll', label: 'Мистические опросы', icon: MessageSquare },
            { id: 'about', label: 'Ваше Наследие', icon: User },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all group ${activeTab === tab.id ? 'bg-mystic-red text-white shadow-lg shadow-mystic-red/20' : 'text-mystic-gray-muted hover:bg-white/5 hover:text-white'}`}
            >
              <tab.icon size={20} className={activeTab === tab.id ? 'text-white' : 'text-mystic-red/60 group-hover:text-mystic-red'} />
              <span className="text-sm font-bold tracking-tight">{tab.label}</span>
              {activeTab === tab.id && <ChevronRight size={16} className="ml-auto opacity-60" />}
            </button>
          ))}
        </nav>

        <button 
          onClick={handleLogout}
          className="mt-auto flex items-center gap-4 px-5 py-4 text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
        >
          <LogOut size={18} />
          <span className="text-sm font-bold">Завершить Сеанс</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow lg:ml-72 p-6 lg:p-12 relative min-h-screen w-full overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] lg:w-[800px] h-[300px] lg:h-[800px] bg-mystic-red/5 blur-[80px] lg:blur-[180px] rounded-full pointer-events-none" />
        
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-8 pb-4 border-b border-white/5">
          <button onClick={() => setIsSidebarOpen(true)} className="p-3 bg-white/5 rounded-xl border border-white/10 text-mystic-red">
            <Menu size={20} />
          </button>
          <div className="font-heading text-lg tracking-widest text-mystic-red uppercase">IRODIANA</div>
          <div className="w-10" /> {/* Spacer */}
        </div>

        <header className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12 lg:mb-16 relative">
          <div>
            <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] font-black text-mystic-red uppercase mb-3">
              <span className="w-1.5 h-1.5 bg-mystic-red rounded-full animate-pulse shadow-[0_0_8px_#d32f2f]" />
              Священный Храм Админа
            </div>
            <h1 className="text-3xl lg:text-5xl font-heading text-white text-glow mb-2">
              {activeTab === 'categories' ? 'Алхимический Каталог' : activeTab === 'poll' ? 'Провидческий Опрос' : 'Летописец Пламени'}
            </h1>
            <p className="text-mystic-gray-muted max-w-lg text-sm lg:text-base">Управляйте мистическими элементами вашего цифрового присутствия. Каждое изменение резонирует сквозь эфир.</p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <button onClick={fetchData} className="p-3 bg-white/5 border border-white/10 rounded-xl text-mystic-red hover:bg-white/10 transition-all" title="Обновить Сущность">
              <RefreshCcw size={20} />
            </button>
            {activeTab === 'categories' && (
              <button 
                onClick={() => setIsAdding(true)}
                className="flex-grow md:flex-grow-0 flex items-center justify-center gap-3 px-8 py-3 bg-mystic-red text-white font-bold uppercase tracking-widest text-[11px] rounded-xl shadow-xl shadow-mystic-red/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Plus size={16} /> Создать Категорию
              </button>
            )}
          </div>
        </header>

        <div className="relative">
          <AnimatePresence mode="wait">
            {/* --- CATEGORIES SECTION --- */}
            {activeTab === 'categories' && (
              <motion.div key="cat" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                {isAdding && (
                  <CategoryEditor item={newCat} setItem={setNewCat} onSave={() => saveCategory(newCat.id, newCat)} onCancel={() => setIsAdding(false)} uploading={uploading} onUpload={uploadImage} isNew />
                )}

                {categories.length === 0 && !isAdding && (
                  <div className="py-32 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center">
                    <Database size={48} className="text-mystic-red/20 mb-6" />
                    <h3 className="text-2xl font-bold mb-2">Каталог Пуст</h3>
                    <p className="text-mystic-gray-muted max-w-sm mb-10">Синхронизируйте локальные данные свечей с базой Supabase для быстрого старта.</p>
                    <button 
                       onClick={async () => {
                         const toastId = toast.loading('Синхронизация священных данных...');
                         try {
                           const formatted = candles.map(c => ({
                             id: c.id,
                             image_url: c.image,
                             color: c.color,
                             label_ru: t(`candles.${c.id}.label`, { lng: 'ru' }),
                             label_en: t(`candles.${c.id}.label`, { lng: 'en' }),
                             title_ru: t(`candles.${c.id}.title`, { lng: 'ru' }),
                             title_en: t(`candles.${c.id}.title`, { lng: 'en' }),
                             description_ru: t(`candles.${c.id}.description`, { lng: 'ru' }),
                             description_en: t(`candles.${c.id}.description`, { lng: 'en' }),
                             element_ru: t(`candles.${c.id}.element`, { lng: 'ru' }),
                             element_en: t(`candles.${c.id}.element`, { lng: 'en' }),
                             properties_ru: (t(`candles.${c.id}.properties`, { lng: 'ru', returnObjects: true }) || []).join(', '),
                             properties_en: (t(`candles.${c.id}.properties`, { lng: 'en', returnObjects: true }) || []).join(', ')
                           }));

                           const { error } = await supabase.from('categories').upsert(formatted);
                           if (error) throw error;
                           toast.success('Святилище Синхронизировано', { id: toastId });
                           fetchData();
                         } catch (e) { 
                           console.error(e);
                           toast.error(e.message, { id: toastId }); 
                         }
                       }}
                       className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-3"
                    >
                      <Plus size={16} /> Синхронизировать Локальные Данные
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-6">
                  {categories.map(cat => (
                    <div key={cat.id} className="bg-mystic-black/40 border border-white/5 rounded-2xl p-6 lg:p-8 backdrop-blur-md hover:border-mystic-red/20 transition-all group">
                      {editingItem?.id === cat.id ? (
                        <CategoryEditor item={editingItem} setItem={setEditingItem} onSave={() => saveCategory(cat.id, editingItem)} onCancel={() => setEditingItem(null)} uploading={uploading} onUpload={uploadImage} />
                      ) : (
                        <div className="flex flex-col md:flex-row items-start gap-6 lg:gap-10">
                          {cat.image_url ? (
                            <img src={cat.image_url} className="w-full md:w-40 aspect-square rounded-2xl object-cover shadow-2xl group-hover:scale-[1.02] transition-all" />
                          ) : (
                            <div className="w-full md:w-40 aspect-square rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-mystic-gray-muted group-hover:border-mystic-red/20 transition-all">
                              <Layout size={32} className="opacity-20 mb-2" />
                               <span className="text-[8px] uppercase font-black tracking-widest opacity-40 text-center px-4">Нет Визуального Образа</span>
                            </div>
                          )}
                          <div className="flex-grow w-full">
                             <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                               <div>
                                 <div className="flex items-center gap-3 mb-2">
                                   <div className="w-4 h-4 rounded-full border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)]" style={{ backgroundColor: cat.color }} />
                                   <h2 className="text-2xl lg:text-3xl font-heading text-white">{cat.label_ru || cat.id}</h2>
                                 </div>
                                 <code className="text-[10px] text-mystic-red font-mono bg-mystic-red/10 px-2 py-0.5 rounded uppercase font-bold tracking-widest">ID: {cat.id}</code>
                               </div>
                               <div className="flex gap-2 w-full md:w-auto">
                                 <button onClick={() => setEditingItem(cat)} className="flex-grow md:flex-grow-0 flex justify-center p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5"><Edit3 size={18} /></button>
                                 <button onClick={() => deleteCategory(cat.id)} className="flex-grow md:flex-grow-0 flex justify-center p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all border border-red-500/10"><Trash2 size={18} /></button>
                               </div>
                             </div>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-10">
                                <div>
                                   <p className="text-[10px] uppercase font-black text-mystic-red tracking-widest mb-3">Русское Проявление</p>
                                   <p className="text-sm text-mystic-gray-muted line-clamp-3 leading-relaxed italic">"{cat.description_ru || 'Описание отсутствует'}"</p>
                                </div>
                                <div>
                                   <p className="text-[10px] uppercase font-black text-mystic-red tracking-widest mb-3">Английский Перевод</p>
                                   <p className="text-sm text-mystic-gray-muted line-clamp-3 leading-relaxed italic">"{cat.description_en || 'Перевод отсутствует'}"</p>
                                </div>
                             </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* --- POLL SECTION --- */}
            {activeTab === 'poll' && (
              <motion.div key="poll" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                
                {/* Poll Creator/Editor UI */}
                {(isAddingPoll || editingPoll) && (
                  <div className="bg-mystic-black/60 border border-mystic-red/20 rounded-3xl p-10 space-y-10 shadow-2xl backdrop-blur-xl">
                     <div className="flex justify-between items-center border-b border-white/5 pb-8">
                        <h3 className="text-2xl font-heading text-white">{isAddingPoll ? 'Создание Нового Резонанса' : 'Уточнение Существующего Резонанса'}</h3>
                        <div className="flex gap-4">
                           <button onClick={() => savePoll(isAddingPoll ? newPoll : editingPoll)} className="px-10 py-4 bg-mystic-red text-white font-bold uppercase tracking-widest text-[11px] rounded-xl shadow-lg shadow-mystic-red/20 hover:scale-[1.02] transition-all">Запечатать Судьбу</button>
                           <button onClick={() => { setIsAddingPoll(false); setEditingPoll(null); }} className="px-8 py-4 bg-white/5 rounded-xl text-mystic-gray-muted font-bold uppercase tracking-widest text-[11px] border border-white/10 hover:bg-white/10 transition-all">Растворить</button>
                        </div>
                     </div>

                     {/* Question Inputs */}
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-10">
                        <div className="space-y-3">
                           <label className="text-[10px] uppercase font-black tracking-widest text-mystic-red ml-1">Вопрос (RU)</label>
                           <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 lg:p-5 text-base lg:text-lg outline-none focus:border-mystic-red/40 transition-all font-medium" value={isAddingPoll ? newPoll.question_ru : editingPoll.question_ru} onChange={e => isAddingPoll ? setNewPoll({...newPoll, question_ru: e.target.value}) : setEditingPoll({...editingPoll, question_ru: e.target.value})} />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] uppercase font-black tracking-widest text-mystic-red ml-1">Вопрос (EN)</label>
                           <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 lg:p-5 text-base lg:text-lg outline-none focus:border-mystic-red/40 transition-all font-medium" value={isAddingPoll ? newPoll.question_en : editingPoll.question_en} onChange={e => isAddingPoll ? setNewPoll({...newPoll, question_en: e.target.value}) : setEditingPoll({...editingPoll, question_en: e.target.value})} />
                        </div>
                     </div>

                     {/* Options List */}
                     <div className="space-y-6">
                        <h3 className="text-xl font-heading text-white flex items-center gap-3">
                          <span className="w-8 h-px bg-mystic-red" />
                          Возможные Эхо (Варианты)
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                          {((isAddingPoll ? newPoll : editingPoll).options || []).map((opt, i) => (
                            <div key={i} className="flex gap-4 items-center bg-white/5 border border-white/5 rounded-2xl p-6">
                             <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4">
                               <input className="bg-transparent border-b border-white/10 p-2 text-sm outline-none focus:border-mystic-red" value={opt.label_ru} placeholder="Вариант (RU)" onChange={e => {
                                 const p = isAddingPoll ? newPoll : editingPoll;
                                 const opts = [...p.options];
                                 opts[i].label_ru = e.target.value;
                                 isAddingPoll ? setNewPoll({...newPoll, options: opts}) : setEditingPoll({...editingPoll, options: opts});
                               }} />
                               <input className="bg-transparent border-b border-white/10 p-2 text-sm outline-none focus:border-mystic-red" value={opt.label_en} placeholder="Option (EN)" onChange={e => {
                                 const p = isAddingPoll ? newPoll : editingPoll;
                                 const opts = [...p.options];
                                 opts[i].label_en = e.target.value;
                                 isAddingPoll ? setNewPoll({...newPoll, options: opts}) : setEditingPoll({...editingPoll, options: opts});
                               }} />
                             </div>
                               <button onClick={() => {
                                 const p = isAddingPoll ? newPoll : editingPoll;
                                 const opts = p.options.filter((_, idx) => idx !== i);
                                 isAddingPoll ? setNewPoll({...newPoll, options: opts}) : setEditingPoll({...editingPoll, options: opts});
                               }} className="p-3 text-white/20 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                            </div>
                          ))}
                          <button onClick={() => isAddingPoll ? addPollOption(newPoll, setNewPoll) : addPollOption(editingPoll, setEditingPoll)} className="w-full border-2 border-dashed border-white/5 rounded-2xl py-6 text-mystic-gray-muted hover:border-mystic-red/30 transition-all flex items-center justify-center gap-3">
                             <Plus size={18} /> ДОБАВИТЬ ВАРИАНТ
                          </button>
                        </div>
                     </div>
                  </div>
                )}

                {/* Polls List View */}
                {!isAddingPoll && !editingPoll && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                       <h2 className="text-2xl font-heading text-white">Провидческие Призывы</h2>
                       <button onClick={() => setIsAddingPoll(true)} className="flex items-center gap-3 px-8 py-3 bg-mystic-red text-white font-bold uppercase tracking-widest text-[11px] rounded-xl shadow-xl shadow-mystic-red/20"><Plus size={16} /> Новый Вопрос</button>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                       {polls.map(p => (
                         <div key={p.id} className={`bg-mystic-black/40 border rounded-3xl p-8 backdrop-blur-md transition-all ${p.is_active ? 'border-mystic-red/40 shadow-2xl shadow-mystic-red/5' : 'border-white/5'}`}>
                            <div className="flex flex-col sm:flex-row items-start justify-between mb-8 gap-6">
                               <div>
                                  <div className="flex items-center gap-4 mb-3">
                                     {p.is_active && <span className="flex h-2 w-2 rounded-full bg-mystic-red animate-pulse shadow-[0_0_10px_#d32f2f]" />}
                                     <h3 className="text-xl lg:text-2xl font-heading text-white">{p.question_ru}</h3>
                                  </div>
                                  <p className="text-sm text-mystic-gray-muted italic mb-4">"{p.question_en}"</p>
                                  <div className="flex flex-wrap gap-2">
                                     {!p.is_active && <button onClick={() => activatePoll(p.id)} className="px-4 py-2 bg-mystic-red/10 text-mystic-red border border-mystic-red/20 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-mystic-red hover:text-white transition-all">Активировать</button>}
                                     <button onClick={() => setEditingPoll(p)} className="px-4 py-2 bg-white/5 text-white/60 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest hover:text-white hover:border-white/30 transition-all">Изменить</button>
                                     <button onClick={() => deletePoll(p.id)} className="px-4 py-2 bg-red-500/5 text-red-500/50 border border-red-500/10 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 hover:text-red-500 transition-all">Удалить</button>
                                  </div>
                               </div>
                               <div className="text-left sm:text-right">
                                  <span className="text-3xl lg:text-4xl font-heading text-mystic-red block">{p.options?.reduce((a, b) => a + (b.votes || 0), 0) || 0}</span>
                                  <span className="text-[10px] uppercase font-black tracking-widest text-mystic-gray-muted">Всего Голосов</span>
                               </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-3">
                               {(p.options || []).map((opt, ix) => (
                                 <div key={ix} className="px-4 py-2 bg-white/5 border border-white/5 rounded-full text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                    {opt.label_ru} ({opt.votes || 0})
                                 </div>
                               ))}
                            </div>
                         </div>
                       ))}

                       {polls.length === 0 && (
                         <div className="py-24 border-2 border-dashed border-white/5 rounded-3xl text-center">
                            <Plus size={40} className="mx-auto text-white/5 mb-4" />
                            <p className="text-mystic-gray-muted uppercase tracking-widest text-xs">Вопросы пока не созданы</p>
                         </div>
                       )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* --- ABOUT SECTION --- */}
            {activeTab === 'about' && (
              <motion.div key="about" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-4xl space-y-10">
                {about ? (
                  <div className="bg-mystic-black/40 border border-white/5 rounded-3xl p-10 backdrop-blur-md space-y-12">
                     <div className="space-y-8">
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
                            <div className="space-y-3">
                               <label className="text-[10px] uppercase font-black tracking-widest text-mystic-red">Имя Алхимика / Титул (RU)</label>
                               <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 lg:p-5 text-xl lg:text-2xl font-heading text-white outline-none focus:border-mystic-red/40" value={about.title_ru} onChange={e => setAbout({...about, title_ru: e.target.value})} />
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] uppercase font-black tracking-widest text-mystic-red">Имя Алхимика / Титул (EN)</label>
                               <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 lg:p-5 text-xl lg:text-2xl font-heading text-white outline-none focus:border-mystic-red/40" value={about.title_en} onChange={e => setAbout({...about, title_en: e.target.value})} />
                            </div>
                         </div>

                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
                            <div className="space-y-3">
                               <label className="text-[10px] uppercase font-black tracking-widest text-mystic-red">Хроника (RU)</label>
                               <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 lg:p-5 text-sm h-48 outline-none focus:border-mystic-red/40 leading-relaxed italic" value={about.description_ru} onChange={e => setAbout({...about, description_ru: e.target.value})} />
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] uppercase font-black tracking-widest text-mystic-red">Хроника (EN)</label>
                               <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 lg:p-5 text-sm h-48 outline-none focus:border-mystic-red/40 leading-relaxed italic" value={about.description_en} onChange={e => setAbout({...about, description_en: e.target.value})} />
                            </div>
                         </div>
                     </div>

                     <div className="space-y-6">
                        <h3 className="text-xl font-heading text-white flex items-center gap-3">
                          <span className="w-8 h-px bg-mystic-red" />
                          Статистика Мастерства
                        </h3>
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                           {(about.stats || []).map((stat, i) => (
                             <StatCard 
                               key={`stat-${i}`} 
                               stat={stat} 
                               index={i} 
                               onUpdate={updateStat} 
                               onDelete={deleteStat} 
                             />
                           ))}
                           <button onClick={() => {
                              const stats = [...(about.stats || [])];
                              stats.push({ label_ru: 'Новый показатель', label_en: 'New Stat', value: '100+' });
                              setAbout({...about, stats});
                           }} className="h-40 border-2 border-dashed border-white/5 rounded-2xl text-mystic-gray-muted hover:border-mystic-red/30 transition-all flex flex-col items-center justify-center p-6 gap-2">
                              <Plus size={24} />
                              <span className="text-[10px] font-bold uppercase tracking-widest">Добавить Стат</span>
                           </button>
                        </div>
                     </div>

                     <div className="pt-6 border-t border-white/5 flex justify-end">
                        <button onClick={saveAbout} className="flex items-center gap-3 px-12 py-4 bg-mystic-red text-white font-bold uppercase tracking-widest text-[11px] rounded-xl shadow-xl shadow-mystic-red/20 hover:scale-105 active:scale-95 transition-all">
                           <Save size={18} /> Запечатлеть в Истории
                        </button>
                     </div>
                  </div>
                ) : (
                   <button onClick={async () => {
                      const toastId = toast.loading('Призыв Наследия...');
                      try {
                        const { error } = await supabase.from('about_content').insert([{ 
                          title_ru: t('about.title', { lng: 'ru' }), 
                          title_en: t('about.title', { lng: 'en' }),
                          description_ru: t('about.description', { lng: 'ru' }),
                          description_en: t('about.description', { lng: 'en' }),
                          stats: [
                            { label_ru: t('about.years', { lng: 'ru' }), label_en: t('about.years', { lng: 'en' }), value: '10+' },
                            { label_ru: t('about.rituals', { lng: 'ru' }), label_en: t('about.rituals', { lng: 'en' }), value: '500+' },
                            { label_ru: t('about.clients', { lng: 'ru' }), label_en: t('about.clients', { lng: 'en' }), value: '1000+' }
                          ]
                        }]);
                        if (error) throw error;
                        toast.success('Наследие Призвано', { id: toastId });
                        fetchData();
                      } catch (e) {
                        toast.error(e.message, { id: toastId });
                      }
                   }} className="px-10 py-5 bg-mystic-red rounded-2xl font-bold uppercase tracking-widest hover:scale-105 transition-all">Начать запись Наследия</button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

/* --- Sub-Component for Category Editing --- */
const CategoryEditor = ({ item, setItem, onSave, onCancel, uploading, onUpload, isNew }) => (
  <div className="bg-mystic-red/5 border border-mystic-red/20 rounded-3xl p-6 lg:p-10 space-y-8 lg:space-y-10">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
       <h3 className="text-lg lg:text-xl font-heading text-mystic-red uppercase tracking-[0.2em]">{isNew ? 'Создание Новой Сущности' : 'Настройка Существующей Энергии'}</h3>
       <div className="flex gap-4 w-full md:w-auto">
          <button onClick={onSave} className="flex-grow md:flex-grow-0 flex items-center justify-center gap-3 px-8 py-3 lg:px-10 lg:py-4 bg-mystic-red text-white font-bold uppercase tracking-widest text-[11px] rounded-xl shadow-lg shadow-mystic-red/20"><Save size={18} /> {isNew ? 'Создать' : 'Сохранить'}</button>
          <button onClick={onCancel} className="flex-grow md:flex-grow-0 px-8 py-3 lg:py-4 bg-white/5 rounded-xl text-mystic-gray-muted font-bold uppercase tracking-widest text-[11px] border border-white/10 hover:bg-white/10 transition-all">Растворить</button>
       </div>
    </div>

    {/* --- Core Identity Section --- */}
    <div className="flex flex-col lg:flex-row gap-8 items-start">
       <div className="w-full lg:w-56 space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-mystic-red ml-1">Превью Образа</label>
          <div className="aspect-square rounded-3xl bg-black/40 border border-white/5 overflow-hidden flex items-center justify-center relative group shadow-2xl">
             {item.image_url ? (
               <img src={item.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
             ) : (
               <div className="text-center p-6 opacity-30">
                  <Upload size={32} className="mx-auto mb-2" />
                  <span className="text-[8px] uppercase font-bold tracking-[0.2em]">Пустота</span>
               </div>
             )}
             {uploading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                   <Loader2 size={24} className="animate-spin text-mystic-red" />
                </div>
             )}
          </div>
       </div>

        <div className="flex-grow space-y-8 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {isNew && (
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Slug Сущности (ID)</label>
                  <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-mystic-red/50 focus:bg-white/10 transition-all font-mono" value={item.id} onChange={e => setItem({...item, id: e.target.value.toLowerCase().replace(/\s+/g, '-')})} placeholder="напр. solar-flare" />
               </div>
             )}
             <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Цвет Ауры (HEX)</label>
                <div className="flex gap-3">
                   <div className="w-14 h-13 rounded-xl border border-white/10 overflow-hidden shrink-0" style={{ backgroundColor: item.color || '#ffffff' }}>
                      <input type="color" className="w-full h-full opacity-0 cursor-pointer" value={/^#[0-9A-F]{6}$/i.test(item.color) ? item.color : '#ffffff'} onChange={e => setItem({...item, color: e.target.value})} />
                   </div>
                   <input className="flex-grow bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-mono outline-none uppercase" value={item.color} onChange={e => setItem({...item, color: e.target.value})} />
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Небесный Источник (RU / EN)</label>
                <div className="grid grid-cols-2 gap-3">
                   <input className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs" value={item.element_ru || ''} onChange={e => setItem({...item, element_ru: e.target.value})} placeholder="СОЛНЦЕ" />
                   <input className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs" value={item.element_en || ''} onChange={e => setItem({...item, element_en: e.target.value})} placeholder="SUN" />
                </div>
             </div>
          </div>

          <div className="space-y-2">
             <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Путь к Визуальному Образу (URL)</label>
             <div className="flex flex-col sm:flex-row gap-3">
                <input className="flex-grow bg-white/5 border border-white/10 rounded-2xl p-4 text-xs outline-none focus:border-mystic-red/50" value={item.image_url} onChange={e => setItem({...item, image_url: e.target.value})} placeholder="Прямая ссылка или Magic Upload..." />
                <label className="flex-shrink-0 flex items-center justify-center gap-3 bg-mystic-red/10 border border-mystic-red/30 px-8 py-4 sm:py-0 rounded-2xl cursor-pointer hover:bg-mystic-red/20 transition-all font-bold text-[10px] uppercase tracking-widest text-mystic-red">
                   {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                   Загрузить
                   <input type="file" className="hidden" accept="image/*" onChange={async e => {
                      if (!e.target.files?.[0]) return;
                      const url = await onUpload(e.target.files[0]);
                      if (url) setItem({...item, image_url: url});
                   }} />
                </label>
             </div>
          </div>
       </div>
    </div>

    {/* --- Manifestations Section --- */}
    <div className="pt-10 border-t border-white/5 space-y-10">
          {/* Row 1: Short Labels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-10">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-mystic-red/60">Краткое Название (RU)</label>
                <input className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 lg:p-5 text-base lg:text-lg font-heading" value={item.label_ru || ''} onChange={e => setItem({...item, label_ru: e.target.value})} placeholder="напр. Оранжевые свечи" />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-mystic-red/60">Краткое Название (EN)</label>
                <input className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 lg:p-5 text-base lg:text-lg font-heading" value={item.label_en || ''} onChange={e => setItem({...item, label_en: e.target.value})} placeholder="e.g. Orange Candles" />
             </div>
          </div>

          {/* Row 2: Titles of Power */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-10">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-mystic-red/60">Главный Заголовок (RU)</label>
                <input className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 lg:p-5 text-lg lg:text-xl font-heading text-glow" value={item.title_ru || ''} onChange={e => setItem({...item, title_ru: e.target.value})} />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-mystic-red/60">Главный Заголовок (EN)</label>
                <input className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 lg:p-5 text-lg lg:text-xl font-heading text-glow" value={item.title_en || ''} onChange={e => setItem({...item, title_en: e.target.value})} />
             </div>
          </div>

          {/* Row 3: Long Prophecies */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-10">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-mystic-red/60">Мистическое Описание (RU)</label>
                <textarea className="w-full bg-black/40 border border-white/10 rounded-3xl p-5 lg:p-6 h-40 text-sm italic leading-relaxed outline-none focus:border-mystic-red/30 focus:bg-white/5 transition-all" value={item.description_ru || ''} onChange={e => setItem({...item, description_ru: e.target.value})} placeholder="Описание природы этой свечи..." />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-mystic-red/60">Мистическое Описание (EN)</label>
                <textarea className="w-full bg-black/40 border border-white/10 rounded-3xl p-5 lg:p-6 h-40 text-sm italic leading-relaxed outline-none focus:border-mystic-red/30 focus:bg-white/5 transition-all" value={item.description_en || ''} onChange={e => setItem({...item, description_en: e.target.value})} placeholder="Description of this candle's nature..." />
             </div>
          </div>

          {/* Row 4: Magical Properties */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-10">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-mystic-red/60">Магические Свойства (RU)</label>
                <input className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 lg:p-5 text-sm" value={item.properties_ru || ''} onChange={e => setItem({...item, properties_ru: e.target.value})} placeholder="Свойства через запятую..." />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-mystic-red/60">Магические Свойства (EN)</label>
                <input className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 lg:p-5 text-sm" value={item.properties_en || ''} onChange={e => setItem({...item, properties_en: e.target.value})} placeholder="Свойства через запятую..." />
             </div>
          </div>
    </div>
  </div>
);

export default AdminPanel;
