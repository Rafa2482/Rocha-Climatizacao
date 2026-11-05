import React, { useState } from 'react';
import { Menu, X, Phone, MessageSquare } from 'lucide-react';
import { SiteSettings } from '../types/index.ts';
import { buildWhatsAppUrl, cleanWhatsAppNumber } from '../utils/whatsapp.ts';

interface HeaderProps {
  settings: SiteSettings;
  onOpenBudgetModal: (serviceName?: string) => void;
  activePath?: string;
  onNavigate?: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onOpenBudgetModal,
  activePath = '/',
  onNavigate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Início', href: '#inicio', path: '/' },
    { label: 'Produtos', href: '#produtos', path: '/#produtos' },
    { label: 'Serviços', href: '#servicos', path: '/servicos' },
    { label: 'Preços', href: '#precos', path: '/precos' },
    { label: 'Galeria', href: '#galeria', path: '/galeria' },
    { label: 'Sobre Nós', href: '#sobre', path: '/sobre' },
    { label: 'Contato', href: '#contato', path: '/contato' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, link: typeof navLinks[0]) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (onNavigate && activePath !== '/' && link.path !== '/') {
      onNavigate(link.path);
      return;
    }

    if (activePath !== '/') {
      if (onNavigate) {
        onNavigate('/');
        setTimeout(() => {
          const el = document.querySelector(link.href);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
      return;
    }

    const el = document.querySelector(link.href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 text-slate-800 shadow-xs transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-20">
          {/* Zone 1: Brand Wordmark & Logo */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              if (onNavigate) onNavigate('/');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg p-1"
          >
            <img
              src={settings.logoUrl || '/assets/aistudio/ChatGPT_Image_23_de_ago._de_2026__00_11_45_3301b7e2.png'}
              alt="Logo Rocha Climatização"
              className="h-13 sm:h-14 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-xs"
            />
          </a>

          {/* Zone 2: 4-5 concise single-line navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-700">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link)}
                className="hover:text-blue-900 transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Zone 3: 1 primary action CTA */}
          <div className="hidden lg:flex items-center gap-4 shrink-0">
            <a
              href={`tel:${cleanWhatsAppNumber(settings.phone1, settings.phone1Raw)}`}
              className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-blue-900 transition-colors whitespace-nowrap shrink-0"
              title="Ligar agora"
            >
              <Phone className="w-3.5 h-3.5 text-amber-500" />
              <span>{settings.phone1}</span>
            </a>
            <a
              href={buildWhatsAppUrl(settings)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm shadow-emerald-700/20 active:scale-95 transition-all whitespace-nowrap shrink-0"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>Orçamento no WhatsApp</span>
            </a>
          </div>

          {/* Mobile menu trigger button */}
          <div className="flex md:hidden items-center gap-2">
            <a
              href={buildWhatsAppUrl(settings)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center p-2 rounded-lg bg-emerald-600 text-white"
              aria-label="WhatsApp"
            >
              <MessageSquare className="w-5 h-5 fill-current" />
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              aria-label="Abrir Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link)}
                className="px-3 py-2.5 rounded-md text-base font-semibold text-slate-700 hover:text-blue-900 hover:bg-slate-50 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2.5">
            <div className="px-3 text-xs text-slate-600 flex items-center gap-2 font-medium">
              <Phone className="w-3.5 h-3.5 text-amber-500" />
              <span>{settings.phone1} / {settings.phone2}</span>
            </div>
            <a
              href={buildWhatsAppUrl(settings)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg text-sm transition-all shadow-sm"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>Solicitar Orçamento no WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
