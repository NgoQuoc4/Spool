import prisma from './prisma.service'

class LikeService {
  async likeTweet(user_id: string, tweet_id: string) {
    const existing = await prisma.like.findUnique({
      where: { user_id_tweet_id: { user_id, tweet_id } },
    })

    if (existing) {
      await prisma.like.delete({ where: { user_id_tweet_id: { user_id, tweet_id } } })
      return { message: 'Unlike success', like: existing }
    }

    const like = await prisma.like.create({ data: { user_id, tweet_id } })
    return { message: 'Like success', like }
  }
}

export default new LikeService()
