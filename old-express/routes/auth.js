const express = require('express');
const bcrypt = require('bcryptjs');
const { supabase } = require('../database');
const router = express.Router();

router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect(req.session.user.role === 'admin' ? '/admin' : '/');
  res.render('login');
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const { data: user } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
  if (!user || !bcrypt.compareSync(password, user.password)) {
    req.flash('error', 'Email atau password salah.');
    return res.redirect('/login');
  }
  req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address };
  req.flash('success', `Selamat datang, ${user.name}!`);
  const returnTo = req.session.returnTo || (user.role === 'admin' ? '/admin' : '/');
  delete req.session.returnTo;
  res.redirect(returnTo);
});

router.get('/register', (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('register');
});

router.post('/register', async (req, res) => {
  const { name, email, phone, address, password, confirm_password } = req.body;
  if (password !== confirm_password) {
    req.flash('error', 'Password tidak cocok.');
    return res.redirect('/register');
  }
  const { data: existing } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
  if (existing) {
    req.flash('error', 'Email sudah terdaftar.');
    return res.redirect('/register');
  }
  const hashed = bcrypt.hashSync(password, 10);
  const { data: result, error } = await supabase.from('users')
    .insert({ name, email, phone, address: address || '', password: hashed, role: 'customer' })
    .select().single();
  
  if (error || !result) {
    req.flash('error', 'Terjadi kesalahan saat pendaftaran.');
    return res.redirect('/register');
  }

  req.session.user = { id: result.id, name, email, role: 'customer', phone, address: address || '' };
  req.flash('success', 'Registrasi berhasil! Selamat datang di Kaju Resort Farm.');
  res.redirect('/');
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
