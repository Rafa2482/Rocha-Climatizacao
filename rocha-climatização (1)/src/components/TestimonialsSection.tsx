import React from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { TestimonialItem, SiteSettings } from '../types/index.ts';
import { buildWhatsAppUrl } from '../utils/whatsapp.ts';

interface TestimonialsSectionProps {
  testimonials: TestimonialItem[];
  settings: SiteSettings;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  testimonials,
  settings,
}) => {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="py-20 bg-white text-slate-900 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1 rounded-md">
            Avaliações de Clientes Satisfeitos
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight text-balance">
            O Que Dizem Quem Já Contratou
          </h2>
          <p className="text-base text-slate-600 mt-3 text-balance">
            Depoimentos reais de clientes que confiaram no trabalho e no atendimento da Rocha Climatização.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test) => (
            <div
              key={test.id}
              className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                {/* Star rating */}
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < test.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-sm text-slate-700 leading-relaxed italic">
                  "{test.comment}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-900">{test.name}</h4>
                  <p className="text-slate-500">{test.neighborhood || 'São Paulo, SP'}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-semibold text-blue-900 bg-blue-100/70 px-2 py-0.5 rounded">
                    {test.serviceRendered}
                  </span>
                  {test.date && (
                    <p className="text-[10px] text-slate-400 mt-0.5">{test.date}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* WhatsApp trust CTA */}
        <div className="mt-12 text-center">
          <a
            href={buildWhatsAppUrl(settings, 'Olá! Vi os depoimentos no site e gostaria de agendar um atendimento.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200 px-5 py-2.5 rounded-xl hover:bg-emerald-100 transition-colors"
          >
            <MessageSquare className="w-4 h-4 fill-current" />
            <span>Seja também um cliente satisfeito — Peça seu orçamento</span>
          </a>
        </div>
      </div>
    </section>
  );
};
