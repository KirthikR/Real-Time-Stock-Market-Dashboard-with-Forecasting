/**
 * Custom Tailwind plugin for premium gradients and animations
 */
const plugin = require('tailwindcss/plugin');

const premiumGradients = plugin(function({ addUtilities }) {
  const newUtilities = {
    '.gradient-premium-blue': {
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
      backgroundSize: '200% 200%',
      animation: 'gradientShift 15s ease infinite',
    },
    '.gradient-premium-dark': {
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      backgroundSize: '200% 200%',
      animation: 'gradientShift 15s ease infinite',
    },
    '.gradient-premium-line': {
      background: 'linear-gradient(to right, #3b82f6, #8b5cf6, #d946ef)',
      backgroundSize: '200% 200%',
      animation: 'gradientShift 8s ease infinite',
    },
    '.glass-effect': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    '.glass-effect-dark': {
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
    },
  };

  addUtilities(newUtilities);
});

module.exports = premiumGradients;
