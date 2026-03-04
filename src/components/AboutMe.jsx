import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const AboutMe = ({ sidebarExpanded, isMobile, onOpenBooking }) => {
  const { i18n } = useTranslation();
  const { about } = useAppContext();
  const lang = i18n.language === 'ru' ? 'ru' : 'en';

  if (!about) return null;

  return (
    <motion.section
      id="about-me"
      className="relative min-h-screen py-28 px-6 md:px-10 overflow-hidden flex items-center justify-center"
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        paddingLeft: isMobile ? 24 : (sidebarExpanded ? 340 : 100) + 40,
        paddingRight: isMobile ? 24 : 40 
      }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-mystic-red/5 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-5xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="flex items-center gap-4 mb-16"
        >
          <motion.div custom={0} variants={fadeUp} className="h-[1px] w-16 bg-mystic-red/30" />
          <motion.span custom={0} variants={fadeUp} className="text-[10px] tracking-[0.4em] uppercase text-mystic-red/60">
             {lang === 'ru' ? 'ВЕКОВАЯ МУДРОСТЬ' : 'ANCIENT WISDOM'}
          </motion.span>
          <motion.div custom={0} variants={fadeUp} className="h-[1px] flex-1 bg-mystic-red/10" />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
        >
          <div>
            <motion.h2
              custom={1}
              variants={fadeUp}
              className="font-heading text-5xl md:text-6xl lg:text-7xl text-mystic-white leading-tight mb-6 text-glow"
            >
              {about[`title_${lang}`]}
            </motion.h2>

            <motion.p
              custom={3}
              variants={fadeUp}
              className="text-mystic-gray-muted text-base md:text-lg leading-relaxed mb-10 italic"
            >
              {about[`description_${lang}`]}
            </motion.p>

            <motion.button
              custom={4}
              variants={fadeUp}
              onClick={onOpenBooking}
              aria-label={lang === 'ru' ? 'Записаться на ритуал' : 'Book a ritual'}
              className="group relative px-8 py-4 border border-mystic-red/40 text-mystic-red text-xs tracking-[0.3em] uppercase
                         overflow-hidden transition-all duration-500 cursor-pointer rounded-sm
                         hover:border-mystic-red hover:text-mystic-white shadow-lg shadow-mystic-red/5"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">{lang === 'ru' ? 'ЗАПИСАТЬСЯ НА РИТУАЛ' : 'BOOK A RITUAL'}</span>
              <motion.div
                className="absolute inset-0 bg-mystic-red origin-left"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              />
            </motion.button>
          </div>

          <div className="flex flex-col gap-6">
            {(about.stats || []).map((stat, index) => (
              <motion.div
                key={index}
                custom={index + 2}
                variants={fadeUp}
                className="relative p-8 rounded-2xl border border-mystic-red/10 bg-mystic-black/40
                           backdrop-blur-md hover:border-mystic-red/30 transition-all duration-500 group"
                whileHover={{ x: 12 }}
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-mystic-red to-transparent rounded-l-xl
                                opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="flex items-baseline gap-6 relative z-10">
                  <span className="font-heading text-5xl md:text-6xl text-mystic-red text-glow">
                    {stat.value}
                  </span>
                  <span className="text-mystic-gray-muted text-[10px] tracking-[0.2em] font-black uppercase">
                    {stat[`label_${lang}`]}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex items-center gap-4 mt-24"
        >
          <motion.div custom={0} variants={fadeUp} className="h-[1px] flex-1 bg-mystic-red/10" />
          <div className="w-1.5 h-1.5 rounded-full bg-mystic-red/40" />
          <motion.div custom={0} variants={fadeUp} className="h-[1px] flex-1 bg-mystic-red/10" />
        </motion.div>
      </div>
    </motion.section>
  );
};

export default AboutMe;
