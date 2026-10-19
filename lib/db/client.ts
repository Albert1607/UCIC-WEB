import postgres from 'postgres'

declare global {
  // eslint-disable-next-line no-var
  var __db: ReturnType<typeof postgres> | undefined
}

function getDbInstance(): ReturnType<typeof postgres> {
  if (global.__db) return global.__db

  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
      'Please add DATABASE_URL to your environment variables or Vercel project settings.'
    )
  }

  const client = postgres(url, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  })

  if (process.env.NODE_ENV !== 'production') {
    global.__db = client
  }

  return client
}

// Lazy proxy so Next.js build-time module evaluation never crashes if DATABASE_URL
// is not provided during the build phase.
export const db = new Proxy((() => {}) as unknown as ReturnType<typeof postgres>, {
  apply(_target, thisArg, argArray) {
    const client = getDbInstance()
    return Reflect.apply(client as unknown as (...args: unknown[]) => unknown, thisArg, argArray)
  },
  get(_target, prop, receiver) {
    const client = getDbInstance()
    const value = Reflect.get(client, prop, receiver)
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
})
