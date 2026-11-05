import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  LogOut,
  LayoutDashboard,
  Wrench,
  DollarSign,
  Image as ImageIcon,
  FileText,
  Settings,
  Layers,
  MessageSquare,
  MessageCircle,
  Key,
  Plus,
  Trash2,
  Edit,
  Save,
  Check,
  AlertCircle,
  ExternalLink,
  Upload,
  RefreshCw,
  Send,
  User,
  Phone,
  Clock,
  Package,
} from 'lucide-react';
import {
  SiteData,
  ServiceItem,
  PriceItem,
  ProductItem,
  GalleryItem,
  TestimonialItem,
  ContactMessage,
  ChatConversation,
} from '../types/index.ts';
import {
  adminLogin,
  verifyAdminSession,
  fetchAdminSiteData,
  clearAdminToken,
  updateAdminSettings,
  updateAdminTexts,
  updateAdminSections,
  createAdminService,
  updateAdminService,
  deleteAdminService,
  createAdminPrice,
  updateAdminPrice,
  deleteAdminPrice,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  reorderAdminProducts,
  createAdminGallery,
  updateAdminGallery,
  deleteAdminGallery,
  createAdminTestimonial,
  updateAdminTestimonial,
  deleteAdminTestimonial,
  markAdminMessageRead,
  deleteAdminMessage,
  uploadImage,
  changeAdminPassword,
} from '../services/api.ts';
import { cleanWhatsAppNumber, getPrimaryWhatsAppNumber } from '../utils/whatsapp.ts';

interface AdminPageProps {
  onBackToSite: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onBackToSite }) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Data state
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'products'
    | 'services'
    | 'prices'
    | 'gallery'
    | 'texts'
    | 'images'
    | 'settings'
    | 'sections'
    | 'messages'
    | 'chat'
    | 'security'
  >('dashboard');

  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [saving, setSaving] = useState(false);

  // Modal / form states for CRUD
  const [editingProduct, setEditingProduct] = useState<Partial<ProductItem> | null>(null);
  const [productSpecInput, setProductSpecInput] = useState('');
  const [uploadingProductImg, setUploadingProductImg] = useState(false);
  const [editingService, setEditingService] = useState<Partial<ServiceItem> | null>(null);
  const [editingPrice, setEditingPrice] = useState<Partial<PriceItem> | null>(null);
  const [editingGallery, setEditingGallery] = useState<Partial<GalleryItem> | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Partial<TestimonialItem> | null>(null);

  // Security password change
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  // Active chat state in admin
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatReplyText, setChatReplyText] = useState('');
  const chatSocketRef = useRef<WebSocket | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Check existing session
  useEffect(() => {
    verifyAdminSession()
      .then(() => {
        setIsAuthenticated(true);
        loadFullData();
      })
      .catch(() => {
        setIsAuthenticated(false);
      })
      .finally(() => setCheckingAuth(false));
  }, []);

  const loadFullData = async () => {
    try {
      const data = await fetchAdminSiteData();
      setSiteData(data);
    } catch (err: any) {
      showFeedback('Erro ao carregar dados do servidor', 'error');
    }
  };

  // Connect WebSocket for live agent monitoring
  useEffect(() => {
    if (!isAuthenticated) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);
    chatSocketRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'admin:watch' }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'sync:all_chats') {
          setSiteData((prev) => (prev ? { ...prev, chatConversations: msg.chats } : prev));
        } else if (msg.type === 'message:new') {
          setSiteData((prev) => {
            if (!prev) return prev;
            const updated = prev.chatConversations.map((c) =>
              c.id === msg.conversationId ? msg.conversation : c
            );
            return { ...prev, chatConversations: updated };
          });
        } else if (msg.type === 'sync:conversation') {
          setSiteData((prev) => {
            if (!prev) return prev;
            const updated = prev.chatConversations.map((c) =>
              c.id === msg.conversation.id ? msg.conversation : c
            );
            return { ...prev, chatConversations: updated };
          });
        }
      } catch (e) {
        console.error('Admin WS parse error:', e);
      }
    };

    return () => {
      ws.close();
    };
  }, [isAuthenticated]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [siteData?.chatConversations, activeChatId]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      await adminLogin(email, password);
      setIsAuthenticated(true);
      await loadFullData();
      showFeedback('Login realizado com sucesso!');
    } catch (err: any) {
      setLoginError(err.message || 'E-mail ou senha incorretos.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    clearAdminToken();
    setIsAuthenticated(false);
    setSiteData(null);
    window.location.href = '/';
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
          <span>Carregando painel administrativo...</span>
        </div>
      </div>
    );
  }

  /* ==========================================================================
     LOGIN VIEW
     ========================================================================== */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <img
            src="/assets/aistudio/ChatGPT_Image_23_de_ago._de_2026__00_11_45_3301b7e2.png"
            alt="Rocha Climatização"
            className="h-16 w-auto mx-auto object-contain"
          />
          <h2 className="mt-4 text-2xl font-black text-white tracking-tight">
            Painel Administrativo
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Acesso restrito para gerenciamento do site da Rocha Climatização
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl py-8 px-6 sm:px-10 shadow-2xl backdrop-blur-md">
            {loginError && (
              <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  E-mail Administrativo
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@rochaclimatizacao.com.br"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                    aria-label="Mostrar ou ocultar senha"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {loginLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Entrar no Painel</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
              <button
                onClick={onBackToSite}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                ← Voltar ao site público
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!siteData) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
      </div>
    );
  }

  /* ==========================================================================
     AUTHENTICATED DASHBOARD VIEW
     ========================================================================== */
  const unreadMessagesCount = siteData.messages.filter((m) => !m.read).length;
  const activeChatsCount = siteData.chatConversations.filter((c) => c.status === 'active').length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={siteData.settings.logoUrl || '/assets/aistudio/ChatGPT_Image_23_de_ago._de_2026__00_11_45_3301b7e2.png'}
              alt="Rocha"
              className="h-9 w-auto object-contain"
            />
            <span className="hidden sm:inline-block font-extrabold text-sm text-slate-200">
              Painel de Controle
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5"
            >
              <span>Ver Site Público</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-rose-300 hover:text-rose-100 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/60 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div
          className={`fixed top-20 right-6 z-50 p-4 rounded-xl shadow-xl border text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-2 duration-150 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
              : 'bg-rose-900 text-rose-100 border-rose-700'
          }`}
        >
          {feedbackMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-1 pb-3 mb-6 border-b border-slate-200 text-xs font-semibold scrollbar-none">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'products', label: `Produtos (${(siteData.products || []).length})`, icon: Package },
            { id: 'services', label: `Serviços (${siteData.services.length})`, icon: Wrench },
            { id: 'prices', label: `Tabela de Preços (${siteData.prices.length})`, icon: DollarSign },
            { id: 'gallery', label: `Galeria (${siteData.gallery.length})`, icon: ImageIcon },
            { id: 'texts', label: 'Textos & Banners', icon: FileText },
            { id: 'settings', label: 'Configurações Gerais', icon: Settings },
            { id: 'sections', label: 'Seções do Site', icon: Layers },
            { id: 'messages', label: `Mensagens (${unreadMessagesCount})`, icon: MessageSquare },
            { id: 'chat', label: `Chat ao Vivo (${activeChatsCount})`, icon: MessageCircle },
            { id: 'security', label: 'Senha & Segurança', icon: Key },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-200/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Produtos & Aparelhos</p>
                  <p className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
                    {(siteData.products || []).filter((p) => p.visible).length}
                    <span className="text-xs font-normal text-slate-400 ml-1">
                      / {(siteData.products || []).length}
                    </span>
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Serviços Ativos</p>
                  <p className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
                    {siteData.services.filter((s) => s.visible).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-50 text-blue-800 rounded-xl flex items-center justify-center">
                  <Wrench className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Fotos na Galeria</p>
                  <p className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
                    {siteData.gallery.filter((g) => g.visible).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center">
                  <ImageIcon className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Mensagens Recebidas</p>
                  <p className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
                    {siteData.messages.length}
                    {unreadMessagesCount > 0 && (
                      <span className="text-xs font-bold text-rose-500 ml-2">({unreadMessagesCount} novas)</span>
                    )}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Conversas no Chat</p>
                  <p className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
                    {siteData.chatConversations.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-50 text-purple-700 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick Actions & Status */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 text-base mb-4">Informações de Contato Cadastradas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-800 block">WhatsApp 1 (Principal)</span>
                  <span className="text-sm font-bold text-emerald-700">{siteData.settings.phone1}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-800 block">WhatsApp 2</span>
                  <span className="text-sm font-bold text-blue-700">{siteData.settings.phone2}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-800 block">E-mail Comercial</span>
                  <span className="text-sm font-bold text-slate-700">{siteData.settings.email}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PRODUCTS (CARROSSEL DE APARELHOS & PRODUTOS) */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-500" />
                  <span>Produtos & Aparelhos de Climatização</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Gerencie os aparelhos que aparecem no carrossel da página inicial com fotos, preços e especificações técnicas
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingProduct({
                    name: '',
                    category: 'Split Hi-Wall',
                    brand: 'LG Dual Inverter',
                    imageUrl: '/src/assets/images/ac_split_inverter_1792776578343.jpg',
                    price: 2490,
                    oldPrice: 2890,
                    priceObservation: 'Em até 10x sem juros no cartão ou desconto no PIX',
                    badge: 'Mais Vendido',
                    btus: '12.000 BTUs',
                    voltage: '220V',
                    cycle: 'Frio / Quente e Frio',
                    specifications: [
                      'Tecnologia Dual Inverter: até 70% de economia de energia',
                      'Serpentina 100% Cobre de alta durabilidade',
                      'Gás ecológico R-32 de alta eficiência térmica',
                      'Operação ultra silenciosa (apenas 19 dB)',
                      'Opção com instalação Rocha Climatização',
                    ],
                    description: '',
                    inStock: true,
                    visible: true,
                    order: (siteData.products || []).length + 1,
                    whatsappCustomMsg: '',
                  });
                  setProductSpecInput('');
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>+ Adicionar Novo Produto</span>
              </button>
            </div>

            {/* Products List */}
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
              {(!siteData.products || siteData.products.length === 0) ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Nenhum produto cadastrado ainda. Clique no botão acima para adicionar o primeiro aparelho!
                </div>
              ) : (
                siteData.products.map((prod) => {
                  const formattedPrice = Number(prod.price).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  });
                  const formattedOldPrice = prod.oldPrice
                    ? Number(prod.oldPrice).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })
                    : null;

                  return (
                    <div
                      key={prod.id}
                      className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-start sm:items-center gap-4 flex-1">
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          <img
                            src={prod.imageUrl || '/src/assets/images/ac_split_inverter_1792776578343.jpg'}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {prod.badge && (
                            <span className="absolute top-1 left-1 bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                              {prod.badge}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900">{prod.name}</h4>
                            <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                              {prod.category}
                            </span>
                            {prod.brand && (
                              <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                {prod.brand}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-black text-blue-900 text-sm">
                              {formattedPrice}
                            </span>
                            {formattedOldPrice && (
                              <span className="text-slate-400 line-through text-xs">
                                {formattedOldPrice}
                              </span>
                            )}
                            {prod.btus && (
                              <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                                {prod.btus}
                              </span>
                            )}
                            {prod.voltage && (
                              <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                                {prod.voltage}
                              </span>
                            )}
                          </div>

                          {prod.specifications && prod.specifications.length > 0 && (
                            <p className="text-[11px] text-slate-500 line-clamp-1">
                              <strong>Specs:</strong> {prod.specifications.join(' • ')}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Status Badges & Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
                        {/* Stock toggle */}
                        <button
                          onClick={async () => {
                            const updated = !prod.inStock;
                            await updateAdminProduct(prod.id, { inStock: updated });
                            await loadFullData();
                            showFeedback(updated ? 'Produto em estoque!' : 'Produto esgotado.');
                          }}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-colors cursor-pointer ${
                            prod.inStock
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                          title="Clique para alternar estoque"
                        >
                          {prod.inStock ? '✓ Em Estoque' : 'Esgotado'}
                        </button>

                        {/* Visibility toggle */}
                        <button
                          onClick={async () => {
                            const updated = !prod.visible;
                            await updateAdminProduct(prod.id, { visible: updated });
                            await loadFullData();
                            showFeedback(updated ? 'Produto visível no carrossel!' : 'Produto ocultado do site.');
                          }}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-colors cursor-pointer ${
                            prod.visible
                              ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          }`}
                          title="Clique para alternar visibilidade no carrossel"
                        >
                          {prod.visible ? 'Visível no Carrossel' : 'Oculto'}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => {
                            setEditingProduct({
                              ...prod,
                              specifications: Array.isArray(prod.specifications) ? [...prod.specifications] : [],
                            });
                            setProductSpecInput('');
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>

                        {/* Delete */}
                        <button
                          onClick={async () => {
                            if (confirm(`Tem certeza que deseja excluir o produto "${prod.name}"?`)) {
                              await deleteAdminProduct(prod.id);
                              await loadFullData();
                              showFeedback('Produto excluído com sucesso!');
                            }
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir produto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal de Criação / Edição de Produto */}
            {editingProduct && (
              <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in">
                <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 space-y-4 shadow-2xl border border-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                      <Package className="w-5 h-5 text-amber-500" />
                      <span>{editingProduct.id ? 'Editar Produto / Aparelho' : 'Novo Produto / Aparelho'}</span>
                    </h3>
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Nome */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nome do Produto / Aparelho *
                    </label>
                    <input
                      type="text"
                      value={editingProduct.name || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      placeholder="Ex: Ar-Condicionado Split Hi-Wall 12.000 BTUs Inverter"
                      className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  {/* Categoria e Marca */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Categoria</label>
                      <select
                        value={editingProduct.category || 'Split Hi-Wall'}
                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                        className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      >
                        <option value="Split Hi-Wall">Split Hi-Wall</option>
                        <option value="Multi Split">Multi Split</option>
                        <option value="Cassete Comercial / Residencial">Cassete Comercial / Residencial</option>
                        <option value="Piso Teto">Piso Teto</option>
                        <option value="Portátil">Portátil</option>
                        <option value="Cortina de Ar">Cortina de Ar</option>
                        <option value="Acessórios & Instalação">Acessórios & Instalação</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Marca / Fabricante</label>
                      <input
                        type="text"
                        value={editingProduct.brand || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                        placeholder="Ex: LG Dual Inverter, Daikin, Midea, Gree..."
                        className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  {/* Foto do Produto */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Foto do Produto (URL ou Enviar Arquivo do Computador/Celular)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingProduct.imageUrl || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                        placeholder="URL da foto (ex: /src/assets/images/... ou link externo)"
                        className="flex-1 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                      <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 shrink-0 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingProductImg ? 'Enviando...' : 'Fazer Upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingProductImg}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setUploadingProductImg(true);
                              try {
                                const url = await uploadImage(file);
                                setEditingProduct({ ...editingProduct, imageUrl: url });
                                showFeedback('Imagem enviada com sucesso!');
                              } catch (err: any) {
                                showFeedback(err.message, 'error');
                              } finally {
                                setUploadingProductImg(false);
                              }
                            }
                          }}
                        />
                      </label>
                    </div>

                    {/* Image preview */}
                    {editingProduct.imageUrl && (
                      <div className="mt-2.5 flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                        <img
                          src={editingProduct.imageUrl}
                          alt="Preview"
                          className="w-16 h-12 object-cover rounded-lg border border-slate-200 bg-white"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-[11px] text-slate-500">
                          Pré-visualização da imagem configurada para o carrossel.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Preços */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Preço Atual (R$) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingProduct.price ?? ''}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            price: e.target.value ? Number(e.target.value) : 0,
                          })
                        }
                        placeholder="Ex: 2490"
                        className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Preço Anterior / De (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingProduct.oldPrice ?? ''}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            oldPrice: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        placeholder="Ex: 2890 (aparece riscado)"
                        className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Destaque / Selo Promocional
                      </label>
                      <input
                        type="text"
                        value={editingProduct.badge || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                        placeholder="Ex: Mais Vendido, Pronta Entrega..."
                        className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  {/* Condição de pagamento */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Condição de Pagamento / Observação do Preço
                    </label>
                    <input
                      type="text"
                      value={editingProduct.priceObservation || ''}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, priceObservation: e.target.value })
                      }
                      placeholder="Ex: Em até 10x sem juros no cartão ou 5% de desconto no PIX"
                      className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  {/* Especificações Rápidas (BTUs, Voltagem, Ciclo) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Capacidade / BTUs</label>
                      <input
                        type="text"
                        value={editingProduct.btus || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, btus: e.target.value })}
                        placeholder="Ex: 12.000 BTUs"
                        className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Voltagem</label>
                      <select
                        value={editingProduct.voltage || '220V'}
                        onChange={(e) => setEditingProduct({ ...editingProduct, voltage: e.target.value })}
                        className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      >
                        <option value="220V">220V</option>
                        <option value="127V (110V)">127V (110V)</option>
                        <option value="Bivolt">Bivolt</option>
                        <option value="380V Trifásico">380V Trifásico</option>
                        <option value="Universal">Universal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Ciclo</label>
                      <select
                        value={editingProduct.cycle || 'Frio'}
                        onChange={(e) => setEditingProduct({ ...editingProduct, cycle: e.target.value })}
                        className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      >
                        <option value="Frio">Frio</option>
                        <option value="Quente e Frio">Quente e Frio</option>
                        <option value="Frio / Quente e Frio">Frio / Quente e Frio</option>
                        <option value="Universal">Universal</option>
                      </select>
                    </div>
                  </div>

                  {/* Especificações Técnicas - Editor de Itens */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-800">
                      Especificações Técnicas e Diferenciais
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Adicione itens que valorizam o produto (ex: serpentina de cobre, economia de energia, gás R-32, nível de ruído, etc.).
                    </p>

                    {/* Current specs list */}
                    <div className="space-y-1.5 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                      {(!editingProduct.specifications || editingProduct.specifications.length === 0) ? (
                        <p className="text-xs text-slate-400 italic">Nenhuma especificação cadastrada.</p>
                      ) : (
                        editingProduct.specifications.map((spec, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between gap-2 p-1.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-800"
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {spec}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (editingProduct.specifications || []).filter((_, idx) => idx !== i);
                                setEditingProduct({ ...editingProduct, specifications: updated });
                              }}
                              className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                              title="Remover"
                            >
                              ✕
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add new spec input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={productSpecInput}
                        onChange={(e) => setProductSpecInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (productSpecInput.trim()) {
                              setEditingProduct({
                                ...editingProduct,
                                specifications: [...(editingProduct.specifications || []), productSpecInput.trim()],
                              });
                              setProductSpecInput('');
                            }
                          }
                        }}
                        placeholder="Digitar nova especificação e pressionar Adicionar..."
                        className="flex-1 border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (productSpecInput.trim()) {
                            setEditingProduct({
                              ...editingProduct,
                              specifications: [...(editingProduct.specifications || []), productSpecInput.trim()],
                            });
                            setProductSpecInput('');
                          }
                        }}
                        className="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        + Adicionar
                      </button>
                    </div>

                    {/* Sugestões Rápidas */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 self-center">Sugestões rápidas:</span>
                      {[
                        'Tecnologia Dual Inverter: até 70% economia',
                        'Serpentina 100% Cobre',
                        'Gás Ecológico R-32',
                        'Operação Ultra Silenciosa (19 dB)',
                        'Filtro Lavável Antibactéria',
                        'Instalação Rocha com Garantia',
                      ].map((sug, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            if (!(editingProduct.specifications || []).includes(sug)) {
                              setEditingProduct({
                                ...editingProduct,
                                specifications: [...(editingProduct.specifications || []), sug],
                              });
                            }
                          }}
                          className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 cursor-pointer transition-colors"
                        >
                          + {sug}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Descrição Detalhada */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Descrição Detalhada do Produto (opcional)
                    </label>
                    <textarea
                      rows={2}
                      value={editingProduct.description || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      placeholder="Informações adicionais sobre o ambiente ideal, eficiência, modos de ventilação..."
                      className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  {/* Toggles de Estoque e Visibilidade */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={editingProduct.inStock ?? true}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, inStock: e.target.checked })
                        }
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span className="text-xs font-bold text-slate-800">
                        Produto em Estoque (Pronta Entrega)
                      </span>
                    </label>

                    <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={editingProduct.visible ?? true}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, visible: e.target.checked })
                        }
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-xs font-bold text-slate-800">
                        Mostrar no Carrossel da Página Inicial
                      </span>
                    </label>
                  </div>

                  {/* Botões do Modal */}
                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={async () => {
                        if (!editingProduct.name) {
                          showFeedback('Por favor, digite o nome do produto', 'error');
                          return;
                        }
                        setSaving(true);
                        try {
                          if (editingProduct.id) {
                            await updateAdminProduct(editingProduct.id, editingProduct);
                            showFeedback('Produto atualizado com sucesso!');
                          } else {
                            await createAdminProduct(editingProduct);
                            showFeedback('Produto cadastrado com sucesso!');
                          }
                          await loadFullData();
                          setEditingProduct(null);
                        } catch (err: any) {
                          showFeedback(err.message || 'Erro ao salvar produto', 'error');
                        } finally {
                          setSaving(false);
                        }
                      }}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 rounded-xl text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? 'Salvando...' : 'Salvar Produto'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: SERVICES */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Gerenciar Serviços</h3>
                <p className="text-xs text-slate-500">Adicione, altere preços, fotos ou oculte serviços no site</p>
              </div>
              <button
                onClick={() =>
                  setEditingService({
                    title: '',
                    shortDescription: '',
                    fullDescription: '',
                    category: 'Climatização',
                    imageUrl: '/src/assets/images/hero_ac_split_living_1792728720151.jpg',
                    priceType: 'sob_consulta',
                    visible: true,
                    includedFeatures: [],
                  })
                }
                className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Novo Serviço</span>
              </button>
            </div>

            {/* List */}
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
              {siteData.services.map((srv) => (
                <div key={srv.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <img
                      src={srv.imageUrl}
                      alt={srv.title}
                      className="w-16 h-16 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{srv.title}</h4>
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {srv.category}
                        </span>
                        {!srv.visible && (
                          <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded">
                            Oculto
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{srv.shortDescription}</p>
                      <p className="text-xs font-semibold text-blue-900 mt-1">
                        Preço: {srv.priceType} {srv.priceValue ? `R$ ${srv.priceValue}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setEditingService(srv)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Tem certeza que deseja excluir o serviço "${srv.title}"?`)) {
                          await deleteAdminService(srv.id);
                          await loadFullData();
                          showFeedback('Serviço excluído');
                        }
                      }}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Edit / Create Modal */}
            {editingService && (
              <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in">
                <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
                  <h3 className="font-bold text-base text-slate-900">
                    {editingService.id ? 'Editar Serviço' : 'Novo Serviço'}
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Serviço *</label>
                    <input
                      type="text"
                      value={editingService.title || ''}
                      onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Categoria</label>
                    <input
                      type="text"
                      value={editingService.category || 'Climatização'}
                      onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl p-2 text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição Curta</label>
                    <input
                      type="text"
                      value={editingService.shortDescription || ''}
                      onChange={(e) => setEditingService({ ...editingService, shortDescription: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl p-2 text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição Completa</label>
                    <textarea
                      rows={3}
                      value={editingService.fullDescription || ''}
                      onChange={(e) => setEditingService({ ...editingService, fullDescription: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl p-2 text-xs text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Preço</label>
                      <select
                        value={editingService.priceType || 'sob_consulta'}
                        onChange={(e) => setEditingService({ ...editingService, priceType: e.target.value as any })}
                        className="w-full border border-slate-300 rounded-xl p-2 text-xs text-slate-900"
                      >
                        <option value="sob_consulta">Sob Consulta / Avaliação</option>
                        <option value="a_partir">A Partir De</option>
                        <option value="fixo">Preço Fixo</option>
                        <option value="faixa">Faixa de Preço</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Valor Numérico (R$)</label>
                      <input
                        type="number"
                        value={editingService.priceValue ?? ''}
                        onChange={(e) => setEditingService({ ...editingService, priceValue: e.target.value ? Number(e.target.value) : undefined })}
                        placeholder="Ex: 180"
                        className="w-full border border-slate-300 rounded-xl p-2 text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">URL da Imagem ou Enviar Arquivo</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingService.imageUrl || ''}
                        onChange={(e) => setEditingService({ ...editingService, imageUrl: e.target.value })}
                        className="flex-1 border border-slate-300 rounded-xl p-2 text-xs text-slate-900"
                      />
                      <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const url = await uploadImage(file);
                                setEditingService({ ...editingService, imageUrl: url });
                                showFeedback('Imagem enviada com sucesso!');
                              } catch (err: any) {
                                showFeedback(err.message, 'error');
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="srv-vis"
                      checked={editingService.visible ?? true}
                      onChange={(e) => setEditingService({ ...editingService, visible: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="srv-vis" className="text-xs font-semibold text-slate-700">
                      Mostrar este serviço no site público
                    </label>
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                    <button
                      onClick={() => setEditingService(null)}
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={async () => {
                        if (!editingService.title) return alert('Preencha o título do serviço');
                        if (editingService.id) {
                          await updateAdminService(editingService.id, editingService);
                        } else {
                          await createAdminService(editingService);
                        }
                        await loadFullData();
                        setEditingService(null);
                        showFeedback('Serviço salvo com sucesso!');
                      }}
                      className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold"
                    >
                      Salvar Serviço
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: PRICES */}
        {activeTab === 'prices' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Gerenciar Tabela de Preços</h3>
                <p className="text-xs text-slate-500">Configure itens de preço, valores iniciais e o que está incluso</p>
              </div>
              <button
                onClick={() =>
                  setEditingPrice({
                    serviceName: '',
                    priceType: 'a_partir',
                    priceValue: 200,
                    unit: 'por aparelho',
                    description: '',
                    includedItems: ['Garantia técnica'],
                    visible: true,
                  })
                }
                className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Item de Preço</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
              {siteData.prices.map((prc) => (
                <div key={prc.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{prc.serviceName}</h4>
                      {prc.popular && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                          Mais Solicitado
                        </span>
                      )}
                      {!prc.visible && (
                        <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded">
                          Oculto
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{prc.description}</p>
                    <p className="text-xs font-semibold text-emerald-700 mt-1">
                      {prc.priceType}: {prc.priceValue ? `R$ ${prc.priceValue}` : 'Sob avaliação'} {prc.unit ? `(${prc.unit})` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setEditingPrice(prc)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Excluir preço "${prc.serviceName}"?`)) {
                          await deleteAdminPrice(prc.id);
                          await loadFullData();
                          showFeedback('Item de preço excluído');
                        }
                      }}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Edit Modal */}
            {editingPrice && (
              <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
                  <h3 className="font-bold text-base text-slate-900">
                    {editingPrice.id ? 'Editar Preço' : 'Novo Preço'}
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Serviço *</label>
                    <input
                      type="text"
                      value={editingPrice.serviceName || ''}
                      onChange={(e) => setEditingPrice({ ...editingPrice, serviceName: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Formato de Preço</label>
                      <select
                        value={editingPrice.priceType || 'a_partir'}
                        onChange={(e) => setEditingPrice({ ...editingPrice, priceType: e.target.value as any })}
                        className="w-full border border-slate-300 rounded-xl p-2 text-xs text-slate-900"
                      >
                        <option value="a_partir">A Partir De</option>
                        <option value="fixo">Preço Fixo</option>
                        <option value="faixa">Faixa de Preço</option>
                        <option value="sob_consulta">Sob Consulta / Avaliação</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Valor (R$)</label>
                      <input
                        type="number"
                        value={editingPrice.priceValue ?? ''}
                        onChange={(e) => setEditingPrice({ ...editingPrice, priceValue: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full border border-slate-300 rounded-xl p-2 text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição</label>
                    <input
                      type="text"
                      value={editingPrice.description || ''}
                      onChange={(e) => setEditingPrice({ ...editingPrice, description: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl p-2 text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Observações Adicionais</label>
                    <input
                      type="text"
                      value={editingPrice.observation || ''}
                      onChange={(e) => setEditingPrice({ ...editingPrice, observation: e.target.value })}
                      placeholder="Ex: Valor para até 3 metros de tubulação..."
                      className="w-full border border-slate-300 rounded-xl p-2 text-xs text-slate-900"
                    />
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingPrice.popular ?? false}
                        onChange={(e) => setEditingPrice({ ...editingPrice, popular: e.target.checked })}
                      />
                      <span>Destacar como Mais Solicitado</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingPrice.visible ?? true}
                        onChange={(e) => setEditingPrice({ ...editingPrice, visible: e.target.checked })}
                      />
                      <span>Visível no site</span>
                    </label>
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                    <button
                      onClick={() => setEditingPrice(null)}
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={async () => {
                        if (!editingPrice.serviceName) return alert('Preencha o nome');
                        if (editingPrice.id) {
                          await updateAdminPrice(editingPrice.id, editingPrice);
                        } else {
                          await createAdminPrice(editingPrice);
                        }
                        await loadFullData();
                        setEditingPrice(null);
                        showFeedback('Preço salvo!');
                      }}
                      className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold"
                    >
                      Salvar Preço
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: GALLERY */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Gerenciar Galeria de Obras</h3>
                <p className="text-xs text-slate-500">Envie fotos reais dos serviços executados para o portfólio</p>
              </div>
              <button
                onClick={() =>
                  setEditingGallery({
                    title: '',
                    description: '',
                    serviceType: 'Instalação de Ar-Condicionado',
                    imageUrl: '',
                    date: new Date().toLocaleDateString('pt-BR'),
                    location: 'São Paulo - SP',
                    visible: true,
                  })
                }
                className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Foto na Galeria</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {siteData.gallery.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                  <div className="h-44 bg-slate-100 relative">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    <span className="absolute top-2 right-2 bg-slate-900/80 text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded">
                      {item.serviceType}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => setEditingGallery(item)}
                        className="text-xs font-semibold text-blue-700 hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`Excluir "${item.title}" da galeria?`)) {
                            await deleteAdminGallery(item.id);
                            await loadFullData();
                            showFeedback('Foto excluída');
                          }
                        }}
                        className="text-xs font-semibold text-rose-600 hover:underline"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Gallery modal */}
            {editingGallery && (
              <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
                  <h3 className="font-bold text-base text-slate-900">
                    {editingGallery.id ? 'Editar Trabalho' : 'Novo Trabalho na Galeria'}
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Título do Trabalho *</label>
                    <input
                      type="text"
                      value={editingGallery.title || ''}
                      onChange={(e) => setEditingGallery({ ...editingGallery, title: e.target.value })}
                      placeholder="Ex: Instalação de Split Inverter em Sala"
                      className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Serviço</label>
                    <input
                      type="text"
                      value={editingGallery.serviceType || 'Instalação de Ar-Condicionado'}
                      onChange={(e) => setEditingGallery({ ...editingGallery, serviceType: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl p-2 text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição</label>
                    <textarea
                      rows={2}
                      value={editingGallery.description || ''}
                      onChange={(e) => setEditingGallery({ ...editingGallery, description: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl p-2 text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Imagem</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingGallery.imageUrl || ''}
                        onChange={(e) => setEditingGallery({ ...editingGallery, imageUrl: e.target.value })}
                        placeholder="/assets/... ou https://..."
                        className="flex-1 border border-slate-300 rounded-xl p-2 text-xs text-slate-900"
                      />
                      <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const url = await uploadImage(file);
                                setEditingGallery({ ...editingGallery, imageUrl: url });
                                showFeedback('Foto enviada!');
                              } catch (err: any) {
                                showFeedback(err.message, 'error');
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                    <button
                      onClick={() => setEditingGallery(null)}
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={async () => {
                        if (!editingGallery.title || !editingGallery.imageUrl) {
                          return alert('Preencha o título e forneça uma imagem');
                        }
                        if (editingGallery.id) {
                          await updateAdminGallery(editingGallery.id, editingGallery);
                        } else {
                          await createAdminGallery(editingGallery);
                        }
                        await loadFullData();
                        setEditingGallery(null);
                        showFeedback('Galeria salva com sucesso!');
                      }}
                      className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: TEXTS */}
        {activeTab === 'texts' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Editar Textos do Site</h3>
                <p className="text-xs text-slate-500">Altere títulos, subtítulos, textos do hero e mensagens institucionais</p>
              </div>
              <button
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  try {
                    await updateAdminTexts(siteData.texts);
                    showFeedback('Textos salvos com sucesso!');
                  } catch (e: any) {
                    showFeedback(e.message, 'error');
                  } finally {
                    setSaving(false);
                  }
                }}
                className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Título Principal (Hero)</label>
                <input
                  type="text"
                  value={siteData.texts.heroTitle}
                  onChange={(e) =>
                    setSiteData({
                      ...siteData,
                      texts: { ...siteData.texts, heroTitle: e.target.value },
                    })
                  }
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subtítulo (Hero)</label>
                <input
                  type="text"
                  value={siteData.texts.heroSubtitle}
                  onChange={(e) =>
                    setSiteData({
                      ...siteData,
                      texts: { ...siteData.texts, heroSubtitle: e.target.value },
                    })
                  }
                  className="w-full border border-slate-300 rounded-xl p-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Texto Complementar (Hero)</label>
                <textarea
                  rows={2}
                  value={siteData.texts.heroComplement}
                  onChange={(e) =>
                    setSiteData({
                      ...siteData,
                      texts: { ...siteData.texts, heroComplement: e.target.value },
                    })
                  }
                  className="w-full border border-slate-300 rounded-xl p-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">História da Empresa (Sobre Nós)</label>
                <textarea
                  rows={4}
                  value={siteData.texts.aboutStory}
                  onChange={(e) =>
                    setSiteData({
                      ...siteData,
                      texts: { ...siteData.texts, aboutStory: e.target.value },
                    })
                  }
                  className="w-full border border-slate-300 rounded-xl p-2 text-xs text-slate-900 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Missão e Padrão de Qualidade</label>
                <textarea
                  rows={3}
                  value={siteData.texts.aboutMission}
                  onChange={(e) =>
                    setSiteData({
                      ...siteData,
                      texts: { ...siteData.texts, aboutMission: e.target.value },
                    })
                  }
                  className="w-full border border-slate-300 rounded-xl p-2 text-xs text-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB: SETTINGS & IMAGES */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Configurações Gerais</h3>
                <p className="text-xs text-slate-500">Telefones, WhatsApp, horários, endereço e logo da empresa</p>
              </div>
              <button
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  try {
                    await updateAdminSettings(siteData.settings);
                    showFeedback('Configurações salvas!');
                  } catch (e: any) {
                    showFeedback(e.message, 'error');
                  } finally {
                    setSaving(false);
                  }
                }}
                className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Configurações</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome Oficial da Empresa</label>
                <input
                  type="text"
                  value={siteData.settings.companyName}
                  onChange={(e) =>
                    setSiteData({
                      ...siteData,
                      settings: { ...siteData.settings, companyName: e.target.value },
                    })
                  }
                  className="w-full border border-slate-300 rounded-xl p-2 text-slate-900"
                />
              </div>

              <div className="sm:col-span-2 p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-emerald-950 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-600 fill-current" />
                      <span>Roteamento dos Botões do WhatsApp</span>
                    </h4>
                    <p className="text-[11px] text-emerald-800">
                      Escolha qual número deve receber todas as mensagens dos botões de orçamento do site.
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/${getPrimaryWhatsAppNumber(siteData.settings)}?text=${encodeURIComponent('Teste de orçamento Rocha Climatização')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm whitespace-nowrap self-start sm:self-auto"
                  >
                    <span>Testar no WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-emerald-900 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-xl border border-emerald-300 shadow-xs">
                    <input
                      type="radio"
                      name="primaryWhatsapp"
                      checked={siteData.settings.primaryWhatsapp !== 'phone2'}
                      onChange={() =>
                        setSiteData({
                          ...siteData,
                          settings: { ...siteData.settings, primaryWhatsapp: 'phone1' },
                        })
                      }
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Usar Número 1 como Principal</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-xl border border-emerald-300 shadow-xs">
                    <input
                      type="radio"
                      name="primaryWhatsapp"
                      checked={siteData.settings.primaryWhatsapp === 'phone2'}
                      onChange={() =>
                        setSiteData({
                          ...siteData,
                          settings: { ...siteData.settings, primaryWhatsapp: 'phone2' },
                        })
                      }
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Usar Número 2 como Principal</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      const tempPhone = siteData.settings.phone1;
                      const tempRaw = siteData.settings.phone1Raw;
                      setSiteData({
                        ...siteData,
                        settings: {
                          ...siteData.settings,
                          phone1: siteData.settings.phone2,
                          phone1Raw: siteData.settings.phone2Raw,
                          phone2: tempPhone,
                          phone2Raw: tempRaw,
                        },
                      });
                      showFeedback('Números 1 e 2 invertidos com sucesso!');
                    }}
                    className="px-3 py-2 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold transition-colors"
                  >
                    ⇄ Inverter Posições (Trocar 1 e 2)
                  </button>
                </div>

                <div className="text-[11px] text-emerald-800 bg-white/80 p-2.5 rounded-xl border border-emerald-200/80 flex items-center justify-between">
                  <span>
                    Destino ativo agora nos botões: <strong>+{getPrimaryWhatsAppNumber(siteData.settings)}</strong>
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {siteData.settings.primaryWhatsapp === 'phone2' ? '(Usando Número 2)' : '(Usando Número 1)'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  WhatsApp Número 1 (com DDD)
                </label>
                <input
                  type="text"
                  value={siteData.settings.phone1}
                  onChange={(e) => {
                    const val = e.target.value;
                    const raw = cleanWhatsAppNumber(val);
                    setSiteData({
                      ...siteData,
                      settings: { ...siteData.settings, phone1: val, phone1Raw: raw },
                    });
                  }}
                  placeholder="(11) 99968-5162"
                  className="w-full border border-slate-300 rounded-xl p-2 text-slate-900"
                />
                <p className="text-[11px] text-slate-500 mt-1 font-medium flex items-center gap-1">
                  <span>Formato WhatsApp:</span>
                  <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                    +{cleanWhatsAppNumber(siteData.settings.phone1, siteData.settings.phone1Raw)}
                  </span>
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  WhatsApp Número 2 (com DDD)
                </label>
                <input
                  type="text"
                  value={siteData.settings.phone2}
                  onChange={(e) => {
                    const val = e.target.value;
                    const raw = cleanWhatsAppNumber(val);
                    setSiteData({
                      ...siteData,
                      settings: { ...siteData.settings, phone2: val, phone2Raw: raw },
                    });
                  }}
                  placeholder="(11) 97268-9185"
                  className="w-full border border-slate-300 rounded-xl p-2 text-slate-900"
                />
                <p className="text-[11px] text-slate-500 mt-1 font-medium flex items-center gap-1">
                  <span>Formato WhatsApp:</span>
                  <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                    +{cleanWhatsAppNumber(siteData.settings.phone2, siteData.settings.phone2Raw)}
                  </span>
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">E-mail de Contato</label>
                <input
                  type="email"
                  value={siteData.settings.email}
                  onChange={(e) =>
                    setSiteData({
                      ...siteData,
                      settings: { ...siteData.settings, email: e.target.value },
                    })
                  }
                  className="w-full border border-slate-300 rounded-xl p-2 text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Regiões Atendidas</label>
                <input
                  type="text"
                  value={siteData.settings.serviceArea}
                  onChange={(e) =>
                    setSiteData({
                      ...siteData,
                      settings: { ...siteData.settings, serviceArea: e.target.value },
                    })
                  }
                  className="w-full border border-slate-300 rounded-xl p-2 text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Horário de Atendimento</label>
                <input
                  type="text"
                  value={siteData.settings.businessHours}
                  onChange={(e) =>
                    setSiteData({
                      ...siteData,
                      settings: { ...siteData.settings, businessHours: e.target.value },
                    })
                  }
                  className="w-full border border-slate-300 rounded-xl p-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome da Técnica Especialista</label>
                <input
                  type="text"
                  value={siteData.settings.specialistName}
                  onChange={(e) =>
                    setSiteData({
                      ...siteData,
                      settings: { ...siteData.settings, specialistName: e.target.value },
                    })
                  }
                  className="w-full border border-slate-300 rounded-xl p-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cargo / Especialidade</label>
                <input
                  type="text"
                  value={siteData.settings.specialistRole}
                  onChange={(e) =>
                    setSiteData({
                      ...siteData,
                      settings: { ...siteData.settings, specialistRole: e.target.value },
                    })
                  }
                  className="w-full border border-slate-300 rounded-xl p-2 text-slate-900"
                />
              </div>
            </div>

            {/* Logo and Favicon Upload */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h4 className="font-bold text-sm text-slate-900">Logo e Identidade Visual</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <span className="font-semibold text-xs text-slate-800 block">Logo Atual</span>
                  <div className="h-16 flex items-center bg-slate-900 p-2 rounded-lg">
                    <img src={siteData.settings.logoUrl} alt="Logo" className="h-12 w-auto object-contain mx-auto" />
                  </div>
                  <label className="cursor-pointer bg-white border border-slate-300 hover:bg-slate-100 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Substituir Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await uploadImage(file);
                          setSiteData({ ...siteData, settings: { ...siteData.settings, logoUrl: url } });
                          await updateAdminSettings({ logoUrl: url });
                          showFeedback('Logo atualizada com sucesso!');
                        }
                      }}
                    />
                  </label>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <span className="font-semibold text-xs text-slate-800 block">Favicon Atual</span>
                  <div className="h-16 flex items-center justify-center bg-slate-900 p-2 rounded-lg">
                    <img src={siteData.settings.faviconUrl} alt="Favicon" className="h-8 w-8 object-contain" />
                  </div>
                  <label className="cursor-pointer bg-white border border-slate-300 hover:bg-slate-100 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Substituir Favicon</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await uploadImage(file);
                          setSiteData({ ...siteData, settings: { ...siteData.settings, faviconUrl: url } });
                          await updateAdminSettings({ faviconUrl: url });
                          showFeedback('Favicon atualizado com sucesso!');
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: SECTIONS */}
        {activeTab === 'sections' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Visibilidade das Seções</h3>
                <p className="text-xs text-slate-500">Ative ou oculte seções da página inicial do site</p>
              </div>
              <button
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  try {
                    await updateAdminSections(siteData.sections);
                    showFeedback('Seções salvas!');
                  } catch (e: any) {
                    showFeedback(e.message, 'error');
                  } finally {
                    setSaving(false);
                  }
                }}
                className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Configuração</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { key: 'hero', label: 'Banner Principal (Hero)' },
                { key: 'productsCarousel', label: 'Carrossel de Produtos & Aparelhos (Ar-Condicionado)' },
                { key: 'alertBanner', label: 'Alerta Ar Sujo & Promoção' },
                { key: 'services', label: 'Seção de Serviços' },
                { key: 'prices', label: 'Tabela de Preços' },
                { key: 'gallery', label: 'Galeria de Trabalhos' },
                { key: 'about', label: 'Sobre a Empresa & Técnica Especialista' },
                { key: 'testimonials', label: 'Depoimentos de Clientes' },
                { key: 'faq', label: 'Perguntas Frequentes (FAQ)' },
                { key: 'contact', label: 'Seção de Contato & Orçamento' },
              ].map((sec) => (
                <label
                  key={sec.key}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100"
                >
                  <span className="font-semibold text-slate-800">{sec.label}</span>
                  <input
                    type="checkbox"
                    checked={(siteData.sections as any)[sec.key]}
                    onChange={(e) =>
                      setSiteData({
                        ...siteData,
                        sections: { ...siteData.sections, [sec.key]: e.target.checked },
                      })
                    }
                    className="w-4 h-4 rounded text-blue-900 focus:ring-blue-800"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {/* TAB: MESSAGES */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Mensagens e Pedidos Recebidos</h3>
            {siteData.messages.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                Nenhuma mensagem recebida ainda pelo formulário do site.
              </div>
            ) : (
              <div className="space-y-3">
                {siteData.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`bg-white rounded-2xl border p-5 shadow-sm transition-all ${
                      msg.read ? 'border-slate-200' : 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">{msg.name}</h4>
                          {!msg.read && (
                            <span className="text-[10px] bg-blue-900 text-white font-bold px-2 py-0.5 rounded">
                              Nova
                            </span>
                          )}
                          <span className="text-xs text-slate-400">
                            {new Date(msg.createdAt).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-1">
                          <span className="font-semibold text-emerald-700">Tel: {msg.phone}</span>
                          {msg.email && <span>Email: {msg.email}</span>}
                          {msg.neighborhood && <span>Local: {msg.neighborhood}</span>}
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                            {msg.serviceInterest}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/${msg.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Olá ${msg.name}! Vi sua mensagem no site da Rocha Climatização sobre ${msg.serviceInterest}. Como posso te ajudar?`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-sm"
                        >
                          <MessageSquare className="w-3.5 h-3.5 fill-current" />
                          <span>WhatsApp</span>
                        </a>

                        {!msg.read && (
                          <button
                            onClick={async () => {
                              await markAdminMessageRead(msg.id);
                              await loadFullData();
                            }}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                          >
                            Marcar lida
                          </button>
                        )}

                        <button
                          onClick={async () => {
                            if (confirm('Excluir esta mensagem?')) {
                              await deleteAdminMessage(msg.id);
                              await loadFullData();
                              showFeedback('Mensagem excluída');
                            }
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl">
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: LIVE CHAT AGENT CONSOLE */}
        {activeTab === 'chat' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm h-[650px] flex">
            {/* Conversations list sidebar */}
            <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50">
              <div className="p-4 border-b border-slate-200 bg-white">
                <h4 className="font-bold text-sm text-slate-900">Conversas ao Vivo</h4>
                <p className="text-xs text-slate-500">Visitantes que abriram o chat no site</p>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {siteData.chatConversations.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">Nenhum chat aberto ainda</div>
                ) : (
                  siteData.chatConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => {
                        setActiveChatId(conv.id);
                        if (chatSocketRef.current?.readyState === WebSocket.OPEN) {
                          chatSocketRef.current.send(
                            JSON.stringify({ type: 'chat:mark_read', conversationId: conv.id, by: 'admin' })
                          );
                        }
                      }}
                      className={`w-full text-left p-3.5 transition-colors flex items-start justify-between ${
                        activeChatId === conv.id ? 'bg-blue-50 border-l-4 border-blue-900' : 'hover:bg-slate-100'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-900 truncate">{conv.visitorName}</span>
                          {conv.unreadAdminCount > 0 && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                          )}
                        </div>
                        {conv.visitorPhone && (
                          <p className="text-[10px] text-emerald-700 font-semibold">{conv.visitorPhone}</p>
                        )}
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {conv.messages[conv.messages.length - 1]?.text || 'Sem mensagens'}
                        </p>
                      </div>
                      <span className="text-[9px] text-slate-400 shrink-0">
                        {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Conversation active view */}
            <div className="flex-1 flex flex-col bg-white">
              {activeChatId ? (
                (() => {
                  const currentConv = siteData.chatConversations.find((c) => c.id === activeChatId);
                  if (!currentConv) return <div className="p-8">Selecione uma conversa</div>;

                  return (
                    <>
                      {/* Chat Header */}
                      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                            <span>{currentConv.visitorName}</span>
                            {currentConv.visitorPhone && (
                              <span className="text-xs text-emerald-700 font-normal">
                                ({currentConv.visitorPhone})
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-slate-500">ID da Sessão: {currentConv.id}</p>
                        </div>

                        {currentConv.visitorPhone && (
                          <a
                            href={`https://wa.me/${currentConv.visitorPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                              `Olá ${currentConv.visitorName}! Estamos acompanhando sua solicitação no chat do site da Rocha Climatização.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm"
                          >
                            <MessageSquare className="w-3.5 h-3.5 fill-current" />
                            <span>Continuar no WhatsApp</span>
                          </a>
                        )}
                      </div>

                      {/* Messages body */}
                      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40">
                        {currentConv.messages.map((m) => {
                          const isAgent = m.sender === 'agent';
                          const isSystem = m.sender === 'system';

                          if (isSystem) {
                            return (
                              <div key={m.id} className="text-center my-2 text-[11px] text-slate-400">
                                {m.text}
                              </div>
                            );
                          }

                          return (
                            <div
                              key={m.id}
                              className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}
                            >
                              <div className="text-[10px] text-slate-400 mb-0.5 px-1">
                                {m.senderName} · {new Date(m.timestamp).toLocaleTimeString()}
                              </div>
                              <div
                                className={`rounded-xl px-3.5 py-2 text-xs max-w-[80%] ${
                                  isAgent
                                    ? 'bg-blue-900 text-white rounded-tr-none'
                                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                                }`}
                              >
                                {m.text}
                              </div>
                            </div>
                          );
                        })}
                        <div ref={chatBottomRef} />
                      </div>

                      {/* Reply Box */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!chatReplyText.trim()) return;

                          if (chatSocketRef.current?.readyState === WebSocket.OPEN) {
                            chatSocketRef.current.send(
                              JSON.stringify({
                                type: 'chat:send',
                                conversationId: currentConv.id,
                                sender: 'agent',
                                senderName: 'Atendente Rocha',
                                text: chatReplyText.trim(),
                              })
                            );
                          }
                          setChatReplyText('');
                        }}
                        className="p-3 border-t border-slate-200 flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={chatReplyText}
                          onChange={(e) => setChatReplyText(e.target.value)}
                          placeholder="Digite sua resposta em tempo real..."
                          className="flex-1 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-700"
                        />
                        <button
                          type="submit"
                          disabled={!chatReplyText.trim()}
                          className="bg-blue-900 hover:bg-blue-800 disabled:opacity-40 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Responder</span>
                        </button>
                      </form>
                    </>
                  );
                })()
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 text-xs">
                  <MessageCircle className="w-10 h-10 text-slate-300 mb-2" />
                  <p>Selecione uma conversa ao lado para responder ao visitante em tempo real.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: SECURITY */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg space-y-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Alterar Senha do Administrador</h3>
            <p className="text-xs text-slate-500">
              Altere a senha de acesso ao painel /admin. A nova senha será criptografada no servidor via bcrypt.
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (newPw !== confirmPw) {
                  return showFeedback('A confirmação da nova senha não confere.', 'error');
                }
                if (newPw.length < 6) {
                  return showFeedback('A nova senha deve ter no mínimo 6 caracteres.', 'error');
                }

                try {
                  await changeAdminPassword(currentPw, newPw);
                  setCurrentPw('');
                  setNewPw('');
                  setConfirmPw('');
                  showFeedback('Senha alterada com sucesso!');
                } catch (err: any) {
                  showFeedback(err.message, 'error');
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Senha Atual *</label>
                <input
                  type="password"
                  required
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nova Senha *</label>
                <input
                  type="password"
                  required
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirmar Nova Senha *</label>
                <input
                  type="password"
                  required
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-sm transition-all"
              >
                Atualizar Senha
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
