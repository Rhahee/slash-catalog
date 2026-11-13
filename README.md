# Slash Catalog — Prompt Gambar ChatGPT

Katalog **shorthand prompt komunitas khusus image generator ChatGPT**. Semua entri fitur aplikasi dari versi sebelumnya telah diganti. HTML, CSS, JavaScript, JSON, dan delapan gambar PNG lokal; tanpa dependensi npm, backend aplikasi, database, atau API runtime.

## Isi katalog

| Kode | Tujuan | Referensi nama kode |
| --- | --- | --- |
| `/metaads` | Visual iklan produk dengan ruang untuk judul | [Wishyani](https://www.wishyani.com/commands/metaads) |
| `/3dbillboard` | Konsep billboard anamorfik | [Wishyani](https://www.wishyani.com/commands/3dbillboard) |
| `/showcase` | Foto produk studio berlatar netral | [Wishyani](https://www.wishyani.com/commands/showcase) |
| `/ugcmodel` | Produk bersama model dewasa fiktif | [Wishyani](https://www.wishyani.com/commands/ugcmodel) |
| `/miniature` | Diorama produk dengan gaya kerajinan mini | [Wishyani](https://www.wishyani.com/commands/miniature) |
| `/storybook` | Ilustrasi hangat bergaya buku cerita anak | [Wishyani](https://www.wishyani.com/commands/storybook) |
| `/birdseye` | Komposisi flat lay dari tepat di atas objek | [Arjav Jain](https://arjavjain.org/posts/chatgpt-image-prompt-codes-slash-commands#birdseye) |
| `/blueprint` | Ilustrasi garis bergaya gambar teknik | [Arjav Jain](https://arjavjain.org/posts/chatgpt-image-prompt-codes-slash-commands#blueprint) |

Kode tersebut **bukan command resmi atau fitur tersembunyi OpenAI**. Referensi komunitas menjelaskan penggunaan nama dan konsepnya. Prompt lengkap ditulis sendiri dalam bahasa Indonesia dan Inggris, bukan salinan atau terjemahan verbatim dari artikel sumber.

Tombol **Salin prompt lengkap** menyalin instruksi gambar, bukan kode singkat. Prompt dapat digunakan tanpa memasang Custom Instructions. Foto produk opsional: jika tidak dilampirkan, prompt menyediakan deskripsi cangkir biru fiktif tanpa merek.

## Jalankan lokal

Node.js 18+ diperlukan untuk server dan tes. Tidak perlu `npm install`.

```powershell
cd 'F:\Slash Commad Catalog'
npm start
```

Buka http://127.0.0.1:4173/. Hentikan server terminal dengan `Ctrl+C`. Jika port lama masih dipakai, jalankan `npm start -- --port 4174` dan buka http://127.0.0.1:4174/. Jangan memakai `file://` karena JSON dan modules dimuat melalui HTTP.

Jika server sudah berjalan saat `scripts/serve.mjs` diubah, mulai ulang agar rute aset baru ikut dimuat. Pada sesi revisi ini server lama 4173 tidak dihentikan; pratinjau lengkap dengan aset baru menggunakan 4174. Server hanya menerima loopback dan GET/HEAD, dengan daftar berkas publik eksplisit.

## Contoh visual dan provenance

- Delapan gambar asli dibuat dengan **built-in image_gen**, lalu disalin ke `assets/examples/`. Tidak menggunakan API key atau mengambil gambar dari situs komunitas.
- Produk contoh: cangkir keramik biru kobalt matte, berbadan silinder dan bergagang D, tanpa merek.
- Semua gambar dibuat independen tanpa foto masukan. Tidak ada klaim transformasi sebelum/sesudah, kesetiaan produk identik, atau bahwa `/kode` saja menghasilkan contoh tersebut.
- Model manusia dalam contoh UGC adalah tokoh fiktif, bukan pelanggan atau pemberi testimoni.
- Prompt aktual yang dikirim ke tool dicatat di [artifacts/image-generation-prompts.json](artifacts/image-generation-prompts.json). Prompt katalog merupakan versi yang dapat disesuaikan, termasuk foto produk opsional.
- Label dan caption membedakan referensi komunitas dari contoh AI. Gambar yang sama dipakai untuk kedua bahasa; penjelasan dan alt text tersedia dalam kedua bahasa.

## Memperbarui konten

Data ada di `data/catalog.json`, teks UI di `i18n.js`. Struktur versi 2 memiliki `scope: "image-prompts"` dan menolak data versi lama.

Setiap entri wajib memiliki:

- ID slug stabil dan `name` berupa shorthand berawalan `/`.
- `type: "community-shorthand"`, `platform: "chatgpt-images"`, kategori valid.
- `access.kind: "shorthand"` dan `access.label.id`/`en`.
- `keywords.id`/`en` dan `content.id`/`en` dengan `summary`, `input`, `steps`, `prompt`, dan `result`.
- `example.image` berupa `/assets/examples/<id>.png`, serta `example.alt` dan `example.note` dalam dua bahasa.
- `verification.method: "community"`, `checkedAt` tanggal ISO aktual, sumber HTTPS, dan catatan atribusi dua bahasa. Verification berarti peninjauan referensi nama kode, bukan dukungan resmi aplikasi.

Tambahkan PNG ke `assets/examples/` dan rutenya ke allowlist di `scripts/serve.mjs`, kemudian mulai ulang server. Teks dirender sebagai teks biasa, bukan HTML. Fitur navigasi aplikasi, menu editor umum, dan command Codex berada di luar cakupan.

## Perilaku dan pengujian

- Pencarian kode, kegunaan, kata kunci, dan label akses lintas kedua bahasa; semua kata harus cocok. Kategori dan pencarian berlaku bersama.
- Bahasa awal Indonesia; pilihan disimpan di browser. Detail memakai hash stabil, mendukung muat ulang dan riwayat browser.
- Modal native mendukung keyboard, Escape, pengalih bahasa, prompt lengkap, bahan referensi, contoh visual, dan atribusi sumber.
- Clipboard API digunakan pada localhost/HTTPS; kegagalan menampilkan petunjuk salin manual.
- Error data, entri tidak ditemukan, dan pencarian tanpa hasil memiliki pesan tersendiri. `/` memfokuskan pencarian saat tidak mengetik atau membuka modal.

```powershell
npm test
npm run test:preview
```

Sembilan tes meliputi scope dan validasi konten, pencarian/filter, hash, terjemahan, URL sumber, serta keberadaan dan header PNG seluruh gambar publik.

Fixture sintetis tersedia hanya pada server khusus tes. Default test preview memakai 4174; jika port itu dipakai katalog utama, gunakan `npm run test:preview -- --port 4175`. Route `/__test/` memuat fixture; `/__test/error` mensimulasikan kegagalan data. Server normal tidak melayani fixture, README, skrip, atau dokumen QA.

Untuk hosting statis kelak, unggah `index.html`, `styles.css`, `app.js`, `catalog.js`, `i18n.js`, `favicon.svg`, `data/`, dan `assets/`. Tidak ada deployment yang dilakukan.

Proyek independen; tidak berafiliasi dengan OpenAI atau pembuat referensi komunitas.
