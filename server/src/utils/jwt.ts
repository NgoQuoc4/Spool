import "dotenv/config";
import jwt, { SignOptions } from "jsonwebtoken";
import { TokenPayload } from "~/models/requests/User.requests";

export const signToken = ({
  payload,
  privateKey,
  options = {
    algorithm: "HS256",
  } as SignOptions,
  exp,
}: {
  payload: string | Buffer | Object;
  privateKey: string;
  options?: SignOptions;
  exp?: number;
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(
      payload,
      privateKey,
      {
        ...options,
        ...(exp ? { exp } : {}),
      } as SignOptions,
      (error, token) => {
        if (error) {
          reject(error);
        }
        resolve(token as string);
      },
    );
  });
};

export const verifyToken = ({
  token,
  secretKey,
}: {
  token: string;
  secretKey: string;
}) => {
  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, secretKey, (error, decoded) => {
      if (error) {
        reject(error);
      }
      resolve(decoded as TokenPayload);
    });
  });
};
