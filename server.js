const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const { initDb, supabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'kaju-resort-farm-secret-2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(flash());

app.use(async (req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  if (req.session.user) {
    const { count } = await supabase
      .from('cart_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.session.user.id);
    res.locals.cartCount = count || 0;
  } else {
    res.locals.cartCount = 0;
  }
  res.locals.formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };
  next();
});

const authRoutes = require('./routes/auth');
const catalogRoutes = require('./routes/catalog');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');

app.use('/', authRoutes);
app.use('/katalog', catalogRoutes);
app.use('/keranjang', cartRoutes);
app.use('/pesanan', orderRoutes);
app.use('/admin', adminRoutes);

const { coreApi } = require('./midtrans');

app.post('/midtrans/notification', async (req, res) => {
  try {
    const statusResponse = await coreApi.transaction.notification(req.body);
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    let newStatus = 'menunggu_pembayaran';

    if (transactionStatus == 'capture') {
      if (fraudStatus == 'challenge') {
        newStatus = 'menunggu_verifikasi'; // Butuh review
      } else if (fraudStatus == 'accept') {
        newStatus = 'lunas';
      }
    } else if (transactionStatus == 'settlement') {
      newStatus = 'lunas';
    } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
      newStatus = 'ditolak';
    } else if (transactionStatus == 'pending') {
      newStatus = 'menunggu_pembayaran';
    }

    if (newStatus === 'ditolak') {
      const { data: items } = await supabase.from('order_items').select('product_id').eq('invoice_number', orderId); // Wait, orderId is invoice_number
      // Let's assume orderId passed to midtrans is invoice_number
      await supabase.from('orders').update({ status: newStatus }).eq('invoice_number', orderId);
      
      const { data: orderData } = await supabase.from('orders').select('id').eq('invoice_number', orderId).maybeSingle();
      if (orderData) {
        const { data: items } = await supabase.from('order_items').select('product_id').eq('order_id', orderData.id);
        if (items) {
          for (const item of items) {
            await supabase.from('products').update({ status: 'tersedia' }).eq('id', item.product_id);
          }
        }
      }
    } else {
      await supabase.from('orders').update({ status: newStatus }).eq('invoice_number', orderId);
    }

    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Midtrans notification error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.get('/', async (req, res) => {
  const { data: featured } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('status', 'tersedia')
    .order('created_at', { ascending: false })
    .limit(6);
  
  const formattedFeatured = featured ? featured.map(p => ({ ...p, category_name: p.categories?.name })) : [];

  const { data: categories } = await supabase.from('categories').select('*');
  
  const { count: totalProducts } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'tersedia');
  const { count: totalCategories } = await supabase.from('categories').select('*', { count: 'exact', head: true });
  const { count: totalCustomers } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'customer');

  const stats = {
    totalProducts: totalProducts || 0,
    totalCategories: totalCategories || 0,
    totalCustomers: totalCustomers || 0
  };
  res.render('home', { featured: formattedFeatured, categories: categories || [], stats });
});

app.use((req, res) => {
  res.status(404).render('404');
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('<h1>Terjadi kesalahan server</h1><p>' + err.message + '</p><a href="/">Kembali</a>');
});

async function start() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`Kaju Resort Farm berjalan di http://localhost:${PORT}`);
  });
}

start().catch(console.error);
