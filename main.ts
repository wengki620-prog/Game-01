// Penyerahan entry Arus Lentera (Node 22, pustaka standar saja). Program ini
// menyalin game/ dan screenshots/ dari samping berkas ini ke direktori output,
// lalu menulis dossier.json yang dibaca juri dengan pustaka kit yang tervendor.
//
// Di luar kontainer grader, MAKEFUN_OUTPUT_DIR menggantikan /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Main lokal untuk dimainkan: `node serve.ts`, lalu buka http://localhost:8080.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const output = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(output, { recursive: true });
cpSync(join(root, 'game'), join(output, 'game'), { recursive: true });
mkdirSync(join(output, 'screenshots'), { recursive: true });
if (existsSync(join(root, 'screenshots'))) {
  cpSync(join(root, 'screenshots'), join(output, 'screenshots'), {
    recursive: true,
  });
}

// Batas yang sama dengan gate penilai: hanya text_max_bytes yang membentuk byte
// dossier; batas lain membuat program gagal di tempat yang sama dengan penilai
// (lebih dari 4 screenshot atau satu di atas 256 KiB; game/ di atas 993 entri
// atau 48 MiB, karena /output sendiri dibatasi 1000 entri).
writeFileSync(
  join(output, 'dossier.json'),
  buildDossier(output, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
