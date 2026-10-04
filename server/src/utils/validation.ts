import express from "express";
import { validationResult, ValidationChain } from "express-validator";
import { RunnableValidationChains } from "express-validator/lib/middlewares/schema";
import { HTTP_STATUS } from "~/constants/httpStatus";
import { EntityError, ErrorWithStatus } from "~/models/errors";

// can be reused by many routes
export const validate = (
  validation: RunnableValidationChains<ValidationChain>,
) => {
  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    await validation.run(req);
    const errors = validationResult(req);
    // khong co loi thi tiep tuc
    if (errors.isEmpty()) {
      return next();
    }
    const errorObject = errors.mapped();

    const entityError = new EntityError({ errors: {} });
    for (const key in errorObject) {
      const { msg } = errorObject[key];
      // tra ve loi khi validate sai
      if (
        msg instanceof ErrorWithStatus &&
        msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY
      ) {
        return next(msg);
      }
      entityError.errors[key] = errorObject[key];
    }

    next(entityError);
  };
};
