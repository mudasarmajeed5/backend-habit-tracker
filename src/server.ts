import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import authRoutes from "./routes/authRoutes.ts";
import habitRoutes from "./routes/habitRoutes.ts";
import userRoutes from "./routes/userRoutes.ts";
import tagRoutes from "./routes/tagRoutes.ts";
import { isTest } from "../env.ts";
import { errorHandler,notFound } from "./middleware/errorHandler.ts";
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
app.use("/api/habits", habitRoutes);
app.use("/api/user", userRoutes);
app.use('/api/tags', tagRoutes)

app.use(notFound)
app.use(errorHandler)

export { app };
export default app;
