import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { isTest } from "../env.ts";
const app = express();
app.use(helmet());
app.use(express.json());
app.use(
  morgan("dev", {
    skip: () => isTest(),
  }),
);
app.get("/health", (_req, res) => {
  res.json({
    status: "up",
  });
});

export { app };
export default app;
