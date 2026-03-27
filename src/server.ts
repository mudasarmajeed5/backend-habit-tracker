import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import authRoutes from "./routes/authRoutes.ts";
import { isTest } from "../env.ts";
const app = express();
app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, 
  }),
);
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
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);

export { app };
export default app;
