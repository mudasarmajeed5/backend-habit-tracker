import type { Response, Request } from "express";

import db from "../db/connection.ts";

import { habits, habitTags, type NewHabit } from "../db/schema.ts";
import { eq, and } from "drizzle-orm";
import {
  getAuthenticatedUser,
} from "../utils/authentication.ts";

export const createHabit = async (
  req: Request<any, any, NewHabit & { tagIds: string[] }>,
  res: Response,
) => {
  try {
    const { name, frequency, description, tagIds, targetCount } = req.body;
    const result = await db.transaction(async (tx) => {
      const [newHabit] = await tx
        .insert(habits)
        .values({
          userId: req.user!.id,
          name,
          frequency,
          description,
          targetCount,
        })
        .returning();
      if (tagIds && tagIds.length > 0) {
        const habitTagValues = tagIds.map((tagId) => ({
          habitId: newHabit.id,
          tagId,
        }));
        await tx.insert(habitTags).values(habitTagValues);
      }
      return newHabit;
    });
    return res.status(201).json({
      message: "Habit Created",
      habit: result,
    });
  } catch (error) {
    console.error("Create habit error", error);
    res.status(500).json({ error: "Failed to create Habit" });
  }
};

export const getUserHabits = async (req: Request, res: Response) => {
  try {
    const habitsWithTags = await db.query.habits.findMany({
      with: {
        tags: true,
      },
      orderBy: (habits, { desc }) => [desc(habits.createdAt)],
    });
    res.json({ habits: habitsWithTags });
  } catch (error) {
    console.error("Get habit error", error);
    res.status(500).json({ error: "Failed to fetch Habits" });
  }
};

export const updateHabit = async (
  req: Request<any, any, NewHabit & { tagIds: string[] }>,
  res: Response,
) => {
  try {
    const user = getAuthenticatedUser(req);
    const id = req.params.id;
    const { tagIds, ...updates } = req.body;
    const result = await db.transaction(async (tx) => {
      const [updatedHabit] = await tx
        .update(habits)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(and(eq(habits.id, id), eq(habits.userId, user.id)))
        .returning();
      if (!updatedHabit) return null;

      if (tagIds !== undefined) {
        await tx.delete(habitTags).where(eq(habitTags.habitId, id));
        if (tagIds.length > 0) {
          const habitTagValues = tagIds.map((tagId) => ({
            habitId: id,
            tagId,
          }));
          await tx.insert(habitTags).values(habitTagValues);
        }
      }
      return updatedHabit;
    });
    if (!result) {
      return res.status(404).json({
        error: "Habit not found",
      });
    }
    return res.json({
      message: "Habit was updated",
      habit: result,
    });
  } catch (error) {
    console.error("Update habit error", error);
    return res.status(500).json({ error: "Failed to update Habit" });
  }
};

export const getHabitById = async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    
    const reqHabitId = req.params.id as string;
    const userId = user.id;
    const [userHabit] = await db
      .select()
      .from(habits)
      .where(and(eq(habits.id, reqHabitId), eq(habits.userId, userId)));
    if (!userHabit) {
      return res.status(404).json({ error: "Habit not found" });
    }
    return res.json({ habit: userHabit });
  } catch (error) {
    console.error("Error getting habit", error);
    return res.status(500).json({ error: "Failed to Get Habit" });
  }
};
export const deleteHabitById = async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const habitId = req.params.id as string;
    const [deletedHabit] = await db
      .delete(habits)
      .where(and(eq(habits.id, habitId), eq(habits.userId, user.id)))
      .returning();
    if (!deletedHabit) {
      return res.status(404).json({ error: "Habit not found" });
    }
    return res.json({
      message: "Habit Deleted successfully",
      deletedId: deletedHabit.id,
    });
  } catch (error) {
    console.error("Error deleting habit", error);
    return res.status(500).json({ error: "Failed to delete Habit" });
  }
};
