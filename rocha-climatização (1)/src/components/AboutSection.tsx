import React from 'react';
import { Award, Shield, CheckCircle, Clock, MapPin, UserCheck, Wrench } from 'lucide-react';
import { SiteSettings, SiteTexts } from '../types/index.ts';

interface AboutSectionProps {
  settings: SiteSettings;
  texts: SiteTexts;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ settings, texts }) => {
  return (
    <section id="sobre" className="py-20 bg-slate-100 text-slate-900 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Image & Specialist Badge */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-white">
              <img
                src="/assets/aistudio/WhatsApp_Image_2026-08-18_at_14.10.07_b53ce399.jpeg"
                alt="Rocha Climatização equipe e padrão técnico"
                className="w-full h-auto object-cover max-h-[500px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

              {/* Technician Specialist Card */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 text-slate-900 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-blue-900 text-amber-400 flex items-center justify-center font-bold text-lg shrink-0 border-2 border-amber-400">
                    <UserCheck className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">
                      {settings.specialistName || 'Yngrid'}
                    </h4>
                    <p className="text-xs text-blue-900 font-semibold">
                      {settings.specialistRole || 'Técnica Especialista em Climatização'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Supervisão técnica, cálculo de carga térmica e conformidade
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Story & Mission */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-3 py-1 rounded-md">
              <Shield className="w-3.5 h-3.5 text-blue-700" />
              <span>Compromisso e Qualidade Técnica</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {texts.aboutTitle || 'Sobre a Rocha Climatização'}
            </h2>

            <p className="text-base text-slate-700 leading-relaxed">
              {texts.aboutStory ||
                'A Rocha Construção e Climatização é especializada em soluções completas de conforto térmico, instalações e manutenções de ar-condicionado. Trabalhamos com foco absoluto em qualidade, limpeza durante a execução e total segurança para o seu imóvel.'}
            </p>

            <p className="text-sm text-slate-600 leading-relaxed">
              {texts.aboutMission ||
                'Utilizamos instrumentos digitais de precisão, bombas de vácuo de duplo estágio e fluidos refrigerantes ecológicos. Nossos procedimentos de higienização utilizam produtos antibactericidas autorizados pela ANVISA, garantindo ar puro e saudável para sua família ou equipe de trabalho.'}
            </p>

            {/* Differentials Checklist */}
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Por que escolher a Rocha Climatização:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(texts.aboutDifferentials || []).map((diff, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{diff}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Area & Hours */}
            <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Região de Atendimento</span>
                  <span>{settings.serviceArea || 'São Paulo e Região Metropolitana'}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Horário de Funcionamento</span>
                  <span>{settings.businessHours || 'Segunda a Sábado das 08h às 19h'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
