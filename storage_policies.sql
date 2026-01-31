-- Versi Revisi: Menghapus perintah ALTER TABLE yang membutuhkan hak akses Owner
-- Jalankan script ini di SQL Editor Supabase

-- 0. Bersihkan policy lama agar tidak duplikat/error saat dijalankan ulang
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public viewing" ON storage.objects;
DROP POLICY IF EXISTS "Allow individual update own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow individual delete own files" ON storage.objects;

-- 1. Buat Bucket 'assets' (jika belum ada) dan set sebagai Public
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Policy: Izinkan Upload (INSERT) untuk User yang Login (Authenticated)
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'assets'
);

-- 3. Policy: Izinkan Melihat File (SELECT) untuk Publik
CREATE POLICY "Allow public viewing"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'assets'
);

-- 4. Policy: Izinkan Update File Milik Sendiri
CREATE POLICY "Allow individual update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'assets' AND auth.uid() = owner );

-- 5. Policy: Izinkan Hapus File Milik Sendiri
CREATE POLICY "Allow individual delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'assets' AND auth.uid() = owner );
