import { getSession, SessionUser } from '@/lib/session'

export type Role = 'student' | 'admin' | 'user'

export async function requireRole(allowed: Role[]) {
  const session = await getSession()

  if (!session) {
    return { success: false as const, message: 'Unauthorized' as const }
  }
  if (!allowed.includes(session.role as Role)) {
    return { success: false as const, message: 'Forbidden' as const }
  }

  return { success: true as const, session }
}
