import { SystemRole } from '@prisma/client';
import { AuthenticatedContext, getCurrentSession } from '@/lib/session';

export class AuthError extends Error {
  constructor(public message: string, public statusCode: number = 401) {
    super(message);
    this.name = 'AuthError';
  }
}

export async function requireAuth(): Promise<AuthenticatedContext> {
  const ctx = await getCurrentSession();
  if (!ctx) throw new AuthError('Authentication required.', 401);
  return ctx;
}

export async function requireEmployee(): Promise<AuthenticatedContext & { employeeId: string; employeeCode: string }> {
  const ctx = await requireAuth();
  if (ctx.role !== SystemRole.EMPLOYEE || !ctx.employeeId || !ctx.employeeCode) {
    throw new AuthError('Access restricted to authorized employees.', 403);
  }
  return ctx as AuthenticatedContext & { employeeId: string; employeeCode: string };
}

export async function requireAdmin(): Promise<AuthenticatedContext> {
  const ctx = await requireAuth();
  const adminRoles = [SystemRole.SUPER_ADMIN, SystemRole.ADMIN, SystemRole.MANAGER];
  if (!adminRoles.includes(ctx.role)) {
    throw new AuthError('Insufficient privileges for administrative portal.', 403);
  }
  if (!ctx.mfaVerified) {
    throw new AuthError('Multi-factor authentication verification required.', 403);
  }
  return ctx;
}