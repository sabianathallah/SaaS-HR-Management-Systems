import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import logoNavbar from '../assets/logo-navbar.png'
import backgroundImage from '../assets/background.png'

export default function LandingPage() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [activeTab, setActiveTab] = useState('attendance')

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    {
      id: 'attendance',
      icon: '🕐',
      title: 'Attendance Management',
      description: 'Kelola absensi karyawan dengan GPS tracking, foto selfie, dan support WFH/WFO hybrid',
      details: [
        'Clock in/out dengan GPS & selfie verification',
        'Support hybrid work (WFO/WFH)',
        'Real-time attendance monitoring',
        'Automated late detection',
        'Flexible shift scheduling'
      ]
    },
    {
      id: 'leave',
      icon: '📅',
      title: 'Leave Management',
      description: 'Sistem cuti yang transparan dengan approval workflow dan quota tracking otomatis',
      details: [
        'Multiple leave types (Annual, Sick, Emergency)',
        'Real-time quota tracking',
        'Multi-level approval workflow',
        'Leave history & analytics',
        'Automated notifications'
      ]
    },
    {
      id: 'overtime',
      icon: '⏰',
      title: 'Overtime Management',
      description: 'Tracking lembur yang akurat dengan approval system dan kalkulasi kompensasi',
      details: [
        'Easy overtime request submission',
        'Approval workflow management',
        'Accurate duration tracking',
        'Overtime analytics & reports',
        'Compensation calculation ready'
      ]
    },
    {
      id: 'organization',
      icon: '🏢',
      title: 'Organization Structure',
      description: 'Kelola struktur organisasi, departemen, dan posisi dengan mudah',
      details: [
        'Department & position management',
        'Hierarchical organization view',
        'Employee assignment',
        'Office location management',
        'Shift schedule configuration'
      ]
    },
    {
      id: 'analytics',
      icon: '📊',
      title: 'Reports & Analytics',
      description: 'Dashboard analytics lengkap untuk pengambilan keputusan berbasis data',
      details: [
        'Real-time dashboard insights',
        'Attendance statistics & trends',
        'Leave & overtime reports',
        'Export to Excel/PDF',
        'Custom date range filtering'
      ]
    },
    {
      id: 'notification',
      icon: '🔔',
      title: 'Smart Notifications',
      description: 'Sistem notifikasi real-time untuk semua aktivitas penting',
      details: [
        'Real-time push notifications',
        'Email notifications',
        'Request status updates',
        'Approval reminders',
        'Customizable notification settings'
      ]
    }
  ]

  const stats = [
    { number: '99.9%', label: 'Uptime Guarantee' },
    { number: '< 100ms', label: 'Response Time' },
    { number: '1000+', label: 'Happy Companies' },
    { number: '24/7', label: 'Support Available' }
  ]

  const testimonials = [
    {
      name: 'Budi Santoso',
      position: 'HR Manager',
      company: 'PT Maju Jaya',
      text: 'Salmon HRIS mengubah cara kami mengelola HR. Semua jadi lebih efisien dan transparan!',
      rating: 5
    },
    {
      name: 'Sarah Ahmad',
      position: 'CEO',
      company: 'Tech Startup Indonesia',
      text: 'Dashboard analytics-nya sangat membantu kami dalam pengambilan keputusan strategis.',
      rating: 5
    },
    {
      name: 'David Chen',
      position: 'Operations Director',
      company: 'Global Services Ltd',
      text: 'Support untuk hybrid work sangat membantu di era new normal. Highly recommended!',
      rating: 5
    }
  ]

  const pricingPlans = [
    {
      name: 'Starter',
      price: 'Gratis',
      period: 'selamanya',
      description: 'Cocok untuk startup & small team',
      features: [
        'Hingga 10 karyawan',
        'Basic attendance tracking',
        'Leave management',
        'Email support',
        'Mobile app access'
      ],
      cta: 'Coba Gratis',
      popular: false
    },
    {
      name: 'Professional',
      price: '99K',
      period: 'per user/bulan',
      description: 'Untuk bisnis yang sedang berkembang',
      features: [
        'Unlimited employees',
        'Full attendance features',
        'Overtime management',
        'Reports & analytics',
        'Priority support',
        'API access',
        'Custom integrations'
      ],
      cta: 'Mulai Sekarang',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'hubungi kami',
      description: 'Solusi enterprise dengan kebutuhan khusus',
      features: [
        'Semua fitur Professional',
        'Dedicated account manager',
        'Custom development',
        'SLA guarantee',
        'On-premise deployment',
        'Advanced security',
        'Training & onboarding'
      ],
      cta: 'Hubungi Sales',
      popular: false
    }
  ]

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Background Overlay untuk membuat konten lebih terbaca - SAMA KAYAK EMPLOYEE PAGE */}
      <div className="min-h-screen" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}>
      
      {/* Content wrapper */}
      <div className="relative z-10">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg' : 'bg-white/90 backdrop-blur-md'
      } border-b border-gray-200`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logoNavbar} alt="Salmon HRIS" className="h-10" />
              <span className="text-xl font-bold text-black">
                Salmon HRIS
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="/" className="font-bold text-gray-800 hover:text-teal-600 transition-colors">Home</a>
              <a href="/features" className="font-bold text-gray-800 hover:text-teal-600 transition-colors">Fitur</a>
              <a href="#pricing" className="font-bold text-gray-800 hover:text-teal-600 transition-colors">Harga</a>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/login')}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 rounded-lg font-bold transition-all shadow-lg text-white"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-block px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 border-2 border-white rounded-full shadow-2xl">
                <span className="text-white text-sm font-bold drop-shadow-md">
                  🚀 Platform HR Management Terpercaya
                </span>
              </div>
              
              {/* Hero Title */}
              <div className="bg-gradient-to-br from-white via-teal-50/50 to-cyan-50/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border-2 border-teal-400">
                <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
                  <span className="text-gray-900 drop-shadow-sm">HR lebih rapi,</span><br />
                  <span className="text-teal-600 drop-shadow-md">
                    tim lebih produktif
                  </span>,<br />
                  <span className="text-gray-900 drop-shadow-sm">keputusan lebih pasti</span>
                </h1>
              </div>
              
              {/* Description */}
              <div className="bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/30 backdrop-blur-sm p-6 rounded-xl shadow-xl border-2 border-teal-400">
                <p className="text-xl text-gray-900 leading-relaxed font-bold drop-shadow-sm">
                  Salmon HRIS membantu bisnis mengelola SDM secara end-to-end—mulai dari absensi, payroll, 
                  hingga performance—dalam satu sistem yang simpel, transparan, dan siap dipakai untuk pengambilan keputusan.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <button 
                  onClick={() => navigate('/login')}
                  className="px-8 py-4 bg-teal-600 hover:bg-teal-700 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-2xl text-white border-2 border-teal-800"
                >
                  Coba Gratis Sekarang
                </button>
                <button 
                  onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-white/95 backdrop-blur-sm border-2 border-teal-600 rounded-xl font-bold text-lg hover:bg-teal-50 transition-all text-teal-700 shadow-xl"
                >
                  Lihat Demo
                </button>
              </div>

              {/* Benefits badges */}
              <div className="flex items-center gap-4 pt-6 text-sm font-bold flex-wrap">
                <div className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 rounded-lg border-2 border-white shadow-lg">
                  <span className="text-white font-bold text-lg">✓</span> 
                  <span className="text-white drop-shadow-md">Gratis 30 hari trial</span>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 rounded-lg border-2 border-white shadow-lg">
                  <span className="text-white font-bold text-lg">✓</span> 
                  <span className="text-white drop-shadow-md">No credit card required</span>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 rounded-lg border-2 border-white shadow-lg">
                  <span className="text-white font-bold text-lg">✓</span> 
                  <span className="text-white drop-shadow-md">Setup dalam 5 menit</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-white via-teal-50 to-cyan-50 backdrop-blur-sm p-8 rounded-3xl border-2 border-teal-400 shadow-2xl">
                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-2xl border-2 border-teal-500 shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-2xl shadow-lg">📊</div>
                      <div>
                        <div className="font-bold text-gray-900 text-lg drop-shadow-sm">Real-time Dashboard</div>
                        <div className="text-sm text-gray-800 font-semibold">Monitor semua aktivitas</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg border-2 border-green-500 shadow-sm">
                        <div className="text-2xl font-bold text-green-700 drop-shadow-sm">94%</div>
                        <div className="text-xs text-gray-900 font-bold">Attendance</div>
                      </div>
                      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-3 rounded-lg border-2 border-teal-500 shadow-sm">
                        <div className="text-2xl font-bold text-teal-700 drop-shadow-sm">12</div>
                        <div className="text-xs text-gray-900 font-bold">Pending</div>
                      </div>
                      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-3 rounded-lg border-2 border-cyan-500 shadow-sm">
                        <div className="text-2xl font-bold text-cyan-700 drop-shadow-sm">250</div>
                        <div className="text-xs text-gray-900 font-bold">Employees</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border-2 border-teal-500 shadow-lg">
                      <div className="text-3xl mb-2">🕐</div>
                      <div className="font-bold text-gray-900 drop-shadow-sm">Smart Attendance</div>
                      <div className="text-xs text-gray-800 font-semibold">GPS + Selfie</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border-2 border-cyan-500 shadow-lg">
                      <div className="text-3xl mb-2">📱</div>
                      <div className="font-bold text-gray-900 drop-shadow-sm">Mobile Ready</div>
                      <div className="text-xs text-gray-800 font-semibold">iOS & Android</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-white via-teal-50 to-cyan-50 backdrop-blur-sm rounded-2xl shadow-2xl p-12 border-2 border-teal-400">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center bg-white/80 p-6 rounded-xl shadow-lg">
                  <div className="text-4xl md:text-5xl font-bold mb-2 text-teal-600 drop-shadow-md">{stat.number}</div>
                  <div className="text-gray-800 font-bold">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              {/* Benefits header */}
              <div className="bg-gradient-to-br from-white via-teal-50 to-cyan-50 backdrop-blur-sm p-6 rounded-2xl border-2 border-teal-400 shadow-2xl mb-6">
                <h2 className="text-4xl md:text-5xl font-extrabold">
                  <span className="text-gray-900 drop-shadow-sm">Kenapa Memilih </span>
                  <span className="text-teal-600 drop-shadow-md">Salmon HRIS?</span>
                </h2>
              </div>
              
              <div className="space-y-6">
                <div className="flex gap-4 bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/30 backdrop-blur-sm p-5 rounded-xl border-2 border-teal-500 shadow-xl hover:shadow-2xl transition-all">
                  <div className="flex-shrink-0 w-14 h-14 bg-teal-600 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-3xl">⚡</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 drop-shadow-sm">Setup Cepat & Mudah</h3>
                    <p className="text-gray-800 font-semibold">Mulai dalam 5 menit tanpa perlu technical knowledge. Wizard setup kami akan guide step by step.</p>
                  </div>
                </div>

                <div className="flex gap-4 bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/30 backdrop-blur-sm p-5 rounded-xl border-2 border-cyan-500 shadow-xl hover:shadow-2xl transition-all">
                  <div className="flex-shrink-0 w-14 h-14 bg-cyan-600 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-3xl">🔒</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 drop-shadow-sm">Keamanan Data Terjamin</h3>
                    <p className="text-gray-800 font-semibold">Enkripsi end-to-end, backup otomatis, dan compliance dengan standar internasional.</p>
                  </div>
                </div>

                <div className="flex gap-4 bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/30 backdrop-blur-sm p-5 rounded-xl border-2 border-emerald-500 shadow-xl hover:shadow-2xl transition-all">
                  <div className="flex-shrink-0 w-14 h-14 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-3xl">📱</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 drop-shadow-sm">Mobile First Experience</h3>
                    <p className="text-gray-800 font-semibold">Akses dari mana saja dengan mobile app yang smooth. Perfect untuk remote teams.</p>
                  </div>
                </div>

                <div className="flex gap-4 bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/30 backdrop-blur-sm p-5 rounded-xl border-2 border-teal-500 shadow-xl hover:shadow-2xl transition-all">
                  <div className="flex-shrink-0 w-14 h-14 bg-teal-600 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-3xl">🤝</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 drop-shadow-sm">Support 24/7</h3>
                    <p className="text-gray-800 font-semibold">Tim support kami siap membantu kapan saja. Response time rata-rata &lt; 5 menit.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-3xl blur-3xl opacity-20"></div>
              <div className="relative space-y-4">
                <div className="bg-gradient-to-br from-white via-green-50 to-emerald-50 backdrop-blur-sm p-6 rounded-2xl border-2 border-green-500 transform hover:scale-105 transition-transform shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-gray-900 text-lg drop-shadow-sm">Attendance Rate</span>
                    <span className="text-green-700 font-bold text-xl drop-shadow-sm">+15% ↑</span>
                  </div>
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden border-2 border-green-600">
                    <div className="h-full bg-green-600 w-[94%] rounded-full shadow-lg"></div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-white via-teal-50 to-cyan-50 backdrop-blur-sm p-6 rounded-2xl border-2 border-teal-500 transform hover:scale-105 transition-transform shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-gray-900 text-lg drop-shadow-sm">HR Productivity</span>
                    <span className="text-teal-700 font-bold text-xl drop-shadow-sm">+40% ↑</span>
                  </div>
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden border-2 border-teal-600">
                    <div className="h-full bg-teal-600 w-[89%] rounded-full shadow-lg"></div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-white via-cyan-50 to-blue-50 backdrop-blur-sm p-6 rounded-2xl border-2 border-cyan-500 transform hover:scale-105 transition-transform shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-gray-900 text-lg drop-shadow-sm">Employee Satisfaction</span>
                    <span className="text-cyan-700 font-bold text-xl drop-shadow-sm">+25% ↑</span>
                  </div>
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden border-2 border-cyan-600">
                    <div className="h-full bg-cyan-600 w-[92%] rounded-full shadow-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            {/* Pricing header */}
            <div className="bg-gradient-to-br from-white via-teal-50 to-cyan-50 backdrop-blur-sm px-8 py-6 rounded-2xl border-2 border-teal-400 shadow-2xl mb-6 inline-block">
              <h2 className="text-4xl md:text-5xl font-extrabold">
                <span className="text-gray-900 drop-shadow-sm">Harga yang </span>
                <span className="text-teal-600 drop-shadow-md">Fleksibel</span>
              </h2>
            </div>
            <div className="bg-white/95 backdrop-blur-sm px-6 py-4 rounded-xl border-2 border-gray-300 inline-block shadow-xl">
              <p className="text-xl text-gray-900 font-bold">Pilih paket yang sesuai dengan kebutuhan bisnis Anda</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index}
                className={`relative bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/30 backdrop-blur-sm p-8 rounded-2xl border-2 ${
                  plan.popular ? 'border-teal-500 scale-105 shadow-2xl ring-4 ring-teal-400/50' : 'border-teal-400'
                } transition-all hover:scale-105 shadow-xl`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-teal-600 px-6 py-2 rounded-full text-sm font-bold text-white shadow-xl border-2 border-white">
                      🔥 Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 drop-shadow-sm">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-5xl font-bold text-teal-600 drop-shadow-md">{plan.price}</span>
                    {plan.period && <span className="text-gray-800 ml-2 font-bold">/ {plan.period}</span>}
                  </div>
                  <p className="text-gray-800 text-sm font-bold">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-600 mt-1 font-bold text-lg">✓</span>
                      <span className="text-gray-900 font-semibold">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => navigate('/login')}
                  className={`w-full py-4 rounded-xl font-bold transition-all text-white shadow-xl border-2 ${
                    plan.popular 
                      ? 'bg-teal-600 hover:bg-teal-700 border-teal-800' 
                      : 'bg-teal-600 hover:bg-teal-700 border-teal-800'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            {/* Testimonials header */}
            <div className="bg-gradient-to-br from-white via-teal-50 to-cyan-50 backdrop-blur-sm px-8 py-6 rounded-2xl border-2 border-teal-400 shadow-2xl mb-6 inline-block">
              <h2 className="text-4xl md:text-5xl font-extrabold">
                <span className="text-gray-900 drop-shadow-sm">Dipercaya oleh </span>
                <span className="text-teal-600 drop-shadow-md">1000+ Perusahaan</span>
              </h2>
            </div>
            <div className="bg-white/95 backdrop-blur-sm px-6 py-4 rounded-xl border-2 border-gray-300 inline-block shadow-xl">
              <p className="text-xl text-gray-900 font-bold">Lihat apa kata mereka tentang Salmon HRIS</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/30 backdrop-blur-sm p-8 rounded-2xl border-2 border-teal-500 hover:border-teal-600 transition-all shadow-2xl hover:shadow-3xl">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-500 text-2xl drop-shadow-md">⭐</span>
                  ))}
                </div>
                
                <p className="text-gray-900 mb-6 italic font-bold text-lg drop-shadow-sm">"{testimonial.text}"</p>
                
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg border-2 border-teal-500 shadow-lg">
                  <div className="w-14 h-14 bg-teal-600 rounded-full flex items-center justify-center font-bold text-white text-xl shadow-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg drop-shadow-sm">{testimonial.name}</div>
                    <div className="text-sm text-gray-800 font-bold">{testimonial.position}</div>
                    <div className="text-xs text-gray-700 font-semibold">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-teal-600 p-12 rounded-3xl shadow-2xl border-4 border-teal-800">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-white drop-shadow-lg">
              Siap Transformasi HR Anda?
            </h2>
            <p className="text-xl mb-8 text-white font-bold drop-shadow-md">
              Mulai gratis hari ini. Tidak perlu kartu kredit. Setup dalam 5 menit.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => navigate('/login')}
                className="px-10 py-4 bg-white text-teal-700 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl border-2 border-gray-200"
              >
                Mulai Gratis Sekarang →
              </button>
              <button 
                className="px-10 py-4 bg-teal-800 border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-teal-900 transition-all shadow-xl"
              >
                Jadwalkan Demo
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-8 mt-8 text-sm font-bold text-white">
              <div className="flex items-center gap-2 bg-teal-700 px-4 py-2 rounded-lg border-2 border-white shadow-lg">
                <span className="text-xl">✓</span> Free 30-day trial
              </div>
              <div className="flex items-center gap-2 bg-teal-700 px-4 py-2 rounded-lg border-2 border-white shadow-lg">
                <span className="text-xl">✓</span> Cancel anytime
              </div>
              <div className="flex items-center gap-2 bg-teal-700 px-4 py-2 rounded-lg border-2 border-white shadow-lg">
                <span className="text-xl">✓</span> No credit card needed
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Simple Version */}
      <footer className="bg-white border-t border-gray-200 py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Logo & Copyright */}
            <div className="flex items-center gap-2">
              <img src={logoNavbar} alt="Salmon HRIS" className="h-8" />
              <span className="font-bold text-gray-900">Salmon HRIS</span>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap gap-6 text-sm">
              <a href="/features" className="text-gray-600 hover:text-teal-600 transition-colors font-medium">Fitur</a>
              <a href="#pricing" className="text-gray-600 hover:text-teal-600 transition-colors font-medium">Harga</a>
              <a href="#" className="text-gray-600 hover:text-teal-600 transition-colors font-medium">Tentang Kami</a>
              <a href="#" className="text-gray-600 hover:text-teal-600 transition-colors font-medium">Kontak</a>
              <a href="#" className="text-gray-600 hover:text-teal-600 transition-colors font-medium">Privacy Policy</a>
            </div>

            {/* Copyright */}
            <p className="text-gray-500 text-sm">
              © 2026 Salmon HRIS
            </p>
          </div>
        </div>
      </footer>
      </div>
      </div>
    </div>
  )
}
