export interface SiteSettings {
  companyName: string;
  tradeName: string;
  slogan: string;
  subSlogan: string;
  phone1: string;
  phone1Raw: string;
  phone2: string;
  phone2Raw: string;
  email: string;
  address: string;
  city: string;
  state: string;
  serviceArea: string;
  businessHours: string;
  instagramUrl: string;
  facebookUrl: string;
  logoUrl: string;
  faviconUrl: string;
  heroBannerUrl: string;
  specialistName: string;
  specialistRole: string;
  primaryColor: string;
  secondaryColor: string;
  primaryWhatsapp?: 'phone1' | 'phone2';
}

export type PriceType = 'fixo' | 'a_partir' | 'faixa' | 'sob_consulta';

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  imageUrl: string;
  priceType: PriceType;
  priceValue?: number;
  priceMax?: number;
  priceObservation?: string;
  includedFeatures: string[];
  visible: boolean;
  order: number;
  whatsappCustomMsg?: string;
}

export interface PriceItem {
  id: string;
  serviceId?: string;
  serviceName: string;
  priceType: PriceType;
  priceValue?: number;
  priceMax?: number;
  unit?: string; // ex: "por ponto", "por aparelho"
  description: string;
  observation?: string;
  includedItems: string[];
  notIncludedItems?: string[];
  popular?: boolean;
  order: number;
  visible: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  serviceType: string;
  imageUrl: string;
  date?: string;
  location?: string;
  order: number;
  visible: boolean;
}

export interface TestimonialItem {
  id: string;
  name: string;
  neighborhood?: string;
  serviceRendered: string;
  rating: number; // 1 - 5
  comment: string;
  date: string;
  visible: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email?: string;
  serviceInterest: string;
  neighborhood?: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface SiteTexts {
  heroTitle: string;
  heroSubtitle: string;
  heroComplement: string;
  heroCtaWhatsapp: string;
  heroCtaServices: string;
  servicesTitle: string;
  servicesSubtitle: string;
  pricesTitle: string;
  pricesSubtitle: string;
  galleryTitle: string;
  gallerySubtitle: string;
  aboutTitle: string;
  aboutStory: string;
  aboutMission: string;
  aboutDifferentials: string[];
  contactTitle: string;
  contactSubtitle: string;
  footerDisclaimer: string;
  whatsappFloatingText: string;
}

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  brand?: string;
  imageUrl: string;
  price: number;
  oldPrice?: number;
  priceObservation?: string;
  badge?: string;
  btus?: string;
  voltage?: string;
  cycle?: string;
  specifications: string[];
  description?: string;
  inStock: boolean;
  visible: boolean;
  order: number;
  whatsappCustomMsg?: string;
}

export interface SectionToggles {
  hero: boolean;
  alertBanner: boolean;
  productsCarousel: boolean;
  services: boolean;
  prices: boolean;
  gallery: boolean;
  about: boolean;
  testimonials: boolean;
  differentials: boolean;
  faq: boolean;
  contact: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'visitor' | 'agent' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface ChatConversation {
  id: string;
  visitorName: string;
  visitorPhone?: string;
  visitorEmail?: string;
  status: 'active' | 'resolved' | 'waiting_agent';
  createdAt: string;
  updatedAt: string;
  unreadAdminCount: number;
  unreadVisitorCount: number;
  messages: ChatMessage[];
}

export interface SiteData {
  settings: SiteSettings;
  services: ServiceItem[];
  prices: PriceItem[];
  products: ProductItem[];
  gallery: GalleryItem[];
  testimonials: TestimonialItem[];
  texts: SiteTexts;
  sections: SectionToggles;
  messages: ContactMessage[];
  chatConversations: ChatConversation[];
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}
