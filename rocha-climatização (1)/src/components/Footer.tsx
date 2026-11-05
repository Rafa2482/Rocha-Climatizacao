import React from 'react';
import { SiteSettings, SiteTexts } from '../types/index.ts';
import { Phone, Mail, MapPin } from 'lucide-react';
import { buildWhatsAppUrl } from '../utils/whatsapp.ts';

interface FooterProps {
  settings: SiteSettings;
  texts: SiteTexts;
  onNavigate?: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, texts, onNavigate }) => {
  const currentYear = 2026;

  const scrollTo = (hash: string) => {
    const el = document.querySelector(hash);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4">
            <a href="/" className="inline-block">
              <img
                src={settings.logoUrl || '/assets/aistudio/ChatGPT_Image_23_de_ago._de_2026__00_11_45_3301b7e2.png'}
                alt="Rocha Climatização"
                className="h-14 w-auto object-contain"
              />
            </a>
            <p className="text-slate-400 leading-relaxed text-xs">
              {settings.slogan || 'Conforto hoje, tranquilidade sempre!'} Cuidando do seu conforto e segurança em cada detalhe, com instalações e manutenções de ar-condicionado de alto padrão em São Paulo.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">Navegação</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollTo('#inicio')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Início
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('#produtos')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Aparelhos & Produtos
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('#servicos')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Serviços Especializados
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('#precos')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Tabela de Preços & Orçamentos
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('#galeria')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Galeria de Trabalhos
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('#sobre')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Sobre a Empresa
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('#contato')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Fale Conosco
                </button>
              </li>
            </ul>
          </div>

          {/* Services list */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">Serviços</h4>
            <ul className="space-y-2 text-slate-400">
              <li>Instalação Split Hi-Wall & Inverter</li>
              <li>Limpeza e Higienização com Bactericida</li>
              <li>Manutenção Preventiva e Corretiva</li>
              <li>Infraestrutura em Cobre e Gás</li>
              <li>Instalação Elétrica com Ponto Dedicado</li>
              <li>Emissão de ART para Condomínios</li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">Atendimento</h4>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{settings.serviceArea || 'São Paulo e Região Metropolitana'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={buildWhatsAppUrl(settings)} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400">
                  {settings.phone1 || '(11) 99968-5162'}
                </a>
              </div>
              {settings.phone2 && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>{settings.phone2}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-white break-all">
                  {settings.email || 'contato@rochaclimatizacao.com.br'}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Sitemap and disclaimer */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>
            © {currentYear} {settings.companyName || 'Rocha Construção e Climatização'}. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 underline">
              Mapa do Site (XML)
            </a>
            <span>·</span>
            <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 underline">
              Robots.txt
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
