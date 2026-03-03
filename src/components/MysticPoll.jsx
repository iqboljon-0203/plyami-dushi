import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const MysticPoll = ({ sidebarExpanded, isMobile }) => {
  const { t } = useTranslation();
  const [voted, setVoted] = useState(false);
  const [choice, setChoice] = useState(null);
  const [yesCount, setYesCount] = useState(73);
  const [noCount, setNoCount] = useState(12);

  const total = yesCount + noCount;
  const yesPercent = Math.round((yesCount / total) * 100);
  const noPercent = 100 - yesPercent;

  const handleVote = (answer) => {
    if (voted) return;
    setChoice(answer);
    if (answer === 'yes') setYesCount((c) => c + 1);
    else setNoCount((c) => c + 1);
    setVoted(true);
  };

  return (
    <motion.section
      id="mystic-poll"
      className="relative min-h-screen py-24 px-6 md:px-10 flex items-center justify-center"
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
      <div className="relative w-full max-w-2xl">
        {/* ── Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative p-10 md:p-14 rounded-2xl border border-mystic-red/15 bg-mystic-gray/20 backdrop-blur-sm overflow-hidden text-center"
        >
          {/* Ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-mystic-red/8 blur-[80px] pointer-events-none" />

          {/* Icon */}
          <motion.div
            className="text-4xl mb-6"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            🔮
          </motion.div>

          {/* Question */}
          <h3 className="font-heading text-2xl md:text-3xl text-mystic-white text-glow mb-3">
            {t('poll.question')}
          </h3>
          <p className="text-mystic-gray-muted text-sm mb-10 max-w-md mx-auto">
            {t('poll.subtitle')}
          </p>

          <AnimatePresence mode="wait">
            {!voted ? (
              /* ── Voting Buttons ── */
              <motion.div
                key="buttons"
                className="flex justify-center gap-5"
                exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
              >
                <motion.button
                  id="poll-yes"
                  onClick={() => handleVote('yes')}
                  className="relative px-10 py-3 rounded-lg border border-mystic-red/30 text-mystic-red text-sm font-medium
                             tracking-widest uppercase cursor-pointer overflow-hidden transition-all duration-300
                             hover:border-mystic-red hover:text-mystic-white hover:bg-mystic-red/20"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10">✦ {t('poll.yes')}</span>
                </motion.button>

                <motion.button
                  id="poll-no"
                  onClick={() => handleVote('no')}
                  className="relative px-10 py-3 rounded-lg border border-mystic-gray-muted/30 text-mystic-gray-muted text-sm font-medium
                             tracking-widest uppercase cursor-pointer overflow-hidden transition-all duration-300
                             hover:border-mystic-white/40 hover:text-mystic-white hover:bg-mystic-gray-light/30"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10">✧ {t('poll.no')}</span>
                </motion.button>
              </motion.div>
            ) : (
              /* ── Success Results ── */
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="space-y-6"
              >
                {/* Success burst */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
                  className="text-center mb-6"
                >
                  <motion.span
                    className="inline-block text-5xl"
                    animate={{
                      textShadow: [
                        '0 0 10px rgba(211,47,47,0.3)',
                        '0 0 30px rgba(211,47,47,0.7)',
                        '0 0 10px rgba(211,47,47,0.3)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {choice === 'yes' ? '🔥' : '🌙'}
                  </motion.span>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="font-heading text-lg text-mystic-white mt-3"
                  >
                    {t('poll.thanks')}
                  </motion.p>
                </motion.div>

                {/* Yes bar */}
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className={choice === 'yes' ? 'text-mystic-red font-medium' : 'text-mystic-gray-muted'}>
                      ✦ {t('poll.yes')}
                    </span>
                    <span className="text-mystic-gray-muted">{yesPercent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-mystic-gray-light overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-mystic-red to-mystic-red-light"
                      initial={{ width: 0 }}
                      animate={{ width: `${yesPercent}%` }}
                      transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* No bar */}
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className={choice === 'no' ? 'text-mystic-white font-medium' : 'text-mystic-gray-muted'}>
                      ✧ {t('poll.no')}
                    </span>
                    <span className="text-mystic-gray-muted">{noPercent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-mystic-gray-light overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-mystic-gray-muted to-mystic-gray-light"
                      initial={{ width: 0 }}
                      animate={{ width: `${noPercent}%` }}
                      transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Total votes */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-mystic-gray-muted/50 text-xs text-center pt-2"
                >
                  {total} {t('poll.totalVotes')}
                </motion.p>

                {/* Floating particle effects on success */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-mystic-red"
                    style={{
                      left: `${30 + Math.random() * 40}%`,
                      top: '50%',
                    }}
                    initial={{ opacity: 1, y: 0, scale: 1 }}
                    animate={{
                      opacity: 0,
                      y: -(80 + Math.random() * 120),
                      x: (Math.random() - 0.5) * 100,
                      scale: 0,
                    }}
                    transition={{
                      duration: 1.5 + Math.random(),
                      delay: 0.1 * i,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default MysticPoll;
