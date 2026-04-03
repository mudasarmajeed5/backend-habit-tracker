import type { Request, Response } from "express";
import db from "../db/connection.ts";
import { users, type NewUser } from "../db/schema.ts";
import { getAuthenticatedUser } from "../utils/authentication.ts";
import { eq } from "drizzle-orm";
import { comparePassword, hashPassword } from "../utils/passwords.ts";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const [currentUser] = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        username: users.username,
        email: users.email,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, user.id));
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User Fetched successfully",
      data: currentUser,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch profile" });
  }
};
export const updateProfile = async (
  req: Request<any, any, Partial<NewUser>>,
  res: Response,
) => {
  try {
    const { email, firstName, lastName, username } = req.body;
    const user = getAuthenticatedUser(req);
    const [updatedUser] = await db
      .update(users)
      .set({
        email,
        firstName,
        lastName,
        username,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        username: users.username,
        updatedAt: users.updatedAt,
      });

    return res.status(200).json({
      data: {
        updatedUser,
      },
      success: true,
      message: "Profile Updated",
    });
  } catch (err) {
    console.error("Failed to update user: ", err);
    return res.status(500).json({
      success: false,
      error: (err as Error).message,
    });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const { currentPassword, newPassword } = req.body;
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id));
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        error: "User not exist",
      });
    }
    const isValidPassword = await comparePassword(
      currentPassword,
      currentUser.password,
    );
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: "Incorrect Password.",
      });
    }
    const hashedPassword = await hashPassword(newPassword);
    await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
    return res.status(200).json({
      success: true,
      message: "Password updated Successfully",
    });
  } catch (error) {
    console.error("Error updating password", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to updated Password" });
  }
};
