import React from 'react';
import { CheckCircle, Users, Clock, TrendingUp, Shield } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HeroSectionProps {
  onTryFreeClick: () => void;
}

export function HeroSection({ onTryFreeClick }: HeroSectionProps) {
  return (
    <section className="relative bg-gradient-to-br from-[#E6F7F7] to-white py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-block">
              <span className="bg-[#1A9B9A] text-white px-4 py-2 rounded-full text-sm font-medium">
                #1 HRIS Platform di Indonesia
              </span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
              Solusi HRIS Terlengkap untuk{' '}
              <span className="text-[#1A9B9A]">Perusahaan Modern</span>
            </h1>
            
            <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">
              Kelola seluruh kebutuhan HR perusahaan Anda dalam satu platform. 
              Dari absensi, payroll, hingga performance management dengan mudah dan efisien.
            </p>

            {/* Key Points */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="text-[#1A9B9A] flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-semibold text-gray-900">Otomasi Penuh</h3>
                  <p className="text-gray-600 text-sm">Proses HR otomatis & akurat</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Users className="text-[#1A9B9A] flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-semibold text-gray-900">Mudah Digunakan</h3>
                  <p className="text-gray-600 text-sm">Interface intuitif untuk semua</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Clock className="text-[#1A9B9A] flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-semibold text-gray-900">Hemat Waktu</h3>
                  <p className="text-gray-600 text-sm">Hemat hingga 80% waktu admin</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <TrendingUp className="text-[#1A9B9A] flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-semibold text-gray-900">Skalabilitas</h3>
                  <p className="text-gray-600 text-sm">Tumbuh bersama bisnis Anda</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={onTryFreeClick}
                className="bg-[#1A9B9A] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#158888] transition-colors text-lg shadow-lg hover:shadow-xl"
              >
                Coba Gratis 14 Hari
              </button>
              <button className="border-2 border-[#1A9B9A] text-[#1A9B9A] px-8 py-4 rounded-lg font-semibold hover:bg-[#1A9B9A] hover:text-white transition-colors text-lg">
                Lihat Demo
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-6 pt-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Shield className="text-[#1A9B9A]" size={20} />
                <span>ISO 27001 Certified</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-[#1A9B9A]" size={20} />
                <span>10,000+ Perusahaan</span>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1553877522-43269d4ea984"
                alt="HRIS Dashboard"
                className="w-full h-auto"
              />
              {/* Overlay Card */}
              <div className="absolute bottom-6 left-6 right-6 bg-white rounded-xl p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Karyawan Aktif</p>
                    <p className="text-3xl font-bold text-[#1A9B9A]">1,234</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Kehadiran Bulan Ini</p>
                    <p className="text-3xl font-bold text-green-600">98.5%</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Cards */}
            <div className="hidden lg:block absolute -top-6 -right-6 bg-white rounded-xl p-4 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Produktivitas</p>
                  <p className="text-lg font-bold text-gray-900">+35%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
