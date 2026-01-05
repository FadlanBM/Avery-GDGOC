This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) dengan integrasi [Supabase](https://supabase.com) untuk autentikasi.

## Fitur

- ✅ Login dengan email dan password
- ✅ Login dengan Google OAuth
- ✅ Register akun baru
- ✅ Proteksi route dengan middleware
- ✅ Logout
- ✅ Dashboard dengan statistik
- ✅ Manajemen Projects (Tambah, Lihat, Hapus)
- ✅ UI modern dengan shadcn/ui

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase

1. Buat akun di [Supabase](https://supabase.com) jika belum punya
2. Buat project baru di dashboard Supabase
3. Buka Settings > API untuk mendapatkan:
   - Project URL
   - Anon/Public Key

### 3. Konfigurasi Environment Variables

Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Setup Supabase Auth

Di dashboard Supabase:

1. Buka Authentication > URL Configuration
2. Tambahkan URL redirect:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

### 5. Setup Google OAuth (Opsional)

Untuk mengaktifkan login dengan Google:

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih project yang sudah ada
3. Buka **APIs & Services** > **Credentials**
4. Klik **Create Credentials** > **OAuth client ID**
5. Pilih **Web application**
6. Tambahkan **Authorized redirect URIs**:
   - `https://[your-project-ref].supabase.co/auth/v1/callback`
   - (Dapatkan URL ini dari Supabase Dashboard > Authentication > Providers > Google)
7. Salin **Client ID** dan **Client Secret**
8. Di Supabase Dashboard:
   - Buka **Authentication** > **Providers**
   - Aktifkan **Google**
   - Masukkan **Client ID** dan **Client Secret**
   - Klik **Save**

### 6. Setup Database untuk Projects

Untuk menggunakan fitur Projects:

1. Buka Supabase Dashboard > SQL Editor
2. Copy isi file `supabase-setup.sql` di root project
3. Paste dan jalankan query tersebut
4. Table `projects` dan `app_configs` akan dibuat dengan Row Level Security (RLS) yang sudah dikonfigurasi

**Jika Anda mendapatkan error foreign key constraint:**
- Jika table `projects` sudah dibuat sebelumnya, jalankan script `supabase-fix.sql` untuk memperbaiki constraint
- Script ini akan menghapus foreign key constraint ke `auth.users` (yang tidak diperlukan karena kita menggunakan RLS)

### 7. Setup Storage untuk Assets

Untuk menggunakan fitur upload Assets (icon dan splash screen):

1. Buka Supabase Dashboard > SQL Editor
2. Copy isi file `supabase-storage-setup.sql` di root project
3. Paste dan jalankan query tersebut
4. Storage bucket `assets` akan dibuat dengan policy yang sudah dikonfigurasi
5. Atau buat bucket manual di Supabase Dashboard > Storage:
   - Klik "New bucket"
   - Nama: `assets`
   - Public bucket: **Aktifkan** (centang)
   - Klik "Create bucket"
6. Setelah bucket dibuat, jalankan script `supabase-storage-setup.sql` untuk membuat policies

### 8. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Setup Database

Untuk menggunakan fitur Projects, Anda perlu membuat table di Supabase:

1. Buka Supabase Dashboard > SQL Editor
2. Copy isi file `supabase-setup.sql`
3. Paste dan jalankan query tersebut
4. Table `projects` akan dibuat dengan Row Level Security (RLS) yang sudah dikonfigurasi

## Struktur Project

- `app/login/` - Halaman login
- `app/register/` - Halaman register
- `app/auth/callback/` - Callback route untuk email verification
- `app/dashboard/` - Halaman dashboard
- `app/dashboard/projects/` - Halaman untuk mengelola projects
- `lib/supabase/` - Konfigurasi Supabase client dan server
- `components/ui/` - Komponen UI (Button, Input, Card, dll)
- `components/add-project-button.tsx` - Komponen form tambah project
- `components/projects-list.tsx` - Komponen untuk menampilkan daftar project
- `middleware.ts` - Middleware untuk proteksi route

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
