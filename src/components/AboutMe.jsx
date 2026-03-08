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

            <motion.a
              href="tel:+79175021584"
              className="inline-flex items-center gap-4 py-4 px-6 rounded-xl border border-white/5 bg-white/[0.01] hover:border-mystic-red/20 transition-all group w-full sm:w-auto"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="w-10 h-10 shrink-0 rounded-full bg-mystic-red/5 flex items-center justify-center border border-mystic-red/10 group-hover:bg-mystic-red/10 group-hover:border-mystic-red/30 transition-all">
                <svg className="w-4 h-4 text-mystic-red text-glow opacity-80 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[9px] tracking-[0.15em] font-black text-mystic-gray-muted uppercase mb-1">
                   {lang === 'ru' ? 'ТЕЛЕФОН ДЛЯ СВЯЗИ' : 'PHONE CONTACT'}
                </span>
                <span className="font-heading text-xl sm:text-2xl text-mystic-white group-hover:text-mystic-red text-glow transition-colors tracking-wider">
                  +7 (917) 502-15-84
                </span>
              </div>
            </motion.a>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default AboutMe;
