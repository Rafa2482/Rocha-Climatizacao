import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.ts';
import { ServiceItem, PriceItem, ProductItem, GalleryItem, TestimonialItem } from './src/types/index.ts';

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'rocha_super_secret_jwt_key_2026';

const app = express();
const server = http.createServer(app);

// Configure multer for persistent file uploads
const uploadDir = path.resolve(process.cwd(), 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const cleanBase = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_');
    cb(null, `${cleanBase}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve public directory
app.use(express.static(path.resolve(process.cwd(), 'public')));

// Setup WebSocket server for Real-Time Chat
const wss = new WebSocketServer({ server });

interface ClientSocket extends WebSocket {
  conversationId?: string;
  isAdmin?: boolean;
}

const clients = new Set<ClientSocket>();

wss.on('connection', (ws: ClientSocket) => {
  clients.add(ws);

  ws.on('message', (data: string) => {
    try {
      const msg = JSON.parse(data.toString());
      switch (msg.type) {
        case 'join': {
          ws.conversationId = msg.conversationId;
          ws.isAdmin = !!msg.isAdmin;
          // Send current conversation state
          const conv = db.getData().chatConversations.find((c) => c.id === msg.conversationId);
          if (conv) {
            ws.send(JSON.stringify({ type: 'sync:conversation', conversation: conv }));
          }
          break;
        }

        case 'admin:watch': {
          ws.isAdmin = true;
          ws.send(JSON.stringify({ type: 'sync:all_chats', chats: db.getData().chatConversations }));
          break;
        }

        case 'chat:send': {
          const { conversationId, sender, senderName, text } = msg;
          if (!conversationId || !text) return;

          const updatedConv = db.addChatMessage(conversationId, sender, senderName || 'Usuário', text);

          // Broadcast to everyone in this conversation
          const broadcastPayload = JSON.stringify({
            type: 'message:new',
            conversationId,
            conversation: updatedConv,
          });

          for (const client of clients) {
            if (client.readyState === WebSocket.OPEN) {
              if (client.conversationId === conversationId || client.isAdmin) {
                client.send(broadcastPayload);
              }
            }
          }
          break;
        }

        case 'chat:mark_read': {
          const { conversationId, by } = msg;
          if (conversationId) {
            db.markConversationRead(conversationId, by || 'visitor');
            const conv = db.getData().chatConversations.find((c) => c.id === conversationId);
            if (conv) {
              const payload = JSON.stringify({ type: 'sync:conversation', conversation: conv });
              for (const client of clients) {
                if (client.readyState === WebSocket.OPEN && (client.conversationId === conversationId || client.isAdmin)) {
                  client.send(payload);
                }
              }
            }
          }
          break;
        }
      }
    } catch (e) {
      console.error('WebSocket message parsing error:', e);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});

// Authentication Middleware for /api/admin/*
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acesso não autorizado. Faça login primeiro.' });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Sessão expirada ou token inválido. Faça login novamente.' });
  }
}

/* ==========================================================================
   PUBLIC API ENDPOINTS
   ========================================================================== */

// Public site data
app.get('/api/site-data', (_req, res) => {
  const data = db.getData();
  // Return public subset
  res.json({
    settings: data.settings,
    texts: data.texts,
    sections: data.sections,
    services: data.services.filter((s) => s.visible).sort((a, b) => a.order - b.order),
    prices: data.prices.filter((p) => p.visible).sort((a, b) => a.order - b.order),
    products: (data.products || []).filter((p) => p.visible).sort((a, b) => a.order - b.order),
    gallery: data.gallery.filter((g) => g.visible).sort((a, b) => a.order - b.order),
    testimonials: data.testimonials.filter((t) => t.visible),
  });
});

// Submit contact form
app.post('/api/contact', (req, res) => {
  const { name, phone, email, serviceInterest, neighborhood, message } = req.body;
  if (!name || !phone || !message) {
    return res.status(400).json({ error: 'Nome, telefone e mensagem são obrigatórios.' });
  }

  const created = db.addContactMessage({
    name,
    phone,
    email: email || '',
    serviceInterest: serviceInterest || 'Geral',
    neighborhood: neighborhood || '',
    message,
  });

  res.json({ success: true, message: 'Mensagem enviada com sucesso! Entraremos em contato.', data: created });
});

// Start or get chat conversation
app.post('/api/chat/init', (req, res) => {
  const { conversationId, visitorName, phone, email } = req.body;
  const id = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const conv = db.getOrCreateConversation(id, visitorName, phone, email);
  res.json({ conversation: conv });
});

// Admin Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  const auth = db.getAuth();
  const emailMatch =
    email.toLowerCase() === auth.email.toLowerCase() ||
    (auth.secondaryEmail && email.toLowerCase() === auth.secondaryEmail.toLowerCase());

  if (!emailMatch) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
  }

  const validPassword = db.verifyPassword(password);
  if (!validPassword) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
  }

  const token = jwt.sign(
    { id: auth.id, email: auth.email, name: auth.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: { id: auth.id, email: auth.email, name: auth.name },
  });
});

// Admin verify session
app.get('/api/auth/me', authMiddleware, (req: any, res) => {
  const auth = db.getAuth();
  res.json({
    user: { id: auth.id, email: auth.email, name: auth.name },
  });
});

// Change Password
app.post('/api/auth/change-password', authMiddleware, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Preencha a senha atual e a nova senha.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' });
  }

  const valid = db.verifyPassword(currentPassword);
  if (!valid) {
    return res.status(400).json({ error: 'Senha atual incorreta.' });
  }

  db.changePassword(newPassword);
  res.json({ success: true, message: 'Senha alterada com sucesso!' });
});

/* ==========================================================================
   ADMIN MANAGEMENT ENDPOINTS (PROTECTED)
   ========================================================================== */

// Full site data for admin
app.get('/api/admin/site-data', authMiddleware, (_req, res) => {
  res.json(db.getData());
});

// Update Settings
app.put('/api/admin/settings', authMiddleware, (req, res) => {
  const newSettings = { ...req.body };

  if (typeof newSettings.phone1 === 'string') {
    const d1 = newSettings.phone1.replace(/\D/g, '');
    if (d1) {
      newSettings.phone1Raw = (d1.length === 10 || d1.length === 11) && !d1.startsWith('55') ? `55${d1}` : d1;
    }
  }

  if (typeof newSettings.phone2 === 'string') {
    const d2 = newSettings.phone2.replace(/\D/g, '');
    if (d2) {
      newSettings.phone2Raw = (d2.length === 10 || d2.length === 11) && !d2.startsWith('55') ? `55${d2}` : d2;
    }
  }

  const updated = db.updateData((data) => ({
    ...data,
    settings: { ...data.settings, ...newSettings },
  }));
  res.json({ success: true, settings: updated.settings });
});

// Update Texts
app.put('/api/admin/texts', authMiddleware, (req, res) => {
  const updated = db.updateData((data) => ({
    ...data,
    texts: { ...data.texts, ...req.body },
  }));
  res.json({ success: true, texts: updated.texts });
});

// Update Section Toggles
app.put('/api/admin/sections', authMiddleware, (req, res) => {
  const updated = db.updateData((data) => ({
    ...data,
    sections: { ...data.sections, ...req.body },
  }));
  res.json({ success: true, sections: updated.sections });
});

// Services CRUD
app.post('/api/admin/services', authMiddleware, (req, res) => {
  const serviceData = req.body;
  const newService: ServiceItem = {
    id: `srv_${Date.now()}`,
    slug:
      serviceData.slug ||
      serviceData.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, ''),
    title: serviceData.title,
    shortDescription: serviceData.shortDescription || '',
    fullDescription: serviceData.fullDescription || '',
    category: serviceData.category || 'Climatização',
    imageUrl: serviceData.imageUrl || '/src/assets/images/hero_ac_split_living_1792728720151.jpg',
    priceType: serviceData.priceType || 'sob_consulta',
    priceValue: serviceData.priceValue,
    priceMax: serviceData.priceMax,
    priceObservation: serviceData.priceObservation,
    includedFeatures: Array.isArray(serviceData.includedFeatures) ? serviceData.includedFeatures : [],
    visible: serviceData.visible ?? true,
    order: serviceData.order ?? 99,
    whatsappCustomMsg: serviceData.whatsappCustomMsg,
  };

  db.updateData((data) => ({
    ...data,
    services: [...data.services, newService],
  }));

  res.json({ success: true, service: newService });
});

app.put('/api/admin/services/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  let found = false;

  db.updateData((data) => {
    const services = data.services.map((s) => {
      if (s.id === id) {
        found = true;
        return { ...s, ...req.body, id };
      }
      return s;
    });
    return { ...data, services };
  });

  if (!found) return res.status(404).json({ error: 'Serviço não encontrado.' });
  res.json({ success: true });
});

app.delete('/api/admin/services/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  db.updateData((data) => ({
    ...data,
    services: data.services.filter((s) => s.id !== id),
  }));
  res.json({ success: true });
});

app.post('/api/admin/services/reorder', authMiddleware, (req, res) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) return res.status(400).json({ error: 'orderedIds obrigatório' });

  db.updateData((data) => {
    const serviceMap = new Map(data.services.map((s) => [s.id, s]));
    const reordered: ServiceItem[] = [];
    orderedIds.forEach((id, index) => {
      const s = serviceMap.get(id);
      if (s) {
        reordered.push({ ...s, order: index + 1 });
        serviceMap.delete(id);
      }
    });
    // Add any remaining
    serviceMap.forEach((s) => reordered.push(s));
    return { ...data, services: reordered };
  });

  res.json({ success: true });
});

// Prices CRUD
app.post('/api/admin/prices', authMiddleware, (req, res) => {
  const priceData = req.body;
  const newPrice: PriceItem = {
    id: `prc_${Date.now()}`,
    serviceName: priceData.serviceName,
    serviceId: priceData.serviceId,
    priceType: priceData.priceType || 'sob_consulta',
    priceValue: priceData.priceValue,
    priceMax: priceData.priceMax,
    unit: priceData.unit || 'por aparelho',
    description: priceData.description || '',
    observation: priceData.observation,
    includedItems: Array.isArray(priceData.includedItems) ? priceData.includedItems : [],
    notIncludedItems: Array.isArray(priceData.notIncludedItems) ? priceData.notIncludedItems : [],
    popular: !!priceData.popular,
    order: priceData.order ?? 99,
    visible: priceData.visible ?? true,
  };

  db.updateData((data) => ({
    ...data,
    prices: [...data.prices, newPrice],
  }));

  res.json({ success: true, price: newPrice });
});

app.put('/api/admin/prices/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  db.updateData((data) => ({
    ...data,
    prices: data.prices.map((p) => (p.id === id ? { ...p, ...req.body, id } : p)),
  }));
  res.json({ success: true });
});

app.delete('/api/admin/prices/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  db.updateData((data) => ({
    ...data,
    prices: data.prices.filter((p) => p.id !== id),
  }));
  res.json({ success: true });
});

// Products CRUD
app.post('/api/admin/products', authMiddleware, (req, res) => {
  const p = req.body;
  const newProduct: ProductItem = {
    id: `prod_${Date.now()}`,
    name: p.name || 'Novo Produto',
    category: p.category || 'Split Hi-Wall',
    brand: p.brand || 'Rocha Climatização',
    imageUrl: p.imageUrl || '/src/assets/images/ac_split_inverter_1792776578343.jpg',
    price: Number(p.price) || 0,
    oldPrice: p.oldPrice ? Number(p.oldPrice) : undefined,
    priceObservation: p.priceObservation || '',
    badge: p.badge || '',
    btus: p.btus || '',
    voltage: p.voltage || '220V',
    cycle: p.cycle || 'Frio',
    specifications: Array.isArray(p.specifications) ? p.specifications : [],
    description: p.description || '',
    inStock: p.inStock ?? true,
    visible: p.visible ?? true,
    order: p.order ?? 99,
    whatsappCustomMsg: p.whatsappCustomMsg || '',
  };

  db.updateData((data) => ({
    ...data,
    products: [...(data.products || []), newProduct],
  }));

  res.json({ success: true, product: newProduct });
});

app.put('/api/admin/products/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  let found = false;

  db.updateData((data) => {
    const products = (data.products || []).map((prod) => {
      if (prod.id === id) {
        found = true;
        return {
          ...prod,
          ...req.body,
          id,
          price: req.body.price !== undefined ? Number(req.body.price) : prod.price,
          oldPrice: req.body.oldPrice !== undefined ? (req.body.oldPrice ? Number(req.body.oldPrice) : undefined) : prod.oldPrice,
          specifications: Array.isArray(req.body.specifications) ? req.body.specifications : prod.specifications,
        };
      }
      return prod;
    });
    return { ...data, products };
  });

  if (!found) return res.status(404).json({ error: 'Produto não encontrado.' });
  res.json({ success: true });
});

app.delete('/api/admin/products/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  db.updateData((data) => ({
    ...data,
    products: (data.products || []).filter((p) => p.id !== id),
  }));
  res.json({ success: true });
});

app.post('/api/admin/products/reorder', authMiddleware, (req, res) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) return res.status(400).json({ error: 'orderedIds obrigatório' });

  db.updateData((data) => {
    const prodMap = new Map((data.products || []).map((p) => [p.id, p]));
    const reordered: ProductItem[] = [];
    orderedIds.forEach((id, index) => {
      const p = prodMap.get(id);
      if (p) {
        reordered.push({ ...p, order: index + 1 });
        prodMap.delete(id);
      }
    });
    prodMap.forEach((p) => reordered.push(p));
    return { ...data, products: reordered };
  });

  res.json({ success: true });
});

// Gallery CRUD
app.post('/api/admin/gallery', authMiddleware, (req, res) => {
  const item = req.body;
  const newGallery: GalleryItem = {
    id: `gal_${Date.now()}`,
    title: item.title,
    description: item.description || '',
    serviceType: item.serviceType || 'Climatização',
    imageUrl: item.imageUrl,
    date: item.date || new Date().toLocaleDateString('pt-BR'),
    location: item.location || 'São Paulo - SP',
    order: item.order ?? 99,
    visible: item.visible ?? true,
  };

  db.updateData((data) => ({
    ...data,
    gallery: [...data.gallery, newGallery],
  }));

  res.json({ success: true, gallery: newGallery });
});

app.put('/api/admin/gallery/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  db.updateData((data) => ({
    ...data,
    gallery: data.gallery.map((g) => (g.id === id ? { ...g, ...req.body, id } : g)),
  }));
  res.json({ success: true });
});

app.delete('/api/admin/gallery/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  db.updateData((data) => ({
    ...data,
    gallery: data.gallery.filter((g) => g.id !== id),
  }));
  res.json({ success: true });
});

// Testimonials CRUD
app.post('/api/admin/testimonials', authMiddleware, (req, res) => {
  const item = req.body;
  const newTestimonial: TestimonialItem = {
    id: `test_${Date.now()}`,
    name: item.name,
    neighborhood: item.neighborhood,
    serviceRendered: item.serviceRendered || 'Climatização',
    rating: Number(item.rating) || 5,
    comment: item.comment,
    date: item.date || new Date().toLocaleDateString('pt-BR'),
    visible: item.visible ?? true,
  };

  db.updateData((data) => ({
    ...data,
    testimonials: [...data.testimonials, newTestimonial],
  }));

  res.json({ success: true, testimonial: newTestimonial });
});

app.put('/api/admin/testimonials/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  db.updateData((data) => ({
    ...data,
    testimonials: data.testimonials.map((t) => (t.id === id ? { ...t, ...req.body, id } : t)),
  }));
  res.json({ success: true });
});

app.delete('/api/admin/testimonials/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  db.updateData((data) => ({
    ...data,
    testimonials: data.testimonials.filter((t) => t.id !== id),
  }));
  res.json({ success: true });
});

// Messages management
app.get('/api/admin/messages', authMiddleware, (_req, res) => {
  res.json({ messages: db.getData().messages });
});

app.put('/api/admin/messages/:id/read', authMiddleware, (req, res) => {
  db.markMessageAsRead(req.params.id);
  res.json({ success: true });
});

app.delete('/api/admin/messages/:id', authMiddleware, (req, res) => {
  db.deleteMessage(req.params.id);
  res.json({ success: true });
});

// Live Chat admin endpoint
app.get('/api/admin/chats', authMiddleware, (_req, res) => {
  res.json({ chats: db.getData().chatConversations });
});

// Upload image endpoint
app.post('/api/admin/upload', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }
  const publicUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    url: publicUrl,
    filename: req.file.filename,
    size: req.file.size,
  });
});

/* ==========================================================================
   DYNAMIC SEO: SITEMAP.XML & ROBOTS.TXT
   ========================================================================== */

app.get('/robots.txt', (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers['x-forwarded-host'] || req.get('host');
  const baseUrl = `${protocol}://${host}`;

  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`;
  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

app.get('/sitemap.xml', (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers['x-forwarded-host'] || req.get('host');
  const baseUrl = `${protocol}://${host}`;
  const now = new Date().toISOString().split('T')[0];

  const data = db.getData();
  const visibleServices = data.services.filter((s) => s.visible);

  const staticUrls = [
    { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'weekly' },
    { loc: `${baseUrl}/servicos`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${baseUrl}/precos`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${baseUrl}/galeria`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${baseUrl}/sobre`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${baseUrl}/contato`, priority: '0.8', changefreq: 'monthly' },
  ];

  const serviceUrls = visibleServices.map((s) => ({
    loc: `${baseUrl}/servicos/${s.slug}`,
    priority: '0.85',
    changefreq: 'monthly',
  }));

  const allUrls = [...staticUrls, ...serviceUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

/* ==========================================================================
   VITE DEV MIDDLEWARE / STATIC ASSETS
   ========================================================================== */

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`> Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
