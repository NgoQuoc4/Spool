import { checkSchema } from "express-validator";
import prisma from "~/services/prisma.service";
import { validate } from "~/utils/validation";

export const tweetValidator = validate(
  checkSchema({
    tweetId: {
      custom: {
        options: async (value, { req }) => {
          const id =
            value ||
            req.params?.tweetId ||
            req.params?.tweet_id ||
            req.body?.tweetId ||
            req.body?.tweet_id;

          if (!id || typeof id !== "string" || !id.trim()) {
            throw new Error("Invalid tweet id");
          }

          const tweet = await prisma.tweet.findUnique({
            where: { id: id.trim() },
          });

          if (!tweet) {
            throw new Error("Tweet not found");
          }

          return true;
        },
      },
    },
  }),
);

export const tweetsValidator = validate(
  checkSchema({
    limit: {
      isNumeric: {
        errorMessage: "Invalid limit",
      },
      custom: {
        options: async (value) => {
          const limit = Number(value);
          if (limit > 100) {
            throw new Error("Limit must be less than or equal to 100");
          }
          return true;
        },
      },
    },
    page: {
      isNumeric: {
        errorMessage: "Invalid page",
      },
      custom: {
        options: async (value) => {
          const page = Number(value);
          if (page < 1) {
            throw new Error("Page must be greater than or equal to 1");
          }
          return true;
        },
      },
    },
  }),
);
