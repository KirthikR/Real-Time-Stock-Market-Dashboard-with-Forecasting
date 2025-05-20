import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  
  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem('cookieConsent');
    if (!hasConsented) {
      // Delay showing the banner for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);
  
  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setIsVisible(false);
  };
  
  const handleReject = () => {
    // Set cookie consent to false, but still record the choice
    localStorage.setItem('cookieConsent', 'false');
    setIsVisible(false);
  };
  
  const handleClose = () => {
    setIsVisible(false);
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50"
        >
          <div className="glass-card rounded-xl p-4 shadow-xl border border-slate-700/20">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg">Cookie Preferences</h3>
              <button 
                onClick={handleClose}
                className="p-1 rounded-full hover:bg-slate-700/20"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-sm mb-4">
              Chrome is moving towards a new experience that allows users to browse without third-party cookies. 
              This site uses cookies to enhance your experience and analyze performance.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleReject}
                className="px-4 py-2 text-sm rounded-lg bg-slate-800/30 hover:bg-slate-800/50"
              >
                Reject Non-Essential
              </button>
              <button
                onClick={handleAccept}
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Accept All
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
