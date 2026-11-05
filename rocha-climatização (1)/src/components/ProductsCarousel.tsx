import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  Pause,
  Play,
  ArrowRight,
  Info,
} from 'lucide-react';
import { ProductItem, SiteSettings } from '../types/index.ts';
import { getPrimaryWhatsAppNumber } from '../utils/whatsapp.ts';

interface ProductsCarouselProps {
  products: ProductItem[];
  settings: SiteSettings;
  onOpenProductDetail: (product: ProductItem) => void;
  onOpenBudgetModal?: (serviceName?: string) => void;
}

export const ProductsCarousel: React.FC<ProductsCarouselProps> = ({
  products,
  settings,
  onOpenProductDetail,
  onOpenBudgetModal,
}) => {
  const visibleProducts = products.filter((p) => p.visible);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(3);
  const touchStartX = useRef<number | null>(null);

  // Responsive itemsPerView
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };
    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  const maxIndex = Math.max(0, visibleProducts.length - itemsPerView);

  // Auto-play interval
  useEffect(() => {
    if (isPaused || visibleProducts.length <= itemsPerView) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused, maxIndex, visibleProducts.length, itemsPerView]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  if (visibleProducts.length === 0) return null;

  const primaryPhone = getPrimaryWhatsAppNumber(settings);

  return (
    <section
      id="produtos"
      className="py-14 sm:py-16 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white relative overflow-hidden border-y border-blue-900/40"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Decorative ambient lights */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-md mb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Aparelhos & Produtos a Pronta Entrega</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Ar-Condicionado & Equipamentos
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Equipamentos novos com tecnologia Inverter, alta economia de energia e opção de instalação completa com garantia técnica da Rocha Climatização.
            </p>
          </div>

          {/* Carousel controls */}
          <div className="flex items-center gap-2 self-start md:self-end">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors cursor-pointer"
              title={isPaused ? 'Retomar carrossel' : 'Pausar carrossel'}
              aria-label={isPaused ? 'Retomar' : 'Pausar'}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <button
              onClick={handlePrev}
              className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors cursor-pointer"
              title="Produto anterior"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors shadow-md cursor-pointer"
              title="Próximo produto"
              aria-label="Próximo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel Viewport */}
        <div
          className="overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            }}
          >
            {visibleProducts.map((product) => {
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

              const customMsg =
                product.whatsappCustomMsg ||
                `Olá! Tenho interesse no ${product.name} anunciado no site (${formattedPrice}). Poderiam me informar a disponibilidade e opções de instalação?`;

              const whatsappUrl = `https://wa.me/${primaryPhone}?text=${encodeURIComponent(customMsg)}`;

              return (
                <div
                  key={product.id}
                  className="px-2.5 shrink-0"
                  style={{ width: `${100 / itemsPerView}%` }}
                >
                  <div className="h-full bg-slate-900/95 rounded-2xl overflow-hidden border border-slate-800 hover:border-amber-400/50 transition-all duration-300 shadow-xl flex flex-col justify-between group">
                    {/* Top image & badges */}
                    <div>
                      <div className="relative aspect-4/3 bg-slate-950 overflow-hidden">
                        <img
                          src={product.imageUrl || '/src/assets/images/ac_split_inverter_1792776578343.jpg'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              '/src/assets/images/ac_split_inverter_1792776578343.jpg';
                          }}
                        />
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                        {/* Promotional badge */}
                        {product.badge && (
                          <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded shadow-md">
                            {product.badge}
                          </div>
                        )}

                        {/* Stock indicator */}
                        {product.inStock && (
                          <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-xs border border-emerald-500/40 text-emerald-400 text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1.5 shadow">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Em Estoque</span>
                          </div>
                        )}

                        {/* Category & Brand pill */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300">
                          <span className="bg-blue-900/80 text-blue-200 border border-blue-700/50 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                            {product.category}
                          </span>
                          {product.brand && (
                            <span className="text-[11px] font-medium text-slate-300 bg-slate-950/70 px-2 py-0.5 rounded">
                              {product.brand}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 space-y-4">
                        {/* Title */}
                        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                          {product.name}
                        </h3>

                        {/* Quick spec pills */}
                        <div className="flex flex-wrap gap-1.5 text-[11px]">
                          {product.btus && (
                            <span className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded border border-slate-700 font-semibold">
                              {product.btus}
                            </span>
                          )}
                          {product.voltage && (
                            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                              {product.voltage}
                            </span>
                          )}
                          {product.cycle && (
                            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                              {product.cycle}
                            </span>
                          )}
                        </div>

                        {/* Specifications preview */}
                        {product.specifications && product.specifications.length > 0 && (
                          <ul className="space-y-1.5 text-xs text-slate-300">
                            {product.specifications.slice(0, 3).map((spec, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                <span className="line-clamp-1">{spec}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    {/* Bottom Price & Action Buttons */}
                    <div className="p-5 pt-0 space-y-3">
                      {/* Price container */}
                      <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                        <div className="flex items-baseline gap-2">
                          {formattedOldPrice && (
                            <span className="text-xs text-slate-400 line-through">
                              {formattedOldPrice}
                            </span>
                          )}
                          <span className="text-xl sm:text-2xl font-black text-amber-400">
                            {formattedPrice}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                          {product.priceObservation || 'Em até 10x sem juros no cartão'}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => onOpenProductDetail(product)}
                          className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Info className="w-3.5 h-3.5 text-blue-400" />
                          <span>Especificações</span>
                        </button>
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 rounded-lg text-xs font-black shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 fill-slate-950" />
                          <span>Pedir no Zap</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel pagination dots */}
        {maxIndex > 0 && (
          <div className="flex justify-center items-center gap-1.5 mt-6">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  currentIndex === idx
                    ? 'w-6 h-2 bg-amber-400'
                    : 'w-2 h-2 bg-slate-700 hover:bg-slate-500'
                }`}
                aria-label={`Ir para slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Bottom Banner: Custom orders or questions */}
        <div className="mt-10 bg-slate-900/80 border border-blue-900/40 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Procurando outro modelo, marca ou capacidade específica?
              </h4>
              <p className="text-xs text-slate-400">
                Trabalhamos sob encomenda com as melhores marcas (LG, Daikin, Midea, Gree, Elgin, Samsung e Carrier) e dimensionamos a carga térmica exata para o seu ambiente.
              </p>
            </div>
          </div>
          <a
            href={`https://wa.me/${primaryPhone}?text=${encodeURIComponent('Olá! Gostaria de consultar a cotação de um modelo específico de ar-condicionado com a Rocha Climatização.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 shadow-md transition-colors cursor-pointer"
          >
            <span>Consultar Outros Modelos</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};
