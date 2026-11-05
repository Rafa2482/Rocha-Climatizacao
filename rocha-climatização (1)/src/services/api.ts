import { SiteData, SiteSettings, SiteTexts, SectionToggles, ServiceItem, PriceItem, ProductItem, GalleryItem, TestimonialItem, ContactMessage, ChatConversation } from '../types/index.ts';

const TOKEN_KEY = 'rocha_admin_token';

export function getAdminToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function getAuthHeaders(): HeadersInit {
  const token = getAdminToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchPublicSiteData(): Promise<SiteData> {
  const res = await fetch('/api/site-data');
  if (!res.ok) throw new Error('Falha ao carregar dados do site');
  return res.json();
}

export async function submitContactForm(payload: {
  name: string;
  phone: string;
  email?: string;
  serviceInterest?: string;
  neighborhood?: string;
  message: string;
}) {
  const res = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao enviar mensagem');
  return data;
}

export async function initChat(payload: {
  conversationId?: string;
  visitorName?: string;
  phone?: string;
  email?: string;
}): Promise<{ conversation: ChatConversation }> {
  const res = await fetch('/api/chat/init', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Erro ao iniciar chat');
  return res.json();
}

/* ==========================================================================
   ADMIN API CLIENT
   ========================================================================== */

export async function adminLogin(email: string, password: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Credenciais inválidas');
  setAdminToken(data.token);
  return data;
}

export async function verifyAdminSession() {
  const res = await fetch('/api/auth/me', {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Sessão expirada');
  return res.json();
}

export async function changeAdminPassword(currentPassword: string, newPassword: string) {
  const res = await fetch('/api/auth/change-password', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Falha ao alterar senha');
  return data;
}

export async function fetchAdminSiteData(): Promise<SiteData> {
  const res = await fetch('/api/admin/site-data', {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Não autorizado');
  return res.json();
}

export async function updateAdminSettings(settings: Partial<SiteSettings>) {
  const res = await fetch('/api/admin/settings', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(settings),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao atualizar configurações');
  return data;
}

export async function updateAdminTexts(texts: Partial<SiteTexts>) {
  const res = await fetch('/api/admin/texts', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(texts),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao atualizar textos');
  return data;
}

export async function updateAdminSections(sections: Partial<SectionToggles>) {
  const res = await fetch('/api/admin/sections', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(sections),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao atualizar seções');
  return data;
}

export async function createAdminService(service: Partial<ServiceItem>) {
  const res = await fetch('/api/admin/services', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(service),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao criar serviço');
  return data;
}

export async function updateAdminService(id: string, service: Partial<ServiceItem>) {
  const res = await fetch(`/api/admin/services/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(service),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao atualizar serviço');
  return data;
}

export async function deleteAdminService(id: string) {
  const res = await fetch(`/api/admin/services/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao excluir serviço');
  return data;
}

export async function reorderAdminServices(orderedIds: string[]) {
  const res = await fetch('/api/admin/services/reorder', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ orderedIds }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao reordenar');
  return data;
}

export async function createAdminPrice(price: Partial<PriceItem>) {
  const res = await fetch('/api/admin/prices', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(price),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao criar preço');
  return data;
}

export async function updateAdminPrice(id: string, price: Partial<PriceItem>) {
  const res = await fetch(`/api/admin/prices/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(price),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao atualizar preço');
  return data;
}

export async function deleteAdminPrice(id: string) {
  const res = await fetch(`/api/admin/prices/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao excluir preço');
  return data;
}

export async function createAdminProduct(product: Partial<ProductItem>) {
  const res = await fetch('/api/admin/products', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(product),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao criar produto');
  return data;
}

export async function updateAdminProduct(id: string, product: Partial<ProductItem>) {
  const res = await fetch(`/api/admin/products/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(product),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao atualizar produto');
  return data;
}

export async function deleteAdminProduct(id: string) {
  const res = await fetch(`/api/admin/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao excluir produto');
  return data;
}

export async function reorderAdminProducts(orderedIds: string[]) {
  const res = await fetch('/api/admin/products/reorder', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ orderedIds }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao reordenar produtos');
  return data;
}

export async function createAdminGallery(item: Partial<GalleryItem>) {
  const res = await fetch('/api/admin/gallery', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(item),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao criar item na galeria');
  return data;
}

export async function updateAdminGallery(id: string, item: Partial<GalleryItem>) {
  const res = await fetch(`/api/admin/gallery/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(item),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao atualizar item na galeria');
  return data;
}

export async function deleteAdminGallery(id: string) {
  const res = await fetch(`/api/admin/gallery/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao excluir item');
  return data;
}

export async function createAdminTestimonial(testimonial: Partial<TestimonialItem>) {
  const res = await fetch('/api/admin/testimonials', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(testimonial),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao criar depoimento');
  return data;
}

export async function updateAdminTestimonial(id: string, testimonial: Partial<TestimonialItem>) {
  const res = await fetch(`/api/admin/testimonials/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(testimonial),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao atualizar depoimento');
  return data;
}

export async function deleteAdminTestimonial(id: string) {
  const res = await fetch(`/api/admin/testimonials/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao excluir depoimento');
  return data;
}

export async function fetchAdminMessages(): Promise<{ messages: ContactMessage[] }> {
  const res = await fetch('/api/admin/messages', {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Erro ao buscar mensagens');
  return res.json();
}

export async function markAdminMessageRead(id: string) {
  const res = await fetch(`/api/admin/messages/${id}/read`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function deleteAdminMessage(id: string) {
  const res = await fetch(`/api/admin/messages/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function fetchAdminChats(): Promise<{ chats: ChatConversation[] }> {
  const res = await fetch('/api/admin/chats', {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Erro ao buscar conversas');
  return res.json();
}

export async function uploadImage(file: File): Promise<string> {
  const token = getAdminToken();
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Falha ao enviar imagem');
  return data.url;
}
