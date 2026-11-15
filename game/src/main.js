// Titik masuk Arus Lentera: buat permainan, terapkan panggung screenshot
// bila diminta lewat URL, lalu jalankan loop.

import { Permainan } from './permainan.js';
import { terapkanPanggung } from './panggung.js';

const params = new URLSearchParams(window.location.search);
const bijiParam = Number(params.get('seed'));
const biji = Number.isFinite(bijiParam) && bijiParam > 0 ? Math.floor(bijiParam) : (Date.now() % 2147483647) + 1;

const kanvas = document.getElementById('layar');
const permainan = new Permainan(kanvas, biji);
terapkanPanggung(permainan, params);
permainan.jalan();
