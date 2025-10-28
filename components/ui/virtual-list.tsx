/**
 * Virtual scrolling component for rendering large lists efficiently
 * Only renders items that are visible in the viewport plus a buffer
 */

import * as React from "react";

export interface VirtualListProps<T> {
  /** Array of items to render */
  items: T[];
  /** Height of each item in pixels */
  itemHeight: number;
  /** Height of the scrollable container in pixels */
  containerHeight: number;
  /** Number of items to render outside the visible area (buffer) */
  overscan?: number;
  /** Render function for each item */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Optional className for the container */
  className?: string;
  /** Optional key extractor function */
  getItemKey?: (item: T, index: number) => string | number;
}

/**
 * Virtual list component that only renders visible items
 * Dramatically improves performance for large lists (1000+ items)
 *
 * @example
 * <VirtualList
 *   items={journalEntries}
 *   itemHeight={100}
 *   containerHeight={600}
 *   renderItem={(entry) => <JournalCard entry={entry} />}
 * />
 */
export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 3,
  renderItem,
  className = "",
  getItemKey,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Calculate visible range
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.ceil((scrollTop + containerHeight) / itemHeight);

  // Add overscan
  const startIndex = Math.max(0, visibleStart - overscan);
  const endIndex = Math.min(items.length, visibleEnd + overscan);

  // Calculate total height and offset
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  // Handle scroll
  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Get visible items
  const visibleItems = items.slice(startIndex, endIndex);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => {
            const actualIndex = startIndex + index;
            const key = getItemKey ? getItemKey(item, actualIndex) : actualIndex;

            return (
              <div
                key={key}
                style={{
                  height: itemHeight,
                  overflow: "hidden",
                }}
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Hook for managing virtual list state
 * Useful when you need more control over the virtual list behavior
 *
 * @param totalItems - Total number of items in the list
 * @param itemHeight - Height of each item in pixels
 * @param containerHeight - Height of the container in pixels
 * @param overscan - Number of items to render outside viewport
 *
 * @returns Object containing scroll state and handlers
 *
 * @example
 * const virtualList = useVirtualList(1000, 80, 600, 5);
 */
export function useVirtualList(
  totalItems: number,
  itemHeight: number,
  containerHeight: number,
  overscan = 3
) {
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.ceil((scrollTop + containerHeight) / itemHeight);

  const startIndex = Math.max(0, visibleStart - overscan);
  const endIndex = Math.min(totalItems, visibleEnd + overscan);

  const totalHeight = totalItems * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const scrollToIndex = React.useCallback(
    (index: number) => {
      const targetScrollTop = index * itemHeight;
      setScrollTop(targetScrollTop);
    },
    [itemHeight]
  );

  return {
    scrollTop,
    startIndex,
    endIndex,
    totalHeight,
    offsetY,
    handleScroll,
    scrollToIndex,
    visibleRange: { start: visibleStart, end: visibleEnd },
  };
}
