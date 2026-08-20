import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'MediFlux CRM Health | Sistema Integrado de Atendimento Clínico & Triagem Inteligente',
  description: 'Plataforma completa de gestão de atendimentos para clínicas médicas com triagem Manchester dual AI, isolamento multi-tenant e conformidade LGPD.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
