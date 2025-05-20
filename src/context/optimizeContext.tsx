import React, { useMemo } from 'react';

// This is a utility function to create optimized context providers
// It prevents unnecessary re-renders by memoizing the context value
export function createOptimizedContext<T>(
  useValue: () => T,
  displayName: string
) {
  const Context = React.createContext<T | undefined>(undefined);
  Context.displayName = displayName;

  const Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const value = useValue();
    // Memoize the value to prevent unnecessary re-renders
    const memoizedValue = useMemo(() => value, Object.values(value));

    return (
      <Context.Provider value={memoizedValue}>
        {children}
      </Context.Provider>
    );
  };

  const useContext = () => {
    const context = React.useContext(Context);
    if (context === undefined) {
      throw new Error(`use${displayName} must be used within a ${displayName}Provider`);
    }
    return context;
  };

  return { Provider, useContext };
}

// Example usage:
// const { Provider: OptimizedStockProvider, useContext: useOptimizedStockContext } = 
//   createOptimizedContext(useStockValue, 'Stock');
