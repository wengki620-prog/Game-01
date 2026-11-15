// Sungai, rintangan, kunang-kunang, hiasan tepi, dan tahap. Dunia diukur dalam
// "jarak" (px aliran); layar menampilkan selisih jarak terhadap perahu.

import { KONFIG } from './config.js';

export class Dunia {
  constructor(rng) {
    this.rng = rng;
    this.reset();
  }

  reset() {
    this.rintangan = [];
    this.kunang = [];
    this.hiasan = [];
    this.barisBerikut = 650;
    this.bintang = [];
    for (let i = 0; i < 90; i += 1) {
      this.bintang.push({
        x: this.rng.range(0, KONFIG.lebar),
        y: this.rng.range(0, 300),
        r: this.rng.range(0.6, 2.1),
        fase: this.rng.range(0, Math.PI * 2),
      });
    }
  }

  // Posisi x tengah sungai pada jarak tertentu (kelok lembut dua gelombang).
  tengahX(jarak) {
    return (
      KONFIG.lebar / 2 +
      Math.sin((jarak / KONFIG.panjangKelok) * Math.PI * 2) * KONFIG.amplitudoKelok +
      Math.sin(jarak / 521) * 30
    );
  }

  // Setengah lebar sungai yang bisa dilayari pada jarak tertentu.
  setengahLebar() {
    return KONFIG.lebarSungai / 2 - 46;
  }

  // Tahap aktif dari meter tempuh.
  tahapPada(meter) {
    let hasil = KONFIG.tahap[0];
    for (const t of KONFIG.tahap) {
      if (meter >= t.mulai) hasil = t;
    }
    return hasil;
  }

  indeksTahap(meter) {
    let hasil = 0;
    KONFIG.tahap.forEach((t, i) => {
      if (meter >= t.mulai) hasil = i;
    });
    return hasil;
  }

  // Posisi x layar sebuah entitas dari offset relatifnya terhadap tengah sungai.
  xEntitas(entitas) {
    return this.tengahX(entitas.jarak) + entitas.offset * this.setengahLebar();
  }

  // Posisi y layar sebuah entitas. Perahu selalu di yLayarPerahu.
  yEntitas(entitas, jarakTempuh, yLayarPerahu) {
    return yLayarPerahu - (entitas.jarak - jarakTempuh);
  }

  update(dt, jarakTempuh, tahap) {
    const padat = tahap.padat;
    while (this.barisBerikut < jarakTempuh + 1100) {
      this.buatBaris(this.barisBerikut, padat);
      this.barisBerikut += KONFIG.jarakBaris * this.rng.range(0.85, 1.15) / Math.sqrt(padat);
    }
    for (const r of this.rintangan) {
      if (r.jenis === 'batang') {
        r.offset += r.vx * dt;
        if (r.offset > 0.92 || r.offset < -0.92) r.vx *= -1;
      }
      r.fase += dt * 2;
    }
    for (const k of this.kunang) k.fase += dt * 3;
    const batas = jarakTempuh - 260;
    this.rintangan = this.rintangan.filter((r) => r.jarak > batas);
    this.kunang = this.kunang.filter((k) => k.jarak > batas);
    this.hiasan = this.hiasan.filter((h) => h.jarak > batas);
  }

  buatBaris(jarak, padat) {
    const rng = this.rng;
    // Hiasan tepi: pohon, semak, batu tepi — di luar aliran.
    for (const sisi of [-1, 1]) {
      const jumlah = rng.int(0, 2);
      for (let i = 0; i < jumlah; i += 1) {
        this.hiasan.push({
          jarak: jarak + rng.range(-80, 80),
          offset: sisi * rng.range(1.12, 1.6),
          jenis: rng.pilih(['pohon', 'pohon', 'semak', 'batuTepi']),
          skala: rng.range(0.7, 1.3),
          fase: rng.range(0, Math.PI * 2),
        });
      }
    }

    // Rintangan: 1-2 per baris, dipisah cukup jauh agar selalu ada celah.
    const jumlahRintangan = rng.next() < 0.34 * padat ? 2 : 1;
    const posisi = [];
    for (let i = 0; i < jumlahRintangan; i += 1) {
      let offset = rng.range(-0.85, 0.85);
      let percobaan = 0;
      while (posisi.some((p) => Math.abs(p - offset) < 0.55) && percobaan < 6) {
        offset = rng.range(-0.85, 0.85);
        percobaan += 1;
      }
      posisi.push(offset);
      const gulung = rng.next();
      let jenis = 'batu';
      if (gulung > 1 - KONFIG.peluangPusaran * padat * 0.7) jenis = 'pusaran';
      else if (gulung < KONFIG.peluangBatang) jenis = 'batang';
      if (jenis === 'batu' && !rng.peluang(KONFIG.peluangBatu)) continue;
      this.rintangan.push({
        jenis,
        jarak: jarak + rng.range(-40, 40),
        offset,
        radius: jenis === 'pusaran' ? 36 : rng.range(26, 38),
        vx: jenis === 'batang' ? rng.pilih([-1, 1]) * rng.range(0.1, 0.22) : 0,
        fase: rng.range(0, Math.PI * 2),
        benih: rng.next(),
      });
    }

    // Kunang-kunang: 1-3 membentuk busur.
    if (rng.peluang(KONFIG.peluangKunang)) {
      const tengah = rng.range(-0.7, 0.7);
      const jumlah = rng.int(1, 3);
      for (let i = 0; i < jumlah; i += 1) {
        this.kunang.push({
          jenis: 'kunang',
          jarak: jarak + (i - (jumlah - 1) / 2) * 55,
          offset: tengah + (i - (jumlah - 1) / 2) * 0.22,
          radius: 15,
          fase: rng.range(0, Math.PI * 2),
        });
      }
    }
    // Kunang Raja: langka, poin besar.
    if (rng.peluang(KONFIG.peluangRaja)) {
      this.kunang.push({
        jenis: 'raja',
        jarak: jarak + rng.range(-60, 60),
        offset: rng.range(-0.7, 0.7),
        radius: 21,
        fase: 0,
      });
    }
    // Perisai gelembung: langka.
    if (rng.peluang(KONFIG.peluangPerisai)) {
      this.kunang.push({
        jenis: 'perisai',
        jarak: jarak + rng.range(-60, 60),
        offset: rng.range(-0.7, 0.7),
        radius: 19,
        fase: 0,
      });
    }
  }
}
