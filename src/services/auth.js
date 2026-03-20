import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import createHttpError from "http-errors";

import { User } from "../models/user.js";
import { Session } from "../models/session.js";
import { FIFTEEN_MINUTES, ONE_DAY } from "../constants/time.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

const createSession = async (userId) => {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "1d",
  });

  return Session.create({
    userId,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
  });
};

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw createHttpError(409, "Email in use");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
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

export const refreshUsersSession = async ({ refreshToken, sessionId }) => {
  const currentSession = await Session.findById(sessionId);

  if (
    !currentSession ||
    currentSession.refreshToken !== refreshToken ||
    new Date() > currentSession.refreshTokenValidUntil
  ) {
    throw createHttpError(401, "Session not found");
  }

  await Session.deleteOne({ _id: currentSession._id });

  const session = await createSession(currentSession.userId);

  return session;
};

export const logoutUser = async (sessionId) => {
  if (!sessionId) return;

  await Session.deleteOne({ _id: sessionId });
};
