import { getSession, SessionUser } from '@/lib/session'

export type Role = 'student' | 'admin' | 'user'
export type AccessType = 1 | 2 // 1 = Admin, 2 = Student (Siswa)

export async function requireRole(allowed: Role[]) {
  const session = await getSession()

  if (!session) {
    return { success: false as const, message: 'Unauthorized' as const }
  }

  const userRole = session.role as Role
  const isAllowed =
    allowed.includes(userRole) ||
    (allowed.includes('admin') && session.accessType === 1) ||
    (allowed.includes('student') && session.accessType === 2)

  if (!isAllowed) {
    return { success: false as const, message: 'Forbidden' as const }
  }

  return { success: true as const, session }
}

export async function requireAccessType(allowedTypes: number[]) {
  const session = await getSession()
  if (!session) {
    return { success: false as const, message: 'Unauthorized' as const }
  }
  const type = session.accessType ?? (session.role === 'admin' ? 1 : 2)
  if (!allowedTypes.includes(type)) {
    return { success: false as const, message: 'Forbidden' as const }
  }
  return { success: true as const, session }
}
