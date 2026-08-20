import { SignJWT, jwtVerify } from 'jose';
import { Role } from '../types';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'mediflux-health-crm-production-hmac-sha256-key-secure'
);

export interface TokenPayload {
  id: string;
  email: string;
  role: Role;
  clinicId: string;
  name: string;
  [key: string]: unknown;
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return await new SignJWT({
    id: payload.id,
    email: payload.email,
    role: payload.role,
    clinicId: payload.clinicId,
    name: payload.name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(SECRET_KEY);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as TokenPayload;
  } catch (error) {
    console.error('Falha na validação do token JWT:', error);
    return null;
  }
}

export function extractBearerToken(authHeader?: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7).trim();
}
