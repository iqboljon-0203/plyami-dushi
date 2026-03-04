import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Load saved email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_admin_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRemember(true);
    }
  }, []);

  // Test connection on mount
  useEffect(() => {
    supabase.from('categories').select('id').limit(1)
      .then(({ data, error }) => {
        if (error) console.error('Connection Test Failed:', error);
      })
      .catch(err => console.error('Supabase fetch error:', err));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('YOUR_')) {
        throw new Error('Supabase URL is not configured in .env');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
      } else if (data.session) {
        // Save or clear email based on remember state
        if (remember) {
          localStorage.setItem('remembered_admin_email', email);
        } else {
          localStorage.removeItem('remembered_admin_email');
        }

        toast.success('Welcome back, Admin');
        navigate('/');
      }
    } catch (err) {
      toast.error('Connection failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mystic-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Mystical Background Decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-mystic-red/10 blur-[120px] rounded-full" aria-hidden="true" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md bg-mystic-gray/20 backdrop-blur-xl border border-mystic-red/15 rounded-2xl p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="text-4xl mb-4" aria-hidden="true">🔮</div>
          <h1 className="font-heading text-3xl text-mystic-white text-glow">Irodiana Admin</h1>
          <p className="text-mystic-gray-muted text-sm mt-2 font-medium tracking-widest uppercase">
            Access the Sanctum
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-[10px] tracking-[0.2em] uppercase text-mystic-red font-bold mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-mystic-white focus:outline-none focus:border-mystic-red/50 transition-all font-body"
              placeholder="admin@shamlar.uz"
              aria-label="Email address"
            />
          </div>

          <div>
            <label htmlFor="password" name="password" className="block text-[10px] tracking-[0.2em] uppercase text-mystic-red font-bold mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-mystic-white focus:outline-none focus:border-mystic-red/50 transition-all font-body"
              placeholder="••••••••"
              aria-label="Password"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="remember"
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded border-mystic-red/30 bg-white/5 text-mystic-red focus:ring-mystic-red/50 cursor-pointer"
            />
            <label htmlFor="remember" className="text-xs text-mystic-gray-muted cursor-pointer hover:text-mystic-white transition-colors">
              Remember me
            </label>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="submit"
            aria-label={loading ? 'Verifying credentials' : 'Login to Admin Panel'}
            className="w-full py-4 bg-mystic-red text-mystic-white font-bold tracking-[0.2em] uppercase text-xs rounded-lg shadow-lg shadow-mystic-red/20 disabled:opacity-50 transition-all cursor-pointer overflow-hidden relative group"
          >
            <span className="relative z-10">{loading ? 'Verifying...' : 'Login'}</span>
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
