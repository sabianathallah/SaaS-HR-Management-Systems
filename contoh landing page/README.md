# Salmon HRIS Landing Page

Landing page untuk aplikasi Salmon HRIS - Solusi HRIS Terlengkap untuk Perusahaan Modern.

## 🚀 Cara Menjalankan Aplikasi

### Prerequisites
- Node.js (versi 16 atau lebih tinggi)
- npm atau yarn

### Instalasi

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Jalankan Development Server**
   ```bash
   npm run dev
   ```

3. **Buka Browser**
   - Aplikasi akan berjalan di `http://localhost:5173` atau port lain jika sudah digunakan
   - Buka browser dan akses URL tersebut

### Build untuk Production

Untuk membuat build production-ready:

```bash
npm run build
```

File hasil build akan berada di folder `dist/`.

### Preview Build Production

Untuk melihat preview hasil build:

```bash
npm run preview
```

## 📁 Struktur Project

```
contoh landing page/
├── public/              # File statis
│   └── logo.svg        # Logo aplikasi
├── src/                # Source code
│   ├── App.tsx         # Main App component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── component/          # Komponen React
│   ├── Header.tsx      # Header dengan navigation
│   ├── HeroSection.tsx # Hero section
│   ├── TestimonialSection.tsx
│   ├── FeaturePreview.tsx
│   ├── CTASection.tsx
│   ├── Footer.tsx
│   ├── LoginPage.tsx
│   ├── TryFreePage.tsx
│   ├── figma/
│   │   └── ImageWithFallback.tsx
│   └── ui/             # UI Components
├── styles/             # Additional styles
├── package.json        # Dependencies
├── vite.config.ts      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── tsconfig.json       # TypeScript configuration
```

## 🎨 Fitur

- **Responsive Design** - Tampilan optimal di semua ukuran layar
- **Modern UI** - Menggunakan Tailwind CSS
- **TypeScript** - Type-safe code
- **Fast Development** - Powered by Vite
- **Icon Library** - Lucide React icons

## 🎯 Halaman yang Tersedia

1. **Home Page** - Landing page utama dengan fitur:
   - Header dengan navigation menu
   - Hero section
   - Testimonial section
   - Feature preview
   - CTA (Call to Action) section
   - Footer

2. **Login Page** - Halaman login untuk user
   - Email & password input
   - Remember me option
   - Forgot password link

3. **Try Free Page** - Halaman pendaftaran trial gratis
   - Form pendaftaran lengkap
   - List benefit yang didapat
   - 14 hari trial gratis

## 🛠️ Teknologi yang Digunakan

- **React 18** - UI Framework
- **TypeScript** - Programming Language
- **Vite** - Build Tool & Dev Server
- **Tailwind CSS** - CSS Framework
- **Lucide React** - Icon Library

## 📝 Scripts NPM

- `npm run dev` - Jalankan development server
- `npm run build` - Build untuk production
- `npm run preview` - Preview production build
- `npm run lint` - Jalankan ESLint

## 🎨 Kustomisasi

### Mengubah Warna Brand

Warna utama brand (`#1A9B9A`) dapat diubah di file-file komponen. Cari semua instance dari `#1A9B9A` dan `#158888` dan ganti dengan warna pilihan Anda.

### Mengubah Logo

Ganti file `public/logo.svg` dengan logo perusahaan Anda.

### Mengubah Konten

Edit file komponen di folder `component/` sesuai kebutuhan konten Anda.

## 🐛 Troubleshooting

### Port sudah digunakan
Jika port 5173 sudah digunakan, Vite akan otomatis mencoba port lain (5174, 5175, dst.)

### Error saat install
Coba hapus folder `node_modules` dan file `package-lock.json`, lalu jalankan `npm install` kembali.

### Build error
Pastikan semua dependencies sudah terinstall dengan benar dengan menjalankan:
```bash
npm install
npm run build
```

## 📄 License

Proprietary - Salmon HRIS

## 👥 Support

Untuk bantuan lebih lanjut, hubungi tim development Salmon HRIS.
