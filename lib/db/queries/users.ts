import { db } from '@/lib/db/client'

export interface User {
  id: string
  email: string
  password_hash: string
  full_name: string | null
  student_id: string | null
  created_at: string
  updated_at: string
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const rows = await db`SELECT * FROM users WHERE email = ${email.toLowerCase().trim()} LIMIT 1`
  return (rows[0] as unknown as User) ?? null
}

export async function getUserById(id: string): Promise<User | null> {
  const rows = await db`SELECT * FROM users WHERE id = ${id} LIMIT 1`
  return (rows[0] as unknown as User) ?? null
}

export async function createUser(data: { email: string; password_hash: string; full_name: string | null; student_id: string | null }): Promise<User> {
  const rows = await db`
    INSERT INTO users (email, password_hash, full_name, student_id)
    VALUES (${data.email.toLowerCase().trim()}, ${data.password_hash}, ${data.full_name}, ${data.student_id})
    RETURNING *
  `
  return rows[0] as unknown as User
}
