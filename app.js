/* =====================================================
   RIHITO NOTES · lógica de la aplicación
   Todo el código está en este archivo, ordenado en secciones:
   1) Almacenamiento   2) Contraseña   3) Iconos   4) Pantallas
   5) Acciones (botones)   6) Arranque
   Los datos se guardan en localStorage (en el propio teléfono).
   ===================================================== */
(() => {
'use strict';

/* ---------- utilidades ---------- */
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const num = v => { const n = parseFloat(String(v).replace(',', '.')); return Number.isFinite(n) ? n : NaN; };
const fmt = n => (Math.round(n * 100) / 100).toLocaleString('es', { maximumFractionDigits: 2, useGrouping: false });
const pad = n => String(n).padStart(2, '0');
const dateStr = t => { const d = new Date(t); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`; };
const timeStr = t => { const d = new Date(t); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };

/* =====================================================
   1) ALMACENAMIENTO
   ===================================================== */
const DATA_KEY = 'rihitonotes.data.v1';
const PREV_KEY = 'rihitonotes.data.prev';
const AUTH_KEY = 'rihitonotes.auth.v1';
const FP_KEY = 'rihitonotes.fp.v1';
const FIRST_KEY = 'rihitonotes.first';
const SNOOZE_KEY = 'rihitonotes.remind';

const mem = {};
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return mem[k] ?? null; } },
  set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { mem[k] = v; return false; } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { delete mem[k]; } }
};

const ACCENTS = ['#a855f7', '#38bdf8', '#4ade80', '#fbbf24', '#f472b6'];
const FCOLORS = ['#38bdf8', '#8b5cf6', '#4ade80', '#fb923c', '#f472b6', '#facc15'];
const DEF_BG = '#160c2b', DEF_FG = '#f4ecff';
const CURS = ['CUP', 'SM', '$'];
const cleanLines = a => (Array.isArray(a) ? a : []).filter(l => l && typeof l === 'object').slice(0, 1000).map(l => ({ d: String(l.d || '').slice(0, 500), n: String(l.n || '').replace(/[^0-9.,\-]/g, '').slice(0, 30), c: CURS.includes(l.c) ? l.c : 'CUP' }));
const AC_SW = ['#a855f7', '#38bdf8', '#4ade80', '#fbbf24', '#f472b6', '#ef4444', '#f97316', '#ffffff'];
/* ----- temas de color: --hue / --sat / --lum (el CSS deriva todos los morados de ahí) ----- */
const THEMES = [
  { id: 'purple', name: 'Morado', hue: 268, sat: 1, lum: 1, sw: '#a855f7' },
  { id: 'lime', name: 'Verde limón', hue: 88, sat: 1, lum: .95, sw: '#a3e635' },
  { id: 'wine', name: 'Rojo vino 🍷', hue: 346, sat: .8, lum: .74, sw: '#9b1c34' },
  { id: 'red', name: 'Rojo', hue: 356, sat: 1, lum: .95, sw: '#ef4444' },
  { id: 'blue', name: 'Azul', hue: 218, sat: 1, lum: 1, sw: '#3b82f6' },
  { id: 'sky', name: 'Celeste', hue: 196, sat: 1, lum: .95, sw: '#38bdf8' },
  { id: 'teal', name: 'Turquesa', hue: 172, sat: .9, lum: .9, sw: '#14b8a6' },
  { id: 'green', name: 'Verde', hue: 140, sat: .85, lum: .9, sw: '#22c55e' },
  { id: 'gold', name: 'Dorado', hue: 44, sat: 1, lum: .95, sw: '#f59e0b' },
  { id: 'orange', name: 'Naranja', hue: 24, sat: 1, lum: .95, sw: '#f97316' },
  { id: 'pink', name: 'Rosa', hue: 332, sat: .95, lum: 1, sw: '#ec4899' },
  { id: 'magenta', name: 'Magenta', hue: 298, sat: 1, lum: 1, sw: '#d946ef' },
  { id: 'brown', name: 'Chocolate', hue: 22, sat: .5, lum: .8, sw: '#a0623a' },
  { id: 'silver', name: 'Plata', hue: 250, sat: .1, lum: 1, sw: '#a1a1aa' }
];
const FONTS = [
  { id: 'default', name: 'Predeterminada', css: 'system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", sans-serif' },
  { id: 'poppins', name: 'Poppins', css: '"Poppins", sans-serif', gf: 'Poppins:wght@400;700' },
  { id: 'montserrat', name: 'Montserrat', css: '"Montserrat", sans-serif', gf: 'Montserrat:wght@400;700' },
  { id: 'nunito', name: 'Nunito', css: '"Nunito", sans-serif', gf: 'Nunito:wght@400;700' },
  { id: 'quicksand', name: 'Quicksand', css: '"Quicksand", sans-serif', gf: 'Quicksand:wght@400;700' },
  { id: 'raleway', name: 'Raleway', css: '"Raleway", sans-serif', gf: 'Raleway:wght@400;700' },
  { id: 'rubik', name: 'Rubik', css: '"Rubik", sans-serif', gf: 'Rubik:wght@400;700' },
  { id: 'outfit', name: 'Outfit', css: '"Outfit", sans-serif', gf: 'Outfit:wght@400;700' },
  { id: 'lexend', name: 'Lexend', css: '"Lexend", sans-serif', gf: 'Lexend:wght@400;700' },
  { id: 'fredoka', name: 'Fredoka', css: '"Fredoka", sans-serif', gf: 'Fredoka:wght@400;700' },
  { id: 'comfortaa', name: 'Comfortaa', css: '"Comfortaa", sans-serif', gf: 'Comfortaa:wght@400;700' },
  { id: 'orbitron', name: 'Orbitron', css: '"Orbitron", sans-serif', gf: 'Orbitron:wght@400;700' },
  { id: 'chakra', name: 'Chakra Petch', css: '"Chakra Petch", sans-serif', gf: 'Chakra+Petch:wght@400;700' },
  { id: 'exo2', name: 'Exo 2', css: '"Exo 2", sans-serif', gf: 'Exo+2:wght@400;700' },
  { id: 'rajdhani', name: 'Rajdhani', css: '"Rajdhani", sans-serif', gf: 'Rajdhani:wght@400;700' },
  { id: 'righteous', name: 'Righteous', css: '"Righteous", sans-serif', gf: 'Righteous' },
  { id: 'creepster', name: 'Creepster', css: '"Creepster", cursive', gf: 'Creepster' },
  { id: 'playfair', name: 'Playfair Display', css: '"Playfair Display", serif', gf: 'Playfair+Display:wght@400;700' },
  { id: 'lora', name: 'Lora', css: '"Lora", serif', gf: 'Lora:wght@400;700' },
  { id: 'caveat', name: 'Caveat', css: '"Caveat", cursive', gf: 'Caveat:wght@400;700' },
  { id: 'dancing', name: 'Dancing Script', css: '"Dancing Script", cursive', gf: 'Dancing+Script:wght@400;700' }
];
const loadedFonts = new Set();
function loadFonts(list) {
  const need = list.filter(f => f.gf && !loadedFonts.has(f.id));
  if (!need.length) return;
  need.forEach(f => loadedFonts.add(f.id));
  const l = document.createElement('link'); l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?' + need.map(f => 'family=' + f.gf).join('&') + '&display=swap';
  document.head.appendChild(l);
}
const PALETTES = [
  { id: 'red', name: 'Rojo + Negro', c: '#ef4444' }, { id: 'blue', name: 'Azul + Negro', c: '#3b82f6' },
  { id: 'green', name: 'Verde + Negro', c: '#22c55e' }, { id: 'lime', name: 'Limón + Negro', c: '#a3e635' },
  { id: 'purple', name: 'Morado + Negro', c: '#a855f7' }, { id: 'gold', name: 'Dorado + Negro', c: '#f59e0b' },
  { id: 'pink', name: 'Rosa + Negro', c: '#ec4899' }, { id: 'sky', name: 'Celeste + Negro', c: '#38bdf8' },
  { id: 'orange', name: 'Naranja + Negro', c: '#f97316' }, { id: 'wine', name: 'Vino + Negro', c: '#9b1c34' }
];
const hsv2hsl = (h, s, v) => { const l = v * (1 - s / 2); return [h, (l === 0 || l === 1) ? 0 : (v - l) / Math.min(l, 1 - l), l]; };
const customTheme = c => { const [h, s, l] = hsv2hsl(c.h, c.s, c.v); return { id: 'custom', name: 'Color mezclado', hue: (h - 2.7 + 360) % 360, sat: Math.min(1.1, s / .91), lum: Math.min(1.3, Math.max(.6, l / .65)), sw: `hsl(${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)` }; };
const themeOf = p => (p.theme === 'custom' && p.custom) ? customTheme(p.custom) : (THEMES.find(x => x.id === p.theme) || THEMES[0]);
function applyTheme() {
  const p = S.profile || {}, th = themeOf(p), fo = FONTS.find(x => x.id === p.font) || FONTS[0];
  const st = document.documentElement.style;
  st.setProperty('--hue', th.hue); st.setProperty('--sat', th.sat); st.setProperty('--lum', th.lum);
  st.setProperty('--bsat', 0);
  loadFonts([fo]); st.setProperty('--font', fo.css);
  document.documentElement.classList.toggle('bold', !!p.bold);
  const m = document.querySelector('meta[name=theme-color]');
  if (m) m.setAttribute('content', `hsl(${th.hue} ${Math.round(p.bg === 'black' ? 0 : 10)}% ${Math.round(9 * th.lum)}%)`);
}
const cleanProfile = p => {
  const o = { name: '', photo: '', theme: 'purple', font: 'default', bold: false, bg: 'tint' };
  if (p && typeof p === 'object') {
    if (THEMES.some(x => x.id === p.theme)) o.theme = p.theme;
    if (FONTS.some(x => x.id === p.font)) o.font = p.font;
    if (p.theme === 'custom' && p.custom && [p.custom.h, p.custom.s, p.custom.v].every(n => typeof n === 'number' && isFinite(n))) {
      o.theme = 'custom'; o.custom = { h: Math.min(360, Math.max(0, p.custom.h)), s: Math.min(1, Math.max(0, p.custom.s)), v: Math.min(1, Math.max(0, p.custom.v)) };
    }
    o.bg = p.bg === 'black' ? 'black' : 'tint';
    o.bold = p.bold === true;
    o.name = String(p.name || '').replace(/\s+/g, ' ').trim().slice(0, 24);
    if (typeof p.photo === 'string' && p.photo.length <= 700000 && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+\/=]+$/.test(p.photo)) o.photo = p.photo;
  }
  return o;
};
const blankLine = l => !l.d.trim() && !l.n.trim();
const BG_SW = ['#160c2b', '#2b1259', '#0e2a4a', '#0f3a2a', '#4a2a0a', '#4a0f1f', '#111111', '#f5f0ff'];
const FG_SW = ['#f4ecff', '#ffffff', '#fde68a', '#7dd3fc', '#86efac', '#f9a8d4', '#1a1030', '#000000'];

const mkOffer = (name, buy, sell, notes = '') => ({ id: uid(), name, buy, sell, notes, created: Date.now() });

function defaultData() {
  return {
    v: 1,
    profile: { name: '', photo: '', theme: 'purple', font: 'default', bold: false, bg: 'tint' },
    folders: [{
      id: uid(), name: 'Diamantes Free Fire', emoji: '💎', color: FCOLORS[0], created: Date.now(),
      offers: [
        mkOffer('110 Diamantes', 110, 150),
        mkOffer('220 Diamantes', 220, 280),
        mkOffer('341 Diamantes', 300, 380),
        mkOffer('572 Diamantes', 500, 650)
      ]
    }],
    notes: [],
    trash: [],
    sales: [],
    meta: { lastBackup: null }
  };
}

/* Comprueba y limpia datos (también sirve para validar copias de seguridad importadas) */
function normalize(d) {
  if (!d || typeof d !== 'object' || !Array.isArray(d.folders) || !Array.isArray(d.notes)) return null;
  const out = { v: 1, profile: cleanProfile(d.profile), folders: [], notes: [], meta: { lastBackup: (d.meta && d.meta.lastBackup) || null } };
  d.folders.forEach((f, i) => {
    if (!f || typeof f !== 'object') return;
    out.folders.push({
      id: String(f.id || uid()), name: String(f.name || 'Carpeta').slice(0, 60),
      emoji: String(f.emoji || '').slice(0, 8), color: /^#[0-9a-f]{6}$/i.test(f.color) ? f.color : FCOLORS[i % FCOLORS.length],
      created: Number(f.created) || Date.now(), kind: f.kind === 'accounts' ? 'accounts' : 'offers',
      accounts: (Array.isArray(f.accounts) ? f.accounts : []).slice(0, 5000).filter(a => a && typeof a === 'object').map(a => ({
        id: String(a.id || uid()), email: String(a.email || '').slice(0, 120), pass: String(a.pass || '').slice(0, 120),
        codes: (Array.isArray(a.codes) ? a.codes : []).map(c => String(c).replace(/\D/g, '')).filter(c => c.length === 8).slice(0, 30),
        cur: CURS.includes(a.cur) ? a.cur : CURS[0], buy: Number.isFinite(+a.buy) ? +a.buy : 0, sell: Number.isFinite(+a.sell) ? +a.sell : 0,
        notes: String(a.notes || '').slice(0, 5000), created: Number(a.created) || Date.now()
      })),
      offers: (Array.isArray(f.offers) ? f.offers : []).filter(o => o && typeof o === 'object').map(o => ({
        id: String(o.id || uid()), name: String(o.name || 'Oferta').slice(0, 80),
        buy: Number.isFinite(+o.buy) ? +o.buy : 0, sell: Number.isFinite(+o.sell) ? +o.sell : 0,
        notes: String(o.notes || '').slice(0, 5000), created: Number(o.created) || Date.now()
      }))
    });
  });
  const normNote = (n, i, inTrash) => {
    if (!n || typeof n !== 'object') return null;
    return {
      id: String(n.id || uid()), title: String(n.title || '').slice(0, 120), body: String(n.body || '').slice(0, 100000),
      bg: /^#[0-9a-f]{6}$/i.test(n.bg) ? n.bg : DEF_BG, fg: /^#[0-9a-f]{6}$/i.test(n.fg) ? n.fg : DEF_FG,
      accent: /^#[0-9a-f]{6}$/i.test(n.accent) ? n.accent : ACCENTS[i % ACCENTS.length],
      created: Number(n.created) || Date.now(), updated: Number(n.updated) || Date.now(),
      ...(n.pinned ? { pinned: true } : {}),
      ...(inTrash ? { deletedAt: Number(n.deletedAt) || Date.now() } : {}),
      ...(n.type === 'calc' ? { type: 'calc', lines: cleanLines(n.lines) } : {})
    };
  };
  d.notes.forEach((n, i) => { const x = normNote(n, i, false); if (x) out.notes.push(x); });
  out.trash = (Array.isArray(d.trash) ? d.trash : []).slice(0, 500).map((n, i) => normNote(n, i, true)).filter(Boolean);
  const nn = (v, def) => (Number.isFinite(+v) ? +v : def);
  out.sales = (Array.isArray(d.sales) ? d.sales : []).slice(0, 20000).filter(x => x && typeof x === 'object').map(x => ({
    id: String(x.id || uid()), client: String(x.client || '').slice(0, 60), item: String(x.item || 'Venta').slice(0, 80),
    buy: nn(x.buy, 0), sell: nn(x.sell, 0), qty: Math.min(9999, Math.max(1, Math.round(nn(x.qty, 1)))),
    date: Number(x.date) || Date.now()
  }));
  return out;
}

function load() {
  const raw = store.get(DATA_KEY);
  if (raw) {
    try { const d = normalize(JSON.parse(raw)); if (d) return d; } catch (e) { /* sigue abajo */ }
    // datos ilegibles: se guarda una copia por si se pueden rescatar
    store.set('rihitonotes.data.corrupt', raw);
  }
  const d = defaultData();
  store.set(DATA_KEY, JSON.stringify(d));
  return d;
}

let S = load();
/* la papelera se vacía sola a los 30 días */
S.trash = S.trash.filter(n => Date.now() - n.deletedAt < 30 * 86400000);
if (!store.get(FIRST_KEY)) store.set(FIRST_KEY, String(Date.now()));

function save() {
  const ok = store.set(DATA_KEY, JSON.stringify(S));
  if (!ok) toast('⚠ No se pudo guardar. Haz una copia de seguridad ahora.', true);
  return ok;
}

/* =====================================================
   2) CONTRASEÑA
   ===================================================== */
let unlocked = false;
const toHex = b => Array.from(b).map(x => x.toString(16).padStart(2, '0')).join('');
const fromHex = h => new Uint8Array(h.match(/../g).map(x => parseInt(x, 16)));

async function hashPass(pass, saltHex) {
  if (window.crypto && crypto.subtle) {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: fromHex(saltHex), iterations: 150000, hash: 'SHA-256' }, key, 256);
    return 'p:' + toHex(new Uint8Array(bits));
  }
  // Respaldo muy básico si el navegador no tiene crypto.subtle
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57; const s = saltHex + pass;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 'w:' + (h2 >>> 0).toString(16) + (h1 >>> 0).toString(16);
}
const getAuth = () => { try { return JSON.parse(store.get(AUTH_KEY) || 'null'); } catch (e) { return null; } };
async function setPassword(pass) {
  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)));
  store.set(AUTH_KEY, JSON.stringify({ salt, hash: await hashPass(pass, salt) }));
}
async function checkPassword(pass) {
  const a = getAuth(); if (!a) return false;
  if (a.hash.startsWith('p:') && !(window.crypto && crypto.subtle)) return false;
  return (await hashPass(pass, a.salt)) === a.hash;
}

/* =====================================================
   3) ICONOS (SVG)
   ===================================================== */
const P = {
  back: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  pencil: '<path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m5 0V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  note: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
  chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  trend: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/>',
  palette: '<circle cx="13.5" cy="6.5" r=".6"/><circle cx="17.5" cy="10.5" r=".6"/><circle cx="8.5" cy="7.5" r=".6"/><circle cx="6.5" cy="12.5" r=".6"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.5-.7 1.5-1.5 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.8.7-1.5 1.5-1.5H16c3.3 0 6-2.7 6-6 0-4.9-4.5-9-10-9z"/>',
  font: '<path d="M3 19l5-14 5 14M5 14h6"/><path d="M14.5 19l3-8 3 8M15.7 16.5h3.6"/>',
  crown: '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/><path d="M5.5 19h13"/>',
  shield: '<path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M21 16l-5-5-8 8"/>',
  calc: '<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="11" x2="8.01" y2="11"/><line x1="12" y1="11" x2="12.01" y2="11"/><line x1="16" y1="11" x2="16.01" y2="11"/><line x1="8" y1="15" x2="8.01" y2="15"/><line x1="12" y1="15" x2="12.01" y2="15"/><line x1="16" y1="15" x2="16.01" y2="15"/><line x1="8" y1="18.5" x2="16" y2="18.5"/>',
  backspace: '<path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff: '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>',
  chev: '<polyline points="9 18 15 12 9 6"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22 7 12 13 2 7"/>',
  key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="M10.7 12.3 21 2"/><path d="M17 6l3 3"/><path d="M14 9l2 2"/>',
  pin: '<path d="M12 17v5"/><path d="M9 3h6l-1 6 3 3v2H7v-2l3-3z"/>',
  cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><line x1="6" y1="12" x2="6.01" y2="12"/><line x1="18" y1="12" x2="18.01" y2="12"/>',
  undo: '<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>',
  chat: '<path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l1.9-5.4A8.4 8.4 0 1 1 21 11.5z"/>',
  finger: '<path d="M12 11v4a5 5 0 0 0 1.5 3.5"/><path d="M8 11a4 4 0 0 1 8 0v2"/><path d="M5 12a7 7 0 0 1 14 0v2a9 9 0 0 1-2 5.5"/><path d="M8.5 15c0 2 .6 3.6 1.8 5"/>',
  info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'
};
const ico = (n, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n]}</svg>`;
/* campo de contraseña con botón de ojo para mostrar/ocultar */
const pwInput = (id, placeholder, auto, req) => `<div class="pw"><input class="input" id="${id}" type="password" placeholder="${placeholder}" autocomplete="${auto}"${req ? ' required' : ''}><button type="button" class="eye" data-eye aria-label="Mostrar contraseña">${ico('eye')}</button></div>`;
const dotsIco = '<svg class="ico fill" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg>';
const gem = (cls = '') => `<svg class="${cls}" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7dd3fc"/><stop offset="1" stop-color="#0284c7"/></linearGradient></defs><path d="M17 8h30l14 17L32 58 3 25z" fill="url(#gg)" stroke="#e0f2fe" stroke-width="2" stroke-linejoin="round"/><path d="M3 25h58M24 8l-7 17 15 33 15-33-7-17M17 25h30" fill="none" stroke="#e0f2fe" stroke-opacity=".85" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
const folderSvg = '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M4 14a6 6 0 0 1 6-6h16l6 8h22a6 6 0 0 1 6 6v28a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6z"/></svg>';

/* =====================================================
   4) PANTALLAS
   ===================================================== */
const app = $('#app');
let flash = null;        // mensaje "¡Todo listo!" tras guardar
let leaveHook = null;    // se ejecuta al salir de una pantalla (autoguardado)
let noteQuery = '';

const folderOf = id => S.folders.find(f => f.id === id);
const profit = o => o.sell - o.buy;
const pct = o => (o.buy > 0 ? (profit(o) / o.buy) * 100 : null);
const profitHtml = o => {
  const p = profit(o), c = pct(o);
  return `<span class="${p >= 0 ? 'pos' : 'neg'}">${fmt(p)}${c === null ? '' : ` (${c.toFixed(1)}%)`}</span>`;
};
const plural = (n, s, p) => (n === 1 ? `1 ${s}` : n === 0 ? `Sin ${p}` : `${n} ${p}`);

function hdr(title, o = {}) {
  return `<header class="hdr">
    ${o.back ? `<button class="iconbtn" data-go="${o.back}" aria-label="Volver">${ico('back')}</button>` : ''}
    <h1>${o.lead || ''}<span class="t">${title}</span></h1>
    ${o.right || ''}
  </header>`;
}

function nav(active) {
  const items = [['home', 'Inicio', 'home'], ['notes', 'Notas', 'note'], ['folders', 'Carpetas', 'folder'], ['sales', 'Ventas', 'cash'], ['profile', 'Perfil', 'user']];
  return `<nav class="nav" aria-label="Menú principal">${items.map(([r, l, i]) =>
    `<button data-go="#/${r}" class="${active === r ? 'on' : ''}" ${active === r ? 'aria-current="page"' : ''}>${ico(i)}<span>${l}</span></button>`).join('')}</nav>`;
}

/* ----- bloqueo ----- */
function viewLock() {
  const first = false; // la app sólo pide contraseña si el usuario la puso
  app.innerHTML = `<div class="lock">
    <div class="logo" role="img" aria-label="RIHITO NOTES"></div>
    <h2>${first ? 'Crea tu contraseña' : 'Bienvenido de nuevo'}</h2>
    <p class="s">${first ? 'Protegerá tus notas y ofertas cada vez que abras la app.' : 'Escribe tu contraseña para entrar.'}</p>
    <form id="lockForm" class="stack" autocomplete="off">
      ${pwInput('p1', first ? 'Nueva contraseña (mín. 4 caracteres)' : 'Contraseña', first ? 'new-password' : 'current-password', true)}
      ${first ? pwInput('p2', 'Repite la contraseña', 'new-password', true) : ''}
      <button class="btn" type="submit">${ico('lock')} ${first ? 'Crear y entrar' : 'Entrar'}</button>
    </form>
    <div class="err" id="lockErr"></div>
    ${getFp() && fpSupported() ? `<button class="btn ghost sm fpbtn" type="button" data-act="fp-login">${ico('finger')} Entrar con huella</button>` : ''}
    ${first ? '' : '<button class="link" data-act="forgot">Olvidé mi contraseña</button>'}
  </div>`;
  const form = $('#lockForm');
  let fails = 0, blockedUntil = 0;
  const err = (m) => { $('#lockErr').textContent = m; form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake'); };
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const p1 = $('#p1').value;
    if (first) {
      if (p1.length < 4) return err('Usa al menos 4 caracteres.');
      if (p1 !== $('#p2').value) return err('Las contraseñas no coinciden.');
      await setPassword(p1);
      unlocked = true; route();
    } else {
      if (Date.now() < blockedUntil) return err('Espera unos segundos e inténtalo otra vez.');
      if (await checkPassword(p1)) { unlocked = true; if (!location.hash || location.hash === '#/lock') location.hash = '#/home'; route(); }
      else { fails++; if (fails >= 5) { blockedUntil = Date.now() + 5000; fails = 0; } err('Contraseña incorrecta.'); $('#p1').value = ''; }
    }
  });
  if (getFp() && fpSupported()) setTimeout(fpLogin, 250); else setTimeout(() => { const el = $('#p1'); el && el.focus(); }, 50);
}

/* ----- inicio ----- */
function viewHome() {
  const nOffers = S.folders.reduce((a, f) => a + f.offers.length, 0);
  const ff = S.folders.find(f => /diamantes/i.test(f.name)) || S.folders[0];
  let bk = '', warn = false;
  if (S.meta.lastBackup) {
    const days = Math.floor((Date.now() - S.meta.lastBackup) / 86400000);
    bk = `Última copia de seguridad: ${dateStr(S.meta.lastBackup)}`;
    if (days >= 7) { bk += ' · conviene hacer otra'; warn = true; }
  } else { bk = 'Aún no has hecho ninguna copia de seguridad'; warn = true; }
  app.innerHTML = `<div class="screen home">
    <div class="hero" role="img" aria-label="RIHITO NOTES · Tu libreta, tus reglas">
      <button class="gear" data-go="#/profile" aria-label="Ajustes">${ico('gear')}</button>
    </div>
    <div class="tiles">
      <button class="tile" data-go="#/notes"><svg class="ico" viewBox="0 0 24 24" style="color:var(--neon)">${P.note}</svg>Mis Notas<small>${plural(S.notes.length, 'nota', 'notas')}</small></button>
      <button class="tile" data-go="#/folders"><svg class="ico" viewBox="0 0 24 24" style="color:#fbbf24;fill:#fbbf2433">${P.folder}</svg>Carpetas<small>${plural(S.folders.length, 'carpeta', 'carpetas')}</small></button>
      <button class="tile" data-go="#/calc"><svg class="ico" viewBox="0 0 24 24" style="color:#fb923c">${P.calc}</svg>Calculadora</button>
      <button class="tile" data-act="more"><svg class="ico" viewBox="0 0 24 24" style="color:var(--purple);fill:var(--purple)">${P.grid}</svg>Más</button>
    </div>
    <div class="quick">
      <button data-act="new-note">${ico('plus')}Nueva nota</button>
      <button data-act="new-folder">${ico('plus')}Nueva carpeta</button>
      <button data-go="#/profile">${ico('download')}Copias</button>
    </div>
    <div class="glowwrap"><div class="welcome">${ico('crown')}<b>Bienvenido a RIHITO NOTES 👑</b>Organiza, vende y controla todo en un solo lugar.</div></div>
    <div class="backup-note ${warn ? 'warn' : ''}">${ico('shield')}${bk}</div>
  </div>${nav('home')}`;
}

/* ----- notas ----- */
function notePreview(n) {
  if (n.type !== 'calc') return (n.body || '').replace(/\s+/g, ' ').slice(0, 60);
  const ls = n.lines || [];
  if (!ls.length) return (n.body || '').replace(/\s+/g, ' ').slice(0, 60);
  const f = ls.slice(0, 2).map(l => [l.d.trim(), l.n && (l.n + ' ' + l.c)].filter(Boolean).join(' ')).join(' · ');
  return f + (ls.length > 2 ? ` · +${ls.length - 2} líneas` : '');
}
function noteCard(n) {
  return `<div class="ncard" style="background:${n.bg};color:${n.fg};--acc:${n.accent}" data-go="#/note/${n.id}">
    <div class="nico">${ico(n.type === 'calc' ? 'calc' : 'note')}</div>
    <div class="nmid"><b>${n.pinned ? `<span class="pinb">${ico('pin')}</span>` : ''}${esc(n.title || 'Sin título')}${n.type === 'calc' ? '<span class="cbadge">CÁLCULO</span>' : ''}</b><span class="pv">${esc(notePreview(n)) || '&nbsp;'}</span><small>${dateStr(n.updated)}</small></div>
    <button class="dots" data-act="menu-note" data-id="${n.id}" aria-label="Opciones">${dotsIco}</button>
  </div>`;
}
function noteListHtml() {
  const q = noteQuery.trim().toLowerCase();
  const list = S.notes.filter(n => !q || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q) || (n.lines || []).some(l => l.d.toLowerCase().includes(q))).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.updated - a.updated);
  if (!list.length) return `<div class="empty">${S.notes.length ? 'No hay notas que coincidan.' : 'Todavía no tienes notas.<br>Toca el + de arriba.'}</div>`;
  return list.map(noteCard).join('');
}
function viewNotes() {
  app.innerHTML = `<div class="screen">
    ${hdr('Mis Notas', { back: '#/home', right: `<button class="iconbtn sq" data-act="new-note" aria-label="Nueva nota">${ico('plus')}</button>` })}
    <label class="search">${ico('search')}<input id="q" type="search" placeholder="Buscar notas..." value="${esc(noteQuery)}"></label>
    <div class="list" id="noteList">${noteListHtml()}</div>
  </div>${nav('notes')}`;
  $('#q').addEventListener('input', e => { noteQuery = e.target.value; $('#noteList').innerHTML = noteListHtml(); });
}

/* Vista de lectura: se ve la nota con sus colores y un botón Editar */
function viewNoteRead(n) {
  app.innerHTML = `<div class="screen nonav">
    ${hdr('Nota', { back: '#/notes', right: `<button class="iconbtn sq" data-act="note-menu" data-id="${n.id}" aria-label="Opciones de la nota">${ico('gear')}</button>` })}
    <article class="reader" style="background:${n.bg};color:${n.fg};border-left-color:${n.accent}">
      <h2>${esc(n.title || 'Sin título')}</h2>
      <div class="rbody">${n.body ? esc(n.body) : '<span class="rempty">(Nota vacía)</span>'}</div>
    </article>
    <div class="status">Última edición: ${dateStr(n.updated)} ${timeStr(n.updated)}</div>
    <div class="status" style="margin-top:4px">Toca ⚙ para escribir, editar los colores o borrar</div>
  </div>`;
}

function viewNote(id, mode) {
  let note = id === 'new' ? null : S.notes.find(n => n.id === id);
  if (id !== 'new' && !note) { go('#/notes', true); return; }
  if ((note && note.type === 'calc') || (!note && mode === 'calc')) { viewCalcNote(note, mode); return; }
  if (note && mode !== 'write' && mode !== 'style' && mode !== 'edit') { viewNoteRead(note); return; }
  const writeMode = !note || mode !== 'style';   // 'Escribir' (texto) o 'Editar' (colores)
  const draft = note ? { ...note } : { id: uid(), title: '', body: '', bg: DEF_BG, fg: DEF_FG, accent: ACCENTS[S.notes.length % ACCENTS.length], created: Date.now(), updated: Date.now() };
  let stored = !!note, timer = null;

  app.innerHTML = `<div class="screen nonav">
    ${hdr(note ? (writeMode ? 'Escribir' : 'Editar') : 'Nueva nota', { back: note ? '#/note/' + note.id : '#/notes' })}
    <div class="editor ${writeMode ? '' : 'ro'}" id="ed">
      <input class="t" id="nt" placeholder="Título" maxlength="120" ${writeMode ? '' : 'readonly tabindex="-1"'}>
      <textarea class="b" id="nb" placeholder="Escribe aquí tu nota..." ${writeMode ? '' : 'readonly tabindex="-1"'}></textarea>
    </div>
    ${writeMode ? '' : `<div class="colors"><h4>Color de fondo</h4><div class="sw" id="swbg"></div></div>
    <div class="colors"><h4>Color del texto</h4><div class="sw" id="swfg"></div></div>`}
    <div class="status" id="st">${writeMode ? '' : 'Aquí solo cambias colores. Para escribir usa ⚙ → Escribir.'}</div>
    <div class="row" style="margin-top:8px"><button class="btn" id="saveBtn">${ico('check')} Guardar</button></div>
  </div>`;
  const ed = $('#ed'), nt = $('#nt'), nb = $('#nb'), st = $('#st');
  nt.value = draft.title; nb.value = draft.body;

  const paint = () => {
    ed.style.background = draft.bg; ed.style.color = draft.fg;
    const sw = (key, list) => list.map(c => `<button type="button" data-c="${c}" class="${draft[key].toLowerCase() === c ? 'on' : ''}" style="background:${c}" aria-label="Color ${c}"></button>`).join('') +
      `<label class="pick" title="Otro color"><input type="color" data-key="${key}" value="${draft[key]}"></label>`;
    if ($('#swbg')) { $('#swbg').innerHTML = sw('bg', BG_SW); $('#swfg').innerHTML = sw('fg', FG_SW); }
  };
  const commit = (msg) => {
    draft.title = nt.value; draft.body = nb.value;
    if (!stored && !draft.title.trim() && !draft.body.trim()) return false;
    draft.updated = Date.now();
    if (!stored) { S.notes.unshift(draft); stored = true; history.replaceState(null, '', '#/note/' + draft.id + '/write'); }
    else { const i = S.notes.findIndex(n => n.id === draft.id); if (i >= 0) S.notes[i] = { ...draft }; }
    if (save()) st.textContent = (msg || 'Guardado automáticamente') + ' ✓ ' + timeStr(draft.updated);
    return true;
  };
  const later = () => { st.textContent = 'Escribiendo…'; clearTimeout(timer); timer = setTimeout(() => commit(), 500); };
  nt.addEventListener('input', later); nb.addEventListener('input', later);
  const scr = $('.screen');
  scr.addEventListener('click', function h(e) {
    const b = e.target.closest('#swbg button, #swfg button'); if (!b) return;
    const key = b.parentElement.id === 'swbg' ? 'bg' : 'fg'; draft[key] = b.dataset.c; paint(); commit('Color guardado');
  });
  scr.addEventListener('input', function h(e) {
    const i = e.target.closest('input[type=color]'); if (!i) return;
    draft[i.dataset.key] = i.value; ed.style.background = draft.bg; ed.style.color = draft.fg; later();
  });
  scr.addEventListener('change', function h(e) {
    const i = e.target.closest('input[type=color]'); if (!i) return; paint(); commit('Color guardado');
  });
  $('#saveBtn').addEventListener('click', () => {
    if (writeMode && !nt.value.trim() && !nb.value.trim()) { toast('Escribe un título o contenido primero', true); return; }
    commit('Nota guardada'); toast('Nota guardada ✓'); go('#/note/' + draft.id, true);
  });
  leaveHook = () => { clearTimeout(timer); commit(); };
  paint();
}

/* ----- NOTA DE CÁLCULO ----- */
async function newNoteChoice() {
  const k = await menuSheet('Crear nota', [['text', 'Nota normal', 'note'], ['calc', 'Nota de cálculo', 'calc']]);
  if (k === 'text') go('#/note/new'); else if (k === 'calc') go('#/note/new/calc');
}
function viewCalcNote(note, mode) {
  const isNew = !note;
  const view = note && mode !== 'write' && mode !== 'style' && mode !== 'edit';
  const writeMode = isNew || mode === 'write';
  const draft = note
    ? { ...note, lines: (note.lines || []).map(l => ({ ...l })) }
    : { id: uid(), type: 'calc', title: '', body: '', lines: [], bg: DEF_BG, fg: DEF_FG, accent: '#a855f7', created: Date.now(), updated: Date.now() };
  const nb = () => draft.lines.filter(l => !blankLine(l)).length;

  if (view) {
    const rows = draft.lines.length ? draft.lines.map(l => `<div class="cl rd"><div class="f cd">${esc(l.d) || '&nbsp;'}</div><div class="f cn">${esc(l.n) || '&nbsp;'}</div><div class="f cc">${esc(l.c)}</div></div>`).join('') : '<div class="rempty">(Sin líneas)</div>';
    app.innerHTML = `<div class="screen nonav">
      ${hdr('Nota de cálculo', { back: '#/notes', right: `<button class="iconbtn sq" data-act="note-menu" data-id="${note.id}" aria-label="Opciones de la nota">${ico('gear')}</button>` })}
      <article class="reader cnote" style="background:${draft.bg};color:${draft.fg};border-left-color:${draft.accent};--acc:${draft.accent}">
        <h2>${esc(draft.title || 'Sin título')}</h2>
        ${draft.body ? `<div class="rbody" style="min-height:0;margin-bottom:12px">${esc(draft.body)}</div>` : ''}
        <div class="csec"><span>LÍNEAS DE CÁLCULO</span><span>${plural(nb(), 'línea', 'líneas')}</span></div>
        <div class="clist">${rows}</div>
      </article>
      <div class="status">Última edición: ${dateStr(note.updated)} ${timeStr(note.updated)}</div>
      <div class="status" style="margin-top:4px">Toca ⚙ para escribir, editar los colores o borrar</div>
    </div>`;
    return;
  }

  let stored = !!note, timer = null, rm = false;
  app.innerHTML = `<div class="screen nonav">
    ${hdr(note ? (writeMode ? 'Escribir' : 'Editar') : 'Nota de cálculo', { back: note ? '#/note/' + note.id : '#/notes' })}
    <div class="editor cnote ${writeMode ? '' : 'ro'}" id="ed" style="--acc:${draft.accent}">
      <input class="t" id="nt" placeholder="Título" maxlength="120" ${writeMode ? '' : 'readonly tabindex="-1"'}>
      <textarea class="b" id="nb" rows="2" placeholder="Descripción general de la nota..." ${writeMode ? '' : 'readonly tabindex="-1"'}></textarea>
      <div class="csec"><span>LÍNEAS DE CÁLCULO</span><span><span id="cnt"></span>${writeMode ? ' · <button type="button" class="rmbtn" id="rmBtn">Quitar</button>' : ''}</span></div>
      <div class="clist" id="rows"></div>
      ${writeMode ? `<button type="button" class="cadd" id="addLine">+ Agregar línea</button>` : ''}
    </div>
    ${writeMode ? '' : `<div class="colors"><h4>Color de fondo</h4><div class="sw" id="swbg"></div></div>
    <div class="colors"><h4>Color del texto</h4><div class="sw" id="swfg"></div></div>
    <div class="colors"><h4>Color de las líneas</h4><div class="sw" id="swac"></div></div>`}
    <div class="status" id="st">${writeMode ? '' : 'Aquí solo cambias colores. Para escribir usa ⚙ → Escribir.'}</div>
    <div class="row" style="margin-top:8px"><button class="btn" id="saveBtn">${ico('check')} Guardar</button></div>
  </div>`;
  const ed = $('#ed'), nt = $('#nt'), nbx = $('#nb'), st = $('#st'), rows = $('#rows');
  nt.value = draft.title; nbx.value = draft.body;
  if (!draft.lines.length) draft.lines.push({ d: '', n: '', c: 'CUP' });

  const grow = el => { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; };
  const rowHtml = (l, i) => `<div class="cl" data-i="${i}">
    <textarea class="f cd" rows="1" maxlength="500" placeholder="Descripción" ${writeMode ? '' : 'readonly tabindex="-1"'}>${esc(l.d)}</textarea>
    <textarea class="f cn" rows="1" inputmode="decimal" maxlength="30" placeholder="0" ${writeMode ? '' : 'readonly tabindex="-1"'}>${esc(l.n)}</textarea>
    <label class="f cc"><select ${writeMode ? '' : 'disabled'} aria-label="Moneda">${CURS.map(c => `<option${c === l.c ? ' selected' : ''}>${c}</option>`).join('')}</select></label>
    <button type="button" class="cx" aria-label="Quitar línea">✕</button></div>`;
  const renderRows = focus => {
    rows.className = 'clist' + (rm ? ' rm' : '');
    rows.innerHTML = draft.lines.map(rowHtml).join('');
    rows.querySelectorAll('textarea').forEach(grow);
    if (focus != null) { const e = rows.querySelector(`.cl[data-i="${focus}"] .cd`); e && e.focus(); }
    $('#cnt').textContent = plural(nb(), 'línea', 'líneas');
  };
  const paint = () => {
    ed.style.background = draft.bg; ed.style.color = draft.fg; ed.style.setProperty('--acc', draft.accent);
    const sw = (key, list) => list.map(c => `<button type="button" data-c="${c}" class="${draft[key].toLowerCase() === c ? 'on' : ''}" style="background:${c}" aria-label="Color ${c}"></button>`).join('') +
      `<label class="pick" title="Otro color"><input type="color" data-key="${key}" value="${draft[key]}"></label>`;
    if ($('#swbg')) { $('#swbg').innerHTML = sw('bg', BG_SW); $('#swfg').innerHTML = sw('fg', FG_SW); $('#swac').innerHTML = sw('accent', AC_SW); }
  };
  const commit = msg => {
    draft.title = nt.value; draft.body = nbx.value;
    const keep = draft.lines.filter(l => !blankLine(l)).map(l => ({ ...l }));
    if (!stored && !draft.title.trim() && !draft.body.trim() && !keep.length) return false;
    draft.updated = Date.now();
    const out = { ...draft, lines: keep };
    if (!stored) { S.notes.unshift(out); stored = true; history.replaceState(null, '', '#/note/' + draft.id + '/write'); }
    else { const i = S.notes.findIndex(n => n.id === draft.id); if (i >= 0) S.notes[i] = out; }
    if (save()) st.textContent = (msg || 'Guardado automáticamente') + ' ✓ ' + timeStr(draft.updated);
    return true;
  };
  const later = () => { st.textContent = 'Escribiendo…'; clearTimeout(timer); timer = setTimeout(() => commit(), 500); };
  const idx = el => +el.closest('.cl').dataset.i;
  renderRows();
  paint();
  nt.addEventListener('input', later);
  nbx.addEventListener('input', () => { grow(nbx); later(); });
  grow(nbx);

  rows.addEventListener('input', e => {
    const el = e.target; if (!el.matches('textarea')) return;
    const i = idx(el), l = draft.lines[i];
    if (el.classList.contains('cn')) {
      const v = el.value.replace(/[^0-9.,\-]/g, ''); if (v !== el.value) el.value = v; l.n = v;
    } else { const v = el.value.replace(/\n/g, ' '); if (v !== el.value) el.value = v; l.d = v; }
    grow(el); $('#cnt').textContent = plural(nb(), 'línea', 'líneas'); later();
  });
  rows.addEventListener('change', e => {
    if (e.target.matches('select')) { draft.lines[idx(e.target)].c = e.target.value; later(); }
  });
  rows.addEventListener('keydown', e => {
    if (e.key !== 'Enter' || !e.target.matches('textarea')) return;
    e.preventDefault();
    const row = e.target.closest('.cl');
    if (e.target.classList.contains('cd')) row.querySelector('.cn').focus();
    else { const nx = row.nextElementSibling; if (nx) nx.querySelector('.cd').focus(); else if (writeMode) { draft.lines.push({ d: '', n: '', c: draft.lines[draft.lines.length - 1].c }); renderRows(draft.lines.length - 1); } }
  });
  rows.addEventListener('click', e => {
    const x = e.target.closest('.cx'); if (!x) return;
    const i = idx(x); draft.lines.splice(i, 1);
    if (!draft.lines.length) draft.lines.push({ d: '', n: '', c: 'CUP' });
    renderRows(); commit('Línea quitada');
  });
  const add = $('#addLine');
  if (add) add.addEventListener('click', () => {
    draft.lines.push({ d: '', n: '', c: draft.lines[draft.lines.length - 1].c });
    renderRows(draft.lines.length - 1);
    const last = rows.lastElementChild; last && last.scrollIntoView({ block: 'center', behavior: 'smooth' });
  });
  const rmBtn = $('#rmBtn');
  if (rmBtn) rmBtn.addEventListener('click', () => { rm = !rm; rmBtn.textContent = rm ? 'Listo' : 'Quitar'; rows.classList.toggle('rm', rm); });

  const scr = $('.screen');
  scr.addEventListener('click', e => {
    const b = e.target.closest('#swbg button, #swfg button, #swac button'); if (!b) return;
    const key = { swbg: 'bg', swfg: 'fg', swac: 'accent' }[b.parentElement.id]; draft[key] = b.dataset.c; paint(); commit('Color guardado');
  });
  scr.addEventListener('input', e => {
    const i = e.target.closest('input[type=color]'); if (!i) return;
    draft[i.dataset.key] = i.value; ed.style.background = draft.bg; ed.style.color = draft.fg; ed.style.setProperty('--acc', draft.accent); later();
  });
  scr.addEventListener('change', e => { const i = e.target.closest('input[type=color]'); if (!i) return; paint(); commit('Color guardado'); });
  $('#saveBtn').addEventListener('click', () => {
    if (writeMode && !nt.value.trim() && !nbx.value.trim() && !draft.lines.some(l => !blankLine(l))) { toast('Escribe un título o alguna línea primero', true); return; }
    commit('Nota guardada'); toast('Nota guardada ✓'); go('#/note/' + draft.id, true);
  });
  leaveHook = () => { clearTimeout(timer); commit(); };
}

/* ----- menú de la nota (⚙): Escribir / Editar / Borrar ----- */
async function deleteNoteWithPassword(id) {
  const n = S.notes.find(x => x.id === id); if (!n) return false;
  const ok = !getAuth() ? await confirmBox('Borrar nota', `¿Mover “${n.title || 'Sin título'}” a la papelera? La podrás recuperar durante 30 días.`, 'Borrar') : await dialog(`<h3>Borrar nota</h3>
    <p>Para borrar “${esc(n.title || 'Sin título')}” escribe tu contraseña. Irá a la papelera 30 días.</p>
    ${pwInput('dp', 'Contraseña', 'current-password')}
    <div class="row" style="margin-top:14px"><button class="btn ghost sm" data-close="cancel">Cancelar</button><button class="btn danger sm" id="dok">${ico('trash')} Borrar</button></div>`,
  (ov, close) => {
    const tryIt = async () => {
      if (await checkPassword($('#dp', ov).value)) close(true);
      else { toast('Contraseña incorrecta', true); $('#dp', ov).value = ''; $('#dp', ov).focus(); }
    };
    $('#dok', ov).addEventListener('click', tryIt);
    $('#dp', ov).addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); tryIt(); } });
    setTimeout(() => $('#dp', ov).focus(), 60);
  });
  if (!ok) return false;
  S.notes = S.notes.filter(x => x.id !== id); S.trash.unshift({ ...n, deletedAt: Date.now() }); save(); toast('Nota movida a la papelera');
  return true;
}
async function noteMenu(id, fromList) {
  const n = S.notes.find(x => x.id === id); if (!n) return;
  const k = await menuSheet(n.title || 'Nota', [['write', 'Escribir', 'pencil'], ['style', 'Editar', 'palette'], ['pin', n.pinned ? 'Quitar de arriba' : 'Fijar arriba', 'pin'], ['wa', 'Compartir por WhatsApp', 'chat'], ['del', 'Borrar', 'trash', true]]);
  if (k === 'write') go('#/note/' + id + '/write');
  else if (k === 'style') go('#/note/' + id + '/style');
  else if (k === 'pin') { if (n.pinned) delete n.pinned; else n.pinned = true; save(); toast(n.pinned ? 'Nota fijada arriba 📌' : 'Nota desfijada'); route(); }
  else if (k === 'wa') shareWhatsApp(noteText(n));
  else if (k === 'del' && await deleteNoteWithPassword(id)) { if (fromList) route(); else go('#/notes', true); }
}

/* ----- carpetas ----- */
function viewFolders() {
  app.innerHTML = `<div class="screen">
    ${hdr('Carpetas', { back: '#/home', right: `<button class="iconbtn sq" data-act="new-folder" aria-label="Nueva carpeta">${ico('plus')}</button>` })}
    <div class="list">
      ${S.folders.map(f => `<div class="fcard" style="--c:${f.color}" data-go="#/folder/${f.id}">
        <div class="fico">${folderSvg}</div>
        <div class="fmid"><b>${esc(f.name)}</b><small>${f.kind === 'accounts' ? plural(f.accounts.length, 'cuenta', 'cuentas') : plural(f.offers.length, 'oferta', 'ofertas')}</small></div>
        ${f.emoji ? `<span class="emo">${esc(f.emoji)}</span>` : ''}
        <button class="dots" data-act="menu-folder" data-id="${f.id}" aria-label="Opciones">${dotsIco}</button>
      </div>`).join('') || '<div class="empty">No tienes carpetas.</div>'}
      <button class="btn dashed" data-act="new-folder">${ico('plus')} Añadir Carpeta</button>
    </div>
  </div>${nav('folders')}`;
}

function viewFolder(fid) {
  const f = folderOf(fid); if (!f) { go('#/folders', true); return; }
  if (f.kind === 'accounts') { viewAccounts(f); return; }
  app.innerHTML = `<div class="screen">
    ${hdr(`${f.emoji ? esc(f.emoji) + ' ' : ''}${esc(f.name)}`, { back: '#/folders', right: `<span style="font-size:26px;opacity:.8">👑</span><button class="iconbtn" data-act="menu-folder" data-id="${f.id}" aria-label="Opciones">${dotsIco}</button>` })}
    <div class="list" id="offers">
      ${f.offers.map(o => `<div class="offer" data-go="#/offer/${f.id}/${o.id}">
        ${gem('gem')}
        <div class="name">${esc(o.name)}</div>
        <div class="col">Compra<b>${fmt(o.buy)}</b></div>
        <div class="col">Venta<b>${fmt(o.sell)}</b></div>
        <div class="vsep"></div>
        <button class="act ed" data-act="edit-offer" data-f="${f.id}" data-id="${o.id}" aria-label="Editar">${ico('pencil')}</button>
        <button class="act del" data-act="del-offer" data-f="${f.id}" data-id="${o.id}" aria-label="Eliminar">${ico('trash')}</button>
      </div>`).join('')}
      <button class="btn dashed" data-act="add-offer" data-f="${f.id}">${ico('plus')} Añadir Oferta</button>
    </div>
  </div>${nav('folders')}`;
}

/* ----- carpeta de CUENTAS FF ----- */
const accProfit = a => a.sell - a.buy;
const money = (n, c) => `${fmt(n)} ${c}`;
const sumCur = (list, fn) => { const t = {}; list.forEach(a => { t[a.cur] = (t[a.cur] || 0) + fn(a); }); return Object.keys(t).map(c => money(t[c], c)).join(' · ') || '—'; };
const accOf = (fid, aid) => { const f = folderOf(fid); return f && f.accounts ? f.accounts.find(x => x.id === aid) : null; };
function viewAccounts(f) {
  app.innerHTML = `<div class="screen">
    ${hdr(`${f.emoji ? esc(f.emoji) + ' ' : ''}${esc(f.name)}`, { back: '#/folders', right: `<button class="iconbtn" data-act="menu-folder" data-id="${f.id}" aria-label="Opciones">${dotsIco}</button>` })}
    <div class="stats-box accsum">
      <div class="r"><span class="lbl">Cuentas guardadas</span><span class="val">${f.accounts.length}</span></div>
      <div class="r"><span class="lbl">Invertido</span><span class="val">${sumCur(f.accounts, a => a.buy)}</span></div>
      <div class="r"><span class="lbl">Ganancia total</span><span class="val ${f.accounts.reduce((t, a) => t + accProfit(a), 0) >= 0 ? 'pos' : 'neg'}">${sumCur(f.accounts, accProfit)}</span></div>
    </div>
    <div class="list">
      ${f.accounts.map(a => `<div class="acard" data-go="#/account/${f.id}/${a.id}">
        <div class="aico">${ico('mail')}</div>
        <div class="amid"><b>${esc(a.email || 'Sin correo')}</b><span>Compra ${money(a.buy, a.cur)} · Venta ${money(a.sell, a.cur)}</span><small>${a.codes.length ? a.codes.length + ' código' + (a.codes.length === 1 ? '' : 's') : 'Sin códigos'}</small></div>
        <div class="sp ${accProfit(a) >= 0 ? 'pos' : 'neg'}">${accProfit(a) >= 0 ? '+' : ''}${money(accProfit(a), a.cur)}</div>
      </div>`).join('')}
      <button class="btn dashed" data-act="add-account" data-f="${f.id}">${ico('plus')} Añadir Cuenta</button>
    </div>
  </div>${nav('folders')}`;
}
function viewAccount(fid, aid) {
  const f = folderOf(fid), a = accOf(fid, aid);
  if (!a) { go(f ? '#/folder/' + fid : '#/folders', true); return; }
  const show = flash; flash = null;
  const row = (lbl, val, btns = '') => `<div class="crow"><div class="cx"><small>${lbl}</small><span>${val}</span></div>${btns}</div>`;
  const cbtn = (w, ic = 'copy', lbl = 'Copiar') => `<button class="cbtn" data-act="acc-copy" data-f="${fid}" data-id="${aid}" data-w="${w}" aria-label="${lbl}">${ico(ic)}</button>`;
  app.innerHTML = `<div class="screen">
    ${hdr('Cuenta FF', { back: '#/folder/' + fid })}
    <div class="panel accbox">
      ${row('Correo electrónico', esc(a.email || '—'), a.email ? cbtn('email') : '')}
      ${row('Contraseña', `<span id="pwv" data-shown="0">${a.pass ? '••••••••' : '—'}</span>`, a.pass ? `<button class="cbtn" data-act="acc-eye" data-f="${fid}" data-id="${aid}" aria-label="Mostrar contraseña">${ico('eye')}</button>${cbtn('pass')}` : '')}
      <div class="crow col"><div class="cx"><small>Códigos de 8 dígitos${a.codes.length ? ' (toca uno para copiarlo)' : ''}</small></div>
        ${a.codes.length ? `<div class="cchips">${a.codes.map((c, i) => `<button class="cchip" data-act="acc-copy" data-f="${fid}" data-id="${aid}" data-w="c${i}">${c}</button>`).join('')}</div>
        <button class="btn ghost sm" data-act="acc-copy" data-f="${fid}" data-id="${aid}" data-w="codes" style="margin-top:10px">${ico('copy')} Copiar todos</button>` : '<span class="cx" style="opacity:.6">Sin códigos</span>'}
      </div>
    </div>
    <div class="stats-box">
      <div class="r"><span class="lead">🪙</span><span class="lbl">Precio de compra:</span><span class="val">${money(a.buy, a.cur)}</span></div>
      <div class="r"><span class="lead">💰</span><span class="lbl">Precio de venta:</span><span class="val">${money(a.sell, a.cur)}</span></div>
      <div class="r"><span class="lead" style="color:#22c55e">${ico('trend')}</span><span class="lbl">Ganancia:</span><span class="val ${accProfit(a) >= 0 ? 'pos' : 'neg'}">${accProfit(a) >= 0 ? '+' : ''}${money(accProfit(a), a.cur)}</span></div>
    </div>
    ${a.notes ? `<div class="notes-box"><h4>Notas</h4>${esc(a.notes)}</div>` : ''}
    <div class="row" style="margin-top:14px">
      <button class="btn" data-act="edit-account" data-f="${fid}" data-id="${aid}">${ico('pencil')} Editar</button>
      <button class="btn danger" data-act="del-account" data-f="${fid}" data-id="${aid}">${ico('trash')} Eliminar</button>
    </div>
    ${show ? `<div class="ok-banner"><span class="crown">👑</span><div><b>¡Todo listo!</b><span>Cuenta guardada correctamente.</span></div><span class="tick">${ico('check')}</span></div>` : ''}
  </div>${nav('folders')}`;
}
function viewAccountForm(fid, aid) {
  const f = folderOf(fid); if (!f || f.kind !== 'accounts') { go('#/folders', true); return; }
  const a = aid === 'new' ? null : accOf(fid, aid);
  if (aid !== 'new' && !a) { go('#/folder/' + fid, true); return; }
  let cur = a ? a.cur : CURS[0];
  const back = a ? `#/account/${fid}/${aid}` : '#/folder/' + fid;
  app.innerHTML = `<div class="screen nonav">
    ${hdr(a ? 'Editar Cuenta' : 'Añadir Cuenta', { back, lead: ico('mail') })}
    <form class="panel" id="af" autocomplete="off" novalidate>
      <div class="field"><label for="ae">Correo electrónico</label><input class="input" id="ae" type="text" inputmode="email" autocapitalize="off" maxlength="120" placeholder="correo@gmail.com" value="${esc(a ? a.email : '')}"></div>
      <div class="field"><label for="ap">Contraseña</label>${pwInput('ap', 'Contraseña de la cuenta', 'off')}</div>
      <div class="field"><label for="ac">Códigos de 8 dígitos</label><textarea class="input" id="ac" inputmode="numeric" placeholder="Uno por línea o separados por espacio&#10;12345678&#10;87654321">${esc(a ? a.codes.join('\n') : '')}</textarea><div class="status" id="acn" style="text-align:left"></div></div>
      <div class="field"><label>Moneda</label><div class="seg" id="acur">${CURS.map(c => `<button type="button" data-c="${c}" class="${c === cur ? 'on' : ''}">${c}</button>`).join('')}</div></div>
      <div class="grid3 sform"><div class="field"><label for="ab">Compra</label><input class="input" id="ab" inputmode="decimal" placeholder="0" value="${a ? fmt(a.buy) : ''}"></div>
      <div class="field"><label for="as">Venta</label><input class="input" id="as" inputmode="decimal" placeholder="0" value="${a ? fmt(a.sell) : ''}"></div>
      <div class="field"><label>Ganó</label><div class="gwin" id="ag">—</div></div></div>
      <div class="field"><label for="an">Notas (opcional)</label><textarea class="input" id="an" maxlength="2000" placeholder="Cliente, nivel, detalles…">${esc(a ? a.notes : '')}</textarea></div>
      <div class="stack" style="margin-top:16px">
        <button class="btn" type="submit">${ico('check')} Guardar Cuenta</button>
        <button class="btn ghost" type="button" data-go="${back}">${ico('x')} Cancelar</button>
      </div>
    </form>
  </div>`;
  const g = id => $('#' + id);
  g('ap').value = a ? a.pass : '';
  const parseCodes = () => (g('ac').value.match(/[^\s,;]+/g) || []);
  const upd = () => {
    const B = num(g('ab').value), Sv = num(g('as').value);
    g('ag').innerHTML = (Number.isNaN(B) || Number.isNaN(Sv)) ? '—' : `<span class="${Sv - B >= 0 ? 'pos' : 'neg'}">${Sv - B >= 0 ? '+' : ''}${money(Sv - B, cur)}</span>`;
    const cs = parseCodes(), bad = cs.filter(c => !/^\d{8}$/.test(c)).length;
    g('acn').textContent = cs.length ? `${cs.length - bad} código(s) válido(s)${bad ? ` · ${bad} sin 8 dígitos` : ''}` : '';
  };
  ['ab', 'as', 'ac'].forEach(i => g(i).addEventListener('input', upd));
  g('acur').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; cur = b.dataset.c; g('acur').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); upd(); });
  upd();
  g('af').addEventListener('submit', e => {
    e.preventDefault();
    const email = g('ae').value.trim(), B = num(g('ab').value), Sv = num(g('as').value), cs = parseCodes();
    if (!email) { toast('Escribe el correo de la cuenta', true); g('ae').focus(); return; }
    if (cs.some(c => !/^\d{8}$/.test(c))) { toast('Cada código debe tener exactamente 8 números', true); g('ac').focus(); return; }
    if (Number.isNaN(B) || B < 0) { toast('Precio de compra no válido', true); g('ab').focus(); return; }
    if (Number.isNaN(Sv) || Sv < 0) { toast('Precio de venta no válido', true); g('as').focus(); return; }
    const data = { email, pass: g('ap').value, codes: cs.slice(0, 30), cur, buy: B, sell: Sv, notes: g('an').value.trim() };
    let id;
    if (a) { Object.assign(a, data); id = a.id; } else { id = uid(); f.accounts.push({ id, ...data, created: Date.now() }); }
    if (save()) { flash = true; go(`#/account/${fid}/${id}`, true); }
  });
  setTimeout(() => g('ae').focus(), 60);
}
function copyText(t) {
  const done = () => toast('Copiado ✓');
  if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(t).then(done, () => toast('No se pudo copiar', true)); return; }
  const ta = document.createElement('textarea'); ta.value = t; ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); done(); } catch (e) { toast('No se pudo copiar', true); } ta.remove();
}

/* ----- oferta: ficha ----- */
function viewOffer(fid, oid) {
  const f = folderOf(fid), o = f && f.offers.find(x => x.id === oid);
  if (!o) { go(f ? '#/folder/' + fid : '#/folders', true); return; }
  const show = flash; flash = null;
  app.innerHTML = `<div class="screen">
    ${hdr('Ficha del Producto', { back: '#/folder/' + fid })}
    <div class="pcard">${gem('gem')}<div style="min-width:0"><h2>${esc(o.name)}</h2><span>${esc(f.name)}</span></div></div>
    <div class="stats-box">
      <div class="r"><span class="lead">🪙</span><span class="lbl">Precio de compra:</span><span class="val">${fmt(o.buy)}</span></div>
      <div class="r"><span class="lead">${gem('')}</span><span class="lbl">Precio de venta:</span><span class="val">${fmt(o.sell)}</span></div>
      <div class="r"><span class="lead" style="color:#22c55e">${ico('trend')}</span><span class="lbl">Ganancia:</span><span class="val">${profitHtml(o)}</span></div>
    </div>
    ${o.notes ? `<div class="notes-box"><h4>Notas</h4>${esc(o.notes)}</div>` : ''}
    <div class="row" style="margin-top:14px">
      <button class="btn" data-act="edit-offer" data-f="${fid}" data-id="${oid}">${ico('pencil')} Editar</button>
      <button class="btn danger" data-act="del-offer-detail" data-f="${fid}" data-id="${oid}">${ico('trash')} Eliminar</button>
    </div>
    ${show ? `<div class="ok-banner"><span class="crown">👑</span><div><b>¡Todo listo!</b><span>Producto guardado correctamente.</span></div><span class="tick">${ico('check')}</span></div>` : ''}
  </div>${nav('folders')}`;
}

/* ----- oferta: formulario ----- */
function viewOfferForm(fid, oid) {
  const f = folderOf(fid); if (!f) { go('#/folders', true); return; }
  const o = oid === 'new' ? null : f.offers.find(x => x.id === oid);
  if (oid !== 'new' && !o) { go('#/folder/' + fid, true); return; }
  app.innerHTML = `<div class="screen nonav">
    ${hdr(o ? 'Editar Oferta' : 'Añadir Oferta', { back: o ? `#/offer/${fid}/${oid}` : '#/folder/' + fid, lead: gem('gem') })}
    <form class="panel" id="of" autocomplete="off" novalidate>
      <div class="field"><label for="on">Nombre de la oferta</label><input class="input" id="on" maxlength="80" placeholder="Ej: 120, 220, 500…" value="${esc(o ? o.name : '')}"></div>
      <div class="field"><label for="ob">Precio de compra</label><div class="inwrap"><span class="lead">🪙</span><input class="input" id="ob" inputmode="decimal" placeholder="Ej: 200" value="${o ? fmt(o.buy) : ''}"></div></div>
      <div class="field"><label for="os">Precio de venta</label><div class="inwrap"><span class="lead">${gem('')}</span><input class="input" id="os" inputmode="decimal" placeholder="Ej: 280" value="${o ? fmt(o.sell) : ''}"></div></div>
      <div class="field"><label for="ot">Notas o detalles (opcional)</label><textarea class="input" id="ot" maxlength="2000" placeholder="Proveedor, condiciones, recordatorios…">${esc(o ? o.notes : '')}</textarea></div>
      <div class="preview"><span>Ganancia</span><span id="gp">—</span></div>
      <div class="stack" style="margin-top:16px">
        <button class="btn" type="submit">${ico('check')} Guardar Oferta</button>
        <button class="btn ghost" type="button" data-go="${o ? `#/offer/${fid}/${oid}` : '#/folder/' + fid}">${ico('x')} Cancelar</button>
      </div>
    </form>
  </div>`;
  const nm = $('#on'), b = $('#ob'), s = $('#os'), t = $('#ot'), gp = $('#gp');
  const upd = () => {
    const B = num(b.value), Sv = num(s.value);
    if (Number.isNaN(B) || Number.isNaN(Sv)) { gp.textContent = '—'; return; }
    const p = Sv - B, c = B > 0 ? ` (${((p / B) * 100).toFixed(1)}%)` : '';
    gp.innerHTML = `<span class="${p >= 0 ? 'pos' : 'neg'}">${fmt(p)}${c}</span>`;
  };
  b.addEventListener('input', upd); s.addEventListener('input', upd); upd();
  $('#of').addEventListener('submit', e => {
    e.preventDefault();
    const name = nm.value.trim(), B = num(b.value), Sv = num(s.value);
    if (!name) { toast('Escribe el nombre de la oferta', true); nm.focus(); return; }
    if (Number.isNaN(B) || B < 0) { toast('Precio de compra no válido', true); b.focus(); return; }
    if (Number.isNaN(Sv) || Sv < 0) { toast('Precio de venta no válido', true); s.focus(); return; }
    let id;
    if (o) { o.name = name; o.buy = B; o.sell = Sv; o.notes = t.value.trim(); id = o.id; }
    else { const n = mkOffer(name, B, Sv, t.value.trim()); f.offers.push(n); id = n.id; }
    if (save()) { flash = true; go(`#/offer/${fid}/${id}`, true); }
  });
  setTimeout(() => nm.focus(), 60);
}

/* ----- calculadora ----- */
/* Funciona como la del teléfono: se ve toda la operación en una línea,
   debajo el resultado en vivo, y al pulsar = queda sólo el resultado.
   Respeta el orden de operaciones (× y ÷ antes que + y −). */
function viewCalc() {
  const st = { exp: '', done: false, err: false };
  const OPS = '+-*/';
  const SYM = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  const keys = [['C', 'k-clear'], ['⌫', 'k-back'], ['%', 'k-pct'], ['/', 'op'],
    ['7'], ['8'], ['9'], ['*', 'op'], ['4'], ['5'], ['6'], ['-', 'op'], ['1'], ['2'], ['3'], ['+', 'op'],
    ['0', 'zero'], ['.'], ['=', 'op eq']];
  const label = k => k === '/' ? '÷' : k === '*' ? '×' : k === '-' ? '−' : k === '⌫' ? ico('backspace') : k;
  const aria = k => ({ '⌫': 'Borrar', C: 'Limpiar', '/': 'Dividir', '*': 'Multiplicar', '-': 'Restar', '+': 'Sumar', '=': 'Igual', '%': 'Porcentaje', '.': 'Punto decimal' }[k] || k);
  app.innerHTML = `<div class="screen nonav calc">
    <div class="calc-top" role="img" aria-label="Calculadora">
      <div class="ct-a"><button class="calc-back" data-go="#/home" aria-label="Volver">${ico('back')}</button></div>
      <div class="ct-b"><div class="calc-disp" aria-live="polite">
        <div class="calc-main" id="cm"><span id="cv">0</span></div>
        <div class="calc-prev" id="cp">&nbsp;</div>
      </div></div>
      <div class="ct-c"></div>
    </div>
    <div class="calc-pad" id="cpad">${keys.map(([k, c]) => `<button type="button" class="ck ${c || ''}" data-k="${k}" aria-label="${aria(k)}">${label(k)}</button>`).join('')}</div>
    <div class="calc-foot"></div>
  </div>`;
  const cv = $('#cv'), cm = $('#cm'), cp = $('#cp'), top = $('.calc-top');

  /* ---- formato ---- */
  const group = i => i.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const fmtNum = m => { const [i, d] = m.split('.'); return group(i) + (d !== undefined ? '.' + d : ''); };
  const fmtRaw = raw => /e/.test(raw) ? raw : raw.replace(/\d+(\.\d*)?/g, fmtNum);
  const fmtResult = n => {
    if (!Number.isFinite(n)) return null;
    let t = parseFloat(n.toPrecision(12)).toString();
    if (t === '-0') t = '0';
    if (t.length > 14) t = n.toExponential(6).replace(/\.?0+e/, 'e');
    return t;
  };
  const htmlExp = raw => /e/.test(raw) ? raw : fmtRaw(raw).replace(/[+\-*/]/g, o => `<span class="o">${SYM[o]}</span>`);

  /* ---- cálculo ---- */
  const evalPlain = arr => {
    const out = [arr[0]];
    for (let k = 1; k < arr.length; k += 2) {
      const o = arr[k], r = arr[k + 1];
      if (o === '*') out[out.length - 1] *= r;
      else if (o === '/') { if (r === 0) return NaN; out[out.length - 1] /= r; }
      else out.push(o, r);
    }
    let res = out[0];
    for (let k = 1; k < out.length; k += 2) res = out[k] === '+' ? res + out[k + 1] : res - out[k + 1];
    return res;
  };
  const evaluate = raw => {
    let s = raw;
    while (s && OPS.includes(s[s.length - 1])) s = s.slice(0, -1);
    if (!s || s === '-') return null;
    const re = /(\d+\.?\d*(?:e[+-]?\d+)?|\.\d+)|([+\-*/])|(%)/g;
    const items = []; let m;
    while ((m = re.exec(s))) {
      if (m[1] !== undefined) items.push({ n: parseFloat(m[1]), pct: 0 });
      else if (m[2]) items.push(m[2]);
      else { const last = items[items.length - 1]; if (!last || typeof last !== 'object') return null; last.pct++; }
    }
    if (items[0] === '-' && items[1] && typeof items[1] === 'object') { items.shift(); items[0].n = -items[0].n; }
    if (!items.length || typeof items[0] !== 'object') return null;
    for (let i = 0; i < items.length; i++) if ((i % 2 === 0) !== (typeof items[i] === 'object')) return null;
    for (let i = 0; i < items.length; i += 2) {
      const it = items[i];
      let v = it.n / Math.pow(100, it.pct);
      if (it.pct && i >= 2 && (items[i - 1] === '+' || items[i - 1] === '-')) v = evalPlain(items.slice(0, i - 1)) * v;
      items[i] = v;
    }
    return evalPlain(items);
  };
  const hasOp = raw => /[+\-*/%]/.test(raw.replace(/^-/, ''));

  /* ---- pantalla ---- */
  const fit = () => {
    cm.classList.remove('wrap');
    let size = Math.max(24, Math.round(top.clientWidth * 0.15));
    cv.style.fontSize = size + 'px';
    while (size > 26 && cv.getBoundingClientRect().width > cm.clientWidth) { size -= 2; cv.style.fontSize = size + 'px'; }
    if (cv.getBoundingClientRect().width > cm.clientWidth) cm.classList.add('wrap'); // muy larga: pasa a 2 líneas
  };
  const render = () => {
    if (st.err) { cv.textContent = 'Error'; cp.textContent = ' '; fit(); return; }
    if (st.exp) cv.innerHTML = htmlExp(st.exp); else cv.textContent = '0';
    let pv = '';
    if (!st.done && st.exp && hasOp(st.exp)) {
      const r = evaluate(st.exp);
      if (r !== null && Number.isFinite(r)) pv = fmtRaw(fmtResult(r));
    }
    cp.textContent = pv || ' ';
    fit();
  };
  const reset = () => { st.exp = ''; st.done = false; st.err = false; };
  const last = () => st.exp[st.exp.length - 1];

  const press = k => {
    if (/^[0-9]$/.test(k)) {
      if (st.err || st.done) reset();
      if (last() === '%') return render();
      const num = (st.exp.match(/[0-9.]+$/) || [''])[0];
      if (num.replace('.', '').length >= 12) return render();
      if (num === '0') st.exp = st.exp.slice(0, -1) + k; else st.exp += k;
    } else if (k === '.') {
      if (st.err || st.done) { reset(); st.exp = '0.'; }
      else if (!st.exp || OPS.includes(last())) st.exp += '0.';
      else if (last() === '%') return render();
      else if (!((st.exp.match(/[0-9.]+$/) || [''])[0]).includes('.')) st.exp += '.';
    } else if (k === 'C') { reset(); }
    else if (k === '⌫') {
      if (st.err) reset(); else { st.done = false; st.exp = st.exp.slice(0, -1); }
    } else if (k === '%') {
      if (st.err) return;
      if (/[0-9%]$/.test(st.exp) && (st.exp.match(/%+$/) || [''])[0].length < 3) { st.done = false; st.exp += '%'; }
    } else if (OPS.includes(k)) {
      if (st.err) return;
      st.done = false;
      if (!st.exp) { if (k === '-') st.exp = '-'; }
      else if (OPS.includes(last())) { if (st.exp.length > 1) st.exp = st.exp.slice(0, -1) + k; }
      else st.exp += k;
    } else if (k === '=') {
      if (st.err || !st.exp || !hasOp(st.exp)) return;
      const r = evaluate(st.exp);
      if (r === null) return;
      if (!Number.isFinite(r)) { reset(); st.err = true; }
      else { st.exp = fmtResult(r); st.done = true; }
    }
    render();
  };
  $('#cpad').addEventListener('click', e => {
    const b = e.target.closest('[data-k]'); if (!b) return;
    try { navigator.vibrate && navigator.vibrate(8); } catch (x) { /* sin vibración */ }
    press(b.dataset.k);
  });
  window.__calcKey = e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key; let m = null;
    if (/^[0-9]$/.test(k)) m = k;
    else if (k === '.' || k === ',') m = '.';
    else if (k === '+' || k === '-' || k === '*' || k === '/') m = k;
    else if (k === 'x' || k === 'X') m = '*';
    else if (k === 'Enter' || k === '=') m = '=';
    else if (k === 'Backspace') m = '⌫';
    else if (k === 'Escape' || k === 'c' || k === 'C') m = 'C';
    else if (k === '%') m = '%';
    if (m) { e.preventDefault(); press(m); }
  };
  window.addEventListener('resize', fit);
  render();
}

/* ----- estadísticas ----- */
/* ----- compartir por WhatsApp ----- */
function shareWhatsApp(text) {
  const url = 'https://wa.me/?text=' + encodeURIComponent(text);
  const w = window.open(url, '_blank', 'noopener');
  if (!w && navigator.share) navigator.share({ text }).catch(() => {});
}
function noteText(n) {
  if (n.type !== 'calc') return `*${n.title || 'Sin título'}*\n\n${n.body || ''}`.trim();
  const tot = {};
  const rows = (n.lines || []).filter(l => l.d.trim() || l.n.trim()).map(l => {
    const v = num(l.n); if (Number.isFinite(v)) tot[l.c] = (tot[l.c] || 0) + v;
    return `• ${l.d.trim() || '—'}${l.n.trim() ? ': ' + l.n.trim() + ' ' + l.c : ''}`;
  });
  const t = Object.keys(tot).map(c => `${fmt(tot[c])} ${c}`).join(' | ');
  return `*${n.title || 'Sin título'}*\n\n${rows.join('\n')}${t ? `\n\n*Total:* ${t}` : ''}`;
}

/* ----- papelera ----- */
function viewTrash() {
  const list = S.trash.slice().sort((a, b) => b.deletedAt - a.deletedAt);
  const left = n => Math.max(1, 30 - Math.floor((Date.now() - n.deletedAt) / 86400000));
  app.innerHTML = `<div class="screen">
    ${hdr('Papelera', { back: '#/profile', right: list.length ? `<button class="iconbtn sq" data-act="trash-empty" aria-label="Vaciar papelera">${ico('trash')}</button>` : '' })}
    <div class="info" style="margin-bottom:10px">Las notas borradas se guardan aquí 30 días. Después se eliminan solas.</div>
    <div class="list">${list.length ? list.map(n => `<div class="ncard" style="background:${n.bg};color:${n.fg};--acc:${n.accent}">
      <div class="nico">${ico(n.type === 'calc' ? 'calc' : 'note')}</div>
      <div class="nmid"><b>${esc(n.title || 'Sin título')}</b><span class="pv">${esc(notePreview(n)) || '&nbsp;'}</span><small>Se borra en ${left(n)} día(s)</small></div>
      <div class="tact"><button class="btn sm" data-act="trash-restore" data-id="${n.id}">${ico('undo')} Recuperar</button><button class="btn ghost sm" data-act="trash-del" data-id="${n.id}">${ico('trash')}</button></div>
    </div>`).join('') : '<div class="empty">La papelera está vacía.</div>'}</div>
  </div>${nav('profile')}`;
}

/* ----- ventas ----- */
const saleProfit = x => (x.sell - x.buy) * x.qty;
const startOfDay = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
function saleTotals() {
  const now = Date.now(), d0 = startOfDay(now), w0 = d0 - 6 * 86400000, m = new Date(now), m0 = new Date(m.getFullYear(), m.getMonth(), 1).getTime();
  const sum = from => { const l = S.sales.filter(x => x.date >= from); return { n: l.length, p: l.reduce((a, x) => a + saleProfit(x), 0) }; };
  return { day: sum(d0), week: sum(w0), month: sum(m0) };
}
function viewSales() {
  const t = saleTotals(), list = S.sales.slice().sort((a, b) => b.date - a.date);
  const box = (l, o) => `<div class="stat"><b class="${o.p >= 0 ? '' : 'neg'}">${fmt(o.p)}</b><span>${l}</span><i>${o.n} venta${o.n === 1 ? '' : 's'}</i></div>`;
  app.innerHTML = `<div class="screen">
    ${hdr('Ventas', { back: '#/home', right: `<button class="iconbtn sq" data-act="new-sale" aria-label="Nueva venta">${ico('plus')}</button>` })}
    <div class="grid3 salestat">${box('Hoy', t.day)}${box('7 días', t.week)}${box('Este mes', t.month)}</div>
    <div class="list">${list.length ? list.map(x => `<div class="scard">
      <div class="sico">${ico('cash')}</div>
      <div class="smid"><b>${esc(x.client || 'Sin cliente')}</b><span>${esc(x.item)}${x.qty > 1 ? ' × ' + x.qty : ''}</span><small>${dateStr(x.date)} ${timeStr(x.date)}</small></div>
      <div class="sp ${saleProfit(x) >= 0 ? 'pos' : 'neg'}">${saleProfit(x) >= 0 ? '+' : ''}${fmt(saleProfit(x))}</div>
      <button class="dots" data-act="menu-sale" data-id="${x.id}" aria-label="Opciones">${dotsIco}</button>
    </div>`).join('') : '<div class="empty">Todavía no has anotado ventas.<br>Toca el + de arriba.</div>'}</div>
    <div class="info" style="margin-top:12px">La ganancia de cada venta es (venta − compra) × cantidad.</div>
    <div class="row" style="margin-top:10px"><button class="btn ghost sm" data-go="#/stats">${ico('chart')} Ver estadísticas</button></div>
  </div>${nav('sales')}`;
}
async function saleDialog() {
  const offers = S.folders.flatMap(f => f.offers.map(o => ({ ...o, folder: f.name })));
  const r = await dialog(`<h3>Nueva venta</h3>
    <div class="field"><label for="sc">Cliente (opcional)</label><input class="input" id="sc" maxlength="60" placeholder="Nombre del cliente"></div>
    <div class="field"><label for="so">Oferta</label><select class="input" id="so"><option value="">Otra (escribir abajo)</option>${offers.map(o => `<option value="${o.id}">${esc(o.name)} · ${esc(o.folder)}</option>`).join('')}</select></div>
    <div class="field"><label for="si">Producto</label><input class="input" id="si" maxlength="80" placeholder="Ej: 220 Diamantes"></div>
    <div class="grid3 sform"><div class="field"><label for="sb">Compra</label><input class="input" id="sb" inputmode="decimal" placeholder="0"></div>
    <div class="field"><label for="ss">Venta</label><input class="input" id="ss" inputmode="decimal" placeholder="0"></div>
    <div class="field"><label for="sq">Cantidad</label><input class="input" id="sq" inputmode="numeric" value="1"></div></div>
    <div class="status" id="sg"></div>
    <div class="row" style="margin-top:10px"><button class="btn ghost sm" data-close="cancel">Cancelar</button><button class="btn sm" id="sok">${ico('check')} Guardar</button></div>`,
  (ov, close) => {
    const g = id => $('#' + id, ov);
    const calc = () => { const b = num(g('sb').value) || 0, v = num(g('ss').value), q = Math.max(1, Math.round(num(g('sq').value) || 1)); g('sg').textContent = Number.isFinite(v) ? `Ganancia: ${fmt((v - b) * q)}` : ''; };
    g('so').addEventListener('change', () => { const o = offers.find(x => x.id === g('so').value); if (o) { g('si').value = o.name; g('sb').value = o.buy; g('ss').value = o.sell; calc(); } });
    ['sb', 'ss', 'sq'].forEach(i => g(i).addEventListener('input', calc));
    g('sok').addEventListener('click', () => {
      const item = g('si').value.trim(), v = num(g('ss').value), b = num(g('sb').value) || 0;
      if (!item) return toast('Escribe el producto', true);
      if (!Number.isFinite(v)) return toast('Escribe el precio de venta', true);
      close({ client: g('sc').value.trim(), item, buy: b, sell: v, qty: Math.min(9999, Math.max(1, Math.round(num(g('sq').value) || 1))) });
    });
    setTimeout(() => g('sc').focus(), 60);
  });
  if (!r) return;
  S.sales.unshift({ id: uid(), ...r, date: Date.now() }); save(); toast('Venta anotada ✓'); route();
}
async function saleMenu(id) {
  const x = S.sales.find(v => v.id === id); if (!x) return;
  const k = await menuSheet(x.client || 'Venta', [['wa', 'Compartir por WhatsApp', 'chat'], ['del', 'Eliminar venta', 'trash', true]]);
  if (k === 'wa') shareWhatsApp(`*Venta* ${dateStr(x.date)}\n${x.client ? 'Cliente: ' + x.client + '\n' : ''}${x.item}${x.qty > 1 ? ' × ' + x.qty : ''}\nPrecio: ${fmt(x.sell)} c/u\nTotal: ${fmt(x.sell * x.qty)}`);
  else if (k === 'del' && await confirmBox('Eliminar venta', '¿Eliminar esta venta del registro?', 'Eliminar')) { S.sales = S.sales.filter(v => v.id !== id); save(); toast('Venta eliminada'); route(); }
}

function viewStats() {
  const all = S.folders.flatMap(f => f.offers.map(o => ({ ...o, folder: f.name })));
  const total = all.reduce((a, o) => a + profit(o), 0);
  const avg = all.length ? total / all.length : 0;
  const best = all.slice().sort((a, b) => profit(b) - profit(a))[0];
  const bestPct = all.filter(o => o.buy > 0).sort((a, b) => pct(b) - pct(a))[0];
  const maxF = Math.max(1, ...S.folders.map(f => f.offers.reduce((a, o) => a + Math.max(0, profit(o)), 0)));
  app.innerHTML = `<div class="screen">
    ${hdr('Estadísticas', { back: '#/home' })}
    <div class="grid3">
      <div class="stat"><b>${S.folders.length}</b><span>Carpetas</span></div>
      <div class="stat"><b>${all.length}</b><span>Ofertas</span></div>
      <div class="stat"><b>${S.notes.length}</b><span>Notas</span></div>
    </div>
    <div class="card"><h3>Ganancias</h3>
      <div class="kv"><span>Ganancia sumando todas las ofertas</span><b class="${total >= 0 ? 'pos' : 'neg'}">${fmt(total)}</b></div>
      <div class="kv"><span>Ganancia media por oferta</span><b>${all.length ? fmt(avg) : '—'}</b></div>
      <div class="kv"><span>Mayor ganancia</span><b>${best ? `${esc(best.name)} · ${fmt(profit(best))}` : '—'}</b></div>
      <div class="kv"><span>Mejor margen</span><b>${bestPct ? `${esc(bestPct.name)} · ${pct(bestPct).toFixed(1)}%` : '—'}</b></div>
    </div>
    <div class="card"><h3>Por carpeta</h3>
      ${S.folders.map(f => { const t = f.offers.reduce((a, o) => a + profit(o), 0); const w = Math.max(0, f.offers.reduce((a, o) => a + Math.max(0, profit(o)), 0)) / maxF * 100;
        return `<div class="kv" style="display:block"><div style="display:flex;justify-content:space-between;gap:10px"><span style="color:var(--text)">${f.emoji ? esc(f.emoji) + ' ' : ''}${esc(f.name)}</span><b>${f.offers.length} · <span class="${t >= 0 ? 'pos' : 'neg'}">${fmt(t)}</span></b></div><div class="bar"><i style="width:${w}%"></i></div></div>`; }).join('') || '<div class="empty">Sin carpetas.</div>'}
    </div>
    <div class="info" style="margin-top:12px">La “ganancia sumando todas las ofertas” es la suma de (venta − compra) de cada oferta guardada, como si vendieras una unidad de cada una.</div>
  </div>${nav('stats')}`;
}

/* ----- perfil / copias / seguridad ----- */
function viewProfile() {
  const canShare = !!(navigator.canShare && navigator.share);
  const lb = S.meta.lastBackup;
  const nOffers = S.folders.reduce((a, f) => a + f.offers.length, 0);
  let chip = '<span class="chip bad">Sin copias</span>', sub = 'Aún no has hecho ninguna copia';
  if (lb) {
    const d = Math.floor((Date.now() - lb) / 86400000);
    sub = `Última: ${dateStr(lb)} ${timeStr(lb)}`;
    chip = d < 14 ? '<span class="chip ok">Copia al día</span>' : `<span class="chip warn">Hace ${d} días</span>`;
  }
  const row = (act, ic, title, subt, cls = '') => `<button class="prow ${cls}" data-act="${act}"><span class="pi">${ico(ic)}</span><span class="pt"><b>${title}</b><small>${subt}</small></span><span class="chev">${ico('chev')}</span></button>`;
  app.innerHTML = `<div class="screen">
    ${hdr('Perfil', { back: '#/home' })}
    <section class="pcard2">
      <button class="avatar ${S.profile.photo ? 'ph' : ''}" data-act="profile-edit" aria-label="Cambiar foto de perfil" ${S.profile.photo ? `style="background-image:url('${S.profile.photo}')"` : ''}><span class="pen"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg></span></button>
      <button class="pinfo" data-act="profile-edit"><b>${esc(S.profile.name || 'RIHITO')}</b><span>Toca la foto o el nombre para cambiarlos</span></button>
    </section>
    <div class="grid3 pstats">
      <div class="stat"><b>${S.notes.length}</b><span>Notas</span></div>
      <div class="stat"><b>${S.folders.length}</b><span>Carpetas</span></div>
      <div class="stat"><b>${nOffers}</b><span>Ofertas</span></div>
    </div>
    <h4 class="sec"><span>Copias de seguridad</span>${chip}</h4>
    <div class="group">
      ${row('export', 'download', 'Exportar copia', sub)}
      ${canShare ? row('share-backup', 'share', 'Compartir copia', 'Enviarla por WhatsApp, Drive…') : ''}
      ${row('import', 'upload', 'Importar / restaurar copia', 'Recuperar tus datos desde un archivo')}
    </div>
    <input type="file" id="importFile" accept=".json,application/json" class="hide">
    <h4 class="sec"><span>Personalizar</span></h4>
    <div class="group">
      ${row('edit-app', 'palette', 'Editar App', 'Color y tipo de letra')}
      ${row('go-trash', 'trash', 'Papelera', S.trash.length ? plural(S.trash.length, 'nota', 'notas') + ' · se borran a los 30 días' : 'Recupera notas borradas')}
    </div>
    <h4 class="sec"><span>Seguridad</span><button class="infobtn" data-act="info-security" aria-label="Más información">${ico('info')}</button></h4>
    <div class="group">
      ${row('pass-menu', 'lock', 'Contraseña', getAuth() ? 'Activada' : 'Sin contraseña')}
      ${getAuth() && fpSupported() ? row('fp-toggle', 'finger', 'Entrar con huella', getFp() ? 'Activada' : 'Desactivada') : ''}
      ${getAuth() ? row('lock', 'lock', 'Bloquear ahora', 'Se bloquea sola tras 1 minuto en segundo plano') : ''}
    </div>
    <div class="info" style="text-align:center;margin-top:16px;font-size:12px">RIHITO NOTES · versión 3.5</div>
  </div>${nav('profile')}`;
}

/* =====================================================
   5) DIÁLOGOS, ACCIONES Y NAVEGACIÓN
   ===================================================== */
let toastT;
function toast(msg, isErr) {
  const t = $('#toast'); t.textContent = msg; t.className = 'show' + (isErr ? ' err' : '');
  clearTimeout(toastT); toastT = setTimeout(() => { t.className = ''; }, 2400);
}

function dialog(html, setup) {
  return new Promise(res => {
    const ov = document.createElement('div'); ov.className = 'overlay';
    ov.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`;
    document.body.appendChild(ov);
    const close = v => { ov.remove(); res(v); };
    ov.addEventListener('click', e => {
      if (e.target === ov) return close(null);
      const b = e.target.closest('[data-close]'); if (b) close(b.dataset.close === 'ok' ? true : b.dataset.close === 'cancel' ? null : b.dataset.close);
    });
    setup && setup(ov, close);
  });
}
async function confirmBox(title, msg, okText = 'Aceptar', danger = true) {
  return !!(await dialog(`<h3>${esc(title)}</h3><p>${esc(msg)}</p>
    <div class="row"><button class="btn ghost sm" data-close="cancel">Cancelar</button><button class="btn ${danger ? 'danger' : ''} sm" data-close="ok">${esc(okText)}</button></div>`));
}
function menuSheet(title, items) {
  return dialog(`<h3>${esc(title)}</h3>${items.map(([k, l, ic, red]) => `<button class="opt ${red ? 'red' : ''}" data-close="${k}">${ico(ic)}<span>${l}</span></button>`).join('')}`);
}
async function folderDialog(f) {
  let color = f ? f.color : FCOLORS[S.folders.length % FCOLORS.length];
  let kind = f ? f.kind : 'offers';
  return dialog(`<h3>${f ? 'Cambiar nombre' : 'Nueva carpeta'}</h3>
    ${f ? '' : `<div class="field"><label>Tipo de carpeta</label><div class="seg" id="fk"><button type="button" data-k="offers" class="on">${ico('cash')} Ofertas</button><button type="button" data-k="accounts">${ico('user')} Cuentas FF</button></div></div>`}
    <div class="field"><label for="fn">Nombre</label><input class="input" id="fn" maxlength="60" placeholder="Ej: Cuentas de FF" value="${esc(f ? f.name : '')}"></div>
    <div class="field"><label for="fe">Emoji (opcional)</label><input class="input" id="fe" maxlength="4" placeholder="💎 🎮 ⭐" value="${esc(f ? f.emoji : '')}"></div>
    <div class="field"><label>Color</label><div class="sw" id="fc"></div></div>
    <div class="row" style="margin-top:16px"><button class="btn ghost sm" data-close="cancel">Cancelar</button><button class="btn sm" id="fok">${ico('check')} Guardar</button></div>`,
  (ov, close) => {
    const paint = () => { $('#fc', ov).innerHTML = FCOLORS.map(c => `<button type="button" data-c="${c}" class="${c === color ? 'on' : ''}" style="background:${c}" aria-label="Color"></button>`).join(''); };
    paint();
    const fk = $('#fk', ov);
    if (fk) fk.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return; kind = b.dataset.k;
      fk.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
      $('#fn', ov).placeholder = kind === 'accounts' ? 'Ej: Cuentas FF' : 'Ej: Diamantes Free Fire';
    });
    $('#fc', ov).addEventListener('click', e => { const b = e.target.closest('button'); if (b) { color = b.dataset.c; paint(); } });
    $('#fok', ov).addEventListener('click', () => {
      const name = $('#fn', ov).value.trim();
      if (!name) { toast('Escribe un nombre', true); return; }
      close({ name, emoji: $('#fe', ov).value.trim(), color, kind });
    });
    setTimeout(() => $('#fn', ov).focus(), 60);
  });
}

function go(hash, replace) {
  if (replace) { history.replaceState(null, '', hash); route(); }
  else if (location.hash === hash) route();
  else location.hash = hash;
}

/* ----- copias de seguridad ----- */
function backupBlob() {
  S.meta.lastBackup = Date.now(); save();
  const payload = { app: 'RIHITO NOTES', version: 1, exported: new Date().toISOString(), data: S };
  return new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
}
const backupName = () => { const d = new Date(); return `rihito-notes-copia-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.json`; };
function exportBackup() {
  const blob = backupBlob(), url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = backupName(); document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  toast('Copia exportada ✓ Revisa tu carpeta Descargas'); if (location.hash === '#/profile') viewProfile();
}
async function shareBackup() {
  const file = new File([backupBlob()], backupName(), { type: 'application/json' });
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Copia RIHITO NOTES' }); toast('Copia compartida ✓'); viewProfile(); }
    else toast('Tu navegador no puede compartir archivos. Usa “Exportar copia”.', true);
  } catch (e) { /* cancelado */ }
}
function importBackupFile(file) {
  const r = new FileReader();
  r.onerror = () => toast('No se pudo leer el archivo', true);
  r.onload = async () => {
    let d = null;
    try { const j = JSON.parse(r.result); d = normalize(j && j.data ? j.data : j); } catch (e) { /* inválido */ }
    if (!d) { toast('Ese archivo no es una copia válida de RIHITO NOTES', true); return; }
    const msg = `La copia tiene ${d.folders.length} carpeta(s), ${d.folders.reduce((a, f) => a + f.offers.length, 0)} oferta(s) y ${d.notes.length} nota(s). Reemplazará lo que tienes ahora (se guarda una copia automática de seguridad de tus datos actuales).`;
    if (!(await confirmBox('Restaurar copia', msg, 'Restaurar', false))) return;
    store.set(PREV_KEY, JSON.stringify(S));
    S = d; save(); toast('Copia restaurada ✓'); viewProfile();
  };
  r.readAsText(file);
}

/* ----- clics ----- */
document.addEventListener('click', async e => {
  const el = e.target.closest('[data-act],[data-go]'); if (!el) return;
  if (el.dataset.go && !el.dataset.act) { if (e.target.closest('[data-act]')) return; go(el.dataset.go); return; }
  e.stopPropagation();
  const a = el.dataset.act, id = el.dataset.id, fid = el.dataset.f;

  switch (a) {
    case 'open-ff': if (id) go('#/folder/' + id); else go('#/folders'); break;
    case 'more': {
      const k = await menuSheet('Más opciones', [['calc', 'Calculadora', 'calc'], ['sales', 'Ventas', 'cash'], ['stats', 'Estadísticas', 'chart'], ['trash', 'Papelera', 'trash'], ['backup', 'Copias de seguridad', 'download'], ['nn', 'Nueva nota', 'note'], ['nf', 'Nueva carpeta', 'folder']].concat(getAuth() ? [['lock', 'Bloquear app', 'lock']] : []));
      if (k === 'calc') go('#/calc'); else if (k === 'sales') go('#/sales'); else if (k === 'trash') go('#/trash'); else if (k === 'stats') go('#/stats'); else if (k === 'backup') go('#/profile'); else if (k === 'nn') newNoteChoice();
      else if (k === 'nf') newFolder(); else if (k === 'lock') lockApp(); break;
    }
    case 'new-note': newNoteChoice(); break;
    case 'new-folder': newFolder(); break;
    case 'menu-note': noteMenu(id, true); break;
    case 'note-menu': noteMenu(id, false); break;
    case 'menu-folder': {
      const f = folderOf(id); if (!f) break;
      const k = await menuSheet(f.name, [['open', 'Abrir', 'folder'], ['ren', 'Cambiar nombre', 'pencil'], ['del', 'Eliminar carpeta', 'trash', true]]);
      if (k === 'open') go('#/folder/' + id);
      else if (k === 'ren') { const r = await folderDialog(f); if (r) { Object.assign(f, r); save(); toast('Carpeta actualizada ✓'); route(); } }
      else if (k === 'del') {
        const n = f.kind === 'accounts' ? f.accounts.length : f.offers.length;
        if (await confirmBox('Eliminar carpeta', `Se eliminará “${f.name}”${n ? ` y sus ${n} ${f.kind === 'accounts' ? 'cuenta(s)' : 'oferta(s)'}` : ''}. No se puede deshacer.`, 'Eliminar')) {
          S.folders = S.folders.filter(x => x.id !== id); save(); toast('Carpeta eliminada');
          if (location.hash.startsWith('#/folder/')) go('#/folders', true); else route();
        }
      } break;
    }
    case 'add-account': go(`#/accountform/${fid}/new`); break;
    case 'edit-account': go(`#/accountform/${fid}/${id}`); break;
    case 'del-account': { const f = folderOf(fid), a = accOf(fid, id); if (!a) break;
      if (await confirmBox('Eliminar cuenta', `¿Eliminar la cuenta ${a.email || ''}?`, 'Eliminar')) { f.accounts = f.accounts.filter(x => x.id !== id); save(); toast('Cuenta eliminada'); go('#/folder/' + fid, true); } break; }
    case 'acc-eye': { const a = accOf(fid, id), sp = $('#pwv'); if (!a || !sp) break; const on = sp.dataset.shown === '1'; sp.dataset.shown = on ? '0' : '1'; sp.textContent = on ? '••••••••' : a.pass; el.innerHTML = ico(on ? 'eye' : 'eyeoff'); break; }
    case 'acc-copy': { const a = accOf(fid, id); if (!a) break; const w = el.dataset.w;
      copyText(w === 'email' ? a.email : w === 'pass' ? a.pass : w === 'codes' ? a.codes.join('\n') : a.codes[+w.slice(1)] || ''); break; }
    case 'add-offer': go(`#/offerform/${fid}/new`); break;
    case 'edit-offer': go(`#/offerform/${fid}/${id}`); break;
    case 'del-offer': case 'del-offer-detail': {
      const f = folderOf(fid), o = f && f.offers.find(x => x.id === id); if (!o) break;
      if (await confirmBox('Eliminar oferta', `¿Eliminar “${o.name}”?`, 'Eliminar')) {
        f.offers = f.offers.filter(x => x.id !== id); save(); toast('Oferta eliminada');
        if (a === 'del-offer-detail') go('#/folder/' + fid, true); else route();
      } break;
    }
    case 'export': exportBackup(); break;
    case 'share-backup': shareBackup(); break;
    case 'import': { const inp = $('#importFile'); inp.value = ''; inp.onchange = () => inp.files[0] && importBackupFile(inp.files[0]); inp.click(); break; }
    case 'lock': lockApp(); break;
    case 'info-security': await dialog(`<h3>Sobre la contraseña</h3><p>La contraseña es <b>local</b>: impide que otra persona abra la app en tu teléfono, pero los datos se guardan sin cifrar dentro del navegador del dispositivo.</p><p>No uses una contraseña que uses en otros sitios y no guardes datos muy sensibles. Si la olvidas no se puede recuperar.</p><button class="btn sm" data-close="ok">Entendido</button>`); break;
    case 'info-data': await dialog(`<h3>Sobre tus datos</h3><p>Actualizar la app <b>no</b> borra tus datos. Solo se pierden si borras los datos del navegador desde Ajustes de Android, si desinstalas la app o si cambias de teléfono.</p><p>Haz copias de seguridad de vez en cuando y guárdalas fuera de la app (Drive, WhatsApp a ti mismo…).</p><button class="btn sm" data-close="ok">Entendido</button>`); break;
    case 'pass-menu': passMenu(); break;
    case 'edit-app': go('#/editapp'); break;
    case 'go-trash': go('#/trash'); break;
    case 'new-sale': saleDialog(); break;
    case 'menu-sale': saleMenu(id); break;
    case 'trash-restore': { const n = S.trash.find(x => x.id === id); if (!n) break; S.trash = S.trash.filter(x => x.id !== id); const { deletedAt, ...rest } = n; S.notes.unshift({ ...rest, updated: Date.now() }); save(); toast('Nota recuperada ✓'); route(); break; }
    case 'trash-del': { const n = S.trash.find(x => x.id === id); if (!n) break;
      const ok = getAuth() ? await askPassword('Eliminar para siempre', 'Escribe tu contraseña. Esta nota no se podrá recuperar.', 'Eliminar') : await confirmBox('Eliminar para siempre', 'Esta nota no se podrá recuperar.', 'Eliminar');
      if (ok) { S.trash = S.trash.filter(x => x.id !== id); save(); toast('Nota eliminada'); route(); } break; }
    case 'trash-empty': { if (!S.trash.length) break;
      const ok = getAuth() ? await askPassword('Vaciar papelera', 'Escribe tu contraseña. Se eliminarán para siempre las ' + S.trash.length + ' nota(s).', 'Vaciar') : await confirmBox('Vaciar papelera', 'Se eliminarán para siempre las ' + S.trash.length + ' nota(s).', 'Vaciar');
      if (ok) { S.trash = []; save(); toast('Papelera vaciada'); route(); } break; }
    case 'fp-toggle': fpToggle(); break;
    case 'fp-login': fpLogin(); break;
    case 'pick-color': pickColor(); break;
    case 'pick-font': pickFont(); break;
    case 'profile-edit': profileEdit(); break;
    case 'forgot': {
      const r = await confirmBox('Olvidé mi contraseña', 'No existe forma de recuperarla: por seguridad está guardada sin poder leerse. Si continúas se borrarán la contraseña y TODOS los datos de este dispositivo; después podrás restaurar una copia de seguridad (.json) si la tienes.', 'Borrar todo y empezar de nuevo');
      if (r) { store.del(AUTH_KEY); store.del(FP_KEY); store.set(PREV_KEY, JSON.stringify(S)); S = defaultData(); save(); unlocked = false; route(); }
      break;
    }
  }
});

async function newFolder() {
  const r = await folderDialog(null); if (!r) return;
  const f = { id: uid(), name: r.name, emoji: r.emoji, color: r.color, created: Date.now(), kind: r.kind === 'accounts' ? 'accounts' : 'offers', offers: [], accounts: [] };
  S.folders.push(f); save(); toast('Carpeta creada ✓'); go('#/folder/' + f.id);
}
function lockApp() { if (!getAuth()) return; unlocked = false; history.replaceState(null, '', '#/home'); route(); }
/* pide la contraseña (con ojo) y devuelve true sólo si es correcta */
async function askPassword(title, msg, okText) {
  return !!(await dialog(`<h3>${esc(title)}</h3><p>${esc(msg)}</p>
    ${pwInput('ap', 'Contraseña', 'current-password')}
    <div class="row" style="margin-top:14px"><button class="btn ghost sm" data-close="cancel">Cancelar</button><button class="btn danger sm" id="apok">${ico('trash')} ${esc(okText)}</button></div>`,
  (ov, close) => {
    const tryIt = async () => {
      if (await checkPassword($('#ap', ov).value)) close(true);
      else { toast('Contraseña incorrecta', true); $('#ap', ov).value = ''; $('#ap', ov).focus(); }
    };
    $('#apok', ov).addEventListener('click', tryIt);
    $('#ap', ov).addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); tryIt(); } });
    setTimeout(() => $('#ap', ov).focus(), 60);
  }));
}

/* ----- Editar App: color y letra ----- */
function viewEditApp() {
  const th = themeOf(S.profile), fo = FONTS.find(x => x.id === S.profile.font) || FONTS[0];
  const row = (act, ic, title, subt) => `<button class="prow" data-act="${act}"><span class="pi">${ico(ic)}</span><span class="pt"><b>${title}</b><small>${subt}</small></span><span class="chev">${ico('chev')}</span></button>`;
  app.innerHTML = `<div class="screen">
    ${hdr('Editar App', { back: '#/profile' })}
    <div class="group" style="margin-top:6px">
      ${row('pick-color', 'palette', 'CAMBIAR COLOR', esc(th.name))}
      ${row('pick-font', 'font', 'CAMBIAR LETRA', esc(fo.name) + (S.profile.bold ? ' · negrita' : ''))}
    </div>
    <p class="eddesc">El color cambia todos los tonos de la app. La imagen de portada, la calculadora (dibujo) y el icono conservan sus colores originales.</p>
  </div>${nav('profile')}`;
}
async function pickColor() {
  const cu = S.profile.custom || { h: 90, s: .8, v: .9 };
  await dialog(`<h3>Cambiar color</h3><p>Toca un color: se aplica al instante.</p>
    <h4 class="pk-t">Paletas (color + negro)</h4>
    <div class="pick-grid" id="pal">${PALETTES.map(x => `<button class="thm" data-pal="${x.id}"><i class="split" style="--c:${x.c}"></i><span>${esc(x.name)}</span></button>`).join('')}</div>
    <h4 class="pk-t">Mezclar tu color</h4>
    <div class="mix"><div class="sv" id="sv" style="--h:${cu.h}"><b id="svd"></b></div>
      <input type="range" id="hue" class="huer" min="0" max="360" value="${cu.h}" aria-label="Tono"></div>
    <button class="btn sm mixgo" id="mixok"><span class="mixsw" id="mixsw"></span>Usar este color</button>
    <h4 class="pk-t">Todos los colores</h4>
    <div class="pick-grid" id="thg">${THEMES.map(x => `<button class="thm ${x.id === S.profile.theme ? 'on' : ''}" data-th="${x.id}"><i style="background:${x.sw}"></i><span>${esc(x.name)}</span></button>`).join('')}</div>
    <div class="row" style="margin-top:14px"><button class="btn sm" data-close="ok">Listo</button></div>`,
  (ov) => {
    const mark = () => ov.querySelectorAll('[data-th]').forEach(x => x.classList.toggle('on', x.dataset.th === S.profile.theme));
    $('#thg', ov).addEventListener('click', e => {
      const b = e.target.closest('[data-th]'); if (!b) return;
      S.profile.theme = b.dataset.th; save(); applyTheme(); mark();
    });
    $('#pal', ov).addEventListener('click', e => {
      const b = e.target.closest('[data-pal]'); if (!b) return;
      S.profile.theme = b.dataset.pal; save(); applyTheme(); mark();
    });
    const sv = $('#sv', ov), dot = $('#svd', ov), hue = $('#hue', ov), msw = $('#mixsw', ov);
    const cur = { h: cu.h, s: cu.s, v: cu.v };
    const show = () => { sv.style.setProperty('--h', cur.h); dot.style.left = cur.s * 100 + '%'; dot.style.top = (1 - cur.v) * 100 + '%'; msw.style.background = customTheme(cur).sw; };
    const apply = () => { S.profile.theme = 'custom'; S.profile.custom = { ...cur }; save(); applyTheme(); mark(); };
    const move = e => { const r = sv.getBoundingClientRect(); cur.s = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)); cur.v = 1 - Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)); show(); };
    let drag = false;
    sv.addEventListener('pointerdown', e => { drag = true; sv.setPointerCapture(e.pointerId); move(e); });
    sv.addEventListener('pointermove', e => { if (drag) move(e); });
    sv.addEventListener('pointerup', () => { if (drag) { drag = false; apply(); } });
    hue.addEventListener('input', () => { cur.h = +hue.value; show(); });
    hue.addEventListener('change', apply);
    $('#mixok', ov).addEventListener('click', apply);
    show();
  });
  route();
}
async function pickFont() {
  loadFonts(FONTS);
  await dialog(`<h3>Cambiar letra</h3>
    <button class="switch ${S.profile.bold ? 'on' : ''}" id="bsw" role="switch" aria-checked="${!!S.profile.bold}"><span>Negrita</span><i></i></button>
    <div class="pick-list" id="fl">${FONTS.map(f => `<button class="fnt ${f.id === S.profile.font ? 'on' : ''}" data-f="${f.id}" style="font-family:${f.css}"><b>${esc(f.name)}</b><small>Rihito Notes · 0123456789</small></button>`).join('')}</div>
    <p class="fnote">Los tipos de letra necesitan internet la primera vez que los eliges.</p>
    <div class="row" style="margin-top:10px"><button class="btn sm" data-close="ok">Listo</button></div>`,
  (ov) => {
    $('#fl', ov).addEventListener('click', e => {
      const b = e.target.closest('[data-f]'); if (!b) return;
      S.profile.font = b.dataset.f; save(); applyTheme();
      ov.querySelectorAll('.fnt').forEach(x => x.classList.toggle('on', x === b));
    });
    $('#bsw', ov).addEventListener('click', e => {
      S.profile.bold = !S.profile.bold; save(); applyTheme();
      e.currentTarget.classList.toggle('on', S.profile.bold); e.currentTarget.setAttribute('aria-checked', S.profile.bold);
    });
  });
  route();
}

/* ----- perfil: nombre y foto ----- */
function photoFromFile(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file), im = new Image();
    im.onload = () => {
      try {
        const w = im.naturalWidth, h = im.naturalHeight, s = Math.min(w, h), N = 320;
        const sx = (w - s) / 2, sy = h > w ? Math.max(0, Math.min(h - s, (h - s) * 0.35)) : 0;
        const c = document.createElement('canvas'); c.width = c.height = N;
        c.getContext('2d').drawImage(im, sx, sy, s, s, 0, 0, N, N);
        res(c.toDataURL('image/jpeg', 0.85));
      } catch (e) { rej(e); } finally { URL.revokeObjectURL(url); }
    };
    im.onerror = () => { URL.revokeObjectURL(url); rej(new Error('img')); };
    im.src = url;
  });
}
function pickPhoto(camera) {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
  if (camera) inp.setAttribute('capture', 'user');
  inp.style.display = 'none'; document.body.appendChild(inp);
  inp.addEventListener('change', async () => {
    const f = inp.files && inp.files[0]; inp.remove(); if (!f) return;
    try { S.profile.photo = await photoFromFile(f); if (save()) toast('Foto guardada ✓'); route(); }
    catch (e) { toast('No se pudo usar esa imagen', true); }
  });
  inp.click();
}
async function profileEdit() {
  const items = [['cam', 'Tomar foto', 'camera'], ['gal', 'Elegir de la galería', 'image'], ['name', 'Cambiar nombre de usuario', 'pencil']];
  if (S.profile.photo) items.push(['del', 'Quitar foto', 'trash', true]);
  const k = await menuSheet('Perfil', items);
  if (k === 'cam') pickPhoto(true);
  else if (k === 'gal') pickPhoto(false);
  else if (k === 'del') { S.profile.photo = ''; save(); toast('Foto quitada'); route(); }
  else if (k === 'name') {
    const ok = await dialog(`<h3>Nombre de usuario</h3>
      <div class="field"><input class="input" id="pn" maxlength="24" placeholder="RIHITO" value="${esc(S.profile.name)}"></div>
      <div class="row" style="margin-top:14px"><button class="btn ghost sm" data-close="cancel">Cancelar</button><button class="btn sm" id="pnok">${ico('check')} Guardar</button></div>`,
    (ov, close) => {
      const go1 = () => { S.profile.name = $('#pn', ov).value.replace(/\s+/g, ' ').trim().slice(0, 24); save(); close(true); };
      $('#pnok', ov).addEventListener('click', go1);
      $('#pn', ov).addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); go1(); } });
      setTimeout(() => { const i = $('#pn', ov); i.focus(); i.select(); }, 60);
    });
    if (ok) { toast('Nombre guardado ✓'); route(); }
  }
}

/* menú de Contraseña: Poner / Cambiar / Quitar (según haya o no contraseña) */
async function passMenu() {
  const has = !!getAuth();
  const k = await menuSheet('Contraseña', has
    ? [['change', 'Cambiar contraseña', 'pencil'], ['remove', 'Quitar contraseña', 'trash', true], ['wipe', 'Borrar todos los datos', 'trash', true]]
    : [['set', 'Poner contraseña', 'lock']]);
  if (k === 'set') await setPassDialog();
  else if (k === 'change') await changePass();
  else if (k === 'wipe') await wipeAll();
  else if (k === 'remove') {
    if (await askPassword('Quitar contraseña', 'Escribe tu contraseña para quitarla. La app se abrirá sin pedir nada.', 'Quitar')) {
      store.del(AUTH_KEY); store.del(FP_KEY); unlocked = true; toast('Contraseña quitada'); route();
    }
  }
}
async function wipeAll() {
  if (!(await confirmBox('Borrar todo', 'Se borrarán TODAS tus carpetas, ofertas, notas y tu foto de perfil de este dispositivo. ¿Ya hiciste una copia de seguridad?', 'Continuar'))) return;
  const r = await askPassword('Borrar todos los datos', 'Para borrar TODO escribe tu contraseña. Esto no se puede deshacer.', 'Borrar todo');
  if (r) { store.set(PREV_KEY, JSON.stringify(S)); S = defaultData(); S.folders = []; save(); toast('Datos borrados'); route(); }
}
async function setPassDialog() {
  const ok = await dialog(`<h3>Poner contraseña</h3>
    <p>Se pedirá cada vez que abras la app. Si la olvidas no se puede recuperar.</p>
    <div class="stack">${pwInput('n1', 'Nueva contraseña (mín. 4)', 'new-password')}
    ${pwInput('n2', 'Repite la contraseña', 'new-password')}</div>
    <div class="row" style="margin-top:14px"><button class="btn ghost sm" data-close="cancel">Cancelar</button><button class="btn sm" id="nok">Guardar</button></div>`,
  (ov, close) => $('#nok', ov).addEventListener('click', async () => {
    const n = $('#n1', ov).value;
    if (n.length < 4) return toast('Usa al menos 4 caracteres', true);
    if (n !== $('#n2', ov).value) return toast('Las contraseñas no coinciden', true);
    await setPassword(n); unlocked = true; toast('Contraseña puesta ✓'); close(true);
  }));
  if (ok) route();
}

async function changePass() {
  await dialog(`<h3>Cambiar contraseña</h3>
    <div class="stack">${pwInput('c0', 'Contraseña actual', 'current-password')}
    ${pwInput('c1', 'Nueva contraseña (mín. 4)', 'new-password')}
    ${pwInput('c2', 'Repite la nueva contraseña', 'new-password')}</div>
    <div class="row" style="margin-top:14px"><button class="btn ghost sm" data-close="cancel">Cancelar</button><button class="btn sm" id="cok">Guardar</button></div>`,
  (ov, close) => $('#cok', ov).addEventListener('click', async () => {
    if (!(await checkPassword($('#c0', ov).value))) return toast('La contraseña actual no es correcta', true);
    const n = $('#c1', ov).value;
    if (n.length < 4) return toast('Usa al menos 4 caracteres', true);
    if (n !== $('#c2', ov).value) return toast('Las contraseñas nuevas no coinciden', true);
    await setPassword(n); toast('Contraseña cambiada ✓'); close(true); route();
  }));
}

/* ----- huella (solo si hay contraseña) ----- */
const fpSupported = () => !!(window.PublicKeyCredential && navigator.credentials && window.isSecureContext);
const getFp = () => { try { return JSON.parse(store.get(FP_KEY) || 'null'); } catch (e) { return null; } };
const rnd = n => crypto.getRandomValues(new Uint8Array(n));
async function fpToggle() {
  if (getFp()) { if (await confirmBox('Huella', '¿Dejar de entrar con huella? Seguirás entrando con tu contraseña.', 'Desactivar', false)) { store.del(FP_KEY); toast('Huella desactivada'); route(); } return; }
  try {
    const cred = await navigator.credentials.create({ publicKey: {
      challenge: rnd(32), rp: { name: 'RIHITO NOTES', id: location.hostname }, user: { id: rnd(16), name: 'rihito', displayName: 'RIHITO' },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
      authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'discouraged' }, timeout: 60000 } });
    store.set(FP_KEY, JSON.stringify({ id: toHex(new Uint8Array(cred.rawId)) }));
    toast('Huella activada ✓'); route();
  } catch (e) { toast('No se pudo activar la huella. Revisa que tengas una huella guardada en el teléfono.', true); }
}
async function fpLogin() {
  const f = getFp(); if (!f) return false;
  try {
    await navigator.credentials.get({ publicKey: { challenge: rnd(32), rpId: location.hostname, userVerification: 'required', timeout: 60000,
      allowCredentials: [{ type: 'public-key', id: fromHex(f.id), transports: ['internal'] }] } });
    unlocked = true; if (!location.hash || location.hash === '#/lock') location.hash = '#/home'; route(); return true;
  } catch (e) { return false; }
}

/* ----- recordatorio de copia de seguridad ----- */
let reminded = false;
async function maybeRemindBackup() {
  if (reminded) return; reminded = true;
  const snooze = Number(store.get(SNOOZE_KEY)) || 0; if (Date.now() < snooze) return;
  const lb = S.meta.lastBackup, first = Number(store.get(FIRST_KEY)) || Date.now();
  const days = lb ? Math.floor((Date.now() - lb) / 86400000) : Math.floor((Date.now() - first) / 86400000);
  if (lb ? days < 7 : days < 2) return;
  const k = await dialog(`<h3>Haz tu copia de seguridad</h3><p>${lb ? `Hace ${days} días que no haces una copia.` : 'Todavía no has hecho ninguna copia.'} Así no pierdes tus notas ni tus ventas si cambias de teléfono o borras los datos.</p>
    <div class="row"><button class="btn ghost sm" data-close="later">Más tarde</button><button class="btn sm" data-close="now">${ico('download')} Exportar ahora</button></div>`);
  if (k === 'now') exportBackup(); else store.set(SNOOZE_KEY, String(Date.now() + 86400000));
}

/* ----- enrutador ----- */
function route() {
  applyTheme();
  if (leaveHook) { const h = leaveHook; leaveHook = null; h(); }
  window.__noteDel = null;
  window.__calcKey = null;
  if (getAuth() && !unlocked) { viewLock(); return; }
  const parts = (location.hash.replace(/^#\/?/, '') || 'home').split('/');
  const [r, a, b] = parts;
  window.scrollTo(0, 0);
  switch (r) {
    case 'notes': viewNotes(); break;
    case 'note': viewNote(a || 'new', b); break;
    case 'folders': viewFolders(); break;
    case 'folder': viewFolder(a); break;
    case 'offer': viewOffer(a, b); break;
    case 'account': viewAccount(a, b); break;
    case 'accountform': viewAccountForm(a, b || 'new'); break;
    case 'offerform': viewOfferForm(a, b || 'new'); break;
    case 'calc': viewCalc(); break;
    case 'stats': viewStats(); break;
    case 'sales': viewSales(); break;
    case 'trash': viewTrash(); break;
    case 'profile': viewProfile(); break;
    case 'editapp': viewEditApp(); break;
    default: viewHome();
  }
  if (!r || r === 'home') maybeRemindBackup();
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-eye]'); if (!b) return;
  const inp = b.parentElement.querySelector('input'); if (!inp) return;
  const show = inp.type === 'password';
  inp.type = show ? 'text' : 'password';
  b.innerHTML = ico(show ? 'eyeoff' : 'eye');
  b.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
  try { inp.focus(); const n = inp.value.length; inp.setSelectionRange(n, n); } catch (x) { /* sin foco */ }
});
window.addEventListener('hashchange', route);
document.addEventListener('keydown', e => { if (window.__calcKey) window.__calcKey(e); });
window.addEventListener('pagehide', () => { if (leaveHook) leaveHook(); });

/* se bloquea sola si la app estuvo más de 1 minuto en segundo plano */
let hiddenAt = 0;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { hiddenAt = Date.now(); if (leaveHook) leaveHook(); }
  else if (unlocked && getAuth() && hiddenAt && Date.now() - hiddenAt > 60000) lockApp();
});

/* =====================================================
   6) ARRANQUE
   ===================================================== */
route();
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
})();
