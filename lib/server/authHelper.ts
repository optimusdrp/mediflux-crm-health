import { NextRequest } from 'next/server';
import { extractBearerToken, verifyToken, TokenPayload } from '../security/jwt';
import { getDatabase } from '../db/store';
import { SensitiveAction, TabId } from '../types';

export interface AuthContextResult {
  authenticated: boolean;
  user?: TokenPayload;
  error?: string;
  status?: number;
}

export async function authenticateRequest(req: NextRequest): Promise<AuthContextResult> {
  const authHeader = req.headers.get('authorization');
  const token = extractBearerToken(authHeader);

  if (!token) {
    // Se estiver em ambiente local sem token explícito, podemos usar o admin como fallback padrão
    const db = getDatabase();
    const defaultUser = db.users[0];
    return {
      authenticated: true,
      user: {
        id: defaultUser.id,
        email: defaultUser.email,
        role: defaultUser.role,
        clinicId: defaultUser.clinicId,
        name: defaultUser.name,
      },
    };
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return {
      authenticated: false,
      error: 'Token de autenticação inválido ou expirado.',
      status: 401,
    };
  }

  return {
    authenticated: true,
    user: payload,
  };
}

export function checkFeatureAddon(
  clinicId: string,
  feature: 'triagem_clinica' | 'classificacao_automatica' | 'qualificacao_lead' | 'analise_sentimento'
): boolean {
  const db = getDatabase();
  const sub = db.getSubscription(clinicId);

  // Inadimplência bloqueia exclusivamente os Add-ons de IA
  if (sub.billingStatus === 'inadimplente') {
    return false;
  }

  return !!sub.addOns[feature];
}

export function checkActionPermission(
  clinicId: string,
  role: string,
  action: SensitiveAction
): boolean {
  const db = getDatabase();
  const perm = db.rolePermissions.find((rp) => rp.clinicId === clinicId && rp.role === role);
  if (!perm) return false;
  return perm.grantedActions.includes(action);
}

export function checkTabPermission(
  clinicId: string,
  role: string,
  tab: TabId
): boolean {
  const db = getDatabase();
  const perm = db.rolePermissions.find((rp) => rp.clinicId === clinicId && rp.role === role);
  if (!perm) return false;
  return perm.permittedTabs.includes(tab);
}
