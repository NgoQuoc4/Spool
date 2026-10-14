export enum UserVerifyStatus {
  Unverified = "Unverified",
  Verified = "Verified",
  Banned = "Banned",
}
export enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerificationToken,
}
export enum MediaType {
  Image = "image",
  Video = "video",
  HLS = "hls",
  File = "file",
}
export enum EncodeStatus {
  Pending = "pending",
  Processing = "processing",
  Success = "success",
  Failed = "failed",
}
