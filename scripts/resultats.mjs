// Récupère les résultats des équipes d'Aizenay sur le site de la FFVB (Gestion Sportive)
// et écrit data/resultats.json, lu par le studio (page « Résultats »).
//
// Source : l'export CSV « Calendrier complet du club » (une requête pour toute la saison,
// toutes équipes et compétitions confondues). Le club est repéré par son numéro FFVB,
// pas par son nom (les noms varient : « AIZENAY VOLLEY-BALL 2 », « AIZENAY 1 (Dép) »…).
//
// Lancé par GitHub Actions avant chaque déploiement. En cas d'échec, on garde le dernier
// fichier connu (celui déjà publié, sinon celui du dépôt) : le site n'est jamais cassé.
//
// Usage : node scripts/resultats.mjs [--out data/resultats.json]

import { readFile, writeFile } from 'node:fs/promises';

const CLUB = '0856001'; // AIZENAY VOLLEY-BALL
const BASE = 'https://www.ffvbbeach.org/ffvbapp/resu/';
const OUT = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : 'data/resultats.json';
const PAGES_URL = process.env.PAGES_URL || 'https://splash1307.github.io/PublicationVolley/';
const UA = 'StudioPostsGriffons/1.0 (visuels de resultats du club)';

// Saison FFVB : d'août à juillet (ex. « 2026/2027 »).
export function season(d = new Date()) {
  const y = d.getFullYear();
  return d.getMonth() >= 7 ? `${y}/${y + 1}` : `${y - 1}/${y}`;
}

async function get(url, init = {}) {
  const res = await fetch(url, { ...init, headers: { 'User-Agent': UA, ...(init.headers || {}) }, signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} pour ${url}`);
  return new TextDecoder('latin1').decode(await res.arrayBuffer()); // le site est en ISO-8859-1
}

// Équipe du studio correspondant à une équipe FFVB (mêmes noms que les équipes par défaut du studio).
export function teamFor(poule, name) {
  const n = (name.match(/AIZENAY(?:\s+VOLLEY-BALL)?\s+(\d)/i) || [])[1];
  if (/\(R2\)/.test(name) || poule === 'R2M' || poule.startsWith('CM')) return 'Régionale Masculine';
  if (poule === 'DMA' || poule.startsWith('B1')) return n ? `Départementale Masculine ${n}` : null;
  if (poule === 'DFA' || poule.startsWith('A1')) return `Départementale Féminine ${n || 1}`;
  if (poule === '8M1' || poule === '181') return 'M18 Masculine';
  if (poule === '18A' || poule === '184') return 'M18 Féminine';
  if (poule === '150') return 'M15 Féminine';
  return null;
}

export function parseExport(csv) {
  const lines = csv.split(/\r?\n/).filter(l => l.trim());
  const head = lines.shift().split(';').map(s => s.trim());
  const col = k => head.indexOf(k);
  const need = ['Entité', 'Match', 'Date', 'Heure', 'EQA_no', 'EQA_nom', 'EQB_no', 'EQB_nom', 'Set', 'Score', 'Salle'];
  for (const k of need) if (col(k) < 0) throw new Error(`Colonne « ${k} » absente de l'export FFVB (format modifié ?)`);
  const out = [];
  for (const line of lines) {
    const c = line.split(';').map(s => s.trim());
    const v = k => c[col(k)] || '';
    const aIs = v('EQA_no') === CLUB, bIs = v('EQB_no') === CLUB;
    if (!aIs && !bIs) continue;
    const set = v('Set');
    if (!/^\w\/\w$/.test(set)) continue; // pas encore joué (ou résultat pas saisi)
    let [sa, sb] = set.split('/');
    let sets = v('Score').split(',').map(s => s.split('-').map(Number)).filter(p => p.length === 2 && p.every(Number.isFinite));
    const home = aIs; // si les deux équipes sont d'Aizenay, on prend l'équipe A
    if (!home) { [sa, sb] = [sb, sa]; sets = sets.map(([x, y]) => [y, x]); }
    const code = v('Match');
    out.push({
      code, entite: v('Entité'), poule: code.slice(0, 3),
      date: v('Date'), heure: v('Heure'), domicile: home,
      aizenay: home ? v('EQA_nom') : v('EQB_nom'),
      adversaire: home ? v('EQB_nom') : v('EQA_nom'),
      adversaireClub: home ? v('EQB_no') : v('EQA_no'),
      score: [sa, sb], sets, forfait: /\D/.test(sa + sb), salle: v('Salle'),
    });
  }
  return out;
}

// Libellé de chaque compétition (« R2M - REGIONALE 2 MASCULINE PAYS DE LA LOIRE » → libellé après le code).
async function labels(matchs, saison) {
  const res = {};
  for (const key of new Set(matchs.map(m => `${m.entite}|${m.poule}`))) {
    const [ent, poule] = key.split('|');
    try {
      const html = await get(`${BASE}vbspo_calendrier.php?codent=${ent}&poule=${poule}&saison=${encodeURIComponent(saison)}`);
      const t = [...html.matchAll(/class='titreblanc'[^>]*>([^<]+)/g)].map(m => m[1].trim()).find(s => s.startsWith(poule + ' - '));
      if (t) res[key] = t.slice(poule.length + 3).trim();
    } catch (e) { console.warn('Libellé introuvable pour', key, '-', e.message); }
  }
  return res;
}

async function main() {
  const saison = season();
  let data;
  try {
    const csv = await get(`${BASE}vbspo_calendrier_export_club.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ cnclub: CLUB, cal_saison: saison, typ_edition: 'E', type: 'RES' }),
    });
    const matchs = parseExport(csv);
    const lab = await labels(matchs, saison);
    const seen = new Set();
    data = {
      maj: new Date().toISOString(), saison, source: 'FFVB - Gestion Sportive',
      matchs: matchs
        .filter(m => !seen.has(m.code) && seen.add(m.code)) // pas de doublon
        .map(m => ({ ...m, competition: lab[`${m.entite}|${m.poule}`] || m.poule, equipe: teamFor(m.poule, m.aizenay) }))
        .sort((a, b) => (b.date + b.heure).localeCompare(a.date + a.heure)),
    };
    console.log(`FFVB ${saison} : ${data.matchs.length} matchs terminés.`);
  } catch (e) {
    console.warn('::warning::Récupération FFVB impossible :', e.message);
    try { // on republie le dernier fichier en ligne, sinon on garde celui du dépôt
      const prev = await (await fetch(PAGES_URL + 'data/resultats.json', { signal: AbortSignal.timeout(20000) })).json();
      if (Array.isArray(prev.matchs)) data = prev;
    } catch {}
    if (!data) { try { await readFile(OUT); console.warn('On garde', OUT); } catch { data = { maj: null, saison, matchs: [] }; } }
  }
  if (data) await writeFile(OUT, JSON.stringify(data, null, 1) + '\n');
}

if (import.meta.url === `file://${process.argv[1]}`) main();
