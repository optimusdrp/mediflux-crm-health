'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldAlert, ArrowRight, ShieldCheck } from 'lucide-react';
import { TabId } from '@/lib/types';

interface AccessDeniedGuardProps {
  tab: TabId;
}

export function AccessDeniedGuard({ tab }: AccessDeniedGuardProps) {
  const { user, switchRole } = useAuth();

  const tabNames: Record<TabId, string> = {
    landing_page: 'Landing Page (Página Pública)',
    visao_geral: 'Visão Geral',
    atendimentos: 'Atendimentos & Chat',
    jornadas: 'Jornadas & Funis',
    pendencias: 'Pendências & SLA',
    automacoes: 'Automações',
    indicadores: 'Indicadores & Billing',
    configuracoes: 'Configurações Administrativas',
    auditoria_lgpd: 'Auditoria LGPD',
    analise_inteligente: 'IA Dual & Triage Lab',
  };

  return (
    <div className="flex-1 p-8 flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 mx-auto flex items-center justify-center mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-1">Acesso Restrito pelo RBAC</h3>
        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          O módulo <strong className="text-slate-800">{tabNames[tab] || tab}</strong> não está habilitado para o perfil{' '}
          <span className="font-semibold uppercase text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
            {user?.role}
          </span>
          .
        </p>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-left text-xs mb-6 text-slate-600 space-y-1">
          <div className="font-semibold text-slate-800">Regra de Segurança de Conformidade:</div>
          <div>• Matriz de Acesso de 2 Camadas (Módulos de Interface e Ações Sensíveis).</div>
          <div>• Acesso registrado e auditado na trilha de não-repúdio do sistema.</div>
        </div>

        <button
          onClick={() => switchRole('admin')}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Alternar para Perfil Administrador
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
