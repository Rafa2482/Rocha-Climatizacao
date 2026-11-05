/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SiteData, ServiceItem, ProductItem } from './types/index.ts';
import { fetchPublicSiteData } from './services/api.ts';
import { updatePageSEO } from './services/seo.ts';
import { Header } from './components/Header.tsx';
import { Hero } from './components/Hero.tsx';
import { ProductsCarousel } from './components/ProductsCarousel.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { AlertCampaign } from './components/AlertCampaign.tsx';
import { ServicesSection } from './components/ServicesSection.tsx';
import { PricingSection } from './components/PricingSection.tsx';
import { GallerySection } from './components/GallerySection.tsx';
import { AboutSection } from './components/AboutSection.tsx';
import { TestimonialsSection } from './components/TestimonialsSection.tsx';
import { FaqSection } from './components/FaqSection.tsx';
import { ContactSection } from './components/ContactSection.tsx';
import { Footer } from './components/Footer.tsx';
import { FloatingWhatsApp } from './components/FloatingWhatsApp.tsx';
import { LiveChatWidget } from './components/LiveChatWidget.tsx';
import { ServiceDetailModal } from './components/ServiceDetailModal.tsx';
import { WhatsAppBudgetModal } from './components/WhatsAppBudgetModal.tsx';
import { AdminPage } from './pages/AdminPage.tsx';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState<boolean>(false);
  const [budgetModalService, setBudgetModalService] = useState<string | undefined>(undefined);

  // Synchronize history state
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load public data on mount
  useEffect(() => {
    fetchPublicSiteData()
      .then((data) => {
        setSiteData(data);
        updatePageSEO({
          settings: data.settings,
          path: window.location.pathname,
        });

        // Check if path is a service slug e.g. /servicos/instalacao-de-ar-condicionado
        if (window.location.pathname.startsWith('/servicos/')) {
          const slug = window.location.pathname.replace('/servicos/', '');
          const match = data.services.find((s) => s.slug === slug);
          if (match) {
            setSelectedService(match);
            updatePageSEO({
              title: match.title,
              description: match.shortDescription,
              image: match.imageUrl,
              settings: data.settings,
              service: match,
            });
          }
        }
      })
      .catch((err) => console.error('Error fetching site data:', err))
      .finally(() => setLoading(false));
  }, []);

  // Handle SEO update when path changes
  useEffect(() => {
    if (!siteData) return;

    if (currentPath === '/admin') {
      document.title = 'Painel Administrativo | Rocha Climatização';
      return;
    }

    if (selectedService) {
      updatePageSEO({
        title: selectedService.title,
        description: selectedService.shortDescription,
        image: selectedService.imageUrl,
        settings: siteData.settings,
        service: selectedService,
      });
    } else {
      updatePageSEO({
        settings: siteData.settings,
        path: currentPath,
      });
    }
  }, [currentPath, selectedService, siteData]);

  // If path is /admin, render Admin Panel
  if (currentPath === '/admin') {
    return <AdminPage onBackToSite={() => navigate('/')} />;
  }

  if (loading || !siteData) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-bold">ROCHA CLIMATIZAÇÃO</h2>
        <p className="text-xs text-slate-400 mt-1">Carregando soluções em conforto térmico...</p>
      </div>
    );
  }

  const { settings, texts, sections, services, prices, products, gallery, testimonials } = siteData;

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-amber-400 selection:text-slate-900 font-sans">
      {/* Header */}
      <Header
        settings={settings}
        activePath={currentPath}
        onNavigate={navigate}
        onOpenBudgetModal={(srv) => {
          setBudgetModalService(srv);
          setIsBudgetModalOpen(true);
        }}
      />

      <main className="flex-1">
        {/* Hero Section */}
        {sections.hero && (
          <Hero
            settings={settings}
            texts={texts}
            onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
          />
        )}

        {/* Products Carousel - Showcase de Ar-Condicionado & Equipamentos */}
        {(sections.productsCarousel ?? true) && (
          <ProductsCarousel
            products={products || []}
            settings={settings}
            onOpenProductDetail={(prod) => setSelectedProduct(prod)}
            onOpenBudgetModal={(srv) => {
              setBudgetModalService(srv);
              setIsBudgetModalOpen(true);
            }}
          />
        )}

        {/* Campaign Alert Section (Optional) */}
        {sections.alertBanner && (
          <AlertCampaign
            settings={settings}
            onOpenBudgetModal={(srv) => {
              setBudgetModalService(srv);
              setIsBudgetModalOpen(true);
            }}
          />
        )}

        {/* Services Section */}
        {sections.services && (
          <ServicesSection
            services={services}
            settings={settings}
            texts={texts}
            onSelectService={(srv) => {
              setSelectedService(srv);
              navigate(`/servicos/${srv.slug}`);
            }}
            onOpenBudgetModal={(srv) => {
              setBudgetModalService(srv);
              setIsBudgetModalOpen(true);
            }}
          />
        )}

        {/* Prices Section */}
        {sections.prices && (
          <PricingSection
            prices={prices}
            settings={settings}
            texts={texts}
            onOpenBudgetModal={(srv) => {
              setBudgetModalService(srv);
              setIsBudgetModalOpen(true);
            }}
          />
        )}

        {/* Gallery Section */}
        {sections.gallery && (
          <GallerySection
            gallery={gallery}
            settings={settings}
            texts={texts}
          />
        )}

        {/* About Section */}
        {sections.about && (
          <AboutSection
            settings={settings}
            texts={texts}
          />
        )}

        {/* Testimonials */}
        {sections.testimonials && (
          <TestimonialsSection
            testimonials={testimonials}
            settings={settings}
          />
        )}

        {/* FAQ */}
        {sections.faq && (
          <FaqSection
            settings={settings}
          />
        )}

        {/* Contact Section */}
        {sections.contact && (
          <ContactSection
            settings={settings}
            texts={texts}
            services={services}
          />
        )}
      </main>

      {/* Footer (with sitemap links and NO public admin links) */}
      <Footer
        settings={settings}
        texts={texts}
        onNavigate={navigate}
      />

      {/* Floating Action Buttons */}
      <FloatingWhatsApp settings={settings} />

      {/* Live Chat Widget with WebSockets real-time sync */}
      <LiveChatWidget settings={settings} />

      {/* Modals */}
      {selectedService && (
        <ServiceDetailModal
          service={selectedService}
          settings={settings}
          onClose={() => {
            setSelectedService(null);
            navigate('/');
          }}
        />
      )}

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          settings={settings}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <WhatsAppBudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        services={services}
        settings={settings}
        preselectedService={budgetModalService}
      />
    </div>
  );
}
