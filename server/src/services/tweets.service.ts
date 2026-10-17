import { TweetRequestBody } from "~/models/requests/Tweet.requests";
import prisma from "./prisma.service";
import { TweetType, TweetAudience, MediaType, Prisma } from "@prisma/client";

class TweetsService {
  private async checkAndCreateHashtags(hashtags: string[]) {
    return Promise.all(
      hashtags.map((name) =>
        prisma.hashtag.upsert({
          where: { name },
          update: {},
          create: { name },
        }),
      ),
    );
  }

  async createTweet(body: TweetRequestBody, userId: string) {
    const hashtags = await this.checkAndCreateHashtags(
      body.hashtags as string[],
    );

    const tweet = await prisma.tweet.create({
      data: {
        user_id: userId,
        type: body.type as TweetType,
        audience: body.audience as TweetAudience,
        content: body.content,
        parent_id: body.parentId ?? (body as any).parent_id ?? null,
        medias: {
          create: (body.medias ?? []).map((m) => ({
            url: m.url,
            type: m.type as MediaType,
            name: m.name,
            size: m.size,
          })),
        },
        hashtags: {
          create: hashtags.map((h) => ({ hashtag_id: h.id })),
        },
        mentions: {
          create: (body.mentions ?? []).map((uid) => ({ user_id: uid })),
        },
      },
      include: tweetInclude(userId),
    });

    return formatTweet(tweet, userId);
  }

  async deleteTweet(tweet_id: string, user_id: string) {
    // Cascade deletes likes/bookmarks/medias/hashtags/mentions via schema onDelete
    await prisma.tweet.deleteMany({ where: { id: tweet_id, user_id } });
    return true;
  }

  async unretweet(parent_id: string, user_id: string) {
    const result = await prisma.tweet.findFirst({
      where: { parent_id, user_id, type: TweetType.retweet },
    });
    if (!result) return null;
    await prisma.tweet.delete({ where: { id: result.id } });
    return result;
  }

  async getTweet(tweet_id: string, user_id?: string) {
    const tweet = await prisma.tweet.findUnique({
      where: { id: tweet_id },
      include: tweetInclude(user_id),
    });
    if (!tweet) return null;

    // Increment view
    await prisma.tweet.update({
      where: { id: tweet_id },
      data: user_id
        ? { user_views: { increment: 1 } }
        : { guest_views: { increment: 1 } },
    });

    return formatTweet(tweet, user_id);
  }

  async getAllTweet(
    limit: number,
    page: number,
    currentUserId: string,
    author_id?: string,
    following_only?: string,
    liked_only?: string,
    bookmark_only?: string,
  ) {
    let where: Prisma.TweetWhereInput = {};

    if (author_id) {
      where = { user_id: author_id };
    } else if (bookmark_only) {
      where = { bookmarks: { some: { user_id: currentUserId } } };
    } else if (liked_only) {
      where = { likes: { some: { user_id: currentUserId } } };
    } else if (following_only) {
      const followedIds = await prisma.follow
        .findMany({
          where: { user_id: currentUserId },
          select: { followed_user_id: true },
        })
        .then((rows) => rows.map((r) => r.followed_user_id));
      where = { user_id: { in: [...followedIds, currentUserId] } };
    }

    const [tweets, total] = await Promise.all([
      prisma.tweet.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: tweetInclude(currentUserId),
      }),
      prisma.tweet.count({ where }),
    ]);

    return {
      tweets: tweets.map((t) => formatTweet(t, currentUserId)),
      total,
      page,
      limit,
    };
  }

  async getTweetChildren(
    tweet_id: string,
    limit: number,
    page: number,
    currentUserId: string,
  ) {
    const where: Prisma.TweetWhereInput = {
      parent_id: tweet_id,
      type: "comment",
    };

    const [tweets, total] = await Promise.all([
      prisma.tweet.findMany({
        where,
        orderBy: { created_at: "asc" },
        skip: (page - 1) * limit,
        take: limit,
        include: tweetInclude(currentUserId),
      }),
      prisma.tweet.count({ where }),
    ]);

    return {
      tweets: tweets.map((t) => formatTweet(t, currentUserId)),
      total,
      page,
      limit,
      total_page: Math.ceil(total / limit),
    };
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function tweetInclude(userId?: string) {
  return {
    user: {
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        cover_photo: true,
        ...(userId
          ? {
              followers: {
                where: { user_id: userId },
                select: { id: true },
              },
            }
          : {}),
      },
    },
    medias: true,
    hashtags: { include: { hashtag: true } },
    mentions: {
      include: {
        user: { select: { id: true, name: true, username: true, email: true } },
      },
    },
    bookmarks: true,
    likes: true,
    parent: {
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            ...(userId
              ? {
                  followers: {
                    where: { user_id: userId },
                    select: { id: true },
                  },
                }
              : {}),
          },
        },
        medias: true,
      },
    },
    replies: {
      select: { id: true, user_id: true, type: true },
    },
  } satisfies Prisma.TweetInclude;
}

export function formatTweet(tweet: any, userId?: string) {
  const likes_count = tweet.likes?.length ?? 0;
  const bookmarks_count = tweet.bookmarks?.length ?? 0;
  const reposts_count =
    tweet.replies?.filter((r: any) => r.type === TweetType.retweet).length ?? 0;
  const replies_count =
    tweet.replies?.filter((r: any) => r.type === TweetType.comment).length ?? 0;

  const isFollowing = Boolean(
    userId && tweet.user?.followers && tweet.user.followers.length > 0,
  );
  const parentIsFollowing = Boolean(
    userId &&
    tweet.parent?.user?.followers &&
    tweet.parent.user.followers.length > 0,
  );

  const isLiked = userId
    ? tweet.likes?.some((l: any) => l.user_id === userId)
    : false;
  const isBookmarked = userId
    ? tweet.bookmarks?.some((b: any) => b.user_id === userId)
    : false;
  const isReposted = userId
    ? tweet.replies?.some((r: any) => r.user_id === userId)
    : false;

  return {
    ...tweet,
    _id: tweet.id,
    userId: tweet.user_id,
    parentId: tweet.parent_id,
    userViews: tweet.user_views ?? 0,
    guestViews: tweet.guest_views ?? 0,
    createdAt: tweet.created_at,
    updatedAt: tweet.updated_at,
    hashtags: tweet.hashtags?.map((th: any) => th.hashtag),
    mentions: tweet.mentions?.map((tm: any) => tm.user),
    likesCount: likes_count,
    bookmarksCount: bookmarks_count,
    repostsCount: reposts_count,
    repliesCount: replies_count,
    isLiked,
    isBookmarked,
    isReposted,
    isFollowing,
    user: tweet.user
      ? {
          ...tweet.user,
          coverPhoto: tweet.user.cover_photo,
          cover_photo: undefined,
          isFollowing,
          followers: undefined,
        }
      : undefined,
    parent: tweet.parent
      ? {
          ...tweet.parent,
          userId: tweet.parent.user_id,
          parentId: tweet.parent.parent_id,
          createdAt: tweet.parent.created_at,
          updatedAt: tweet.parent.updated_at,
          isFollowing: parentIsFollowing,
          user: tweet.parent.user
            ? {
                ...tweet.parent.user,
                coverPhoto: tweet.parent.user.cover_photo,
                cover_photo: undefined,
                isFollowing: parentIsFollowing,
                followers: undefined,
              }
            : undefined,
        }
      : undefined,
    likes: undefined,
    bookmarks: undefined,
  };
}

export const tweetsService = new TweetsService();
export default tweetsService;
