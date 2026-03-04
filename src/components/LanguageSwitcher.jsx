import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const languages = [
  { 
    code: 'ru', 
    label: 'Русский', 
    short: 'RU',
    flag: (
      <svg className="w-5 h-5 rounded-sm object-cover" viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
        <g fillRule="evenodd" strokeWidth="1pt">
          <path fill="#fff" d="M0 0h640v480H0z"/>
          <path fill="#0039a6" d="M0 160h640v320H0z"/>
          <path fill="#d52b1e" d="M0 320h640v160H0z"/>
        </g>
      </svg>
    )
  },
  { 
    code: 'en', 
    label: 'English', 
    short: 'EN',
    flag: (
      <svg className="w-5 h-5 rounded-sm object-cover" viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
        <path fill="#012169" d="M0 0h640v480H0z"/>
        <path d="m75 0 245 180L565 0h75v45L413 240l227 195v45h-75L320 300 75 480H0v-45l227-195L0 45V0h75z" fill="#fff"/>
        <path d="m424 281 216 159v40L369 281h55zM216 199 0 41v40l161 118H216zM0 439l216-158h55L55 439H0zM640 41 424 199h55l161-118V41z" fill="#c8102e"/>
        <path d="M240 0v480h160V0H240zM0 160v160h640V160H0z" fill="#fff"/>
        <path d="M280 0v480h80V0h-80zM0 200v80h640v-80H0z" fill="#c8102e"/>
      </svg>
    )
  },
];

const LanguageSwitcher = ({ direction = 'down' }) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  const switchLanguage = (code) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer
                   bg-mystic-gray/20 border border-mystic-red/15 backdrop-blur-md
                   hover:bg-mystic-gray/30 hover:border-mystic-red/40 transition-all duration-300 group shadow-lg"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label={i18n.language === 'ru' ? 'Сменить язык' : 'Change language'}
        aria-expanded={isOpen}
      >
        <div className="relative flex items-center justify-center w-5 h-5 overflow-hidden rounded-full ring-1 ring-mystic-red/10" aria-hidden="true">
          {currentLang.flag}
        </div>
        
        <span className="text-xs font-semibold tracking-wider text-mystic-white/90 group-hover:text-white transition-colors">
          {currentLang.short}
        </span>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="text-[9px] text-mystic-gray-muted group-hover:text-mystic-red"
          aria-hidden="true"
        >
          <svg width="8" height="5" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop to close when clicking outside */}
            <div 
              className="fixed inset-0 z-[55] cursor-default bg-transparent" 
              onClick={() => setIsOpen(false)} 
            />
            
            <motion.div
              id="language-dropdown"
              role="listbox"
              initial={{ 
                opacity: 0, 
                y: direction === 'up' ? -15 : 15, 
                scale: 0.9, 
                filter: 'blur(10px)' 
              }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ 
                opacity: 0, 
                y: direction === 'up' ? -10 : 10, 
                scale: 0.9, 
                filter: 'blur(10px)' 
              }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className={`absolute right-0 ${direction === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'} 
                         p-1 w-36 overflow-hidden rounded-xl
                         bg-mystic-gray-light/95 border border-mystic-red/15 backdrop-blur-2xl
                         shadow-2xl shadow-black/20 z-[60]`}
            >
              {languages.map((lang) => {
                const isActive = i18n.language === lang.code;

                return (
                  <motion.button
                    key={lang.code}
                    onClick={() => switchLanguage(lang.code)}
                    role="option"
                    aria-selected={isActive}
                    aria-label={lang.label}
                    className={`
                      w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer
                      transition-all duration-300 mb-0.5 last:mb-0
                      ${isActive
                        ? 'bg-mystic-red/15 text-mystic-white font-semibold'
                        : 'text-mystic-gray-muted hover:bg-mystic-gray/20 hover:text-mystic-white'
                      }
                    `}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center justify-center w-5 h-5 overflow-hidden rounded-full shrink-0 shadow-inner" aria-hidden="true">
                      {lang.flag}
                    </div>
                    
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-xs font-medium">{lang.label}</span>
                    </div>

                    {isActive && (
                      <motion.div
                        layoutId="activeLangDot"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-mystic-red shadow-[0_0_8px_rgba(211,47,47,0.8)]"
                      />
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
