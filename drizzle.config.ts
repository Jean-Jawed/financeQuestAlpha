import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  // auth.* est géré par Supabase : Drizzle ne doit jamais le modifier
  schemaFilter: ['public'],
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;