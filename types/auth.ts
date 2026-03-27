import type { Request } from "express";
import type { JWTPayload } from "../src/utils/jwt.ts";

export type AuthenticatedRequest<
  Body = any,
  Params extends Record<string, string> = Record<string, string>,
  ReqQuery = Record<string, string | string[] | undefined>,
> = Request<Params, any, Body, ReqQuery> & { user: JWTPayload };
