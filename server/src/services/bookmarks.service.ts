import prisma from './prisma.service'

class BookmarkService {
  async bookmarkTweet(user_id: string, tweet_id: string) {
    const existing = await prisma.bookmark.findUnique({
      where: { user_id_tweet_id: { user_id, tweet_id } },
    })

    if (existing) {
      await prisma.bookmark.delete({ where: { user_id_tweet_id: { user_id, tweet_id } } })
      return { message: 'Unbookmark success', bookmark: existing }
    }

    const bookmark = await prisma.bookmark.create({ data: { user_id, tweet_id } })
    return { message: 'Bookmark success', bookmark }
  }
}

export default new BookmarkService()
