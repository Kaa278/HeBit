# HeBit Landing Page

Landing page Astro untuk HeBit, termasuk playground chat yang memakai server-side API route agar API key tidak terekspos ke browser.

## Setup Environment

1. Salin file contoh environment:

```sh
cp .env.example .env
```

2. Isi `HEBIT_API_KEY` di `.env` dengan API key aktif:

```env
HEBIT_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> Catatan: `.env` sudah masuk `.gitignore`, jadi jangan commit file ini. Restart dev server setelah membuat atau mengubah `.env`, karena Astro membaca environment variable saat server start. Untuk deployment, set `HEBIT_API_KEY` lewat dashboard environment variables provider hosting yang dipakai.

## Cara Menjalankan

Install dependency:

```sh
npm install
```

Jalankan dev server:

```sh
npm run dev
```

Buka `http://localhost:4321`.

## Perintah Project

| Command | Fungsi |
| :-- | :-- |
| `npm install` | Install dependency |
| `npm run dev` | Jalankan dev server di `localhost:4321` |
| `npm run build` | Build production ke `./dist/` |
| `npm run preview` | Preview hasil build production |
| `npm run astro -- --help` | Bantuan Astro CLI |

## Struktur Penting

```text
src/pages/index.astro      # Landing page utama + playground UI
src/pages/api/chat.ts      # Proxy API chat server-side
.env.example               # Contoh konfigurasi environment
```

## Catatan API Playground

- Browser hanya memanggil endpoint internal `/api/chat`.
- Endpoint `/api/chat` meneruskan request ke upstream HeBit dari server.
- `HEBIT_API_KEY` hanya dibaca di server melalui environment variable.
- Jika `HEBIT_API_KEY` belum diset, endpoint akan mengembalikan error konfigurasi server.
