// Siembra proyectos de ejemplo usando las imágenes ya presentes en /public/images/obras.
// Uso: npm run seed:projects
import { randomUUID } from "node:crypto";
import mysql from "mysql2/promise";

const types = [
  "Instalación sanitaria",
  "Instalación de gas",
  "Contra incendio",
  "Riego",
];

// 12 imágenes: "Project image.png" + "Project image-1..11.png"
const images = Array.from({ length: 12 }).map((_, i) =>
  i === 0 ? "/images/obras/Project%20image.png" : `/images/obras/Project%20image-${i}.png`
);

const conn = await mysql.createConnection({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "fade",
});

let inserted = 0;
for (let i = 0; i < images.length; i++) {
  const name = `Proyecto ${i + 1}`;
  const slug = `proyecto-${i + 1}`;
  const [exists] = await conn.execute("SELECT id FROM projects WHERE slug = ?", [slug]);
  if (exists.length) continue;

  await conn.execute(
    `INSERT INTO projects
       (id, slug, name, type, year, cover_image, published, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
    [randomUUID(), slug, name, types[i % types.length], 2023 - (i % 4), images[i], images.length - i]
  );
  inserted++;
}

console.log(`✓ Proyectos sembrados: ${inserted} (omitidos los ya existentes)`);
await conn.end();
