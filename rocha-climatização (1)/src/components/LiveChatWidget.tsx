import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, Phone, CheckCircle, ExternalLink, Bot } from 'lucide-react';
import { ChatConversation, ChatMessage, SiteSettings } from '../types/index.ts';
import { initChat } from '../services/api.ts';
import { buildWhatsAppUrl } from '../utils/whatsapp.ts';

interface LiveChatWidgetProps {
  settings: SiteSettings;
}

export const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({ settings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [inputText, setInputText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load existing conversationId from sessionStorage
  useEffect(() => {
    const savedConvId = sessionStorage.getItem('rocha_chat_conv_id');
    const savedName = sessionStorage.getItem('rocha_chat_name');
    if (savedConvId) {
      setHasStarted(true);
      if (savedName) setVisitorName(savedName);
      initChat({ conversationId: savedConvId, visitorName: savedName || 'Visitante' })
        .then((res) => {
          setConversation(res.conversation);
          connectSocket(res.conversation.id);
        })
        .catch((err) => console.error('Error resuming chat:', err));
    }
  }, []);

  const connectSocket = (convId: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    try {
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'join', conversationId: convId, isAdmin: false }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'sync:conversation') {
            setConversation(data.conversation);
          } else if (data.type === 'message:new' && data.conversationId === convId) {
            setConversation(data.conversation);
            if (!isOpen) {
              setUnreadCount((prev) => prev + 1);
            }
          }
        } catch (e) {
          console.error('WS parse error:', e);
        }
      };

      ws.onclose = () => {
        // Reconnect after 3 seconds
        setTimeout(() => {
          if (convId) connectSocket(convId);
        }, 3000);
      };
    } catch (e) {
      console.error('WebSocket connection error:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      if (conversation?.id && socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'chat:mark_read', conversationId: conversation.id, by: 'visitor' }));
      }
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [isOpen, conversation?.messages]);

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim()) return;

    try {
      const res = await initChat({
        visitorName: visitorName.trim(),
        phone: visitorPhone.trim(),
      });
      setConversation(res.conversation);
      sessionStorage.setItem('rocha_chat_conv_id', res.conversation.id);
      sessionStorage.setItem('rocha_chat_name', visitorName.trim());
      setHasStarted(true);
      connectSocket(res.conversation.id);
    } catch (err) {
      console.error('Error starting chat:', err);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !conversation?.id) return;

    const textToSend = inputText.trim();
    setInputText('');

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: 'chat:send',
          conversationId: conversation.id,
          sender: 'visitor',
          senderName: visitorName || 'Visitante',
          text: textToSend,
        })
      );
    }
  };

  const transferToWhatsappUrl = buildWhatsAppUrl(
    settings,
    `Olá! Estava no chat online do site da Rocha Climatização (${visitorName || 'Visitante'}) e gostaria de continuar o atendimento por aqui.`
  );

  return (
    <aside
      aria-label="Chat ao vivo"
      className="fixed bottom-6 left-6 z-40"
    >
      {/* Floating launcher trigger */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl shadow-blue-950/40 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-400/40"
          aria-label="Abrir chat ao vivo"
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5 text-amber-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="hidden sm:inline-block text-xs text-white">Chat ao Vivo</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[calc(100vw-3rem)] sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-950 to-blue-900 text-white p-4 flex items-center justify-between border-b border-blue-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-blue-800 border border-amber-400/50 flex items-center justify-center text-amber-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Rocha Climatização</h4>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Equipe pronta para atender</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-blue-800/60 focus:outline-none"
              aria-label="Fechar chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          {!hasStarted ? (
            <div className="flex-1 p-6 flex flex-col justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center mx-auto">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">Iniciar Atendimento</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Informe seu nome para que nossa equipe técnica possa lhe responder e registrar sua dúvida.
                </p>
              </div>

              <form onSubmit={handleStartChat} className="space-y-3 pt-2 text-left">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Seu Nome *</label>
                  <input
                    type="text"
                    required
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    placeholder="Ex: Rafael Rocha"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    WhatsApp para retorno (opcional)
                  </label>
                  <input
                    type="tel"
                    value={visitorPhone}
                    onChange={(e) => setVisitorPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-700"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs active:scale-95 transition-all shadow-md"
                >
                  Entrar no Chat Agora
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* Message History */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/70">
                {conversation?.messages.map((msg: ChatMessage) => {
                  const isVisitor = msg.sender === 'visitor';
                  const isSystem = msg.sender === 'system';

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="text-center my-2">
                        <div className="inline-block bg-blue-100/80 border border-blue-200 text-blue-950 text-[11px] px-3 py-1.5 rounded-lg leading-relaxed max-w-[90%]">
                          {msg.text}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isVisitor ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-0.5 px-1">
                        <span className="font-semibold text-slate-700">{msg.senderName}</span>
                        <span>·</span>
                        <span>
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div
                        className={`rounded-2xl px-3.5 py-2 text-xs sm:text-sm max-w-[85%] leading-relaxed ${
                          isVisitor
                            ? 'bg-blue-900 text-white rounded-tr-none'
                            : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none shadow-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Transfer to WhatsApp helper strip */}
              <div className="px-3 py-1.5 bg-emerald-50 border-t border-emerald-100 flex items-center justify-between text-[11px] text-emerald-800">
                <span>Quer resposta no WhatsApp?</span>
                <a
                  href={transferToWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold flex items-center gap-1 hover:underline text-emerald-700"
                >
                  <span>Mudar para WhatsApp</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Escreva sua dúvida aqui..."
                  className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-700"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="bg-blue-900 hover:bg-blue-800 disabled:opacity-40 text-white p-2 rounded-xl transition-all"
                  aria-label="Enviar mensagem"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </aside>
  );
};
