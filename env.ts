import { env as loadEnv } from "custom-env";
import z from "zod";

process.env.APP_STAGE = process.env.APP_STAGE || "dev";

// isProduction might be used for sentry logging etc.
const isProduction = process.env.APP_STAGE === "prod";
const isDevelopment = process.env.APP_STAGE === "dev";
const isTesting = process.env.APP_STAGE === "test";

if (isDevelopment) {
  loadEnv();
} else if (isTesting) {
  loadEnv("test");
}
// else if (isProduction){ enableSentryLogs() }

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  APP_STAGE: z.enum(["prod", "test", "dev"]).default("prod"),
  PORT: z.coerce.number().positive().default(3000),
  DATABASE_URL: z.string().startsWith("postgresql://"),
  JWT_SECRET: z.string().min(32, "Must be 32 characters long"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  BCRYPT_ROUNDS: z.coerce.number().min(10).max(20).default(12),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (e) {
  if (e instanceof z.ZodError) {
    console.log("Invalid Environment Variables");
    
    console.error(JSON.stringify(z.flattenError(e).fieldErrors, null, 2));
    process.exit(1);
  }
  throw e;
}

export const isProd = () => env.APP_STAGE === "prod";
export const isTest = () => env.APP_STAGE === "test";
export const isDev = () => env.APP_STAGE === "dev";

export { env };
export default env;
