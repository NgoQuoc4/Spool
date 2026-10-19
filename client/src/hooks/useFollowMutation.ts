import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useAppStore } from "@/stores/useAppStore";
import { usersApi } from "@/apis/users.api";

export const useFollowMutation = () => {
  const { showToast } = useAppStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      targetId,
      isFollowing,
    }: {
      targetId: string;
      isFollowing: boolean;
    }) => {
      if (isFollowing) {
        await usersApi.unfollow(targetId);
      } else {
        await usersApi.follow(targetId);
      }
    },
    onSuccess: (_, { isFollowing }) => {
      showToast(isFollowing ? "Đã hủy theo dõi" : "Đã theo dõi thành công");
      queryClient.invalidateQueries({ queryKey: ["user_profile"] });
      queryClient.invalidateQueries({ queryKey: ["follow-list"] });
      queryClient.invalidateQueries({ queryKey: ["search"] });
    },
    onError: () => {
      showToast("Thao tác thất bại, vui lòng thử lại!");
    },
  });
};

export default useFollowMutation;
