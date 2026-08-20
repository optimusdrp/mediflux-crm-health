import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/store';
import { authenticateRequest } from '@/lib/server/authHelper';

// Simulação de estado em memória da sessão whatsapp-web.js por clínica
interface WhatsAppWebSession {
  clinicId: string;
  status: 'disconnected' | 'connecting' | 'qr_ready' | 'authenticated' | 'ready' | 'error';
  qrCode?: string;
  qrExpiresAt?: number;
  sessionName: string;
  batteryLevel?: number;
  pushname?: string;
  wid?: string;
  platform?: string;
  lastSeen?: string;
  headless: boolean;
  authStrategy: 'LocalAuth' | 'RemoteAuth' | 'Legacy';
  autoRestart: boolean;
  webhookUrl?: string;
  messagesSentToday: number;
  messagesReceivedToday: number;
  puppeteerConfig: {
    chromiumPath: string;
    noSandbox: boolean;
    disableGpu: boolean;
  };
}

// Global registry of whatsapp-web.js sessions in server runtime
const globalSessions: Record<string, WhatsAppWebSession> = {};

function getOrCreateSession(clinicId: string): WhatsAppWebSession {
  if (!globalSessions[clinicId]) {
    globalSessions[clinicId] = {
      clinicId,
      status: 'ready',
      sessionName: `session_${clinicId.replace(/[^a-zA-Z0-9]/g, '_')}`,
      batteryLevel: 94,
      pushname: 'CardioVida Atendimento WhatsApp',
      wid: '5551991507327@c.us',
      platform: 'WhatsApp Web (Baileys/Puppeteer Protocol)',
      lastSeen: new Date().toISOString(),
      headless: true,
      authStrategy: 'LocalAuth',
      autoRestart: true,
      webhookUrl: 'https://api.cardiovida.com.br/api/chat/webhook-wpp',
      messagesSentToday: 342,
      messagesReceivedToday: 289,
      puppeteerConfig: {
        chromiumPath: '/usr/bin/google-chrome-stable',
        noSandbox: true,
        disableGpu: true,
      },
    };
  }
  return globalSessions[clinicId];
}

// Gera um mock string de QR Code real em formato padrão whatsapp-web.js
function generateWhatsAppWebQR(): string {
  const salt = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return `2@${salt},${Date.now()},${Math.random().toString(36).substring(2, 8)}==`;
}

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ error: auth.error || 'Não autorizado' }, { status: auth.status || 401 });
  }

  const session = getOrCreateSession(auth.user.clinicId);
  return NextResponse.json({
    session,
    library: {
      name: 'whatsapp-web.js',
      version: '^1.26.0',
      description: 'Cliente WhatsApp Web baseado em Node.js com Puppeteer & LocalAuth',
      engine: 'Puppeteer Headless Chromium',
      supportedFeatures: [
        'LocalAuth Session Persistence',
        'QR Code Pair & Pairing Code',
        'Multi-Device Support (MD)',
        'Media Message Reception & Sending',
        'Presence & Typing Indicators',
        'Group & Direct Message Handlers',
      ],
    },
  });
}

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ error: auth.error || 'Não autorizado' }, { status: auth.status || 401 });
  }

  try {
    const { action, config } = await req.json();
    const session = getOrCreateSession(auth.user.clinicId);
    const db = getDatabase();

    switch (action) {
      case 'start_client':
      case 'refresh_qr': {
        // Simula inicialização do client.initialize() com evento 'qr'
        session.status = 'qr_ready';
        session.qrCode = generateWhatsAppWebQR();
        session.qrExpiresAt = Date.now() + 60 * 1000; // 60 segundos
        session.lastSeen = new Date().toISOString();

        db.auditLogs.unshift({
          id: `aud_${Date.now()}`,
          clinicId: auth.user.clinicId,
          action: 'WHATSAPP_WEB_JS_INIT',
          target: `Client.initialize() [${session.sessionName}]`,
          authorEmail: auth.user.email,
          authorRole: auth.user.role,
          ip: req.headers.get('x-forwarded-for') || '127.0.0.1',
          timestamp: new Date().toISOString(),
          details: { library: 'whatsapp-web.js', status: 'qr_ready' },
          lgpdCategory: 'consentimento',
        });

        return NextResponse.json({
          success: true,
          message: 'Instância whatsapp-web.js inicializada. Escaneie o QR Code no WhatsApp do celular.',
          session,
        });
      }

      case 'simulate_scan': {
        // Simula evento 'authenticated' -> 'ready'
        session.status = 'ready';
        session.qrCode = undefined;
        session.qrExpiresAt = undefined;
        session.wid = '5511988776655@c.us';
        session.pushname = 'CardioVida Especialidades';
        session.batteryLevel = 98;
        session.lastSeen = new Date().toISOString();

        // Atualiza configurações da clínica
        const clinicSettings = db.getSettings(auth.user.clinicId);
        if (clinicSettings?.channels?.whatsapp) {
          clinicSettings.channels.whatsapp.enabled = true;
          clinicSettings.channels.whatsapp.number = '+55 11 98877-6655';
          if (clinicSettings.channels.whatsapp.connectionType) {
            clinicSettings.channels.whatsapp.connectionType = 'whatsapp-web.js';
          }
        }

        db.auditLogs.unshift({
          id: `aud_${Date.now()}`,
          clinicId: auth.user.clinicId,
          action: 'WHATSAPP_WEB_JS_AUTHENTICATED',
          target: 'Evento READY disparado pelo Client whatsapp-web.js',
          authorEmail: auth.user.email,
          authorRole: auth.user.role,
          ip: req.headers.get('x-forwarded-for') || '127.0.0.1',
          timestamp: new Date().toISOString(),
          details: { wid: session.wid, pushname: session.pushname },
          lgpdCategory: 'consentimento',
        });

        return NextResponse.json({
          success: true,
          message: 'Autenticado com sucesso! Client whatsapp-web.js pronto para envio e recepção de mensagens.',
          session,
        });
      }

      case 'disconnect': {
        session.status = 'disconnected';
        session.qrCode = undefined;
        session.qrExpiresAt = undefined;
        session.lastSeen = new Date().toISOString();

        db.auditLogs.unshift({
          id: `aud_${Date.now()}`,
          clinicId: auth.user.clinicId,
          action: 'WHATSAPP_WEB_JS_LOGOUT',
          target: `Client.logout() & destroy() [${session.sessionName}]`,
          authorEmail: auth.user.email,
          authorRole: auth.user.role,
          ip: req.headers.get('x-forwarded-for') || '127.0.0.1',
          timestamp: new Date().toISOString(),
          details: { previousWid: session.wid },
          lgpdCategory: 'consentimento',
        });

        return NextResponse.json({
          success: true,
          message: 'Sessão whatsapp-web.js desconectada e destruída.',
          session,
        });
      }

      case 'update_config': {
        if (config) {
          if (config.authStrategy) session.authStrategy = config.authStrategy;
          if (config.autoRestart !== undefined) session.autoRestart = config.autoRestart;
          if (config.webhookUrl) session.webhookUrl = config.webhookUrl;
          if (config.headless !== undefined) session.headless = config.headless;
          if (config.sessionName) session.sessionName = config.sessionName;
        }

        return NextResponse.json({
          success: true,
          message: 'Configurações do cliente whatsapp-web.js atualizadas.',
          session,
        });
      }

      case 'test_send': {
        // Disparo outbound client.sendMessage(to, text)
        const { to, text } = config || {};
        const destinationPhone = to || '5551991507327';
        const cleanPhone = destinationPhone.replace(/\D/g, '');
        const messageText = text || 'Mensagem enviada através da conexão whatsapp-web.js.';

        session.messagesSentToday += 1;
        session.lastSeen = new Date().toISOString();

        // Localizar ou criar paciente no banco de dados para vincular a mensagem ao chat
        let patient = db.patients.find(
          (p) => p.clinicId === auth.user.clinicId && p.phone.replace(/\D/g, '').endsWith(cleanPhone.slice(-8))
        );

        if (!patient) {
          const formattedPhone = cleanPhone.length === 11
            ? `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 7)}-${cleanPhone.slice(7)}`
            : cleanPhone.length === 13 && cleanPhone.startsWith('55')
            ? `(${cleanPhone.slice(2, 4)}) ${cleanPhone.slice(4, 9)}-${cleanPhone.slice(9)}`
            : `+${cleanPhone}`;

          patient = {
            id: `pat_${Date.now()}`,
            clinicId: auth.user.clinicId,
            name: `Contato WhatsApp (${destinationPhone})`,
            phone: formattedPhone,
            cpf: 'Aguardando cadastro',
            birthDate: '1990-01-01',
            healthInsurance: 'Particular',
            specialty: 'Atendimento WhatsApp',
            funnelStage: 'em_atendimento',
            funnelId: 'funnel_principal',
            urgency: 'media',
            checklist: { doc_enviado: false, convenio_validado: false, termo_assinado: false },
            notes: `Contato iniciado via WhatsApp Web.js para o número ${destinationPhone}`,
            tags: ['#WhatsApp', '#Outbound'],
            lastInteractionAt: new Date().toISOString(),
            originChannel: 'whatsapp',
            sentiment: 'neutro',
            leadScore: 70,
            requiresHumanReview: false,
          };
          db.patients.unshift(patient);
        }

        const newOutboundMsg = {
          id: `msg_out_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          clinicId: auth.user.clinicId,
          patientId: patient.id,
          sender: 'attendant' as const,
          senderName: auth.user.name || 'Atendente CardioVida',
          text: messageText,
          isInternalNote: false,
          timestamp: new Date().toISOString(),
          channel: 'whatsapp' as const,
        };

        db.chatMessages.push(newOutboundMsg);
        patient.lastInteractionAt = newOutboundMsg.timestamp;

        db.auditLogs.unshift({
          id: `aud_${Date.now()}`,
          clinicId: auth.user.clinicId,
          action: 'WHATSAPP_MESSAGE_SENT',
          target: `Para: ${patient.name} (${destinationPhone})`,
          authorEmail: auth.user.email,
          authorRole: auth.user.role,
          ip: req.headers.get('x-forwarded-for') || '127.0.0.1',
          timestamp: new Date().toISOString(),
          details: { to: destinationPhone, messageId: newOutboundMsg.id },
          lgpdCategory: 'consentimento',
        });

        return NextResponse.json({
          success: true,
          message: `Mensagem enviada com sucesso para ${destinationPhone} e sincronizada no Atendimento!`,
          details: {
            id: `wamid.HBgL${Date.now()}`,
            to: `${cleanPhone}@c.us`,
            patientId: patient.id,
            patientName: patient.name,
            text: messageText,
            ack: 2, // DELIVERED
            timestamp: Date.now(),
          },
          session,
        });
      }

      case 'simulate_inbound': {
        // Simula recebimento de mensagem externa de paciente
        const { from, text, pushname } = config || {};
        const originPhone = from || '5551991507327';
        const cleanFrom = originPhone.replace(/\D/g, '');
        const messageText = text || 'Olá, estou precisando agendar uma consulta cardiológica urgente.';
        const senderName = pushname || `Paciente (${originPhone})`;

        session.messagesReceivedToday += 1;
        session.lastSeen = new Date().toISOString();

        let patient = db.patients.find(
          (p) => p.clinicId === auth.user.clinicId && p.phone.replace(/\D/g, '').endsWith(cleanFrom.slice(-8))
        );

        if (!patient) {
          const formattedPhone = cleanFrom.length === 11
            ? `(${cleanFrom.slice(0, 2)}) ${cleanFrom.slice(2, 7)}-${cleanFrom.slice(7)}`
            : cleanFrom.length === 13 && cleanFrom.startsWith('55')
            ? `(${cleanFrom.slice(2, 4)}) ${cleanFrom.slice(4, 9)}-${cleanFrom.slice(9)}`
            : `+${cleanFrom}`;

          patient = {
            id: `pat_${Date.now()}`,
            clinicId: auth.user.clinicId,
            name: senderName,
            phone: formattedPhone,
            cpf: 'Aguardando cadastro',
            birthDate: '1992-06-15',
            healthInsurance: 'Aguardando confirmação',
            specialty: 'Triagem Geral / WhatsApp',
            funnelStage: 'novo',
            funnelId: 'funnel_principal',
            urgency: 'media',
            checklist: { doc_enviado: false, convenio_validado: false, termo_assinado: false },
            notes: `Mensagem recebida via WhatsApp Web.js (${originPhone})`,
            tags: ['#WhatsApp', '#Inbound'],
            lastInteractionAt: new Date().toISOString(),
            originChannel: 'whatsapp',
            sentiment: 'neutro',
            leadScore: 65,
            requiresHumanReview: false,
          };
          db.patients.unshift(patient);
        }

        const incomingMsg = {
          id: `msg_in_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          clinicId: auth.user.clinicId,
          patientId: patient.id,
          sender: 'patient' as const,
          senderName: patient.name,
          text: messageText,
          isInternalNote: false,
          timestamp: new Date().toISOString(),
          channel: 'whatsapp' as const,
        };

        db.chatMessages.push(incomingMsg);
        patient.lastInteractionAt = incomingMsg.timestamp;

        return NextResponse.json({
          success: true,
          message: `Mensagem recebida de ${patient.name} (${originPhone}) e adicionada ao painel de Atendimentos!`,
          details: {
            patientId: patient.id,
            patientName: patient.name,
            message: incomingMsg,
          },
          session,
        });
      }

      default:
        return NextResponse.json({ error: `Ação '${action}' não reconhecida.` }, { status: 400 });
    }
  } catch (err: any) {
    console.error('Erro na rota whatsapp-web-js:', err);
    return NextResponse.json({ error: err.message || 'Falha interna ao processar ação WhatsApp' }, { status: 500 });
  }
}
