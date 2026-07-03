// Config de runtime (base de datos, SMTP, cookies, Turnstile).
//
// IMPORTANTE: se lee de process.env EN TIEMPO DE EJECUCIÓN, no de
// import.meta.env. El build se hace en GitHub Actions (sin .env), así que
// import.meta.env quedaría vacío en producción. En cambio process.env se
// resuelve en el servidor, donde sí está el .env.
try {
  // Node 20.12+/24: carga el .env del directorio de trabajo a process.env.
  // No pisa variables que ya existan en el entorno.
  process.loadEnvFile();
} catch {
  // Sin archivo .env (o ya cargado por el entorno): seguimos con process.env.
}

export const env = process.env;
