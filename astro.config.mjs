// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  // Incrusta hojas de estilo chicas en el HTML (evita requests que bloquean).
  build: { inlineStylesheets: 'auto' },
  // El chequeo anti-CSRF (Origin vs host) lo hace nuestro middleware, que es
  // tolerante al reverse proxy (usa x-forwarded-host). Desactivamos el
  // checkOrigin propio de Astro porque detrás de Passenger compara mal el host
  // y bloquea envíos legítimos ("Cross-site POST form submissions are forbidden").
  security: {
    checkOrigin: false,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
