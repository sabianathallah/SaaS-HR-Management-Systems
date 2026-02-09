import React, { useState } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { TestimonialSection } from './components/TestimonialSection';
import { FeaturePreview } from './components/FeaturePreview';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';
import { LoginPage } from './components/LoginPage';
import { TryFreePage } from './components/TryFreePage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'try-free'>('home');

  if (currentPage === 'login') {
    return <LoginPage onBack={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'try-free') {
    return <TryFreePage onBack={() => setCurrentPage('home')} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header 
        onLoginClick={() => setCurrentPage('login')}
        onTryFreeClick={() => setCurrentPage('try-free')}
      />
      <main>
        <HeroSection onTryFreeClick={() => setCurrentPage('try-free')} />
        <TestimonialSection />
        <FeaturePreview />
        <CTASection onTryFreeClick={() => setCurrentPage('try-free')} />
      </main>
      <Footer />
    </div>
  );
}
