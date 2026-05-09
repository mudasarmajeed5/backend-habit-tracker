import db from "../../src/db/connection.ts";
import {
  users,
  habits,
  habitTags,
  entries,
  tags,
} from "../../src/db/schema.ts";
import { sql } from "drizzle-orm";

import { execSync } from "child_process";

export default async function setup(){
    console.log("Setting up a test database")
    try {
        await db.execute(sql`DROP TABLE IF EXISTS ${entries} CASCADE`)
        await db.execute(sql`DROP TABLE IF EXISTS ${habitTags} CASCADE`)
        await db.execute(sql`DROP TABLE IF EXISTS ${tags} CASCADE`)
        await db.execute(sql`DROP TABLE IF EXISTS ${habits} CASCADE`)
        await db.execute(sql`DROP TABLE IF EXISTS ${users} CASCADE`)

        console.log('🔼 Pushing the schema to the database')
        execSync(
            `npx drizzle-kit push --url="${process.env.DATABASE_URL}" --schema="./src/db/schema.ts" --dialect="postgresql"`,
            {
                stdio: 'inherit', 
                cwd: process.cwd()
            },
        )
        console.log('Test database created ✅')
    } catch (error) {
        console.error("Failed to setup test database: ", error)
        throw error
    }
    return async () => {
    try {
      await db.execute(sql`DROP TABLE IF EXISTS ${entries} CASCADE`)
      await db.execute(sql`DROP TABLE IF EXISTS ${habits} CASCADE`)
      await db.execute(sql`DROP TABLE IF EXISTS ${users} CASCADE`)
      await db.execute(sql`DROP TABLE IF EXISTS ${tags} CASCADE`)
      await db.execute(sql`DROP TABLE IF EXISTS ${habitTags} CASCADE`)
      process.exit(0)
    } catch (error) {
      console.error('❌ Failed to setup test DB', error)
      throw error
    }
  }
}