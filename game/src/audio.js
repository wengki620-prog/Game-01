// Efek suara hasil sintesis WebAudio — tanpa berkas suara apa pun. Semua bunyi
// dibuat dari osilator dan derau, dan diam total bila konteks audio belum
// dibuka oleh gestur pemain atau bila dibisukan.

export class Bunyi {
  constructor() {
    this.ctx = null;
    this.induk = null;
    this.bisu = false;
    try {
      this.bisu = window.localStorage.getItem('arus-lentera-bisu') === '1';
    } catch {
      this.bisu = false;
    }
  }

  // Dipanggil saat gestur pertama (klik tombol / tekan tombol).
  buka() {
    try {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
        this.induk = this.ctx.createGain();
        this.induk.gain.value = this.bisu ? 0 : 0.5;
        this.induk.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') void this.ctx.resume();
    } catch {
      // Audio opsional: game tetap jalan tanpa suara.
    }
  }

  setBisu(bisu) {
    this.bisu = bisu;
    try {
      window.localStorage.setItem('arus-lentera-bisu', bisu ? '1' : '0');
    } catch {
      // Abaikan bila penyimpanan tidak tersedia.
    }
    if (this.induk && this.ctx) {
      this.induk.gain.setTargetAtTime(bisu ? 0 : 0.5, this.ctx.currentTime, 0.02);
    }
  }

  siap() {
    return Boolean(this.ctx) && this.ctx.state === 'running' && !this.bisu;
  }

  nada(frekuensi, durasi, jenis = 'sine', volume = 0.5, geserKe = null, tunda = 0) {
    if (!this.siap()) return;
    try {
      const t0 = this.ctx.currentTime + tunda;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = jenis;
      osc.frequency.setValueAtTime(frekuensi, t0);
      if (geserKe !== null) osc.frequency.exponentialRampToValueAtTime(geserKe, t0 + durasi);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + durasi);
      osc.connect(gain);
      gain.connect(this.induk);
      osc.start(t0);
      osc.stop(t0 + durasi + 0.05);
    } catch {
      // Abaikan.
    }
  }

  derau(durasi, volume = 0.4, tunda = 0) {
    if (!this.siap()) return;
    try {
      const t0 = this.ctx.currentTime + tunda;
      const panjang = Math.max(1, Math.floor(this.ctx.sampleRate * durasi));
      const buffer = this.ctx.createBuffer(1, panjang, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < panjang; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / panjang);
      const sumber = this.ctx.createBufferSource();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 900;
      gain.gain.setValueAtTime(volume, t0);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + durasi);
      sumber.buffer = buffer;
      sumber.connect(filter);
      filter.connect(gain);
      gain.connect(this.induk);
      sumber.start(t0);
    } catch {
      // Abaikan.
    }
  }

  kumpul(kombo) {
    const dasar = 660 + Math.min(kombo, 5) * 90;
    this.nada(dasar, 0.12, 'sine', 0.45);
    this.nada(dasar * 1.5, 0.16, 'sine', 0.35, null, 0.06);
  }

  raja() {
    this.nada(523, 0.14, 'triangle', 0.5);
    this.nada(659, 0.14, 'triangle', 0.5, null, 0.09);
    this.nada(784, 0.2, 'triangle', 0.5, null, 0.18);
    this.nada(1047, 0.28, 'sine', 0.45, null, 0.27);
  }

  tabrak() {
    this.nada(140, 0.25, 'sawtooth', 0.4, 55);
    this.derau(0.3, 0.5);
  }

  perisai() {
    this.nada(392, 0.12, 'sine', 0.4);
    this.nada(523, 0.18, 'sine', 0.4, null, 0.08);
  }

  perisaiPecah() {
    this.nada(880, 0.1, 'square', 0.22, 220);
    this.derau(0.12, 0.25);
  }

  tahap() {
    this.nada(330, 0.5, 'sine', 0.4);
    this.nada(495, 0.5, 'sine', 0.3, null, 0.1);
  }

  menang() {
    const urutan = [523, 659, 784, 1047, 784, 1047, 1319];
    urutan.forEach((f, i) => this.nada(f, 0.24, 'triangle', 0.45, null, i * 0.13));
  }

  kalah() {
    this.nada(330, 0.35, 'sine', 0.4, 220);
    this.nada(247, 0.5, 'sine', 0.4, 165, 0.25);
    this.derau(0.5, 0.25, 0.1);
  }

  klik() {
    this.nada(740, 0.07, 'sine', 0.3);
  }

  dash() {
    this.derau(0.18, 0.3);
    this.nada(300, 0.18, 'sine', 0.25, 620);
  }
}
