export const UserVerifyStatus = {
  Unverified: 0,
  Verified: 1,
  Banned: 2,
} as const;
export type UserVerifyStatus =
  (typeof UserVerifyStatus)[keyof typeof UserVerifyStatus];

export const UserRole = {
  User: "User",
  Admin: "Admin",
  Bot: "Bot",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  dateOfBirth?: string;
  createdAt?: string;
  updatedAt?: string;
  verify: UserVerifyStatus;
  role?: UserRole;
  bio: string;
  location: string;
  website: string;
  username: string;
  avatar: string;
  coverPhoto?: string;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
}

export interface UpdateMeBody {
  name?: string;
  dateOfBirth?: string;
  bio?: string;
  location?: string;
  website?: string;
  username?: string;
  avatar?: string;
  coverPhoto?: string;
}

export interface InsightsData {
  totalViews: number;
  followersViews: number;
  nonFollowersViews: number;
  followersThisWeek: number;
  followersLastWeek: number;
  likesCount: number;
  repliesCount: number;
  repostsCount: number;
}

