import { AppPage } from '../types';

export const DEFAULT_TEMPLATE_PAGES: AppPage[] = [
  {
    id: 'index-html',
    name: 'index.html',
    title: 'Halaman Beranda',
    type: 'html',
    isDefault: true,
    content: `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AuraTech AI - Solusi Cerdas Masa Depan</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="styles.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 antialiased min-h-screen flex flex-col selection:bg-amber-500/30 selection:text-amber-200">

  <!-- NAVIGATION BAR -->
  <header class="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center font-bold text-slate-950 text-lg shadow-md shadow-amber-500/20">
          A
        </div>
        <span class="font-bold text-xl tracking-tight text-white">Aura<span class="text-amber-400">Tech</span></span>
      </div>

      <!-- Navigation Links -->
      <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
        <a href="index.html" class="text-amber-400 font-semibold transition-colors">Beranda</a>
        <a href="about.html" class="hover:text-amber-300 transition-colors">Tentang Kami</a>
        <a href="services.html" class="hover:text-amber-300 transition-colors">Layanan</a>
        <a href="contact.html" class="hover:text-amber-300 transition-colors">Kontak</a>
      </nav>

      <div class="flex items-center gap-3">
        <a href="contact.html" class="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold transition-all shadow-md shadow-amber-500/20">
          Mulai Sekarang
        </a>
      </div>
    </div>
  </header>

  <!-- HERO SECTION -->
  <main class="flex-1">
    <section class="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-6">
        <span>✨ Generasi Baru Kecerdasan Buatan</span>
      </div>
      
      <h1 class="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight max-w-4xl mx-auto">
        Otomatisasi Alur Kerja Anda dengan <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">Kecerdasan Super</span>
      </h1>

      <p class="text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
        Tingkatkan produktivitas tim hingga 10x lipat dengan platform terintegrasi. Analisis data, pembuatan kode, dan prediksi bisnis secara instan.
      </p>

      <div class="flex flex-wrap justify-center gap-4">
        <a href="services.html" class="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-500/25">
          Jelajahi Layanan
        </a>
        <a href="about.html" class="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm transition-all">
          Pelajari Lebih Lanjut
        </a>
      </div>
    </section>

    <!-- STATS GRID -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-y border-slate-800/80 my-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div>
          <div class="text-3xl sm:text-4xl font-extrabold text-amber-400 mb-1">99.9%</div>
          <div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Uptime Server</div>
        </div>
        <div>
          <div class="text-3xl sm:text-4xl font-extrabold text-amber-400 mb-1">10M+</div>
          <div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Permintaan API</div>
        </div>
        <div>
          <div class="text-3xl sm:text-4xl font-extrabold text-amber-400 mb-1">2.4k</div>
          <div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Pengguna Aktif</div>
        </div>
        <div>
          <div class="text-3xl sm:text-4xl font-extrabold text-amber-400 mb-1">4.9/5</div>
          <div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Rating Kepuasan</div>
        </div>
      </div>
    </section>

    <!-- HIGHLIGHT FEATURES -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-white mb-3">Solusi Komprehensif</h2>
        <p class="text-slate-400 max-w-xl mx-auto text-sm">Dirancang untuk kebutuhan skala startup hingga korporasi multinasional.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-all">
          <div class="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xl mb-4">
            ⚡
          </div>
          <h3 class="text-lg font-bold text-white mb-2">Pemrosesan Kilat</h3>
          <p class="text-slate-400 text-sm leading-relaxed">Eksekusi query dan kalkulasi data masif dengan latensi di bawah 15 milidetik secara global.</p>
        </div>

        <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-all">
          <div class="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xl mb-4">
            🔒
          </div>
          <h3 class="text-lg font-bold text-white mb-2">Keamanan Berlapis</h3>
          <p class="text-slate-400 text-sm leading-relaxed">Enkripsi AES-256 bawaan, otorisasi RBAC, dan audit log real-time untuk kepatuhan SOC-2.</p>
        </div>

        <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-all">
          <div class="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xl mb-4">
            🚀
          </div>
          <h3 class="text-lg font-bold text-white mb-2">Integrasi Otomatis</h3>
          <p class="text-slate-400 text-sm leading-relaxed">Koneksi mulus dengan database favorit Anda, API eksternal, dan workflow GitHub CI/CD.</p>
        </div>
      </div>
    </section>
  </main>

  <!-- FOOTER -->
  <footer class="bg-slate-950 border-t border-slate-900 py-8 text-center text-slate-500 text-xs">
    <p>&copy; 2026 AuraTech AI. Seluruh hak cipta dilindungi undang-undang.</p>
  </footer>

  <script src="app.js"></script>
</body>
</html>`
  },
  {
    id: 'about-html',
    name: 'about.html',
    title: 'Halaman Tentang Kami',
    type: 'html',
    content: `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tentang Kami - AuraTech AI</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="styles.css">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style> body { font-family: 'Plus Jakarta Sans', sans-serif; } </style>
</head>
<body class="bg-slate-950 text-slate-100 antialiased min-h-screen flex flex-col">

  <!-- NAVIGATION BAR -->
  <header class="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center font-bold text-slate-950 text-lg">A</div>
        <span class="font-bold text-xl tracking-tight text-white">Aura<span class="text-amber-400">Tech</span></span>
      </div>

      <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
        <a href="index.html" class="hover:text-amber-300 transition-colors">Beranda</a>
        <a href="about.html" class="text-amber-400 font-semibold transition-colors">Tentang Kami</a>
        <a href="services.html" class="hover:text-amber-300 transition-colors">Layanan</a>
        <a href="contact.html" class="hover:text-amber-300 transition-colors">Kontak</a>
      </nav>

      <a href="contact.html" class="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold transition-all">
        Hubungi Kami
      </a>
    </div>
  </header>

  <!-- CONTENT -->
  <main class="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="text-center mb-16">
      <h1 class="text-4xl font-extrabold text-white mb-4">Visi &amp; Misi Kami</h1>
      <p class="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
        Mendemokratisasi pemanfaatan kecerdasan buatan kelas dunia agar bisnis dari semua tingkatan dapat berkembang pesat.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
      <div class="p-8 rounded-2xl bg-slate-900/80 border border-slate-800">
        <h2 class="text-2xl font-bold text-amber-400 mb-3">Dedikasi Mutu</h2>
        <p class="text-slate-300 leading-relaxed text-sm">
          Kami percaya bahwa arsitektur yang kokoh adalah fondasi inovasi masa depan. Setiap modul dioptimalkan untuk kecepatan dan keandalan tanpa kompromi.
        </p>
      </div>

      <div class="p-8 rounded-2xl bg-slate-900/80 border border-slate-800">
        <h2 class="text-2xl font-bold text-amber-400 mb-3">Inovasi Terbuka</h2>
        <p class="text-slate-300 leading-relaxed text-sm">
          Dukungan terhadap ekosistem open-source dan integrasi multi-database memastikan data Anda selalu independen dan dapat dipindahkan kapan saja.
        </p>
      </div>
    </div>

    <div class="text-center">
      <a href="index.html" class="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-semibold text-sm">
        &larr; Kembali ke Beranda
      </a>
    </div>
  </main>

  <footer class="bg-slate-950 border-t border-slate-900 py-8 text-center text-slate-500 text-xs">
    <p>&copy; 2026 AuraTech AI. Seluruh hak cipta dilindungi undang-undang.</p>
  </footer>
  <script src="app.js"></script>
</body>
</html>`
  },
  {
    id: 'services-html',
    name: 'services.html',
    title: 'Halaman Layanan',
    type: 'html',
    content: `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Layanan & Paket - AuraTech AI</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="styles.css">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style> body { font-family: 'Plus Jakarta Sans', sans-serif; } </style>
</head>
<body class="bg-slate-950 text-slate-100 antialiased min-h-screen flex flex-col">

  <header class="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center font-bold text-slate-950 text-lg">A</div>
        <span class="font-bold text-xl tracking-tight text-white">Aura<span class="text-amber-400">Tech</span></span>
      </div>

      <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
        <a href="index.html" class="hover:text-amber-300 transition-colors">Beranda</a>
        <a href="about.html" class="hover:text-amber-300 transition-colors">Tentang Kami</a>
        <a href="services.html" class="text-amber-400 font-semibold transition-colors">Layanan</a>
        <a href="contact.html" class="hover:text-amber-300 transition-colors">Kontak</a>
      </nav>

      <a href="contact.html" class="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold">
        Konsultasi Gratis
      </a>
    </div>
  </header>

  <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="text-center mb-16">
      <h1 class="text-4xl font-extrabold text-white mb-4">Paket &amp; Layanan Fleksibel</h1>
      <p class="text-slate-400 text-base max-w-xl mx-auto">Pilih paket sesuai kebutuhan komputasi dan pertumbuhan bisnis Anda.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Starter -->
      <div class="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
        <div>
          <h3 class="text-xl font-bold text-white mb-2">Starter</h3>
          <div class="text-3xl font-extrabold text-amber-400 mb-4">Gratis <span class="text-sm font-normal text-slate-400">/ selamanya</span></div>
          <p class="text-slate-400 text-sm mb-6">Cocok untuk pengembang solo dan proyek prototipe.</p>
          <ul class="space-y-3 text-sm text-slate-300 mb-8">
            <li>✓ 100k API Request / bulan</li>
            <li>✓ 1 Database aktif</li>
            <li>✓ Dukungan Komunitas</li>
          </ul>
        </div>
        <a href="contact.html" class="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-center font-semibold text-sm transition-all block">
          Pilih Starter
        </a>
      </div>

      <!-- Professional (Featured) -->
      <div class="p-8 rounded-2xl bg-slate-900 border-2 border-amber-500/60 flex flex-col justify-between relative shadow-xl shadow-amber-500/10">
        <div class="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider">
          Paling Populer
        </div>
        <div>
          <h3 class="text-xl font-bold text-white mb-2">Pro Business</h3>
          <div class="text-3xl font-extrabold text-amber-400 mb-4">Rp 499rb <span class="text-sm font-normal text-slate-400">/ bulan</span></div>
          <p class="text-slate-400 text-sm mb-6">Untuk startup yang berkembang dan tim profesional.</p>
          <ul class="space-y-3 text-sm text-slate-300 mb-8">
            <li>✓ Permintaan API Tanpa Batas</li>
            <li>✓ Integrasi 11 Database Lengkap</li>
            <li>✓ Sinkronisasi GitHub Otomatis</li>
            <li>✓ SLA 99.9% &amp; Prioritas 24/7</li>
          </ul>
        </div>
        <a href="contact.html" class="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-center font-bold text-sm transition-all block shadow-md shadow-amber-500/25">
          Mulai Sekarang
        </a>
      </div>

      <!-- Enterprise -->
      <div class="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
        <div>
          <h3 class="text-xl font-bold text-white mb-2">Enterprise</h3>
          <div class="text-3xl font-extrabold text-amber-400 mb-4">Kustom</div>
          <p class="text-slate-400 text-sm mb-6">Untuk korporasi dengan kebutuhan kepatuhan khusus.</p>
          <ul class="space-y-3 text-sm text-slate-300 mb-8">
            <li>✓ Dedicated Cluster Khusus</li>
            <li>✓ Enkripsi On-Premise</li>
            <li>✓ Akun Manajer Pribadi</li>
          </ul>
        </div>
        <a href="contact.html" class="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-center font-semibold text-sm transition-all block">
          Hubungi Sales
        </a>
      </div>
    </div>
  </main>

  <footer class="bg-slate-950 border-t border-slate-900 py-8 text-center text-slate-500 text-xs">
    <p>&copy; 2026 AuraTech AI. Seluruh hak cipta dilindungi undang-undang.</p>
  </footer>
  <script src="app.js"></script>
</body>
</html>`
  },
  {
    id: 'contact-html',
    name: 'contact.html',
    title: 'Halaman Kontak',
    type: 'html',
    content: `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kontak Kami - AuraTech AI</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="styles.css">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style> body { font-family: 'Plus Jakarta Sans', sans-serif; } </style>
</head>
<body class="bg-slate-950 text-slate-100 antialiased min-h-screen flex flex-col">

  <header class="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center font-bold text-slate-950 text-lg">A</div>
        <span class="font-bold text-xl tracking-tight text-white">Aura<span class="text-amber-400">Tech</span></span>
      </div>

      <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
        <a href="index.html" class="hover:text-amber-300 transition-colors">Beranda</a>
        <a href="about.html" class="hover:text-amber-300 transition-colors">Tentang Kami</a>
        <a href="services.html" class="hover:text-amber-300 transition-colors">Layanan</a>
        <a href="contact.html" class="text-amber-400 font-semibold transition-colors">Kontak</a>
      </nav>

      <a href="index.html" class="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold">
        Beranda
      </a>
    </div>
  </header>

  <main class="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-extrabold text-white mb-3">Hubungi Tim Kami</h1>
      <p class="text-slate-400 text-sm max-w-md mx-auto">Kami siap membantu menjawab pertanyaan teknis dan kebutuhan implementasi Anda.</p>
    </div>

    <div class="bg-slate-900/70 border border-slate-800 rounded-2xl p-8 shadow-xl">
      <form id="contactForm" onsubmit="event.preventDefault(); alert('Terima kasih! Pesan Anda telah kami terima.');" class="space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Nama Lengkap</label>
            <input type="text" required placeholder="Contoh: Alex Pratama" class="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Alamat Email</label>
            <input type="email" required placeholder="alex@perusahaan.com" class="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500">
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Subjek Pesan</label>
          <input type="text" required placeholder="Pertanyaan integrasi sistem" class="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500">
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Pesan Anda</label>
          <textarea rows="4" required placeholder="Tuliskan kebutuhan Anda di sini..." class="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"></textarea>
        </div>

        <button type="submit" class="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-500/25">
          Kirim Pesan Sekarang
        </button>
      </form>
    </div>
  </main>

  <footer class="bg-slate-950 border-t border-slate-900 py-8 text-center text-slate-500 text-xs">
    <p>&copy; 2026 AuraTech AI. Seluruh hak cipta dilindungi undang-undang.</p>
  </footer>
  <script src="app.js"></script>
</body>
</html>`
  },
  {
    id: 'styles-css',
    name: 'styles.css',
    title: 'Gaya Desain CSS',
    type: 'css',
    content: `/* Custom Luxury Styling & Animations */
:root {
  --primary-accent: #f59e0b;
  --primary-glow: rgba(245, 158, 11, 0.25);
}

/* Smooth transitions */
* {
  transition-property: color, background-color, border-color, transform, opacity;
  transition-duration: 150ms;
}

/* Custom glow card */
.feature-card {
  background: radial-gradient(120% 120% at 50% 0%, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.95) 100%);
  border: 1px solid rgba(245, 158, 11, 0.15);
}

.feature-card:hover {
  border-color: rgba(245, 158, 11, 0.4);
  box-shadow: 0 10px 25px -5px var(--primary-glow);
}
`
  },
  {
    id: 'app-js',
    name: 'app.js',
    title: 'Logika & Interaktivitas JS',
    type: 'js',
    content: `// AuraTech Interactive Script
document.addEventListener('DOMContentLoaded', () => {
  console.log('AuraTech AI App Initialized');
  
  // Smooth scroll for anchor tags
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
`
  }
];
