# Arus Lentera

Game arcade orisinal: kendalikan perahu kecil pembawa lentera menyusuri sungai
malam sejauh 3.000 meter sampai ke Muara Emas. Hindari batu, batang hanyut, dan
pusaran air, kumpulkan kunang-kunang untuk menjaga cahaya lenteramu, dan
selamatlah melewati empat tahap sungai yang arusnya makin deras.

## Cara main

- **Tujuan:** capai Muara Emas di 3.000 m. Perahu punya 3 lambung; menabrak
  rintangan mengurangi 1 lambung. Kehabisan lambung berarti permainan berakhir.
- **Skor:** jarak tempuh + kunang-kunang (kombo bila diambil berurutan cepat)
  + bonus tiap tahap + sisa cahaya saat menang.
- **Kontrol:**
  - `←` / `→` atau `A` / `D`: belok kiri-kanan.
  - `↑` / `↓` atau `W` / `S`: kayuh lebih cepat / pelankan laju.
  - Gerakkan mouse: perahu mengikuti arah mouse; klik: dash singkat.
  - `P`: jeda, `R`: mulai ulang, `M`: bisu, `Enter`/`Spasi`: mulai.
- **Tahap sungai:** Hulu Tenang (0 m), Jeram Berbisik (750 m), Hutan Gelap
  (1.500 m), dan Muara Emas (2.250 m) — arus dan rintangan makin padat.
- **Bantuan:** perisai gelembung (menahan satu tabrakan), Kunang Raja
  (poin besar), dan cahaya lentera yang terang memperluas pandangan.

## Menjalankan lokal

```
node serve.ts
```

Lalu buka `http://localhost:8080` di Chrome desktop. Game sepenuhnya statis,
tanpa build step dan tanpa permintaan jaringan: semua kode, gaya, dan suara
(suara dibuat dengan WebAudio) berasal dari berkas di bawah `game/`.

## Struktur kode

- `game/index.html` — kanvas, HUD, dan layar menu.
- `game/style.css` — tampilan HUD dan menu.
- `game/src/config.js` — semua angka penyetelan game.
- `game/src/rng.js` — generator angka acak berbiji (seed).
- `game/src/audio.js` — efek suara hasil sintesis WebAudio.
- `game/src/input.js` — keyboard, mouse, dan sentuhan.
- `game/src/dunia.js` — sungai, rintangan, kunang-kunang, dan tahap.
- `game/src/perahu.js` — gerak perahu, lentera, dan kerusakan.
- `game/src/partikel.js` — cipratan, kilau, dan teks melayang.
- `game/src/render.js` — semua gambar di kanvas.
- `game/src/permainan.js` — mesin status game, skor, dan HUD.
- `game/src/panggung.js` — penataan adegan untuk screenshot (`?shot=`).
- `game/src/main.js` — titik masuk.
- `main.ts` — menyalin `game/` + `screenshots/` ke output dan menulis
  `dossier.json` dengan pustaka kit.

## Lisensi

MIT — lihat `LICENSE`.
