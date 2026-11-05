import React, { useState } from 'react';
import { MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ServiceItem, SiteSettings, SiteTexts } from '../types/index.ts';
import { buildServiceWhatsAppUrl } from '../utils/whatsapp.ts';

interface ServicesSectionProps {
  services: ServiceItem[];
  settings: SiteSettings;
  texts: SiteTexts;
  onSelectService: (service: ServiceItem) => void;
  onOpenBudgetModal: (serviceName?: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  settings,
  texts,
  onSelectService,
  onOpenBudgetModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(services.map((s) => s.category)))];

  const filteredServices =
    selectedCategory === 'all'
      ? services
      : services.filter((s) => s.category === selectedCategory);

  const formatPriceDisplay = (service: ServiceItem) => {
    switch (service.priceType) {
      case 'fixo':
        return service.priceValue ? `R$ ${service.priceValue.toFixed(2).replace('.', ',')}` : 'Preço sob consulta';
      case 'a_partir':
        return service.priceValue ? `A partir de R$ ${service.priceValue.toFixed(2).replace('.', ',')}` : 'Preço sob consulta';
      case 'faixa':
        return service.priceValue && service.priceMax
          ? `R$ ${service.priceValue} a R$ ${service.priceMax}`
          : 'Sob consulta';
      case 'sob_consulta':
      default:
        return 'Valor sob avaliação';
    }
  };

  return (
    <section id="servicos" className="py-20 bg-slate-50 text-slate-900 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-700 bg-blue-100 px-3 py-1 rounded-md">
            Excelência & Conformidade Técnica
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight text-balance">
            {texts.servicesTitle || 'Nossos Serviços Especializados'}
          </h2>
          <p className="text-base text-slate-600 mt-3 text-balance">
            {texts.servicesSubtitle ||
              'Soluções completas em climatização residencial e comercial, infraestrutura de tubulação e conformidade elétrica.'}
          </p>

          {/* Category Filter Tabs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-slate-200/80 rounded-xl max-w-xl mx-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
                }`}
              >
                {cat === 'all' ? 'Todos os Serviços' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service) => {
            const whatsappUrl = buildServiceWhatsAppUrl(
              settings,
              service.title,
              service.whatsappCustomMsg
            );

            return (
              <div
                key={service.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group"
              >
                {/* Service Image */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                  <img
                    src={service.imageUrl}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-amber-300 text-[11px] font-semibold px-2.5 py-1 rounded-md">
                    {service.category}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-sm text-slate-600 mt-2 leading-relaxed flex-1">
                    {service.shortDescription}
                  </p>

                  {/* Included features highlights */}
                  {service.includedFeatures && service.includedFeatures.length > 0 && (
                    <div className="my-4 pt-4 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                      {service.includedFeatures.slice(0, 3).map((feat, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Price display badge */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase font-medium">Investimento</span>
                      <span className="text-sm font-bold text-blue-900 tabular-nums">
                        {formatPriceDisplay(service)}
                      </span>
                    </div>
                    <button
                      onClick={() => onSelectService(service)}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 p-1 hover:underline focus:outline-none"
                    >
                      <span>Ver detalhes</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* WhatsApp Action Button */}
                  <div className="mt-5 pt-3">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs active:scale-95 transition-all shadow-sm shadow-emerald-950/20"
                    >
                      <MessageSquare className="w-4 h-4 fill-current" />
                      <span>Pedir Orçamento no WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
