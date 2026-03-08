import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';

const PollCard = ({ poll, refreshData, lang }) => {
  const [voted, setVoted] = useState(false);
  const [isCasting, setIsCasting] = useState(false);

  useEffect(() => {
    const hasVoted = localStorage.getItem(`voted_poll_${poll.id}`);
    if (hasVoted) setVoted(true);
  }, [poll.id]);

  const options = poll.options || [];
  const totalVotes = options.reduce((sum, opt) => sum + (opt.votes || 0), 0);

  const handleVote = async (index) => {
    if (voted || isCasting) return;
    
    setIsCasting(true);
    const newOptions = [...options];
    newOptions[index].votes = (newOptions[index].votes || 0) + 1;
    
    try {
      const { error } = await supabase.from('polls').update({ options: newOptions }).eq('id', poll.id);
      if (error) throw error;
      
      localStorage.setItem(`voted_poll_${poll.id}`, 'true');
      setVoted(true);
      refreshData();
    } catch (err) {
      console.error('Error casting vote:', err);
    } finally {
      setIsCasting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="relative p-10 rounded-3xl border border-mystic-red/10 bg-mystic-black/40 backdrop-blur-xl overflow-hidden shadow-2xl transition-all"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-mystic-red/5 blur-3xl pointer-events-none" />
      
      <h3 className="font-heading text-2xl md:text-3xl text-white text-glow mb-2 text-center">
        {poll[`question_${lang}`]}
      </h3>
      <p className="text-mystic-gray-muted text-[10px] uppercase tracking-[0.2em] font-bold mb-10 text-center opacity-60">
        {lang === 'ru' ? 'Ритуальный опрос' : 'Ritual Inquiry'}
      </p>

      <AnimatePresence mode="wait">
        {!voted ? (
          <motion.div key="options" className="flex flex-col gap-3 max-w-sm mx-auto">
            {options.map((opt, i) => (
              <motion.button
                key={i}
                onClick={() => handleVote(i)}
                disabled={isCasting}
                aria-label={`${voted ? 'Voted' : 'Vote for'}: ${opt[`label_${lang}`]}`}
                className="group relative py-4 rounded-xl border border-mystic-red/20 text-mystic-red text-[11px] font-black
                           tracking-[0.1em] uppercase cursor-pointer overflow-hidden transition-all duration-300
                           hover:border-mystic-red hover:text-white disabled:opacity-50"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <span className="relative z-10">{opt[`label_${lang}`]}</span>
                <div className="absolute inset-0 bg-mystic-red origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-md mx-auto">
             {options.map((opt, i) => {
               const percent = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
               return (
                 <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-mystic-gray-muted">
                       <span>{opt[`label_${lang}`]}</span>
                       <span className="text-mystic-red">{opt.votes || 0}</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                       <motion.div 
                          className="h-full bg-mystic-red shadow-[0_0_8px_#d32f2f]" 
                          initial={{ width: 0 }} 
                          animate={{ width: `${percent}%` }} 
                          transition={{ duration: 1, ease: 'circOut' }} 
                       />
                    </div>
                 </div>
               );
             })}
             <p className="text-[9px] text-mystic-gray-muted/40 uppercase tracking-[0.2em] pt-4 italic text-center">
                {totalVotes} {lang === 'ru' ? 'голосов резонирует' : 'votes resonating'}
             </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const MysticPoll = ({ sidebarExpanded, isMobile }) => {
  const { i18n } = useTranslation();
  const { polls, refreshData } = useAppContext();
  const lang = i18n.language === 'ru' ? 'ru' : 'en';

  if (!polls || polls.length === 0) return null;

  return (
    <motion.section
      id="mystic-poll"
      className="relative min-h-screen py-32 px-6 md:px-10 flex flex-col items-center"
      transition={{ duration: 0.4 }}
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1, 
        paddingLeft: isMobile ? 24 : (sidebarExpanded ? 340 : 100) + 40,
        paddingRight: isMobile ? 24 : 40 
      }}
    >
      <div className="w-full max-w-3xl space-y-20">
        <div className="text-center space-y-4">
           <motion.div 
             initial={{ scale: 0 }}
             whileInView={{ scale: 1 }}
             className="w-16 h-16 bg-mystic-red/10 border border-mystic-red/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(211,47,47,0.2)]"
           >
             <span className="text-2xl">🔮</span>
           </motion.div>
           <h2 className="text-4xl md:text-5xl font-heading text-white text-glow">
             {lang === 'ru' ? 'Мистический Резонанс' : 'Mystical Resonance'}
           </h2>
           <p className="text-mystic-gray-muted text-sm max-w-md mx-auto leading-relaxed">
             {lang === 'ru' ? 'Позвольте вашей интуиции направить энергию в нужное русло. Каждый голос меняет видение будущего.' : 'Let your intuition guide the energy. Every choice shifts the vision of the future.'}
           </p>
        </div>

        <div className="grid grid-cols-1 gap-12">
          {polls.map((p) => (
            <PollCard key={p.id} poll={p} refreshData={refreshData} lang={lang} />
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default MysticPoll;
