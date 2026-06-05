require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const app = express();
const PORT = process.env.PORT || 3000;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'nthnaelgrldhaurissa1@gmail.com';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Nathanael Gerald Haurissa';
const ADMIN_PHONE = process.env.ADMIN_PHONE || '6283891459366';
const DISCORD_INVITE = process.env.DISCORD_INVITE || 'https://discord.gg/ultras';
const PROFILE_NAME = process.env.PROFILE_NAME || 'Ultras';

function formatPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return phone;
  if (digits.startsWith('62')) {
    return '+62 ' + digits.slice(2).replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }
  if (digits.startsWith('0')) {
    return digits.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }
  return '+' + digits.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
}

const ADMIN_PHONE_FORMATTED = formatPhone(ADMIN_PHONE);

// SMTP transporter config
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  } : undefined
});

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

function ensureDataDir() {
  const dir = path.join(__dirname, 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function saveMessage(entry) {
  try {
    ensureDataDir();
    const file = path.join(__dirname, 'data', 'messages.json');
    let arr = [];
    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file, 'utf8') || '[]';
      arr = JSON.parse(raw);
    }
    arr.push(entry);
    fs.writeFileSync(file, JSON.stringify(arr, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save message', err);
  }
}

// API Route: POST /api/contact
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Semua field harus diisi' });
  }
  
  const entry = { name, email, message, receivedAt: new Date().toISOString() };
  saveMessage(entry);
  console.log('Pesan gabung diterima:', entry);

  // Kirim email jika SMTP dikonfigurasi
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter.sendMail({
      from: `${process.env.SMTP_USER}`,
      to: ADMIN_EMAIL,
      replyTo: email,
      subject: `Formulir Gabung Baru dari ${name}`,
      html: `
        <h2>Formulir Gabung Baru</h2>
        <p><strong>Nama:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Pesan:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <p><strong>Diterima pada:</strong> ${entry.receivedAt}</p>
      `
    }, (err, info) => {
      if (err) console.error('Email gagal:', err);
      else console.log('Email terkirim:', info.response);
    });
  }

  res.json({ success: true, message: 'Terima kasih, permintaan gabung Anda sudah diterima.' });
});

// API Route: GET /api/config (untuk templating client-side)
app.get('/api/config', (req, res) => {
  res.json({
    companyName: PROFILE_NAME,
    discordInvite: DISCORD_INVITE,
    adminEmail: ADMIN_EMAIL,
    adminName: ADMIN_NAME,
    adminPhone: ADMIN_PHONE_FORMATTED
  });
});

// Serve static pages
app.use(express.static(path.join(__dirname, 'public')));

// SPA: tangkap semua route lain dan layani index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (require.main === module) {
  const server = app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Please stop the other process or set PORT to a different value in your .env file.`);
    } else {
      console.error('Server error:', err);
    }
    process.exit(1);
  });
}

module.exports = app;
