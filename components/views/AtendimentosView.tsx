'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Patient, ChatMessage, UrgencyLevel, TriageResult } from '@/lib/types';
import { apiService } from '@/lib/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import {
  Search,
  Filter,
  Send,
  Sparkles,
  Lock,
  Edit3,
  Trash2,
  CheckSquare,
  Square,
  HeartPulse,
  AlertTriangle,
  FileText,
  User,
  Phone,
  CreditCard,
  Calendar,
  Smile,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Plus,
  StickyNote,
  MessageSquare,
  Bot,
} from 'lucide-react';

interface AtendimentosViewProps {
  initialPatientId?: string;
  onOpenEditModal: (patient: Patient) => void;
  onOpenNewPatientModal: () => void;
}

export function AtendimentosView({
  initialPatientId,
  onOpenEditModal,
  onOpenNewPatientModal,
}: AtendimentosViewProps) {
  const { user, hasActionPermission } = useAuth();
  const { success, error, warning, info } = useToast();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialPatientId || '');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('todas');
  const [filterUrgency, setFilterUrgency] = useState('todas');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick responses templates
  const quickResponses = [
    { label: 'Boas-vindas', text: 'Olá, {{paciente}}! Seja bem-vindo(a) à nossa clínica. Como posso lhe ajudar hoje?' },
    { label: 'Preparo Exame', text: 'Prezado(a) {{paciente}}, para seu exame cardiológico é necessário jejum de 8 horas e levar documento com foto.' },
    { label: 'Confirmação', text: 'Confirmamos sua consulta para {{data}} às {{horario}} com Dr(a). {{medico}}.' },
  ];

  useEffect(() => {
    let isMounted = true;
    const fetchPatients = async () => {
      try {
        const res = await apiService.getPatients({
          search,
          specialty: filterSpecialty,
          urgency: filterUrgency,
        });
        if (isMounted) {
          setPatients(res.patients);
          if (!selectedPatientId && res.patients.length > 0) {
            setSelectedPatientId(res.patients[0].id);
          }
        }
      } catch (err: any) {
        error('Erro ao carregar pacientes', err.message);
      } finally {
        if (isMounted) {
          setIsLoadingPatients(false);
        }
      }
    };

    fetchPatients();
    return () => {
      isMounted = false;
    };
  }, [search, filterSpecialty, filterUrgency, selectedPatientId]);

  const [prevInitialId, setPrevInitialId] = useState<string | undefined>(initialPatientId);
  if (initialPatientId && initialPatientId !== prevInitialId) {
    setPrevInitialId(initialPatientId);
    setSelectedPatientId(initialPatientId);
  }

  // Load chat messages when selected patient changes
  useEffect(() => {
    if (!selectedPatientId) return;
    let isMounted = true;

    const loadMessages = async () => {
      try {
        const res = await apiService.getChatMessages(selectedPatientId);
        if (isMounted) {
          setMessages(res.messages);
        }
      } catch (err: any) {
        console.error('Erro ao carregar mensagens:', err);
      }
    };

    loadMessages();
    return () => {
      isMounted = false;
    };
  }, [selectedPatientId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  // Send message or internal note
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedPatientId) return;

    setIsSending(true);
    try {
      const res = await apiService.sendChatMessage({
        patientId: selectedPatientId,
        text: inputText.trim(),
        isInternalNote,
        sender: 'attendant',
        channel: selectedPatient?.originChannel || 'whatsapp',
      });

      setMessages((prev) => [...prev, res.message]);
      setInputText('');

      if (isInternalNote) {
        success('Nota Interna Salva', 'Visível apenas para a equipe da clínica.');
      }
    } catch (err: any) {
      error('Falha no Envio', err.message || 'Erro ao gravar mensagem.');
    } finally {
      setIsSending(false);
    }
  };

  // Trigger AI Clinical Triage for current patient chat context
  const handleRunAITriage = async () => {
    if (!selectedPatient) return;
    const latestPatientMsg = [...messages]
      .reverse()
      .find((m) => m.sender === 'patient')?.text || selectedPatient.notes || 'Paciente solicita atendimento';

    setIsAnalyzingAI(true);
    try {
      const res = await apiService.analyzeMessageTriage(latestPatientMsg, selectedPatient.id);
      success('Triagem IA Concluída', `Classificação: ${res.triage.manchesterCategory} (${res.triage.urgency.toUpperCase()})`);

      // Update patient in local state
      if (res.patient) {
        setPatients((prev) => prev.map((p) => (p.id === res.patient!.id ? res.patient! : p)));
      }
    } catch (err: any) {
      if (err.name === 'FeatureNotAvailableError') {
        warning('Recurso Não Incluso', err.message);
      } else {
        error('Falha na Triagem IA', err.message || 'Erro ao processar IA.');
      }
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  // Toggle checklist item
  const handleToggleChecklist = async (key: 'doc_enviado' | 'convenio_validado' | 'termo_assinado') => {
    if (!selectedPatient) return;
    const updatedChecklist = {
      ...selectedPatient.checklist,
      [key]: !selectedPatient.checklist[key],
    };

    try {
      const res = await apiService.updatePatient(selectedPatient.id, {
        checklist: updatedChecklist,
      });
      setPatients((prev) => prev.map((p) => (p.id === res.patient.id ? res.patient : p)));
      info('Checklist Atualizado', 'Item alterado com sucesso.');
    } catch (err: any) {
      error('Erro ao atualizar checklist', err.message);
    }
  };

  // Toggle Human Review
  const handleToggleReview = async () => {
    if (!selectedPatient) return;
    try {
      const res = await apiService.updatePatient(selectedPatient.id, {
        requiresHumanReview: !selectedPatient.requiresHumanReview,
      });
      setPatients((prev) => prev.map((p) => (p.id === res.patient.id ? res.patient : p)));
      success('Revisão Atualizada', selectedPatient.requiresHumanReview ? 'Caso liberado pelo operador.' : 'Marcado para revisão.');
    } catch (err: any) {
      error('Erro', err.message);
    }
  };

  // Delete Patient (RBAC sensitive action)
  const handleDeletePatient = async () => {
    if (!selectedPatient) return;
    if (!confirm(`Tem certeza que deseja excluir permanentemente o cadastro de ${selectedPatient.name}?`)) {
      return;
    }

    try {
      await apiService.deletePatient(selectedPatient.id);
      success('Paciente Removido', 'Registro excluído em conformidade com a LGPD.');
      setPatients((prev) => prev.filter((p) => p.id !== selectedPatient.id));
      setSelectedPatientId('');
    } catch (err: any) {
      error('Permissão Insuficiente', err.message || 'Apenas administradores podem excluir pacientes.');
    }
  };

  const urgencyStyles: Record<UrgencyLevel, { badge: string; border: string; dot: string }> = {
    critica: { badge: 'bg-red-600 text-white', border: 'border-l-4 border-l-red-600', dot: 'bg-red-500' },
    alta: { badge: 'bg-orange-500 text-white', border: 'border-l-4 border-l-orange-500', dot: 'bg-orange-500' },
    media: { badge: 'bg-amber-400 text-slate-950 font-bold', border: 'border-l-4 border-l-amber-400', dot: 'bg-amber-400' },
    baixa: { badge: 'bg-emerald-500 text-white', border: 'border-l-4 border-l-emerald-500', dot: 'bg-emerald-500' },
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-61px)] overflow-hidden bg-slate-100">
      {/* COLUMN 1: Queue / Patient List (340px) */}
      <div className="w-full lg:w-80 shrink-0 bg-white border-r border-slate-200 flex flex-col h-full">
        {/* Search & Header */}
        <div className="p-3 border-b border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
              Fila de Atendimentos ({patients.length})
            </span>
            <button
              onClick={onOpenNewPatientModal}
              className="p-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Novo
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF ou fone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Filters row */}
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-medium"
            >
              <option value="todas">Urgência: Todas</option>
              <option value="critica">Crítica (Vermelho)</option>
              <option value="alta">Alta (Laranja)</option>
              <option value="media">Média (Amarelo)</option>
              <option value="baixa">Baixa (Verde)</option>
            </select>

            <select
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-medium"
            >
              <option value="todas">Espec: Todas</option>
              <option value="Cardiologia">Cardiologia</option>
              <option value="Dermatologia">Dermatologia</option>
              <option value="Ortopedia">Ortopedia</option>
            </select>
          </div>
        </div>

        {/* Patients List Scrollable */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {isLoadingPatients ? (
            <div className="p-8 text-center text-xs text-slate-400">Carregando fila...</div>
          ) : patients.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">Nenhum atendimento localizado.</div>
          ) : (
            patients.map((p) => {
              const isSelected = p.id === selectedPatientId;
              const uStyle = urgencyStyles[p.urgency] || urgencyStyles.media;

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPatientId(p.id)}
                  className={`p-3 cursor-pointer transition-all ${uStyle.border} ${
                    isSelected ? 'bg-sky-50/80 border-r-2 border-r-sky-600' : 'hover:bg-slate-50 bg-white'
                  }`}
                  id={`patient-card-${p.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="truncate">
                      <div className="font-bold text-xs text-slate-900 truncate">{p.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span className="font-medium text-slate-700">{p.specialty}</span>
                        <span>•</span>
                        <span>{p.healthInsurance}</span>
                      </div>
                    </div>

                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase shrink-0 ${uStyle.badge}`}>
                      {p.urgency}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                    <span className="capitalize text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {p.originChannel}
                    </span>
                    {p.requiresHumanReview && (
                      <span className="text-amber-700 bg-amber-50 border border-amber-200 px-1 rounded font-bold">
                        Revisão IA
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* COLUMN 2: Chat Stream & Omnichannel Messenger */}
      <div className="flex-1 flex flex-col h-full bg-slate-50 border-r border-slate-200">
        {selectedPatient ? (
          <>
            {/* Chat Top Bar */}
            <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                  {selectedPatient.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs text-slate-900">{selectedPatient.name}</h3>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 capitalize">
                      {selectedPatient.originChannel}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span>{selectedPatient.phone}</span>
                    <span>•</span>
                    <span>CPF: {selectedPatient.cpf || 'Não informado'}</span>
                  </div>
                </div>
              </div>

              {/* AI Trigger Action */}
              <button
                onClick={handleRunAITriage}
                disabled={isAnalyzingAI}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-spin" />
                {isAnalyzingAI ? 'Analisando Dual IA...' : 'Triagem Manchester IA'}
              </button>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  Nenhuma mensagem registrada nesta conversa. Envie uma mensagem ou nota interna abaixo.
                </div>
              ) : (
                messages.map((m) => {
                  if (m.isInternalNote) {
                    return (
                      <div
                        key={m.id}
                        className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl max-w-lg mx-auto shadow-2xs"
                      >
                        <div className="flex items-center gap-1.5 text-amber-800 text-[10px] font-bold uppercase mb-1">
                          <StickyNote className="w-3.5 h-3.5 text-amber-600" />
                          <span>Nota Interna • Visível apenas para a clínica</span>
                        </div>
                        <p className="text-xs text-amber-950 leading-relaxed whitespace-pre-wrap">{m.text}</p>
                        <div className="text-right text-[10px] text-amber-700/80 mt-1">
                          {m.senderName || 'Atendente'} • {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    );
                  }

                  const isMe = m.sender === 'attendant' || m.sender === 'bot';

                  return (
                    <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                          isMe
                            ? 'bg-slate-900 text-white rounded-br-xs'
                            : 'bg-white text-slate-900 border border-slate-200 rounded-bl-xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.text}</p>
                        <div
                          className={`text-[10px] mt-1.5 flex items-center justify-end gap-1 ${
                            isMe ? 'text-slate-400' : 'text-slate-400'
                          }`}
                        >
                          <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isMe && <CheckCircle2 className="w-3 h-3 text-sky-400" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Templates Drawer */}
            <div className="px-4 py-2 bg-white border-t border-slate-200 flex items-center gap-2 overflow-x-auto">
              <span className="text-[11px] font-semibold text-slate-400 shrink-0">Respostas Rápidas:</span>
              {quickResponses.map((qr, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const text = qr.text.replace('{{paciente}}', selectedPatient.name.split(' ')[0]);
                    setInputText(text);
                  }}
                  className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium shrink-0 transition-colors"
                >
                  {qr.label}
                </button>
              ))}
            </div>

            {/* Input Composer */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsInternalNote(false)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                      !isInternalNote ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Mensagem ao Paciente
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsInternalNote(true)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                      isInternalNote
                        ? 'bg-amber-400 text-slate-950 shadow-2xs'
                        : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
                    }`}
                  >
                    <StickyNote className="w-3.5 h-3.5" /> Nota Privada Interna
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={
                    isInternalNote
                      ? 'Escreva uma anotação privada que ficará gravada no histórico...'
                      : `Digite uma resposta para ${selectedPatient.name}...`
                  }
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className={`flex-1 px-3.5 py-2 text-xs border rounded-xl focus:outline-hidden focus:ring-2 ${
                    isInternalNote
                      ? 'bg-amber-50/50 border-amber-300 focus:ring-amber-400 text-amber-950'
                      : 'bg-slate-50 border-slate-300 focus:ring-sky-500 text-slate-900'
                  }`}
                />

                <button
                  type="submit"
                  disabled={isSending || !inputText.trim()}
                  className={`p-2.5 rounded-xl text-white font-bold transition-all disabled:opacity-50 ${
                    isInternalNote ? 'bg-amber-600 hover:bg-amber-700' : 'bg-sky-600 hover:bg-sky-700'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
            Selecione um paciente na fila à esquerda para iniciar o atendimento.
          </div>
        )}
      </div>

      {/* COLUMN 3: Clinical Card & AI Insights (340px) */}
      <div className="w-full lg:w-80 shrink-0 bg-white border-l border-slate-200 flex flex-col h-full overflow-y-auto p-4 space-y-4">
        {selectedPatient ? (
          <>
            {/* Patient Header Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Ficha do Paciente</span>
                <button
                  onClick={() => onOpenEditModal(selectedPatient)}
                  className="p-1 text-slate-600 hover:text-sky-600 hover:bg-white rounded-md transition-colors"
                  title="Editar cadastro"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h4 className="font-bold text-sm text-slate-900">{selectedPatient.name}</h4>
              <div className="text-xs text-slate-600 mt-1 space-y-1">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{selectedPatient.phone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-3 h-3 text-slate-400" />
                  <span>
                    {selectedPatient.healthInsurance}{' '}
                    {selectedPatient.planNumber ? `• Nº ${selectedPatient.planNumber}` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Nascimento: {selectedPatient.birthDate || 'Não informado'}</span>
                </div>
              </div>
            </div>

            {/* Checklist de Atendimento */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
              <h5 className="font-bold text-xs text-slate-800 flex items-center justify-between">
                <span>Checklist de Entrada</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </h5>

              <div className="space-y-1.5 text-xs text-slate-700">
                <div
                  onClick={() => handleToggleChecklist('doc_enviado')}
                  className="flex items-center gap-2 cursor-pointer hover:text-slate-900"
                >
                  {selectedPatient.checklist.doc_enviado ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                  <span>Documento com Foto (RG/CNH)</span>
                </div>

                <div
                  onClick={() => handleToggleChecklist('convenio_validado')}
                  className="flex items-center gap-2 cursor-pointer hover:text-slate-900"
                >
                  {selectedPatient.checklist.convenio_validado ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                  <span>Elegibilidade de Convênio</span>
                </div>

                <div
                  onClick={() => handleToggleChecklist('termo_assinado')}
                  className="flex items-center gap-2 cursor-pointer hover:text-slate-900"
                >
                  {selectedPatient.checklist.termo_assinado ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                  <span>Termo de Consentimento LGPD</span>
                </div>
              </div>
            </div>

            {/* AI Insights Block (Dual Router & Manchester) */}
            <div className="bg-purple-50/70 p-4 rounded-xl border border-purple-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-purple-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Triagem & IA
                </span>
                <span className="text-[10px] bg-purple-200 text-purple-900 font-bold px-1.5 py-0.2 rounded">
                  {selectedPatient.urgency.toUpperCase()}
                </span>
              </div>

              <div className="text-xs text-purple-900 leading-relaxed">
                {selectedPatient.aiSummary || 'Triagem preliminar baseada em queixa principal.'}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 pt-1">
                {selectedPatient.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Human Review Guardrail Button */}
              <div className="pt-2 border-t border-purple-200">
                <button
                  onClick={handleToggleReview}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-colors ${
                    selectedPatient.requiresHumanReview
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {selectedPatient.requiresHumanReview ? '✓ Aprovar Revisão Humana' : 'Revisão Concluída'}
                </button>
              </div>
            </div>

            {/* Delete Patient (Sensitive Action) */}
            <div className="pt-2">
              <button
                onClick={handleDeletePatient}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Excluir Atendimento (LGPD)
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
