// Keyboard, mouse, dan sentuhan. Game membaca status lewat metode tanya dan
// mengonsumsi tombol yang baru ditekan sekali per frame.

const TOMBOL_ARAH = new Set([
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  ' ',
]);

export class Masukan {
  constructor(kanvas) {
    this.kanvas = kanvas;
    this.tombolBawah = new Set();
    this.tombolBaru = new Set();
    this.mouse = { x: 0, y: 0, diDalam: false, aktif: false };
    this.klikBaru = false;
    this.sentuhAktif = false;
    this.pasang();
  }

  pasang() {
    window.addEventListener('keydown', (e) => {
      if (TOMBOL_ARAH.has(e.key)) e.preventDefault();
      if (!e.repeat) this.tombolBaru.add(e.key);
      this.tombolBawah.add(e.key);
    });
    window.addEventListener('keyup', (e) => {
      this.tombolBawah.delete(e.key);
    });
    window.addEventListener('blur', () => {
      this.tombolBawah.clear();
    });

    const keKoordinat = (clientX, clientY) => {
      const r = this.kanvas.getBoundingClientRect();
      return {
        x: ((clientX - r.left) / r.width) * this.kanvas.width,
        y: ((clientY - r.top) / r.height) * this.kanvas.height,
      };
    };

    this.kanvas.addEventListener('mousemove', (e) => {
      const p = keKoordinat(e.clientX, e.clientY);
      this.mouse.x = p.x;
      this.mouse.y = p.y;
      this.mouse.diDalam = true;
      this.mouse.aktif = true;
    });
    this.kanvas.addEventListener('mouseleave', () => {
      this.mouse.diDalam = false;
    });
    this.kanvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) this.klikBaru = true;
    });
    this.kanvas.addEventListener('touchstart', (e) => {
      const t = e.changedTouches[0];
      const p = keKoordinat(t.clientX, t.clientY);
      this.mouse.x = p.x;
      this.mouse.y = p.y;
      this.mouse.aktif = true;
      this.sentuhAktif = true;
      this.klikBaru = true;
    }, { passive: true });
    this.kanvas.addEventListener('touchmove', (e) => {
      const t = e.changedTouches[0];
      const p = keKoordinat(t.clientX, t.clientY);
      this.mouse.x = p.x;
      this.mouse.y = p.y;
    }, { passive: true });
    this.kanvas.addEventListener('touchend', () => {
      this.sentuhAktif = false;
    });
  }

  // Arah belok: -1 kiri, +1 kanan, 0 diam.
  arahBelok() {
    const kiri = this.tombolBawah.has('ArrowLeft') || this.tombolBawah.has('a') || this.tombolBawah.has('A');
    const kanan = this.tombolBawah.has('ArrowRight') || this.tombolBawah.has('d') || this.tombolBawah.has('D');
    return (kanan ? 1 : 0) - (kiri ? 1 : 0);
  }

  // Arah kayuh: +1 cepat, -1 pelan, 0 biasa.
  arahKayuh() {
    const cepat = this.tombolBawah.has('ArrowUp') || this.tombolBawah.has('w') || this.tombolBawah.has('W');
    const pelan = this.tombolBawah.has('ArrowDown') || this.tombolBawah.has('s') || this.tombolBawah.has('S');
    return (cepat ? 1 : 0) - (pelan ? 1 : 0);
  }

  // Benar sekali saat tombol ditekan (konsumsi di akhir frame).
  ditekan(...tombol) {
    return tombol.some((t) => this.tombolBaru.has(t));
  }

  // Benar sekali saat klik mouse / sentuhan baru.
  klik() {
    const hasil = this.klikBaru;
    this.klikBaru = false;
    return hasil;
  }

  // Dipanggil game di akhir tiap frame.
  akhirFrame() {
    this.tombolBaru.clear();
  }
}
