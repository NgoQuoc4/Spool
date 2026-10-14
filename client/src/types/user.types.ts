export const UserVerifyStatus = {
  Unverified: 0,
  Verified: 1,
  Banned: 2,
} as const;
export type UserVerifyStatus =
  (typeof UserVerifyStatus)[keyof typeof UserVerifyStatus];

export interface User {
  _id: string;
  name: string;
  email: string;
  date_of_birth: string;
  created_at: string;
  updated_at: string;
  verify: UserVerifyStatus;
  bio: string;
  location: string;
  website: string;
  username: string;
  avatar: string;
  cover_photo: string;
  followers_count?: number;
  following_count?: number;
  isFollowing?: boolean;
}

export interface UpdateMeBody {
  name?: string;
  date_of_birth?: string;
  bio?: string;
  location?: string;
  website?: string;
  username?: string;
  avatar?: string;
  cover_photo?: string;
}
