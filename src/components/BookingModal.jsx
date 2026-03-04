import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import candles from '../data/candles';

const BookingModal = ({ isOpen, onClose, initialCategory = 'red' }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    fullName: '',
    category: initialCategory,
    phone: '+998 '
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

    const message = `
🌟 *Новая заявка: ПЛАМЯ ДУШИ*

👤 *Имя:* ${formData.fullName}
🔥 *Категория:* ${t(`candles.${formData.category}.label`)}
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
          setFormData({ fullName: '', category: initialCategory, phone: '+998 ' });
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

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-[10px] tracking-[0.2em] uppercase text-mystic-red mb-2 font-bold">
                      {t('modal.fullName', 'Имя и Фамилия')}
                    </label>
                    <input
                      id="fullName"
                      required
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-mystic-white focus:outline-none focus:border-mystic-red/50 transition-colors"
                      placeholder={t('modal.placeholderName', 'Алишер Каримов')}
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    />
                  </div>

                  {/* Category Selection */}
                  <div>
                    <label htmlFor="category" className="block text-[10px] tracking-[0.2em] uppercase text-mystic-red mb-2 font-bold">
                      {t('modal.category', 'Выберите категорию')}
                    </label>
                    <select
                      id="category"
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-mystic-white focus:outline-none focus:border-mystic-red/50 transition-colors cursor-pointer appearance-none"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      {candles.map(c => (
                        <option key={c.id} value={c.id}>
                          {t(`candles.${c.id}.label`)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label htmlFor="phone" className="block text-[10px] tracking-[0.2em] uppercase text-mystic-red mb-2 font-bold">
                      {t('modal.phone', 'Номер телефона')}
                    </label>
                    <input
                      id="phone"
                      required
                      type="tel"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-mystic-white focus:outline-none focus:border-mystic-red/50 transition-colors"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-lg bg-mystic-red text-mystic-white font-bold tracking-[0.2em] uppercase text-xs shadow-lg shadow-mystic-red/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden relative group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10">
                      {isSubmitting ? t('modal.sending', 'Отправка...') : t('modal.submit', 'Отправить запрос')}
                    </span>
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </motion.button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;
