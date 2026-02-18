'use client';

import { useState } from 'react';
import {
  Menu, X, ChevronDown, Clock, DollarSign, Calendar,
  Users, BarChart, FileText, Target, Award, CheckCircle
} from 'lucide-react';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? '';

const products = [
  {
    name: 'Salmon Core',
    description: 'Paket dasar untuk perusahaan kecil',
    features: ['Absensi & Kehadiran', 'Database Karyawan', 'Cuti & Izin']
  },
  {
    name: 'Salmon Pro',
    description: 'Paket lengkap untuk perusahaan berkembang',
    features: ['Semua fitur Core', 'Payroll & Penggajian', 'Performance Management']
  },
  {
    name: 'Salmon Enterprise',
    description: 'Solusi enterprise dengan customization',
    features: ['Semua fitur Pro', 'Custom Integration', 'Dedicated Support']
  }
];

const features = [
  { icon: Clock, name: 'Absensi & Kehadiran', description: 'GPS tracking & face recognition' },
  { icon: DollarSign, name: 'Payroll & Penggajian', description: 'Hitung gaji otomatis dengan PPh 21' },
  { icon: Calendar, name: 'Cuti & Izin', description: 'Manajemen cuti dengan approval' },
  { icon: Users, name: 'Database Karyawan', description: 'Kelola data karyawan lengkap' },
  { icon: Target, name: 'Performance Management', description: 'KPI tracking & review' },
  { icon: BarChart, name: 'Laporan & Analytics', description: 'Dashboard real-time' },
  { icon: FileText, name: 'Recruitment', description: 'Kelola proses rekrutmen' },
  { icon: Award, name: 'Training & Development', description: 'Platform learning karyawan' }
];

const pricingPlans = [
  {
    name: 'Starter',
    price: 'Rp 99,000',
    period: 'per user/bulan',
    description: 'Cocok untuk perusahaan kecil',
    popular: false
  },
  {
    name: 'Professional',
    price: 'Rp 149,000',
    period: 'per user/bulan',
    description: 'Pilihan populer untuk SME',
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'hubungi kami',
    description: 'Untuk perusahaan besar',
    popular: false
  }
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'product' | 'feature' | 'pricing' | null>(null);

  const handleDropdownToggle = (dropdown: 'product' | 'feature' | 'pricing') => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const goToLogin = () => {
    window.location.href = `${APP_URL}/login`;
  };

  const goToTryFree = () => {
    window.location.href = `${APP_URL}/login`;
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-navbar.png" alt="Salmon HRIS" className="h-10 w-auto" />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center flex-1 justify-between ml-10">
              <nav className="flex items-center space-x-8">
                <button
                  onClick={() => handleDropdownToggle('product')}
                  className="flex items-center space-x-1 text-gray-700 hover:text-[#1A9B9A] font-medium transition-colors"
                >
                  <span>Produk</span>
                  <ChevronDown size={16} className={`transition-transform ${activeDropdown === 'product' ? 'rotate-180' : ''}`} />
                </button>

                <button
                  onClick={() => handleDropdownToggle('feature')}
                  className="flex items-center space-x-1 text-gray-700 hover:text-[#1A9B9A] font-medium transition-colors"
                >
                  <span>Fitur</span>
                  <ChevronDown size={16} className={`transition-transform ${activeDropdown === 'feature' ? 'rotate-180' : ''}`} />
                </button>

                <button
                  onClick={() => handleDropdownToggle('pricing')}
                  className="flex items-center space-x-1 text-gray-700 hover:text-[#1A9B9A] font-medium transition-colors"
                >
                  <span>Harga</span>
                  <ChevronDown size={16} className={`transition-transform ${activeDropdown === 'pricing' ? 'rotate-180' : ''}`} />
                </button>
              </nav>

              <div className="flex items-center space-x-4">
                <button
                  onClick={goToLogin}
                  className="text-gray-700 hover:text-[#1A9B9A] font-medium transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={goToTryFree}
                  className="bg-[#1A9B9A] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#158888] transition-colors"
                >
                  Coba Gratis
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-4">
                <button
                  onClick={() => handleDropdownToggle('product')}
                  className="text-left text-gray-700 hover:text-[#1A9B9A] font-medium transition-colors flex items-center justify-between"
                >
                  <span>Produk</span>
                  <ChevronDown size={16} className={`transition-transform ${activeDropdown === 'product' ? 'rotate-180' : ''}`} />
                </button>
                <button
                  onClick={() => handleDropdownToggle('feature')}
                  className="text-left text-gray-700 hover:text-[#1A9B9A] font-medium transition-colors flex items-center justify-between"
                >
                  <span>Fitur</span>
                  <ChevronDown size={16} className={`transition-transform ${activeDropdown === 'feature' ? 'rotate-180' : ''}`} />
                </button>
                <button
                  onClick={() => handleDropdownToggle('pricing')}
                  className="text-left text-gray-700 hover:text-[#1A9B9A] font-medium transition-colors flex items-center justify-between"
                >
                  <span>Harga</span>
                  <ChevronDown size={16} className={`transition-transform ${activeDropdown === 'pricing' ? 'rotate-180' : ''}`} />
                </button>

                <div className="border-t border-gray-200 pt-4 flex flex-col space-y-3">
                  <button
                    onClick={() => { goToLogin(); setIsMenuOpen(false); }}
                    className="text-left text-gray-700 hover:text-[#1A9B9A] font-medium transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => { goToTryFree(); setIsMenuOpen(false); }}
                    className="bg-[#1A9B9A] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#158888] transition-colors text-center"
                  >
                    Coba Gratis
                  </button>
                </div>
              </nav>
            </div>
          )}
        </div>

        {/* Dropdown Menus */}
        {activeDropdown && (
          <>
            <div
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setActiveDropdown(null)}
            />
            <div className="absolute left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50 animate-slideDown">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeDropdown === 'product' && (
                  <div className="grid md:grid-cols-3 gap-6">
                    {products.map((product, index) => (
                      <div
                        key={index}
                        className="p-6 rounded-xl border border-gray-200 hover:border-[#1A9B9A] hover:shadow-lg transition-all cursor-pointer"
                      >
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                        <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                        <ul className="space-y-2">
                          {product.features.map((feature, i) => (
                            <li key={i} className="flex items-start space-x-2 text-sm">
                              <CheckCircle className="text-[#1A9B9A] flex-shrink-0 mt-0.5" size={16} />
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {activeDropdown === 'feature' && (
                  <div className="grid md:grid-cols-4 gap-6">
                    {features.map((feature, index) => {
                      const Icon = feature.icon;
                      return (
                        <div
                          key={index}
                          className="p-4 rounded-xl hover:bg-[#E6F7F7] transition-all cursor-pointer group"
                        >
                          <div className="bg-[#E6F7F7] group-hover:bg-white p-3 rounded-lg inline-block mb-3 transition-colors">
                            <Icon className="text-[#1A9B9A]" size={24} />
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">{feature.name}</h3>
                          <p className="text-sm text-gray-600">{feature.description}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeDropdown === 'pricing' && (
                  <div className="grid md:grid-cols-3 gap-6">
                    {pricingPlans.map((plan, index) => (
                      <div
                        key={index}
                        className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                          plan.popular
                            ? 'border-[#1A9B9A] bg-[#E6F7F7] shadow-lg'
                            : 'border-gray-200 hover:border-[#1A9B9A] hover:shadow-lg'
                        }`}
                      >
                        {plan.popular && (
                          <span className="bg-[#1A9B9A] text-white px-3 py-1 rounded-full text-xs font-semibold inline-block mb-3">
                            Populer
                          </span>
                        )}
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                        <div className="mb-2">
                          <span className="text-3xl font-bold text-[#1A9B9A]">{plan.price}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{plan.period}</p>
                        <p className="text-gray-700 mb-4">{plan.description}</p>
                        <button className="w-full bg-[#1A9B9A] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#158888] transition-colors">
                          Pilih Paket
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between">
                  <p className="text-gray-700 mb-4 sm:mb-0">
                    Butuh bantuan memilih paket yang tepat?
                  </p>
                  <button className="border-2 border-[#1A9B9A] text-[#1A9B9A] px-6 py-2 rounded-lg font-medium hover:bg-[#1A9B9A] hover:text-white transition-colors">
                    Hubungi Sales
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </header>
    </>
  );
}
