import { cookies, headers } from 'next/headers';
import { db } from '@/lib/db';
import { generateSessionToken, hashSessionToken } from '@/lib/crypto';
import { SystemRole } from '@prisma/client';

export const SESSION_COOKIE_NAME = 'ais_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const ADMIN_SESSION_TTL_MS = 1000 * 60 * 60 * 8;

export interface AuthenticatedContext {
  sessionId: string;
  userId: string;
  email: string;
  fullName: string;
  role: SystemRole;
  mfaVerified: boolean;
  employeeId?: string;
  employeeCode?: string;
}

export async function getRequestMetadata() {
  const hdrs = await headers();
  const forwardedFor = hdrs.get('x-forwarded-for');
  const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
  const userAgent = hdrs.get('user-agent') || 'unknown';
  return { ipAddress, userAgent };
}

export async function createUserSession(params: { userId: string; role: SystemRole; mfaVerified: boolean }) {
  const rawToken = generateSessionToken();
  const tokenHash = hashSessionToken(rawToken);
  const { ipAddress, userAgent } = await getRequestMetadata();

  const isPrivileged = [SystemRole.SUPER_ADMIN, SystemRole.ADMIN, SystemRole.MANAGER].includes(params.role);
  const ttl = isPrivileged ? ADMIN_SESSION_TTL_MS : SESSION_TTL_MS;
  const expiresAt = new Date(Date.now() + ttl);

  await db.session.create({
    data: { userId: params.userId, tokenHash, ipAddress, userAgent, mfaVerified: params.mfaVerified, expiresAt },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

export async function getCurrentSession(): Promise<AuthenticatedContext | null> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!rawToken) return null;

  const tokenHash = hashSessionToken(rawToken);
  const session = await db.session.findUnique({
    where: { tokenHash },
    include: { user: { include: { role: true, employeeProfile: true } } },
  });

  if (!session || session.expiresAt < new Date() || session.user.status !== 'ACTIVE') {
    return null;
  }

  return {
    sessionId: session.id,
    userId: session.user.id,
    email: session.user.email,
    fullName: session.user.fullName,
    role: session.user.role.name,
    mfaVerified: session.mfaVerified,
    employeeId: session.user.employeeProfile?.id,
    employeeCode: session.user.employeeProfile?.employeeCode,
  };
}

export async function destroyCurrentSession() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (rawToken) {
    const tokenHash = hashSessionToken(rawToken);
    await db.session.deleteMany({ where: { tokenHash } });
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
}