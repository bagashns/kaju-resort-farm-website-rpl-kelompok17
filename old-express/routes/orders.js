const express = require('express');
const multer = require('multer');
const path = require('path');
const { supabase } = require('../database');
const { isAuthenticated, isCustomer } = require('../middleware/auth');
const { snap } = require('../midtrans');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/uploads/payments')),
  filename: (req, file, cb) => cb(null, 'payment-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  cb(null, allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype));
}});

router.get('/', isAuthenticated, isCustomer, async (req, res) => {
  const { data: ordersData } = await supabase
    .from('orders')
    .select('*, order_items(id)')
    .eq('user_id', req.session.user.id)
    .order('created_at', { ascending: false });
    
  const orders = ordersData ? ordersData.map(o => ({
    ...o,
    item_count: o.order_items ? o.order_items.length : 0
  })) : [];
  
  res.render('customer/orders', { orders });
});

router.get('/:id', isAuthenticated, isCustomer, async (req, res) => {
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.session.user.id)
    .maybeSingle();
    
  if (!order) {
    req.flash('error', 'Pesanan tidak ditemukan.');
    return res.redirect('/pesanan');
  }
  
  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id);
    
  res.render('customer/order-detail', { 
    order, 
    items: items || [],
    midtransClientKey: process.env.MIDTRANS_CLIENT_KEY,
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true'
  });
});

router.post('/checkout', isAuthenticated, isCustomer, async (req, res) => {
  const { shipping_address, notes } = req.body;
  
  const { data: cartData } = await supabase
    .from('cart_items')
    .select('id, products!inner(id, name, price, weight, status, categories!inner(name))')
    .eq('user_id', req.session.user.id);
    
  const cartItems = cartData ? cartData.map(ci => ({
    id: ci.id,
    product_id: ci.products.id,
    name: ci.products.name,
    price: ci.products.price,
    weight: ci.products.weight,
    status: ci.products.status,
    category_name: ci.products.categories?.name
  })) : [];

  const available = cartItems.filter(i => i.status === 'tersedia');
  if (available.length === 0) {
    req.flash('error', 'Keranjang kosong atau semua produk tidak tersedia.');
    return res.redirect('/keranjang');
  }

  const total = available.reduce((sum, i) => sum + i.price, 0);
  const invoice = 'INV-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

  try {
    const parameter = {
      transaction_details: {
        order_id: invoice,
        gross_amount: total
      },
      customer_details: {
        first_name: req.session.user.name,
        email: req.session.user.email,
        phone: req.session.user.phone || ''
      }
    };
    
    const transaction = await snap.createTransaction(parameter);
    const paymentToken = transaction.token;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: req.session.user.id,
        invoice_number: invoice,
        total_amount: total,
        shipping_address: shipping_address || req.session.user.address || '',
        notes: notes || '',
        payment_token: paymentToken
      })
      .select()
      .single();
      
    if (orderError) throw orderError;
    const orderId = order.id;

    for (const item of available) {
      await supabase.from('order_items').insert({
        order_id: orderId,
        product_id: item.product_id,
        price: item.price,
        product_name: item.name,
        product_weight: item.weight,
        product_category: item.category_name
      });
      await supabase.from('products').update({ status: 'dipesan' }).eq('id', item.product_id);
    }
    
    await supabase.from('cart_items').delete().eq('user_id', req.session.user.id);
    
    req.flash('success', `Pesanan berhasil dibuat! Silakan lakukan pembayaran.`);
    res.redirect(`/pesanan/${orderId}`);
  } catch (err) {
    console.error('Checkout error:', err);
    req.flash('error', 'Terjadi kesalahan saat checkout. Silakan coba lagi.');
    res.redirect('/keranjang');
  }
});

router.post('/:id/upload-bukti', isAuthenticated, isCustomer, upload.single('payment_proof'), async (req, res) => {
  if (!req.file) {
    req.flash('error', 'Gagal mengunggah bukti pembayaran. Pastikan file berupa gambar (JPG/PNG).');
    return res.redirect(`/pesanan/${req.params.id}`);
  }
  
  await supabase
    .from('orders')
    .update({ 
      payment_proof: '/uploads/payments/' + req.file.filename, 
      status: 'menunggu_verifikasi',
      updated_at: new Date().toISOString()
    })
    .eq('id', req.params.id)
    .eq('user_id', req.session.user.id);
    
  req.flash('success', 'Bukti pembayaran berhasil diunggah. Menunggu verifikasi admin.');
  res.redirect(`/pesanan/${req.params.id}`);
});

router.post('/:invoice/sync-payment', isAuthenticated, isCustomer, async (req, res) => {
  try {
    const { coreApi } = require('../midtrans');
    const statusResponse = await coreApi.transaction.status(req.params.invoice);
    
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    let newStatus = 'menunggu_pembayaran';

    if (transactionStatus == 'capture') {
      if (fraudStatus == 'challenge') {
        newStatus = 'menunggu_verifikasi'; 
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
      const { data: orderData } = await supabase.from('orders').select('id').eq('invoice_number', req.params.invoice).maybeSingle();
      if (orderData) {
        await supabase.from('orders').update({ status: newStatus }).eq('id', orderData.id);
        const { data: items } = await supabase.from('order_items').select('product_id').eq('order_id', orderData.id);
        if (items) {
          for (const item of items) {
            await supabase.from('products').update({ status: 'tersedia' }).eq('id', item.product_id);
          }
        }
      }
    } else {
      await supabase.from('orders').update({ status: newStatus }).eq('invoice_number', req.params.invoice);
    }

    res.json({ success: true, status: newStatus });
  } catch (error) {
    console.error('Manual sync error:', error);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
