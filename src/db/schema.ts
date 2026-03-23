import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { defineRelations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email").notNull().unique(),
  username: varchar("username", { length: 50 }).unique().notNull(),
  password: varchar("password", {
    length: 255,
  }).notNull(),
  firstName: varchar("first_name", { length: 50 }),
  lastName: varchar("last_name", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const habits = pgTable("habits", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  frequency: varchar("frequency", { length: 20 }).notNull(),
  targetCount: integer("target_count").default(1).notNull(),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const entries = pgTable("entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  habitId: uuid("habit_id").references(() => habits.id, {
    onDelete: "cascade",
  }).notNull(),
  completionDate: timestamp("completion_date").defaultNow().notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  color: varchar("color", { length: 7 }).default("#6b7280"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const habitTags = pgTable("habitTags", 
  {
  id: uuid("id").defaultRandom().primaryKey(),
  habitId: uuid("habit_id")
    .references(() => habits.id, { onDelete: "cascade" })
    .notNull(),
  tagId: uuid("tag_id")
    .references(() => tags.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  }, 
  (table) =>({
    uniqueHabitTag: uniqueIndex("habit_tag_unique").on(table.habitId, table.tagId)
  })

);

const schema = { habits, entries, tags, habitTags, users };

export const relations = defineRelations(schema, (r) => ({
  // users -> habits (one-to-many)
  users: {
    habits: r.many.habits({
      from: r.users.id,
      to: r.habits.userId,
    }),
  },
  // habits -> user (many-to-one)
  habits: {
    user: r.one.users({
      from: r.habits.userId,
      to: r.users.id,
    }),
    entries: r.many.entries({
      from: r.habits.id,
      to: r.entries.habitId,
    }),
    tags: r.many.tags({
      from: r.habits.id.through(r.habitTags.habitId),
      to: r.tags.id.through(r.habitTags.tagId),
    }),
  },
  entries: {
    habit: r.one.habits({
      from: r.entries.habitId,
      to: r.habits.id,
    }),
  },
  
  tags: {
    habits: r.many.habits({
      from: r.tags.id.through(r.habitTags.tagId),
      to: r.habits.id.through(r.habitTags.habitId),
    }),
  },
  // defines how the junction table relates.
  habitTags: {
    habit: r.one.habits({
      from: r.habitTags.habitId,
      to: r.habits.id,
    }),
    tag: r.one.tags({
      from: r.habitTags.tagId,
      to: r.tags.id,
    }),
  },
}));

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type LoginUser = {
  email: string, 
  password: string
}
export type Habit = typeof habits.$inferSelect
export type NewHabit = typeof habits.$inferInsert

export type Entry = typeof entries.$inferSelect
export type NewEntry = typeof entries.$inferInsert

export type Tag = typeof tags.$inferSelect
export type NewTag = typeof tags.$inferInsert

export type HabitTag = typeof habitTags.$inferSelect
export type NewHabitTag = typeof habitTags.$inferInsert


// drizzle-zod validations


export const insertUserSchema = createInsertSchema(users)
export const selectUserSchema = createSelectSchema(users)

export const insertHabitSchema = createInsertSchema(habits)
export const selectHabitSchema = createSelectSchema(habits)

export const insertEntrySchema = createInsertSchema(entries)
export const selectEntrySchema = createSelectSchema(entries)

export const insertTagSchema = createInsertSchema(tags)
export const selectTagSchema = createSelectSchema(tags)

export const insertHabitTagSchema = createInsertSchema(habitTags)
export const selectHabitTagSchema = createSelectSchema(habitTags)
