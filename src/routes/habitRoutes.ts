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
  completeHabit,
  getHabitsByTag,
  addTagsToHabit,
} from "../controllers/habitController.ts";

const router = Router();
router.use(authenticatedToken);

// create habit-schema

const createHabitSchema = z.object({
  name: z
    .string()
    .min(1, "Habit name is required")
    .max(100, "Habit name is too long"),
  description: z.string().optional(),
  frequency: z.enum(["daily", "weekly", "monthly"], {
    error: () => ({
      message: "Frequency must be: daily, weekly or monthly",
    }),
  }),
  targetCount: z.coerce.number().int().positive().default(1),
  tagIds: z.array(z.uuid()).optional(),
});
const updateHabitSchema = z.object({
  name: z
    .string()
    .min(1, "Habit name is required")
    .max(100, "Habit name is too long")
    .optional(),
  description: z.string().optional(),
  frequency: z.enum(["daily", "weekly", "monthly"]).optional(),
  targetCount: z.coerce.number().int().positive().optional(),
  tagIds: z.array(z.uuid()).optional(),
  isActive: z.boolean().optional(),
});
const uuidSchema = z.object({
  id: z.uuid(),
});

router.get("/", getUserHabits);

router.get("/:id", validateParams(uuidSchema), getHabitById);

router.post("/", validateBody(createHabitSchema), createHabit);

router.put(
  "/:id",
  validateParams(uuidSchema),
  validateBody(updateHabitSchema),
  updateHabit,
);

router.delete("/:id", validateParams(uuidSchema), deleteHabitById);

// Additional Habit route
router.post(
  "/:id/complete",
  validateParams(uuidSchema),
  validateBody(z.object({ note: z.string().optional() })),
  completeHabit,
);

// Tag relationship routes

router.get(
  "/tag/:tagId",
  validateParams(
    z.object({
      tagId: z.uuid(),
    }),
  ),
  getHabitsByTag,
);

router.post(
  "/:id/tags",
  validateParams(uuidSchema),
  validateBody(
    z.object({
      tagIds: z.array(z.uuid().min(1)),
    }),
  ),
  addTagsToHabit,
);
export default router;
