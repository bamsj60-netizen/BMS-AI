
# Auralis AI

Static multi-file frontend dengan UI bergaya Claude, dibuat untuk:
- chat AI
- analisis gambar
- analisis file teks
- image generation
- riwayat percakapan lokal
- welcome screen awal

## Struktur
- `index.html`
- `styles.css`
- `app.js`
- `config.js`

## Cara pakai lokal
Buka `index.html` langsung di browser, atau pakai server statis sederhana.

Contoh:
```bash
python -m http.server 8000
```

Lalu buka `http://localhost:8000`.

## Deploy ke GitHub Pages
Upload semua file ke repository, aktifkan GitHub Pages, lalu arahkan ke branch yang berisi file ini.

## Yang perlu kamu set
Buka `config.js` dan isi:
- `endpoints.vision.baseUrl`
- `endpoints.file.baseUrl`
- `endpoints.imageGen.baseUrl`

`endpoints.text.baseUrl` sudah diarahkan ke endpoint teks yang dipakai di project lama. Kalau backend kamu beda, tinggal ganti di situ.

## Catatan
Frontend ini sudah siap dipakai tanpa build step. Jadi tidak ada drama dependency. Tinggal sesuaikan endpoint backend dan jalan.
