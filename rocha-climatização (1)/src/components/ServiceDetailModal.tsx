import React, { useState } from 'react';
import { X, CheckCircle2, MessageSquare, Calculator, AlertCircle } from 'lucide-react';
import { ServiceItem, SiteSettings } from '../types/index.ts';
import { buildServiceWhatsAppUrl } from '../utils/whatsapp.ts';

interface ServiceDetailModalProps {
  service: ServiceItem | null;
  settings: SiteSettings;
  onClose: () => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  settings,
  onClose,
}) => {
  const [areaM2, setAreaM2] = useState<number>(15);
  const [peopleCount, setPeopleCount] = useState<number>(2);
  const [sunExposure, setSunExposure] = useState<'morning' | 'afternoon'>('afternoon');

  if (!service) return null;

  // Simple BTU estimation formula: 600 BTUs/m² (or 800 if heavy afternoon sun) + 600 per additional person
  const btuBase = sunExposure === 'afternoon' ? 800 : 600;
  const estimatedBTUs = Math.max(9000, Math.round((areaM2 * btuBase + (peopleCount - 1) * 600) / 1000) * 1000);

  const customWhatsAppUrl = buildServiceWhatsAppUrl(
    settings,
    service.title,
    `Estou interessado(a) e fiz uma simulação estimada de ~${estimatedBTUs.toLocaleString('pt-BR')} BTUs para meu ambiente.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 relative flex flex-col">
        {/* Header with image */}
        <div className="relative h-64 sm:h-72 w-full bg-slate-900 overflow-hidden shrink-0">
          <img
            src={service.imageUrl}
            alt={service.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-white transition-all"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 text-white">
            <span className="text-xs uppercase tracking-wider font-semibold text-amber-400 bg-amber-400/20 px-2.5 py-1 rounded-md border border-amber-400/30">
              {service.category}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-2 leading-tight">
              {service.title}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 flex-1">
          {/* Detailed description */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">
              Descrição do Serviço
            </h4>
            <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
              {service.fullDescription || service.shortDescription}
            </p>
          </div>

          {/* Included Features */}
          {service.includedFeatures && service.includedFeatures.length > 0 && (
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
                O que está incluso
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-700">
                {service.includedFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing Info & Observations */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-xs font-semibold text-slate-500 uppercase">Investimento</span>
              <span className="text-lg font-bold text-blue-900 tabular-nums">
                {service.priceType === 'fixo' && service.priceValue
                  ? `R$ ${service.priceValue.toFixed(2).replace('.', ',')}`
                  : service.priceType === 'a_partir' && service.priceValue
                  ? `A partir de R$ ${service.priceValue.toFixed(2).replace('.', ',')}`
                  : 'Valor sob avaliação técnica'}
              </span>
            </div>
            {service.priceObservation && (
              <p className="text-xs text-slate-500 mt-2 flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>{service.priceObservation}</span>
              </p>
            )}
          </div>

          {/* Interactive BTU Calculator for Air Conditioning */}
          {(service.category.includes('Climatização') || service.title.toLowerCase().includes('ar-condicionado')) && (
            <div className="bg-blue-50/70 p-5 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-sm mb-3">
                <Calculator className="w-4 h-4 text-blue-600" />
                <span>Simulador de Capacidade (BTUs)</span>
              </div>
              <p className="text-xs text-slate-600 mb-4">
                Estime a potência ideal de ar-condicionado para o seu ambiente antes de solicitar o orçamento:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Área do cômodo (m²)</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={areaM2}
                    onChange={(e) => setAreaM2(Number(e.target.value) || 1)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Nº de pessoas</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={peopleCount}
                    onChange={(e) => setPeopleCount(Number(e.target.value) || 1)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Sol direto</label>
                  <select
                    value={sunExposure}
                    onChange={(e) => setSunExposure(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900"
                  >
                    <option value="morning">Sol da manhã (leve)</option>
                    <option value="afternoon">Sol da tarde (forte)</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-blue-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-700">Capacidade recomendada:</span>
                <span className="text-base font-extrabold text-blue-900 tabular-nums">
                  ~{estimatedBTUs.toLocaleString('pt-BR')} BTUs
                </span>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <a
              href={customWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:flex-1 flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-emerald-950/20 active:scale-95 transition-all text-sm whitespace-nowrap"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>Solicitar Orçamento deste Serviço no WhatsApp</span>
            </a>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3.5 border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold rounded-xl text-sm transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
