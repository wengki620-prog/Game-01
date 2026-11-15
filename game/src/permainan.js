// Mesin permainan: status (judul/main/jeda/menang/kalah), loop, tabrakan,
// skor, kombo, tahap, HUD, dan layar hasil.

import { KONFIG } from './config.js';
import { RNG } from './rng.js';
import { Dunia } from './dunia.js';
import { Perahu } from './perahu.js';
import { Partikel } from './partikel.js';
import { Masukan } from './input.js';
import { Bunyi } from './audio.js';
import { gambarDunia } from './render.js';

const KUNCI_TERBAIK = 'arus-lentera-terbaik';

function $(id) {
  return document.getElementById(id);
}

export class Permainan {
  constructor(kanvas, biji = 1) {
    this.kanvas = kanvas;
    this.ctx = kanvas.getContext('2d');
    this.rng = new RNG(biji);
    this.dunia = new Dunia(this.rng);
    this.perahu = new Perahu(this.dunia);
    this.partikel = new Partikel();
    this.masukan = new Masukan(kanvas);
    this.bunyi = new Bunyi();
    this.mode = 'judul';
    this.waktu = 0;
    this.guncang = 0;
    this.autopilot = false;
    this.terbaik = this.bacaTerbaik();
    this.resetJalan();
    this.pasangTombol();
    this.tampilkanJudul();
  }

  bacaTerbaik() {
    try {
      return Number(window.localStorage.getItem(KUNCI_TERBAIK) || 0) || 0;
    } catch {
      return 0;
    }
  }

  simpanTerbaik() {
    try {
      window.localStorage.setItem(KUNCI_TERBAIK, String(this.terbaik));
    } catch {
      // Abaikan.
    }
  }

  resetJalan() {
    this.dunia.reset();
    this.perahu.reset();
    this.partikel.reset();
    this.jarakTempuh = 0;
    this.skor = 0;
    this.kunangTerkumpul = 0;
    this.kombo = 0;
    this.waktuKombo = 0;
    this.tahapIndeks = 0;
    this.waktuMain = 0;
    this.waktuSpanduk = 0;
    this.jejakWaktu = 0;
    this.bonusCahaya = 0;
    this.rekorBaru = false;
  }

  pasangTombol() {
    $('tombol-mulai').addEventListener('click', () => this.mulai());
    $('tombol-lanjut').addEventListener('click', () => this.lanjut());
    $('tombol-ulang-jeda').addEventListener('click', () => this.mulai());
    $('tombol-main-lagi-menang').addEventListener('click', () => this.mulai());
    $('tombol-main-lagi-kalah').addEventListener('click', () => this.mulai());
    $('tombol-jeda').addEventListener('click', () => this.alihJeda());
    $('tombol-suara').addEventListener('click', () => this.alihSuara());
    this.perbaruiIkonSuara();
  }

  tampilkanJudul() {
    this.mode = 'judul';
    this.aturLayar('layar-judul');
    $('hud').classList.add('tersembunyi');
    $('terbaik-judul').textContent = this.formatAngka(this.terbaik);
  }

  aturLayar(idAktif) {
    for (const id of ['layar-judul', 'layar-jeda', 'layar-menang', 'layar-kalah']) {
      $(id).classList.toggle('tersembunyi', id !== idAktif);
    }
    if (!idAktif) {
      for (const id of ['layar-judul', 'layar-jeda', 'layar-menang', 'layar-kalah']) {
        $(id).classList.add('tersembunyi');
      }
    }
  }

  mulai() {
    this.bunyi.buka();
    this.bunyi.klik();
    this.resetJalan();
    this.mode = 'main';
    this.aturLayar(null);
    $('hud').classList.remove('tersembunyi');
    this.perbaruiHUD();
  }

  lanjut() {
    if (this.mode !== 'jeda') return;
    this.bunyi.klik();
    this.mode = 'main';
    this.aturLayar(null);
  }

  alihJeda() {
    if (this.mode === 'main') {
      this.mode = 'jeda';
      this.aturLayar('layar-jeda');
    } else if (this.mode === 'jeda') {
      this.lanjut();
    }
  }

  alihSuara() {
    this.bunyi.buka();
    this.bunyi.setBisu(!this.bunyi.bisu);
    this.perbaruiIkonSuara();
  }

  perbaruiIkonSuara() {
    $('tombol-suara').classList.toggle('mati', this.bunyi.bisu);
  }

  // Satu langkah simulasi dengan masukan nyata (dipakai loop).
  langkah(dt) {
    this.langkahDenganMasukan(dt, this.masukan);
  }

  // Satu langkah dengan masukan apa pun (dipakai panggung/uji).
  langkahDenganMasukan(dt, masukan) {
    this.waktu += dt;
    this.guncang = Math.max(0, this.guncang - dt * 26);

    if (this.mode === 'judul') {
      this.jarakTempuh += 55 * dt;
      this.perahu.waktu += dt;
      this.perahu.x = this.dunia.tengahX(this.jarakTempuh) + Math.sin(this.waktu * 0.45) * 90;
      this.perahu.oleng = Math.sin(this.waktu * 0.45) * 0.08;
      this.dunia.update(dt, this.jarakTempuh, KONFIG.tahap[0]);
      this.partikel.update(dt);
      if (masukan.ditekan('Enter', ' ')) this.mulai();
      return;
    }

    if (this.mode === 'jeda') {
      if (masukan.ditekan('p', 'P', 'Escape', 'Enter', ' ')) this.lanjut();
      else if (masukan.ditekan('r', 'R')) this.mulai();
      return;
    }

    if (this.mode === 'menang' || this.mode === 'kalah') {
      this.partikel.update(dt);
      this.perahu.waktu += dt;
      if (masukan.ditekan('Enter', ' ', 'r', 'R')) this.mulai();
      return;
    }

    // Mode main.
    if (masukan.ditekan('p', 'P', 'Escape')) {
      this.alihJeda();
      return;
    }
    if (masukan.ditekan('r', 'R')) {
      this.mulai();
      return;
    }
    if (masukan.ditekan('m', 'M')) this.alihSuara();

    const meter = this.jarakTempuh / KONFIG.pxPerMeter;
    const tahap = this.dunia.tahapPada(meter);
    const masukanEfektif = this.autopilot ? this.masukanAutopilot() : masukan;
    this.perahu.update(dt, masukanEfektif, this.jarakTempuh, tahap);
    if (this.perahu.dashBaru) {
      this.perahu.dashBaru = false;
      this.bunyi.dash();
      this.partikel.cipratan(this.perahu.x, this.perahu.yLayar + 20, 0.7);
    }

    const laju = this.perahu.laju(tahap, masukanEfektif.arahKayuh());
    this.jarakTempuh += laju * dt;
    this.waktuMain += dt;
    this.skor += (laju * dt) / KONFIG.pxPerMeter * KONFIG.skorPerMeter;
    this.waktuKombo = Math.max(0, this.waktuKombo - dt);
    if (this.waktuKombo <= 0) this.kombo = 0;

    this.dunia.update(dt, this.jarakTempuh, tahap);
    this.cekPusaran(dt);
    this.cekTabrakan();
    this.cekKunang();
    this.partikel.update(dt);

    // Jejak air berkala di belakang perahu.
    this.jejakWaktu -= dt;
    if (this.jejakWaktu <= 0) {
      this.jejakWaktu = 0.09;
      this.partikel.jejak(this.perahu.x, this.perahu.yLayar);
    }

    // Tahap baru.
    const indeksBaru = this.dunia.indeksTahap(this.jarakTempuh / KONFIG.pxPerMeter);
    if (indeksBaru > this.tahapIndeks) {
      this.tahapIndeks = indeksBaru;
      this.skor += KONFIG.bonusTahap;
      this.waktuSpanduk = 2.4;
      this.bunyi.tahap();
      this.partikel.teksMelayang(this.perahu.x, this.perahu.yLayar - 90, `+${KONFIG.bonusTahap} TAHAP BARU`, '#8affc1', 24);
    }
    this.waktuSpanduk = Math.max(0, this.waktuSpanduk - dt);

    // Menang?
    if (this.jarakTempuh / KONFIG.pxPerMeter >= KONFIG.jarakMenang) {
      this.menangkan();
      return;
    }
    this.perbaruiHUD();
  }

  masukanAutopilot() {
    const t = this.waktu;
    return {
      arahBelok: () => Math.sin(t * 0.6) * 0.7,
      arahKayuh: () => 0.25,
      ditekan: () => false,
      klik: () => false,
      mouse: { aktif: false, diDalam: false, x: 0, y: 0 },
    };
  }

  cekPusaran(dt) {
    for (const r of this.dunia.rintangan) {
      if (r.jenis !== 'pusaran') continue;
      const x = this.dunia.xEntitas(r);
      const y = this.dunia.yEntitas(r, this.jarakTempuh, this.perahu.yLayar);
      const dx = x - this.perahu.x;
      const dy = y - this.perahu.yLayar;
      const jarak = Math.hypot(dx, dy);
      if (jarak < 170 && jarak > 1) {
        const tarik = (1 - jarak / 170) * 130 * dt;
        this.perahu.x += (dx / jarak) * tarik;
      }
    }
    const tengah = this.dunia.tengahX(this.jarakTempuh);
    const batas = this.dunia.setengahLebar();
    this.perahu.x = Math.max(tengah - batas, Math.min(tengah + batas, this.perahu.x));
  }

  cekTabrakan() {
    const perahu = this.perahu;
    for (const r of this.dunia.rintangan) {
      const x = this.dunia.xEntitas(r);
      const y = this.dunia.yEntitas(r, this.jarakTempuh, perahu.yLayar);
      if (y < -70 || y > KONFIG.tinggi + 70) continue;
      const jarak = Math.hypot(x - perahu.x, y - perahu.yLayar);
      if (jarak >= r.radius + perahu.radius * 0.8) continue;
      if (perahu.dashSisa > 0) {
        // Dash menghancurkan rintangan.
        r.jarak = -99999;
        this.skor += 10;
        this.partikel.cipratan(x, y, 1.2);
        this.partikel.teksMelayang(x, y - 30, '+10 HANCUR!', '#bfe3ff', 20);
        this.bunyi.perisaiPecah();
        continue;
      }
      const hasil = perahu.tabrakan(r);
      if (hasil === 'kena') {
        r.jarak = -99999;
        this.kombo = 0;
        this.waktuKombo = 0;
        this.guncang = 15;
        this.partikel.cipratan(perahu.x, perahu.yLayar, 1.5);
        this.bunyi.tabrak();
        if (!perahu.hidup) {
          this.kalahkan();
          return;
        }
      } else if (hasil === 'perisai') {
        r.jarak = -99999;
        this.partikel.kilau(perahu.x, perahu.yLayar, '#8adcff', 14);
        this.partikel.teksMelayang(perahu.x, perahu.yLayar - 70, 'PERISAI PECAH!', '#8adcff', 20);
        this.bunyi.perisaiPecah();
      }
    }
    this.dunia.rintangan = this.dunia.rintangan.filter((r) => r.jarak > -1000);
  }

  cekKunang() {
    const perahu = this.perahu;
    for (const k of this.dunia.kunang) {
      const x = this.dunia.xEntitas(k);
      const y = this.dunia.yEntitas(k, this.jarakTempuh, perahu.yLayar);
      if (y < -60 || y > KONFIG.tinggi + 60) continue;
      const jarak = Math.hypot(x - perahu.x, y - perahu.yLayar);
      if (jarak >= k.radius + perahu.radius + 8) continue;
      k.jarak = -99999;
      if (k.jenis === 'kunang') {
        this.kombo = this.waktuKombo > 0 ? Math.min(this.kombo + 1, KONFIG.komboMaks) : 1;
        this.waktuKombo = KONFIG.komboJendela;
        const poin = KONFIG.skorKunang * this.kombo;
        this.skor += poin;
        this.kunangTerkumpul += 1;
        perahu.tambahCahaya(KONFIG.isiCahayaKunang);
        this.partikel.kilau(x, y, '#ffe27a', 10);
        this.partikel.teksMelayang(x, y - 26, `+${poin}`, '#ffe27a', 22);
        this.bunyi.kumpul(this.kombo);
      } else if (k.jenis === 'raja') {
        this.skor += KONFIG.skorRaja;
        this.kunangTerkumpul += 1;
        perahu.tambahCahaya(KONFIG.isiCahayaRaja);
        this.partikel.kilau(x, y, '#ffcf3d', 22);
        this.partikel.teksMelayang(x, y - 30, `+${KONFIG.skorRaja} KUNANG RAJA!`, '#ffcf3d', 24);
        this.bunyi.raja();
      } else {
        perahu.perisai = true;
        this.partikel.kilau(x, y, '#8adcff', 16);
        this.partikel.teksMelayang(x, y - 30, 'PERISAI AKTIF!', '#8adcff', 22);
        this.bunyi.perisai();
      }
    }
    this.dunia.kunang = this.dunia.kunang.filter((k) => k.jarak > -1000);
  }

  menangkan() {
    this.bonusCahaya = Math.round(this.perahu.cahaya) * 5;
    this.skor += this.bonusCahaya;
    this.mode = 'menang';
    this.waktuSpanduk = 0;
    $('spanduk-tahap').classList.add('tersembunyi');
    $('kombo').classList.add('tersembunyi');
    this.rekorBaru = Math.floor(this.skor) > this.terbaik;
    if (this.rekorBaru) {
      this.terbaik = Math.floor(this.skor);
      this.simpanTerbaik();
    }
    $('hasil-skor-menang').textContent = this.formatAngka(Math.floor(this.skor));
    $('hasil-kunang-menang').textContent = String(this.kunangTerkumpul);
    $('hasil-waktu-menang').textContent = this.formatWaktu(this.waktuMain);
    $('hasil-cahaya-menang').textContent = `+${this.formatAngka(this.bonusCahaya)}`;
    $('rekor-menang').classList.toggle('tersembunyi', !this.rekorBaru);
    this.aturLayar('layar-menang');
    this.partikel.kilau(this.perahu.x, this.perahu.yLayar - 40, '#ffe27a', 30);
    this.bunyi.menang();
  }

  kalahkan() {
    this.mode = 'kalah';
    this.waktuSpanduk = 0;
    $('spanduk-tahap').classList.add('tersembunyi');
    $('kombo').classList.add('tersembunyi');
    this.rekorBaru = Math.floor(this.skor) > this.terbaik;
    if (this.rekorBaru) {
      this.terbaik = Math.floor(this.skor);
      this.simpanTerbaik();
    }
    $('hasil-skor-kalah').textContent = this.formatAngka(Math.floor(this.skor));
    $('hasil-jarak-kalah').textContent = `${this.formatAngka(Math.floor(this.jarakTempuh / KONFIG.pxPerMeter))} m`;
    $('hasil-kunang-kalah').textContent = String(this.kunangTerkumpul);
    $('hasil-tahap-kalah').textContent = this.dunia.tahapPada(this.jarakTempuh / KONFIG.pxPerMeter).nama;
    $('rekor-kalah').classList.toggle('tersembunyi', !this.rekorBaru);
    this.aturLayar('layar-kalah');
    this.partikel.cipratan(this.perahu.x, this.perahu.yLayar, 2);
    this.bunyi.kalah();
  }

  perbaruiHUD() {
    $('nilai-skor').textContent = this.formatAngka(Math.floor(this.skor));
    $('nilai-terbaik').textContent = this.formatAngka(this.terbaik);
    const meter = Math.min(this.jarakTempuh / KONFIG.pxPerMeter, KONFIG.jarakMenang);
    const tahap = this.dunia.tahapPada(meter);
    $('nama-tahap').textContent = tahap.nama;
    $('nama-tahap').style.color = tahap.aksen;
    const persen = (meter / KONFIG.jarakMenang) * 100;
    $('isi-jarak').style.width = `${persen}%`;
    $('ikon-perahu').style.left = `${persen}%`;
    $('teks-jarak').textContent = `${this.formatAngka(Math.floor(meter))} m / ${this.formatAngka(KONFIG.jarakMenang)} m`;

    const hati = $('nyawa');
    const isi = Array.from({ length: KONFIG.lambungAwal }, (_, i) =>
      `<span class="${i < this.perahu.lambung ? '' : 'kosong'}">♥</span>`).join('');
    if (hati.dataset.isi !== isi) {
      hati.innerHTML = isi;
      hati.dataset.isi = isi;
    }

    const cahayaEl = $('isi-cahaya');
    cahayaEl.style.width = `${this.perahu.cahaya}%`;
    cahayaEl.style.background = this.perahu.cahayaRedup
      ? 'linear-gradient(90deg, #ff5a3c, #ff9d2e)'
      : 'linear-gradient(90deg, #ff9d2e, #ffe27a)';

    const komboEl = $('kombo');
    if (this.kombo >= 2 && this.waktuKombo > 0) {
      komboEl.textContent = `KOMBO ×${this.kombo}`;
      komboEl.classList.remove('tersembunyi');
    } else {
      komboEl.classList.add('tersembunyi');
    }

    const spanduk = $('spanduk-tahap');
    if (this.waktuSpanduk > 0) {
      spanduk.textContent = this.dunia.tahapPada(meter).nama;
      spanduk.classList.remove('tersembunyi');
      spanduk.style.opacity = String(Math.min(1, this.waktuSpanduk));
    } else {
      spanduk.classList.add('tersembunyi');
    }
  }

  formatAngka(n) {
    return n.toLocaleString('id-ID');
  }

  formatWaktu(detik) {
    const m = Math.floor(detik / 60);
    const s = Math.floor(detik % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  gambar() {
    gambarDunia(this.ctx, {
      dunia: this.dunia,
      perahu: this.perahu,
      partikel: this.partikel,
      jarakTempuh: this.jarakTempuh,
      meter: this.jarakTempuh / KONFIG.pxPerMeter,
      tahap: this.dunia.tahapPada(this.jarakTempuh / KONFIG.pxPerMeter),
      waktu: this.waktu,
      guncang: this.guncang,
      mode: this.mode,
    });
  }

  jalan() {
    let terakhir = performance.now();
    const putaran = (sekarang) => {
      const dt = Math.min(0.05, (sekarang - terakhir) / 1000);
      terakhir = sekarang;
      this.langkah(dt);
      this.gambar();
      this.masukan.akhirFrame();
      requestAnimationFrame(putaran);
    };
    requestAnimationFrame(putaran);
  }
}
