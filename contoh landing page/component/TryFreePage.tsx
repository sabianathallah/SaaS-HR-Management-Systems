import React, { useState } from 'react';
import { ArrowLeft, User, Mail, Phone, Building, Users, CheckCircle } from 'lucide-react';

interface TryFreePageProps {
  onBack: () => void;
}

export function TryFreePage({ onBack }: TryFreePageProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    employeeCount: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Trial signup:', formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E6F7F7] to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-[#1A9B9A] mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Kembali</span>
        </button>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Form */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* Logo & Header */}
            <div className="mb-8">
              <img src="/logo-navbar.png" alt="Salmon HRIS" className="h-12 w-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900">Coba Gratis 14 Hari</h1>
              <p className="text-gray-600 mt-2">
                Tidak perlu kartu kredit. Mulai gunakan semua fitur sekarang!
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A9B9A] focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Perusahaan *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="nama@perusahaan.com"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A9B9A] focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="08123456789"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A9B9A] focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Company Name */}
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Perusahaan *
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="PT. Example Indonesia"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A9B9A] focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Employee Count */}
              <div>
                <label htmlFor="employeeCount" className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah Karyawan *
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <select
                    id="employeeCount"
                    name="employeeCount"
                    value={formData.employeeCount}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A9B9A] focus:border-transparent outline-none transition-all appearance-none"
                    required
                  >
                    <option value="">Pilih jumlah karyawan</option>
                    <option value="1-10">1-10 karyawan</option>
                    <option value="11-50">11-50 karyawan</option>
                    <option value="51-200">51-200 karyawan</option>
                    <option value="201-500">201-500 karyawan</option>
                    <option value="500+">500+ karyawan</option>
                  </select>
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-[#1A9B9A] border-gray-300 rounded focus:ring-[#1A9B9A] mt-0.5"
                  required
                />
                <span className="text-sm text-gray-700">
                  Saya setuju dengan{' '}
                  <a href="#" className="text-[#1A9B9A] hover:underline">
                    Syarat & Ketentuan
                  </a>{' '}
                  dan{' '}
                  <a href="#" className="text-[#1A9B9A] hover:underline">
                    Kebijakan Privasi
                  </a>
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#1A9B9A] text-white py-4 rounded-lg font-semibold hover:bg-[#158888] transition-colors shadow-lg hover:shadow-xl text-lg"
              >
                Mulai Trial Gratis
              </button>
            </form>

            {/* Already have account */}
            <p className="text-center text-sm text-gray-600 mt-6">
              Sudah punya akun?{' '}
              <a href="#" className="text-[#1A9B9A] font-semibold hover:underline">
                Masuk di sini
              </a>
            </p>
          </div>

          {/* Right Side - Benefits */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Apa yang Anda dapatkan:
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-4 bg-white rounded-xl p-5 shadow-md">
                <div className="bg-[#E6F7F7] p-3 rounded-lg flex-shrink-0">
                  <CheckCircle className="text-[#1A9B9A]" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Akses Penuh 14 Hari</h3>
                  <p className="text-gray-600 text-sm">
                    Coba semua fitur premium tanpa batasan
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-white rounded-xl p-5 shadow-md">
                <div className="bg-[#E6F7F7] p-3 rounded-lg flex-shrink-0">
                  <CheckCircle className="text-[#1A9B9A]" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Setup Gratis</h3>
                  <p className="text-gray-600 text-sm">
                    Tim kami akan membantu setup dan konfigurasi awal
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-white rounded-xl p-5 shadow-md">
                <div className="bg-[#E6F7F7] p-3 rounded-lg flex-shrink-0">
                  <CheckCircle className="text-[#1A9B9A]" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Training & Onboarding</h3>
                  <p className="text-gray-600 text-sm">
                    Panduan lengkap dan training untuk tim Anda
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-white rounded-xl p-5 shadow-md">
                <div className="bg-[#E6F7F7] p-3 rounded-lg flex-shrink-0">
                  <CheckCircle className="text-[#1A9B9A]" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Data Migration</h3>
                  <p className="text-gray-600 text-sm">
                    Import data karyawan dari sistem lama Anda
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-white rounded-xl p-5 shadow-md">
                <div className="bg-[#E6F7F7] p-3 rounded-lg flex-shrink-0">
                  <CheckCircle className="text-[#1A9B9A]" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Dedicated Support</h3>
                  <p className="text-gray-600 text-sm">
                    Customer support siap membantu kapan saja
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-white rounded-xl p-5 shadow-md">
                <div className="bg-[#E6F7F7] p-3 rounded-lg flex-shrink-0">
                  <CheckCircle className="text-[#1A9B9A]" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Cancel Anytime</h3>
                  <p className="text-gray-600 text-sm">
                    Tidak ada komitmen jangka panjang, berhenti kapan saja
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-[#1A9B9A] text-white rounded-xl p-6 shadow-lg">
              <p className="text-sm mb-4 italic">
                "Setup sangat mudah dan tim support sangat membantu. Dalam 1 minggu kami sudah fully operational dengan Salmon HRIS!"
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold">
                  BS
                </div>
                <div>
                  <p className="font-semibold">Budi Santoso</p>
                  <p className="text-sm text-white/80">HR Manager, PT Tech Innovate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
