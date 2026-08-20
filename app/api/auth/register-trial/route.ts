import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/store';
import { signToken } from '@/lib/security/jwt';
import { User, Clinic, Subscription, RolePermission } from '@/lib/types';
import { saveUserInDynalite } from '@/lib/db/dynalite';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      clinicName,
      specialty,
      teamSize,
      password,
      acceptTerms,
    } = body;

    if (!name || !email || !clinicName) {
      return NextResponse.json(
        { error: 'Por favor, preencha os campos obrigatórios: Nome, E-mail e Nome da Clínica.' },
        { status: 400 }
      );
    }

    if (!acceptTerms) {
      return NextResponse.json(
        { error: 'É necessário concordar com os Termos de Uso e Política de Privacidade (LGPD).' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const normalizedEmail = email.toLowerCase().trim();

    // Verifica se usuário já existe
    const existingUser = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Já existe uma conta cadastrada com este e-mail. Por favor, faça login.' },
        { status: 409 }
      );
    }

    const timestamp = Date.now();
    const newClinicId = `clinic_trial_${timestamp}`;
    const newUserId = `usr_trial_${timestamp}`;

    // 1. Criar nova clínica
    const newClinic: Clinic = {
      id: newClinicId,
      name: clinicName.trim(),
      unit: 'Unidade Principal',
      cnpj: 'Pendente (Trial 7 Dias)',
      phone: phone || '(11) 99999-0000',
      address: 'Ambiente Cloud Dedicado MediFlux',
    };
    db.clinics.push(newClinic);

    // 2. Criar Assinatura Trial de 7 dias com acesso Enterprise completo
    const trialExpiration = new Date(timestamp + 7 * 24 * 60 * 60 * 1000).toISOString();
    const newSubscription: Subscription = {
      clinicId: newClinicId,
      basePlan: 'enterprise',
      addOns: {
        triagem_clinica: true,
        classificacao_automatica: true,
        qualificacao_lead: true,
        analise_sentimento: true,
      },
      billingStatus: 'em_trial',
      maxAppointmentsPerMonth: 1000,
      currentPeriodAppointments: 0,
      aiCallsCount: 0,
      nextBillingAt: trialExpiration,
      trialEndsAt: trialExpiration,
    };
    db.subscriptions.push(newSubscription);

    // 3. Criar Usuário Administrador da Clínica no Dynalite e no Store
    const newUser: User = {
      id: newUserId,
      clinicId: newClinicId,
      name: name.trim(),
      email: normalizedEmail,
      role: 'admin',
      specialty: specialty || 'Gestão Clínica e Atendimento',
      crm: specialty ? `CRM/SP ${Math.floor(100000 + Math.random() * 900000)}` : undefined,
      active: true,
    };
    db.users.push(newUser);

    // Salva o usuário no banco Dynalite (DynamoDB Local)
    await saveUserInDynalite({
      id: newUser.id,
      clinicId: newUser.clinicId,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      crm: newUser.crm,
      specialty: newUser.specialty,
      password: password || 'cardiovida2026',
      active: true,
    });

    // 4. Configurar Permissões RBAC padrão para o Administrador
    const newRolePermission: RolePermission = {
      clinicId: newClinicId,
      role: 'admin',
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
      grantedActions: [
        'excluir_paciente',
        'unificar_duplicados',
        'exportar_dados_lgpd',
        'alterar_permissoes',
        'configurar_integracoes_pep',
        'gerenciar_cobranca',
        'disparar_webhooks_teste',
        'visualizar_prontuario_sensivel',
      ],
    };
    db.rolePermissions.push(newRolePermission);

    // 5. Adicionar regras padrão de prioridade
    db.priorityRules.push({
      id: `rule_trial_${timestamp}`,
      clinicId: newClinicId,
      name: 'Triagem Manchester Emergência (Trial)',
      slaMinutes: 10,
      condition: 'urgency == "critica"',
      manchesterColor: 'vermelho',
      enabled: true,
    });

    // 6. Gerar Token JWT assinado
    const token = await signToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      clinicId: newUser.clinicId,
      name: newUser.name,
    });

    // 7. Registrar auditoria imutável LGPD
    db.auditLogs.unshift({
      id: `aud_trial_${timestamp}`,
      clinicId: newClinicId,
      action: 'TRIAL_CRIADO_7_DIAS',
      target: `Conta Trial ativada: ${clinicName} (${teamSize || '1-5'} atendentes)`,
      authorEmail: newUser.email,
      authorRole: newUser.role,
      ip: req.headers.get('x-forwarded-for') || '127.0.0.1',
      timestamp: new Date().toISOString(),
      lgpdCategory: 'consentimento',
    });

    return NextResponse.json({
      token,
      user: newUser,
      clinic: newClinic,
      subscription: newSubscription,
      permissions: newRolePermission,
      trialDaysRemaining: 7,
      trialExpiresAt: trialExpiration,
      message: 'Cadastro de teste de 7 dias realizado com sucesso!',
    });
  } catch (err) {
    console.error('Erro no cadastro trial:', err);
    return NextResponse.json(
      { error: 'Falha ao processar o cadastro de teste. Tente novamente.' },
      { status: 500 }
    );
  }
}
