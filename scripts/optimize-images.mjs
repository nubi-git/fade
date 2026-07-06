// Pre-genera versiones WebP responsive de las imágenes estáticas (fondos/logos)
// en public/images/opt/. Se sirven como archivos estáticos (sin sharp en runtime,
// persistentes tras reiniciar). Corre en `prebuild`/`predev`.
import sharp from "sharp";
import { mkdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(root, "src/assets");
const OUT = join(root, "public/images/opt");

// [ruta fuente, nombre salida, anchos a generar, calidad webp]
const jobs = [
  ["fondos/home_hero_image.png", "home-hero", [768, 1200, 1512], 74],
  ["fondos/obras_y_servicios_hero.png", "obras-hero", [768, 1200, 1512], 74],
  ["fondos/nosotros_hero_image.png", "nosotros-hero", [768, 1200, 1512], 74],
  ["fondos/brochure_section_image.png", "brochure", [768, 1200, 1512], 74],
  ["fondos/testimonials_image.png", "testimonials", [768, 1200, 1352], 76],
  ["fondos/conoce_nuestro_trabajo.png", "conoce-trabajo", [768, 1200, 1512], 76],
  ["fondos/project-featured.png", "project-featured", [768, 1200, 1352], 76],
  ["fondos/medios_image.png", "medios", [400, 525], 80],
  ["fondos/service-1.png", "service-1", [400, 660], 78],
  ["fondos/service-2.png", "service-2", [400, 660], 78],
  ["fondos/service-3.png", "service-3", [400, 660], 78],
  ["fondos/service-4.png", "service-4", [400, 660], 78],
  ["fondos/servicios_card_sanitarias.png", "card-sanitarias", [252], 80],
  ["fondos/servicios_card_gas.png", "card-gas", [252], 80],
  ["fondos/servicios_card_incendio.png", "card-incendio", [252], 80],
  ["fondos/servicios_card_riego.png", "card-riego", [252], 80],
  ["fondos/servicios_card_ingenieria.png", "card-ingenieria", [252], 80],
  ["logos/logo_fade.png", "logo-fade", [200], 90],
  ["logos/logo_fade_blanco.png", "logo-fade-blanco", [252], 90],
];

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

let count = 0;
for (const [srcRel, name, widths, quality] of jobs) {
  for (const w of widths) {
    await sharp(join(SRC, srcRel))
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality })
      .toFile(join(OUT, `${name}-${w}.webp`));
    count++;
  }
}
console.log(`✓ optimize-images: ${count} WebP generados en public/images/opt/`);
