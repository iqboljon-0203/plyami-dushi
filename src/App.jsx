import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useMediaQuery from './hooks/useMediaQuery';
import SmokeBackground from './components/SmokeBackground';
import Sidebar from './components/Sidebar';
import ContentDisplay from './components/ContentDisplay';
import Navbar from './components/Navbar';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import AdminPanel from './pages/AdminPanel';
import AboutMe from './components/AboutMe';
import MysticPoll from './components/MysticPoll';
import BookingModal from './components/BookingModal';
import { Toaster } from 'react-hot-toast';

function App() {
  const [activeCategory, setActiveCategory] = useState('about');
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  
  const isLargeScreen = useMediaQuery('(min-width: 1024px)');
  const isMobile = useMediaQuery('(max-width: 1023px)');

  // On large screens, sidebar is always open. Otherwise, it depends on hover or mobile menu state
  const sidebarExpanded = isLargeScreen || hoverExpanded || mobileMenuOpen;

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

  // Detect subdomain for admin access
  const isAdminSubdomain = window.location.hostname.startsWith('admin.');

  if (isAdminSubdomain) {
    return (
      <>
        <Toaster position="top-center" reverseOrder={false} />
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
      </>
    );
  }

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
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
    </>
  );
}

export default App;
