import { Router } from "express";
import { validateBody, validateParams } from "../middleware/validation.ts";

import z from "zod";

import { authenticatedToken } from "../middleware/auth.ts";
import {
  createHabit,
  deleteHabitById,
  getHabitById,
  getUserHabits,
  updateHabit,
} from "../controllers/habitController.ts";

const router = Router();
router.use(authenticatedToken);

// create habit-schema

const createHabitSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  frequency: z.string(),
  targetCount: z.number().optional(),
  tagIds: z.array(z.string()).optional(),
});

const createParamsSchema = z.object({
  id: z.uuid(),
});

router.get("/", getUserHabits);

router.get("/:id", validateParams(createParamsSchema), getHabitById);

router.post("/", validateBody(createHabitSchema), createHabit);

router.patch("/:id", validateParams(createParamsSchema), updateHabit);

router.delete("/:id", validateParams(createParamsSchema), deleteHabitById);

router.post(
  "/:id/complete",
  validateParams(createParamsSchema),
  validateBody(createHabitSchema),
  (req, res) => {
    res.status(201).json({ message: "Completed Habit" });
  },
);

export default router;
