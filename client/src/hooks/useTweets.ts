import { tweetsApi } from "@/apis/tweets.api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInfiniteScroll } from "./useInfiniteScroll";

export const useTweets = (param: {
  queryKey: string;
  author_id?: string;
  enabled?: boolean;
  following_only?: string;
  liked_only?: string;
  bookmark_only?: string;
}) => {
  const {
    queryKey,
    author_id,
    enabled = true,
    following_only,
    liked_only,
    bookmark_only,
  } = param;
  const query = useInfiniteQuery({
    queryKey: [queryKey, author_id || "all"],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        return await tweetsApi.getAllTweets({
          page: pageParam,
          limit: 10,
          author_id,
          following_only,
          liked_only,
          bookmark_only,
        });
      } catch (error) {
        console.error("Lỗi khi fetch tweets:", error);
        throw error;
      }
    },
    initialPageParam: 1, // tham số ban đầu cho page
    // Hàm này sẽ được gọi để lấy tham số cho lần fetch tiếp theo
    getNextPageParam: (lastPage) => {
      const page = lastPage.data?.result?.page ?? 1;
      const totalPage = lastPage.data?.result?.total_page ?? 1;
      // trả về page tiếp theo nếu còn trang, ngược lại trả về undefined để dừng infinite scroll
      return page < totalPage ? page + 1 : undefined;
    },
    enabled, // Tắt query khi không cần fetch
  });

  // Cuộn tới đáy tự load trang tiếp theo
  const sentinelRef = useInfiniteScroll({
    onLoadMore: () => {
      if (query.hasNextPage && !query.isFetchingNextPage) {
        query.fetchNextPage();
      }
    },
    hasMore: !!query.hasNextPage,
  });

  return {
    ...query,
    sentinelRef,
  };
};
