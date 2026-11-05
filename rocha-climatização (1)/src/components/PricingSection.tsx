import React from 'react';
import { Check, X, MessageSquare, Info, ShieldCheck } from 'lucide-react';
import { PriceItem, SiteSettings, SiteTexts } from '../types/index.ts';
import { buildServiceWhatsAppUrl } from '../utils/whatsapp.ts';

interface PricingSectionProps {
  prices: PriceItem[];
  settings: SiteSettings;
  texts: SiteTexts;
  onOpenBudgetModal: (serviceName?: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  prices,
  settings,
  texts,
  onOpenBudgetModal,
}) => {
  const formatPrice = (item: PriceItem) => {
    switch (item.priceType) {
      case 'fixo':
        return item.priceValue ? `R$ ${item.priceValue.toFixed(2).replace('.', ',')}` : 'Sob consulta';
      case 'a_partir':
        return item.priceValue ? `A partir de R$ ${item.priceValue.toFixed(2).replace('.', ',')}` : 'Sob consulta';
      case 'faixa':
        return item.priceValue && item.priceMax
          ? `R$ ${item.priceValue} a R$ ${item.priceMax}`
          : 'Sob consulta';
      case 'sob_consulta':
      default:
        return 'Sob Avaliação';
    }
  };

  return (
    <section id="precos" className="py-20 bg-white text-slate-900 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-100 px-3 py-1 rounded-md">
            Valores Transparentes & Honestidade
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight text-balance">
            {texts.pricesTitle || 'Tabela de Serviços & Orçamentos'}
          </h2>
          <p className="text-base text-slate-600 mt-3 text-balance">
            {texts.pricesSubtitle ||
              'Valores demonstrativos de referência. Todos os serviços incluem garantia técnica de instalação e materiais de qualidade.'}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 text-xs text-slate-500 bg-slate-100 px-3.5 py-1.5 rounded-full">
            <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Valores finais podem variar conforme metragem de tubulação, marca e local.</span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {prices.map((item) => {
            const whatsappUrl = buildServiceWhatsAppUrl(
              settings,
              item.serviceName,
              `Gostaria de confirmar o orçamento para ${item.serviceName} (${formatPrice(item)}).`
            );

            return (
              <div
                key={item.id}
                className={`rounded-2xl border flex flex-col transition-all duration-200 relative ${
                  item.popular
                    ? 'border-blue-700 shadow-lg shadow-blue-900/10 bg-slate-50/50 ring-2 ring-blue-700'
                    : 'border-slate-200 shadow-sm hover:shadow-md bg-white'
                }`}
              >
                {/* Popular highlight ribbon */}
                {item.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-900 text-amber-300 text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm">
                    Mais Solicitado
                  </div>
                )}

                <div className="p-6 sm:p-7 flex-1 flex flex-col">
                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-slate-900">{item.serviceName}</h3>
                  <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{item.description}</p>

                  {/* Price Tag */}
                  <div className="my-5 pb-5 border-b border-slate-200/80">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                        {formatPrice(item)}
                      </span>
                      {item.unit && (
                        <span className="text-xs text-slate-500 font-medium">/ {item.unit}</span>
                      )}
                    </div>
                    {item.observation && (
                      <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                        {item.observation}
                      </p>
                    )}
                  </div>

                  {/* Included features */}
                  <div className="space-y-2.5 text-xs text-slate-700 flex-1">
                    <p className="font-semibold text-slate-900 text-[11px] uppercase tracking-wider">
                      O que está incluso:
                    </p>
                    {item.includedItems.map((inc, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </div>
                    ))}

                    {item.notIncludedItems && item.notIncludedItems.length > 0 && (
                      <div className="pt-2 text-slate-400">
                        {item.notIncludedItems.map((notInc, i) => (
                          <div key={i} className="flex items-start gap-2 text-[11px]">
                            <X className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span>{notInc}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CTA button */}
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-xl text-xs active:scale-95 transition-all ${
                        item.popular
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-950/20'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4 fill-current" />
                      <span>Solicitar Orçamento deste Serviço</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Evaluation Banner */}
        <div className="mt-12 bg-blue-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-800 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-lg font-bold">Precisa de avaliação no local ou condomínio?</h4>
              <p className="text-xs sm:text-sm text-blue-200 mt-0.5">
                Valor sujeito à avaliação de metragem, tubulação ou emissão de laudo técnico. Envie fotos do ambiente pelo WhatsApp e receba uma estimativa imediata!
              </p>
            </div>
          </div>
          <a
            href={buildServiceWhatsAppUrl(settings, 'Avaliação no Local', 'Gostaria de solicitar uma visita técnica ou avaliação personalizada.')}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs sm:text-sm whitespace-nowrap active:scale-95 transition-all shrink-0"
          >
            Falar com a Especialista
          </a>
        </div>
      </div>
    </section>
  );
};
