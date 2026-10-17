import prisma from './prisma.service'
import { Prisma } from '@prisma/client'
import { formatTweet, tweetInclude } from './tweets.service'

class SearchService {
  async searchQuery({
    query,
    tab = 'top',
    userId,
  }: {
    query: string
    tab?: 'top' | 'recent' | 'profiles'
    userId?: string
  }) {
    if (tab === 'profiles') {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: query, mode: 'insensitive' } },
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          avatar: true,
          cover_photo: true,
          bio: true,
          verify: true,
          ...(userId
            ? {
                followers: {
                  where: { user_id: userId },
                  select: { id: true },
                },
              }
            : {}),
          _count: {
            select: {
              followers: true,
              following: true,
            },
          },
        },
        take: 20,
      })

      return {
        users: users.map((u: any) => ({
          id: u.id,
          _id: u.id,
          name: u.name,
          username: u.username,
          email: u.email,
          avatar: u.avatar,
          coverPhoto: u.cover_photo,
          bio: u.bio,
          verify: u.verify,
          followersCount: u._count?.followers ?? 0,
          followingCount: u._count?.following ?? 0,
          isFollowing: Boolean(userId && u.followers && u.followers.length > 0),
        })),
        tweets: [],
      }
    }

    const cleanQuery = query.replace(/^#/, '')
    const where: Prisma.TweetWhereInput = {
      OR: [
        { content: { contains: query, mode: 'insensitive' } },
        { hashtags: { some: { hashtag: { name: { contains: cleanQuery, mode: 'insensitive' } } } } },
      ],
    }

    const orderBy: Prisma.TweetOrderByWithRelationInput[] =
      tab === 'recent'
        ? [{ created_at: 'desc' }]
        : [{ likes: { _count: 'desc' } }, { user_views: 'desc' }, { created_at: 'desc' }]

    const tweets = await prisma.tweet.findMany({
      where,
      orderBy,
      take: 20,
      include: tweetInclude(userId),
    })

    return {
      users: [],
      tweets: tweets.map((t) => formatTweet(t, userId)),
    }
  }
}

export const searchsService = new SearchService()
export default searchsService
