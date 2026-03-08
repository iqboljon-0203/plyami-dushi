import { useState, lazy, Suspense, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabase';
import useMediaQuery from './hooks/useMediaQuery';
import SmokeBackground from './components/SmokeBackground';
import Sidebar from './components/Sidebar';
import ContentDisplay from './components/ContentDisplay';
import Navbar from './components/Navbar';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AboutMe from './components/AboutMe';
import MysticPoll from './components/MysticPoll';
import BookingModal from './components/BookingModal';
import { Toaster } from 'react-hot-toast';

// Lazy load admin routes to shrink initial bundle
const LoginPage = lazy(() => import('./pages/LoginPage'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

const LoadingFallback = () => (
  <div className="min-h-screen bg-mystic-black flex items-center justify-center text-mystic-red">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="text-4xl"
    >
      🔮
    </motion.div>
  </div>
);

function App() {
  const [activeCategory, setActiveCategory] = useState('about');
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  
  const isLargeScreen = useMediaQuery('(min-width: 1024px)');
  const isMobile = useMediaQuery('(max-width: 1023px)');

  // On large screens, sidebar is always open. Otherwise, it depends on hover or mobile menu state
  const sidebarExpanded = isLargeScreen || hoverExpanded || mobileMenuOpen;

  // Detect subdomain for admin access
  const hostname = window.location.hostname;
  const isAdminSubdomain = hostname.startsWith('admin.') || hostname.startsWith('www.admin.');

  useEffect(() => {
    const logVisit = async () => {
      // Don't track if on admin subdomain or if already tracked in this session
      if (isAdminSubdomain || sessionStorage.getItem('visited_session')) return;
      
      try {
        const { error } = await supabase.from('site_visits').insert([{ 
          user_agent: navigator.userAgent,
          path: window.location.pathname
        }]);
        
        // If successful, or if table doesn't exist yet (we'll silently ignore), mark as visited
        sessionStorage.setItem('visited_session', 'true');
      } catch (err) {
        console.error('Visit logging error:', err);
      }
    };

    logVisit();
  }, [isAdminSubdomain]);

  const MainLayout = () => (
    <div id="app-root" className="relative min-h-screen bg-mystic-black">
      {/* Smoke / fog background effect */}
      <SmokeBackground />

      {/* Top Navbar */}
      <Navbar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        sidebarExpanded={sidebarExpanded}
        isMobile={isMobile}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      
      {/* Mobile Menu Backdrop Overlay */}
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-mystic-black/60 backdrop-blur-sm z-30"
          />
        )}
      </AnimatePresence>
      
      {/* Fixed sidebar navigation */}
      <Sidebar
        activeCategory={activeCategory}
        onCategoryChange={(cat) => {
          setActiveCategory(cat);
          setMobileMenuOpen(false); // Close on selection
        }}
        isExpanded={sidebarExpanded}
        onExpandChange={setHoverExpanded}
        isMobile={isMobile}
      />

      {/* Dynamic content area */}
      <AnimatePresence mode="wait">
        {activeCategory === 'about' && (
          <AboutMe 
            key="about" 
            sidebarExpanded={sidebarExpanded} 
            isMobile={isMobile} 
            onOpenBooking={() => setIsBookingOpen(true)}
          />
        )}
        {activeCategory === 'poll' && (
          <MysticPoll key="poll" sidebarExpanded={sidebarExpanded} isMobile={isMobile} />
        )}
        {activeCategory !== 'about' && activeCategory !== 'poll' && (
          <ContentDisplay
            key="candles"
            activeCategory={activeCategory}
            sidebarExpanded={sidebarExpanded}
            isMobile={isMobile}
            onOpenBooking={() => setIsBookingOpen(true)}
          />
        )}
      </AnimatePresence>

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        initialCategory={activeCategory}
      />
    </div>
  );

  if (isAdminSubdomain) {
    return (
      <>
        <Toaster position="top-center" reverseOrder={false} />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
            {/* Support legacy /admin path even on subdomain */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Suspense>
      </>
    );
  }

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<MainLayout />} />
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
