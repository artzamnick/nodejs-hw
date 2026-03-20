import { Router } from "express";
import { celebrate, Segments } from "celebrate";

import {
  registerSchema,
  loginSchema,
} from "../validations/authValidation.js";

import {
  registerUserController,
  loginUserController,
  refreshSessionController,
  logoutUserController,
} from "../controllers/authController.js";

const authRouter = Router();

authRouter.post(
  "/auth/register",
  celebrate({
    [Segments.BODY]: registerSchema,
  }),
  registerUserController
);

authRouter.post(
  "/auth/login",
  celebrate({
    [Segments.BODY]: loginSchema,
  }),
  loginUserController
);

authRouter.post("/auth/refresh", refreshSessionController);

authRouter.post("/auth/logout", logoutUserController);

export default authRouter;
