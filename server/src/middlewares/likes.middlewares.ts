import { checkSchema } from "express-validator";
import prisma from "~/services/prisma.service";
import { validate } from "~/utils/validation";

export const tweetValidator = validate(
  checkSchema({
    tweetId: {
      isString: {
        errorMessage: "Invalid tweet id",
      },
      notEmpty: {
        errorMessage: "Tweet id is required",
      },
      custom: {
        options: async (value) => {
          const tweet = await prisma.tweet.findUnique({
            where: { id: value },
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
