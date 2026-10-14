import { checkSchema } from "express-validator";
import { values } from "lodash";
import { HTTP_STATUS } from "~/constants/httpStatus";
import { ErrorWithStatus } from "~/models/errors";
import { TweetAudienceType, TweetType } from "~/models/schemas/Tweet.schema";
import prisma from "~/services/prisma.service";
import { validate } from "~/utils/validation";

export const createTweetValidator = validate(
  checkSchema({
    content: {
      trim: true,
      isString: true,
      custom: {
        options: async (value, { req }) => {
          const type = req.body.type as TweetType;
          const hashtags = req.body.hashtags as string[];
          const mentions = req.body.mentions as string[];
          const medias = req.body.medias as string[];
          // Retweet: content phải rỗng (không có nội dung riêng)
          if (type === TweetType.RETWEET && value) {
            throw new ErrorWithStatus({
              message: "Retweet must have empty content",
              status: HTTP_STATUS.BAD_REQUEST,
            });
          }
          // Tweet gốc và Quote Tweet: phải có ít nhất một trong content/hashtag/mention/media
          if (
            type !== TweetType.RETWEET &&
            !value &&
            hashtags.length === 0 &&
            mentions.length === 0 &&
            medias.length === 0
          ) {
            throw new ErrorWithStatus({
              message: "content must be a string and not empty",
              status: HTTP_STATUS.BAD_REQUEST,
            });
          }
          return true;
        },
      },
    },
    type: {
      isString: true,
      custom: {
        options: (value) => {
          if (!Object.values(TweetType).includes(value)) {
            throw new ErrorWithStatus({
              message: "Invalid tweet type",
              status: HTTP_STATUS.BAD_REQUEST,
            });
          }
          return true;
        },
      },
    },
    audience: {
      isString: true,
      custom: {
        options: (value) => {
          if (!Object.values(TweetAudienceType).includes(value)) {
            throw new ErrorWithStatus({
              message: "Invalid audience type",
              status: HTTP_STATUS.BAD_REQUEST,
            });
          }
          return true;
        },
      },
    },
    hashtags: {
      isArray: true,
      custom: {
        options: (value: string[]) => {
          if (value.length > 1) {
            throw new ErrorWithStatus({
              message: "Only 1 hashtag is allowed",
              status: HTTP_STATUS.BAD_REQUEST,
            });
          }
          for (const item of value) {
            if (typeof item !== "string") {
              throw new ErrorWithStatus({
                message: "Hashtags must be an array of string",
                status: HTTP_STATUS.BAD_REQUEST,
              });
            }
          }
          return true;
        },
      },
    },
    mentions: {
      isArray: true,
      custom: {
        options: async (value: string[], { req }) => {
          for (const item of value) {
            if (!item || typeof item !== "string") {
              throw new ErrorWithStatus({
                message: "Invalid user id",
                status: HTTP_STATUS.BAD_REQUEST,
              });
            }
            // 2. Kiểm tra không mention chính mình (check trước để đỡ tốn 1 query DB)
            if (item === req.decoded_authorization?.user_id) {
              throw new ErrorWithStatus({
                message: "You can't mention yourself",
                status: HTTP_STATUS.BAD_REQUEST,
              });
            }
            // 3. Kiểm tra user có tồn tại trong DB không
            const user = await prisma.user.findUnique({
              where: { id: item },
            });
            if (!user) {
              throw new ErrorWithStatus({
                message: "Invalid user",
                status: HTTP_STATUS.NOT_FOUND,
              });
            }
          }
          // 4. Bắt buộc return true để validator pass
          return true;
        },
      },
    },
    medias: {
      isArray: true,
    },
    parent_id: {
      custom: {
        options: async (value, { req }) => {
          const type = req.body.type as TweetType;
          // RETWEET và QUOTETWEET đều cần parent_id
          if (type === TweetType.RETWEET || type === TweetType.QUOTETWEET) {
            if (!value || typeof value !== "string") {
              throw new ErrorWithStatus({
                message: "parent_id must be a valid tweet id",
                status: HTTP_STATUS.BAD_REQUEST,
              });
            }
            // Kiểm tra xem tweet có tồn tại không
            const tweet = await prisma.tweet.findUnique({
              where: { id: value },
            });
            if (!tweet) {
              throw new ErrorWithStatus({
                message: "parent_id not found",
                status: HTTP_STATUS.NOT_FOUND,
              });
            }
          }
          // Tweet gốc: parent_id phải là null
          if (type === TweetType.TWEET && value) {
            throw new ErrorWithStatus({
              message: "Tweet must have null parent_id",
              status: HTTP_STATUS.BAD_REQUEST,
            });
          }
          return true;
        },
      },
    },
  }),
);
