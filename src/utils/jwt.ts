import { jwtVerify, SignJWT, type JWTPayload as JoseJWTPayload } from "jose";
import { createSecretKey } from "crypto";
import env from "../../env.ts";
export interface JWTPayload extends JoseJWTPayload {
  id: string;
  email: string;
  username: string;
}

export const generateToken = (payload: JWTPayload) => {
  const secretKey = createSecretKey(Buffer.from(env.JWT_SECRET));

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN || "7d")
    .sign(secretKey);
};

export const verifyToken = async (token: string): Promise<JWTPayload> => {
  const secretKey = createSecretKey(Buffer.from(env.JWT_SECRET));

  const { payload } = await jwtVerify(token, secretKey);
  return payload as unknown as JWTPayload;
};
