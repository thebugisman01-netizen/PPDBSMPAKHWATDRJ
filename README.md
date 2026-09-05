# PPDB SMP Akhwat Riyadhul Jannah

Website formulir pendaftaran (PPDB) yang datanya otomatis masuk ke Google Spreadsheet, dan file (KK, KTP, foto) otomatis tersimpan ke Google Drive.

## Isi folder
- `index.html` — halaman formulir
- `admin.html` — dashboard admin (login + tabel data pendaftar)
- `style.css` — tampilan formulir (tema hijau)
- `admin.css` — tampilan dashboard admin
- `config.js` — satu tempat untuk mengisi URL Apps Script (dipakai form & dashboard)
- `script.js` — logika pengiriman data formulir
- `admin.js` — logika login & tampilan dashboard admin
- `Code.gs` — kode backend, ditempel ke Google Apps Script (bukan dijalankan di VS Code)
- `README.md` — panduan ini

## Cara menghubungkan ke Google Spreadsheet

**Langkah 1 — Buat Spreadsheet**
1. Buka [sheets.google.com](https://sheets.google.com), buat spreadsheet baru.
2. Beri nama misalnya "Data PPDB Riyadhul Jannah".

**Langkah 2 — Buat folder Drive untuk dokumen**
1. Buka [drive.google.com](https://drive.google.com), buat folder baru, misalnya "Dokumen PPDB".
2. Buka folder tersebut, salin **ID folder** dari URL browser:
   `https://drive.google.com/drive/folders/`**`ID_FOLDER_ADA_DI_SINI`**

**Langkah 3 — Tempel kode backend**
1. Di spreadsheet, klik menu **Ekstensi → Apps Script**.
2. Hapus semua kode contoh, lalu tempel seluruh isi file `Code.gs`.
3. Ganti baris `const FOLDER_ID = "ISI_FOLDER_ID_DRIVE_DI_SINI";` dengan ID folder dari Langkah 2.
4. Klik ikon **Simpan** (gambar disket).

**Langkah 4 — Deploy sebagai Web App**
1. Klik tombol **Deploy → New deployment** (Deploy baru).
2. Klik ikon gerigi di samping "Select type", pilih **Web app**.
3. Isi:
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Klik **Deploy**. Google akan minta izin akses — klik **Authorize access**, pilih akun Google kamu, lalu klik **Advanced/Lanjutan → Go to (nama project) (unsafe)**, lalu **Allow/Izinkan**.
   (Peringatan ini normal karena script belum diverifikasi Google — script ini sepenuhnya milik kamu.)
5. Setelah deploy selesai, salin **Web app URL** yang muncul (bentuknya seperti `https://script.google.com/macros/s/xxxxx/exec`).

**Langkah 5 — Sambungkan ke form**
1. Buka `config.js` di VS Code.
2. Ganti baris:
   ```js
   const SCRIPT_URL = "PASTE_URL_WEB_APP_APPS_SCRIPT_DI_SINI";
   ```
   dengan URL Web App dari Langkah 4, contoh:
   ```js
   const SCRIPT_URL = "https://script.google.com/macros/s/xxxxx/exec";
   ```
3. Simpan file. (`index.html` dan `admin.html` sama-sama memakai `config.js`, jadi cukup diisi sekali.)

**Langkah 6 — Deploy ulang setelah mengubah Code.gs**
Karena `Code.gs` sudah ditambah fungsi `doGet` untuk dashboard, deploy ulang agar perubahan aktif:
1. Klik **Deploy → Manage deployments**.
2. Klik ikon pensil pada deployment yang ada.
3. Di "Version", pilih **New version**, lalu klik **Deploy**.
4. URL Web App tetap sama, tidak perlu diganti di `config.js`.

## Mengatur password dashboard admin
Password login dashboard diset langsung di file `admin.js`:
```js
const ADMIN_PASSWORD = "riyadhuljannah2026";
```
Ganti nilainya dengan password pilihan panitia, lalu simpan file.

## Membuka dashboard admin
1. Buka `admin.html` lewat Live Server (atau tombol "Panel Panitia" di bawah formulir pendaftaran).
2. Masukkan password yang diset di file `admin.js`.
3. Dashboard menampilkan tabel seluruh pendaftar, jumlah total & pendaftar hari ini, kolom pencarian (nama/NISN/sekolah asal), tombol lihat dokumen (KK/KTP/Foto), dan tombol unduh data sebagai CSV.
4. Sesi login tersimpan sementara di browser (hilang saat tab ditutup) — klik **Keluar** untuk logout manual.

> **Catatan keamanan:** password ini dicek langsung di browser (di file `admin.js`), bukan di server. Artinya siapa pun yang membuka "View Page Source" atau file `admin.js` bisa melihat passwordnya, dan siapa pun yang tahu URL Apps Script sebenarnya juga bisa mengambil data pendaftar tanpa login sama sekali (endpoint `?action=list` tidak diproteksi password). Ini cukup untuk gerbang sederhana di lingkungan sekolah agar data tidak terlihat sembarangan, tapi **jangan andalkan untuk data yang benar-benar sensitif**. Kalau butuh proteksi lebih kuat nanti, kabari saya — bisa dibalikkan ke versi yang mengecek password di sisi Apps Script.

## Publikasi lewat GitHub Pages
Karena situs ini murni HTML/CSS/JS statis (semua logika penyimpanan data ada di Google Apps Script), situs ini bisa dihosting gratis di GitHub Pages:

1. Buat repository baru di GitHub (bisa publik atau privat — privat butuh GitHub Pro/Team untuk Pages, publik gratis).
2. Push folder ini ke repository tersebut lewat VS Code (Source Control → Publish to GitHub), atau lewat terminal:
   ```bash
   git init
   git add .
   git commit -m "PPDB Riyadhul Jannah"
   git branch -M main
   git remote add origin https://github.com/USERNAME/NAMA-REPO.git
   git push -u origin main
   ```
3. Di GitHub, buka repo → **Settings → Pages**.
4. Pada "Build and deployment", pilih **Deploy from a branch**, branch **main**, folder **/ (root)**, lalu **Save**.
5. Tunggu 1-2 menit, situs akan aktif di `https://USERNAME.github.io/NAMA-REPO/`.
6. Pastikan `config.js` sudah diisi URL Apps Script **sebelum** push, karena file tersebut ikut ter-publish.

**Catatan soal `Code.gs` di repo publik:** file `Code.gs` di folder ini hanya untuk disalin manual ke Apps Script — tidak dijalankan oleh GitHub Pages. Boleh tetap disertakan di repo (isinya hanya logika, bukan password), tapi kalau mau lebih rapi, kamu bisa menambahkan `Code.gs` ke file `.gitignore` supaya tidak ikut ter-push, karena file itu sudah tersimpan otomatis di project Apps Script kamu.

## Menjalankan di VS Code
1. Buka folder ini di VS Code.
2. Install ekstensi **Live Server** (oleh Ritwick Dey) dari VS Code Marketplace.
3. Klik kanan `index.html` → **Open with Live Server**.
4. Formulir akan terbuka di browser dan siap diuji coba — isi form lalu klik **Kirim Pendaftaran**. Data akan langsung muncul di tab "Pendaftaran" pada spreadsheet, dan file akan tersimpan di folder Drive yang kamu buat.

## Mengganti logo
`index.html` saat ini memakai ikon SVG sederhana sebagai pengganti logo. Untuk memakai logo asli sekolah:
1. Simpan file logo (misalnya `logo.png`) di folder ini.
2. Di `index.html`, ganti bagian `<div class="brand-mark">...</div>` dengan:
   ```html
   <div class="brand-mark">
     <img src="logo.png" alt="Logo Riyadhul Jannah" width="44" height="44">
   </div>
   ```

## Setelah deploy ke hosting (opsional)
Jika nanti mau menaruh form ini di hosting/domain sekolah (misalnya lewat Netlify, Vercel, atau GitHub Pages), tinggal unggah ketiga file `index.html`, `style.css`, dan `script.js` — tidak perlu ada perubahan lain, karena semua sudah tersambung ke Apps Script lewat internet.

## Update pertanyaan/field formulir
Semua field ada di `index.html` di dalam tag `<form id="ppdbForm">`. Untuk menambah field baru:
1. Tambahkan `<div class="field">...</div>` baru di `index.html` dengan `name` yang sesuai.
2. Tambahkan baris yang sama di `payload` pada `script.js`.
3. Tambahkan kolom header baru di `Code.gs` (dalam fungsi `getOrCreateSheet_`) dan tambahkan `data.namaField` di `sheet.appendRow([...])` pada fungsi `doPost`.
4. Kalau field itu juga perlu tampil di dashboard admin, tambahkan `<th>` baru di `admin.html` dan baris `<td>` yang sesuai di fungsi `renderTable()` pada `admin.js`.
5. Deploy ulang Apps Script (Deploy → Manage deployments → New version) agar perubahan `Code.gs` aktif.
