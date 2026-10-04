export enum UserVerifyStatus {
  Unverified,
  Verified,
  Banned,
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
