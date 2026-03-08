import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

const BookingModal = ({ isOpen, onClose, initialCategory = '' }) => {
  const { t, i18n } = useTranslation();
  const { categories } = useAppContext();

  const [formData, setFormData] = useState({
    fullName: '',
    category: '',
    phone: '+'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Find valid category ID to pre-select
      const validInitial = categories.find(c => c.id === initialCategory);
      const defaultId = validInitial ? initialCategory : (categories.length > 0 ? categories[0].id : '');
      
      setFormData(prev => ({
        ...prev,
        category: defaultId,
        phone: prev.phone === '+' || !prev.phone ? '+' : prev.phone
      }));
    }
  }, [isOpen, initialCategory, categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

    const selectedCat = categories.find(c => c.id === formData.category);
    const langKey = i18n.language === 'ru' ? 'ru' : 'en';
    const catLabel = selectedCat?.dbData?.[`label_${langKey}`] || t(`candles.${formData.category}.label`, formData.category);

    const message = `
🌟 *Новая заявка: ПЛАМЯ ДУШИ*

👤 *Имя:* ${formData.fullName}
🔥 *Категория:* ${catLabel}
📞 *Телефон:* ${formData.phone}

---
🏘 _Заявка отправлена с сайта_
    `;

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown'
        })
      });

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          onClose();
          setIsSuccess(false);
          const defaultId = categories.length > 0 ? categories[0].id : '';
          setFormData({ fullName: '', category: defaultId, phone: '+' });
        }, 2500);
      } else {
        console.error('Telegram API error:', await response.text());
        alert('Ошибка при отправке. Пожалуйста, попробуйте позже.');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      alert('Проблема с сетью. Проверьте подключение.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-mystic-black/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-mystic-red/20 bg-mystic-gray/90 p-8 shadow-2xl backdrop-blur-xl"
          >
            {/* Ambient Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-mystic-red/10 blur-[60px] rounded-full pointer-events-none" />
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-mystic-gray-muted hover:text-mystic-white transition-colors cursor-pointer"
              aria-label={t('buttons.close', 'Close')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="text-5xl mb-6" aria-hidden="true">🔥</div>
                <h3 className="font-heading text-2xl text-mystic-white mb-2">
                  {t('modal.successTitle', 'Заявка принята')}
                </h3>
                <p className="text-mystic-gray-muted">
                  {t('modal.successDesc', 'Мы свяжемся с вами в ближайшее время.')}
                </p>
              </motion.div>
            ) : (
              <>
                <h2 className="font-heading text-3xl text-mystic-white mb-2 text-glow">
                  {t('modal.title', 'Оставить заявку')}
                </h2>
                <p className="text-mystic-gray-muted text-sm mb-8">
                  {t('modal.subtitle', 'Заполните форму, и мы поможем вам выбрать идеальную свечу.')}
                </p>

                <div className="space-y-4">
                  {/* Phone */}
                  <a href="tel:+79175021584" className="flex items-center gap-4 bg-white/5 border border-white/10 hover:border-mystic-red/30 rounded-xl p-4 transition-all group">
                    <div className="w-10 h-10 rounded-full bg-mystic-red/10 flex items-center justify-center shrink-0 group-hover:bg-mystic-red/20 transition-colors">
                      <svg className="w-5 h-5 text-mystic-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[10px] tracking-widest text-mystic-gray-muted uppercase mb-1">
                        {t('contact.phone', 'Номер телефона')}
                      </div>
                      <div className="text-xl text-mystic-white font-medium group-hover:text-mystic-red transition-colors">
                        +7 (917) 502-15-84
                      </div>
                    </div>
                  </a>

                  {/* Email */}
                  <a href="mailto:Irodianahell@gmail.com" className="flex items-center gap-4 bg-white/5 border border-white/10 hover:border-mystic-red/30 rounded-xl p-4 transition-all group">
                    <div className="w-10 h-10 rounded-full bg-mystic-red/10 flex items-center justify-center shrink-0 group-hover:bg-mystic-red/20 transition-colors">
                      <svg className="w-5 h-5 text-mystic-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[10px] tracking-widest text-mystic-gray-muted uppercase mb-1">
                        {t('contact.email', 'Email (Связь со мной)')}
                      </div>
                      <div className="text-lg text-mystic-white font-medium group-hover:text-mystic-red transition-colors">
                        Irodianahell@gmail.com
                      </div>
                    </div>
                  </a>

                  {/* Telegram */}
                  <a href="https://t.me/Irodianahell666" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-white/5 border border-white/10 hover:border-mystic-red/30 rounded-xl p-4 transition-all group">
                    <div className="w-10 h-10 rounded-full bg-mystic-red/10 flex items-center justify-center shrink-0 group-hover:bg-mystic-red/20 transition-colors">
                      <svg className="w-5 h-5 text-mystic-red ml-[-2px]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-[10px] tracking-widest text-mystic-gray-muted uppercase mb-1">
                        {t('contact.telegram', 'Telegram')}
                      </div>
                      <div className="text-lg text-mystic-white font-medium group-hover:text-mystic-red transition-colors">
                        @Irodianahell666
                      </div>
                    </div>
                  </a>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;
