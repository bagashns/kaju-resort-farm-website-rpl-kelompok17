const express = require('express');
const { supabase } = require('../database');
const router = express.Router();

router.get('/', async (req, res) => {
  const { kategori, min_harga, max_harga, sort, search } = req.query;
  
  let query = supabase
    .from('products')
    .select('*, categories!inner(id, name)')
    .eq('status', 'tersedia');

  if (kategori && kategori !== 'semua') {
    query = query.eq('category_id', kategori);
  }
  if (min_harga) {
    query = query.gte('price', parseInt(min_harga));
  }
  if (max_harga) {
    query = query.lte('price', parseInt(max_harga));
  }
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  switch (sort) {
    case 'harga_asc': query = query.order('price', { ascending: true }); break;
    case 'harga_desc': query = query.order('price', { ascending: false }); break;
    case 'bobot_asc': query = query.order('weight', { ascending: true }); break;
    case 'bobot_desc': query = query.order('weight', { ascending: false }); break;
    case 'terbaru':
    default: query = query.order('created_at', { ascending: false });
  }

  const { data: products } = await query;
  
  const formattedProducts = products ? products.map(p => ({
    ...p,
    category_name: p.categories?.name
  })) : [];

  const { data: categories } = await supabase.from('categories').select('*');
  
  res.render('catalog', { products: formattedProducts, categories: categories || [], filters: req.query });
});

router.get('/:id', async (req, res) => {
  const { data: product } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('id', req.params.id)
    .maybeSingle();

  if (!product) {
    req.flash('error', 'Produk tidak ditemukan.');
    return res.redirect('/katalog');
  }

  const { data: related } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('category_id', product.category_id)
    .neq('id', product.id)
    .eq('status', 'tersedia')
    .limit(4);

  const formattedProduct = { ...product, category_name: product.categories?.name };
  const formattedRelated = related ? related.map(p => ({ ...p, category_name: p.categories?.name })) : [];

  res.render('product-detail', { product: formattedProduct, related: formattedRelated });
});

module.exports = router;
