import React, { useCallback, memo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

// Generic virtualized list component to efficiently render large lists
interface OptimizedListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemKey: (item: T, index: number) => string | number;
  estimateSize?: number;
  className?: string;
  overscan?: number;
  listHeight?: number | string;
}

function OptimizedList<T>({
  data,
  renderItem,
  getItemKey,
  estimateSize = 50,
  className = '',
  overscan = 5,
  listHeight = '400px',
}: OptimizedListProps<T>) {
  // Create a parent ref for the virtualized list
  const parentRef = React.useRef<HTMLDivElement>(null);

  // Set up the virtualizer
  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => estimateSize, [estimateSize]),
    overscan,
  });

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{ height: listHeight, width: '100%' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={getItemKey(data[virtualItem.index], virtualItem.index)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(data[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(OptimizedList);
