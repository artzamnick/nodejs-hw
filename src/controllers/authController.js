import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import fs from "node:fs/promises";
import path from "node:path";
import handlebars from "handlebars";

import { User } from "../models/user.js";
import { Session } from "../models/session.js";
import { createSession, setSessionCookies } from "../services/auth.js";
import { sendEmail } from "../utils/sendMail.js";

export const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw createHttpError(400, "Email in use");
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

    const user = await User.findOne({ email });

    if (user) {
      const token = jwt.sign(
        {
          sub: user._id,
          email: user.email,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "15m",
        }
      );

      const templatePath = path.join(
        process.cwd(),
        "src",
        "templates",
        "reset-password-email.html"
      );

      const templateSource = await fs.readFile(templatePath, "utf-8");
      const template = handlebars.compile(templateSource);

      const resetLink = `${process.env.FRONTEND_DOMAIN}/reset-password?token=${token}`;

      const html = template({
        name: user.username,
        link: resetLink,
      });

      try {
        await sendEmail({
          from: process.env.SMTP_FROM,
          to: email,
          subject: "Reset your password",
          html,
        });
      } catch {
        throw createHttpError(
          500,
          "Failed to send the email, please try again later."
        );
      }
    }

    res.status(200).json({
      message: "Reset password email has been successfully sent.",
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    let payload;

    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      throw createHttpError(401, "Token is expired or invalid.");
    }

    const user = await User.findOne({
      _id: payload.sub,
      email: payload.email,
    });

    if (!user) {
      throw createHttpError(404, "User not found!");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: "Password has been successfully reset.",
    });
  } catch (error) {
    next(error);
  }
};
