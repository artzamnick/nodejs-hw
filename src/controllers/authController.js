import {
  registerUser as registerUserService,
  loginUser as loginUserService,
  refreshUsersSession as refreshUsersSessionService,
  logoutUser as logoutUserService,
  setSessionCookies,
} from "../services/auth.js";

export const registerUser = async (req, res, next) => {
  try {
    const { user, session } = await registerUserService(req.body);

    setSessionCookies(res, session);

    res.status(201).json({
      message: "User registered",
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { user, session } = await loginUserService(req.body);

    setSessionCookies(res, session);

    res.status(200).json({
      message: "User logged in successfully",
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshUsersSession = async (req, res, next) => {
  try {
    const { sessionId, refreshToken } = req.cookies;

    const session = await refreshUsersSessionService({
      sessionId,
      refreshToken,
    });

    setSessionCookies(res, session);

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

export const logoutUser = async (req, res, next) => {
  try {
    const { sessionId } = req.cookies;

    await logoutUserService(sessionId);

    res.clearCookie("sessionId");
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
