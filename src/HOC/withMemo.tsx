import React from 'react';

// Custom comparison function for props
type CompareFunction<P> = (prevProps: P, nextProps: P) => boolean;

// Default comparison function that performs shallow comparison
const defaultCompare = <P extends object>(prevProps: P, nextProps: P): boolean => {
  if (Object.is(prevProps, nextProps)) return true;
  
  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);
  
  if (prevKeys.length !== nextKeys.length) return false;
  
  return prevKeys.every(key => {
    return Object.is(prevProps[key as keyof P], nextProps[key as keyof P]);
  });
};

// HOC that wraps component with React.memo
export function withMemo<P extends object>(
  Component: React.ComponentType<P>,
  compare: CompareFunction<P> = defaultCompare
): React.MemoExoticComponent<React.ComponentType<P>> {
  return React.memo(Component, compare);
}

// Usage example:
// const MemoizedComponent = withMemo(MyComponent);
// or with custom comparison:
// const MemoizedComponent = withMemo(MyComponent, (prev, next) => prev.id === next.id);
