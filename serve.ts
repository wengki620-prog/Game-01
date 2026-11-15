// Server statis kecil untuk memainkan game/ secara lokal (Node 22, pustaka
// standar saja). Jalankan `node serve.ts [--port 8080]`, lalu buka alamat yang
// tercetak di Chrome desktop. Hanya melayani berkas di bawah game/.

import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const akar = resolve(fileURLToPath(new URL('./game', import.meta.url)));
const argumen = process.argv.slice(2);
const posisiPort = argumen.indexOf('--port');
const diminta = posisiPort === -1 ? 8080 : Number(argumen[posisiPort + 1]);
const port =
  Number.isInteger(diminta) && diminta > 0 && diminta < 65536 ? diminta : 8080;

const TIPE: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.txt': 'text/plain; charset=utf-8',
};

createServer((permintaan, jawaban) => {
  const url = new URL(permintaan.url ?? '/', 'http://localhost');
  let namaJalan: string;
  try {
    namaJalan = decodeURIComponent(url.pathname);
  } catch {
    jawaban.writeHead(400).end('bad request');
    return;
  }
  if (namaJalan.endsWith('/')) namaJalan += 'index.html';
  const berkas = resolve(join(akar, normalize(namaJalan)));
  if (berkas !== akar && !berkas.startsWith(akar + sep)) {
    jawaban.writeHead(403).end('forbidden');
    return;
  }
  let ukuran: number;
  try {
    const info = statSync(berkas);
    if (!info.isFile()) throw new Error('bukan berkas');
    ukuran = info.size;
  } catch {
    jawaban.writeHead(404).end('not found');
    return;
  }
  jawaban.writeHead(200, {
    'content-type': TIPE[extname(berkas).toLowerCase()] ?? 'application/octet-stream',
    'content-length': ukuran,
    'cache-control': 'no-store',
  });
  createReadStream(berkas).pipe(jawaban);
}).listen(port, '127.0.0.1', () => {
  console.log(`game/ tersaji di http://localhost:${port}`);
});
