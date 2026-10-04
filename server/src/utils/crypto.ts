import { createHash } from "crypto";

export function hashSHA256(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

export function hashPassword(password: string) {
  return hashSHA256(password + process.env.PASSWORD_SECRET);
}

export function comparePassword(password: string, hash: string) {
  return hashPassword(password) === hash;
}
