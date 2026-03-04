import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';

const fadeSlideUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const ContentDisplay = ({ activeCategory, sidebarExpanded, isMobile, onOpenBooking }) => {
  const { t, i18n } = useTranslation();
  const { categories } = useAppContext();
  
  const candle = categories.find((c) => c.id === activeCategory) || categories[0];
  
  if (!candle) return null;

  // Translation helpers improved for DB priority
  const currentLang = i18n.language;
  const langKey = currentLang === 'ru' ? 'ru' : 'en';

  const title = candle.dbData?.[`title_${langKey}`] || t(`candles.${candle.id}.title`, candle.id);
  const description = candle.dbData?.[`description_${langKey}`] || t(`candles.${candle.id}.description`);
  const element = candle.dbData?.[`element_${langKey}`] || t(`candles.${candle.id}.element`, 'Flame');
  
  const rawProps = candle.dbData?.[`properties_${langKey}`];
  const properties = rawProps 
    ? rawProps.split(',').map(p => p.trim()) 
    : (t(`candles.${candle.id}.properties`, { returnObjects: true }) || []);

  return (
    <motion.main
      id="main-content"
      className="min-h-screen flex items-center justify-center py-20 relative z-10 px-6 md:px-10"
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1, 
        paddingLeft: isMobile ? 24 : (sidebarExpanded ? 340 : 100) + 40,
        paddingRight: isMobile ? 24 : 40 
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${candle.id}-${currentLang}`}
          className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* ═══ Left — Text Content ═══ */}
          <div className="flex flex-col gap-6">
            {/* Element badge */}
            <motion.div custom={0} variants={fadeSlideUp}>
              <span
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium tracking-widest uppercase border"
                style={{
                  borderColor: `${candle.color}40`,
                  color: candle.color,
                  backgroundColor: `${candle.color}10`,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: candle.color }}
                />
                {element}
              </span>
            </motion.div>

            {/* Decorative line */}
            <motion.div
              custom={1}
              variants={fadeSlideUp}
              className="w-16 h-[2px] rounded-full"
              style={{
                background: `linear-gradient(to right, ${candle.color}, transparent)`,
              }}
            />

            {/* Title */}
            <motion.h1
              custom={2}
              variants={fadeSlideUp}
              className="font-heading text-4xl md:text-5xl lg:text-6xl text-mystic-white leading-tight"
              style={{
                textShadow: `0 0 20px ${candle.color}30, 0 0 40px ${candle.color}15`,
              }}
            >
              {title}
            </motion.h1>

            {/* Description */}
            <motion.p
              custom={3}
              variants={fadeSlideUp}
              className="text-mystic-gray-muted text-base md:text-lg leading-relaxed max-w-lg"
            >
              {description}
            </motion.p>

            {/* Properties tags */}
            <motion.div
              custom={4}
              variants={fadeSlideUp}
              className="flex flex-wrap gap-2 mt-2"
            >
              {Array.isArray(properties) && properties.map((prop) => (
                <span
                  key={prop}
                  className="px-4 py-1.5 rounded-full text-[10px] font-semibold tracking-widest uppercase border backdrop-blur-sm transition-all duration-300
                             hover:scale-105 cursor-default shadow-[0_0_10px_rgba(0,0,0,0.2)]"
                  style={{
                    borderColor: `${candle.color}40`,
                    color: 'var(--mystic-white)',
                    background: `linear-gradient(135deg, ${candle.color}20, ${candle.color}05)`,
                  }}
                >
                  {prop}
                </span>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.button
              custom={5}
              variants={fadeSlideUp}
              onClick={onOpenBooking}
              id="cta-explore"
              className="group relative mt-6 w-fit px-8 py-3.5 text-[10px] tracking-[0.3em] uppercase font-bold
                         overflow-hidden cursor-pointer rounded-full transition-all duration-500"
              style={{
                background: `linear-gradient(90deg, ${candle.color}20, transparent)`,
                border: `1px solid ${candle.color}40`,
                color: 'var(--mystic-white)',
                boxShadow: `0 0 20px ${candle.color}10`,
              }}
              whileHover={{ 
                scale: 1.05, 
                boxShadow: `0 0 30px ${candle.color}30`,
                borderColor: candle.color
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">
                {t('buttons.learnMore')}
              </span>
              
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(90deg, ${candle.color}40, ${candle.color}10)`,
                }}
              />
              
              <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-30deg] group-hover:left-[100%] transition-all duration-1000" />
            </motion.button>
          </div>

          {/* ═══ Right — Image ═══ */}
          <motion.div
            custom={2}
            variants={fadeSlideUp}
            className="relative flex items-center justify-center"
          >
            <div
              className="absolute inset-0 rounded-3xl blur-3xl opacity-20"
              style={{
                background: `radial-gradient(circle at center, ${candle.color}50, transparent 70%)`,
              }}
            />

            <div
              className="relative rounded-2xl overflow-hidden border-[1px] transition-all duration-700 group
                         shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              style={{ borderColor: `${candle.color}30` }}
            >
              <div className="absolute inset-0 border-[8px] border-black/20 pointer-events-none z-10" />
              
              <motion.img
                src={candle.image || candle.image_url}
                alt={title}
                className="w-full h-[400px] md:h-[500px] object-cover"
                loading="lazy"
                decoding="async"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />

              <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                  background: `linear-gradient(to top, ${candle.color}30, transparent 40%, transparent 60%, ${candle.color}10)`,
                }}
              />

              <div
                className="absolute top-4 left-4 w-8 h-8 border-t-[1px] border-l-[1px] z-20 transition-all duration-500 group-hover:top-2 group-hover:left-2"
                style={{ borderColor: candle.color }}
              />
              <div
                className="absolute bottom-4 right-4 w-8 h-8 border-b-[1px] border-r-[1px] z-20 transition-all duration-500 group-hover:bottom-2 group-hover:right-2"
                style={{ borderColor: candle.color }}
              />
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* ── Bottom ornament ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
        {categories.map((c) => (
          <motion.div
            key={c.id}
            className="w-1.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer"
            style={{
              backgroundColor: activeCategory === c.id ? c.color : '#333',
            }}
            animate={
              activeCategory === c.id
                ? {
                    boxShadow: [
                      `0 0 2px ${c.color}40`,
                      `0 0 8px ${c.color}80`,
                      `0 0 2px ${c.color}40`,
                    ],
                  }
                : {}
            }
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </motion.main>
  );
};

export default ContentDisplay;
