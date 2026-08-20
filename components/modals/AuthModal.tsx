'use client';

import React, { useState } from 'react';
import {
  X,
  HeartPulse,
  Lock,
  Mail,
  User as UserIcon,
  Building2,
  Phone,
  Stethoscope,
  Users,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  Database,
  Server,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register_trial';
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ isOpen, initialMode = 'login', onClose, onSuccess }: AuthModalProps) {
  const { login, registerTrial } = useAuth();
  const { success, error: toastError } = useToast();

  const [mode, setMode] = useState<'login' | 'register_trial'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('admin@cardiovida.com.br');
  const [loginPassword, setLoginPassword] = useState('••••••••');

  // Trial form state
  const [trialData, setTrialData] = useState({
    name: '',
    email: '',
    phone: '',
    clinicName: '',
    specialty: 'Cardiologia e Gestão Médica',
    teamSize: '1 a 5 atendentes',
    password: '',
    acceptTerms: true,
  });

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginEmail) {
      setErrorMessage('Por favor, informe seu e-mail de acesso.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(loginEmail, loginPassword);
      success('Login realizado com sucesso', 'Acessando o painel de governança clínica...');
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'E-mail ou senha incorretos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickRoleLogin = async (email: string) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await login(email);
      success('Acesso concedido', 'Entrando com perfil de demonstração...');
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao trocar perfil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!trialData.name.trim()) {
      setErrorMessage('Informe seu nome completo.');
      return;
    }
    if (!trialData.email.trim()) {
      setErrorMessage('Informe seu e-mail profissional.');
      return;
    }
    if (!trialData.clinicName.trim()) {
      setErrorMessage('Informe o nome da sua clínica ou consultório.');
      return;
    }
    if (!trialData.acceptTerms) {
      setErrorMessage('É necessário aceitar os Termos e Diretrizes de Privacidade da LGPD.');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerTrial({
        name: trialData.name,
        email: trialData.email,
        phone: trialData.phone,
        clinicName: trialData.clinicName,
        specialty: trialData.specialty,
        teamSize: trialData.teamSize,
        password: trialData.password,
        acceptTerms: trialData.acceptTerms,
      });

      success(
        'Teste de 7 Dias Ativado!',
        `Bem-vindo(a) ao MediFlux Health! O ambiente para a ${trialData.clinicName} foi provisionado.`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao processar o cadastro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-tight">MediFlux</span>
                <span className="text-[10px] font-bold text-sky-400 bg-sky-950 border border-sky-800/80 px-1.5 py-0.2 rounded">
                  CRM HEALTH
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Autenticação Segura & Governança Hospitalar</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 p-1.5 m-4 bg-slate-950 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              mode === 'login'
                ? 'bg-slate-800 text-white shadow-xs border border-slate-700/80'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-sky-400" />
            <span>Entrar no CRM</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('register_trial');
              setErrorMessage(null);
            }}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 relative ${
              mode === 'register_trial'
                ? 'bg-gradient-to-r from-sky-600 to-teal-600 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>Testar 7 Dias Grátis</span>
            <span className="hidden sm:inline text-[9px] bg-emerald-400 text-slate-950 font-extrabold px-1.5 py-0.2 rounded-full ml-1">
              FULL
            </span>
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-left flex-1">
          {/* Dynalite Security Status Banner */}
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2 text-slate-300">
              <Database className="w-3.5 h-3.5 text-sky-400" />
              <span>Validação de Acesso: <strong>Dynalite DynamoDB</strong></span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Ativo
            </span>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-300 text-xs space-y-2 animate-in slide-in-from-top-1">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <div className="leading-relaxed font-medium">{errorMessage}</div>
              </div>
              {errorMessage.includes('Dynalite') && mode === 'login' && (
                <div className="pt-1 border-t border-rose-900/60 flex items-center justify-between">
                  <span className="text-[11px] text-rose-300/80">Deseja registrar este e-mail?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setTrialData((prev) => ({ ...prev, email: loginEmail }));
                      setMode('register_trial');
                      setErrorMessage(null);
                    }}
                    className="text-[11px] font-bold text-teal-300 hover:text-teal-200 underline flex items-center gap-1"
                  >
                    <span>Cadastrar no Dynalite</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {mode === 'login' ? (
            /* ===== LOGIN FORM ===== */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">E-mail de Acesso</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="seu.email@clinica.com.br"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">Senha</label>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('admin@cardiovida.com.br');
                      setLoginPassword('cardiovida2026');
                    }}
                    className="text-[11px] text-sky-400 hover:text-sky-300"
                  >
                    Usar senha padrão demo
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Sua senha de segurança"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-white text-xs font-extrabold shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Autenticando sessão...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar no Sistema</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Demo Profiles 1-click Quick Login */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Perfis Rápidos de Demonstração (1 Clique):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickRoleLogin('admin@cardiovida.com.br')}
                    className="p-2 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-sky-700/50 rounded-xl text-left transition-all"
                  >
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Dr. Roberto (Admin)</span>
                      <span className="text-[9px] bg-purple-950 text-purple-300 border border-purple-800 px-1 rounded">
                        Full
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">admin@cardiovida.com.br</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickRoleLogin('camila.med@cardiovida.com.br')}
                    className="p-2 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-sky-700/50 rounded-xl text-left transition-all"
                  >
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Dra. Camila (Médico)</span>
                      <span className="text-[9px] bg-sky-950 text-sky-300 border border-sky-800 px-1 rounded">
                        Clínico
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">camila.med@cardiovida.com.br</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickRoleLogin('recepcao@cardiovida.com.br')}
                    className="p-2 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-sky-700/50 rounded-xl text-left transition-all"
                  >
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Juliana (Recepção)</span>
                      <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1 rounded">
                        Chat
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">recepcao@cardiovida.com.br</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickRoleLogin('financeiro@cardiovida.com.br')}
                    className="p-2 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-sky-700/50 rounded-xl text-left transition-all"
                  >
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Carlos (Financeiro)</span>
                      <span className="text-[9px] bg-amber-950 text-amber-300 border border-amber-800 px-1 rounded">
                        TISS
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">financeiro@cardiovida.com.br</div>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* ===== REGISTER 7-DAY TRIAL FORM ===== */
            <form onSubmit={handleTrialSubmit} className="space-y-4">
              {/* Highlight Banner */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-sky-950/80 to-teal-950/80 border border-sky-800/50 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-sky-300 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  <span>Acesso Imediato ao Plano Enterprise Health</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Teste todas as funcionalidades por 7 dias sem cobrança: Triagem Manchester com Dual AI, WhatsApp
                  Oficial e Integração PEP.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Nome do Responsável / Médico *</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={trialData.name}
                      onChange={(e) => setTrialData({ ...trialData, name: e.target.value })}
                      placeholder="Dr(a). Marcelo Antunes"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-sky-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">E-mail Profissional *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={trialData.email}
                      onChange={(e) => setTrialData({ ...trialData, email: e.target.value })}
                      placeholder="marcelo@clinicamarcelo.com.br"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-sky-500/50"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Nome da Clínica ou Consultório *</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={trialData.clinicName}
                      onChange={(e) => setTrialData({ ...trialData, clinicName: e.target.value })}
                      placeholder="Instituto de Saúde Antunes"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-sky-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">WhatsApp / Telefone</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={trialData.phone}
                      onChange={(e) => setTrialData({ ...trialData, phone: e.target.value })}
                      placeholder="(11) 98877-6655"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-sky-500/50"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Especialidade Principal</label>
                  <div className="relative">
                    <Stethoscope className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={trialData.specialty}
                      onChange={(e) => setTrialData({ ...trialData, specialty: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500/50 appearance-none"
                    >
                      <option value="Cardiologia e Gestão Médica">Cardiologia</option>
                      <option value="Dermatologia & Estética Avançada">Dermatologia</option>
                      <option value="Ortopedia e Traumatologia">Ortopedia</option>
                      <option value="Oftalmologia">Oftalmologia</option>
                      <option value="Pediatria">Pediatria</option>
                      <option value="Ginecologia e Obstetrícia">Ginecologia & Obstetrícia</option>
                      <option value="Clínica Médica Geral">Clínica Geral</option>
                      <option value="Policlínica / Multiespecialidades">Policlínica / Multiespecialidades</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Tamanho da Equipe</label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={trialData.teamSize}
                      onChange={(e) => setTrialData({ ...trialData, teamSize: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500/50 appearance-none"
                    >
                      <option value="1 a 5 atendentes">1 a 5 atendentes</option>
                      <option value="6 a 15 atendentes">6 a 15 atendentes</option>
                      <option value="Mais de 16 atendentes">Mais de 16 atendentes</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Crie uma Senha de Acesso</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={trialData.password}
                    onChange={(e) => setTrialData({ ...trialData, password: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-10 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-sky-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Consent and LGPD Checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer pt-1 text-[11px] text-slate-400">
                <input
                  type="checkbox"
                  checked={trialData.acceptTerms}
                  onChange={(e) => setTrialData({ ...trialData, acceptTerms: e.target.checked })}
                  className="mt-0.5 rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-0"
                />
                <span>
                  Concordo com os Termos de Uso e Política de Privacidade da MediFlux, em conformidade com o Artigo 11
                  da LGPD para dados sensíveis de saúde.
                </span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-white text-xs font-extrabold shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Provisionando clínica e ativando 7 dias...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-teal-200" />
                    <span>Criar Conta & Iniciar Teste de 7 Dias</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Sem cartão
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> LGPD Art. 11
                </span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" /> Ativação Imediata
                </span>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer Link */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <div>
              Não possui uma clínica cadastrada?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register_trial');
                  setErrorMessage(null);
                }}
                className="text-sky-400 hover:text-sky-300 font-bold ml-1"
              >
                Testar grátis por 7 dias
              </button>
            </div>
          ) : (
            <div>
              Já possui uma conta ativa no MediFlux?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
                className="text-sky-400 hover:text-sky-300 font-bold ml-1"
              >
                Fazer login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
