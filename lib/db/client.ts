import postgres from 'postgres'

// Single postgres.js connection — works with ANY PostgreSQL database.
// To migrate from Supabase to local: just change DATABASE_URL.
//
// DATABASE_URL format:
//   postgresql://user:password@host:5432/dbname
//
// For Supabase (current):
//   postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:5432/postgres
// For local PostgreSQL:
//   postgresql://postgres:postgres@localhost:5432/ucic

declare global {
  // Prevent multiple connections in dev (Next.js hot-reload)
  // eslint-disable-next-line no-var
  var __db: ReturnType<typeof postgres> | undefined
}

function createDb() {
  const url = process.env.DATABASE_URL

  if (!url) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
      'Add it to .env.local: DATABASE_URL=postgresql://user:pass@host:5432/dbname'
    )
  }

  return postgres(url, {
    max: 10,             // connection pool size
    idle_timeout: 20,   // close idle connections after 20s
    connect_timeout: 10,
    prepare: false,      // required for Supabase pooler (PgBouncer); safe for direct too
  })
}

export const db = global.__db ?? createDb()

if (process.env.NODE_ENV !== 'production') {
  global.__db = db
}
