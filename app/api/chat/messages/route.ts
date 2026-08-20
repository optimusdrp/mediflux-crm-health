import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/store';
import { authenticateRequest } from '@/lib/server/authHelper';
import { ChatMessage } from '@/lib/types';

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ error: auth.error || 'Não autorizado' }, { status: auth.status || 401 });
  }

  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get('patientId');

  if (!patientId) {
    return NextResponse.json({ error: 'Parâmetro patientId é obrigatório' }, { status: 400 });
  }

  const db = getDatabase();
  // Validação anti-IDOR: O paciente pertence à clínica do usuário?
  const patient = db.getPatientById(patientId, auth.user.clinicId);
  if (!patient) {
    return NextResponse.json({ error: 'Registro não encontrado' }, { status: 404 });
  }

  const messages = db.chatMessages
    .filter((m) => m.patientId === patientId && m.clinicId === auth.user!.clinicId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ error: auth.error || 'Não autorizado' }, { status: auth.status || 401 });
  }

  try {
    const { patientId, text, isInternalNote, sender, channel } = await req.json();

    if (!patientId || !text) {
      return NextResponse.json(
        { error: 'patientId e text são campos obrigatórios.' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const patient = db.getPatientById(patientId, auth.user.clinicId);
    if (!patient) {
      return NextResponse.json({ error: 'Registro não encontrado' }, { status: 404 });
    }

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      clinicId: auth.user.clinicId,
      patientId,
      sender: sender || (isInternalNote ? 'attendant' : 'attendant'),
      senderName: auth.user.name,
      text,
      isInternalNote: !!isInternalNote,
      timestamp: new Date().toISOString(),
      channel: channel || patient.originChannel,
    };

    db.chatMessages.push(newMessage);
    patient.lastInteractionAt = newMessage.timestamp;

    return NextResponse.json({ message: newMessage });
  } catch (err) {
    console.error('Erro ao enviar mensagem:', err);
    return NextResponse.json({ error: 'Falha ao gravar mensagem.' }, { status: 500 });
  }
}
