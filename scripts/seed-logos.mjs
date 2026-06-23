// Siembra los logos existentes (clientes y proveedores) en la tabla `logos`.
// Idempotente: no duplica los ya cargados. Uso: npm run seed:logos
import { randomUUID } from "node:crypto";
import mysql from "mysql2/promise";

const clientes = [
  "AYRES DESARROLLOS.PNG", "B&O INGENIERIA.png", "Bello Podesta.png",
  "CERVECERIA Y MALTERIA QUILMES S.A.I.C.A y G..png", "COMA SA.png", "COMS.jfif",
  "Estudio jv.PNG", "Griscan.PNG", "HORMIGAZ.png", "ING. HUGO PINUS & ASOC.jpg",
  "LAGLEYZE MANAGMENT.avif", "OBRAS & SISTEMAS.avif", "Parysow.png", "SACOA.png",
  "ZANARA.avif", "altuna-bullrich-cecchi-logo.gif", "logo-janos.png", "logo_gsa.png",
  "meta desarrollos(javier pottap).jpg", "suizo.jfif",
];

const proveedores = [
  "ABELSON-Logo.png", "Abasplas.jpg", "Amanco.png", "De piletas.png", "EMF.png",
  "Electro Perbe.webp", "Esimet.jfif", "Famiq.png", "Melisam.png", "Tameco.png",
  "bairestron.png", "cañosider.png", "eefe.png", "grundfos.png", "incen sanit.png",
  "logo-irridelta-nav.png", "logo-saladillo.PNG", "perbe.jpeg", "stel.png",
];

const c = await mysql.createConnection({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "fade",
});

async function seed(kind, folder, files) {
  let n = 0;
  for (let i = 0; i < files.length; i++) {
    const url = `/images/logos/${folder}/${files[i]}`;
    const [ex] = await c.execute("SELECT id FROM logos WHERE image_url = ?", [url]);
    if (ex.length) continue;
    await c.execute(
      "INSERT INTO logos (id, kind, name, image_url, sort_order) VALUES (?, ?, ?, ?, ?)",
      [randomUUID(), kind, null, url, i]
    );
    n++;
  }
  return n;
}

const a = await seed("cliente", "clientes", clientes);
const b = await seed("proveedor", "proveedores", proveedores);
console.log(`✓ Logos sembrados — clientes: ${a}, proveedores: ${b}`);
await c.end();
