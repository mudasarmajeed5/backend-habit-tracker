import type { Request } from "express";
import type { JWTPayload } from "./jwt.ts";

/**
 * Throws if user is not authenticated and returns the full JWTPayload
 */
export function getAuthenticatedUser(req: Request): JWTPayload {
  if (!req.user) {
    throw new Error("Unauthorized");
  }
  return req.user;
}