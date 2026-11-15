// Partikel (cipratan, kilau, jejak air) dan teks melayang (+25, KOMBO, ...).
// Semuanya hidup singkat dan digambar di atas dunia, di bawah HUD.

export class Partikel {
  constructor() {
    this.daftar = [];
    this.teks = [];
  }

  reset() {
    this.daftar = [];
    this.teks = [];
  }

  tambah(x, y, opsi) {
    this.daftar.push({
      x,
      y,
      vx: opsi.vx ?? 0,
      vy: opsi.vy ?? 0,
      hidup: opsi.hidup ?? 0.6,
      sisa: opsi.hidup ?? 0.6,
      ukuran: opsi.ukuran ?? 3,
      warna: opsi.warna ?? '#ffffff',
      gravitasi: opsi.gravitasi ?? 0,
      menyusut: opsi.menyusut ?? true,
    });
  }

  cipratan(x, y, kuat = 1) {
    for (let i = 0; i < Math.round(16 * kuat); i += 1) {
      const sudut = Math.random() * Math.PI * 2;
      const laju = 60 + Math.random() * 170 * kuat;
      this.tambah(x, y, {
        vx: Math.cos(sudut) * laju,
        vy: Math.sin(sudut) * laju - 60,
        hidup: 0.5 + Math.random() * 0.4,
        ukuran: 2 + Math.random() * 3.5,
        warna: Math.random() < 0.5 ? '#bfe3ff' : '#eaf6ff',
        gravitasi: 420,
      });
    }
  }

  kilau(x, y, warna = '#ffe27a', jumlah = 10) {
    for (let i = 0; i < jumlah; i += 1) {
      const sudut = Math.random() * Math.PI * 2;
      const laju = 25 + Math.random() * 90;
      this.tambah(x, y, {
        vx: Math.cos(sudut) * laju,
        vy: Math.sin(sudut) * laju,
        hidup: 0.45 + Math.random() * 0.35,
        ukuran: 1.8 + Math.random() * 2.6,
        warna,
      });
    }
  }

  jejak(x, y) {
    this.tambah(x + (Math.random() - 0.5) * 18, y + 16, {
      vx: (Math.random() - 0.5) * 20,
      vy: 40 + Math.random() * 30,
      hidup: 0.5 + Math.random() * 0.3,
      ukuran: 2.5 + Math.random() * 3,
      warna: 'rgba(191, 227, 255, 0.55)',
      menyusut: true,
    });
  }

  teksMelayang(x, y, isi, warna = '#ffe27a', ukuran = 22) {
    this.teks.push({ x, y, isi, warna, ukuran, sisa: 1.0, hidup: 1.0 });
  }

  update(dt) {
    for (const p of this.daftar) {
      p.sisa -= dt;
      p.vy += p.gravitasi * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    this.daftar = this.daftar.filter((p) => p.sisa > 0);
    for (const t of this.teks) {
      t.sisa -= dt;
      t.y -= 42 * dt;
    }
    this.teks = this.teks.filter((t) => t.sisa > 0);
  }

  gambar(ctx) {
    for (const p of this.daftar) {
      const k = p.sisa / p.hidup;
      ctx.globalAlpha = Math.max(0, k);
      ctx.fillStyle = p.warna;
      const r = p.menyusut ? p.ukuran * k + 0.4 : p.ukuran;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (const t of this.teks) {
      const k = Math.min(1, t.sisa / t.hidup + 0.25);
      ctx.globalAlpha = Math.max(0, k);
      ctx.font = `800 ${t.ukuran}px "Trebuchet MS", "Segoe UI", sans-serif`;
      ctx.textAlign = 'center';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(5, 8, 22, 0.85)';
      ctx.strokeText(t.isi, t.x, t.y);
      ctx.fillStyle = t.warna;
      ctx.fillText(t.isi, t.x, t.y);
    }
    ctx.globalAlpha = 1;
  }
}
