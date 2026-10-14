import { TokenPayload } from "~/models/requests/User.requests";
import { Request } from "express";
import { User } from "@prisma/client";

declare module "express" {
  interface Request {
    user?: User;
    decoded_authorization?: TokenPayload;
    decoded_refresh_token?: TokenPayload;
    decoded_verify_email_token?: TokenPayload;
    decoded_forgot_password_token?: TokenPayload;
  }
}
