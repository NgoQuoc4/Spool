import { Router } from "express";
import { wrapAsync } from "~/utils/handles";
import { uploadImageValidator } from "~/middlewares/medias.middlewares";
import {
  uploadImageController,
  uploadVideoController,
  uploadFileController,
  uploadVideoHlsController,
} from "~/controllers/medias.controller";
import { accessTokenValidator } from "~/middlewares/users.middlewares";

const mediasRouter = Router();

// Upload image
mediasRouter.post(
  "/upload-image",
  accessTokenValidator,
  // uploadImageValidator,
  wrapAsync(uploadImageController),
);
// Upload video
mediasRouter.post(
  "/upload-video",
  accessTokenValidator,
  // uploadVideoValidator,
  wrapAsync(uploadVideoController),
);
// Upload file
mediasRouter.post(
  "/upload-file",
  accessTokenValidator,
  // uploadFileValidator,
  wrapAsync(uploadFileController),
);

mediasRouter.post(
  "/upload-video-hls",
  accessTokenValidator,
  wrapAsync(uploadVideoHlsController),
);
export default mediasRouter;
