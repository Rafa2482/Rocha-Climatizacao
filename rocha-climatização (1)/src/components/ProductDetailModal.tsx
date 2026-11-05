import React from 'react';
import { X, CheckCircle2, MessageSquare, Zap, Shield, Sparkles, Box, Info } from 'lucide-react';
import { ProductItem, SiteSettings } from '../types/index.ts';
import { getPrimaryWhatsAppNumber } from '../utils/whatsapp.ts';

interface ProductDetailModalProps {
  product: ProductItem | null;
  settings: SiteSettings;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  settings,
  onClose,
}) => {
  if (!product) return null;

  const primaryPhone = getPrimaryWhatsAppNumber(settings);
  const formattedPrice = Number(product.price).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const formattedOldPrice = product.oldPrice
    ? Number(product.oldPrice).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
    : null;

  const defaultMsg = product.whatsappCustomMsg || `Olá! Tenho interesse no aparelho: ${product.name} (${formattedPrice}). Poderiam me passar a disponibilidade e opções de instalação com a Rocha Climatização?`;
  const whatsappUrl = `https://wa.me/${primaryPhone}?text=${encodeURIComponent(defaultMsg)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-blue-900/50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Ficha Técnica do Produto
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image & Badges */}
            <div className="flex flex-col space-y-3">
              <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={product.imageUrl || '/src/assets/images/ac_split_inverter_1792776578343.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      '/src/assets/images/ac_split_inverter_1792776578343.jpg';
                  }}
                />
                {product.badge && (
                  <span className="absolute top-3 left-3 bg-amber-500 text-slate-950 text-xs font-black px-3 py-1 rounded-md shadow-md">
                    {product.badge}
                  </span>
                )}
                {product.inStock && (
                  <span className="absolute bottom-3 left-3 bg-emerald-600/90 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow backdrop-blur-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                    Em Estoque • Pronta Entrega
                  </span>
                )}
              </div>

              {/* Quick specs pills */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {product.btus && (
                  <div className="bg-slate-100 p-2 rounded-lg border border-slate-200">
                    <span className="block text-slate-500 text-[10px] uppercase font-semibold">Capacidade</span>
                    <span className="font-bold text-slate-900">{product.btus}</span>
                  </div>
                )}
                {product.voltage && (
                  <div className="bg-slate-100 p-2 rounded-lg border border-slate-200">
                    <span className="block text-slate-500 text-[10px] uppercase font-semibold">Voltagem</span>
                    <span className="font-bold text-slate-900">{product.voltage}</span>
                  </div>
                )}
                {product.cycle && (
                  <div className="bg-slate-100 p-2 rounded-lg border border-slate-200">
                    <span className="block text-slate-500 text-[10px] uppercase font-semibold">Ciclo</span>
                    <span className="font-bold text-slate-900">{product.cycle}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Product Info & Pricing */}
            <div className="flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {product.category}
                  </span>
                  {product.brand && (
                    <span className="text-xs text-slate-500 font-medium">
                      Marca: <strong className="text-slate-800">{product.brand}</strong>
                    </span>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {product.name}
                </h3>

                {product.description && (
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Price Block */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="text-xs font-medium text-slate-500">Valor do Equipamento:</span>
                <div className="flex items-baseline gap-2">
                  {formattedOldPrice && (
                    <span className="text-sm text-slate-400 line-through">
                      {formattedOldPrice}
                    </span>
                  )}
                  <span className="text-2xl sm:text-3xl font-black text-blue-900">
                    {formattedPrice}
                  </span>
                </div>
                {product.priceObservation ? (
                  <p className="text-xs text-emerald-700 font-semibold">
                    {product.priceObservation}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">
                    Consulte condições em até 10x ou desconto no PIX
                  </p>
                )}
              </div>

              {/* Rocha Guarantee info */}
              <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-100 flex items-start gap-2.5 text-xs text-blue-950">
                <Shield className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Instalação Rocha Climatização:</strong> Atendimento com equipe técnica certificada (Técnica Yngrid), tubulação em cobre e garantia por escrito.
                </span>
              </div>
            </div>
          </div>

          {/* Specifications list */}
          {product.specifications && product.specifications.length > 0 && (
            <div className="border-t border-slate-200 pt-5">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Especificações Técnicas e Diferenciais
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {product.specifications.map((spec, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            Dúvidas sobre cálculo de BTUs ou instalação? Fale agora pelo WhatsApp.
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Fechar
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 fill-slate-950" />
              <span>Comprar / Consultar no WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
