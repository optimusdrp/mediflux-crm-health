'use client';

import React, { useState, useRef } from 'react';
import {
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Bot,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  Database,
  Smartphone,
  BarChart3,
  ClockAlert,
  Users,
  Activity,
  ChevronRight,
  Building2,
  MessageSquareText,
  Sliders,
  Award,
  Layers,
  FileCheck,
  PhoneCall,
  Play,
  FlaskConical,
} from 'lucide-react';
import { AuthModal } from '@/components/modals/AuthModal';

interface LandingPageProps {
  onEnterApp: () => void;
}

export function LandingPage({ onEnterApp }: LandingPageProps) {
  const [selectedPlanPeriod, setSelectedPlanPeriod] = useState<'monthly' | 'annual'>('annual');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register_trial'>('login');
  const [isTestModeActive, setIsTestModeActive] = useState(false);

  const [logoClicks, setLogoClicks] = useState(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = () => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    const nextClicks = logoClicks + 1;
    setLogoClicks(nextClicks);

    if (nextClicks >= 5) {
      setIsTestModeActive(true);
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
      setLogoClicks(0);
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        setLogoClicks(0);
      }, 3000);
    }
  };

  const openLogin = () => {
    setIsTestModeActive(false);
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const openTrialRegister = () => {
    setIsTestModeActive(false);
    setAuthModalMode('register_trial');
    setIsAuthModalOpen(true);
  };

  const features = [
    {
      icon: Bot,
      title: 'Triagem Clínica Dual AI (Manchester)',
      badge: 'Dual Engine',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      description:
        'Cascata com Amazon Bedrock + Google Gemini e fallback heurístico com Manchester rigoroso. Identificação automática de emergências clínicas e encaminhamento com revisão humana mandatória.',
    },
    {
      icon: ShieldCheck,
      title: 'Conformidade LGPD & Trilha Imutável',
      badge: 'Art. 11 LGPD',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description:
        'Registro de auditoria criptográfico de cada acesso a prontuário, exportação de relatórios regulatórios, anonimização com 1 clique e gestão granular de consentimento do paciente.',
    },
    {
      icon: Smartphone,
      title: 'Omnichannel com WhatsApp Cloud API',
      badge: 'Meta Oficial',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
      description:
        'Conexão oficial da Meta BSP sem risco de bloqueio de número, central multi-atendente, mensagens estruturadas, templates aprovados e simulador integrado.',
    },
    {
      icon: Database,
      title: 'Integrações PEP / EHR Nativas (TISS/TUSS)',
      badge: 'HL7 & TISS',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      description:
        'Sincronização bidirecional de agendamentos e prontuários com iClinic, TOTVS Saúde, HiDoctor e Feegow, com reconciliação automática de duplicados.',
    },
    {
      icon: ClockAlert,
      title: 'Matriz de SLA & Alertas WhatsApp',
      badge: 'Zero No-Show',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      description:
        'Disparo de alertas imediatos via WhatsApp para o telefone de plantão em casos críticos, sirenes na tela da recepção e monitoramento de tempo de espera em tempo real.',
    },
    {
      icon: Lock,
      title: 'Controle de Acesso RBAC em 2 Camadas',
      badge: 'Segurança',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      description:
        'Permissões personalizadas por perfil (Admin, Médico, Recepção, Faturamento, Terceirizado) com restrições a nível de tela e ações críticas de governança.',
    },
  ];

  const metrics = [
    { value: '< 2.4s', label: 'Tempo Médio de Triagem IA', desc: 'Classificação Manchester imediata' },
    { value: '99.98%', label: 'Disponibilidade com Fallback', desc: 'Redundância dual resiliente' },
    { value: '-42%', label: 'Redução de No-Show', desc: 'Com automações e confirmações ativas' },
    { value: '100%', label: 'Auditoria e Isolamento Tenant', desc: 'Separação lógica por clínica' },
  ];

  const plans = [
    {
      name: 'Clínica Pro',
      highlight: false,
      priceMonthly: 'R$ 590',
      priceAnnual: 'R$ 490',
      description: 'Ideal para consultórios individuais e clínicas em expansão com foco em triagem ágil.',
      features: [
        'Até 5 atendentes simultâneos',
        '1 Número WhatsApp Cloud API Oficial',
        'Triagem Clínica Dual AI (Até 1.500 msgs/mês)',
        'Kanban de Jornadas e Funis',
        'Conformidade LGPD com Trilha de Auditoria',
        'Suporte em horário comercial',
      ],
      cta: 'Iniciar Demonstração',
    },
    {
      name: 'Enterprise Health',
      highlight: true,
      badge: 'Mais Escolhido',
      priceMonthly: 'R$ 1.290',
      priceAnnual: 'R$ 990',
      description: 'Estrutura completa para policlínicas, hospitais-dia e centros médicos de alta demanda.',
      features: [
        'Atendentes ilimitados com RBAC avançado',
        'Múltiplos números WhatsApp + Webhook API',
        'Triagem Dual AI ilimitada + Triage Lab',
        'Integrações PEP (iClinic, TOTVS, HiDoctor, Feegow)',
        'Alertas de Plantão WhatsApp + SLA Sonoro',
        'Unificação inteligente de pacientes duplicados',
        'Gerente de conta e SLA de 99.9%',
      ],
      cta: 'Acessar Ambiente Completo',
    },
    {
      name: 'Redes & Hospitais',
      highlight: false,
      priceMonthly: 'Sob Consulta',
      priceAnnual: 'Sob Consulta',
      description: 'Para redes de saúde, operadoras e cooperativas com requisitos complexos de governança.',
      features: [
        'Multi-unidades e filiais isoladas',
        'Conector HL7 / FHIR customizado',
        'Deploy On-Premises ou VPC Dedicada',
        'DPO dedicado para auditorias de compliance',
        'Treinamento presencial para equipes clínicas',
      ],
      cta: 'Falar com Especialistas',
    },
  ];

  const faqs = [
    {
      q: 'Como funciona a Triagem Clínica Dual AI com Protocolo de Manchester?',
      a: 'O sistema utiliza uma arquitetura em cascata: a mensagem do paciente é avaliada pelo motor primário com guardrails médicos. Caso o provedor esteja indisponível, a requisição passa automaticamente para o modelo secundário ou para o motor heurístico local baseado na tabela de cores de Manchester (Vermelho, Laranja, Amarelo, Verde, Azul). Casos graves acionam revisão humana obrigatória e alertas de plantão.',
    },
    {
      q: 'O MediFlux está de acordo com a LGPD para dados sensíveis de saúde?',
      a: 'Sim. Em conformidade rigorosa com o Art. 11 da LGPD, todos os dados clínicos trafegam criptografados em repouso e em trânsito. O sistema mantém uma trilha imutável de auditoria registrando quem acessou, editou ou exportou prontuários, com ferramentas nativas de anonimização e download de relatórios.',
    },
    {
      q: 'A integração com o WhatsApp é oficial da Meta?',
      a: 'Sim, utilizamos a WhatsApp Business Cloud API Oficial da Meta (BSP). Isso garante entrega instantânea, suporte a templates interativos aprovados, sem risco de banimento de chips ou dependência de aparelhos celulares ligados.',
    },
    {
      q: 'Posso integrar com o meu Prontuário Eletrônico (PEP) atual?',
      a: 'O MediFlux possui conectores nativos para sistemas como iClinic, TOTVS Saúde, HiDoctor e Feegow, além de disponibilizar Webhooks com assinatura criptográfica HMAC SHA-256 e proteção SSRF para conexão com qualquer outro software.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div
            onClick={handleLogoClick}
            className="flex items-center gap-3 cursor-pointer select-none group transition-transform active:scale-95"
            title="Clique 5 vezes no logo para abrir o modo de testes"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 group-hover:ring-2 group-hover:ring-sky-400/40 transition-all">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-lg tracking-tight">MediFlux</span>
                <span className="text-[10px] font-bold text-sky-400 bg-sky-950/90 border border-sky-800/80 px-1.5 py-0.5 rounded tracking-wider">
                  CRM HEALTH
                </span>
                {isTestModeActive && (
                  <span className="text-[9px] font-bold text-amber-300 bg-amber-950/90 border border-amber-600/80 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                    <FlaskConical className="w-2.5 h-2.5" />
                    TESTES
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Plataforma de Governança e Inteligência Clínica
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#recursos" className="hover:text-sky-400 transition-colors">
              Recursos
            </a>
            <a href="#dual-ai" className="hover:text-sky-400 transition-colors">
              Triagem Dual AI
            </a>
            <a href="#seguranca" className="hover:text-sky-400 transition-colors">
              Segurança & LGPD
            </a>
            <a href="#planos" className="hover:text-sky-400 transition-colors">
              Planos & Preços
            </a>
            <a href="#faq" className="hover:text-sky-400 transition-colors">
              Perguntas Frequentes
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={openLogin}
              className="px-4 py-2 text-xs font-extrabold text-white bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 rounded-xl shadow-md shadow-sky-500/20 transition-all flex items-center gap-1.5"
            >
              <span>Entrar no CRM</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-8 overflow-hidden">
        {/* Background glow accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-sky-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[250px] bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs text-sky-400 font-semibold shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Triagem Clínica Dual AI com Manchester & Conformidade LGPD</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            O CRM em Saúde definitivo para{' '}
            <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              escalar atendimentos
            </span>{' '}
            com segurança clínica
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed">
            Centralize atendimentos no WhatsApp Oficial, execute triagem com protocolo de Manchester, automatize
            jornadas do paciente e sincronize com prontuários eletrônicos sob rigorosa conformidade com a LGPD.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={openTrialRegister}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-white text-sm font-bold shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 group"
            >
              <Sparkles className="w-4 h-4 text-teal-200" />
              <span>Testar o MediFlux por 7 dias</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <a
              href="#recursos"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 text-sm font-semibold border border-slate-700/80 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 text-sky-400" />
              <span>Conhecer Funcionalidades</span>
            </a>
          </div>

          {/* Trust Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              WhatsApp Cloud API Oficial (Meta)
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              LGPD Art. 11 & Trilha Auditável
            </span>
            <span className="flex items-center gap-1.5">
              <Database className="w-4 h-4 text-amber-400" />
              Padrão TISS / HL7 Integrado
            </span>
          </div>

          {/* Interactive Mockup Preview Card */}
          <div className="pt-8 max-w-4xl mx-auto">
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-3 sm:p-4 shadow-2xl shadow-sky-950/50 backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 px-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-slate-400 font-mono text-[11px] ml-2">
                    mediflux-health-crm.app/painel
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Sistema Operacional
                  </span>
                </div>
              </div>

              {/* Mockup Dashboard Mini Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 text-left">
                {/* Column 1: Atendimentos & Triagem */}
                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                    <span className="flex items-center gap-1.5">
                      <MessageSquareText className="w-3.5 h-3.5 text-sky-400" /> Atendimentos
                    </span>
                    <span className="text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.2 rounded">
                      1 Crítico
                    </span>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="p-2 bg-slate-900 rounded-lg border border-rose-900/50">
                      <div className="flex items-center justify-between font-bold text-slate-200">
                        <span>Mariana Silva</span>
                        <span className="text-rose-400 text-[10px]">Manchester Vermelho</span>
                      </div>
                      <p className="text-slate-400 text-[10px] truncate">&ldquo;Dor precordial opressiva há 30 min...&rdquo;</p>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                      <div className="flex items-center justify-between font-bold text-slate-200">
                        <span>Carlos Eduardo</span>
                        <span className="text-amber-400 text-[10px]">Manchester Amarelo</span>
                      </div>
                      <p className="text-slate-400 text-[10px] truncate">&ldquo;Dúvida sobre preparo para ecocardiograma...&rdquo;</p>
                    </div>
                  </div>
                </div>

                {/* Column 2: Dual AI Engine */}
                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Motor Dual AI
                    </span>
                    <span className="text-[10px] text-purple-300 bg-purple-950 border border-purple-800 px-1.5 py-0.2 rounded font-mono">
                      Active
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-purple-900/40 text-[11px] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Classificação:</span>
                      <span className="font-bold text-rose-400">Emergência Crítica</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Confiança IA:</span>
                      <span className="font-mono text-emerald-400 font-bold">96.8%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Conduta:</span>
                      <span className="text-slate-200 text-[10px]">Aviso imediato de plantão</span>
                    </div>
                  </div>
                </div>

                {/* Column 3: Jornadas e PEP */}
                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-teal-400" /> Sincronização PEP
                    </span>
                    <span className="text-[10px] text-emerald-300 bg-emerald-950 border border-emerald-800 px-1.5 py-0.2 rounded">
                      iClinic Conectado
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Prontuário:</span>
                      <span className="font-mono text-slate-200 font-bold">#PR-84920</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Auditoria LGPD:</span>
                      <span className="text-emerald-400 text-[10px] font-bold">Assinatura SHA-256</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Status Jornada:</span>
                      <span className="text-sky-400 text-[10px]">Recepção Finalizada</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Counter Section */}
      <section className="py-10 border-y border-slate-800/80 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {metrics.map((m, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight bg-gradient-to-r from-sky-400 to-teal-300 bg-clip-text text-transparent">
                  {m.value}
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-200">{m.label}</div>
                <div className="text-[11px] text-slate-400">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section id="recursos" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-extrabold uppercase tracking-wider text-sky-400 bg-sky-950/80 border border-sky-800 px-2.5 py-1 rounded-full">
            Arquitetura Hospitalar Completa
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Tudo o que sua clínica necessita em um único ecossistema
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Construído para atender as especificidades regulatórias do setor de saúde brasileiro com alta performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const IconComp = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all space-y-4 hover:shadow-xl hover:shadow-sky-950/30 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 group-hover:bg-sky-600/20 text-sky-400 flex items-center justify-center transition-colors">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${feat.badgeColor}`}>
                    {feat.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Dual AI Deep Dive Section */}
      <section id="dual-ai" className="py-16 bg-slate-900/60 border-y border-slate-800/80 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider bg-purple-950 border border-purple-800 px-2.5 py-1 rounded-full">
              Inteligência Artificial Clínica
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Como funciona o Protocolo de Manchester Automatizado
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              O motor de IA do MediFlux analisa cada mensagem recebida via WhatsApp ou canais de chat, extraindo
              sintomas, tempo de evolução e sinais de alerta com base no protocolo internacional de Manchester.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs">
                <span className="w-4 h-4 rounded-full bg-rose-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Vermelho (Emergência Imediata):</strong> Notificação instantânea via
                  WhatsApp ao médico de plantão e alerta sonoro na tela da recepção.
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs">
                <span className="w-4 h-4 rounded-full bg-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Amarelo / Verde (Urgente / Pouco Urgente):</strong> Enfileiramento com
                  SLA prioritário e sugestão de rascunhos com revisão humana.
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs">
                <span className="w-4 h-4 rounded-full bg-sky-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Triagem Lab & Fallback Heurístico:</strong> Simulação prévia de
                  cenários no painel com zero indisponibilidade operacional.
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-950 rounded-2xl p-6 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs font-bold text-slate-300">
              <span>Fluxo de Decisão do MediFlux AI</span>
              <span className="text-emerald-400 font-mono">Status: 200 OK</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-300">
                <span className="text-sky-400">1. Entrada de Mensagem:</span> &ldquo;Sinto aperto no peito e suor frio há 20
                minutos.&rdquo;
              </div>
              <div className="p-3 bg-purple-950/50 rounded-xl border border-purple-900/60 text-purple-200">
                <span className="text-purple-400">2. Motor Primário (Amazon Bedrock / Gemini):</span>
                <div className="text-[11px] text-slate-300 mt-1">
                  • Sinais: Dor torácica opressiva, sudorese, início agudo
                  <br />• Manchester: <strong className="text-rose-400">VERMELHO (Emergência)</strong>
                  <br />• Revisão Humana Obrigatória: <span className="text-emerald-400">SIM</span>
                </div>
              </div>
              <div className="p-3 bg-rose-950/40 rounded-xl border border-rose-900/50 text-rose-200">
                <span className="text-rose-400">3. Ação Imediata:</span> Alerta disparado para WhatsApp do Plantão
                (+55 11 98877-6655).
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing & Plans Section */}
      <section id="planos" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-extrabold uppercase tracking-wider text-sky-400 bg-sky-950/80 border border-sky-800 px-2.5 py-1 rounded-full">
            Planos Transparentes
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Escolha a capacidade ideal para sua clínica
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Sem taxa de adesão oculta. Todos os planos incluem WhatsApp Cloud API Oficial e conformidade LGPD.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setSelectedPlanPeriod('monthly')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                selectedPlanPeriod === 'monthly'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setSelectedPlanPeriod('annual')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                selectedPlanPeriod === 'annual'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Anual</span>
              <span className="text-[10px] bg-emerald-400 text-slate-950 px-1.5 py-0.2 rounded font-extrabold">
                -20% OFF
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {plans.map((p, idx) => (
            <div
              key={idx}
              className={`p-6 sm:p-8 rounded-3xl border flex flex-col justify-between transition-all relative ${
                p.highlight
                  ? 'bg-slate-900 border-sky-500/80 shadow-2xl shadow-sky-950/50 ring-2 ring-sky-500/20'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {p.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-sky-500 to-teal-400 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider shadow-md">
                  {p.badge}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{p.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{p.description}</p>
                </div>

                <div className="py-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">
                      {selectedPlanPeriod === 'annual' ? p.priceAnnual : p.priceMonthly}
                    </span>
                    <span className="text-xs text-slate-400">/mês</span>
                  </div>
                  {selectedPlanPeriod === 'annual' && p.priceAnnual !== 'Sob Consulta' && (
                    <span className="text-[10px] text-emerald-400 font-semibold">Faturamento anual com economia</span>
                  )}
                </div>

                <div className="border-t border-slate-800 pt-4 space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                    Incluso no plano:
                  </span>
                  {p.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={openTrialRegister}
                  className={`w-full py-3 rounded-xl text-xs font-bold transition-all ${
                    p.highlight
                      ? 'bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-white shadow-md shadow-sky-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  {p.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 px-4 sm:px-8 max-w-4xl mx-auto border-t border-slate-800/80">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-extrabold uppercase tracking-wider text-sky-400 bg-sky-950/80 border border-sky-800 px-2.5 py-1 rounded-full">
            Dúvidas Técnicas
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Perguntas Frequentes</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900/70 border border-slate-800/80 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-200 hover:text-white"
                >
                  <span>{faq.q}</span>
                  <ChevronRight
                    className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-90 text-sky-400' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 px-4 sm:px-8 bg-gradient-to-b from-slate-950 to-slate-900 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-400 flex items-center justify-center text-white mx-auto shadow-lg shadow-sky-500/20">
            <HeartPulse className="w-7 h-7" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Pronto para transformar a governança e o atendimento da sua clínica?
          </h2>

          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
            Experimente agora o ecossistema completo com triagem inteligente, conformidade LGPD e WhatsApp Cloud API.
          </p>

          <button
            onClick={openTrialRegister}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-white font-extrabold text-sm shadow-xl shadow-sky-500/25 transition-all inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-teal-200" />
            <span>Testar o MediFlux por 7 dias Grátis</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 px-4 sm:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div
            onClick={handleLogoClick}
            className="flex items-center gap-2 cursor-pointer select-none hover:text-slate-300 transition-colors"
            title="Clique 5 vezes para abrir o modo de testes"
          >
            <HeartPulse className="w-4 h-4 text-sky-400" />
            <span className="font-bold text-slate-300">MediFlux CRM Health</span>
            <span>•</span>
            <span>Tecnologia Médica & Conformidade LGPD</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={openLogin} className="hover:text-white transition-colors">
              Painel do Sistema (Login)
            </button>
            <span>•</span>
            <a href="#seguranca" className="hover:text-white transition-colors">
              Termos & Privacidade
            </a>
            <span>•</span>
            <span>São Paulo, SP - Brasil</span>
          </div>
        </div>
      </footer>

      {/* Auth & Trial Registration Modal */}
      {isAuthModalOpen && (
        <AuthModal
          key={`${authModalMode}-${isTestModeActive}`}
          isOpen={isAuthModalOpen}
          initialMode={authModalMode}
          initialTestMode={isTestModeActive}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={onEnterApp}
        />
      )}
    </div>
  );
}
