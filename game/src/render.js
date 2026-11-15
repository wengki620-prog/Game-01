// Semua gambar di kanvas: daratan, sungai, hiasan, rintangan, kunang-kunang,
// perahu, cahaya lentera, dan kegelapan. Pandangan dari atas, sungai mengalir
// dari atas layar ke bawah mengikuti lengkung dunia.

import { KONFIG } from './config.js';

function hash(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function jalurSungai(ctx, dunia, jarakTempuh, yPerahu, pad) {
  const { lebar, tinggi } = KONFIG;
  const kiri = [];
  const kanan = [];
  for (let y = -60; y <= tinggi + 60; y += 24) {
    const jarak = jarakTempuh + (yPerahu - y);
    const cx = dunia.tengahX(jarak);
    const setengah = dunia.setengahLebar() + 46 + pad;
    kiri.push([cx - setengah, y]);
    kanan.push([cx + setengah, y]);
  }
  ctx.beginPath();
  ctx.moveTo(kiri[0][0], kiri[0][1]);
  for (const [x, y] of kiri) ctx.lineTo(x, y);
  for (let i = kanan.length - 1; i >= 0; i -= 1) ctx.lineTo(kanan[i][0], kanan[i][1]);
  ctx.closePath();
}

export function gambarDunia(ctx, s) {
  const { lebar, tinggi } = KONFIG;
  const { dunia, perahu, partikel, jarakTempuh, waktu } = s;
  const yPerahu = perahu.yLayar;

  ctx.save();
  if (s.guncang > 0.2) {
    ctx.translate((Math.random() - 0.5) * s.guncang, (Math.random() - 0.5) * s.guncang);
  }

  gambarDaratan(ctx, s);
  gambarAir(ctx, s);
  gambarHiasan(ctx, s);
  gambarRintangan(ctx, s);
  gambarKunang(ctx, s);
  gambarPerahu(ctx, s);
  partikel.gambar(ctx);
  gambarCahaya(ctx, s);
  gambarKabut(ctx, s);

  // Gelap bila cahaya lentera menipis: pandangan menyempit ke sekitar perahu.
  const cahaya = perahu.cahaya;
  if (cahaya < 60 && s.mode === 'main') {
    const k = 1 - cahaya / 60;
    const radius = 170 + cahaya * 3.2;
    const gelap = ctx.createRadialGradient(perahu.x, yPerahu, radius * 0.35, perahu.x, yPerahu, radius * 1.9);
    gelap.addColorStop(0, 'rgba(3, 5, 16, 0)');
    gelap.addColorStop(0.55, `rgba(3, 5, 16, ${0.25 * k})`);
    gelap.addColorStop(1, `rgba(3, 5, 16, ${0.82 * k})`);
    ctx.fillStyle = gelap;
    ctx.fillRect(-30, -30, lebar + 60, tinggi + 60);
  }

  // Nuansa emas di ujung sungai.
  if (s.mode === 'menang' || s.meter > KONFIG.jarakMenang - 180) {
    const emas = ctx.createLinearGradient(0, 0, 0, tinggi * 0.55);
    emas.addColorStop(0, 'rgba(255, 205, 110, 0.30)');
    emas.addColorStop(1, 'rgba(255, 205, 110, 0)');
    ctx.fillStyle = emas;
    ctx.fillRect(0, 0, lebar, tinggi * 0.55);
  }

  // Vignette lembut.
  const vig = ctx.createRadialGradient(lebar / 2, tinggi / 2, tinggi * 0.42, lebar / 2, tinggi / 2, tinggi * 0.85);
  vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vig.addColorStop(1, 'rgba(2, 4, 12, 0.5)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, lebar, tinggi);

  ctx.restore();

  // Garis tepi air yang terang (di luar guncangan, agar tepi selalu rapi).
  ctx.save();
  ctx.strokeStyle = 'rgba(140, 200, 255, 0.28)';
  ctx.lineWidth = 3;
  jalurSungai(ctx, dunia, jarakTempuh, yPerahu, 0);
  ctx.stroke();
  ctx.restore();
}

function gambarDaratan(ctx, s) {
  const { lebar, tinggi } = KONFIG;
  const { dunia, jarakTempuh, waktu } = s;
  const grad = ctx.createLinearGradient(0, 0, 0, tinggi);
  grad.addColorStop(0, '#0a1f16');
  grad.addColorStop(0.5, '#0d2b1f');
  grad.addColorStop(1, '#081a12');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, lebar, tinggi);

  // Rumput dan kerikil di daratan, deterministik per petak dunia.
  const yPerahu = s.perahu.yLayar;
  const petak = 130;
  const awal = Math.floor((jarakTempuh - 200) / petak);
  const akhir = Math.floor((jarakTempuh + tinggi + 200) / petak);
  for (let b = awal; b <= akhir; b += 1) {
    for (let k = 0; k < 4; k += 1) {
      const h1 = hash(b * 7 + k * 13);
      const h2 = hash(b * 11 + k * 29);
      const sisi = k % 2 === 0 ? -1 : 1;
      const jarak = b * petak + h2 * petak;
      const y = yPerahu - (jarak - jarakTempuh);
      if (y < -20 || y > tinggi + 20) continue;
      const cx = dunia.tengahX(jarak);
      const x = cx + sisi * (dunia.setengahLebar() + 70 + h1 * 220);
      if (x < -10 || x > lebar + 10) continue;
      if (h1 < 0.5) {
        ctx.strokeStyle = 'rgba(70, 140, 90, 0.55)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 4, y - 9 - h2 * 6);
        ctx.moveTo(x + 3, y);
        ctx.lineTo(x + 5, y - 8 - h1 * 6);
        ctx.moveTo(x, y);
        ctx.lineTo(x + 1, y - 12 - h2 * 5);
        ctx.stroke();
      } else if (h1 < 0.8) {
        ctx.fillStyle = 'rgba(120, 130, 120, 0.4)';
        ctx.beginPath();
        ctx.ellipse(x, y, 4 + h2 * 4, 3 + h2 * 2, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const nyala = 0.5 + 0.5 * Math.sin(waktu * 1.4 + b + k);
        ctx.fillStyle = `rgba(255, 226, 122, ${0.25 + 0.35 * nyala})`;
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function gambarAir(ctx, s) {
  const { lebar, tinggi } = KONFIG;
  const { dunia, jarakTempuh, waktu } = s;
  const yPerahu = s.perahu.yLayar;
  const grad = ctx.createLinearGradient(0, 0, 0, tinggi);
  grad.addColorStop(0, KONFIG.warna.airDalam);
  grad.addColorStop(0.5, KONFIG.warna.airDangkal);
  grad.addColorStop(1, KONFIG.warna.airDalam);
  jalurSungai(ctx, dunia, jarakTempuh, yPerahu, 0);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.save();
  ctx.clip();

  // Tepi berpasir di kedua sisi aliran.
  ctx.strokeStyle = 'rgba(216, 190, 130, 0.35)';
  ctx.lineWidth = 12;
  jalurSungai(ctx, dunia, jarakTempuh, yPerahu, -4);
  ctx.stroke();

  // Alur air: goresan pendek yang mengalir ke bawah.
  const petak = 110;
  const awal = Math.floor((jarakTempuh - 100) / petak);
  const akhir = Math.floor((jarakTempuh + tinggi + 100) / petak);
  ctx.lineCap = 'round';
  for (let b = awal; b <= akhir; b += 1) {
    for (let k = 0; k < 2; k += 1) {
      const h1 = hash(b * 5 + k * 17);
      const h2 = hash(b * 9 + k * 23);
      const jarak = b * petak + h2 * petak;
      const y = yPerahu - (jarak - jarakTempuh);
      if (y < -30 || y > tinggi + 30) continue;
      const cx = dunia.tengahX(jarak);
      const x = cx + (h1 - 0.5) * (dunia.setengahLebar() * 1.7);
      const panjang = 26 + h2 * 46;
      ctx.strokeStyle = `rgba(170, 215, 255, ${0.06 + h1 * 0.1})`;
      ctx.lineWidth = 2 + h2 * 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.sin(waktu + b) * 4, y + panjang);
      ctx.stroke();
    }
  }

  // Kilau bulan di permukaan air.
  const kilauX = lebar * 0.72 + Math.sin(waktu * 0.2) * 20;
  const kilau = ctx.createRadialGradient(kilauX, 90, 10, kilauX, 90, 260);
  kilau.addColorStop(0, 'rgba(220, 235, 255, 0.14)');
  kilau.addColorStop(1, 'rgba(220, 235, 255, 0)');
  ctx.fillStyle = kilau;
  ctx.fillRect(0, 0, lebar, tinggi);
  ctx.restore();
}

function gambarHiasan(ctx, s) {
  const { tinggi } = KONFIG;
  const { dunia, jarakTempuh } = s;
  const yPerahu = s.perahu.yLayar;
  for (const h of dunia.hiasan) {
    const x = dunia.xEntitas(h);
    const y = dunia.yEntitas(h, jarakTempuh, yPerahu);
    if (y < -80 || y > tinggi + 80) continue;
    const sk = h.skala;
    if (h.jenis === 'pohon') {
      ctx.fillStyle = '#4a3220';
      ctx.fillRect(x - 3 * sk, y - 8 * sk, 6 * sk, 12 * sk);
      for (let lapis = 0; lapis < 3; lapis += 1) {
        const ly = y - 10 * sk - lapis * 16 * sk;
        const lw = (30 - lapis * 7) * sk;
        ctx.fillStyle = lapis === 0 ? '#123524' : lapis === 1 ? '#17452c' : '#1d5a38';
        ctx.beginPath();
        ctx.moveTo(x, ly - 22 * sk);
        ctx.lineTo(x - lw / 2, ly);
        ctx.lineTo(x + lw / 2, ly);
        ctx.closePath();
        ctx.fill();
      }
    } else if (h.jenis === 'semak') {
      ctx.fillStyle = '#1a4a2e';
      for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath();
        ctx.arc(x + i * 9 * sk, y - 4 * sk - Math.abs(i) * -3, 9 * sk, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = '#5d6673';
      ctx.beginPath();
      ctx.ellipse(x, y - 3 * sk, 12 * sk, 8 * sk, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.beginPath();
      ctx.ellipse(x - 3 * sk, y - 6 * sk, 5 * sk, 3 * sk, -0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function gambarRintangan(ctx, s) {
  const { tinggi } = KONFIG;
  const { dunia, jarakTempuh, waktu } = s;
  const yPerahu = s.perahu.yLayar;
  for (const r of dunia.rintangan) {
    const x = dunia.xEntitas(r);
    const y = dunia.yEntitas(r, jarakTempuh, yPerahu);
    if (y < -90 || y > tinggi + 90) continue;
    if (r.jenis === 'batu') {
      ctx.fillStyle = '#6d7684';
      ctx.beginPath();
      for (let i = 0; i <= 8; i += 1) {
        const sudut = (i / 8) * Math.PI * 2;
        const rad = r.radius * (0.82 + 0.3 * Math.abs(Math.sin(r.benih * 20 + i * 2.4)));
        const px = x + Math.cos(sudut) * rad;
        const py = y + Math.sin(sudut) * rad * 0.85;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.beginPath();
      ctx.ellipse(x - r.radius * 0.25, y - r.radius * 0.3, r.radius * 0.4, r.radius * 0.22, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(230, 244, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x, y + r.radius * 0.55, r.radius * 1.05, r.radius * 0.4, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (r.jenis === 'batang') {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.sin(r.fase * 0.7) * 0.16 + (r.vx >= 0 ? 0.08 : -0.08));
      ctx.fillStyle = '#7a5230';
      ctx.beginPath();
      ctx.roundRect(-46, -11, 92, 22, 11);
      ctx.fill();
      ctx.fillStyle = '#5e3a1e';
      ctx.beginPath();
      ctx.ellipse(-46, 0, 7, 11, 0, 0, Math.PI * 2);
      ctx.ellipse(46, 0, 7, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 220, 170, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-34, -4);
      ctx.lineTo(34, -4);
      ctx.moveTo(-30, 4);
      ctx.lineTo(30, 4);
      ctx.stroke();
      ctx.restore();
      ctx.strokeStyle = 'rgba(230, 244, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x, y + 14, 48, 9, 0, 0, Math.PI);
      ctx.stroke();
    } else {
      // Pusaran: tiga lengan spiral berputar.
      ctx.fillStyle = 'rgba(6, 12, 34, 0.85)';
      ctx.beginPath();
      ctx.arc(x, y, r.radius, 0, Math.PI * 2);
      ctx.fill();
      for (let lengan = 0; lengan < 3; lengan += 1) {
        ctx.strokeStyle = 'rgba(170, 215, 255, 0.75)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let t = 0; t <= 1.01; t += 0.12) {
          const sudut = r.fase * 2.4 + lengan * ((Math.PI * 2) / 3) + t * 4.2;
          const rad = 6 + t * (r.radius - 6);
          const px = x + Math.cos(sudut) * rad;
          const py = y + Math.sin(sudut) * rad;
          if (t === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
    }
  }
}

function gambarKunang(ctx, s) {
  const { tinggi } = KONFIG;
  const { dunia, jarakTempuh, waktu } = s;
  const yPerahu = s.perahu.yLayar;
  for (const k of dunia.kunang) {
    const x = dunia.xEntitas(k);
    const y = dunia.yEntitas(k, jarakTempuh, yPerahu) + Math.sin(k.fase) * 5;
    if (y < -60 || y > tinggi + 60) continue;
    const denyut = 0.6 + 0.4 * Math.sin(waktu * 4 + k.fase);
    if (k.jenis === 'kunang') {
      const halo = ctx.createRadialGradient(x, y, 1, x, y, 26);
      halo.addColorStop(0, `rgba(255, 226, 122, ${0.55 * denyut})`);
      halo.addColorStop(1, 'rgba(255, 226, 122, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(x, y, 26, 0, Math.PI * 2);
      ctx.fill();
      const kepak = Math.sin(k.fase * 3) * 0.5;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(kepak * 0.3);
      ctx.beginPath();
      ctx.ellipse(-6, -3, 6, 3, -0.5, 0, Math.PI * 2);
      ctx.ellipse(6, -3, 6, 3, 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#ffe27a';
      ctx.beginPath();
      ctx.ellipse(x, y, 5, 7, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (k.jenis === 'raja') {
      const halo = ctx.createRadialGradient(x, y, 1, x, y, 46);
      halo.addColorStop(0, `rgba(255, 200, 60, ${0.65 * denyut})`);
      halo.addColorStop(1, 'rgba(255, 200, 60, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(x, y, 46, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffcf3d';
      ctx.beginPath();
      ctx.ellipse(x, y, 8, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff3c4';
      ctx.beginPath();
      ctx.moveTo(x - 8, y - 11);
      ctx.lineTo(x - 4, y - 19);
      ctx.lineTo(x, y - 12);
      ctx.lineTo(x + 4, y - 19);
      ctx.lineTo(x + 8, y - 11);
      ctx.closePath();
      ctx.fill();
    } else {
      // Perisai gelembung.
      ctx.strokeStyle = 'rgba(140, 220, 255, 0.9)';
      ctx.lineWidth = 2.5;
      ctx.fillStyle = 'rgba(140, 220, 255, 0.18)';
      ctx.beginPath();
      ctx.arc(x, y, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x - 5, y - 6, 7, Math.PI * 0.9, Math.PI * 1.5);
      ctx.stroke();
      ctx.fillStyle = '#bfe9ff';
      ctx.beginPath();
      ctx.moveTo(x, y - 8);
      ctx.lineTo(x + 6, y - 3);
      ctx.lineTo(x + 4, y + 6);
      ctx.lineTo(x, y + 10);
      ctx.lineTo(x - 4, y + 6);
      ctx.lineTo(x - 6, y - 3);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function gambarPerahu(ctx, s) {
  const { perahu, waktu } = s;
  const x = perahu.x;
  const y = perahu.yLayar;
  const berkedip = perahu.kebal > 0 && Math.floor(waktu * 12) % 2 === 0;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(perahu.oleng);
  if (berkedip) ctx.globalAlpha = 0.4;

  // Buih di haluan.
  ctx.strokeStyle = 'rgba(230, 244, 255, 0.65)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(-14, -30, 12, Math.PI * 0.15, Math.PI * 0.7);
  ctx.arc(14, -30, 12, Math.PI * 0.3, Math.PI * 0.85);
  ctx.stroke();

  // Lambung perahu.
  const badan = ctx.createLinearGradient(0, -36, 0, 34);
  badan.addColorStop(0, '#a06a3a');
  badan.addColorStop(0.5, '#8a5a33');
  badan.addColorStop(1, '#6b4423');
  ctx.fillStyle = badan;
  ctx.beginPath();
  ctx.moveTo(0, -38);
  ctx.quadraticCurveTo(21, -14, 18, 14);
  ctx.quadraticCurveTo(16, 30, 0, 35);
  ctx.quadraticCurveTo(-16, 30, -18, 14);
  ctx.quadraticCurveTo(-21, -14, 0, -38);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#4a2c12';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 220, 170, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-14, -8);
  ctx.lineTo(14, -8);
  ctx.moveTo(-15, 8);
  ctx.lineTo(15, 8);
  ctx.stroke();

  // Bangku dan tiang lentera.
  ctx.fillStyle = '#5e3a1e';
  ctx.fillRect(-12, 12, 24, 5);
  ctx.strokeStyle = '#3d2410';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 16);
  ctx.lineTo(0, -2);
  ctx.stroke();

  // Lentera.
  ctx.fillStyle = '#ffd97a';
  ctx.beginPath();
  ctx.arc(0, -6, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff6d8';
  ctx.beginPath();
  ctx.arc(0, -6, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Bendera kecil di haluan.
  ctx.strokeStyle = '#3d2410';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -38);
  ctx.lineTo(0, -50);
  ctx.stroke();
  ctx.fillStyle = '#ffab2e';
  ctx.beginPath();
  ctx.moveTo(0, -50);
  ctx.lineTo(14, -46);
  ctx.lineTo(0, -42);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  // Gelembung perisai.
  if (perahu.perisai) {
    const denyut = 1 + 0.04 * Math.sin(waktu * 5);
    ctx.strokeStyle = 'rgba(140, 220, 255, 0.85)';
    ctx.lineWidth = 3;
    ctx.fillStyle = 'rgba(140, 220, 255, 0.12)';
    ctx.beginPath();
    ctx.arc(x, y, 44 * denyut, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

function gambarCahaya(ctx, s) {
  const { perahu } = s;
  const radius = 120 + perahu.cahaya * 1.7;
  const pijar = ctx.createRadialGradient(perahu.x, perahu.yLayar - 6, 8, perahu.x, perahu.yLayar - 6, radius);
  pijar.addColorStop(0, 'rgba(255, 205, 110, 0.30)');
  pijar.addColorStop(0.45, 'rgba(255, 190, 90, 0.12)');
  pijar.addColorStop(1, 'rgba(255, 190, 90, 0)');
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = pijar;
  ctx.beginPath();
  ctx.arc(perahu.x, perahu.yLayar - 6, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function gambarKabut(ctx, s) {
  const { lebar, tinggi } = KONFIG;
  for (let i = 0; i < 3; i += 1) {
    const x = ((s.waktu * 14 + i * 470) % (lebar + 360)) - 180;
    const y = 130 + i * 190 + Math.sin(s.waktu * 0.3 + i * 2) * 24;
    const kabut = ctx.createRadialGradient(x, y, 10, x, y, 190);
    kabut.addColorStop(0, 'rgba(200, 215, 240, 0.05)');
    kabut.addColorStop(1, 'rgba(200, 215, 240, 0)');
    ctx.fillStyle = kabut;
    ctx.beginPath();
    ctx.ellipse(x, y, 190, 60, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}
