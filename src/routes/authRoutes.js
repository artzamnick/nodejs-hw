import { Router } from "express";
import { celebrate } from "celebrate";

import {
  registerUserSchema,
  loginUserSchema,
} from "../validations/authValidation.js";

import {
  registerUser,
  loginUser,
  refreshUsersSession,
  logoutUser,
} from "../controllers/authController.js";

const authRouter = Router();

authRouter.post("/auth/register", celebrate(registerUserSchema), registerUser);

authRouter.post("/auth/login", celebrate(loginUserSchema), loginUser);

authRouter.post("/auth/refresh", refreshUsersSession);

authRouter.post("/auth/logout", logoutUser);

export default authRouter;
