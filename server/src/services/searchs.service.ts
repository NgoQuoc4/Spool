import prisma from './prisma.service'
import { Prisma } from '@prisma/client'

class SearchService {
  async searchQuery({ query, tab = 'top' }: { query: string; tab?: 'top' | 'recent' | 'profiles' }) {
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
          id: true, name: true, username: true, email: true,
          avatar: true, cover_photo: true, bio: true, verify: true,
        },
        take: 20,
      })
      return { users, tweets: [] }
    }

    const orderBy: Prisma.TweetOrderByWithRelationInput[] =
      tab === 'recent'
        ? [{ created_at: 'desc' }]
        : [{ likes: { _count: 'desc' } }, { user_views: 'desc' }, { created_at: 'desc' }]

    const tweets = await prisma.tweet.findMany({
      where: { content: { contains: query, mode: 'insensitive' } },
      orderBy,
      take: 20,
      include: {
        user: {
          select: { id: true, name: true, username: true, email: true, avatar: true, cover_photo: true },
        },
        medias: true,
        hashtags: { include: { hashtag: true } },
        likes: { select: { user_id: true } },
        bookmarks: { select: { user_id: true } },
      },
    })

    return {
      users: [],
      tweets: tweets.map((t) => ({
        ...t,
        hashtags: t.hashtags.map((th) => th.hashtag),
      })),
    }
  }
}

export const searchsService = new SearchService()
export default searchsService
