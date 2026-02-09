import React, { useState } from 'react';
import { Header } from '../component/Header';
import { HeroSection } from '../component/HeroSection';
import { TestimonialSection } from '../component/TestimonialSection';
import { FeaturePreview } from '../component/FeaturePreview';
import { CTASection } from '../component/CTASection';
import { Footer } from '../component/Footer';
import { LoginPage } from '../component/LoginPage';
import { TryFreePage } from '../component/TryFreePage';

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
