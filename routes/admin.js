const express = require('express');
const multer = require('multer');
const path = require('path');
const { supabase } = require('../database');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/uploads/products')),
  filename: (req, file, cb) => cb(null, 'product-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  cb(null, allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype));
}});

router.use(isAuthenticated, isAdmin);

router.get('/', async (req, res) => {
  const [{ count: totalProducts }, { count: availableProducts }, { count: totalOrders }, { count: pendingOrders }, { count: totalCustomers }] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'tersedia'),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['menunggu_pembayaran','menunggu_verifikasi']),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'customer')
  ]);

  const { data: revenueData } = await supabase.from('orders').select('total_amount').in('status', ['lunas','selesai']);
  const totalRevenue = revenueData ? revenueData.reduce((sum, o) => sum + o.total_amount, 0) : 0;

  const stats = {
    totalProducts: totalProducts || 0,
    availableProducts: availableProducts || 0,
    totalOrders: totalOrders || 0,
    pendingOrders: pendingOrders || 0,
    totalRevenue,
    totalCustomers: totalCustomers || 0,
  };

  const { data: recentOrdersData } = await supabase
    .from('orders')
    .select('*, users(name)')
    .order('created_at', { ascending: false })
    .limit(10);
    
  const recentOrders = recentOrdersData ? recentOrdersData.map(o => ({
    ...o,
    customer_name: o.users?.name
  })) : [];

  const { data: ordersForSales } = await supabase.from('orders').select('created_at, total_amount').in('status', ['lunas','selesai']);
  const monthlyMap = {};
  if (ordersForSales) {
    ordersForSales.forEach(o => {
      const month = o.created_at.substring(0, 7);
      if (!monthlyMap[month]) monthlyMap[month] = { month, total_orders: 0, revenue: 0 };
      monthlyMap[month].total_orders += 1;
      monthlyMap[month].revenue += o.total_amount;
    });
  }
  const monthlySales = Object.values(monthlyMap).sort((a,b) => b.month.localeCompare(a.month)).slice(0, 6);

  res.render('admin/dashboard', { stats, recentOrders, monthlySales });
});

router.get('/produk', async (req, res) => {
  const { data: productsData } = await supabase
    .from('products')
    .select('*, categories(name)')
    .order('created_at', { ascending: false });
    
  const products = productsData ? productsData.map(p => ({
    ...p,
    category_name: p.categories?.name
  })) : [];

  const { data: categories } = await supabase.from('categories').select('*');
  res.render('admin/products', { products, categories: categories || [] });
});

router.post('/produk/tambah', upload.single('image'), async (req, res) => {
  const { category_id, name, description, weight, age, price, gender, health_status } = req.body;
  const image = req.file ? '/uploads/products/' + req.file.filename : '/images/default-product.jpg';
  
  await supabase.from('products').insert({
    category_id, name, description, weight: parseFloat(weight), age, price: parseInt(price), 
    gender: gender || 'Jantan', health_status: health_status || 'Sehat', image
  });
  
  req.flash('success', 'Produk berhasil ditambahkan.');
  res.redirect('/admin/produk');
});

router.post('/produk/edit/:id', upload.single('image'), async (req, res) => {
  const { category_id, name, description, weight, age, price, gender, health_status, status } = req.body;
  
  const { data: existing } = await supabase.from('products').select('image').eq('id', req.params.id).maybeSingle();
  const image = req.file ? '/uploads/products/' + req.file.filename : (existing ? existing.image : '/images/default-product.jpg');
  
  await supabase.from('products').update({
    category_id, name, description, weight: parseFloat(weight), age, price: parseInt(price), 
    gender, health_status, image, status
  }).eq('id', req.params.id);
  
  req.flash('success', 'Produk berhasil diperbarui.');
  res.redirect('/admin/produk');
});

router.post('/produk/hapus/:id', async (req, res) => {
  await supabase.from('products').delete().eq('id', req.params.id);
  req.flash('success', 'Produk berhasil dihapus.');
  res.redirect('/admin/produk');
});

router.get('/pesanan', async (req, res) => {
  const { status } = req.query;
  
  let query = supabase.from('orders').select('*, users(name, phone), order_items(id)').order('created_at', { ascending: false });
  if (status && status !== 'semua') {
    query = query.eq('status', status);
  }
  
  const { data: ordersData } = await query;
  
  const orders = ordersData ? ordersData.map(o => ({
    ...o,
    customer_name: o.users?.name,
    customer_phone: o.users?.phone,
    item_count: o.order_items ? o.order_items.length : 0
  })) : [];

  res.render('admin/orders', { orders, filterStatus: status || 'semua' });
});

router.get('/pesanan/:id', async (req, res) => {
  const { data: orderData } = await supabase
    .from('orders')
    .select('*, users(name, email, phone, address)')
    .eq('id', req.params.id)
    .maybeSingle();
    
  if (!orderData) {
    req.flash('error', 'Pesanan tidak ditemukan.');
    return res.redirect('/admin/pesanan');
  }
  
  const order = {
    ...orderData,
    customer_name: orderData.users?.name,
    customer_email: orderData.users?.email,
    customer_phone: orderData.users?.phone,
    customer_address: orderData.users?.address
  };

  const { data: items } = await supabase.from('order_items').select('*').eq('order_id', order.id);
  res.render('admin/order-detail', { order, items: items || [] });
});

router.post('/pesanan/:id/status', async (req, res) => {
  const { status, admin_notes } = req.body;
  
  await supabase.from('orders').update({ 
    status, 
    admin_notes: admin_notes || '', 
    updated_at: new Date().toISOString()
  }).eq('id', req.params.id);

  if (status === 'ditolak' || status === 'selesai') {
    const { data: items } = await supabase.from('order_items').select('product_id').eq('order_id', req.params.id);
    if (items) {
      const newStatus = status === 'ditolak' ? 'tersedia' : 'terjual';
      for (const item of items) {
        await supabase.from('products').update({ status: newStatus }).eq('id', item.product_id);
      }
    }
  }
  
  req.flash('success', 'Status pesanan berhasil diperbarui.');
  res.redirect('/admin/pesanan');
});

router.get('/laporan', async (req, res) => {
  const { period } = req.query;
  
  const { data: ordersData } = await supabase.from('orders').select('*, order_items(product_category, price)').in('status', ['lunas', 'selesai', 'ditolak']);
  
  let filteredOrders = ordersData || [];
  
  if (period && period !== 'semua') {
    const now = new Date();
    filteredOrders = filteredOrders.filter(o => {
      const orderDate = new Date(o.created_at);
      if (period === 'hari') {
        return orderDate.toDateString() === now.toDateString();
      } else if (period === 'minggu') {
        const diffTime = Math.abs(now - orderDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        return diffDays <= 7;
      } else if (period === 'bulan') {
        const diffTime = Math.abs(now - orderDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        return diffDays <= 30;
      }
      return true;
    });
  }

  const summary = {
    total_orders: 0,
    total_revenue: 0,
    completed_orders: 0,
    rejected_orders: 0
  };

  const catMap = {};
  const dailyMap = {};

  filteredOrders.forEach(o => {
    summary.total_orders += 1;
    if (o.status === 'ditolak') {
      summary.rejected_orders += 1;
    } else {
      if (o.status === 'selesai') summary.completed_orders += 1;
      summary.total_revenue += o.total_amount;
      
      const date = o.created_at.split('T')[0];
      if (!dailyMap[date]) dailyMap[date] = { date, orders: 0, revenue: 0 };
      dailyMap[date].orders += 1;
      dailyMap[date].revenue += o.total_amount;

      if (o.order_items) {
        o.order_items.forEach(item => {
          if (!catMap[item.product_category]) catMap[item.product_category] = { category: item.product_category, count: 0, revenue: 0 };
          catMap[item.product_category].count += 1;
          catMap[item.product_category].revenue += item.price;
        });
      }
    }
  });

  const salesByCategory = Object.values(catMap);
  const dailySales = Object.values(dailyMap).sort((a,b) => b.date.localeCompare(a.date)).slice(0, 30);

  res.render('admin/reports', { summary, salesByCategory, dailySales, period: period || 'semua' });
});

module.exports = router;
