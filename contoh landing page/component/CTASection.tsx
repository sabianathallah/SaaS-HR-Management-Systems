import React from 'react';
import { MessageCircle, Rocket } from 'lucide-react';

interface CTASectionProps {
  onTryFreeClick: () => void;
}

export function CTASection({ onTryFreeClick }: CTASectionProps) {
  const handleWhatsAppClick = () => {
    // Replace with actual WhatsApp number
    const whatsappNumber = '6281234567890';
    const message = encodeURIComponent('Halo, saya tertarik dengan Salmon HRIS. Bisakah Anda memberikan informasi lebih lanjut?');
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <section className="py-20 bg-gradient-to-br from-[#1A9B9A] to-[#158888]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Siap Transformasi HR Perusahaan Anda?
          </h2>
          <p className="text-lg text-white/90 mb-12 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan perusahaan yang telah meningkatkan efisiensi HR mereka dengan Salmon HRIS
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={handleWhatsAppClick}
              className="group bg-white text-[#1A9B9A] px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-all text-lg shadow-xl hover:shadow-2xl flex items-center space-x-3 min-w-[240px] justify-center"
            >
              <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
              <span>Hubungi via WhatsApp</span>
            </button>

            <button
              onClick={onTryFreeClick}
              className="group bg-gray-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition-all text-lg shadow-xl hover:shadow-2xl flex items-center space-x-3 min-w-[240px] justify-center"
            >
              <Rocket size={24} className="group-hover:scale-110 transition-transform" />
              <span>Coba Gratis Sekarang</span>
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 flex flex-col sm:flex-row gap-6 justify-center items-center text-white/90 text-sm">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Gratis 14 hari</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Tidak perlu kartu kredit</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Setup dalam 5 menit</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
