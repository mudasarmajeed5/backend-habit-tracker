import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { tablesSchema } from "./schema.ts";
import { relations } from "./schema.ts";
import { env, isProd } from "../../env.ts";
import { remember } from "@epic-web/remember";

const createPool = () => {
  return new Pool({
    connectionString: env.DATABASE_URL,
  });
};

let client: Pool;
if (isProd()) {
  client = createPool();
} else {
  client = remember("dbPool", () => createPool());
}
export const db = drizzle({ client, schema: tablesSchema, relations });

export default db;
