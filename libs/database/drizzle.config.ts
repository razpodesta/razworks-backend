import { defineConfig } from 'drizzle-kit';

// 🛡️ BLOCKING VALIDATION
if (!process.env.DATABASE_URL) {
  throw new Error('🛑 CRITICAL CONFIG ERROR: DATABASE_URL is missing in environment variables.');
}

export default defineConfig({
  schema: './libs/database/src/schema/*.ts',
  out: './libs/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
    // ✅ FIX: Forzar SSL explícitamente para evitar negociación fallida
    ssl: true,
  },
  // Opcional: Aumentar verbosidad
  verbose: true,
  strict: true,
});
