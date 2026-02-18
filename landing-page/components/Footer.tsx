import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-navbar.png" alt="Salmon HRIS" className="h-10 w-auto mb-4" />
            <p className="text-sm leading-relaxed mb-4">
              Solusi HRIS terlengkap untuk perusahaan modern. Kelola HR dengan mudah, efisien, dan terintegrasi.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-[#1A9B9A] transition-colors"><Facebook size={20} /></a>
              <a href="#" className="hover:text-[#1A9B9A] transition-colors"><Instagram size={20} /></a>
              <a href="#" className="hover:text-[#1A9B9A] transition-colors"><Linkedin size={20} /></a>
              <a href="#" className="hover:text-[#1A9B9A] transition-colors"><Twitter size={20} /></a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold text-white mb-4">Produk</h3>
            <ul className="space-y-2 text-sm">
              {['Absensi & Kehadiran', 'Payroll & Penggajian', 'Cuti & Izin', 'Performance Management', 'Recruitment'].map((item) => (
                <li key={item}><a href="#" className="hover:text-[#1A9B9A] transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-white mb-4">Perusahaan</h3>
            <ul className="space-y-2 text-sm">
              {['Tentang Kami', 'Karir', 'Blog', 'Press Kit', 'Hubungi Kami'].map((item) => (
                <li key={item}><a href="#" className="hover:text-[#1A9B9A] transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Kontak</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-[#1A9B9A] flex-shrink-0 mt-0.5" />
                <span>Jl. Sudirman No. 123<br />Jakarta Pusat, 10220</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-[#1A9B9A] flex-shrink-0" />
                <span>+62 21 1234 5678</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-[#1A9B9A] flex-shrink-0" />
                <span>info@salmonhris.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm">© 2026 Salmon HRIS. All rights reserved.</p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="hover:text-[#1A9B9A] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#1A9B9A] transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-[#1A9B9A] transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
