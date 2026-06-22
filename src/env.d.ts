/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    user: import("./lib/db/schema").User | null;
  }
}

interface ImportMetaEnv {
  readonly DB_HOST?: string;
  readonly DB_PORT?: string;
  readonly DB_USER?: string;
  readonly DB_PASSWORD?: string;
  readonly DB_NAME?: string;
  readonly SECURE_COOKIES?: string;
  readonly SMTP_HOST?: string;
  readonly SMTP_PORT?: string;
  readonly SMTP_USER?: string;
  readonly SMTP_PASS?: string;
  readonly SMTP_FROM?: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
  readonly TURNSTILE_SECRET_KEY?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
