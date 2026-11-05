import React, { useState } from 'react';
import { Phone, MessageSquare, Mail, MapPin, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { SiteSettings, SiteTexts, ServiceItem } from '../types/index.ts';
import { buildWhatsAppUrl, cleanWhatsAppNumber } from '../utils/whatsapp.ts';
import { submitContactForm } from '../services/api.ts';

interface ContactSectionProps {
  settings: SiteSettings;
  texts: SiteTexts;
  services: ServiceItem[];
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  settings,
  texts,
  services,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [serviceInterest, setServiceInterest] = useState(services[0]?.title || 'Instalação de Ar-Condicionado');
  const [neighborhood, setNeighborhood] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !phone.trim() || !message.trim()) {
      setError('Por favor preencha nome, telefone/WhatsApp e a mensagem.');
      return;
    }

    setLoading(true);
    try {
      await submitContactForm({
        name,
        phone,
        email,
        serviceInterest,
        neighborhood,
        message,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const directWhatsappUrl = buildWhatsAppUrl(
    settings,
    `Olá! Meu nome é ${name || 'um cliente'}. Gostaria de um orçamento para ${serviceInterest}${
      neighborhood ? ` em ${neighborhood}` : ''
    }. Mensagem: ${message || 'Gostaria de mais detalhes.'}`
  );

  return (
    <section id="contato" className="py-20 bg-slate-900 text-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-md border border-amber-400/20">
            Atendimento Rápido
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 tracking-tight text-balance">
            {texts.contactTitle || 'Fale Conosco e Agende sua Visita'}
          </h2>
          <p className="text-base text-slate-300 mt-3 text-balance">
            {texts.contactSubtitle ||
              'Nossa equipe está à disposição para tirar dúvidas, calcular sua carga térmica e enviar um orçamento detalhado.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Contact Info Cards */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 space-y-5">
              <h3 className="text-lg font-bold text-white border-b border-slate-700/70 pb-3">
                Canais de Atendimento
              </h3>

              {/* WhatsApp 1 & 2 */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <MessageSquare className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h4 className="text-xs uppercase font-bold text-slate-400">WhatsApp Oficial 1</h4>
                  <a
                    href={buildWhatsAppUrl(settings)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    {settings.phone1 || '(11) 99968-5162'}
                  </a>
                  <p className="text-[11px] text-slate-400 mt-0.5">Atendimento prioritário para orçamentos</p>
                </div>
              </div>

              {/* Phone 2 */}
              {settings.phone2 && (
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase font-bold text-slate-400">WhatsApp / Telefone 2</h4>
                    <a
                      href={`https://wa.me/${cleanWhatsAppNumber(settings.phone2, settings.phone2Raw)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-bold text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {settings.phone2}
                    </a>
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs uppercase font-bold text-slate-400">E-mail Comercial</h4>
                  <a
                    href={`mailto:${settings.email || 'contato@rochaclimatizacao.com.br'}`}
                    className="text-sm font-semibold text-slate-200 hover:text-white transition-colors break-all"
                  >
                    {settings.email || 'contato@rochaclimatizacao.com.br'}
                  </a>
                </div>
              </div>

              {/* Address / Service Area */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs uppercase font-bold text-slate-400">Área de Atendimento</h4>
                  <p className="text-sm font-semibold text-slate-200">{settings.serviceArea}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{settings.address}</p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs uppercase font-bold text-slate-400">Horário de Funcionamento</h4>
                  <p className="text-sm font-semibold text-slate-200">{settings.businessHours}</p>
                </div>
              </div>
            </div>

            {/* Quick WhatsApp Action Box */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white shadow-lg">
              <h4 className="font-bold text-base">Quer resposta agora mesmo?</h4>
              <p className="text-xs text-emerald-100 mt-1">
                Fale diretamente com nossa equipe no WhatsApp. Enviamos orçamentos na hora!
              </p>
              <a
                href={buildWhatsAppUrl(settings)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center justify-center gap-2 w-full bg-white text-emerald-900 hover:bg-emerald-50 font-bold py-3 px-4 rounded-xl text-xs active:scale-95 transition-all shadow-md"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>Abrir WhatsApp da Rocha Climatização</span>
              </a>
            </div>
          </div>

          {/* Right: Message / Quote Builder Form */}
          <div className="lg:col-span-7">
            <div className="bg-slate-800/90 rounded-2xl p-6 sm:p-8 border border-slate-700/80 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-2">Solicite seu Orçamento Online</h3>
              <p className="text-xs text-slate-400 mb-6">
                Preencha o formulário abaixo. Sua mensagem será enviada ao nosso sistema e você também poderá enviá-la com 1 clique para o WhatsApp.
              </p>

              {success ? (
                <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-xl p-6 text-center space-y-4 animate-in fade-in">
                  <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-white">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-lg font-bold text-white">Mensagem Enviada com Sucesso!</h4>
                  <p className="text-xs text-emerald-200 max-w-md mx-auto">
                    Recebemos sua solicitação em nosso sistema administrativo. Nossa equipe entrará em contato muito em breve!
                  </p>
                  <div className="pt-2">
                    <a
                      href={directWhatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl text-xs active:scale-95 transition-all"
                    >
                      <MessageSquare className="w-4 h-4 fill-current" />
                      <span>Agilizar no WhatsApp agora</span>
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Seu Nome Completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Carlos Silva"
                        className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        WhatsApp / Celular com DDD *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ex: (11) 99999-9999"
                        className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Serviço Desejado
                      </label>
                      <select
                        value={serviceInterest}
                        onChange={(e) => setServiceInterest(e.target.value)}
                        className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                      >
                        {services.map((s) => (
                          <option key={s.id} value={s.title}>
                            {s.title}
                          </option>
                        ))}
                        <option value="Outro Serviço">Outro Serviço / Reforma</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Bairro / Cidade
                      </label>
                      <input
                        type="text"
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        placeholder="Ex: Moema, São Paulo"
                        className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      E-mail (opcional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seuemail@exemplo.com"
                      className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Detalhes do seu pedido *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Descreva seu ambiente, quantidade de aparelhos, se tem pré-instalação ou se precisa de limpeza/conserto..."
                      className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:flex-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-3.5 px-6 rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                    >
                      {loading ? (
                        <span>Enviando dados...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Enviar Solicitação de Orçamento</span>
                        </>
                      )}
                    </button>

                    <a
                      href={directWhatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-5 rounded-xl text-sm transition-all whitespace-nowrap active:scale-95"
                    >
                      <MessageSquare className="w-4 h-4 fill-current" />
                      <span>Ou Enviar no WhatsApp</span>
                    </a>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
