import type { Request, Response } from "express";
import { db } from "../db/connection.ts";
import { users, type LoginUser, type NewUser } from "../db/schema.ts";

import { generateToken } from "../utils/jwt.ts";
import { comparePassword, hashPassword } from "../utils/passwords.ts";
import { eq } from "drizzle-orm";

export const register = async (
  req: Request<any, any, NewUser>,
  res: Response,
) => {
  try {
    const hashedPassword = await hashPassword(req.body.password);
    const [user] = await db
      .insert(users)
      .values({
        ...req.body,
        password: hashedPassword,
      })
      .returning({
        id: users.id,
        email: users.email,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        createdAt: users.createdAt,
      });

    const token = await generateToken({
      email: user.email,
      id: user.id,
      username: user.username,
    });
    return res.status(201).json({
      message: "User created",
      user,
      token,
    });
  } catch (e) {
    // at this point the only error that is caused, is because of us so we send 500.
    res.status(500).json({ error: "Failed to create user." });
  }
};
export const login = async (
  req: Request<any, any, LoginUser>,
  res: Response,
) => {
  try {
    const { email, password } = req.body;
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (!user) {
      return res.status(401).json({ error: "Invalid Credentials" });
    }
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid Credentials" });
    }
    const token = await generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
    });
    return res.status(200).json({
      message: "Login successfull",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      token,
    });
  } catch (e) {
    return res.status(500).json({ error: "Failed to login" });
  }
};
