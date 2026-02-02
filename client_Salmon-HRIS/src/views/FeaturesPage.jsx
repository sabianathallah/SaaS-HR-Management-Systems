import { useState } from 'react'
import { useNavigate } from 'react-router'
import backgroundImage from '../assets/background.png'
import logoNavbar from '../assets/logo-navbar.png'

function FeaturesPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('attendance')

  const features = [
    {
      id: 'attendance',
      icon: '⏰',
      title: 'Attendance Management',
      description: 'Kelola absensi karyawan dengan mudah dan akurat',
      details: [
        'Clock in/out dengan GPS & Selfie verification',
        'Multiple work locations support',
        'Flexible schedule & shift management',
        'Real-time attendance monitoring',
        'Auto-calculate work hours & overtime',
        'Late & absence tracking',
        'Mobile attendance app',
        'Integration dengan payroll'
      ]
    },
    {
      id: 'leave',
      icon: '🏖️',
      title: 'Leave Management',
      description: 'Sistem cuti yang transparan dan efisien',
      details: [
        'Multiple leave types (annual, sick, etc)',
        'Easy leave request & approval flow',
        'Leave balance tracking',
        'Auto-deduct from quota',
        'Email & push notifications',
        'Manager approval dashboard',
        'Leave calendar view',
        'Export leave reports'
      ]
    },
    {
      id: 'overtime',
      icon: '⏳',
      title: 'Overtime Management',
      description: 'Track dan approve overtime dengan sistem yang jelas',
      details: [
        'Easy overtime request submission',
        'Multi-level approval workflow',
        'Auto-calculate overtime pay',
        'Overtime quota & limits',
        'Real-time overtime tracking',
        'Custom overtime rules',
        'Overtime reports & analytics',
        'Integration dengan payroll'
      ]
    },
    {
      id: 'schedule',
      icon: '📅',
      title: 'Schedule & Shift',
      description: 'Atur jadwal kerja tim dengan fleksibel',
      details: [
        'Flexible shift scheduling',
        'Rotating shift support',
        'Work pattern templates',
        'Schedule conflict detection',
        'Shift swap requests',
        'Schedule notifications',
        'Calendar integration',
        'Export schedule reports'
      ]
    },
    {
      id: 'hybrid',
      icon: '🏠',
      title: 'Hybrid Work',
      description: 'Support untuk WFH, WFO, dan hybrid work',
      details: [
        'Flexible work location setup',
        'WFH/WFO scheduling',
        'Location change requests',
        'Office capacity management',
        'Hybrid work analytics',
        'Location-based attendance',
        'Team presence calendar',
        'Remote work tracking'
      ]
    },
    {
      id: 'analytics',
      icon: '📊',
      title: 'Reports & Analytics',
      description: 'Dashboard dan laporan yang comprehensive',
      details: [
        'Real-time HR dashboard',
        'Customizable reports',
        'Attendance analytics',
        'Leave & overtime reports',
        'Export to Excel/PDF',
        'Data visualization charts',
        'Trend analysis',
        'Custom report builder'
      ]
    }
  ]

  const activeFeature = features.find(f => f.id === activeTab) || features[0]

  return (
    <div className="min-h-screen">
      {/* Background */}
      <div 
        className="fixed inset-0 z-0" 
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div 
          className="absolute inset-0" 
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
        ></div>
      </div>

      <div className="relative z-10">
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                <img src={logoNavbar} alt="Salmon HRIS" className="h-8" />
                <span className="text-xl font-bold text-gray-900">Salmon HRIS</span>
              </div>
              
              <div className="hidden md:flex items-center gap-8">
                <a href="/" className="font-bold text-gray-800 hover:text-teal-600 transition-colors">Home</a>
                <a href="/features" className="font-bold text-teal-600 transition-colors">Fitur</a>
                <a href="/#pricing" className="font-bold text-gray-800 hover:text-teal-600 transition-colors">Harga</a>
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
        <section className="pt-32 pb-12 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <div className="bg-gradient-to-br from-white via-teal-50 to-cyan-50 backdrop-blur-sm px-8 py-12 rounded-2xl shadow-2xl border-2 border-teal-400 inline-block">
              <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
                <span className="text-gray-900 drop-shadow-sm">Fitur Lengkap untuk </span>
                <span className="text-teal-600 drop-shadow-md">Semua Kebutuhan HR</span>
              </h1>
              <p className="text-xl text-gray-900 max-w-3xl font-bold drop-shadow-sm">
                Platform all-in-one yang mengintegrasikan semua aspek manajemen HR dalam satu dashboard yang powerful
              </p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {features.map((feature) => (
                <div 
                  key={feature.id}
                  onClick={() => setActiveTab(feature.id)}
                  className={`group bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/30 backdrop-blur-sm p-8 rounded-2xl border-2 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer shadow-2xl hover:shadow-3xl ${
                    activeTab === feature.id 
                      ? 'border-teal-600 ring-4 ring-teal-400/50' 
                      : 'border-teal-500 hover:border-teal-600'
                  }`}
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-teal-600 transition-colors drop-shadow-sm">
                    {feature.title}
                  </h3>
                  <p className="text-gray-800 font-semibold">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Feature Details */}
            <div className="bg-gradient-to-br from-white via-teal-50 to-cyan-50 backdrop-blur-sm p-12 rounded-2xl shadow-2xl border-2 border-teal-400">
              <div className="flex items-center gap-4 mb-8">
                <div className="text-6xl">{activeFeature.icon}</div>
                <div>
                  <h2 className="text-4xl font-extrabold text-gray-900 drop-shadow-sm">{activeFeature.title}</h2>
                  <p className="text-xl text-gray-800 font-bold mt-2">{activeFeature.description}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {activeFeature.details.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-lg border-2 border-teal-500">
                    <span className="text-green-600 font-bold text-2xl">✓</span>
                    <span className="text-gray-900 font-bold text-lg">{detail}</span>
                  </div>
                ))}
              </div>

              <div className="mt-12 text-center">
                <button 
                  onClick={() => navigate('/login')}
                  className="px-10 py-4 bg-teal-600 hover:bg-teal-700 rounded-xl font-bold text-lg transition-all shadow-2xl text-white border-2 border-teal-800"
                >
                  Coba Gratis Sekarang →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-teal-600 p-12 rounded-3xl shadow-2xl border-4 border-teal-800">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-white drop-shadow-lg">
                Siap Mencoba Salmon HRIS?
              </h2>
              <p className="text-xl mb-8 text-white font-bold drop-shadow-md">
                Dapatkan akses gratis 30 hari. Tidak perlu kartu kredit.
              </p>
              
              <button 
                onClick={() => navigate('/login')}
                className="px-10 py-4 bg-white text-teal-700 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl border-2 border-gray-200"
              >
                Mulai Gratis Sekarang →
              </button>
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
                <a href="/#pricing" className="text-gray-600 hover:text-teal-600 transition-colors font-medium">Harga</a>
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
  )
}

export default FeaturesPage
