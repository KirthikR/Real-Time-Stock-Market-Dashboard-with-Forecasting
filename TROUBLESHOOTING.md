# Troubleshooting Guide

## Common React & Vite Issues

### Module Export Errors

If you encounter an error like:
```
The requested module '/src/components/SomeComponent.tsx' does not provide an export named 'default'
```

Try these solutions in order:

1. **Check the component file**
   - Ensure it has a proper `export default ComponentName` statement at the end
   - Make sure there are no syntax errors in the file

2. **Clear Vite cache**
   - Run `npm run clean` to clear all caches
   - Restart your dev server with `npm run dev`

3. **Try explicit file extension**
   - Change imports from `import X from './X'` to `import X from './X.tsx'`

4. **Restart the development server**
   - Sometimes a full restart is needed: `npm run clean:dev`

5. **Check for circular dependencies**
   - Ensure your component imports don't create a circular reference

### React Component Rendering Issues

If components aren't rendering properly:

1. **Check your Context Providers**
   - Ensure all required providers are properly nested
   - Verify that context values are being properly initialized

2. **Inspect React DevTools**
   - Use React DevTools to check if components are mounting
   - Look for any errors in the component tree

3. **Add Error Boundaries**
   - Wrap problematic components in error boundaries to catch and display errors

### TypeScript Errors

If you're getting TypeScript errors:

1. **Run type checking**
   - Use `npm run typecheck` to identify type issues
   - Fix any errors that appear in the output

2. **Check import paths**
   - Ensure import paths are correct and TypeScript can resolve them
   - Try using absolute imports with proper path aliases

### Vite Hot Module Replacement (HMR) Issues

If changes aren't reflecting in the browser:

1. **Force full reload**
   - Press Ctrl+Shift+R (or Cmd+Shift+R on Mac) to force a full browser refresh

2. **Clear browser cache**
   - Open browser DevTools → Application → Clear Storage → Clear site data

3. **Restart Vite**
   - Stop the dev server and run `npm run clean:dev`

## Specific Component Issues

### EarningsCalendar Export Issues

If you're having trouble with the EarningsCalendar component specifically:

1. Make sure the component file has a proper default export:
   ```tsx
   // At the end of the file
   export default EarningsCalendar;
   ```

2. Try importing directly instead of using lazy loading:
   ```tsx
   import EarningsCalendar from './EarningsCalendar';
   // Instead of
   // const EarningsCalendar = lazy(() => import('./EarningsCalendar'));
   ```

3. Check for any TypeScript errors in the component by running `npm run typecheck`

4. Clear the Vite cache with `npm run clean` and restart

## Command Line Troubleshooting

Here are some useful commands for debugging:

```bash
# Check for TypeScript errors
npm run typecheck

# Clear caches and restart dev server
npm run clean:dev

# Check if a file has proper formatting/syntax
npx eslint src/components/EarningsCalendar.tsx

# Force reinstall of dependencies (last resort)
rm -rf node_modules && npm ci
```

If you're still experiencing issues after trying these solutions, please open an issue on the repository with details about your environment and the exact error messages you're seeing.
