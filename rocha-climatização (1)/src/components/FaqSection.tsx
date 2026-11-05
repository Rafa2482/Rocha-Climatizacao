import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageSquare } from 'lucide-react';
import { SiteSettings } from '../types/index.ts';
import { buildWhatsAppUrl } from '../utils/whatsapp.ts';

interface FaqSectionProps {
  settings: SiteSettings;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ settings }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Qual a capacidade (BTUs) ideal para o meu quarto ou sala?',
      a: 'A capacidade depende da área em metros quadrados, da quantidade de pessoas no ambiente e da incidência solar (sol da manhã ou da tarde). Como regra geral, quartos pequenos até 12m² costumam utilizar 9.000 BTUs, cômodos médios de 15m² a 20m² utilizam 12.000 BTUs, e salas amplas exigem 18.000 ou 24.000 BTUs. Nós fazemos o cálculo térmico exato para você sem custo pelo WhatsApp!',
    },
    {
      q: 'Com que frequência devo fazer a higienização do ar-condicionado?',
      a: 'Para residências, recomendamos a limpeza dos filtros a cada 15 a 30 dias e a higienização química profunda com bactericida hospitalar pelo menos uma vez a cada 6 a 12 meses. Em empresas, consultórios ou locais com alta circulação, a higienização completa deve ser trimestral conforme normas da ANVISA.',
    },
    {
      q: 'A Rocha Climatização emite ART para condomínios?',
      a: 'Sim! Emitimos a Anotação de Responsabilidade Técnica (ART) e laudo técnico para liberação de reformas em condomínios residenciais e edifícios comerciais, cumprindo integralmente as exigências da norma ABNT NBR 16280.',
    },
    {
      q: 'O que está incluso na instalação padrão de ar-condicionado?',
      a: 'A instalação padrão inclui a fixação e nivelamento da evaporadora interna e da condensadora externa em suportes apropriados, furo técnico na parede, vácuo mecânico no sistema frigorígeno com bomba de vácuo, testes elétricos e teste de rendimento térmico. A tubulação de cobre e o ponto elétrico podem ser incluídos de acordo com o pacote contratado.',
    },
    {
      q: 'Qual é o prazo de garantia dos serviços prestados?',
      a: 'Oferecemos garantia técnica de instalação por escrito de 90 dias a 1 ano (conforme o tipo de serviço e equipamento), além de preservar a garantia de fábrica do fabricante do seu aparelho ar-condicionado ao seguir rigorosamente os manuais técnicos.',
    },
    {
      q: 'Quais formas de pagamento são aceitas?',
      a: 'Aceitamos Pix (com confirmação instantânea), dinheiro, transferência e cartões de crédito com possibilidade de parcelamento facilitado.',
    },
  ];

  return (
    <section className="py-20 bg-slate-50 text-slate-900 border-t border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-700 bg-blue-100 px-3 py-1 rounded-md">
            Tire Suas Dúvidas
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
            Perguntas Frequentes
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Entenda como funciona o nosso atendimento, prazos e padrões de qualidade.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-sm transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-semibold text-slate-900 text-sm sm:text-base hover:text-blue-900 focus:outline-none"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-blue-900' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <p className="text-xs text-slate-500 mb-3">Tem outra pergunta ou precisa de um esclarecimento técnico?</p>
          <a
            href={buildWhatsAppUrl(settings, 'Olá! Tenho uma dúvida sobre ar-condicionado e gostaria de conversar.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-800 hover:text-blue-900 underline"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>Falar com nosso especialista agora pelo WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
};
