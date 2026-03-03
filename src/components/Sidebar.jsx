import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import LanguageSwitcher from './LanguageSwitcher';

const Sidebar = ({ activeCategory, onCategoryChange, isExpanded, onExpandChange, isMobile }) => {
  const { t } = useTranslation();
  const { theme, toggleTheme, categories } = useAppContext();

  return (
    <motion.aside
      id="sidebar"
      className={`fixed top-20 z-40 flex flex-col bg-mystic-black transition-all duration-300 shadow-xl
                 ${isMobile ? 'right-0 border-l border-mystic-red/15' : 'left-0 border-r border-mystic-red/15'}`}
      style={{ height: 'calc(100vh - 5rem)' }}
      initial={false}
      animate={{ 
        x: isMobile ? (isExpanded ? 0 : '100%') : 0,
        width: isMobile ? 320 : (isExpanded ? 340 : 100) 
      }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      onMouseEnter={() => !isMobile && onExpandChange(true)}
      onMouseLeave={() => !isMobile && onExpandChange(false)}
    >

      {/* ── Section Label ── */}
      <AnimatePresence>
        {(isExpanded || isMobile) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-8 pt-8 pb-4"
          >
            <span className="text-[10px] tracking-[0.3em] font-semibold uppercase text-mystic-red/70">
              {t('sidebar.categories')}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Candle Navigation ── */}
      <nav className={`flex-1 flex flex-col gap-3 overflow-y-auto scrollbar-thin ${(!isExpanded && !isMobile) ? 'pt-10' : ''}`}>
        {categories.map((candle) => {
          const isActive = activeCategory === candle.id;

          return (
            <motion.button
              key={candle.id}
              id={`nav-${candle.id}`}
              onClick={() => onCategoryChange(candle.id)}
              className={`
                relative flex items-center gap-4 mx-4 px-4 py-3 rounded-lg
                transition-colors duration-300 cursor-pointer group
                ${isActive
                  ? 'text-mystic-white'
                  : 'text-mystic-gray-muted hover:text-mystic-white'
                }
              `}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Active background */}
              {isActive && (
                <motion.div
                  layoutId="activeCandleNav"
                  className="absolute inset-0 rounded-xl border border-mystic-red/30"
                  style={{ backgroundColor: `${candle.color}20` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              {/* Color dot */}
              <span className="relative z-10 flex items-center justify-center w-8 h-8 shrink-0">
                <motion.span
                  className="block w-3.5 h-3.5 rounded-full ring-1 ring-mystic-red/20 shadow-sm"
                  style={{ backgroundColor: candle.color }}
                  animate={isActive ? {
                    boxShadow: [
                      `0 0 6px ${candle.color}66`,
                      `0 0 16px ${candle.color}99`,
                      `0 0 6px ${candle.color}66`,
                    ],
                  } : {}}
                  transition={isActive ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
                />
              </span>

              {/* Label */}
              <AnimatePresence>
                {(isExpanded || isMobile) && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="relative z-10 text-base font-medium tracking-wide whitespace-nowrap"
                  >
                    {t(`candles.${candle.id}.label`, candle.id)}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Hover glow line */}
              <motion.div
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-0 rounded-full opacity-0
                           group-hover:h-8 group-hover:opacity-100 transition-all duration-300"
                style={{ backgroundColor: candle.color }}
              />
            </motion.button>
          );
        })}

        {/* ── Additional Pages (Mobile only) ── */}
        {isMobile && (
          <>
            <div className="my-2 border-t border-mystic-red/10 mx-6 shrink-0" />
            
            {[
              { id: 'about', icon: '👤', color: '#BDBDBD', labelKey: 'about.title' },
              { id: 'poll', icon: '🔮', color: '#BDBDBD', labelKey: 'poll.title' }
            ].map((page) => {
              const isActive = activeCategory === page.id;

              return (
                <motion.button
                  key={page.id}
                  onClick={() => onCategoryChange(page.id)}
                  className={`
                    relative flex items-center gap-4 mx-4 px-4 py-3 rounded-lg
                    transition-colors duration-300 cursor-pointer group shrink-0
                    ${isActive
                      ? 'text-mystic-white'
                      : 'text-mystic-gray-muted hover:text-mystic-white'
                    }
                  `}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Active background */}
                  {isActive && (
                    <motion.div
                      layoutId="activeCandleNav"
                      className="absolute inset-0 rounded-xl border border-mystic-white/20"
                      style={{ backgroundColor: `${page.color}15` }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}

                  {/* Icon */}
                  <span className="relative z-10 flex items-center justify-center w-8 h-8 shrink-0 text-xl">
                    <span className={isActive ? 'text-mystic-white' : 'text-mystic-gray-muted group-hover:text-mystic-white'}>
                      {page.icon}
                    </span>
                  </span>

                  {/* Label */}
                  <span className="relative z-10 text-base font-medium tracking-wide whitespace-nowrap">
                    {page.id === 'about' ? t('about.title') : t('poll.title')}
                  </span>
                </motion.button>
              );
            })}
          </>
        )}
        {/* ── Mobile Controls (Theme & Lang) ── */}
        {isMobile && (
          <div className="mt-auto p-6 flex flex-col gap-6 bg-mystic-red/5 border-t border-mystic-red/10">
            <div className="flex items-center justify-between">
              <span className="text-xs tracking-widest uppercase text-mystic-gray-muted font-medium">
                {t('sidebar.appearance', 'Appearance')}
              </span>
              <div 
                onClick={toggleTheme}
                className="flex items-center gap-3 px-4 py-2 rounded-full border border-mystic-red/15 bg-mystic-gray/20 text-mystic-white cursor-pointer hover:border-mystic-red/40 transition-all active:scale-95"
              >
                <span className="text-lg">{theme === 'dark' ? '🌙' : '☀️'}</span>
                <span className="text-xs font-medium uppercase tracking-wider">
                  {theme === 'dark' ? t('buttons.darkMode', 'Dark') : t('buttons.lightMode', 'Light')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs tracking-widest uppercase text-mystic-gray-muted font-medium">
                {t('sidebar.language', 'Language')}
              </span>
              <LanguageSwitcher direction="up" />
            </div>
          </div>
        )}
      </nav>
    </motion.aside>
  );
};

export default Sidebar;
