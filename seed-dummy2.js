const { initDb, supabase } = require('./database');

async function seedDummy2() {
  await initDb();
  console.log('Menambahkan 20 produk dummy dengan foto...\n');

  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, name');

  if (catError || !categories || categories.length === 0) {
    console.error('Kategori tidak ditemukan! Jalankan seed.js terlebih dahulu.');
    process.exit(1);
  }

  const catMap = {};
  categories.forEach(c => { catMap[c.name.toLowerCase()] = c.id; });

  const sapiId    = catMap['sapi'];
  const kambingId = catMap['kambing'];
  const dombaId   = catMap['domba'];

  const dummyProducts = [
    // ── SAPI (8 produk) ──────────────────────────────────────────────────
    {
      category_id: sapiId,
      name: 'Sapi Limosin Jantan XL',
      description: 'Sapi Limosin jantan besar dengan bobot jumbo di atas rata-rata. Diternakkan menggunakan pakan fermentasi berkualitas tinggi untuk pertumbuhan optimal.',
      weight: 510,
      age: '3 Tahun',
      price: 40000000,
      gender: 'Jantan',
      health_status: 'Sehat',
      image: '/images/sapi_limosin.png',
      status: 'tersedia'
    },
    {
      category_id: sapiId,
      name: 'Sapi Limosin Betina Indukan',
      description: 'Sapi Limosin betina produktif yang telah terbukti menghasilkan keturunan unggul. Pilihan terbaik untuk usaha pembibitan.',
      weight: 420,
      age: '3.5 Tahun',
      price: 33000000,
      gender: 'Betina',
      health_status: 'Sehat',
      image: '/images/sapi_limosin.png',
      status: 'tersedia'
    },
    {
      category_id: sapiId,
      name: 'Sapi Brahman Jantan Impor',
      description: 'Sapi Brahman jantan dengan garis keturunan impor. Dikenal tahan terhadap parasit tropis dan mampu mengkonversi pakan rendah kualitas menjadi daging.',
      weight: 450,
      age: '2.5 Tahun',
      price: 36000000,
      gender: 'Jantan',
      health_status: 'Sehat',
      image: '/images/sapi_brahman.png',
      status: 'tersedia'
    },
    {
      category_id: sapiId,
      name: 'Sapi Brahman Betina Muda',
      description: 'Sapi Brahman betina muda siap digemukkan atau dijadikan indukan. Tahan terhadap cuaca panas dan penyakit tropis.',
      weight: 350,
      age: '2 Tahun',
      price: 24000000,
      gender: 'Betina',
      health_status: 'Sehat',
      image: '/images/sapi_brahman.png',
      status: 'tersedia'
    },
    {
      category_id: sapiId,
      name: 'Sapi Angus Hitam Premium',
      description: 'Sapi Angus hitam dengan marbling daging terbaik di kelasnya. Ideal untuk pasokan restoran steak premium dan hotel bintang lima.',
      weight: 490,
      age: '2.5 Tahun',
      price: 42000000,
      gender: 'Jantan',
      health_status: 'Sehat',
      image: '/images/sapi_angus.png',
      status: 'tersedia'
    },
    {
      category_id: sapiId,
      name: 'Sapi Angus Betina Breeding',
      description: 'Sapi Angus betina dengan genetik premium untuk program breeding. Sudah terbukti beranak dan mudah perawatannya.',
      weight: 380,
      age: '3 Tahun',
      price: 30000000,
      gender: 'Betina',
      health_status: 'Sehat',
      image: '/images/sapi_angus.png',
      status: 'tersedia'
    },
    {
      category_id: sapiId,
      name: 'Sapi Simental Jantan Super',
      description: 'Sapi Simental jantan dengan pertumbuhan cepat dan efisiensi pakan tinggi. Cocok untuk penggemukan jangka pendek.',
      weight: 540,
      age: '2.5 Tahun',
      price: 38000000,
      gender: 'Jantan',
      health_status: 'Sehat',
      image: '/images/sapi_simental.png',
      status: 'tersedia'
    },
    {
      category_id: sapiId,
      name: 'Sapi Simental Betina Produktif',
      description: 'Sapi Simental betina dengan produksi susu dan daging yang seimbang. Sangat diminati untuk peternakan terpadu.',
      weight: 410,
      age: '3 Tahun',
      price: 28000000,
      gender: 'Betina',
      health_status: 'Sehat',
      image: '/images/sapi_simental.png',
      status: 'tersedia'
    },

    // ── KAMBING (7 produk) ───────────────────────────────────────────────
    {
      category_id: kambingId,
      name: 'Kambing Boer Jantan Super',
      description: 'Kambing Boer jantan tipe super dengan bobot badan di atas standar. Otot padat, badan bulat, dan kaki kokoh — ideal untuk penggemukan intensif.',
      weight: 70,
      age: '2 Tahun',
      price: 8500000,
      gender: 'Jantan',
      health_status: 'Sehat',
      image: '/images/kambing_boer.png',
      status: 'tersedia'
    },
    {
      category_id: kambingId,
      name: 'Kambing Boer Betina Super',
      description: 'Kambing Boer betina unggul dengan kemampuan melahirkan anak kembar. Produktivitas tinggi dan sifat keibuan yang baik.',
      weight: 58,
      age: '1.5 Tahun',
      price: 6500000,
      gender: 'Betina',
      health_status: 'Sehat',
      image: '/images/kambing_boer.png',
      status: 'tersedia'
    },
    {
      category_id: kambingId,
      name: 'Kambing Etawa Jantan Show Quality',
      description: 'Kambing Etawa jantan kualitas kontes dengan tinggi badan ideal, telinga panjang menggantung, dan profil wajah melengkung khas. Nilainya terus meningkat.',
      weight: 85,
      age: '2.5 Tahun',
      price: 12000000,
      gender: 'Jantan',
      health_status: 'Sehat',
      image: '/images/kambing_etawa.png',
      status: 'tersedia'
    },
    {
      category_id: kambingId,
      name: 'Kambing Etawa Betina Perah',
      description: 'Kambing Etawa betina produksi susu tinggi, rata-rata 1.5–2.5 liter/hari. Cocok untuk usaha susu kambing etawa yang semakin diminati pasar.',
      weight: 60,
      age: '2 Tahun',
      price: 7800000,
      gender: 'Betina',
      health_status: 'Sehat',
      image: '/images/kambing_etawa.png',
      status: 'tersedia'
    },
    {
      category_id: kambingId,
      name: 'Kambing Kacang Jantan Gemuk',
      description: 'Kambing kacang jantan gemuk hasil pemeliharaan intensif. Tahan penyakit, mudah beradaptasi, dan harga sangat terjangkau.',
      weight: 35,
      age: '1.5 Tahun',
      price: 2800000,
      gender: 'Jantan',
      health_status: 'Sehat',
      image: '/images/kambing_kacang.png',
      status: 'tersedia'
    },
    {
      category_id: kambingId,
      name: 'Kambing Kacang Betina Indukan',
      description: 'Kambing kacang betina yang sudah terbukti beranak. Prolifik dan mudah beranak setiap 8 bulan. Pilihan hemat untuk peternak pemula.',
      weight: 28,
      age: '2 Tahun',
      price: 2500000,
      gender: 'Betina',
      health_status: 'Sehat',
      image: '/images/kambing_kacang.png',
      status: 'tersedia'
    },
    {
      category_id: kambingId,
      name: 'Kambing Boer x Kacang F1',
      description: 'Kambing hasil persilangan F1 antara Boer dan Kacang lokal. Menggabungkan pertumbuhan cepat Boer dengan ketahanan tubuh Kacang lokal.',
      weight: 48,
      age: '1.5 Tahun',
      price: 4200000,
      gender: 'Jantan',
      health_status: 'Sehat',
      image: '/images/kambing_boer.png',
      status: 'tersedia'
    },

    // ── DOMBA (5 produk) ─────────────────────────────────────────────────
    {
      category_id: dombaId,
      name: 'Domba Garut Jantan Kontes',
      description: 'Domba Garut jantan berkualitas kontes dengan tanduk spiral besar dan otot dada menonjol. Dipelihara khusus dengan pakan suplemen untuk performa maksimal.',
      weight: 65,
      age: '2 Tahun',
      price: 9500000,
      gender: 'Jantan',
      health_status: 'Sehat',
      image: '/images/domba_garut.png',
      status: 'tersedia'
    },
    {
      category_id: dombaId,
      name: 'Domba Garut Betina Indukan',
      description: 'Domba Garut betina produktif dari induk berkualitas. Biasanya melahirkan 1-2 ekor setiap siklus. Cocok untuk pengembangan populasi.',
      weight: 45,
      age: '1.5 Tahun',
      price: 5200000,
      gender: 'Betina',
      health_status: 'Sehat',
      image: '/images/domba_garut.png',
      status: 'tersedia'
    },
    {
      category_id: dombaId,
      name: 'Domba Merino Jantan Wol Premium',
      description: 'Domba Merino jantan dengan bulu wol extra tebal dan halus. Satu domba dapat menghasilkan 4–5 kg wol per tahun. Nilai investasi jangka panjang.',
      weight: 55,
      age: '1.5 Tahun',
      price: 6000000,
      gender: 'Jantan',
      health_status: 'Sehat',
      image: '/images/domba_merino.png',
      status: 'tersedia'
    },
    {
      category_id: dombaId,
      name: 'Domba Ekor Gemuk Jantan Qurban',
      description: 'Domba ekor gemuk jantan siap qurban. Memenuhi semua syarat syar\'i: usia lebih 1 tahun, tidak cacat, sehat, dan bobot ideal. Sudah divaksin lengkap.',
      weight: 42,
      age: '1.5 Tahun',
      price: 4200000,
      gender: 'Jantan',
      health_status: 'Sehat',
      image: '/images/domba_ekor_gemuk.png',
      status: 'tersedia'
    },
    {
      category_id: dombaId,
      name: 'Domba Ekor Gemuk Betina',
      description: 'Domba ekor gemuk betina produktif, dikenal dengan daging lezat rendah lemak dan kemampuan beradaptasi di berbagai kondisi cuaca Indonesia.',
      weight: 36,
      age: '1 Tahun',
      price: 3400000,
      gender: 'Betina',
      health_status: 'Sehat',
      image: '/images/domba_ekor_gemuk.png',
      status: 'tersedia'
    },
  ];

  const { data: inserted, error: insertError } = await supabase
    .from('products')
    .insert(dummyProducts)
    .select('id, name, image');

  if (insertError) {
    console.error('Gagal menambahkan produk:', insertError.message);
    process.exit(1);
  }

  console.log(`✅ Berhasil menambahkan ${inserted.length} produk dengan foto:\n`);
  inserted.forEach((p, i) => console.log(`  ${i + 1}. [ID ${p.id}] ${p.name}  →  ${p.image}`));

  const sapiCount   = dummyProducts.filter(p => p.category_id === sapiId).length;
  const kambingCount = dummyProducts.filter(p => p.category_id === kambingId).length;
  const dombaCount  = dummyProducts.filter(p => p.category_id === dombaId).length;

  console.log(`\n=== Selesai! ===`);
  console.log(`Total: ${sapiCount} Sapi | ${kambingCount} Kambing | ${dombaCount} Domba`);
}

seedDummy2().catch(console.error);
