import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, EyeOff, Eye, AlertCircle, ArrowRight, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMethod, setAuthMethod] = useState<'signin' | 'signup'>('signin');
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const [isSuccess, setIsSuccess] = useState(false);

  // Close the modal with Escape key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Validate form
  const validateForm = () => {
    const newErrors: {email?: string; password?: string} = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email address is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSuccess(true);
      // After success animation
      setTimeout(() => {
        onClose();
        // Reset form for next time
        setEmail('');
        setPassword('');
        setIsSubmitting(false);
        setIsSuccess(false);
      }, 1500);
    } catch (error) {
      setIsSubmitting(false);
      setErrors({
        email: 'Authentication failed. Please try again.',
      });
    }
  };

  // Toggle between sign in and sign up
  const toggleAuthMethod = () => {
    setAuthMethod(authMethod === 'signin' ? 'signup' : 'signin');
    setErrors({});
  };

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 300, 
        damping: 30 
      } 
    },
    exit: { 
      opacity: 0, 
      y: 50,
      scale: 0.95,
      transition: { 
        duration: 0.2 
      } 
    }
  };

  const inputVariants = {
    focus: { scale: 1.02, boxShadow: `0 0 0 2px ${theme === 'dark' ? '#818cf8' : '#3b82f6'}` },
    error: { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.5 } },
    success: { 
      scale: [1, 1.02, 1],
      borderColor: "#10b981",
      transition: { duration: 0.5 }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
        >
          {/* Backdrop */}
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className={`relative w-full max-w-md p-6 md:p-8 mx-4 rounded-2xl shadow-2xl overflow-hidden ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border border-slate-700'
                : 'bg-gradient-to-br from-white via-slate-50 to-white text-slate-900 border border-slate-200'
            }`}
            onClick={(e) => e.stopPropagation()}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600"></div>
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-blue-600 opacity-20 blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-indigo-600 opacity-20 blur-3xl"></div>

            {/* Close Button */}
            <motion.button
              className={`absolute top-4 right-4 p-1 rounded-full ${
                theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/10'
              } transition-colors`}
              onClick={onClose}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="h-5 w-5" />
            </motion.button>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <h2 className="text-2xl font-bold mb-1">
                {authMethod === 'signin' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                {authMethod === 'signin' 
                  ? 'Sign in to access your account and portfolio'
                  : 'Join to start tracking and analyzing your investments'}
              </p>
            </motion.div>

            {/* Success animation */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center z-10 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-sm"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.5, times: [0, 0.8, 1] }}
                    className="bg-green-500 rounded-full p-4"
                  >
                    <Check className="h-8 w-8 text-white" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <motion.form 
              onSubmit={handleSubmit}
              className="space-y-5"
              layout
            >
              {/* Email Field */}
              <motion.div 
                layout 
                className="space-y-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  Email
                </label>
                <div className="relative">
                  <motion.input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full py-2.5 pl-10 pr-4 rounded-xl ${
                      theme === 'dark'
                        ? 'bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:bg-slate-800/80'
                        : 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white'
                    } transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                    placeholder="your@email.com"
                    disabled={isSubmitting}
                    whileFocus="focus"
                    whileHover={{ scale: 1.01 }}
                    animate={errors.email ? "error" : email ? "success" : ""}
                    variants={inputVariants}
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                    }`} />
                  </div>
                  
                  {errors.email && (
                    <motion.div 
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </motion.div>
                  )}
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p 
                      className="text-xs text-red-500 mt-1"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Password Field */}
              <motion.div 
                layout
                className="space-y-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  Password
                </label>
                <div className="relative">
                  <motion.input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full py-2.5 pl-10 pr-10 rounded-xl ${
                      theme === 'dark'
                        ? 'bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:bg-slate-800/80'
                        : 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white'
                    } transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                    placeholder={authMethod === 'signin' ? "Your password" : "Create a strong password"}
                    disabled={isSubmitting}
                    whileFocus="focus"
                    whileHover={{ scale: 1.01 }}
                    animate={errors.password ? "error" : password ? "success" : ""}
                    variants={inputVariants}
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                    }`} />
                  </div>
                  
                  <button 
                    type="button"
                    className={`absolute inset-y-0 right-0 flex items-center pr-3 ${
                      theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-700'
                    }`}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p 
                      className="text-xs text-red-500 mt-1"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Remember me & Forgot password */}
              <motion.div 
                layout
                className="flex items-center justify-between mt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className={`h-4 w-4 rounded ${
                      theme === 'dark' 
                        ? 'bg-slate-700 border-slate-600 text-indigo-500 focus:ring-indigo-700' 
                        : 'bg-white border-slate-300 text-indigo-600 focus:ring-indigo-500'
                    }`}
                    disabled={isSubmitting}
                  />
                  <label 
                    htmlFor="remember-me" 
                    className={`ml-2 block text-sm ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    Remember me
                  </label>
                </div>
                <div>
                  <a 
                    href="#" 
                    className="text-sm text-indigo-500 hover:text-indigo-400"
                  >
                    Forgot password?
                  </a>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                className={`w-full mt-6 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium flex items-center justify-center ${
                  isSubmitting ? 'cursor-not-allowed opacity-80' : 'hover:from-blue-700 hover:to-indigo-700'
                } shadow-lg shadow-indigo-500/30`}
                disabled={isSubmitting}
                whileHover={!isSubmitting ? { scale: 1.02, boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.3), 0 4px 6px -4px rgba(99, 102, 241, 0.4)" } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {isSubmitting ? (
                  <motion.div 
                    className="w-5 h-5 rounded-full border-2 border-white border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  <>
                    {authMethod === 'signin' ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </motion.button>

              {/* Social Login Options */}
              <motion.div 
                layout
                className="mt-6 pt-6 border-t text-center space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  or continue with
                </p>
                <div className="flex space-x-3 justify-center">
                  {['google', 'apple', 'github'].map((provider, index) => (
                    <motion.button
                      key={provider}
                      type="button"
                      className={`flex-1 py-2.5 px-4 rounded-xl ${
                        theme === 'dark' 
                          ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700' 
                          : 'bg-white hover:bg-slate-50 border border-slate-200'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + (index * 0.1) }}
                    >
                      <div className="flex items-center justify-center">
                        <img 
                          src={`/icons/${provider}.svg`} 
                          alt={`${provider} logo`}
                          className="h-5 w-5"
                          onError={(e) => {
                            e.currentTarget.src = `https://api.dicebear.com/6.x/shapes/svg?seed=${provider}`
                          }}
                        />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Sign up link */}
              <motion.div 
                layout
                className="text-center mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  {authMethod === 'signin' ? "Don't have an account?" : "Already have an account?"}
                  <motion.button
                    type="button"
                    className="ml-2 text-indigo-500 font-medium hover:text-indigo-400"
                    onClick={toggleAuthMethod}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {authMethod === 'signin' ? 'Sign up' : 'Sign in'}
                  </motion.button>
                </p>
              </motion.div>
            </motion.form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SignInModal;
