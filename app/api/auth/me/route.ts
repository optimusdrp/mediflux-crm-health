import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken, verifyToken } from '@/lib/security/jwt';
import { getDatabase } from '@/lib/db/store';
import { getUserByEmailInDynalite } from '@/lib/db/dynalite';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = extractBearerToken(authHeader);

    if (!token) {
      return NextResponse.json({ error: 'Nenhuma sessão ativa' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.email) {
      return NextResponse.json({ error: 'Sessão inválida ou expirada' }, { status: 401 });
    }

    // Verify user exists and is active in Dynalite (DynamoDB Local)
    const dynaliteUser = await getUserByEmailInDynalite(payload.email);
    if (!dynaliteUser || !dynaliteUser.active) {
      return NextResponse.json(
        { error: 'Usuário não encontrado ou inativo no Dynalite' },
        { status: 401 }
      );
    }

    const db = getDatabase();
    let clinic = db.clinics.find((c) => c.id === dynaliteUser.clinicId);
    if (!clinic) {
      clinic = {
        id: dynaliteUser.clinicId,
        name: 'Clínica Registrada Dynalite',
        unit: 'Unidade Principal',
        cnpj: '00.000.000/0001-99',
        phone: '(11) 99999-0000',
        address: 'Ambiente Conectado Dynalite',
      };
      db.clinics.push(clinic);
    }

    const subscription = db.getSubscription(dynaliteUser.clinicId);
    let rolePermission = db.rolePermissions.find(
      (rp) => rp.clinicId === dynaliteUser.clinicId && rp.role === dynaliteUser.role
    );

    if (!rolePermission) {
      rolePermission = {
        clinicId: dynaliteUser.clinicId,
        role: dynaliteUser.role,
        permittedTabs: [
          'visao_geral',
          'atendimentos',
          'jornadas',
          'pendencias',
          'automacoes',
          'indicadores',
          'configuracoes',
          'auditoria_lgpd',
          'analise_inteligente',
        ],
        grantedActions: ['exportar_dados_lgpd', 'visualizar_prontuario_sensivel'],
      };
      db.rolePermissions.push(rolePermission);
    }

    const safeUser = {
      id: dynaliteUser.id,
      clinicId: dynaliteUser.clinicId,
      name: dynaliteUser.name,
      email: dynaliteUser.email,
      role: dynaliteUser.role,
      crm: dynaliteUser.crm,
      specialty: dynaliteUser.specialty,
      active: dynaliteUser.active,
      authSource: 'dynalite_dynamodb' as const,
    };

    return NextResponse.json({
      user: safeUser,
      clinic,
      subscription,
      permissions: rolePermission,
      dynaliteValidated: true,
    });
  } catch (err: any) {
    console.error('Erro na validação do /api/auth/me:', err);
    return NextResponse.json(
      { error: 'Falha ao recuperar sessão: ' + (err.message || '') },
      { status: 500 }
    );
  }
}
