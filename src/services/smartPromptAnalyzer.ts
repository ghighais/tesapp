import { AppPage } from '../types';

export interface PromptAnalysis {
  category: string;
  categoryName: string;
  detectedFeatures: string[];
  recommendedPages: { name: string; title: string; desc: string }[];
  primaryColor: string;
  themeStyle: string;
  enhancedPrompt: string;
  interactiveBehaviors: string[];
  businessIdentity: {
    name: string;
    tagline: string;
    description: string;
    highlights: { icon: string; title: string; desc: string }[];
  };
}

/**
 * Intelligent Semantic Prompt Analyzer for GHIGHAIS AI
 * Deeply examines user instructions, detects intent, pages, domain, and interactive features.
 */
export function analyzePromptSemantics(userPrompt: string, githubContext?: string): PromptAnalysis {
  const p = (userPrompt || '').toLowerCase();
  const gh = (githubContext || '').toLowerCase();
  const text = `${p} ${gh}`;

  // Domain & Category detection
  if (text.match(/(toko|shop|store|ecommerce|e-commerce|belanja|jual|beli|produk|baju|sepatu|fashion|keranjang|checkout|kue|bakery)/)) {
    return {
      category: 'ecommerce',
      categoryName: 'Toko Online & E-Commerce Premium',
      primaryColor: 'emerald',
      themeStyle: 'Modern Luxury Retail & Warm Accent',
      detectedFeatures: [
        'Katalog Produk Interaktif dengan Filter Kategori',
        'Live Search Pencarian Produk Seketika',
        'Sistem Keranjang Belanja (Shopping Cart) Dinamis',
        'Badge Promo & Rating Ulasan Bintang',
        'Modal Detail Cepat & Form Checkout WhatsApp',
        'FAQ & Testimoni Pelanggan Terverifikasi'
      ],
      recommendedPages: [
        { name: 'index.html', title: 'Beranda & Showcase', desc: 'Hero promosi, produk terlaris, banner diskon & ulasan pelanggan' },
        { name: 'about.html', title: 'Tentang Kami', desc: 'Kisah pendiri, filosofi kualitas, dan komitmen pelayanan' },
        { name: 'services.html', title: 'Katalog Produk', desc: 'Katalog lengkap dengan pencarian, filter kategori, dan tombol keranjang' },
        { name: 'contact.html', title: 'Hubungi Kami', desc: 'Formulir order langsung, integrasi WhatsApp, dan alamat toko' }
      ],
      interactiveBehaviors: [
        'Filter kategori seketika (Semua, Best Seller, Pilihan)',
        'Penghitung keranjang belanja otomatis saat klik "Beli"',
        'Pencarian produk realtime dengan keyboard',
        'Notifikasi pop-up toast interaktif saat item ditambahkan'
      ],
      businessIdentity: {
        name: 'AuraLuxe Store',
        tagline: 'Koleksi Eksklusif Berkualitas Tinggi untuk Gaya Hidup Modern',
        description: 'Menghadirkan kurasi produk premium terbaik dengan jaminan keaslian 100%, pengiriman kilat terpercaya, dan kepuasan pelanggan nomor satu.',
        highlights: [
          { icon: '✨', title: 'Kualitas Teruji', desc: 'Setiap produk melalui seleksi ketat standar internasional.' },
          { icon: '🚀', title: 'Pengiriman Kilat', desc: 'Gratis ongkir ke seluruh Indonesia dengan pelacakan aman.' },
          { icon: '🛡️', title: 'Garansi 30 Hari', desc: 'Jaminan uang kembali jika barang tidak sesuai harapan Anda.' }
        ]
      },
      enhancedPrompt: `Buat aplikasi web E-Commerce Modern "${userPrompt}". Sediakan halaman beranda dengan hero menarik, katalog produk interaktif dengan fitur filter kategori dan live search, sistem keranjang belanja dinamis, testimoni pelanggan, serta formulir pemesanan responsif.`
    };
  }

  if (text.match(/(fintech|bank|keuangan|crypto|saham|investasi|dompet|wallet|payment|bayar|transaksi|akuntansi)/)) {
    return {
      category: 'fintech',
      categoryName: 'Platform FinTech & Layanan Keuangan',
      primaryColor: 'cyan',
      themeStyle: 'Deep Cyberpunk Dark Luxury & Neon Glow',
      detectedFeatures: [
        'Kalkulator Estimasi Hasil Investasi / Simulasi Keuangan',
        'Tabel Kurs & Status Aset Real-Time',
        'Keamanan Tingkat Bank (Bank-Grade 256-bit Encryption)',
        'Tabel Perbandingan Paket Akun & Biaya Transparansi',
        'Formulir Registrasi Cepat dengan Validasi Input',
        'Pusat Bantuan & Panduan Keamanan Akun'
      ],
      recommendedPages: [
        { name: 'index.html', title: 'Beranda FinTech', desc: 'Hero teknologi masa depan, statistik aset terkelola, dan fitur unggulan' },
        { name: 'about.html', title: 'Keamanan & Regulasi', desc: 'Lisensi resmi, tim pakar keamanan, dan visi inklusi finansial' },
        { name: 'services.html', title: 'Solusi Finansial', desc: 'Layanan tabungan, transfer instan, investasi, dan kalkulator interaktif' },
        { name: 'contact.html', title: 'Konsultasi Finansial', desc: 'Bantuan 24/7, live chat, dan formulir pendaftaran nasabah baru' }
      ],
      interactiveBehaviors: [
        'Kalkulator simulasi profit / tabungan yang merespons slider input',
        'Animasi status transaksi dan visual indikator status aman',
        'FAQ accordion interaktif untuk tanya jawab seputar regulasi',
        'Notifikasi pengiriman formulir konsultasi cepat'
      ],
      businessIdentity: {
        name: 'NovaFin Global',
        tagline: 'Masa Depan Keuangan Digital yang Cepat, Transparan, & Terpercaya',
        description: 'Kelola aset finansial Anda dengan teknologi mutakhir tanpa biaya tersembunyi. Didukung enkripsi militer dan kepatuhan standar internasional.',
        highlights: [
          { icon: '🔒', title: 'Enkripsi 256-bit', desc: 'Keamanan data dan transaksi terlindungi standar tertinggi.' },
          { icon: '⚡', title: 'Transfer Seketika', desc: 'Proses penyelesaian transaksi dalam hitungan detik 24/7.' },
          { icon: '📊', title: 'Analitik Cerdas', desc: 'Wawasan keuangan komprehensif berbasis data presisi.' }
        ]
      },
      enhancedPrompt: `Buat aplikasi web FinTech Modern "${userPrompt}". Sediakan dashboard visual beranda dengan metrik pertumbuhan aset, kalkulator simulasi interaktif, penjelasan keamanan mutakhir, dan formulir konsultasi investasi yang profesional.`
    };
  }

  if (text.match(/(restoran|cafe|kafe|kuliner|makanan|minuman|resto|katering|catering|menu|resep|food|beverage)/)) {
    return {
      category: 'culinary',
      categoryName: 'Restoran Mewah, Kafe & Kuliner Eksklusif',
      primaryColor: 'amber',
      themeStyle: 'Warm Artisanal Luxury & Savory Highlights',
      detectedFeatures: [
        'Buku Menu Kuliner Interaktif dengan Filter (Makanan, Minuman, Dessert)',
        'Sistem Reservasi Meja Online dengan Pilihan Tanggal & Jumlah Tamu',
        'Sorotan Chef Pilihan & Bahan Baku Segar Lokal',
        'Galeri Suasana Restoran & Ruang VIP',
        'Ulasan Pengunjung & Penghargaan Gastronomi',
        'Peta Lokasi Interaktif & Jam Operasional Lengkap'
      ],
      recommendedPages: [
        { name: 'index.html', title: 'Beranda Restoran', desc: 'Suasana elegan, menu chef signature, dan tombol reservasi meja' },
        { name: 'about.html', title: 'Tentang Dapur Kami', desc: 'Kisah cita rasa, filosofi rempah, dan profil Executive Chef' },
        { name: 'services.html', title: 'Buku Menu Lengkap', desc: 'Daftar menu terstruktur dengan harga, kalori, dan filter kategori' },
        { name: 'contact.html', title: 'Reservasi & Kontak', desc: 'Formulir booking meja instan, maps, dan narahubung private event' }
      ],
      interactiveBehaviors: [
        'Filter tab kategori menu (Signature, Appetizer, Main Course, Drinks)',
        'Form reservasi meja dengan kalkulasi konfirmasi instan',
        'Peta rute dan tombol panggilan cepat WhatsApp',
        'Ulasan pelanggan interaktif dengan rating bintang'
      ],
      businessIdentity: {
        name: 'Gourmet Bistro Nusantara',
        tagline: 'Simfoni Cita Rasa Autentik dalam Suasana Kemewahan Modern',
        description: 'Menyajikan sajian kuliner istimewa yang diracik dari bahan-bahan organik pilihan terbaik oleh koki berpengalaman bertaraf dunia.',
        highlights: [
          { icon: '🌿', title: '100% Bahan Organik', desc: 'Segar dipanen setiap subuh dari mitra petani terpercaya.' },
          { icon: '👨‍🍳', title: 'Master Chef', desc: 'Dikelola oleh koki pemenang penghargaan kuliner prestisius.' },
          { icon: '🍷', title: 'Suasana Eksklusif', desc: 'Ruang santai intim dengan pencahayaan hangat dan musik akustik.' }
        ]
      },
      enhancedPrompt: `Buat aplikasi web Restoran & Kuliner Modern "${userPrompt}". Hadirkan daftar menu interaktif dengan filter kategori, sistem formulir reservasi meja online, galeri visual yang menggugah selera, dan informasi jam operasional yang lengkap.`
    };
  }

  if (text.match(/(kesehatan|klinik|medis|dokter|rumah sakit|hospital|terapi|gigi|dental|apotek|farmasi|obat|psikolog)/)) {
    return {
      category: 'healthcare',
      categoryName: 'Klinik Kesehatan & Layanan Medis Modern',
      primaryColor: 'sky',
      themeStyle: 'Clean Clinical Trust & Calming Cyan Accents',
      detectedFeatures: [
        'Sistem Booking Jadwal Konsultasi Dokter Online',
        'Daftar Dokter Spesialis Lengkap dengan Jam Praktik',
        'Paket Medical Check Up (MCU) & Fasilitas Diagnostik',
        'Emergency Hotline & Pelayanan Ambulans 24 Jam',
        'Artikel Tips Kesehatan & Panduan Pencegahan',
        'Formulir Janji Temu dengan Notifikasi Konfirmasi'
      ],
      recommendedPages: [
        { name: 'index.html', title: 'Beranda Medis', desc: 'Pusat layanan kesehatan terpadu, dokter unggulan, dan booking cepat' },
        { name: 'about.html', title: 'Tim Dokter & Fasilitas', desc: 'Profil dokter spesialis, akreditasi medis, dan teknologi laboratorium' },
        { name: 'services.html', title: 'Layanan Medis & Paket', desc: 'Daftar poliklinik, tarif MCU, dan informasi tindakan' },
        { name: 'contact.html', title: 'Janji Temu & Lokasi', desc: 'Formulir registrasi pasien baru, jadwal dokter, dan ambulans darurat' }
      ],
      interactiveBehaviors: [
        'Pemilih jadwal konsultasi dokter interaktif',
        'Pencarian poli dan spesialisasi secara instan',
        'Tombol panggilan darurat langsung ke ambulans',
        'Form pendaftaran pasien dengan validasi data'
      ],
      businessIdentity: {
        name: 'MediCare Plus Clinic',
        tagline: 'Pelayanan Kesehatan Profesional, Humanis, & Berteknologi Terkini',
        description: 'Klinik kesehatan keluarga terpadu dengan standar akreditasi paripurna, dokter spesialis berpengalaman, dan fasilitas diagnostik modern.',
        highlights: [
          { icon: '🩺', title: 'Dokter Spesialis Ahli', desc: 'Didukung dokter spesialis lulusan universitas terkemuka.' },
          { icon: '🔬', title: 'Lab Diagnostik Akurat', desc: 'Pemeriksaan laboratorium cepat dengan akurasi terkalibrasi.' },
          { icon: '⏱️', title: 'Tanpa Antre Lama', desc: 'Sistem janji temu terjadwal menjamin efisiensi waktu Anda.' }
        ]
      },
      enhancedPrompt: `Buat aplikasi web Layanan Kesehatan Modern "${userPrompt}". Lengkapi dengan profil dokter spesialis, paket perawatan terstruktur, sistem booking janji temu pasien interaktif, dan hotline darurat yang responsif.`
    };
  }

  if (text.match(/(portofolio|portfolio|kreatif|desain|fotografi|agency|agensi|freelance|arsitek|videografi|cv|resume)/)) {
    return {
      category: 'portfolio',
      categoryName: 'Portofolio Kreatif & Agensi Desain Digital',
      primaryColor: 'violet',
      themeStyle: 'Avant-Garde Dark Elegance & Vibrant Violet Accents',
      detectedFeatures: [
        'Galeri Showcase Proyek Interaktif dengan Filter Kategori',
        'Timeline Pengalaman Karir & Pencapaian Penghargaan',
        'Daftar Skill Teknis dengan Visual Indikator Kemahiran',
        'Testimoni Klien Ternama & Studi Kasus Dampak',
        'Paket Jasa Kreatif & Kerjasama Proyek',
        'Formulir Kontak Kolaborasi / Brief Proyek Baru'
      ],
      recommendedPages: [
        { name: 'index.html', title: 'Beranda Kreatif', desc: 'Hero tipografi berani, karya unggulan, dan ringkasan reputasi profesional' },
        { name: 'about.html', title: 'Profil & Filosofi', desc: 'Kisah perjalanan karir, manifesto desain, dan metodologi kerja' },
        { name: 'services.html', title: 'Karya & Layanan', desc: 'Galeri portofolio lengkap dengan filter proyek dan paket kerjasama' },
        { name: 'contact.html', title: 'Mulai Kolaborasi', desc: 'Formulir brief proyek, perkiraan budget, dan jadwal diskusi' }
      ],
      interactiveBehaviors: [
        'Filter kategori proyek (UI/UX, Branding, Web, Motion)',
        'Efek hover kartu proyek yang memunculkan studi kasus singkat',
        'Pilihan paket kerjasama dengan tombol inquiry langsung',
        'Formulir kontak brief proyek responsif'
      ],
      businessIdentity: {
        name: 'Nexus Studio Kreatif',
        tagline: 'Mentransformasi Ide Visioner Menjadi Pengalaman Digital Luar Biasa',
        description: 'Kami adalah studio desain multidisiplin yang membantu brand global dan startup inovatif menciptakan identitas digital yang berkarakter kuat.',
        highlights: [
          { icon: '🏆', title: 'Pemenang Desain', desc: 'Karya kami telah diakui di berbagai kompetisi desain internasional.' },
          { icon: '⚡', title: 'Eksekusi Presisi', desc: 'Dari wireframe hingga kode siap pakai dengan standar kesempurnaan.' },
          { icon: '💡', title: 'Strategi Berdampak', desc: 'Desain yang bukan hanya indah, tapi juga melipatgandakan konversi.' }
        ]
      },
      enhancedPrompt: `Buat aplikasi web Portofolio Kreatif Modern "${userPrompt}". Tampilkan galeri showcase karya dengan filter interaktif, penjelasan metodologi desain, ulasan klien bereputasi, dan formulir pemesanan jasa kolaborasi proyek.`
    };
  }

  // Default: Universal SaaS / Tech Application
  return {
    category: 'universal',
    categoryName: 'Aplikasi Web & SaaS Modern Terintegrasi',
    primaryColor: 'amber',
    themeStyle: 'Sleek Obsidian Dark with Gold & Emerald Highlights',
    detectedFeatures: [
      'Arsitektur Multi-Halaman Responsif Siap Produksi',
      'Komponen Interaktif Realtime (Filter, Pencarian, Modal, Accordion)',
      'Tabel Fitur & Komparasi Paket Berlangganan',
      'Formulir Interaktif dengan Feedback Toast Otomatis',
      'Integrasi Navigasi Mulus & Desain Mobile-First',
      'Optimasi Kinerja Bebas Error (Zero-Error Architecture)'
    ],
    recommendedPages: [
      { name: 'index.html', title: 'Beranda Utama', desc: 'Hero headline tajam, ringkasan fitur, demonstrasi visual, dan call-to-action' },
      { name: 'about.html', title: 'Tentang Aplikasi', desc: 'Misi pengembangan, nilai arsitektur, dan komitmen terhadap pengguna' },
      { name: 'services.html', title: 'Fitur & Solusi', desc: 'Eksplorasi modul lengkap, studi kasus, dan simulasi interaktif' },
      { name: 'contact.html', title: 'Kontak & Dukungan', desc: 'Formulir konsultasi, dokumentasi panduan, dan saluran tim teknis' }
    ],
    interactiveBehaviors: [
      'Navigasi mulus antar halaman tanpa reload rusak',
      'Komponen interaktif responsif di layar mobile, tablet, dan desktop',
      'FAQ accordion dinamis untuk kemudahan navigasi informasi',
      'Validasi formulir langsung dengan feedback visual instan'
    ],
    businessIdentity: {
      name: 'GHIGHAIS Modern Suite',
      tagline: 'Platform Digital Inovatif untuk Meningkatkan Efisiensi & Hasil Maksimal',
      description: 'Dirancang secara presisi dengan arsitektur web modern, memastikan kecepatan rendering tertinggi, tampilan mewah, dan kenyamanan pengguna di semua perangkat.',
      highlights: [
        { icon: '⚡', title: 'Kinerja Kilat', desc: 'Kode optimal tanpa library berlebih, terbuka dalam sekejap mata.' },
        { icon: '🎨', title: 'Desain Mewah', desc: 'Estetika kontras tinggi, tipografi seimbang, dan tata letak elegan.' },
        { icon: '🛡️', title: 'Keamanan Tangguh', desc: 'Struktur kode tervalidasi bebas dari celah error.' }
      ]
    },
    enhancedPrompt: `Buat aplikasi web modern "${userPrompt}". Bangun struktur lengkap multi-halaman (Beranda, Tentang Kami, Solusi/Fitur, dan Kontak), lengkapi dengan komponen interaktif dinamis, desain mewah bernilai estetika tinggi, dan formulir responsif.`
  };
}
