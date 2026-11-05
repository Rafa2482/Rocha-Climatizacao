import React from 'react';
import { MessageSquare, ArrowDown, ShieldCheck, Users, Sparkles, Award } from 'lucide-react';
import { SiteSettings, SiteTexts } from '../types/index.ts';
import { buildWhatsAppUrl } from '../utils/whatsapp.ts';

interface HeroProps {
  settings: SiteSettings;
  texts: SiteTexts;
  onOpenBudgetModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ settings, texts, onOpenBudgetModal }) => {
  return (
    <section id="inicio" className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24">
      {/* Subtle ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Text & Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3.5 py-1.5 rounded-md border border-amber-400/20">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{settings.companyName || 'Rocha Construção e Climatização'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight text-balance">
              {texts.heroTitle || 'Não Espere o Calor Chegar!'}
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed text-balance">
              {texts.heroSubtitle || 'Conforto, qualidade e eficiência para sua casa ou empresa.'}
            </p>

            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              {texts.heroComplement ||
                'Conheça nossos serviços de instalação, manutenção e limpeza de ar-condicionado. Solicite seu orçamento de forma rápida e prática pelo WhatsApp.'}
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <a
                href={buildWhatsAppUrl(settings)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-6 py-3.5 rounded-lg shadow-lg shadow-emerald-950/40 hover:shadow-emerald-500/25 active:scale-95 transition-all text-sm whitespace-nowrap"
              >
                <MessageSquare className="w-5 h-5 fill-current" />
                <span>{texts.heroCtaWhatsapp || 'Solicitar orçamento pelo WhatsApp'}</span>
              </a>

              <a
                href="#servicos"
                className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium px-5 py-3.5 rounded-lg border border-slate-700 active:scale-95 transition-all text-sm whitespace-nowrap"
              >
                <span>{texts.heroCtaServices || 'Conhecer nossos serviços'}</span>
                <ArrowDown className="w-4 h-4" />
              </a>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-400 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-400 text-base tabular-nums">+100%</span>
                <span>Satisfação Garantida</span>
              </div>
              <span className="text-slate-600">·</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-400 text-base">São Paulo & SP</span>
                <span>Atendimento Rápido</span>
              </div>
              <span className="text-slate-600">·</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-400 text-base">ART</span>
                <span>Emissão de Laudo Técnico</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl shadow-black/80 bg-slate-800/50">
              <img
                src={settings.heroBannerUrl || '/src/assets/images/hero_ac_split_living_1792728720151.jpg'}
                alt="Instalação de Ar-Condicionado moderna e silenciosa"
                className="w-full h-80 sm:h-96 object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

              {/* Floating feature card on image */}
              <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md p-3.5 rounded-xl border border-slate-700/80 text-xs text-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">Conforto hoje, tranquilidade sempre!</p>
                    <p className="text-slate-400">Atendimento especializado por equipe técnica credenciada</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4-column trust strip below the hero split */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 flex items-start gap-3.5 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Instalação com Qualidade</h4>
              <p className="text-xs text-slate-400 mt-0.5">Segurança, normas NBR e garantia técnica por escrito.</p>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 flex items-start gap-3.5 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Equipe Especializada</h4>
              <p className="text-xs text-slate-400 mt-0.5">Treinamento constante com a especialista técnica Yngrid.</p>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 flex items-start gap-3.5 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Serviço Rápido e Limpo</h4>
              <p className="text-xs text-slate-400 mt-0.5">Uso de capas coletoras e proteção total do seu imóvel.</p>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 flex items-start gap-3.5 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Satisfação do Início ao Fim</h4>
              <p className="text-xs text-slate-400 mt-0.5">Cálculo térmico exato e transparência de orçamento.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
