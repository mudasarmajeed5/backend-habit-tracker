import type { Request, Response } from "express";
import { getAuthenticatedUser } from "../utils/authentication.ts";
import db from "../db/connection.ts";

import { tags, habitTags } from "../db/schema.ts";
import { eq, desc } from "drizzle-orm";

export const createTag = async (req: Request, res: Response) => {
  try {
    getAuthenticatedUser(req);

    const { name, color } = req.body;
    const existingTags = await db
      .select()
      .from(tags)
      .where(eq(tags.name, name));
    if (existingTags) {
      return res.status(409).json({
        message: "Tag already exists",
        success: true,
      });
    }
    const [newTag] = await db
      .insert(tags)
      .values({
        name,
        color: color || "#6B7280",
      })
      .returning();
    return res.status(201).json({
      message: "Tag Created successfully",
      success: false,
      tag: newTag,
    });
  } catch (error) {
    console.error("Failed to created tag", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create tag",
    });
  }
};

export const getTags = async (req: Request, res: Response) => {
  try {
    const allTags = await db.select().from(tags).orderBy(tags.name);
    return res.status(200).json({
      success: true,
      message: "Tags fetched successfully",
      tags: allTags,
    });
  } catch (error) {
    console.error("Failed to fetch tags", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch tags",
    });
  }
};
export const getTagById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const tagWithHabits = await db.query.tags.findFirst({
      where: {
        id,
      },
      with: {
        habits: {
          columns: {
            id: true,
            name: true,
            description: true,
            isActive: true,
          },
        },
      },
    });
    if (!tagWithHabits) {
      return res.status(404).json({ success: false, message: "Tag Not found" });
    }
    return res.json({
      success: true,
      tag: tagWithHabits,
    });
  } catch (error) {
    console.error("GET tag error", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch tag", success: false });
  }
};

export const updateTag = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, color } = req.body;
    if (name) {
      const existingTag = await db.query.tags.findFirst({
        where: {
          name,
        },
      });
      if (existingTag && existingTag.id !== id) {
        return res.status(409).json({
          success: false,
          message: "Tag with this name already exists",
        });
      }
    }

    const [updatedTag] = await db
      .update(tags)
      .set({
        ...(name && { name }),
        ...(color && { color }),
        updatedAt: new Date(),
      })
      .where(eq(tags.id, id))
      .returning();
    if (!updatedTag) {
      return res.status(404).json({ success: false, message: "Tag not found" });
    }
    return res.json({
      message: "Tag Updated successfully",
      tag: updatedTag,
    });
  } catch (error) {}
};

export const deleteTag = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const deletedTag = await db.delete(tags).where(eq(tags.id, id)).returning();
    if (!deletedTag) {
      return res.status(404).json({ success: false, message: "Tag not found" });
    }
    return res.json({ success: true, message: "Tag deleted successfully" });
  } catch (error) {
    console.error("Delete tag error: ", error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete tag",
    });
  }
};

export const getPopularTags = async (req: Request, res: Response) => {
  try {
    const tagsWithCount = await db.query.tags.findMany({
      with: {
        habits: true,
      },
    });

    const popularTags = tagsWithCount
      .map((tag) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        usageCount: tag.habits.length,
        createdAt: tag.createdAt,
        updatedAt: tag.updatedAt,
      }))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10);
    return res.json({ success: true, tags: popularTags });
  } catch (error) {
    console.error("Get Popular tags error: ", error);
    return res.status(500).json({
      message: "Failed to get popular tags",
      success: false,
    });
  }
};

export const getHabitTags = async (req: Request, res: Response) => {
  try {
    const data = await db.query.habits.findMany({
      with: {
        tags: {
          columns: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });
    return res.json({
      success: true,
      habits: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to fetch habit tags",
    });
  }
};
