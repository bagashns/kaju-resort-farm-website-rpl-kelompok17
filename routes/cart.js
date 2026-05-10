const express = require('express');
const { supabase } = require('../database');
const { isAuthenticated, isCustomer } = require('../middleware/auth');
const router = express.Router();

router.get('/', isAuthenticated, isCustomer, async (req, res) => {
  const { data: cartData } = await supabase
    .from('cart_items')
    .select('id, products!inner(id, name, price, weight, image, status, categories!inner(name))')
    .eq('user_id', req.session.user.id);

  const items = cartData ? cartData.map(ci => ({
    id: ci.id,
    product_id: ci.products.id,
    name: ci.products.name,
    price: ci.products.price,
    weight: ci.products.weight,
    image: ci.products.image,
    status: ci.products.status,
    category_name: ci.products.categories?.name
  })) : [];

  const total = items.reduce((sum, item) => sum + (item.status === 'tersedia' ? item.price : 0), 0);
  res.render('cart', { items, total });
});

router.post('/tambah/:productId', isAuthenticated, isCustomer, async (req, res) => {
  const productId = req.params.productId;
  
  const { data: product } = await supabase.from('products').select('id').eq('id', productId).eq('status', 'tersedia').maybeSingle();
  if (!product) {
    req.flash('error', 'Produk tidak tersedia.');
    return res.redirect('/katalog');
  }

  const { data: existing } = await supabase.from('cart_items').select('id').eq('user_id', req.session.user.id).eq('product_id', productId).maybeSingle();
  if (existing) {
    req.flash('error', 'Produk sudah ada di keranjang.');
    return res.redirect('/katalog');
  }

  await supabase.from('cart_items').insert({ user_id: req.session.user.id, product_id: productId });
  
  req.flash('success', 'Produk ditambahkan ke keranjang.');
  res.redirect(req.get('referer') || '/katalog');
});

router.post('/hapus/:id', isAuthenticated, isCustomer, async (req, res) => {
  await supabase.from('cart_items').delete().eq('id', req.params.id).eq('user_id', req.session.user.id);
  req.flash('success', 'Produk dihapus dari keranjang.');
  res.redirect('/keranjang');
});

module.exports = router;
