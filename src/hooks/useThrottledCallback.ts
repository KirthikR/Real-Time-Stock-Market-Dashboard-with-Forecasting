import { useRef, useCallback, useEffect } from 'react';

/**
 * A hook that throttles a callback function to limit its execution frequency
 * @param callback The function to throttle
 * @param delay The throttle delay in milliseconds
 * @returns The throttled callback function
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 200
): (...args: Parameters<T>) => void {
  const lastCall = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastArgsRef = useRef<Parameters<T> | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const elapsed = now - lastCall.current;

      // Store the latest args in case we need to execute them after the delay
      lastArgsRef.current = args;

      // If we're still waiting, don't do anything
      if (elapsed < delay) {
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Schedule to run after the throttle period ends
        timeoutRef.current = setTimeout(() => {
          lastCall.current = Date.now();
          callback(...(lastArgsRef.current as Parameters<T>));
          timeoutRef.current = null;
        }, delay - elapsed);
        
        return;
      }

      // Execute immediately if enough time has elapsed
      lastCall.current = now;
      callback(...args);
    },
    [callback, delay]
  );
}
