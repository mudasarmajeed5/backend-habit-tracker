import db from "../../src/db/connection.ts";
import {
    users, 
    habits, 
    entries, 
    tags, 
    habitTags, 
    type NewUser, 
    type NewHabit
} from "../../src/db/schema.ts"

import { hashPassword } from "../../src/utils/passwords.ts";
import { generateToken } from "../../src/utils/jwt.ts";

export const createTestUser = async (userData: Partial<NewUser> = {}) =>{
    const defaultData:NewUser = {
        email: `test-${Date.now()}-${Math.random()}@gmail.com`, 
        username: `test-${Date.now()}`, 
        password: 'admin', 
        firstName: 'test', 
        lastName: 'user', 
        ...userData
    }
    const hashedPassword = await hashPassword(defaultData.password)
    const [user] = await db.insert(users).values({
        ...defaultData, 
        password: hashedPassword
    }).returning()
    const token = await generateToken({
        email: user.email, 
        id: user.id, 
        username: user.username
    })
}