import React, { useState } from 'react';
import { Maximize2, MessageSquare, X, Calendar, MapPin } from 'lucide-react';
import { GalleryItem, SiteSettings, SiteTexts } from '../types/index.ts';
import { buildServiceWhatsAppUrl } from '../utils/whatsapp.ts';

interface GallerySectionProps {
  gallery: GalleryItem[];
  settings: SiteSettings;
  texts: SiteTexts;
}

export const GallerySection: React.FC<GallerySectionProps> = ({
  gallery,
  settings,
  texts,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  const categories = ['all', ...Array.from(new Set(gallery.map((g) => g.serviceType)))];

  const filteredItems =
    selectedCategory === 'all'
      ? gallery
      : gallery.filter((g) => g.serviceType === selectedCategory);

  return (
    <section id="galeria" className="py-20 bg-slate-900 text-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-md border border-amber-400/20">
            Portfólio de Obras & Manutenções
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 tracking-tight text-balance">
            {texts.galleryTitle || 'Galeria de Trabalhos Executados'}
          </h2>
          <p className="text-base text-slate-400 mt-3 text-balance">
            {texts.gallerySubtitle ||
              'Confira registros reais de instalações, higienizações e projetos de climatização entregues com excelência.'}
          </p>

          {/* Category Filter */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-slate-800 rounded-xl max-w-xl mx-auto border border-slate-700/60">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                {cat === 'all' ? 'Todas as Fotos' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const whatsappUrl = buildServiceWhatsAppUrl(
              settings,
              item.title,
              `Vi a foto do trabalho "${item.title}" na galeria do site e gostaria de um orçamento para um serviço semelhante.`
            );

            return (
              <div
                key={item.id}
                className="group bg-slate-800/80 rounded-2xl border border-slate-700/70 overflow-hidden flex flex-col hover:border-amber-400/50 transition-all duration-200"
              >
                {/* Image Container with click to enlarge */}
                <div
                  onClick={() => setLightboxItem(item)}
                  className="relative h-64 w-full bg-slate-950 cursor-pointer overflow-hidden"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="bg-slate-900/90 text-white text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-slate-700">
                      <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                      Visualizar maior
                    </span>
                  </div>
                  <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md text-amber-300 text-[11px] font-semibold px-2.5 py-1 rounded-md">
                    {item.serviceType}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base leading-snug group-hover:text-amber-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                      {item.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-400" />
                          <span>{item.location}</span>
                        </span>
                      )}
                      {item.date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{item.date}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-emerald-600 hover:text-white text-slate-200 text-xs font-semibold py-2 px-3 rounded-xl transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5 fill-current" />
                      <span>Pedir serviço semelhante</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxItem && (
        <div
          onClick={() => setLightboxItem(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-4 flex items-center justify-center animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 relative shadow-2xl"
          >
            <button
              onClick={() => setLightboxItem(null)}
              className="absolute top-4 right-4 z-10 bg-slate-900/80 hover:bg-slate-800 text-white p-2 rounded-full border border-slate-700 focus:outline-none"
              aria-label="Fechar visualização"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-h-[75vh] bg-black flex items-center justify-center">
              <img
                src={lightboxItem.imageUrl}
                alt={lightboxItem.title}
                className="max-h-[75vh] w-auto max-w-full object-contain"
              />
            </div>

            <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-semibold text-amber-400">
                  {lightboxItem.serviceType}
                </span>
                <h3 className="text-lg font-bold mt-0.5">{lightboxItem.title}</h3>
                <p className="text-xs text-slate-300 mt-1">{lightboxItem.description}</p>
              </div>

              <a
                href={buildServiceWhatsAppUrl(
                  settings,
                  lightboxItem.title,
                  `Gostaria de um orçamento para um serviço semelhante ao mostrado na foto "${lightboxItem.title}".`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl whitespace-nowrap shrink-0 active:scale-95 transition-all"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>Solicitar no WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
