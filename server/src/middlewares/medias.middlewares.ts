import { checkSchema } from "express-validator";
import { ErrorWithStatus } from "~/models/errors";
import { validate } from "~/utils/validation";

export const uploadImageValidator = validate(
  checkSchema(
    {
      file: {
        custom: {
          options: (value, { req }) => {
            if (!req.files) {
              throw new ErrorWithStatus({
                message: "Image is required",
                status: 400,
              });
            }
            return true;
          },
        },
      },
    },
    ["body"],
  ),
);
