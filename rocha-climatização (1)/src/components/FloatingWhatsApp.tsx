import React from 'react';
import { MessageSquare } from 'lucide-react';
import { SiteSettings } from '../types/index.ts';
import { buildWhatsAppUrl } from '../utils/whatsapp.ts';

interface FloatingWhatsAppProps {
  settings: SiteSettings;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ settings }) => {
  return (
    <aside
      aria-label="Atendimento WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex items-center group"
    >
      <a
        href={buildWhatsAppUrl(settings)}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl shadow-emerald-950/40 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-400/40"
        aria-label="Falar com Rocha Climatização no WhatsApp"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
        </span>

        <MessageSquare className="w-5 h-5 fill-current" />

        <span className="hidden sm:inline-block text-xs whitespace-nowrap">
          {settings.phone1 ? 'WhatsApp Online' : 'Orçamento Rápido'}
        </span>
      </a>
    </aside>
  );
};
