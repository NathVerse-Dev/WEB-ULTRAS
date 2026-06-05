# Project Company (Simple Web)

Minimal personal profile website built with Express and EJS.

Quick start


1. Install dependencies:

```bash
npm install
```

2. The project already includes a local `.env` file with profile defaults. Edit `.env` if you want to change `PORT`, `ADMIN_EMAIL`, or contact settings.

3. Run the app:

```bash
npm start
# or for development (nodemon is included as a devDependency):
npm run dev
```

Contact form submissions are saved to `data/messages.json`.

### Email notifications (optional)

To enable email notifications when contact form is submitted:

1. Create `.env` from `.env.example`:
   ```bash
   copy .env.example .env
   ```

2. Fill in SMTP settings in `.env`. Example (Gmail):
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

3. For Gmail, use an **App Password** (not regular password):
   - Enable 2FA on your Google Account
   - Go to https://myaccount.google.com/apppasswords
   - Select Mail & Windows Computer
   - Copy the 16-char password and paste in `.env`

## Deploy ke Vercel

1. Push proyek ini ke GitHub, GitLab, atau Bitbucket.
2. Buat proyek baru di Vercel dan impor repository.
3. Vercel sudah dikonfigurasi dengan `vercel.json` untuk menjalankan `server.js`.
4. Tambahkan domain pribadi di dashboard Vercel:
   - `@` → `76.76.21.21`
   - `www` → `cname.vercel-dns.com`
5. Klik `Verify` di Vercel dan tunggu propagasi DNS selesai.

> Catatan: `data/messages.json` hanya disimpan secara sementara di Vercel. Untuk penyimpanan yang permanen, gunakan database atau layanan eksternal.

Visit http://localhost:3000
