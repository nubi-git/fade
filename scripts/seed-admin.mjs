// Crea (o actualiza) un usuario admin. Uso:
//   npm run seed:admin -- <email> <password> "<nombre>"
import { randomUUID } from "node:crypto";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const [email, password, name = "Administrador"] = process.argv.slice(2);

if (!email || !password) {
  console.error('Uso: npm run seed:admin -- <email> <password> "<nombre>"');
  process.exit(1);
}

const conn = await mysql.createConnection({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "fade",
});

const passwordHash = await bcrypt.hash(password, 12);

const [rows] = await conn.execute("SELECT id FROM users WHERE email = ?", [email]);
if (rows.length) {
  await conn.execute(
    "UPDATE users SET password_hash = ?, name = ?, role = 'admin' WHERE email = ?",
    [passwordHash, name, email]
  );
  console.log(`✓ Admin actualizado: ${email}`);
} else {
  await conn.execute(
    "INSERT INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, 'admin')",
    [randomUUID(), email, passwordHash, name]
  );
  console.log(`✓ Admin creado: ${email}`);
}

await conn.end();
