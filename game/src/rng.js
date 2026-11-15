// Generator angka acak berbiji (mulberry32) supaya adegan screenshot dan
// putaran yang sama bisa diulang persis dengan biji yang sama.

export class RNG {
  constructor(biji) {
    this.keadaan = (biji >>> 0) || 0x9e3779b9;
  }

  // Angka [0, 1).
  next() {
    this.keadaan = (this.keadaan + 0x6d2b79f5) >>> 0;
    let t = this.keadaan;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Angka [min, max).
  range(min, maks) {
    return min + this.next() * (maks - min);
  }

  // Bilangan bulat [min, maks].
  int(min, maks) {
    return Math.floor(this.range(min, maks + 1));
  }

  // Benar dengan peluang p.
  peluang(p) {
    return this.next() < p;
  }

  // Satu anggota array.
  pilih(daftar) {
    return daftar[Math.floor(this.next() * daftar.length)];
  }
}
