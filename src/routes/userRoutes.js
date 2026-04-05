import { Router } from "express";

import { authenticate } from "../middleware/authenticate.js";
import { upload } from "../middleware/multer.js";
import { updateAvatar } from "../controllers/userController.js";

const userRouter = Router();

userRouter.patch(
  "/users/avatar",
  authenticate,
  upload.single("avatar"),
  updateAvatar
);

export default userRouter;
