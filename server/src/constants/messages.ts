export const userMessage = {
  USER_NOT_FOUND: "User not found",
  INTERNAL_SERVER_ERROR: "Internal server error",
  VALIDATION_ERROR: "Validation error",

  // Email
  EMAIL_ALREADY_EXISTS: "Email already exists",
  EMAIL_ALREADY_VERIFIED: "Email already verified",
  USER_IS_BANNED: "User is banned",
  EMAIL_NOT_FOUND: "Email not found",
  EMAIL_IS_REQUIRED: "Email is required",
  EMAIL_IS_INVALID: "Email is invalid",
  EMAIL_NOT_VERIFIED: "Email not verified",
  // Password
  PASSWORD_IS_REQUIRED: "Password is required",
  PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50:
    "Password must be between 6 and 50 characters",
  PASSWORD_MUST_BE_STRONG:
    "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",

  FORGOT_PASSWORD_TOKEN_NOT_FOUND: "Forget password token not found",
  FORGOT_PASSWORD_TOKEN_IS_INVALID: "Forget password token is invalid",
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: "Forget password token is required",
  // Confirm password
  CONFIRM_PASSWORD_IS_REQUIRED: "Confirm password is required",
  CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50:
    "Confirm password must be between 6 and 50 characters",
  CONFIRM_PASSWORD_MUST_BE_STRONG:
    "Confirm password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
  CONFIRM_PASSWORD_NOT_MATCH: "Confirm password does not match",
  INVALID_PASSWORD: "Invalid password",
  NEW_PASSWORD_MUST_BE_DIFFERENT_FROM_OLD_PASSWORD:
    "New password must be different from old password",
  NAME_LENGTH_MUST_BE_FROM_1_TO_100:
    "Name must be between 1 and 100 characters",
  OLD_PASSWORD_IS_REQUIRED: "Old password is required",

  // Name
  NAME_IS_REQUIRED: "Name is required",
  NAME_MUST_BE_STRING: "Name must be a string",
  NAME_LENGTH_MUST_BE_FROM_2_TO_100:
    "Name must be between 2 and 100 characters",

  // Date of birth
  DATE_OF_BIRTH_MUST_BE_ISO8601:
    "Date of birth is invalid and must be in ISO 8601 format",

  // Refresh token
  REFRESH_TOKEN_IS_REQUIRED: "Refresh token is required",
  REFRESH_TOKEN_IS_STRING: "Refresh token must be a string",
  REFRESH_TOKEN_IS_INVALID: "Refresh token is invalid",
  REFRESH_TOKEN_NOT_FOUND: "Refresh token not found",
  // access token
  ACCESS_TOKEN_IS_REQUIRED: "Access token is required",
  ACCESS_TOKEN_IS_INVALID: "Access token is invalid",
  ACCESS_TOKEN_NOT_FOUND: "Access token not found",
  // email verify token
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: "Email verify token is required",
  EMAIL_VERIFY_TOKEN_IS_STRING: "Email verify token must be a string",
  EMAIL_VERIFY_TOKEN_IS_INVALID: "Email verify token is invalid",
  EMAIL_VERIFY_TOKEN_NOT_FOUND: "Email verify token not found",

  // Bio
  BIO_LENGTH_MUST_BE_FROM_1_TO_100: "Bio must be between 1 and 100 characters",
  // Location
  LOCATION_LENGTH_MUST_BE_FROM_1_TO_100:
    "Location must be between 1 and 100 characters",
  // Website
  WEBSITE_LENGTH_MUST_BE_FROM_1_TO_100:
    "Website must be between 1 and 100 characters",
  // Username
  USERNAME_LENGTH_MUST_BE_FROM_1_TO_30:
    "Username must be between 1 and 30 characters",
  USERNAME_MUST_BE_ALPHANUMERIC_AND_UNDERSCORE:
    "Username must be alphanumeric and underscore",
  USERNAME_ALREADY_EXISTS: "Username already exists",
  // Avatar
  AVATAR_LENGTH_MUST_BE_FROM_1_TO_100:
    "Avatar must be between 1 and 100 characters",
  // Cover photo
  COVER_PHOTO_LENGTH_MUST_BE_FROM_1_TO_100:
    "Cover photo must be between 1 and 100 characters",

  //Follow
  FOLLOWED_USER_ID_IS_REQUIRED: "Followed user id is required",
  FOLLOWED_USER_ID_IS_STRING: "Followed user id must be a string",
  FOLLOWED_USER_ID_IS_INVALID: "Followed user id is invalid",
  FOLLOWED_USER_ID_NOT_FOUND: "Followed user id not found",
  //media
  INVALID_FILE_TYPE: "Invalid file type",
  FILE_IMAGE_IS_REQUIRED: "File image is required",
  FILE_VIDEO_IS_REQUIRED: "File video is required",
  FILE_IS_REQUIRED: "File is required",
  UPLOAD_IMAGE_SUCCESS: "Upload image successfully",
  UPLOAD_VIDEO_SUCCESS: "Upload video successfully",
  UPLOAD_FILE_SUCCESS: "Upload file successfully",
  NOT_FOUND: "File not found",
  UPLOAD_VIDEO_HLS_SUCCESS: "Upload video hls successfully",
  LIKE_SUCCESS: "You like this tweet",
  UNLIKE_SUCCESS: "You unliked this tweet",
  BOOKMARK_SUCCESS: "You bookmarked this tweet",
  UNBOOKMARK_SUCCESS: "You unbookmarked this tweet",
} as const;
