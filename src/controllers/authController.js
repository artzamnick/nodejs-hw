import {
  registerUser,
  loginUser,
  refreshUsersSession,
  logoutUser,
} from "../services/auth.js";

const setupSession = (res, session) => {
  res.cookie("sessionId", session._id.toString(), {
    httpOnly: true,
    expires: session.refreshTokenValidUntil,
  });

  res.cookie("refreshToken", session.refreshToken, {
    httpOnly: true,
    expires: session.refreshTokenValidUntil,
  });
};

export const registerUserController = async (req, res, next) => {
  try {
    const { user, session } = await registerUser(req.body);

    setupSession(res, session);

    res.status(201).json({
      message: "User registered",
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
        accessToken: session.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const loginUserController = async (req, res, next) => {
  try {
    const { user, session } = await loginUser(req.body);

    setupSession(res, session);

    res.status(200).json({
      message: "User logged in successfully",
      data: {
        accessToken: session.accessToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshSessionController = async (req, res, next) => {
  try {
    const { sessionId, refreshToken } = req.cookies;

    const session = await refreshUsersSession({
      sessionId,
      refreshToken,
    });

    setupSession(res, session);

    res.status(200).json({
      message: "Session refreshed",
      data: {
        accessToken: session.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logoutUserController = async (req, res, next) => {
  try {
    const { sessionId } = req.cookies;

    await logoutUser(sessionId);

    res.clearCookie("sessionId");
    res.clearCookie("refreshToken");

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
