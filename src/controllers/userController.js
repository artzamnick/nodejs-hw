import createHttpError from "http-errors";

import { User } from "../models/user.js";
import { saveFileToCloudinary } from "../utils/saveFileToCloudinary.js";

export const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw createHttpError(400, "Avatar file is required");
    }

    const uploadResult = await saveFileToCloudinary(req.file.buffer, req.user._id);

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: uploadResult.secure_url },
      { new: true }
    );

    if (!updatedUser) {
      throw createHttpError(404, "User not found!");
    }

    res.status(200).json({
      message: "Successfully uploaded avatar!",
      data: {
        avatar: updatedUser.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};
