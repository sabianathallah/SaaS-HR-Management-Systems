import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { TestimonialSection } from '@/components/TestimonialSection';
import { FeaturePreview } from '@/components/FeaturePreview';
import { CTASection } from '@/components/CTASection';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <TestimonialSection />
        <FeaturePreview />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
