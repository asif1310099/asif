import crypto from 'crypto';
import { hash, verify } from '@node-rs/argon2';

const ARGON2_OPTIONS = {
  memoryCost: 65536,
  timeCost: 3,
  outputLen: 32,
  parallelism: 4,
};

function getMasterKey(): Buffer {
  const hexKey = process.env.ENCRYPTION_MASTER_KEY;
  if (!hexKey || !/^[0-9a-fA-F]{64}$/.test(hexKey)) {
    throw new Error('ENCRYPTION_MASTER_KEY must be a 64-character hex string.');
  }
  return Buffer.from(hexKey, 'hex');
}

export async function hashPassword(plainPassword: string): Promise<string> {
  return hash(plainPassword, ARGON2_OPTIONS);
}

export async function verifyPassword(storedHash: string, plainPassword: string): Promise<boolean> {
  try {
    return await verify(storedHash, plainPassword, ARGON2_OPTIONS);
  } catch {
    return false;
  }
}

export function encryptSecret(plaintext: string): string {
  const key = getMasterKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptSecret(payload: string): string {
  const parts = payload.split(':');
  if (parts.length !== 3) throw new Error('Malformed encrypted payload format.');
  const [ivHex, authTagHex, cipherHex] = parts;
  const key = getMasterKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const ciphertext = Buffer.from(cipherHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString('utf8');
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

export function hashSessionToken(rawToken: string): string {
  const secret = process.env.SESSION_SECRET || 'fallback-dev-secret';
  return crypto.createHmac('sha256', secret).update(rawToken).digest('hex');
}