import type { JWTPayload } from "../src/utils/jwt.ts";

declare module 'express-serve-static-core' {
  interface Request {
    user?: JWTPayload;
  }
}
