import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/apis/users.api";
import { useAuth } from "@/contexts/AuthContext";
import { useParams } from "react-router-dom";
import type { Author } from "@/types";

export const useProfile = (customUsername?: string) => {
  const { profile: authProfile } = useAuth();
  const { username: routeUsername } = useParams<{ username: string }>();

  const rawUsername = customUsername || routeUsername;
  const cleanUsername = rawUsername?.replace(/^@/, "");
  const isMyProfile = !cleanUsername || cleanUsername === authProfile?.username;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["user_profile", cleanUsername],
    queryFn: () => usersApi.getProfile(cleanUsername!),
    enabled: !isMyProfile && Boolean(cleanUsername),
    // retry: false,
  });

  const user = isMyProfile ? authProfile : data?.data?.data;
  const currentUser: Author = {
    id: authProfile?._id || "",
    name: authProfile?.name || "",
    username: authProfile?.username?.trim() || "user",
    avatar:
      authProfile?.avatar?.trim() ||
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
    bio: authProfile?.bio || "",
    verified: true,
    followingCount: authProfile?.followingCount || 0,
    followersCount: authProfile?.followersCount || 0,
  };

  return {
    user,
    currentUser,
    isMyProfile,
    isLoading: !isMyProfile && isLoading,
    isError,
    refetch,
  };
};

export default useProfile;
