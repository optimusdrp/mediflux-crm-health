import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/store';
import { signToken } from '@/lib/security/jwt';
import { validateDynaliteLogin } from '@/lib/db/dynalite';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const normalizedEmail = (email || '').toLowerCase().trim();

    if (!normalizedEmail) {
      return NextResponse.json(
        { error: 'Por favor, informe seu e-mail de acesso.' },
        { status: 400 }
      );
    }

    // 1. VALIDAÇÃO OBRIGATÓRIA NO DYNALITE (DYNAMODB LOCAL)
    const dynaliteAuth = await validateDynaliteLogin(normalizedEmail, password);

    if (!dynaliteAuth.success || !dynaliteAuth.user) {
      // Registra tentativa com falha no log de auditoria
      const db = getDatabase();
      db.auditLogs.unshift({
        id: `aud_fail_${Date.now()}`,
        clinicId: 'unknown',
        action: 'LOGIN_FALHA_DYNALITE',
        target: `Tentativa de login não autorizada (${dynaliteAuth.errorCode || 'NAO_CADASTRADO'}): ${normalizedEmail}`,
        authorEmail: normalizedEmail,
        authorRole: 'terceirizado',
        ip: req.headers.get('x-forwarded-for') || '127.0.0.1',
        timestamp: new Date().toISOString(),
        lgpdCategory: 'login',
      });

      return NextResponse.json(
        {
          error: dynaliteAuth.message,
          errorCode: dynaliteAuth.errorCode || 'USER_NOT_REGISTERED_IN_DYNALITE',
          dynaliteValidated: false,
        },
        { status: 401 }
      );
    }

    const dynaliteUser = dynaliteAuth.user;
    const db = getDatabase();

    // 2. Localiza ou sincroniza a clínica
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

    // 3. Localiza ou inicializa a assinatura
    const subscription = db.getSubscription(dynaliteUser.clinicId);

    // 4. Localiza ou cria permissões RBAC
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

    // 5. Gera token JWT assinado com metadados do Dynalite
    const token = await signToken({
      id: dynaliteUser.id,
      email: dynaliteUser.email,
      role: dynaliteUser.role,
      clinicId: dynaliteUser.clinicId,
      name: dynaliteUser.name,
    });

    // 6. Registra log imutável de auditoria LGPD
    db.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      clinicId: dynaliteUser.clinicId,
      action: 'LOGIN_SUCESSO_DYNALITE',
      target: `Sessão autenticada via Dynalite DynamoDB (${dynaliteUser.role})`,
      authorEmail: dynaliteUser.email,
      authorRole: dynaliteUser.role,
      ip: req.headers.get('x-forwarded-for') || '127.0.0.1',
      timestamp: new Date().toISOString(),
      lgpdCategory: 'login',
    });

    const safeUser = {
      id: dynaliteUser.id,
      clinicId: dynaliteUser.clinicId,
      name: dynaliteUser.name,
      email: dynaliteUser.email,
      role: dynaliteUser.role,
      crm: dynaliteUser.crm,
      specialty: dynaliteUser.specialty,
      active: dynaliteUser.active,
      authSource: 'dynalite_dynamodb',
    };

    return NextResponse.json({
      token,
      user: safeUser,
      clinic,
      subscription,
      permissions: rolePermission,
      dynaliteValidated: true,
      authMessage: dynaliteAuth.message,
    });
  } catch (err: any) {
    console.error('Erro na rota de login com Dynalite:', err);
    return NextResponse.json(
      { error: 'Falha no processamento da autenticação via Dynalite: ' + (err.message || '') },
      { status: 500 }
    );
  }
}
