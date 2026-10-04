import { useEffect, useRef, useCallback } from "react";

/**
 * Gọi `onLoadMore` khi sentinel element xuất hiện trong viewport.
 * Usage: const ref = useInfiniteScroll({ onLoadMore, hasMore });
 */
export const useInfiniteScroll = ({
  onLoadMore,
  hasMore,
  threshold = 0.1,
}: {
  onLoadMore: () => void;
  hasMore: boolean;
  threshold?: number;
}) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const observe = useCallback(() => {
    const el = sentinelRef.current;
    if (!el) return;
    //  IntersectionObserver : dùng để theo dõi sự xuất hiện của element trong viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore) onLoadMore();
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onLoadMore, hasMore, threshold]);
  //  useEffect : dùng để gọi hàm observe khi component mount và unmount
  useEffect(observe, [observe]);

  return sentinelRef;
};
