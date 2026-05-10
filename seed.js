const { initDb, supabase } = require('./database');
const bcrypt = require('bcryptjs');

async function seed() {
  await initDb();

  console.log('Seeding database Kaju Resort Farm (Supabase)...');

  // Categories
  const { count: cats, error: catsError } = await supabase.from('categories').select('*', { count: 'exact', head: true });
  if (catsError) console.error("Error checking categories:", catsError);
  
  if (!cats || cats === 0) {
    const { error: insertCatError } = await supabase.from('categories').insert([
      { id: 1, name: 'Sapi', description: 'Sapi berkualitas dari peternakan Kaju Resort Farm', icon: 'fas fa-cow' },
      { id: 2, name: 'Kambing', description: 'Kambing sehat dan gemuk siap untuk dibeli', icon: 'fas fa-horse' },
      { id: 3, name: 'Domba', description: 'Domba pilihan dengan bobot ideal', icon: 'fas fa-paw' }
    ]);
    if (insertCatError) console.error("Error inserting categories:", insertCatError);
    else console.log('3 kategori ditambahkan.');
  }

  // Admin account
  const { data: existingAdmin, error: adminQueryError } = await supabase.from('users').select('id').eq('email', 'admin@kajuresort.com').maybeSingle();
  if (adminQueryError) console.error("Error checking admin:", adminQueryError);
  
  if (!existingAdmin) {
    const adminPassword = bcrypt.hashSync('admin123', 10);
    const { error: adminInsertError } = await supabase.from('users').insert({
      name: 'Admin Kaju Resort', email: 'admin@kajuresort.com', phone: '0895349275679',
      address: 'Kp. Manglad, Cibodas, Kec. Rumpin, Kab. Bogor', password: adminPassword, role: 'admin'
    });
    if (adminInsertError) console.error("Error inserting admin:", adminInsertError);
    else console.log('Akun admin dibuat.');
  }

  // Demo customer
  const { data: existingCust, error: custQueryError } = await supabase.from('users').select('id').eq('email', 'budi@email.com').maybeSingle();
  if (custQueryError) console.error("Error checking customer:", custQueryError);
  
  if (!existingCust) {
    const custPassword = bcrypt.hashSync('customer123', 10);
    const { error: custInsertError } = await supabase.from('users').insert({
      name: 'Budi Santoso', email: 'budi@email.com', phone: '081234567890',
      address: 'Jl. Raya Bogor No. 123, Kota Bogor', password: custPassword, role: 'customer'
    });
    if (custInsertError) console.error("Error inserting customer:", custInsertError);
    else console.log('Akun customer demo dibuat.');
  }

  // Sample products
  const { count: existingProducts } = await supabase.from('products').select('*', { count: 'exact', head: true });
  if (!existingProducts || existingProducts === 0) {
    const rawProducts = [
      [1, 'Sapi Limosin Premium', 'Sapi Limosin berkualitas tinggi dengan postur besar dan sehat. Cocok untuk usaha peternakan atau acara qurban.', 450, '2.5 Tahun', 28000000, 'Jantan', 'Sehat', '/images/default-product.jpg'],
      [1, 'Sapi Brahman Super', 'Sapi Brahman dengan genetik unggul, tahan panas, dan daya adaptasi tinggi.', 380, '2 Tahun', 23000000, 'Jantan', 'Sehat', '/images/default-product.jpg'],
      [1, 'Sapi Simental Besar', 'Sapi Simental yang dikenal dengan pertumbuhan cepat dan bobot ideal.', 520, '3 Tahun', 35000000, 'Jantan', 'Sehat', '/images/default-product.jpg'],
      [1, 'Sapi Bali Betina', 'Sapi Bali betina produktif, cocok untuk breeding dan pengembangan usaha.', 280, '2 Tahun', 18000000, 'Betina', 'Sehat', '/images/default-product.jpg'],
      [1, 'Sapi PO Lokal', 'Sapi Peranakan Ongole lokal dengan pemeliharaan alami.', 350, '2 Tahun', 20000000, 'Jantan', 'Sehat', '/images/default-product.jpg'],
      [2, 'Kambing Etawa Premium', 'Kambing Etawa dengan postur besar dan bulu lebat. Penghasil susu berkualitas.', 65, '1.5 Tahun', 5500000, 'Jantan', 'Sehat', '/images/default-product.jpg'],
      [2, 'Kambing Boer Import', 'Kambing Boer dengan genetik impor, bobot ideal untuk penggemukan.', 55, '1 Tahun', 4500000, 'Jantan', 'Sehat', '/images/default-product.jpg'],
      [2, 'Kambing Kacang Lokal', 'Kambing kacang lokal yang mudah dipelihara dan tahan penyakit.', 30, '1 Tahun', 2500000, 'Jantan', 'Sehat', '/images/default-product.jpg'],
      [2, 'Kambing Jawa Randu', 'Kambing Jawa Randu betina siap kawin, sehat dan produktif.', 35, '1.5 Tahun', 3000000, 'Betina', 'Sehat', '/images/default-product.jpg'],
      [3, 'Domba Garut Aduan', 'Domba Garut jantan dengan tanduk melengkung indah dan postur kokoh.', 45, '1.5 Tahun', 4000000, 'Jantan', 'Sehat', '/images/default-product.jpg'],
      [3, 'Domba Merino Bulu Tebal', 'Domba Merino dengan bulu tebal berkualitas. Cocok untuk peternakan wol.', 40, '1 Tahun', 3500000, 'Betina', 'Sehat', '/images/default-product.jpg'],
      [3, 'Domba Ekor Gemuk', 'Domba ekor gemuk yang populer untuk qurban dan konsumsi.', 38, '1 Tahun', 3200000, 'Jantan', 'Sehat', '/images/default-product.jpg'],
    ];

    const productsToInsert = rawProducts.map(p => ({
      category_id: p[0], name: p[1], description: p[2], weight: p[3], age: p[4], price: p[5], gender: p[6], health_status: p[7], image: p[8]
    }));

    await supabase.from('products').insert(productsToInsert);
    console.log(`${productsToInsert.length} produk ditambahkan.`);
  }

  console.log('');
  console.log('=== Seed selesai! ===');
  console.log('');
  console.log('Akun Admin:');
  console.log('  Email: admin@kajuresort.com');
  console.log('  Password: admin123');
  console.log('');
  console.log('Akun Customer Demo:');
  console.log('  Email: budi@email.com');
  console.log('  Password: customer123');
  console.log('');
  console.log('Jalankan server: npm run dev');
}

seed().catch(console.error);
