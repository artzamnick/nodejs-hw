import bcrypt from "bcrypt";
import createHttpError from "http-errors";

import { User } from "../models/user.js";
import { Session } from "../models/session.js";
import {
  createSession,
  setSessionCookies,
  requestResetToken,
  resetPassword,
} from "../services/auth.js";

export const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw createHttpError(409, "Email in use");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
    });

    const session = await createSession(user._id);

    setSessionCookies(res, session);

    res.status(201).json({
      status: 201,
      message: "Successfully registered a user!",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw createHttpError(401, "Invalid email or password");
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      throw createHttpError(401, "Invalid email or password");
    }

    await Session.deleteOne({ userId: user._id });

    const session = await createSession(user._id);

    setSessionCookies(res, session);

    res.status(200).json({
      status: 200,
      message: "Successfully logged in an user!",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshUserSession = async (req, res, next) => {
  try {
    const { sessionId, refreshToken } = req.cookies;

    if (!sessionId || !refreshToken) {
      throw createHttpError(401, "Session not found");
    }

    const currentSession = await Session.findOne({
      _id: sessionId,
      refreshToken,
    });

    if (!currentSession) {
      throw createHttpError(401, "Session not found");
    }

    if (new Date() > currentSession.refreshTokenValidUntil) {
      throw createHttpError(401, "Session expired");
    }

    await Session.deleteOne({ _id: currentSession._id });

    const session = await createSession(currentSession.userId);

    setSessionCookies(res, session);

    res.status(200).json({
      status: 200,
      message: "Successfully refreshed a session!",
      data: {
        accessToken: session.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    const { sessionId } = req.cookies;

    if (sessionId) {
      await Session.deleteOne({ _id: sessionId });
    }

    res.clearCookie("sessionId");
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const requestResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    await requestResetToken(email);

    res.status(200).json({
      message: "Reset password email has been successfully sent.",
    });
  } catch (error) {
    next(error);
  }
};

export const resetPwd = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    await resetPassword(token, password);

    res.status(200).json({
      message: "Password has been successfully reset.",
    });
  } catch (error) {
    next(error);
  }
};
