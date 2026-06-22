import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const env = import.meta.env;

const pool = mysql.createPool({
  host: env.DB_HOST ?? "localhost",
  port: Number(env.DB_PORT ?? 3306),
  user: env.DB_USER ?? "root",
  password: env.DB_PASSWORD ?? "",
  database: env.DB_NAME ?? "fade",
  connectionLimit: 5,
});

export const db = drizzle(pool, { schema, mode: "default" });
export { schema };
