import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { SiteData, ContactMessage, ChatConversation } from '../src/types/index.ts';
import { defaultSiteData } from './defaultData.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'site-data.json');
const AUTH_FILE = path.join(DATA_DIR, 'auth.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface AdminAuth {
  id: string;
  email: string;
  secondaryEmail?: string;
  name: string;
  passwordHash: string;
}

export class DatabaseService {
  private data: SiteData;
  private auth: AdminAuth;

  constructor() {
    this.data = this.loadData();
    this.auth = this.loadAuth();
  }

  private loadData(): SiteData {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const content = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        return {
          ...defaultSiteData,
          ...parsed,
          settings: { ...defaultSiteData.settings, ...(parsed.settings || {}) },
          texts: { ...defaultSiteData.texts, ...(parsed.texts || {}) },
          sections: { ...defaultSiteData.sections, ...(parsed.sections || {}) },
          services: parsed.services || defaultSiteData.services,
          prices: parsed.prices || defaultSiteData.prices,
          products: parsed.products || defaultSiteData.products || [],
          gallery: parsed.gallery || defaultSiteData.gallery,
          testimonials: parsed.testimonials || defaultSiteData.testimonials,
          messages: parsed.messages || [],
          chatConversations: parsed.chatConversations || [],
        };
      }
    } catch (err) {
      console.error('Error loading site data, falling back to defaults:', err);
    }
    // Save defaults
    this.saveDataDirect(defaultSiteData);
    return defaultSiteData;
  }

  private loadAuth(): AdminAuth {
    try {
      if (fs.existsSync(AUTH_FILE)) {
        const content = fs.readFileSync(AUTH_FILE, 'utf-8');
        return JSON.parse(content);
      }
    } catch (err) {
      console.error('Error loading auth, creating default admin:', err);
    }

    // Default admin: password "Rocha@2026!"
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('Rocha@2026!', salt);

    const defaultAuth: AdminAuth = {
      id: 'admin_1',
      email: 'admin@rochaclimatizacao.com.br',
      secondaryEmail: 'rafaelrodriguesrocha415@gmail.com',
      name: 'Administrador Rocha',
      passwordHash,
    };

    fs.writeFileSync(AUTH_FILE, JSON.stringify(defaultAuth, null, 2), 'utf-8');
    return defaultAuth;
  }

  private saveDataDirect(data: SiteData) {
    const tempFile = `${DATA_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DATA_FILE);
  }

  public getData(): SiteData {
    return this.data;
  }

  public updateData(updater: (current: SiteData) => SiteData): SiteData {
    const next = updater(this.data);
    this.data = next;
    this.saveDataDirect(this.data);
    return this.data;
  }

  public getAuth(): AdminAuth {
    return this.auth;
  }

  public verifyPassword(candidate: string): boolean {
    return bcrypt.compareSync(candidate, this.auth.passwordHash);
  }

  public changePassword(newPassword: string): void {
    const salt = bcrypt.genSaltSync(10);
    this.auth.passwordHash = bcrypt.hashSync(newPassword, salt);
    fs.writeFileSync(AUTH_FILE, JSON.stringify(this.auth, null, 2), 'utf-8');
  }

  public updateAdminEmail(email: string, name?: string): void {
    this.auth.email = email;
    if (name) this.auth.name = name;
    fs.writeFileSync(AUTH_FILE, JSON.stringify(this.auth, null, 2), 'utf-8');
  }

  public addContactMessage(message: Omit<ContactMessage, 'id' | 'createdAt' | 'read'>): ContactMessage {
    const newMsg: ContactMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...message,
      createdAt: new Date().toISOString(),
      read: false,
    };
    this.updateData((data) => ({
      ...data,
      messages: [newMsg, ...data.messages],
    }));
    return newMsg;
  }

  public markMessageAsRead(id: string): void {
    this.updateData((data) => ({
      ...data,
      messages: data.messages.map((m) => (m.id === id ? { ...m, read: true } : m)),
    }));
  }

  public deleteMessage(id: string): void {
    this.updateData((data) => ({
      ...data,
      messages: data.messages.filter((m) => m.id !== id),
    }));
  }

  // Live Chat persistence
  public getOrCreateConversation(id: string, visitorName: string, phone?: string, email?: string): ChatConversation {
    let conv = this.data.chatConversations.find((c) => c.id === id);
    if (!conv) {
      conv = {
        id,
        visitorName: visitorName || 'Visitante',
        visitorPhone: phone,
        visitorEmail: email,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        unreadAdminCount: 0,
        unreadVisitorCount: 0,
        messages: [
          {
            id: `msg_init_${Date.now()}`,
            sender: 'system',
            senderName: 'Rocha Climatização',
            text: 'Olá! Bem-vindo(a) à Rocha Climatização. Em que podemos ajudar hoje? Você também pode solicitar um orçamento direto pelo WhatsApp!',
            timestamp: new Date().toISOString(),
          },
        ],
      };
      this.updateData((data) => ({
        ...data,
        chatConversations: [conv!, ...data.chatConversations],
      }));
    }
    return conv;
  }

  public addChatMessage(
    conversationId: string,
    sender: 'visitor' | 'agent' | 'system',
    senderName: string,
    text: string
  ): ChatConversation {
    const now = new Date().toISOString();
    const newMsg = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sender,
      senderName,
      text,
      timestamp: now,
    };

    let targetConv: ChatConversation | undefined;

    this.updateData((data) => {
      const conversations = data.chatConversations.map((c) => {
        if (c.id === conversationId) {
          const unreadAdmin = sender === 'visitor' ? c.unreadAdminCount + 1 : c.unreadAdminCount;
          const unreadVisitor = sender === 'agent' ? c.unreadVisitorCount + 1 : c.unreadVisitorCount;
          targetConv = {
            ...c,
            updatedAt: now,
            unreadAdminCount: unreadAdmin,
            unreadVisitorCount: unreadVisitor,
            messages: [...c.messages, newMsg],
          };
          return targetConv;
        }
        return c;
      });

      return {
        ...data,
        chatConversations: conversations,
      };
    });

    return targetConv || this.getOrCreateConversation(conversationId, senderName);
  }

  public markConversationRead(conversationId: string, by: 'admin' | 'visitor'): void {
    this.updateData((data) => ({
      ...data,
      chatConversations: data.chatConversations.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            unreadAdminCount: by === 'admin' ? 0 : c.unreadAdminCount,
            unreadVisitorCount: by === 'visitor' ? 0 : c.unreadVisitorCount,
          };
        }
        return c;
      }),
    }));
  }
}

export const db = new DatabaseService();
