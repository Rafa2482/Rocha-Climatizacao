import { SiteSettings, ServiceItem } from '../types/index.ts';

export function updatePageSEO(options: {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
  settings?: SiteSettings;
  service?: ServiceItem;
}) {
  const { title, description, image, path = window.location.pathname, settings, service } = options;

  const baseTitle = settings?.companyName || 'Rocha Climatização';
  const fullTitle = title ? `${title} | ${baseTitle}` : `${baseTitle} | Instalação, Manutenção e Higienização`;
  const defaultDesc =
    settings?.slogan
      ? `${settings.companyName} - ${settings.slogan} Instalação, manutenção e limpeza de ar-condicionado em São Paulo. Fale no WhatsApp.`
      : 'Serviços profissionais de instalação, manutenção e limpeza de ar-condicionado em São Paulo e região. Solicite seu orçamento pelo WhatsApp.';
  const finalDesc = description || defaultDesc;
  const currentUrl = `${window.location.origin}${path}`;
  const finalImage = image || (settings?.logoUrl ? `${window.location.origin}${settings.logoUrl}` : '');

  // Set Title
  document.title = fullTitle;

  // Set or create Meta tag
  const setMeta = (name: string, content: string, isProperty = false) => {
    const attr = isProperty ? 'property' : 'name';
    let el = document.querySelector(`meta[${attr}="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMeta('description', finalDesc);
  setMeta('og:title', fullTitle, true);
  setMeta('og:description', finalDesc, true);
  setMeta('og:url', currentUrl, true);
  setMeta('og:type', 'website', true);
  if (finalImage) setMeta('og:image', finalImage, true);
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', fullTitle);
  setMeta('twitter:description', finalDesc);
  if (finalImage) setMeta('twitter:image', finalImage);

  // Canonical tag
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', currentUrl);

  // Inject or update Schema.org LocalBusiness JSON-LD
  let schemaScript = document.getElementById('rocha-schema-jsonld') as HTMLScriptElement | null;
  if (!schemaScript) {
    schemaScript = document.createElement('script');
    schemaScript.id = 'rocha-schema-jsonld';
    schemaScript.type = 'application/ld+json';
    document.head.appendChild(schemaScript);
  }

  const structuredData: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'HVACBusiness',
    '@id': `${window.location.origin}/#business`,
    name: settings?.companyName || 'Rocha Construção e Climatização',
    alternateName: settings?.tradeName || 'Rocha Climatização',
    url: window.location.origin,
    logo: `${window.location.origin}${settings?.logoUrl || '/favicon.png'}`,
    image: finalImage,
    description: finalDesc,
    telephone: settings?.phone1 ? `+55-${settings.phone1.replace(/\D/g, '')}` : '+55-11-999685162',
    email: settings?.email || 'contato@rochaclimatizacao.com.br',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressLocality: settings?.city || 'São Paulo',
      addressRegion: settings?.state || 'SP',
      addressCountry: 'BR',
      streetAddress: settings?.address || 'São Paulo e Região Metropolitana',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -23.5505,
      longitude: -46.6333,
    },
    areaServed: [
      { '@type': 'City', name: 'São Paulo' },
      { '@type': 'AdministrativeArea', name: 'Grande São Paulo' },
      { '@type': 'City', name: 'Barueri' },
      { '@type': 'City', name: 'Osasco' },
      { '@type': 'City', name: 'Santo André' },
      { '@type': 'City', name: 'São Bernardo do Campo' },
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '08:00',
        closes: '19:00',
      },
    ],
  };

  if (service) {
    structuredData.makesOffer = {
      '@type': 'Offer',
      name: service.title,
      description: service.shortDescription,
      price: service.priceValue || 0,
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
    };
  }

  schemaScript.textContent = JSON.stringify(structuredData);
}
