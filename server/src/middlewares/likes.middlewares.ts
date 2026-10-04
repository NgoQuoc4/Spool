import { checkSchema } from "express-validator";
import { ObjectId } from "mongodb";
import dataservice from "~/services/database.service";
import { validate } from "~/utils/validation";

export const tweetValidator = validate(
  checkSchema({
    tweet_id: {
      isMongoId: {
        errorMessage: "Invalid tweet id",
      },
      custom: {
        options: async (value) => {
          const tweet = await dataservice.tweets.findOne({
            _id: new ObjectId(value),
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
