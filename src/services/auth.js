import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import crypto from "node:crypto";

import { User } from "../models/user.js";
import { Session } from "../models/session.js";
import { FIFTEEN_MINUTES, ONE_DAY } from "../constants/time.js";

export const createSession = async (userId) => {
  const accessToken = crypto.randomBytes(30).toString("base64");
  const refreshToken = crypto.randomBytes(30).toString("base64");

  return Session.create({
    userId,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
  });
};

export const setSessionCookies = (res, session) => {
  res.cookie("sessionId", session._id.toString(), {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: ONE_DAY,
  });

  res.cookie("refreshToken", session.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: ONE_DAY,
  });

  res.cookie("accessToken", session.accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: FIFTEEN_MINUTES,
  });
};

export const registerUser = async ({ email, password }) => {
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

  return {
    user,
    session,
  };
};

export const loginUser = async ({ email, password }) => {
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

  return {
    user,
    session,
  };
};

export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
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

  return createSession(currentSession.userId);
};

export const logoutUser = async (sessionId) => {
  if (!sessionId) return;

  await Session.deleteOne({ _id: sessionId });
};
