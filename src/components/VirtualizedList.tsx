import React, { useRef, useState, useEffect } from 'react';
import { useThrottle } from '../utils/performanceUtils';

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
}

function VirtualizedList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  className = '',
  overscan = 3
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const throttledScrollTop = useThrottle(scrollTop, 50);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        setScrollTop(containerRef.current.scrollTop);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const totalHeight = items.length * itemHeight;
  
  const startIndex = Math.max(0, Math.floor(throttledScrollTop / itemHeight) - overscan);
  const visibleItemCount = Math.ceil(height / itemHeight) + overscan * 2;
  const endIndex = Math.min(items.length - 1, startIndex + visibleItemCount);

  const offsetY = startIndex * itemHeight;
  
  return (
    <div 
      ref={containerRef}
      style={{ height, overflow: 'auto', position: 'relative' }}
      className={className}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ position: 'absolute', top: offsetY, left: 0, right: 0 }}>
          {items.slice(startIndex, endIndex + 1).map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VirtualizedList;
