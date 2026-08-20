import { TriageResult, UrgencyLevel } from '../types';

/**
 * Heurísticas Clínicas Baseadas no Protocolo de Manchester e Diretrizes de Emergência
 */

interface ClinicalKeywordRule {
  urgency: UrgencyLevel;
  manchesterCategory: string;
  signals: string[];
  patterns: RegExp[];
  recommendedAction: string;
}

const CLINICAL_RULES: ClinicalKeywordRule[] = [
  {
    urgency: 'critica',
    manchesterCategory: 'Vermelho (Emergência - 0 min)',
    signals: ['Dor torácica súbita', 'Dispneia grave', 'Parada cardiorrespiratória', 'Perda de consciência'],
    patterns: [
      /dor\s+(no\s+peito|tor[áa]cica|no\s+cora[çc][ãa]o)/i,
      /falta\s+de\s+ar\s+(grave|s[úu]bita|muito\s+forte|asfixi)/i,
      /desmai(ou|o)|perdeu\s+os\s+sentidos|inconsciente/i,
      /suspeita\s+de\s+avc|boca\s+torta|dorm[êe]ncia\s+subita/i,
      /sangramento\s+(ativo|incontrol[áa]vel|profuso|hemorragia)/i,
    ],
    recommendedAction: 'Encaminhamento IMEDIATO ao Pronto-Socorro / SAMU 192 e notificação sonora à equipe.',
  },
  {
    urgency: 'alta',
    manchesterCategory: 'Laranja (Muito Urgente - 10 min)',
    signals: ['Febre alta persistente (>39°C)', 'Dor intensa aguda', 'Crise asmática', 'Cólica renal severa'],
    patterns: [
      /febre\s+(alta|39|40|que\s+n[ãa]o\s+passa)/i,
      /dor\s+(insuport[áa]vel|muito\s+forte|intensa|aguda)/i,
      /c[óo]lica\s+renal|dor\s+nos\s+rins/i,
      /v[ôo]mitos\s+incessantes|desidrata[çc][ãa]o/i,
      /rea[çc][ãa]o\s+al[ée]rgica\s+com\s+incha[çc]o/i,
      /queimadura\s+(grave|extensa)/i,
    ],
    recommendedAction: 'Priorização no encaixe para hoje em até 10 minutos. Triagem com enfermeiro.',
  },
  {
    urgency: 'media',
    manchesterCategory: 'Amarelo (Urgente - 60 min)',
    signals: ['Dor moderada', 'Sintomas gripais com prostração', 'Alergia cutânea leve', 'Dúvida pós-cirúrgica'],
    patterns: [
      /dor\s+(moderada|de\s+cabe[çc]a|muscular|de\s+garganta)/i,
      /febre\s+(baixa|38)/i,
      /press[ãa]o\s+(alta|baixa|14|15)/i,
      /tosse|coriza|mal\s+estar/i,
      /diarreia|n[áa]usea/i,
    ],
    recommendedAction: 'Agendamento prioritário no mesmo dia ou dia seguinte com médico plantonista.',
  },
  {
    urgency: 'baixa',
    manchesterCategory: 'Verde (Pouco Urgente - 120 min)',
    signals: ['Check-up de rotina', 'Renovação de receita', 'Consulta eletiva', 'Pedido de exame de rotina'],
    patterns: [
      /consulta\s+de\s+rotina|check[\s-]?up/i,
      /renova[çc][ãa]o\s+de\s+receita|receita\s+controlada/i,
      /marcar\s+consulta|agendar\s+hor[áa]rio/i,
      /retorno\s+m[ée]dico/i,
      /resultado\s+de\s+exame/i,
    ],
    recommendedAction: 'Fluxo padrão de agendamento eletivo de acordo com disponibilidade de agenda.',
  },
];

/**
 * Fallback Heurístico Local quando ambos os provedores de IA estão indisponíveis
 */
export function executeLocalHeuristicTriage(messageText: string, startTime: number): TriageResult {
  const normalized = messageText.toLowerCase();
  const detectedSignals: string[] = [];

  let matchedUrgency: UrgencyLevel | null = null;
  let matchedRule: ClinicalKeywordRule | null = null;

  for (const rule of CLINICAL_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(normalized)) {
        matchedUrgency = rule.urgency;
        matchedRule = rule;
        detectedSignals.push(...rule.signals);
        break;
      }
    }
    if (matchedUrgency) break;
  }

  // REGRA DE OURO #1: Dúvida / Ambiguidade NUNCA resulta em baixa urgência silenciosa.
  // Padrão obrigatório na dúvida: 'media'
  const finalUrgency: UrgencyLevel = matchedUrgency || 'media';
  const finalCategory = matchedRule?.manchesterCategory || 'Amarelo (Urgente / Dúvida Heurística - 60 min)';
  const finalSignals = detectedSignals.length > 0 ? Array.from(new Set(detectedSignals)) : ['Sintoma não especificado com clareza'];
  const finalAction = matchedRule?.recommendedAction || 'Avaliação médica recomendada em até 60 minutos.';

  const colorMap: Record<UrgencyLevel, 'vermelho' | 'laranja' | 'amarelo' | 'verde' | 'azul'> = {
    critica: 'vermelho',
    alta: 'laranja',
    media: 'amarelo',
    baixa: 'verde',
  };

  // REGRA DE OURO #2: requiresHumanReview = true SEMPRE forçado se:
  // - Urgência for 'alta' ou 'critica'
  // - Resposta gerada por mecanismo de Fallback Heurístico Local
  const requiresHumanReview = true; // Sempre true no fallback local

  return {
    urgency: finalUrgency,
    confidence: matchedUrgency ? 0.75 : 0.5,
    clinicalSignals: finalSignals,
    recommendedAction: finalAction,
    manchesterCategory: finalCategory,
    manchesterColor: colorMap[finalUrgency] || 'amarelo',
    requiresHumanReview,
    providerUsed: 'Fallback Heurístico Local',
    executionTimeMs: Date.now() - startTime,
    reasoning: matchedUrgency
      ? `Identificado padrão clínico de ${matchedUrgency} urgência via análise heurística de palavras-chave.`
      : 'Mensagem ambígua ou sem padrão claro detectado. Aplicado guardrail de segurança padrão (Urgência Média) com revisão humana mandatória.',
  };
}

/**
 * Aplica os Guardrails Clínicos Estritos sobre o resultado de qualquer provedor
 */
export function applyClinicalGuardrails(result: TriageResult): TriageResult {
  const isHighOrCritical = result.urgency === 'critica' || result.urgency === 'alta';
  const isFallback = result.providerUsed === 'Fallback Heurístico Local';

  // Força flag de revisão humana obrigatória
  const enforcedHumanReview = isHighOrCritical || isFallback || result.requiresHumanReview;

  const colorMap: Record<UrgencyLevel, 'vermelho' | 'laranja' | 'amarelo' | 'verde' | 'azul'> = {
    critica: 'vermelho',
    alta: 'laranja',
    media: 'amarelo',
    baixa: 'verde',
  };

  return {
    ...result,
    manchesterColor: result.manchesterColor || colorMap[result.urgency] || 'amarelo',
    requiresHumanReview: enforcedHumanReview,
  };
}
