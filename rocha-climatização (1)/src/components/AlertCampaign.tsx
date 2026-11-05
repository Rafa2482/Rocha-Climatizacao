import React from 'react';
import { AlertTriangle, Clock, MessageSquare, Wind, Zap, Bug, CheckCircle2, ShieldAlert } from 'lucide-react';
import { SiteSettings } from '../types/index.ts';
import { buildServiceWhatsAppUrl } from '../utils/whatsapp.ts';

interface AlertCampaignProps {
  settings: SiteSettings;
  onOpenBudgetModal: (serviceName?: string) => void;
}

export const AlertCampaign: React.FC<AlertCampaignProps> = ({ settings, onOpenBudgetModal }) => {
  const evils = [
    {
      icon: Bug,
      title: 'Alergias e Problemas Respiratórios',
      desc: 'Ácaros, fungos e bactérias proliferam na serpentina e circulam no ar que você e sua família respiram.',
      color: 'text-rose-500 bg-rose-50 border-rose-200',
    },
    {
      icon: Wind,
      title: 'Mau Cheiro no Ambiente',
      desc: 'Odores desagradáveis causados pelo acúmulo de lodo e mofo na bandeja de condensado e dreno.',
      color: 'text-amber-500 bg-amber-50 border-amber-200',
    },
    {
      icon: Zap,
      title: 'Aumento Excessivo na Conta de Energia',
      desc: 'O aparelho sufocado precisa trabalhar em rotação máxima para refrigerar, gastando até 35% mais energia.',
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    },
    {
      icon: AlertTriangle,
      title: 'Menor Eficiência na Refrigeração',
      desc: 'O ar não atinge a temperatura desejada, demora para resfriar e gera sensação de abafamento.',
      color: 'text-sky-600 bg-sky-50 border-sky-200',
    },
    {
      icon: ShieldAlert,
      title: 'Maior Risco de Queima e Quebras',
      desc: 'A sujeira força o compressor e os capacitores, podendo ocasionar queimas de placas prematuras.',
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
  ];

  const promoWhatsappUrl = buildServiceWhatsAppUrl(
    settings,
    'Promoção de Limpeza e Higienização',
    'Gostaria de aproveitar a promoção por tempo limitado para higienizar meu ar-condicionado.'
  );

  return (
    <section className="py-12 bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 text-white relative overflow-hidden border-y border-blue-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Campaign Message */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-md">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Alerta de Saúde e Eficiência</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Ar-Condicionado Sujo Faz Mal!
            </h2>
            <p className="text-base sm:text-lg text-slate-300">
              Seu aparelho pode estar prejudicando a saúde respiratória da sua família e pesando na sua conta de luz sem você perceber.
            </p>

            {/* List of 5 Evils */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {evils.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-slate-700/80 flex items-center justify-center shrink-0 text-amber-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Promotion Card Highlight */}
          <div className="lg:col-span-5">
            <div className="bg-gradient-to-b from-blue-600/90 to-blue-800/95 border-2 border-amber-400/80 rounded-2xl p-6 sm:p-7 shadow-2xl shadow-blue-950/80 relative text-white">
              <div className="flex items-center justify-between gap-4 mb-4">
                <span className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 font-black text-xs uppercase px-3 py-1 rounded-md tracking-wider">
                  <Clock className="w-3.5 h-3.5" />
                  Promoção por Tempo Limitado
                </span>
                <span className="text-xs text-blue-200 font-medium">São Paulo & Região</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white">
                Limpeza e Higienização Completa
              </h3>
              <p className="text-xs text-blue-100 mt-1.5 leading-relaxed">
                Aplicação de bactericida autorizado pela ANVISA, limpeza da turbina, serpentina, filtros e bandeja coletora.
              </p>

              <div className="my-5 p-4 bg-slate-900/60 rounded-xl border border-blue-400/30">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-slate-300 font-medium">A partir de</span>
                  <span className="text-3xl font-extrabold text-amber-400 tabular-nums">R$ 180,00</span>
                  <span className="text-xs text-slate-400">/ aparelho</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  Atendimento residencial e comercial com capa protetora impermeável. Não suja seu ambiente!
                </p>
              </div>

              <div className="space-y-2 mb-6 text-xs text-blue-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Eliminação de 99,9% de fungos e bactérias</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Melhora de até 30% no rendimento e ventilação</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Atendimento liderado pela Técnica Yngrid</span>
                </div>
              </div>

              <a
                href={promoWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-amber-400/20 active:scale-95 transition-all text-sm whitespace-nowrap"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>Agendar Limpeza no WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
