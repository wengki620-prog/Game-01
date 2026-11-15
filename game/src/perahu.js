// Perahu pemain: gerak belok, kayuh, dash, lentera, lambung, dan perisai.

import { KONFIG } from './config.js';

export class Perahu {
  constructor(dunia) {
    this.dunia = dunia;
    this.reset();
  }

  reset() {
    this.x = KONFIG.lebar / 2;
    this.vx = 0;
    this.yLayar = KONFIG.tinggi * 0.78;
    this.lambung = KONFIG.lambungAwal;
    this.cahaya = KONFIG.cahayaAwal;
    this.kebal = 0;
    this.dashSisa = 0;
    this.dashJeda = 0;
    this.dashBaru = false;
    this.perisai = false;
    this.kemudi = 0;
    this.oleng = 0;
    this.waktu = 0;
  }

  get radius() {
    return KONFIG.radiusPerahu;
  }

  // Laju aliran saat ini (px/detik), dipengaruhi tahap, kayuh, dan dash.
  laju(tahap, kayuh) {
    let laju = KONFIG.lajuArus * tahap.laju + kayuh * KONFIG.percepatanKayuh;
    if (this.dashSisa > 0) laju += KONFIG.dashDorong;
    return Math.min(Math.max(laju, 120), KONFIG.lajuMaks + KONFIG.dashDorong);
  }

  update(dt, masukan, jarakTempuh, tahap) {
    this.waktu += dt;
    this.kebal = Math.max(0, this.kebal - dt);
    this.dashJeda = Math.max(0, this.dashJeda - dt);
    this.dashSisa = Math.max(0, this.dashSisa - dt);

    // Belok: keyboard memberi akselerasi, mouse menarik ke arah pointer.
    const arah = masukan.arahBelok();
    this.vx += arah * KONFIG.belok * dt;
    if (masukan.mouse.aktif && masukan.mouse.diDalam && arah === 0) {
      const selisih = masukan.mouse.x - this.x;
      this.vx += Math.max(-1, Math.min(1, selisih / 140)) * KONFIG.belok * 0.85 * dt;
    }
    this.vx -= this.vx * KONFIG.gesekBelok * dt;
    this.x += this.vx * dt;

    // Dash dari klik / sentuhan.
    if (masukan.klik() && this.dashJeda <= 0) {
      this.dashSisa = KONFIG.dashDetik;
      this.dashJeda = KONFIG.dashJeda;
      this.dashBaru = true;
    }

    // Tetap di dalam sungai.
    const tengah = this.dunia.tengahX(jarakTempuh);
    const batas = this.dunia.setengahLebar();
    const minX = tengah - batas;
    const maksX = tengah + batas;
    if (this.x < minX) {
      this.x = minX;
      this.vx = Math.max(0, this.vx);
    }
    if (this.x > maksX) {
      this.x = maksX;
      this.vx = Math.min(0, this.vx);
    }

    // Lentera meredup perlahan; lebih cepat di Hutan Gelap.
    const redup = KONFIG.redupCahaya * (tahap.nama === 'Hutan Gelap' ? 1.6 : 1);
    this.cahaya = Math.max(0, this.cahaya - redup * dt);

    // Oleng visual mengikuti kecepatan belok.
    this.kemudi += ((this.vx / KONFIG.belok) * 0.9 - this.kemudi) * Math.min(1, dt * 8);
    this.oleng = Math.sin(this.waktu * 2.1) * 0.03 + this.kemudi * 0.22;
  }

  // Tabrakan dengan rintangan. Mengembalikan 'kena' | 'perisai' | 'kebal' | null.
  tabrakan(rintangan) {
    if (this.kebal > 0 || this.dashSisa > 0) return 'kebal';
    if (this.perisai) {
      this.perisai = false;
      this.kebal = KONFIG.kebalDetik;
      return 'perisai';
    }
    this.lambung -= 1;
    this.kebal = KONFIG.kebalDetik;
    this.cahaya = Math.max(0, this.cahaya - 12);
    return 'kena';
  }

  tambahCahaya(jumlah) {
    this.cahaya = Math.min(KONFIG.cahayaMaks, this.cahaya + jumlah);
  }

  get hidup() {
    return this.lambung > 0;
  }

  get cahayaRedup() {
    return this.cahaya < 25;
  }
}
