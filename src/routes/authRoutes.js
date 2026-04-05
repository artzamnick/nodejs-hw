import { Router } from "express";
import { celebrate } from "celebrate";

import {
  registerUserSchema,
  loginUserSchema,
  requestResetEmailSchema,
  resetPasswordSchema,
} from "../validations/authValidation.js";

import {
  registerUser,
  loginUser,
  refreshUserSession,
  logoutUser,
  requestResetEmail,
  resetPassword,
} from "../controllers/authController.js";

const authRouter = Router();

authRouter.post("/auth/register", celebrate(registerUserSchema), registerUser);
authRouter.post("/auth/login", celebrate(loginUserSchema), loginUser);
authRouter.post("/auth/refresh", refreshUserSession);
authRouter.post("/auth/logout", logoutUser);

authRouter.post(
  "/auth/request-reset-email",
  celebrate(requestResetEmailSchema),
  requestResetEmail
);

authRouter.post(
  "/auth/reset-password",
  celebrate(resetPasswordSchema),
  resetPassword
);

export default authRouter;
