const { initDb, supabase } = require('./database');

async function seedDummy() {
  await initDb();
  console.log('Menambahkan data dummy hewan ternak...\n');

  // Ambil category_id berdasarkan nama
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, name');

  if (catError || !categories || categories.length === 0) {
    console.error('Kategori tidak ditemukan! Jalankan seed.js terlebih dahulu.');
    process.exit(1);
  }

  const catMap = {};
  categories.forEach(c => { catMap[c.name.toLowerCase()] = c.id; });

  const sapiId   = catMap['sapi'];
  const kambingId = catMap['kambing'];
  const dombaId  = catMap['domba'];

  console.log(`ID Kategori → Sapi: ${sapiId}, Kambing: ${kambingId}, Domba: ${dombaId}\n`);

  const dummyProducts = [
    // ── SAPI ──────────────────────────────────────────────────────────────
    {
      category_id: sapiId,
      name: 'Sapi Limosin Jumbo A',
      description: 'Sapi Limosin unggul dengan berat badan besar, cocok untuk qurban Idul Adha maupun kebutuhan daging segar. Dibesarkan dengan pakan organik pilihan.',
      weight: 480,
      age: '2.5 Tahun',
      price: 32000000,
      gender: 'Jantan',
      health_status: 'Sehat',
      image: '/images/default-product.jpg',
      status: 'tersedia'
    },
    {
      category_id: sapiId,
      name: 'Sapi Brahman Cross',
      description: 'Hasil persilangan Brahman dengan sapi lokal, menghasilkan ternak yang tahan iklim tropis dan memiliki pertumbuhan bobot cepat.',
      weight: 410,
      age: '2 Tahun',
      price: 26000000,
      gender: 'Jantan',
      health_status: 'Sehat',
      image: '/images/default-product.jpg',
      status: 'tersedia'
    },
    {
      category_id: sapiId,
      name: 'Sapi Simental Betina Produktif',
      description: 'Sapi Simental betina usia produktif, sesuai untuk program breeding dan pengembangan populasi ternak perah maupun potong.',
      weight: 395,
      age: '3 Tahun',
      price: 27000000,
      gender: 'Betina',
      health_status: 'Sehat',
      image: '/images/default-product.jpg',
      status: 'tersedia'
    },
    {
      category_id: sapiId,
      name: 'Sapi Angus Hitam',
      description: 'Sapi Angus hitam dengan kualitas daging premium (marbling tinggi). Pilihan terbaik untuk restoran dan kebutuhan konsumsi premium.',
      weight: 460,
      age: '2.5 Tahun',
      price: 38000000,
      gender: 'Jantan',
      health_status: 'Sehat',
      image: '/images/default-product.jpg',
      status: 'tersedia'
    },
    {
      category_id: sapiId,
      name: 'Sapi PO Jantan Gemuk',
      description: 'Sapi Peranakan Ongole lokal dengan pemeliharaan tradisional. Cocok untuk qurban dan kebutuhan daging harian.',
      weight: 370,
      age: '2 Tahun',
      price: 22000000,
      gender: 'Jantan',
      health_status: 'Sehat',
      image: '/images/default-product.jpg',
      status: 'tersedia'
    },
    {
      category_id: sapiId,
      name: 'Sapi Madura Asli',
      description: 'Sapi Madura asli ras lokal yang terkenal tangguh dan mudah beradaptasi. Bobot proporsional, ideal untuk peternak pemula.',
      weight: 290,
      age: '2 Tahun',
      price: 17000000,
      gender: 'Jantan',
      health_status: 'Sehat',
      image: '/images/default-product.jpg',
      status: 'tersedia'
    },
    {
      category_id: sapiId,
      name: 'Sapi Bali Jantan Muda',
      description: 'Sapi Bali jantan muda dengan postur kompak dan otot kuat. Daya tahan tinggi, cocok dikembangkan di berbagai kondisi iklim.',
      weight: 260,
      age: '1.5 Tahun',
      price: 15000000,
      gender: 'Jantan',
      health_status: 'Sehat',
      image: '/images/default-product.jpg',
      status: 'tersedia'
    },

    // ── KAMBING ───────────────────────────────────────────────────────────
    {
      category_id: kambingId,
      name: 'Kambing Etawa Super Jantan',
      description: 'Kambing Etawa jantan super dengan tinggi badan ideal dan bulu tebal berkilau. Genetik unggul penghasil susu dan daging berkualitas.',
      weight: 75,
      age: '2 Tahun',
      price: 7500000,
      gender: 'Jantan',
      health_status: 'Sehat',
      image: '/images/default-product.jpg',
      status: 'tersedia'
    },
    {
      category_id: kambingId,
      name: 'Kambing Boer Betina Import',
      description: 'Kambing Boer betina ras impor dengan struktur tubuh besar dan lebar. Sangat ideal untuk program penggemukan dan breeding.',
      weight: 60,
      age: '1.5 Tahun',
      price: 5800000,
      gender: 'Betina',
      health_status: 'Sehat',
      image: '/images/default-product.jpg',
      status: 'tersedia'
    },
    {
      category_id: kambingId,
      name: 'Kambing Jawarandu Jantan',
      description: 'Kambing Jawarandu (Jawa Randu) jantan, hasil persilangan antara kambing Etawa dan kambing lokal. Tahan penyakit dan mudah perawatannya.',
      weight: 42,
      age: '1.5 Tahun',
      price: 3500000,
      gender: 'Jantan',
      health_status: 'Sehat',
      image: '/images/default-product.jpg',
      status: 'tersedia'
    },
    {
      category_id: kambingId,
      name: 'Kambing Kacang Betina',
      description: 'Kambing kacang betina yang prolifik (beranak banyak). Sangat cocok untuk peternak yang ingin mengembangkan populasi dengan modal terjangkau.',
      weight: 28,
      age: '1 Tahun',
      price: 2200000,
      gender: 'Betina',
      health_status: 'Sehat',
      image: '/images/default-product.jpg',
      status: 'tersedia'
    },
    {
      category_id: kambingId,
      name: 'Kambing Boer Jantan Qurban',
      description: 'Kambing Boer jantan siap qurban dengan bobot ideal. Telah melalui pemeriksaan kesehatan dan sertifikasi veteriner.',
      weight: 50,
      age: '1 Tahun',
      price: 4800000,
      gender: 'Jantan',
      health_status: 'Sehat',
      image: '/images/default-product.jpg',
      status: 'tersedia'
    },
    {
      category_id: kambingId,
      name: 'Kambing PE (Peranakan Etawa)',
      description: 'Kambing Peranakan Etawa dengan kemampuan produksi susu rata-rata 1-2 liter per hari. Cocok untuk usaha susu kambing etawa.',
      weight: 55,
      age: '2 Tahun',
      price: 5200000,
      gender: 'Betina',
      health_status: 'Sehat',
      image: '/images/default-product.jpg',
      status: 'tersedia'
    },

    // ── DOMBA ─────────────────────────────────────────────────────────────
    {
      category_id: dombaId,
      name: 'Domba Garut Adu Jantan',
      description: 'Domba Garut jantan dengan tanduk melengkung khas dan postur tubuh kokoh. Ras asli Garut yang terkenal kuat dan agresif. Nilai prestise tinggi.',
      weight: 55,
      age: '2 Tahun',
      price: 5500000,
      gender: 'Jantan',
      health_status: 'Sehat',
      image: '/images/default-product.jpg',
      status: 'tersedia'
    },
    {
      category_id: dombaId,
      name: 'Domba Merino Betina',
      description: 'Domba Merino betina dengan bulu putih lebat berkualitas tinggi. Ideal untuk usaha peternakan wol maupun breeding.',
      weight: 42,
      age: '1.5 Tahun',
      price: 4200000,
      gender: 'Betina',
      health_status: 'Sehat',
      image: '/images/default-product.jpg',
      status: 'tersedia'
    },
    {
      category_id: dombaId,
      name: 'Domba Ekor Gemuk Jantan',
      description: 'Domba ekor gemuk jantan pilihan, diternakkan secara tradisional dengan pakan hijauan segar. Dagingnya lezat dan rendah lemak.',
      weight: 40,
      age: '1 Tahun',
      price: 3800000,
      gender: 'Jantan',
      health_status: 'Sehat',
      image: '/images/default-product.jpg',
      status: 'tersedia'
    },
    {
      category_id: dombaId,
      name: 'Domba Texel Gemuk',
      description: 'Domba Texel dengan proporsi daging terhadap tulang yang sangat baik. Dikenal sebagai ras domba pedaging terbaik dunia.',
      weight: 50,
      age: '1.5 Tahun',
      price: 4700000,
      gender: 'Jantan',
      health_status: 'Sehat',
      image: '/images/default-product.jpg',
      status: 'tersedia'
    },
    {
      category_id: dombaId,
      name: 'Domba Lokal Betina Produktif',
      description: 'Domba lokal betina yang sudah terbukti produktif dan mudah beranak. Pilihan ekonomis untuk peternak yang baru memulai usaha.',
      weight: 30,
      age: '1 Tahun',
      price: 2800000,
      gender: 'Betina',
      health_status: 'Sehat',
      image: '/images/default-product.jpg',
      status: 'tersedia'
    },
    {
      category_id: dombaId,
      name: 'Domba Qurban Siap Potong',
      description: 'Domba jantan gemuk yang memenuhi syarat hewan qurban. Usia lebih dari 1 tahun, sehat, tidak cacat, dan telah melalui pemeriksaan dokter hewan.',
      weight: 38,
      age: '1.5 Tahun',
      price: 3500000,
      gender: 'Jantan',
      health_status: 'Sehat',
      image: '/images/default-product.jpg',
      status: 'tersedia'
    },
  ];

  // Insert semua produk dummy
  const { data: inserted, error: insertError } = await supabase
    .from('products')
    .insert(dummyProducts)
    .select('id, name');

  if (insertError) {
    console.error('Gagal menambahkan produk:', insertError.message);
    process.exit(1);
  }

  console.log(`✅ Berhasil menambahkan ${inserted.length} produk dummy:\n`);
  inserted.forEach((p, i) => console.log(`  ${i + 1}. [ID ${p.id}] ${p.name}`));

  console.log('\n=== Selesai! ===');
  console.log(`Total: ${dummyProducts.filter(p => p.category_id === sapiId).length} Sapi, ${dummyProducts.filter(p => p.category_id === kambingId).length} Kambing, ${dummyProducts.filter(p => p.category_id === dombaId).length} Domba`);
}

seedDummy().catch(console.error);
