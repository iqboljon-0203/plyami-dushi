import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const AboutMe = ({ sidebarExpanded, isMobile, onOpenBooking }) => {
  const { t, i18n } = useTranslation();
  const [content, setContent] = useState(null);
  const lang = i18n.language === 'ru' ? 'ru' : 'en';

  useEffect(() => {
    supabase.from('about_content').select('*').single()
      .then(({ data }) => setContent(data));
  }, []);

  const stats = [
    { key: 'years', value: content?.stat_years_value || '15+' },
    { key: 'rituals', value: content?.stat_rituals_value || '2,000+' },
    { key: 'clients', value: content?.stat_clients_value || '500+' },
  ];

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
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-mystic-red/5 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-5xl">
        {/* ── Decorative top line ── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="flex items-center gap-4 mb-16"
        >
          <motion.div custom={0} variants={fadeUp} className="h-[1px] w-16 bg-mystic-red/30" />
          <motion.span custom={0} variants={fadeUp} className="text-[10px] tracking-[0.4em] uppercase text-mystic-red/60">
            {content?.[`subtitle_${lang}`] || t('about.subtitle')}
          </motion.span>
          <motion.div custom={0} variants={fadeUp} className="h-[1px] flex-1 bg-mystic-red/10" />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
        >
          {/* ═══ Left — Title & Description ═══ */}
          <div>
            {/* Big serif title */}
            <motion.h2
              custom={1}
              variants={fadeUp}
              className="font-heading text-5xl md:text-6xl lg:text-7xl text-mystic-white leading-tight mb-3 text-glow"
            >
              {content?.[`title_${lang}`] || t('brand')}
            </motion.h2>

            <motion.p
              custom={2}
              variants={fadeUp}
              className="text-mystic-red text-sm tracking-[0.3em] uppercase mb-8"
            >
              {content?.[`subtitle_${lang}`] || t('about.subtitle')}
            </motion.p>

            <motion.p
              custom={3}
              variants={fadeUp}
              className="text-mystic-gray-muted text-base md:text-lg leading-relaxed mb-10 max-w-md"
            >
              {content?.[`description_${lang}`] || t('about.description')}
            </motion.p>

            {/* CTA */}
            <motion.button
              custom={4}
              variants={fadeUp}
              onClick={onOpenBooking}
              id="about-contact-btn"
              className="group relative px-8 py-3 border border-mystic-red/40 text-mystic-red text-sm tracking-widest uppercase
                         overflow-hidden transition-all duration-500 cursor-pointer rounded-sm
                         hover:border-mystic-red hover:text-mystic-white"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10">{t('buttons.contactUs')}</span>
              <motion.div
                className="absolute inset-0 bg-mystic-red origin-left"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              />
            </motion.button>
          </div>

          {/* ═══ Right — Stats Cards ═══ */}
          <div className="flex flex-col gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.key}
                custom={index + 2}
                variants={fadeUp}
                className="relative p-6 rounded-xl border border-mystic-red/10 bg-mystic-gray/30
                           backdrop-blur-sm hover:border-mystic-red/30 transition-all duration-500 group"
                whileHover={{ x: 8 }}
              >
                {/* Glow accent */}
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-mystic-red/50 to-transparent rounded-l-xl
                                opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="flex items-baseline gap-4">
                  <span className="font-heading text-4xl md:text-5xl text-mystic-red text-glow">
                    {stat.value}
                  </span>
                  <span className="text-mystic-gray-muted text-sm tracking-wide">
                    {t(`about.${stat.key}`)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Bottom decorative line ── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex items-center gap-4 mt-20"
        >
          <motion.div custom={0} variants={fadeUp} className="h-[1px] flex-1 bg-mystic-red/10" />
          <motion.div custom={0} variants={fadeUp}>
            <div className="w-2 h-2 rounded-full bg-mystic-red/30" />
          </motion.div>
          <motion.div custom={0} variants={fadeUp} className="h-[1px] flex-1 bg-mystic-red/10" />
        </motion.div>
      </div>
    </motion.section>
  );
};

export default AboutMe;
