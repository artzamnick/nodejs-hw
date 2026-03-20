import jwt from "jsonwebtoken";
import createHttpError from "http-errors";

import { Session } from "../models/session.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw createHttpError(401, "Missing access token");
    }

    const [bearer, token] = authHeader.split(" ");

    if (bearer !== "Bearer" || !token) {
      throw createHttpError(401, "Invalid auth header");
    }

    let payload;

    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      throw createHttpError(401, "Invalid token");
    }

    const session = await Session.findOne({
      accessToken: token,
      userId: payload.userId,
    });

    if (!session || new Date() > session.accessTokenValidUntil) {
      throw createHttpError(401, "Session expired");
    }

    req.user = payload;

    next();
  } catch (error) {
    next(error);
  }
};
