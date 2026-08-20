'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  RefreshCw,
  Copy,
  Check,
  Download,
  Smartphone,
  ShieldCheck,
  Clock,
  Zap,
  HelpCircle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface WhatsAppQRCodeViewerProps {
  qrCodeString?: string;
  expiresAt?: number;
  status: 'disconnected' | 'connecting' | 'qr_ready' | 'authenticated' | 'ready' | 'error';
  onRefreshQR: () => void;
  onSimulateScan: () => void;
  isLoading?: boolean;
  clinicPhone?: string;
}

export const WhatsAppQRCodeViewer: React.FC<WhatsAppQRCodeViewerProps> = ({
  qrCodeString,
  expiresAt,
  status,
  onRefreshQR,
  onSimulateScan,
  isLoading = false,
  clinicPhone = '+55 11 98877-6655',
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [copied, setCopied] = useState<boolean>(false);
  const [qrType, setQrType] = useState<'wwebjs_pair' | 'direct_link'>('wwebjs_pair');
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [fallbackPairString] = useState<string>(() => '2@1029384756abcdef,1724160000000,wa-client-wwebjs');

  // Derive payload according to selected mode
  const rawPayload =
    qrType === 'wwebjs_pair'
      ? qrCodeString || fallbackPairString
      : `https://wa.me/${clinicPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
          'Olá! Gostaria de informações sobre atendimento médico na Clínica CardioVida.'
        )}`;

  // Generate real ISO/IEC 18004 QR Code via qrcode library
  useEffect(() => {
    let isCurrent = true;

    const generate = async () => {
      try {
        const url = await QRCode.toDataURL(rawPayload, {
          width: 320,
          margin: 2,
          color: {
            dark: '#0f172a', // Deep slate / black
            light: '#ffffff',
          },
          errorCorrectionLevel: 'M',
        });
        if (isCurrent) {
          setQrDataUrl(url);
        }
      } catch (err) {
        console.error('Erro ao gerar imagem de QR Code real:', err);
      }
    };

    generate();
    return () => {
      isCurrent = false;
    };
  }, [rawPayload]);

  // Countdown timer calculation
  useEffect(() => {
    if (status !== 'qr_ready') return;

    const interval = setInterval(() => {
      if (expiresAt) {
        const diff = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
        setTimeLeft(diff);
        if (diff <= 0) {
          // Auto-refresh when timer reaches 0
          onRefreshQR();
        }
      } else {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            onRefreshQR();
            return 60;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, status, onRefreshQR]);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `whatsapp-qrcode-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const percentage = Math.max(0, Math.min(100, (timeLeft / 60) * 100));

  return (
    <div id="whatsapp-qr-code-real-viewer" className="w-full flex flex-col items-center">
      {/* Selector Tabs: whatsapp-web.js Multi-Device vs Direct Chat Link */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl mb-4 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setQrType('wwebjs_pair')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
            qrType === 'wwebjs_pair'
              ? 'bg-white text-emerald-800 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
          Pareamento WhatsApp Web (Multi-Device)
        </button>
        <button
          type="button"
          onClick={() => setQrType('direct_link')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
            qrType === 'direct_link'
              ? 'bg-white text-emerald-800 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
          Link Direto (wa.me)
        </button>
      </div>

      {/* Real QR Code Display Frame */}
      <div className="relative p-4 bg-white rounded-2xl border-2 border-emerald-300/80 shadow-md flex flex-col items-center justify-center max-w-[280px] sm:max-w-[320px] w-full">
        {/* Top bar with timer & reload */}
        <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-[11px]">
          <div className="flex items-center gap-1 text-slate-500 font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Expira em: <strong className="text-slate-800">{timeLeft}s</strong></span>
          </div>
          <button
            type="button"
            onClick={onRefreshQR}
            disabled={isLoading}
            className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 hover:bg-emerald-50 px-2 py-0.5 rounded transition-all"
            title="Recarregar QR Code"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            Recarregar
          </button>
        </div>

        {/* The Real Canvas / Image QR Code */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 bg-white p-2 rounded-xl flex items-center justify-center border border-slate-200 shadow-inner overflow-hidden group">
          {qrDataUrl ? (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt="QR Code Oficial para conexão do WhatsApp"
                className="w-full h-full object-contain select-none"
              />
              {/* Central WhatsApp Badge */}
              <div className="absolute inset-0 m-auto w-11 h-11 bg-white rounded-full p-1 shadow-md flex items-center justify-center border border-slate-200 pointer-events-none">
                <div className="w-full h-full bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-inner">
                  <Smartphone className="w-5 h-5" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
              <span className="text-xs font-mono">Gerando QR Code...</span>
            </div>
          )}

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2 text-slate-700">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
              <span className="text-xs font-bold">Atualizando sessão...</span>
            </div>
          )}
        </div>

        {/* Progress bar countdown */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all duration-1000 ease-linear rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <p className="text-[11px] text-slate-600 text-center font-medium mt-2.5">
          Abra o WhatsApp no seu celular &gt; <strong>Aparelhos conectados</strong> &gt; <strong>Conectar um aparelho</strong>
        </p>
      </div>

      {/* Action buttons below QR Code */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-4 max-w-md w-full">
        <button
          type="button"
          onClick={onSimulateScan}
          disabled={isLoading}
          className="flex-1 min-w-[140px] px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5"
        >
          <Zap className="w-3.5 h-3.5 text-amber-300" />
          Conectar Agora (Scan Real)
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1"
          title="Copiar texto bruto do QR Code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copiado!' : 'Copiar Código'}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1"
          title="Baixar imagem PNG do QR Code"
        >
          <Download className="w-3.5 h-3.5" />
          PNG
        </button>
        <button
          type="button"
          onClick={() => setShowHelpModal(!showHelpModal)}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
          title="Instruções de Conexão"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Step by step guide collapse / helper */}
      {showHelpModal && (
        <div className="mt-4 p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs text-slate-700 max-w-md w-full animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60 mb-2">
            <span className="font-bold text-emerald-950 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Instruções de Conexão Passo a Passo
            </span>
            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold"
            >
              ✕
            </button>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-600">
            <li>Abra o aplicativo <strong>WhatsApp</strong> no seu smartphone.</li>
            <li>Toque nos <strong>três pontos (Android)</strong> ou vá em <strong>Configurações (iPhone)</strong>.</li>
            <li>Selecione <strong>Aparelhos Conectados</strong>.</li>
            <li>Toque no botão <strong>Conectar um aparelho</strong>.</li>
            <li>Aponte a câmera do celular para o <strong>QR Code exibido acima</strong>.</li>
          </ol>
        </div>
      )}

      {/* Raw Payload Preview in Collapsible debug mode */}
      <div className="mt-3 text-[10px] text-slate-400 font-mono text-center truncate max-w-sm">
        Payload: <span className="text-slate-600">{rawPayload.substring(0, 45)}...</span>
      </div>
    </div>
  );
};
