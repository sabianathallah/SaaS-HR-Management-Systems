'use client';

import { useState } from 'react';
import React from 'react';
import {
  Users, Clock, DollarSign, Calendar,
  BarChart, FileText, Target, Award
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const features = [
  {
    id: 'attendance',
    name: 'Absensi & Kehadiran',
    icon: Clock,
    description: 'Kelola absensi karyawan dengan sistem check-in/out, GPS tracking, dan integrasi face recognition',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40'
  },
  {
    id: 'payroll',
    name: 'Payroll & Penggajian',
    icon: DollarSign,
    description: 'Hitung gaji otomatis dengan komponen yang fleksibel, PPh 21, BPJS, dan slip gaji digital',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f'
  },
  {
    id: 'leave',
    name: 'Cuti & Izin',
    icon: Calendar,
    description: 'Manajemen cuti tahunan, sakit, izin dengan approval workflow dan kalkulasi saldo otomatis',
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe'
  },
  {
    id: 'employee',
    name: 'Database Karyawan',
    icon: Users,
    description: 'Kelola data karyawan lengkap, struktur organisasi, dan riwayat karir dalam satu sistem',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c'
  },
  {
    id: 'performance',
    name: 'Performance Management',
    icon: Target,
    description: 'Set KPI, lakukan review berkala, dan tracking pencapaian karyawan dengan mudah',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f'
  },
  {
    id: 'report',
    name: 'Laporan & Analytics',
    icon: BarChart,
    description: 'Dashboard real-time dan laporan lengkap untuk insight HR yang data-driven',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71'
  },
  {
    id: 'recruitment',
    name: 'Recruitment',
    icon: FileText,
    description: 'Kelola proses rekrutmen dari job posting hingga onboarding karyawan baru',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85'
  },
  {
    id: 'training',
    name: 'Training & Development',
    icon: Award,
    description: 'Platform learning management untuk training karyawan dan pengembangan skill',
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655'
  }
];

export function FeaturePreview() {
  const [selectedFeature, setSelectedFeature] = useState(features[0]);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-[#1A9B9A] font-semibold text-sm uppercase tracking-wide">
            Fitur Lengkap
          </span>
          <h2 className="mt-3 text-3xl lg:text-4xl font-bold text-gray-900">
            Semua yang Anda Butuhkan dalam Satu Platform
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Eksplorasi fitur-fitur canggih yang dirancang untuk mempermudah pekerjaan HR Anda
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Feature List */}
          <div className="lg:col-span-4 space-y-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              const isSelected = selectedFeature.id === feature.id;
              return (
                <button
                  key={feature.id}
                  onClick={() => setSelectedFeature(feature)}
                  className={`w-full text-left p-4 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-[#1A9B9A] text-white shadow-lg'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-white'}`}>
                      <Icon size={24} className={isSelected ? 'text-white' : 'text-[#1A9B9A]'} />
                    </div>
                    <h3 className="font-semibold">{feature.name}</h3>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Side - Feature Preview */}
          <div className="lg:col-span-8">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-xl">
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  {React.createElement(selectedFeature.icon, {
                    size: 32,
                    className: 'text-[#1A9B9A]'
                  })}
                  <h3 className="text-2xl font-bold text-gray-900">{selectedFeature.name}</h3>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed">{selectedFeature.description}</p>
              </div>

              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src={selectedFeature.image}
                  alt={selectedFeature.name}
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Status</p>
                        <p className="font-semibold text-gray-900">Ready to Use</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Integration</p>
                        <p className="font-semibold text-gray-900">Available</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid sm:grid-cols-2 gap-4">
                {['Real-time monitoring & tracking', 'Customizable workflows', 'Mobile app support', 'Automated notifications'].map((item) => (
                  <div key={item} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-[#1A9B9A] rounded-full mt-2" />
                    <p className="text-gray-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
