import { Request } from 'express'
import { FILE_DIR, IMAGE_DIR, VIDEO_DIR } from '~/constants/dir'
import {
  handlerUploadVideo,
  handlerUploadFile,
  buildFilePath,
  handlerUploadImage,
} from '~/utils/file'
import fs from 'fs'
import { BASE_URL } from '~/constants/config'
import { ImageExtension } from '~/constants/extension'
import sharp from 'sharp'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
import path from 'path'
import prisma from './prisma.service'
import { EncodeStatus } from '@prisma/client'

class MediasService {
  constructor() {}

  async uploadImage(req: Request) {
    const file = await handlerUploadImage(req)
    return Promise.all(
      (file as any).files.image.map(async (item: any) => {
        const { newName, newPath } = buildFilePath(item.newFilename, IMAGE_DIR, ImageExtension.Jpg)
        await sharp(item.filepath).jpeg({ quality: 80 }).toFile(newPath)
        fs.unlinkSync(item.filepath)
        return `${BASE_URL}/static/images/${newName}`
      }),
    )
  }

  async uploadVideo(req: Request) {
    const file = await handlerUploadVideo(req)
    return (
      (await Promise.all(
        (file as any).files.video.map(async (item: any) => {
          const { newName, newPath } = buildFilePath(item.newFilename, VIDEO_DIR)
          fs.renameSync(item.filepath, newPath)
          return `${BASE_URL}/static/video-stream/${newName}`
        }),
      )) || (file as any).files.video[0]
    )
  }

  async uploadFile(req: Request) {
    const file = await handlerUploadFile(req)
    return (
      Promise.all(
        (file as any).files.file.map(async (item: any) => {
          const { newName, newPath } = buildFilePath(item.newFilename, FILE_DIR)
          fs.renameSync(item.filepath, newPath)
          return `${BASE_URL}/static/files/${newName}`
        }),
      ) || (file as any).files.file[0]
    )
  }

  async uploadVideoHls(req: Request) {
    const file = await handlerUploadVideo(req)
    return Promise.all(
      (file as any).files.video.map(async (item: any) => {
        const { newName, newPath } = buildFilePath(item.newFilename, VIDEO_DIR)
        fs.renameSync(item.filepath, newPath)
        videoQueue.enqueue(newPath)
        const videoId = newName.replace(/\.[^.]+$/, '')
        return `${BASE_URL}/static/video-hls/${videoId}/master.m3u8`
      }),
    )
  }
}

export default new MediasService()

class Queue {
  items: string[] = []
  encoding = false

  async enqueue(item: string) {
    this.items.push(item)
    const idName = path.basename(item, path.extname(item))
    await prisma.videoStatus.create({
      data: { name: idName, status: EncodeStatus.pending },
    })
    this.processEncode()
  }

  async processEncode() {
    if (this.encoding || this.items.length === 0) return
    this.encoding = true
    const videoPath = this.items.shift()!
    const idName = path.basename(videoPath, path.extname(videoPath))

    try {
      await prisma.videoStatus.update({
        where: { name: idName },
        data: { status: EncodeStatus.processing },
      })
      await encodeHLSWithMultipleVideoStreams(videoPath)
      await prisma.videoStatus.update({
        where: { name: idName },
        data: { status: EncodeStatus.success },
      })
      console.log(`Encode video ${idName} thành công! 🎉`)
    } catch (error) {
      await prisma.videoStatus.update({
        where: { name: idName },
        data: {
          status: EncodeStatus.failed,
          message: (error as Error).message || 'Lỗi không xác định khi encode',
        },
      })
      console.error(`Encode video ${idName} thất bại:`, error)
    } finally {
      this.encoding = false
      this.processEncode()
    }
  }
}

export const videoQueue = new Queue()
