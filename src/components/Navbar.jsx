import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { useAppContext } from '../context/AppContext';

const Navbar = ({ activeCategory, onCategoryChange, sidebarExpanded, isMobile, mobileMenuOpen, setMobileMenuOpen }) => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useAppContext();

  const navItems = [
    { id: 'about', labelKey: 'about.title' },
    { id: 'poll', labelKey: 'poll.title' }
  ];

  return (
    <motion.nav
      className="fixed top-0 left-0 w-full h-20 z-50 bg-mystic-black/40 backdrop-blur-md border-b border-mystic-red/10 transition-all duration-300"
    >
      <div className="w-full h-full flex items-center justify-between relative px-5">
      {/* ── Left side: Hamburger & Logo ── */}
      <div className="flex items-center gap-3">
        {/* Logo */}
        <motion.div
          className="cursor-pointer flex items-center justify-center p-1"
          whileHover={{ scale: 1.1, rotate: [-5, 5, -5, 5, 0] }}
          transition={{ duration: 0.5 }}
          onClick={() => onCategoryChange('red')}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="drop-shadow-[0_0_15px_rgba(211,47,47,0.8)]" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.999 1.636C11.999 1.636 5.518 7.37 5.518 13.06c0 3.75 2.923 6.816 6.55 6.816 3.627 0 6.549-3.066 6.549-6.816 0-5.69-6.618-11.424-6.618-11.424ZM12.068 18.067c-1.928 0-3.515-1.63-3.515-3.613 0-1.87 1.666-4.045 3.515-5.91 1.849 1.865 3.515 4.04 3.515 5.91 0 1.983-1.587 3.613-3.515 3.613Z" fill="url(#flame_grad)"/>
            <defs>
              <linearGradient id="flame_grad" x1="12" y1="2" x2="12" y2="20" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FDE047" />
                <stop offset="0.4" stopColor="#EF4444" />
                <stop offset="1" stopColor="#991B1B" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
        
        {/* Brand Text */}
        <span className="font-brand text-[20px] sm:text-[24px] md:text-[30px] font-bold tracking-wide text-mystic-white whitespace-nowrap drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] select-none">
          {t('brand')}
        </span>
      </div>

      {/* ── Center: Navigation Links (Desktop only) ── */}
      <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-8">
        {navItems.map((item) => {
          const isActive = activeCategory === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onCategoryChange(item.id)}
              className={`relative py-2 text-sm font-medium tracking-widest uppercase transition-all duration-300 cursor-pointer ${
                isActive
                  ? 'text-mystic-red text-glow'
                  : 'text-mystic-gray-muted hover:text-mystic-white'
              }`}
            >
              <span className="relative z-10">{t(item.labelKey)}</span>

              {/* Active underline */}
              {isActive && (
                <motion.div
                  layoutId="activeNavbarLine"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-mystic-red opacity-80"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Right side: Controls ── */}
      <div className="flex items-center gap-6">
        {/* Light / Dark Mode Switcher (Desktop only) */}
        <div 
          onClick={toggleTheme}
          className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full border border-mystic-red/15 bg-mystic-gray/20 text-mystic-gray-muted cursor-pointer hover:border-mystic-red/40 hover:text-mystic-white transition-all shadow-md active:scale-95"
          title={theme === 'dark' ? t('buttons.lightMode', 'Light Mode') : t('buttons.darkMode', 'Dark Mode')}
        >
          <motion.span 
            className="text-xl"
            initial={false}
            animate={{ rotate: theme === 'light' ? 180 : 0, scale: theme === 'light' ? 0.9 : 1 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </motion.span>
        </div>

        {/* Language Switcher (Desktop only) */}
        <div className="hidden lg:block">
          <LanguageSwitcher />
        </div>

        {/* Mobile Menu Icon (Right Side) */}
        <button
          className="lg:hidden text-mystic-white p-1 ml-4 focus:outline-none cursor-pointer"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>
      
      </div>
    </motion.nav>
  );
};

export default Navbar;
