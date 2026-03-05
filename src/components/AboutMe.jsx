import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';

const AboutMe = ({ sidebarExpanded, isMobile, onOpenBooking }) => {
  const { i18n } = useTranslation();
  const { about } = useAppContext();
  const lang = i18n.language === 'ru' ? 'ru' : 'en';

  if (!about) return null;

  // Calculate dynamic padding to ensure NO overlapping
  const sidebarWidth = sidebarExpanded ? 340 : 100;
  const leftPadding = isMobile ? 24 : sidebarWidth + 80; // Added extra 80px safe zone

  return (
    <motion.section
      id="about-me"
      className="relative min-h-screen py-32 px-6 overflow-hidden flex items-center justify-center bg-mystic-black"
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1,
        paddingLeft: leftPadding,
        paddingRight: isMobile ? 24 : 80 
      }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      {/* --- Background Elements --- */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-mystic-red/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] bg-mystic-red/3 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative w-full max-w-6xl mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-center">
          
          {/* --- Image Section --- */}
          <motion.div 
            className="lg:col-span-5 relative order-1 lg:order-1"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="relative group max-w-[380px] mx-auto lg:mx-0">
              {/* Refined Frame */}
              <div className="absolute -inset-4 border border-white/5 rounded-[32px] group-hover:border-mystic-red/20 transition-all duration-700" />
              
              {/* Main Image Container */}
              <div className="relative aspect-[4/5] rounded-[24px] overflow-hidden border border-white/10 shadow-2xl bg-mystic-black/60">
                {about.image_url ? (
                  <>
                    <img 
                      src={about.image_url} 
                      alt={about[`title_${lang}`]} 
                      className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-mystic-black/80 via-transparent to-transparent" />
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-white/[0.02]">
                    <span className="font-heading text-4xl text-mystic-red/20">?</span>
                  </div>
                )}
                
                {/* Elegant Badge */}
                <motion.div 
                  className="absolute bottom-4 right-4 bg-mystic-red/90 backdrop-blur-md px-4 py-2 rounded-lg shadow-xl border border-white/20
                             flex items-center gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-[7px] tracking-[0.3em] font-black text-white uppercase whitespace-nowrap">AUTHENTIC MASTER</span>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* --- Content Section --- */}
          <div className="lg:col-span-7 order-2 lg:order-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="h-[1px] w-6 bg-mystic-red" />
              <span className="text-[8px] tracking-[0.4em] uppercase font-bold text-mystic-red/80">
                 {lang === 'ru' ? 'ВЕКОВАЯ МУДРОСТЬ' : 'ANCIENT WISDOM'}
              </span>
            </motion.div>

            <motion.h2
              className="font-heading text-5xl md:text-6xl text-mystic-white leading-tight mb-8 text-glow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              {about[`title_${lang}`]}
            </motion.h2>

            <motion.p
              className="text-mystic-gray-muted text-base md:text-lg leading-relaxed mb-10 italic max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {about[`description_${lang}`]}
            </motion.p>

            {/* Compact Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 max-w-lg">
              {(about.stats || []).map((stat, index) => (
                <motion.div
                  key={index}
                  className="py-4 px-5 rounded-xl border border-white/5 bg-white/[0.01] hover:border-mystic-red/20 transition-all group"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + (index * 0.1) }}
                >
                  <span className="block font-heading text-3xl text-mystic-red text-glow leading-none mb-1">
                     {stat.value}
                  </span>
                  <span className="block text-[9px] tracking-[0.15em] font-black text-mystic-gray-muted uppercase">
                     {stat[`label_${lang}`]}
                  </span>
                </motion.div>
              ))}
            </div>

            <motion.button
              onClick={onOpenBooking}
              className="group relative px-10 py-4 border border-mystic-red/40 text-mystic-red rounded-sm overflow-hidden 
                         text-[10px] tracking-[0.4em] font-bold uppercase hover:border-mystic-red transition-all"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <span className="relative z-10 transition-colors duration-500 group-hover:text-white">
                {lang === 'ru' ? 'ЗАПИСАТЬСЯ' : 'BOOK RITUAL'}
              </span>
              <div className="absolute inset-0 bg-mystic-red -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default AboutMe;
