import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useStockContext } from '../context/StockContext';
import SearchBar from './SearchBar';
import SignInModal from './SignInModal';
import { LayoutDashboard, Search, Moon, Sun, Menu, X, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function Header() {
  const { theme, toggleTheme } = useTheme();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  
  // Prevent duplicate headers
  const [alreadyRendered, setAlreadyRendered] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    // Check for multiple header elements in a proper way
    const checkForDuplicateHeaders = () => {
      const headers = document.querySelectorAll('header');
      // If we find more than one header and ours is not the first one, don't render
      if (headers.length > 1 && headerRef.current) {
        // Check if our header isn't the first one
        if (headers[0] !== headerRef.current) {
          setAlreadyRendered(true);
        }
      }
    };
    
    // Use a small delay to let the DOM update
    const timeoutId = setTimeout(checkForDuplicateHeaders, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);
  
  // Skip rendering if already rendered elsewhere
  if (alreadyRendered) {
    return null;
  }

  const openSignInModal = () => {
    setIsSignInModalOpen(true);
  };

  const closeSignInModal = () => {
    setIsSignInModalOpen(false);
  };

  return (
    <>
      <motion.header 
        ref={headerRef}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`sticky top-0 z-40 ${theme === 'dark' 
          ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900' 
          : 'bg-gradient-to-r from-white via-blue-50 to-white'} 
          backdrop-blur-lg border-b ${theme === 'dark' ? 'border-indigo-900/40' : 'border-blue-100'} 
          shadow-lg shadow-black/5`}
      >
        {/* Premium gradient line on top */}
        <div className="h-0.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600"></div>
        
        <div className="px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-sm opacity-30 rounded-full"></div>
                <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-lg relative">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <h1 className="text-xl font-bold flex items-center">
                  StockVision 
                  <motion.span 
                    className="text-xs font-semibold ml-2 px-1.5 py-0.5 rounded bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 500 }}
                  >
                    BETA
                  </motion.span>
                </h1>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="hidden md:flex flex-1 mx-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <SearchBar className="max-w-xl w-full mx-auto backdrop-blur-sm bg-white/10 dark:bg-slate-800/30 border border-white/20 dark:border-slate-700/30 rounded-xl" />
            </motion.div>
            
            <div className="flex items-center space-x-3">
              <motion.button 
                onClick={() => setIsSearchOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-white/10 dark:hover:bg-slate-800/40 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Search className="h-5 w-5" />
              </motion.button>
              
              <motion.button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-white/10 dark:hover:bg-slate-800/40 transition-colors"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-yellow-400" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </motion.button>
              
              <motion.button 
                onClick={openSignInModal}
                className="px-4 py-1.5 text-sm rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign In
              </motion.button>
              
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-white/10 dark:hover:bg-slate-800/40 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
        
        {/* Mobile search overlay */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div 
              className="fixed inset-0 bg-slate-900/95 z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex justify-end mb-4">
                <motion.button 
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/5"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
              <SearchBar onClose={() => setIsSearchOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              className="md:hidden py-4 px-4 border-t border-white/10"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <nav className="space-y-3">
                {['Dashboard', 'Portfolio', 'Watchlist', 'News'].map((item, index) => (
                  <motion.a 
                    key={item}
                    href="#"
                    className="block py-2 px-3 rounded-lg hover:bg-white/5 transition-colors"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 5, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    {item}
                  </motion.a>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Sign In Modal */}
      <SignInModal isOpen={isSignInModalOpen} onClose={closeSignInModal} />
    </>
  );
}

export default Header;