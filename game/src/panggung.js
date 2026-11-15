// Penataan adegan untuk screenshot dan uji otomatis. Hanya aktif lewat
// parameter URL (?shot=start|play|win|end&seed=7 atau ?uji=1); pemain biasa
// tidak pernah menyentuh jalur ini.

import { KONFIG } from './config.js';

function masukanPola(waktu) {
  return {
    arahBelok: () => Math.sin(waktu * 0.7) * 0.6,
    arahKayuh: () => 0.3,
    ditekan: () => false,
    klik: () => false,
    mouse: { aktif: false, diDalam: false, x: 0, y: 0 },
  };
}

function simulasi(permainan, langkah, dt = 1 / 60) {
  for (let i = 0; i < langkah; i += 1) {
    permainan.langkahDenganMasukan(dt, masukanPola(i * dt));
    if (permainan.mode !== 'main') break;
  }
}

function susunAdeganMain(permainan) {
  const j = permainan.jarakTempuh;
  const dunia = permainan.dunia;
  const tambahRintangan = (jenis, djarak, offset, radius) => {
    dunia.rintangan.push({
      jenis,
      jarak: j + djarak,
      offset,
      radius,
      vx: jenis === 'batang' ? 0.12 : 0,
      fase: 1,
      benih: 0.4,
    });
  };
  tambahRintangan('batu', 250, -0.55, 32);
  tambahRintangan('batu', 430, 0.52, 36);
  tambahRintangan('pusaran', 640, 0.08, 36);
  tambahRintangan('batang', 780, -0.32, 30);
  const tambahKunang = (jenis, djarak, offset) => {
    dunia.kunang.push({ jenis, jarak: j + djarak, offset, radius: jenis === 'raja' ? 21 : 15, fase: 0.5 });
  };
  tambahKunang('kunang', 170, -0.18);
  tambahKunang('kunang', 225, 0.02);
  tambahKunang('kunang', 280, 0.2);
  tambahKunang('raja', 520, 0.58);
  tambahKunang('perisai', 350, -0.68);
  permainan.kombo = 3;
  permainan.waktuKombo = 1.6;
  permainan.perahu.cahaya = 82;
  permainan.partikel.kilau(permainan.perahu.x - 40, permainan.perahu.yLayar - 120, '#ffe27a', 8);
  permainan.partikel.teksMelayang(permainan.perahu.x, permainan.perahu.yLayar - 110, '+75', '#ffe27a', 22);
  permainan.autopilot = true;
  permainan.perbaruiHUD();
}

export function terapkanPanggung(permainan, params) {
  const shot = params.get('shot');
  if (params.get('uji') === '1') {
    ujiOtomatis(permainan);
    return;
  }
  if (!shot) return;
  if (shot === 'start') return; // Layar judul sudah tampil + atraksi berjalan.
  if (shot === 'play') {
    permainan.mulai();
    simulasi(permainan, 280);
    if (permainan.mode === 'main') susunAdeganMain(permainan);
    return;
  }
  if (shot === 'win') {
    permainan.mulai();
    simulasi(permainan, 120);
    permainan.jarakTempuh = KONFIG.jarakMenang * KONFIG.pxPerMeter;
    permainan.skor = 8420;
    permainan.kunangTerkumpul = 46;
    permainan.waktuMain = 204;
    permainan.perahu.cahaya = 64;
    permainan.langkahDenganMasukan(1 / 60, masukanPola(0));
    permainan.perbaruiHUD();
    return;
  }
  if (shot === 'end') {
    permainan.mulai();
    simulasi(permainan, 120);
    permainan.jarakTempuh = 1840 * KONFIG.pxPerMeter;
    permainan.skor = 2310;
    permainan.kunangTerkumpul = 18;
    permainan.waktuMain = 149;
    permainan.perahu.lambung = 0;
    permainan.kalahkan();
    permainan.perbaruiHUD();
  }
}

// Uji otomatis di browser: mensimulasikan permainan dan menulis hasilnya ke
// judul dokumen + elemen #hasil-uji, supaya bisa dibaca dari luar.
function ujiOtomatis(permainan) {
  const hasil = [];
  const cek = (nama, benar) => hasil.push(`${benar ? 'LULUS' : 'GAGAL'}:${nama}`);
  try {
    permainan.mulai();
    const xAwal = permainan.perahu.x;
    simulasi(permainan, 600);
    cek('jalan', permainan.jarakTempuh > 2000);
    cek('skor-naik', permainan.skor > 50);
    cek('perahu-bergerak', Math.abs(permainan.perahu.x - xAwal) > 5);
    cek('dunia-terisi', permainan.dunia.rintangan.length > 0 && permainan.dunia.kunang.length >= 0);
    const tengah = permainan.dunia.tengahX(permainan.jarakTempuh);
    const batas = permainan.dunia.setengahLebar();
    cek('perahu-di-sungai', permainan.perahu.x >= tengah - batas - 1 && permainan.perahu.x <= tengah + batas + 1);
    cek('mode-main-atau-selesai', ['main', 'menang', 'kalah'].includes(permainan.mode));
    // Jalur menang.
    permainan.mulai();
    simulasi(permainan, 30);
    permainan.jarakTempuh = KONFIG.jarakMenang * KONFIG.pxPerMeter;
    permainan.langkahDenganMasukan(1 / 60, masukanPola(0));
    cek('menang', permainan.mode === 'menang');
    // Jalur kalah.
    permainan.mulai();
    permainan.perahu.lambung = 1;
    permainan.perahu.kebal = 0;
    permainan.dunia.rintangan.push({
      jenis: 'batu',
      jarak: permainan.jarakTempuh + (permainan.perahu.yLayar - permainan.perahu.yLayar),
      offset: 0,
      radius: 30,
      vx: 0,
      fase: 0,
      benih: 0.5,
    });
    const r = permainan.dunia.rintangan[permainan.dunia.rintangan.length - 1];
    r.jarak = permainan.jarakTempuh;
    r.offset = (permainan.perahu.x - permainan.dunia.tengahX(permainan.jarakTempuh)) / permainan.dunia.setengahLebar();
    permainan.cekTabrakan();
    cek('kalah', permainan.mode === 'kalah' || permainan.perahu.lambung === 0);
  } catch (e) {
    hasil.push(`GAGAL:eksepsi:${e.message}`);
  }
  const lulus = hasil.every((h) => h.startsWith('LULUS'));
  const teks = `UJI ${lulus ? 'LULUS' : 'GAGAL'} | ${hasil.join(' | ')}`;
  document.title = teks;
  const el = document.createElement('div');
  el.id = 'hasil-uji';
  el.textContent = teks;
  el.style.cssText = 'position:fixed;left:0;top:0;background:#fff;color:#000;font:12px monospace;z-index:99';
  document.body.appendChild(el);
}
