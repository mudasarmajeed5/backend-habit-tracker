import {
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/userController.ts";
import { Router } from "express";
const router = Router();
import { validateBody } from "../middleware/validation.ts";
import { authenticatedToken } from "../middleware/auth.ts";
import z from "zod";

router.use(authenticatedToken);

const updateProfileSchema = z.object({
  email: z.email("Invalid email format").optional(),
  username: z
    .string()
    .min(3, "Username must be 3 characters long")
    .max(50, "Username too long")
    .optional(),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current Password is required"),
  newPassword: z
    .string()
    .min(8, "Minimum 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and number",
    ),
});

router.get("/profile", getProfile);
router.put("/profile", validateBody(updateProfileSchema), updateProfile);
router.post(
  "/change-password",
  validateBody(changePasswordSchema),
  changePassword,
);

export default router;
