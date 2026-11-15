// Semua angka penyetelan Arus Lentera. Satu tempat untuk mengubah rasa game.

export const KONFIG = {
  lebar: 1280,
  tinggi: 720,

  // Sungai: lebar aliran (px) dan lengkung tepi.
  lebarSungai: 880,
  amplitudoKelok: 120,
  panjangKelok: 900,

  // Target dan nyawa.
  jarakMenang: 3000,
  pxPerMeter: 25,
  lambungAwal: 3,
  cahayaAwal: 100,
  cahayaMaks: 100,

  // Laju dasar (px/detik) dan skala per tahap.
  lajuArus: 240,
  lajuMaks: 430,
  percepatanKayuh: 90,

  // Perahu.
  belok: 460,
  gesekBelok: 6.5,
  radiusPerahu: 26,
  kebalDetik: 1.6,
  dashDetik: 0.32,
  dashJeda: 2.6,
  dashDorong: 340,

  // Lentera: redup per detik dan isi per kunang-kunang.
  redupCahaya: 1.5,
  isiCahayaKunang: 9,
  isiCahayaRaja: 30,

  // Skor.
  skorPerMeter: 2,
  skorKunang: 25,
  skorRaja: 150,
  bonusTahap: 200,
  komboJendela: 2.2,
  komboMaks: 5,

  // Rintangan: jarak antar baris (px aliran) dan peluang tiap baris.
  jarakBaris: 260,
  peluangBatu: 0.62,
  peluangBatang: 0.3,
  peluangPusaran: 0.24,
  peluangKunang: 0.55,
  peluangRaja: 0.05,
  peluangPerisai: 0.07,

  // Tahap: nama, meter mulai, pengali laju, pengali kepadatan, warna aksen.
  tahap: [
    { nama: 'Hulu Tenang', mulai: 0, laju: 1.0, padat: 1.0, aksen: '#7fd4ff' },
    { nama: 'Jeram Berbisik', mulai: 750, laju: 1.16, padat: 1.18, aksen: '#8affc1' },
    { nama: 'Hutan Gelap', mulai: 1500, laju: 1.32, padat: 1.36, aksen: '#c9a6ff' },
    { nama: 'Muara Emas', mulai: 2250, laju: 1.48, padat: 1.5, aksen: '#ffd97a' },
  ],

  // Palet malam sungai.
  warna: {
    langitAtas: '#0a1030',
    langitBawah: '#182457',
    airDalam: '#12275a',
    airDangkal: '#1d3f8f',
    tepiKiri: '#0d2b1f',
    tepiKanan: '#0d2b1f',
    bulan: '#fdf3cf',
    kunang: '#ffe27a',
    bahaya: '#ff6b5e',
  },
};
