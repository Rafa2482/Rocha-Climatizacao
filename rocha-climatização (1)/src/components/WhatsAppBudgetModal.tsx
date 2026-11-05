import React, { useState } from 'react';
import { X, MessageSquare, Check, Sparkles } from 'lucide-react';
import { ServiceItem, SiteSettings } from '../types/index.ts';
import { getPrimaryWhatsAppNumber } from '../utils/whatsapp.ts';

interface WhatsAppBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: ServiceItem[];
  settings: SiteSettings;
  preselectedService?: string;
}

export const WhatsAppBudgetModal: React.FC<WhatsAppBudgetModalProps> = ({
  isOpen,
  onClose,
  services,
  settings,
  preselectedService,
}) => {
  const [selectedService, setSelectedService] = useState(
    preselectedService || services[0]?.title || 'Instalação de Ar-Condicionado'
  );
  const [capacity, setCapacity] = useState('9.000 a 12.000 BTUs');
  const [propertyType, setPropertyType] = useState('Apartamento');
  const [neighborhood, setNeighborhood] = useState('');
  const [hasInfra, setHasInfra] = useState<'sim' | 'nao' | 'nao_sei'>('nao_sei');

  if (!isOpen) return null;

  const handleGenerate = () => {
    const cleanNumber = getPrimaryWhatsAppNumber(settings);

    const text = `Olá! Acessei o site da ${settings.companyName || 'Rocha Climatização'} e gostaria de solicitar um orçamento:\n\n` +
      `📌 *Serviço:* ${selectedService}\n` +
      `❄️ *Capacidade aproximada:* ${capacity}\n` +
      `🏢 *Tipo de Imóvel:* ${propertyType}\n` +
      `📍 *Bairro/Região:* ${neighborhood || 'São Paulo'}\n` +
      `🔧 *Já possui tubulação/infraestrutura passada:* ${hasInfra === 'sim' ? 'Sim' : hasInfra === 'nao' ? 'Não' : 'Não sei / Preciso avaliar'}\n\n` +
      `Poderia me enviar os valores e datas disponíveis para atendimento? Obrigado!`;

    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md w-fit mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Orçamento Express</span>
        </div>

        <h3 className="text-xl font-bold text-slate-900">Monte seu Orçamento no WhatsApp</h3>
        <p className="text-xs text-slate-500 mt-1 mb-5">
          Escolha os detalhes e abriremos uma mensagem personalizada prontinha para você enviar.
        </p>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Qual serviço você precisa?</label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600 bg-slate-50"
            >
              {services.map((s) => (
                <option key={s.id} value={s.title}>
                  {s.title}
                </option>
              ))}
              <option value="Reforma ou Elétrica Geral">Reforma / Elétrica Geral</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Capacidade / Tamanho</label>
              <select
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 bg-slate-50"
              >
                <option value="9.000 BTUs (quarto pequeno)">9.000 BTUs</option>
                <option value="12.000 BTUs (quarto ou sala média)">12.000 BTUs</option>
                <option value="18.000 BTUs (sala grande)">18.000 BTUs</option>
                <option value="24.000 BTUs ou mais">24.000 BTUs ou mais</option>
                <option value="Multi-Split (vários aparelhos)">Multi-Split (vários)</option>
                <option value="Não sei / Preciso de orientação">Não sei / Preciso de orientação</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tipo de Imóvel</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 bg-slate-50"
              >
                <option value="Apartamento">Apartamento</option>
                <option value="Casa / Sobrado">Casa / Sobrado</option>
                <option value="Comércio / Escritório">Comércio / Escritório</option>
                <option value="Galpão / Indústria">Galpão / Indústria</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Bairro e Cidade</label>
            <input
              type="text"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder="Ex: Tatuapé, São Paulo"
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 bg-slate-50"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Já possui infraestrutura / tubulação pronta no local?
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setHasInfra('sim')}
                className={`py-2 px-3 rounded-lg border text-xs font-medium text-center transition-all ${
                  hasInfra === 'sim'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Sim
              </button>
              <button
                type="button"
                onClick={() => setHasInfra('nao')}
                className={`py-2 px-3 rounded-lg border text-xs font-medium text-center transition-all ${
                  hasInfra === 'nao'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Não
              </button>
              <button
                type="button"
                onClick={() => setHasInfra('nao_sei')}
                className={`py-2 px-3 rounded-lg border text-xs font-medium text-center transition-all ${
                  hasInfra === 'nao_sei'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Não sei
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs active:scale-95 transition-all shadow-md shadow-emerald-950/20"
          >
            <MessageSquare className="w-4 h-4 fill-current" />
            <span>Abrir WhatsApp com Detalhes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
