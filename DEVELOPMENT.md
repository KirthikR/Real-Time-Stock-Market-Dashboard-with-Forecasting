# Development Setup Guide

## Required Tools

### React DevTools

For the best development experience with this application, you should install the React DevTools browser extension:

#### Chrome / Edge / Brave
1. Visit [React DevTools on Chrome Web Store](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
2. Click "Add to Chrome" (or your respective browser)
3. After installation, reload your development server

#### Firefox
1. Visit [React DevTools on Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)
2. Click "Add to Firefox"
3. After installation, reload your development server

### Why React DevTools?

React DevTools gives you the ability to:
- Inspect the React component tree
- View and edit component props and state
- Track performance with the Profiler
- Debug context providers and consumers
- Identify unnecessary re-renders

The warning message in the console about React DevTools will disappear once it's installed.

## Development Scripts

Start the development server:
```
npm run dev
```

Type check your TypeScript files:
```
npm run typecheck
```

Build for production:
```
npm run build:prod
```

Analyze bundle size:
```
npm run analyze
```

## Troubleshooting

### Console Warning About React DevTools

If you see the warning message:
```
Download the React DevTools for a better development experience: https://reactjs.org/link/react-devtools
```

Follow these steps:
1. Install the React DevTools extension as described above
2. Close all browser tabs that have your app open
3. Restart your development server: `npm run dev`
4. Open a fresh browser tab to your development URL

### React DevTools Not Connecting

If React DevTools is installed but not connecting to your app:

1. Open DevTools and check the "Components" or "Profiler" tab
2. If it shows "Connecting to React..." or "Looking for React..." for too long:
   - Try restarting your browser completely
   - Make sure you don't have multiple versions of React on the page
   - Check if any browser extensions might be interfering
   - Try in a private/incognito browser window

## Additional Development Resources

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/guide/)
