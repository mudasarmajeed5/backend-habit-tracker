import { Router } from "express";
import { validateBody, validateParams } from "../middleware/validation.ts";

import z from "zod";

import { authenticatedToken } from "../middleware/auth.ts";
import { createHabit } from "../controllers/habitController.ts";

const router = Router();
router.use(authenticatedToken);
