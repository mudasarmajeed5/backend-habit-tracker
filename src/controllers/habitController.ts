import type { Response, Request } from "express";

import db from "../db/connection.ts";

import {
  entries,
  habits,
  habitTags,
  tags,
  type NewHabit,
} from "../db/schema.ts";
import { eq, and, inArray } from "drizzle-orm";
import { getAuthenticatedUser } from "../utils/authentication.ts";

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
      success: true,
      message: "Habit Created",
      data: { habit: result },
    });
  } catch (error) {
    console.error("Create habit error", error);
    res.status(500).json({ success: false, error: "Failed to create Habit" });
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
    res.json({
      success: true,
      message: "Habits fetched successfully",
      data: { habits: habitsWithTags },
    });
  } catch (error) {
    console.error("Get habit error", error);
    res.status(500).json({ success: false, error: "Failed to fetch Habits" });
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
        success: false,
        error: "Habit not found",
      });
    }
    return res.json({
      success: true,
      message: "Habit was updated",
      data: { habit: result },
    });
  } catch (error) {
    console.error("Update habit error", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to update Habit" });
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
      return res.status(404).json({ success: false, error: "Habit not found" });
    }
    return res.json({
      success: true,
      message: "Habit Fetched Successfully",
      data: { habit: userHabit },
    });
  } catch (error) {
    console.error("Error getting habit", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to Get Habit" });
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
      return res.status(404).json({ success: false, error: "Habit not found" });
    }
    return res.json({
      success: true,
      message: "Habit Deleted successfully",
      data: { deletedId: deletedHabit.id },
    });
  } catch (error) {
    console.error("Error deleting habit", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to delete Habit" });
  }
};

export const completeHabit = async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const habitId = req.params.id as string;
    const note: string = req.body.note ?? "";
    const habit = await db.query.habits.findFirst({
      where: {
        AND: [{ id: habitId }, { userId: user.id }],
      },
    });
    if (!habit) {
      return res.status(404).json({ success: false, error: "Habit not found" });
    }
    // now we create an entry for that habit.
    const entry = await db
      .insert(entries)
      .values({
        habitId: habit.id,
        note,
      })
      .returning();
    return res.status(201).json({
      success: true,
      message: "Entry added successfully",
      data: { entry },
    });
  } catch (error) {
    console.error("Error creating entry", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to create Entry" });
  }
};

// get habits by tag

export const getHabitsByTag = async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const tagId = req.params.tagId as string;
    const tagWithHabits = await db.query.tags.findFirst({
      where: { id: tagId },
      with: {
        habits: {
          where: { userId: user.id },
          with: { tags: true },
          orderBy: (habit, { desc }) => [desc(habit.createdAt)],
        },
      },
    });

    const habitsByTag = tagWithHabits?.habits ?? [];

    return res.json({
      success: true,
      message: "Fetched Habits by tag",
      data: { habits: habitsByTag },
    });
  } catch (error) {
    console.error("Error getting habits by tag", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch habits by tag" });
  }
};

export const addTagsToHabit = async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const habitId = req.params.id as string;
    const tagIds = req.body.tagIds as string[];
    const habit = await db.query.habits.findFirst({
      where: {
        AND: [{ id: habitId }, { userId: user.id }],
      },
    });
    if (!habit) {
      return res.status(404).json({ success: false, error: "Habit not found" });
    }

    await db.transaction(async (tx) => {
      await tx.delete(habitTags).where(eq(habitTags.habitId, habitId));

      const newTagRelations = tagIds.map((tagId) => ({ habitId, tagId }));
      await tx.insert(habitTags).values(newTagRelations);
    });
    const addedTags = await db
      .select()
      .from(tags)
      .where(inArray(tags.id, tagIds));
    return res.status(200).json({
      success: true,
      message: "Added tags to Habit",
      data: { tags: addedTags },
    });
  } catch (error) {
    console.error("Error adding tags", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to add tags" });
  }
};
