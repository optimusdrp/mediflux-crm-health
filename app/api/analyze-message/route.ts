import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/store';
import { authenticateRequest, checkFeatureAddon } from '@/lib/server/authHelper';
import { routeClinicalTriage } from '@/lib/ai/router';

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ error: auth.error || 'Não autorizado' }, { status: auth.status || 401 });
  }

  const clinicId = auth.user.clinicId;

  // Feature Gating: Nem mesmo o Administrador acessa Add-on se a clínica não o tiver contratado ou estiver inadimplente
  const hasAddon = checkFeatureAddon(clinicId, 'triagem_clinica');
  if (!hasAddon) {
    return NextResponse.json(
      {
        error: 'Add-on de Triagem Clínica não contratado ou temporariamente suspenso no plano da clínica.',
        feature: 'triagem_clinica',
        blocked: true,
      },
      { status: 403 }
    );
  }

  try {
    const { messageText, patientId } = await req.json();

    if (!messageText) {
      return NextResponse.json({ error: 'messageText é obrigatório.' }, { status: 400 });
    }

    const db = getDatabase();
    let patientContext;
    let patient;

    if (patientId) {
      patient = db.getPatientById(patientId, clinicId);
      if (patient) {
        patientContext = {
          name: patient.name,
          birthDate: patient.birthDate,
          healthInsurance: patient.healthInsurance,
        };
      }
    }

    // Executa roteamento de triagem dual (Bedrock -> Gemini -> Heurística) com guardrails
    const triageResult = await routeClinicalTriage(messageText, patientContext);

    // Incrementa contagem de chamadas de IA na subscrição
    const sub = db.getSubscription(clinicId);
    sub.aiCallsCount += 1;

    // Se houver paciente associado, atualiza o status operacional
    if (patient) {
      patient.urgency = triageResult.urgency;
      patient.requiresHumanReview = triageResult.requiresHumanReview;
      patient.aiSummary = `${triageResult.manchesterCategory}: ${triageResult.recommendedAction}`;
      if (!patient.tags.includes(`#${triageResult.urgency.toUpperCase()}`)) {
        patient.tags.push(`#${triageResult.urgency.toUpperCase()}`);
      }
    }

    // Log de auditoria
    db.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      clinicId,
      action: 'TRIAGEM_CLINICA_IA',
      target: patient ? `${patient.id} (${patient.name})` : 'Mensagem avulsa',
      authorEmail: auth.user.email,
      authorRole: auth.user.role,
      ip: req.headers.get('x-forwarded-for') || '127.0.0.1',
      timestamp: new Date().toISOString(),
      details: {
        urgency: triageResult.urgency,
        provider: triageResult.providerUsed,
        confidence: triageResult.confidence,
        requiresHumanReview: triageResult.requiresHumanReview,
      },
      lgpdCategory: 'acesso_dados',
    });

    return NextResponse.json({ triage: triageResult, patient });
  } catch (err) {
    console.error('Erro na triagem clínica:', err);
    return NextResponse.json({ error: 'Falha no processamento da triagem clínica.' }, { status: 500 });
  }
}
