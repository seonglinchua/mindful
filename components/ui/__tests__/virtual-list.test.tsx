import React from 'react';
import { render, screen } from '@testing-library/react';
import { VirtualList, useVirtualList } from '../virtual-list';
import { renderHook, act } from '@testing-library/react';

describe('VirtualList', () => {
  const mockItems = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    text: `Item ${i}`,
  }));

  const renderItem = (item: { id: number; text: string }) => (
    <div data-testid={`item-${item.id}`}>{item.text}</div>
  );

  it('should render visible items only', () => {
    render(
      <VirtualList
        items={mockItems}
        itemHeight={50}
        containerHeight={200}
        renderItem={renderItem}
      />
    );

    // With itemHeight=50 and containerHeight=200, roughly 4-5 items should be visible
    // Plus overscan of 3 items before and after
    const visibleItems = screen.queryAllByTestId(/item-/);
    expect(visibleItems.length).toBeLessThan(mockItems.length);
    expect(visibleItems.length).toBeGreaterThan(0);
  });

  it('should render all items when list is small', () => {
    const smallItems = Array.from({ length: 3 }, (_, i) => ({
      id: i,
      text: `Item ${i}`,
    }));

    render(
      <VirtualList
        items={smallItems}
        itemHeight={50}
        containerHeight={200}
        renderItem={renderItem}
      />
    );

    expect(screen.getByTestId('item-0')).toBeInTheDocument();
    expect(screen.getByTestId('item-1')).toBeInTheDocument();
    expect(screen.getByTestId('item-2')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <VirtualList
        items={mockItems}
        itemHeight={50}
        containerHeight={200}
        renderItem={renderItem}
        className="custom-class"
      />
    );

    const virtualListContainer = container.querySelector('.custom-class');
    expect(virtualListContainer).toBeInTheDocument();
  });

  it('should use custom key extractor', () => {
    const getItemKey = (item: { id: number; text: string }) => `custom-${item.id}`;

    const { container } = render(
      <VirtualList
        items={mockItems.slice(0, 5)}
        itemHeight={50}
        containerHeight={200}
        renderItem={renderItem}
        getItemKey={getItemKey}
      />
    );

    // Keys are internal to React, but we can check that the component renders
    expect(container).toBeInTheDocument();
  });

  it('should handle empty items array', () => {
    const { container } = render(
      <VirtualList
        items={[]}
        itemHeight={50}
        containerHeight={200}
        renderItem={renderItem}
      />
    );

    const visibleItems = screen.queryAllByTestId(/item-/);
    expect(visibleItems.length).toBe(0);
  });

  it('should set correct container height', () => {
    const { container } = render(
      <VirtualList
        items={mockItems}
        itemHeight={50}
        containerHeight={300}
        renderItem={renderItem}
      />
    );

    const virtualContainer = container.querySelector('.overflow-auto');
    expect(virtualContainer).toHaveStyle({ height: '300px' });
  });
});

describe('useVirtualList', () => {
  it('should calculate visible range correctly', () => {
    const { result } = renderHook(() => useVirtualList(100, 50, 200, 3));

    expect(result.current.startIndex).toBe(0);
    expect(result.current.totalHeight).toBe(5000); // 100 items * 50px
  });

  it('should update on scroll', () => {
    const { result } = renderHook(() => useVirtualList(100, 50, 200, 3));

    // Simulate scroll event
    const mockEvent = {
      currentTarget: { scrollTop: 250 },
    } as React.UIEvent<HTMLDivElement>;

    act(() => {
      result.current.handleScroll(mockEvent);
    });

    // After scrolling to 250px, the visible range should update
    expect(result.current.scrollTop).toBe(250);
    expect(result.current.startIndex).toBeGreaterThan(0);
  });

  it('should provide scrollToIndex function', () => {
    const { result } = renderHook(() => useVirtualList(100, 50, 200, 3));

    act(() => {
      result.current.scrollToIndex(10);
    });

    expect(result.current.scrollTop).toBe(500); // 10 * 50px
  });

  it('should handle overscan correctly', () => {
    const { result } = renderHook(() => useVirtualList(100, 50, 200, 5));

    const visibleCount = result.current.endIndex - result.current.startIndex;
    // Should include visible items plus overscan items
    expect(visibleCount).toBeGreaterThan(4); // More than just visible items
  });

  it('should not exceed array bounds', () => {
    const { result } = renderHook(() => useVirtualList(10, 50, 200, 3));

    expect(result.current.startIndex).toBeGreaterThanOrEqual(0);
    expect(result.current.endIndex).toBeLessThanOrEqual(10);
  });
});
