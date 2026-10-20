# SIMS Sekolah — Frontend Next.js

Frontend untuk backend Express + TypeScript SIMS yang diberikan.

## Menjalankan

1. Ekstrak ZIP.
2. Buka folder frontend ini di VS Code.
3. Jalankan `npm install`.
4. Salin `.env.local.example` menjadi `.env.local`.
5. Pastikan `NEXT_PUBLIC_API_URL=http://localhost:5000/api` sesuai port backend.
6. Jalankan backend terlebih dahulu, lalu `npm run dev`.
7. Buka `http://localhost:3000`.

## Fitur yang terhubung dengan API yang tersedia

- Login: `POST /auth/login`
- Registrasi siswa: `POST /auth/register`
- Ambil profil login: `GET /profile`
- Ubah nama/foto profil: `PATCH /profile`
- Admin mengelola pengguna: `GET /users`, `GET /users/:id`, `POST /users`, `PATCH /users/:id`, `DELETE /users/:id`
- Baca konten sesuai role: `GET /konten`
- Guru mengelola konten: `POST /konten`, `PATCH /konten/:id`, `DELETE /konten/:id`
- Dashboard statistik dihitung dari respons endpoint yang tersedia.

## Batasan sesuai backend sekarang

- Belum ada route daftar kelas (`/api/kelas`) pada `src/app.ts` di ZIP backend, sehingga halaman Kelas yang Diajar memberi keterangan, bukan data palsu. Form konten memakai ID kelas numerik yang sudah ada di database.
- Belum ada endpoint pengumpulan tugas dan penilaian. Halaman tersebut menjelaskan keterbatasan backend dan tidak mengarang API.
- API konten hanya mengizinkan guru membuat, mengubah, dan menghapus konten miliknya. Dashboard admin hanya membaca konten.
- Registrasi publik backend hanya membuat akun siswa. Akun guru/admin dikelola melalui endpoint pengguna admin.
- File upload menggunakan `foto` untuk profil/pengguna dan `gambar` untuk konten, mengikuti nama field multer pada backend.

## Catatan keamanan

Frontend menyimpan JWT di `localStorage` untuk kebutuhan aplikasi sekolah sederhana. Untuk produksi, pertimbangkan cookie HttpOnly dan kebijakan keamanan yang sesuai.
