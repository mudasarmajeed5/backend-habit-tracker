import db from "../../src/db/connection.ts";
import {
  users,
  habits,
  entries,
  tags,
  habitTags,
  type NewUser,
  type NewTag,
  type NewHabit,
} from "../../src/db/schema.ts";

import { hashPassword } from "../../src/utils/passwords.ts";
import { generateToken } from "../../src/utils/jwt.ts";

export const createTestUser = async (userData: Partial<NewUser> = {}) => {
  const defaultData: NewUser = {
    email: `test-${Date.now()}-${Math.random()}@gmail.com`,
    username: `test-${Date.now()}`,
    password: "admin",
    firstName: "test",
    lastName: "user",
    ...userData,
  };
  const hashedPassword = await hashPassword(defaultData.password);
  const [user] = await db
    .insert(users)
    .values({
      ...defaultData,
      password: hashedPassword,
    })
    .returning();
  const token = await generateToken({
    email: user.email,
    id: user.id,
    username: user.username,
  });
  return { token, user, rawPassword: defaultData.password };
};

export const createTestHabit = async (userId: string, habitData: Partial<NewHabit> = {}) =>{
    const defaultData = {
        name: `Test Habit ${Date.now()}`, 
        description: 'A test habit', 
        frequency: 'daily', 
        targetCount: 1, 
        ...habitData
    }
    const [habit] = await db.insert(habits).values({
        userId, 
        ...defaultData
    }).returning()
    return habit
}
export const createTestTag = async (
    userId: string, 
    tagData: Partial<NewTag> = {}
) =>{
    const defaultData = {
        name: `test-${Date.now()}`, 
        color: '#DED501', 
        ...tagData
    }
    const [tag] = await db.insert(tags).values({
        userId, 
        ...defaultData, 
    }).returning()
    return tag
}

export const cleanUpDatabase = async () =>{
    await db.delete(entries)
    await db.delete(habits)
    await db.delete(users)
    await db.delete(habitTags)
    await db.delete(tags)
}