import React from 'react';
import { Star, Quote } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const testimonials = [
  {
    name: 'Budi Santoso',
    position: 'HR Manager',
    company: 'PT. Tech Innovate',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
    rating: 5,
    comment: 'Salmon HRIS sangat membantu kami dalam mengelola karyawan. Proses payroll yang tadinya memakan waktu 3 hari, sekarang hanya butuh beberapa jam saja!'
  },
  {
    name: 'Siti Nurhaliza',
    position: 'CEO',
    company: 'Creative Studio Indonesia',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    rating: 5,
    comment: 'Interface yang user-friendly dan fitur yang lengkap. Tim kami bisa langsung menggunakan tanpa training yang rumit. Highly recommended!'
  },
  {
    name: 'Ahmad Rizki',
    position: 'Operations Director',
    company: 'Retail Solutions',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    rating: 5,
    comment: 'Dengan Salmon HRIS, kami bisa monitor kehadiran karyawan di berbagai cabang secara real-time. Sangat membantu untuk pengambilan keputusan bisnis.'
  },
  {
    name: 'Dewi Lestari',
    position: 'Finance Manager',
    company: 'Manufacturing Corp',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f',
    rating: 5,
    comment: 'Fitur payroll-nya sangat akurat dan terintegrasi dengan sistem accounting kami. Mengurangi error dan menghemat banyak waktu tim finance.'
  },
  {
    name: 'Rahmat Hidayat',
    position: 'IT Director',
    company: 'Digital Agency',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    rating: 5,
    comment: 'Security dan data privacy yang terjamin. API integration juga sangat mudah. Perfect solution untuk perusahaan yang sedang scaling up!'
  },
  {
    name: 'Linda Wijaya',
    position: 'HR Head',
    company: 'E-Commerce Platform',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    rating: 5,
    comment: 'Customer support yang responsif dan helpful. Setiap ada kendala langsung dibantu sampai selesai. Investasi yang sangat worth it!'
  }
];

export function TestimonialSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-[#1A9B9A] font-semibold text-sm uppercase tracking-wide">
            Testimoni
          </span>
          <h2 className="mt-3 text-3xl lg:text-4xl font-bold text-gray-900">
            Dipercaya oleh 10,000+ Perusahaan
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Dengar langsung dari pengguna yang telah merasakan manfaat Salmon HRIS
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow relative"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 text-[#1A9B9A] opacity-20">
                <Quote size={40} />
              </div>

              {/* Rating */}
              <div className="flex space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Comment */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.comment}"
              </p>

              {/* User Info */}
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                <ImageWithFallback
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">
                    {testimonial.position} • {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold text-[#1A9B9A]">10,000+</p>
            <p className="mt-2 text-gray-600">Perusahaan</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-[#1A9B9A]">500K+</p>
            <p className="mt-2 text-gray-600">Pengguna Aktif</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-[#1A9B9A]">98%</p>
            <p className="mt-2 text-gray-600">Kepuasan Customer</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-[#1A9B9A]">24/7</p>
            <p className="mt-2 text-gray-600">Customer Support</p>
          </div>
        </div>
      </div>
    </section>
  );
}
