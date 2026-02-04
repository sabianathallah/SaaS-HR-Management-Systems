import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'

function LandingPage() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-sm border-b border-gray-200' : 'bg-white/80 backdrop-blur-lg'}`}>
        <div className="max-w-[1280px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Salmon<span className="text-violet-600">HRIS</span>
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Fitur</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Pricing</a>
              <a href="/features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Resources</a>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/login')} className="px-5 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors">Login</button>
              <button onClick={() => navigate('/login')} className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold transition-all">Request Demo</button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="min-h-[90vh] flex items-center pt-20 pb-16 px-6">
        <div className="max-w-[1280px] mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block px-4 py-1.5 bg-violet-50 text-violet-700 rounded-full text-sm font-semibold">All-in-One HR Platform</div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Kelola HR Tanpa<span className="block text-violet-600">Ribet & Manual</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">Payroll, attendance, dan data karyawan dalam satu dashboard terintegrasi. Hemat waktu, kurangi error, fokus ke growth.</p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => navigate('/login')} className="px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold text-lg transition-all shadow-lg shadow-violet-600/30">Request Demo</button>
                <button onClick={() => navigate('/features')} className="px-8 py-4 border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg font-semibold text-lg transition-all">Lihat Fitur</button>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  <span className="text-sm text-gray-600 font-medium">Free 30-day trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  <span className="text-sm text-gray-600 font-medium">No credit card required</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl p-8 shadow-2xl border border-gray-200">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {/* Dashboard Header with better contrast */}
                  <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white">
                    <h3 className="text-lg font-bold mb-4">Dashboard Overview</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {/* Card dengan background lebih solid */}
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                        <div className="text-2xl font-bold text-white">1,234</div>
                        <div className="text-xs text-white/90 font-medium">Employees</div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                        <div className="text-2xl font-bold text-white">94.5%</div>
                        <div className="text-xs text-white/90 font-medium">Attendance</div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                        <div className="text-2xl font-bold text-white">23</div>
                        <div className="text-xs text-white/90 font-medium">Pending</div>
                      </div>
                    </div>
                  </div>

                  {/* Dashboard Content */}
                  <div className="p-6 space-y-3">
                    {/* Payroll Card */}
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">Payroll Processed</div>
                          <div className="text-sm text-gray-600">December 2025</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">$124,500</div>
                        <div className="text-xs text-green-600 font-semibold">✓ On time</div>
                      </div>
                    </div>

                    {/* Attendance Card */}
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-lg">⏰</span>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">Today's Attendance</div>
                          <div className="text-sm text-gray-600">189 checked in</div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">94.5%</div>
                    </div>

                    {/* Leave Requests Card */}
                    <div className="flex items-center justify-between p-4 bg-violet-50 rounded-lg border border-violet-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-violet-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-lg">📋</span>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">Pending Requests</div>
                          <div className="text-sm text-gray-600">Leave & Overtime</div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-violet-600">23</div>
                    </div>
                  </div>
                </div>

                {/* Floating Stats - Better positioned */}
                <div className="absolute -right-4 -bottom-4 bg-white rounded-xl shadow-2xl p-4 border-2 border-violet-100">
                  <div className="text-xs text-gray-600 font-semibold mb-1">Active Users</div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">50K+</div>
                  <div className="text-xs text-green-600 font-bold mt-1">↑ 23% growth</div>
                </div>

                <div className="absolute -left-4 top-1/4 bg-white rounded-xl shadow-2xl p-4 border-2 border-indigo-100">
                  <div className="text-xs text-gray-600 font-semibold mb-1">Time Saved</div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">80%</div>
                  <div className="text-xs text-gray-500 font-semibold mt-1">vs manual</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PAIN POINTS */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Masalah HR yang Sering Kejadian</h2>
            <p className="text-lg text-gray-600">Familiar dengan situasi ini?</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all"><div className="text-4xl mb-4">❌</div><h3 className="text-lg font-bold text-gray-900 mb-2">Payroll Sering Salah</h3><p className="text-gray-600 text-sm">Hitung manual bikin error, revisi terus menerus</p></div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all"><div className="text-4xl mb-4">❌</div><h3 className="text-lg font-bold text-gray-900 mb-2">Data Karyawan Tersebar</h3><p className="text-gray-600 text-sm">Excel, email, folder — susah cari data yang diperlukan</p></div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all"><div className="text-4xl mb-4">❌</div><h3 className="text-lg font-bold text-gray-900 mb-2">Reporting Makan Waktu</h3><p className="text-gray-600 text-sm">Kumpulin data manual, bikin laporan berjam-jam</p></div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all"><div className="text-4xl mb-4">❌</div><h3 className="text-lg font-bold text-gray-900 mb-2">Sistem Lama Tidak Scalable</h3><p className="text-gray-600 text-sm">Makin banyak karyawan, makin ribet prosesnya</p></div>
          </div>
        </div>
      </section>

      {/* SOLUTIONS */}
      <section className="py-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Solusi HR Modern untuk Tim yang Bertumbuh</h2>
            <p className="text-lg text-gray-600">Sistem yang dirancang untuk efisiensi maksimal</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-violet-200 transition-all"><div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-3xl mb-6 shadow-lg">⚡</div><h3 className="text-2xl font-bold text-gray-900 mb-3">Otomatis & Akurat</h3><p className="text-gray-600 leading-relaxed">Sistem auto-calculate payroll, attendance, overtime. Minim human error.</p></div>
            <div className="relative bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-violet-200 transition-all"><div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center text-3xl mb-6 shadow-lg">🎯</div><h3 className="text-2xl font-bold text-gray-900 mb-3">Terpusat</h3><p className="text-gray-600 leading-relaxed">Semua data karyawan, absensi, cuti dalam satu dashboard yang mudah diakses.</p></div>
            <div className="relative bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-violet-200 transition-all"><div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-3xl mb-6 shadow-lg">📈</div><h3 className="text-2xl font-bold text-gray-900 mb-3">Scalable</h3><p className="text-gray-600 leading-relaxed">Cocok untuk tim kecil sampai enterprise. Grow sesuai kebutuhan bisnis Anda.</p></div>
          </div>
        </div>
      </section>

      {/* KEY FEATURES */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Fitur Utama</h2>
            <p className="text-lg text-gray-600">Semua yang Anda butuhkan untuk manage HR modern</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg hover:border-violet-200 transition-all group"><div className="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">💰</div><h3 className="text-xl font-bold text-gray-900 mb-2">Payroll Otomatis</h3><p className="text-gray-600">Auto-calculate gaji, tunjangan, potongan, dan pajak</p></div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg hover:border-violet-200 transition-all group"><div className="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">⏰</div><h3 className="text-xl font-bold text-gray-900 mb-2">Attendance Real-time</h3><p className="text-gray-600">GPS check-in, selfie verification, live monitoring</p></div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg hover:border-violet-200 transition-all group"><div className="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">👥</div><h3 className="text-xl font-bold text-gray-900 mb-2">Employee Database</h3><p className="text-gray-600">Semua data karyawan tersimpan rapi dan aman</p></div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg hover:border-violet-200 transition-all group"><div className="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">📊</div><h3 className="text-xl font-bold text-gray-900 mb-2">Reporting & Analytics</h3><p className="text-gray-600">Dashboard insight, export laporan ke Excel/PDF</p></div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg hover:border-violet-200 transition-all group"><div className="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">🔐</div><h3 className="text-xl font-bold text-gray-900 mb-2">Role & Permission</h3><p className="text-gray-600">Atur akses berdasarkan jabatan dan departemen</p></div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg hover:border-violet-200 transition-all group"><div className="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">☁️</div><h3 className="text-xl font-bold text-gray-900 mb-2">Cloud-based System</h3><p className="text-gray-600">Akses dari mana saja, kapan saja, device apa saja</p></div>
          </div>
          <div className="text-center mt-12"><button onClick={() => navigate('/features')} className="px-8 py-3 border-2 border-violet-600 text-violet-600 hover:bg-violet-600 hover:text-white rounded-lg font-semibold transition-all">Lihat Semua Fitur →</button></div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Cara Kerja</h2>
            <p className="text-lg text-gray-600">Simple dan straightforward</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center"><div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6 shadow-lg">1</div><h3 className="text-xl font-bold text-gray-900 mb-3">Daftar & Setup</h3><p className="text-gray-600">Registrasi gratis, setup organisasi & departemen dalam 5 menit</p></div>
            <div className="flex flex-col items-center text-center"><div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6 shadow-lg">2</div><h3 className="text-xl font-bold text-gray-900 mb-3">Input Data Karyawan</h3><p className="text-gray-600">Import data via Excel atau input manual, atur role & akses</p></div>
            <div className="flex flex-col items-center text-center"><div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6 shadow-lg">3</div><h3 className="text-xl font-bold text-gray-900 mb-3">Kelola & Monitor HR</h3><p className="text-gray-600">Pantau attendance, approve request, lihat analytics real-time</p></div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Dipercaya oleh Tim yang Bertumbuh</h2>
            <p className="text-lg text-gray-600">Digunakan oleh ratusan HR & business owner di Indonesia</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="text-center"><div className="text-4xl md:text-5xl font-bold text-violet-600 mb-2">500+</div><div className="text-gray-600 font-medium">Companies</div></div>
            <div className="text-center"><div className="text-4xl md:text-5xl font-bold text-violet-600 mb-2">50K+</div><div className="text-gray-600 font-medium">Active Users</div></div>
            <div className="text-center"><div className="text-4xl md:text-5xl font-bold text-violet-600 mb-2">99.9%</div><div className="text-gray-600 font-medium">Uptime</div></div>
            <div className="text-center"><div className="text-4xl md:text-5xl font-bold text-violet-600 mb-2">4.9/5</div><div className="text-gray-600 font-medium">User Rating</div></div>
          </div>
        </div>
      </section>

      {/* CTA CLOSING */}
      <section className="py-20 px-6 bg-gradient-to-br from-violet-600 to-indigo-700">
        <div className="max-w-[800px] mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Siap Bikin HR Lebih Rapi?</h2>
          <p className="text-xl text-white/90 mb-10">Coba demo gratis hari ini. Lihat sendiri bagaimana Salmon HRIS bisa transform HR operations Anda.</p>
          <button onClick={() => navigate('/login')} className="px-10 py-4 bg-white text-violet-700 hover:bg-gray-50 rounded-lg font-bold text-lg transition-all shadow-2xl">Request Demo →</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div><h4 className="font-bold mb-4">Product</h4><ul className="space-y-2 text-gray-400"><li><a href="/features" className="hover:text-white transition-colors">Features</a></li><li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li></ul></div>
            <div><h4 className="font-bold mb-4">Company</h4><ul className="space-y-2 text-gray-400"><li><a href="#" className="hover:text-white transition-colors">About</a></li><li><a href="#" className="hover:text-white transition-colors">Contact</a></li></ul></div>
            <div><h4 className="font-bold mb-4">Legal</h4><ul className="space-y-2 text-gray-400"><li><a href="#" className="hover:text-white transition-colors">Privacy</a></li><li><a href="#" className="hover:text-white transition-colors">Terms</a></li></ul></div>
            <div><h4 className="font-bold mb-4">Contact</h4><ul className="space-y-2 text-gray-400"><li>support@salmonhris.com</li></ul></div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center"><p className="text-gray-400 text-sm">© 2026 Salmon HRIS. All rights reserved.</p></div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
