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
const blankLine = l => !l.d.trim() && !l.n.trim();
const BG_SW = ['#160c2b', '#2b1259', '#0e2a4a', '#0f3a2a', '#4a2a0a', '#4a0f1f', '#111111', '#f5f0ff'];
const FG_SW = ['#f4ecff', '#ffffff', '#fde68a', '#7dd3fc', '#86efac', '#f9a8d4', '#1a1030', '#000000'];

const mkOffer = (name, buy, sell, notes = '') => ({ id: uid(), name, buy, sell, notes, created: Date.now() });

function defaultData() {
  return {
    v: 1,
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
    meta: { lastBackup: null }
  };
}

/* Comprueba y limpia datos (también sirve para validar copias de seguridad importadas) */
function normalize(d) {
  if (!d || typeof d !== 'object' || !Array.isArray(d.folders) || !Array.isArray(d.notes)) return null;
  const out = { v: 1, folders: [], notes: [], meta: { lastBackup: (d.meta && d.meta.lastBackup) || null } };
  d.folders.forEach((f, i) => {
    if (!f || typeof f !== 'object') return;
    out.folders.push({
      id: String(f.id || uid()), name: String(f.name || 'Carpeta').slice(0, 60),
      emoji: String(f.emoji || '').slice(0, 8), color: /^#[0-9a-f]{6}$/i.test(f.color) ? f.color : FCOLORS[i % FCOLORS.length],
      created: Number(f.created) || Date.now(),
      offers: (Array.isArray(f.offers) ? f.offers : []).filter(o => o && typeof o === 'object').map(o => ({
        id: String(o.id || uid()), name: String(o.name || 'Oferta').slice(0, 80),
        buy: Number.isFinite(+o.buy) ? +o.buy : 0, sell: Number.isFinite(+o.sell) ? +o.sell : 0,
        notes: String(o.notes || '').slice(0, 5000), created: Number(o.created) || Date.now()
      }))
    });
  });
  d.notes.forEach((n, i) => {
    if (!n || typeof n !== 'object') return;
    out.notes.push({
      id: String(n.id || uid()), title: String(n.title || '').slice(0, 120), body: String(n.body || '').slice(0, 100000),
      bg: /^#[0-9a-f]{6}$/i.test(n.bg) ? n.bg : DEF_BG, fg: /^#[0-9a-f]{6}$/i.test(n.fg) ? n.fg : DEF_FG,
      accent: /^#[0-9a-f]{6}$/i.test(n.accent) ? n.accent : ACCENTS[i % ACCENTS.length],
      created: Number(n.created) || Date.now(), updated: Number(n.updated) || Date.now(),
      ...(n.type === 'calc' ? { type: 'calc', lines: cleanLines(n.lines) } : {})
    });
  });
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
  calc: '<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="11" x2="8.01" y2="11"/><line x1="12" y1="11" x2="12.01" y2="11"/><line x1="16" y1="11" x2="16.01" y2="11"/><line x1="8" y1="15" x2="8.01" y2="15"/><line x1="12" y1="15" x2="12.01" y2="15"/><line x1="16" y1="15" x2="16.01" y2="15"/><line x1="8" y1="18.5" x2="16" y2="18.5"/>',
  backspace: '<path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff: '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>',
  chev: '<polyline points="9 18 15 12 9 6"/>',
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
  const items = [['home', 'Inicio', 'home'], ['notes', 'Notas', 'note'], ['folders', 'Carpetas', 'folder'], ['stats', 'Estadísticas', 'chart'], ['profile', 'Perfil', 'user']];
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
  setTimeout(() => { const el = $('#p1'); el && el.focus(); }, 50);
}

/* ----- inicio ----- */
function viewHome() {
  const nOffers = S.folders.reduce((a, f) => a + f.offers.length, 0);
  const ff = S.folders.find(f => /diamantes/i.test(f.name)) || S.folders[0];
  let bk = '', warn = false;
  if (S.meta.lastBackup) {
    const days = Math.floor((Date.now() - S.meta.lastBackup) / 86400000);
    bk = `Última copia de seguridad: ${dateStr(S.meta.lastBackup)}`;
    if (days >= 14) { bk += ' · conviene hacer otra'; warn = true; }
  } else { bk = 'Aún no has hecho ninguna copia de seguridad'; warn = true; }
  app.innerHTML = `<div class="screen home">
    <div class="hero" role="img" aria-label="RIHITO NOTES · Tu libreta, tus reglas">
      <button class="gear" data-go="#/profile" aria-label="Ajustes">${ico('gear')}</button>
    </div>
    <div class="tiles">
      <button class="tile" data-go="#/notes"><svg class="ico" viewBox="0 0 24 24" style="color:#a855f7">${P.note}</svg>Mis Notas<small>${plural(S.notes.length, 'nota', 'notas')}</small></button>
      <button class="tile" data-go="#/folders"><svg class="ico" viewBox="0 0 24 24" style="color:#fbbf24;fill:#fbbf2433">${P.folder}</svg>Carpetas<small>${plural(S.folders.length, 'carpeta', 'carpetas')}</small></button>
      <button class="tile" data-act="open-ff" ${ff ? `data-id="${ff.id}"` : ''}>${gem('ico')}Diamantes<br>Free Fire<small>${ff ? plural(ff.offers.length, 'oferta', 'ofertas') : ''}</small></button>
      <button class="tile" data-act="more"><svg class="ico" viewBox="0 0 24 24" style="color:#8b5cf6;fill:#8b5cf6">${P.grid}</svg>Más<small>Calculadora y más</small></button>
    </div>
    <div class="quick">
      <button data-act="new-note">${ico('plus')}Nueva nota</button>
      <button data-act="new-folder">${ico('plus')}Nueva carpeta</button>
      <button data-go="#/profile">${ico('download')}Copias</button>
    </div>
    <div class="welcome"><b>Bienvenido a RIHITO NOTES 👑</b>Organiza, vende y controla todo en un solo lugar.</div>
    <div class="backup-note ${warn ? 'warn' : ''}">${bk}</div>
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
    <div class="nmid"><b>${esc(n.title || 'Sin título')}${n.type === 'calc' ? '<span class="cbadge">CÁLCULO</span>' : ''}</b><span class="pv">${esc(notePreview(n)) || '&nbsp;'}</span><small>${dateStr(n.updated)}</small></div>
    <button class="dots" data-act="menu-note" data-id="${n.id}" aria-label="Opciones">${dotsIco}</button>
  </div>`;
}
function noteListHtml() {
  const q = noteQuery.trim().toLowerCase();
  const list = S.notes.filter(n => !q || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q) || (n.lines || []).some(l => l.d.toLowerCase().includes(q))).sort((a, b) => b.updated - a.updated);
  if (!list.length) return `<div class="empty">${S.notes.length ? 'No hay notas que coincidan.' : 'Todavía no tienes notas.<br>Toca “Crear Nota”.'}</div>`;
  return list.map(noteCard).join('');
}
function viewNotes() {
  app.innerHTML = `<div class="screen">
    ${hdr('Mis Notas', { back: '#/home', right: `<button class="iconbtn sq" data-act="new-note" aria-label="Nueva nota">${ico('plus')}</button>` })}
    <label class="search">${ico('search')}<input id="q" type="search" placeholder="Buscar notas..." value="${esc(noteQuery)}"></label>
    <div class="list" id="noteList">${noteListHtml()}</div>
    <div style="margin-top:18px"><button class="btn" data-act="new-note">${ico('plus')} Crear Nota</button></div>
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
    : { id: uid(), type: 'calc', title: '', body: '', lines: [], bg: DEF_BG, fg: DEF_FG, accent: ACCENTS[S.notes.length % ACCENTS.length], created: Date.now(), updated: Date.now() };
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
    <div class="colors"><h4>Color del texto</h4><div class="sw" id="swfg"></div></div>`}
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
    <label class="f cc"><select ${writeMode ? '' : 'disabled'} aria-label="Moneda">${CURS.map(c => `<option${c === l.c ? ' selected' : ''}>${c}</option>`).join('')}</select><i>▼</i></label>
    <button type="button" class="cx" aria-label="Quitar línea">✕</button></div>`;
  const renderRows = focus => {
    rows.className = 'clist' + (rm ? ' rm' : '');
    rows.innerHTML = draft.lines.map(rowHtml).join('');
    rows.querySelectorAll('textarea').forEach(grow);
    if (focus != null) { const e = rows.querySelector(`.cl[data-i="${focus}"] .cd`); e && e.focus(); }
    $('#cnt').textContent = plural(nb(), 'línea', 'líneas');
  };
  const paint = () => {
    ed.style.background = draft.bg; ed.style.color = draft.fg;
    const sw = (key, list) => list.map(c => `<button type="button" data-c="${c}" class="${draft[key].toLowerCase() === c ? 'on' : ''}" style="background:${c}" aria-label="Color ${c}"></button>`).join('') +
      `<label class="pick" title="Otro color"><input type="color" data-key="${key}" value="${draft[key]}"></label>`;
    if ($('#swbg')) { $('#swbg').innerHTML = sw('bg', BG_SW); $('#swfg').innerHTML = sw('fg', FG_SW); }
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
    const b = e.target.closest('#swbg button, #swfg button'); if (!b) return;
    const key = b.parentElement.id === 'swbg' ? 'bg' : 'fg'; draft[key] = b.dataset.c; paint(); commit('Color guardado');
  });
  scr.addEventListener('input', e => {
    const i = e.target.closest('input[type=color]'); if (!i) return;
    draft[i.dataset.key] = i.value; ed.style.background = draft.bg; ed.style.color = draft.fg; later();
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
  const ok = !getAuth() ? await confirmBox('Borrar nota', `¿Borrar “${n.title || 'Sin título'}”? No se puede deshacer.`, 'Borrar') : await dialog(`<h3>Borrar nota</h3>
    <p>Para borrar “${esc(n.title || 'Sin título')}” escribe tu contraseña. No se puede deshacer.</p>
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
  S.notes = S.notes.filter(x => x.id !== id); save(); toast('Nota borrada');
  return true;
}
async function noteMenu(id, fromList) {
  const n = S.notes.find(x => x.id === id); if (!n) return;
  const k = await menuSheet(n.title || 'Nota', [['write', 'Escribir', 'pencil'], ['style', 'Editar', 'palette'], ['del', 'Borrar', 'trash', true]]);
  if (k === 'write') go('#/note/' + id + '/write');
  else if (k === 'style') go('#/note/' + id + '/style');
  else if (k === 'del' && await deleteNoteWithPassword(id)) { if (fromList) route(); else go('#/notes', true); }
}

/* ----- carpetas ----- */
function viewFolders() {
  app.innerHTML = `<div class="screen">
    ${hdr('Carpetas', { back: '#/home', right: `<button class="iconbtn sq" data-act="new-folder" aria-label="Nueva carpeta">${ico('plus')}</button>` })}
    <div class="list">
      ${S.folders.map(f => `<div class="fcard" style="--c:${f.color}" data-go="#/folder/${f.id}">
        <div class="fico">${folderSvg}</div>
        <div class="fmid"><b>${esc(f.name)}</b><small>${plural(f.offers.length, 'oferta', 'ofertas')}</small></div>
        ${f.emoji ? `<span class="emo">${esc(f.emoji)}</span>` : ''}
        <button class="dots" data-act="menu-folder" data-id="${f.id}" aria-label="Opciones">${dotsIco}</button>
      </div>`).join('') || '<div class="empty">No tienes carpetas.</div>'}
      <button class="btn dashed" data-act="new-folder">${ico('plus')} Añadir Carpeta</button>
    </div>
  </div>${nav('folders')}`;
}

function viewFolder(fid) {
  const f = folderOf(fid); if (!f) { go('#/folders', true); return; }
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
    <section class="pcard2"><div class="avatar"></div><div class="pinfo"><b>RIHITO</b><span>Tu libreta, tus reglas</span></div></section>
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
    <h4 class="sec"><span>Seguridad</span><button class="infobtn" data-act="info-security" aria-label="Más información">${ico('info')}</button></h4>
    <div class="group">
      ${row('pass-menu', 'lock', 'Contraseña', getAuth() ? 'Activada' : 'Sin contraseña')}
      ${getAuth() ? row('lock', 'lock', 'Bloquear ahora', 'Se bloquea sola tras 1 minuto en segundo plano') : ''}
    </div>
    <h4 class="sec danger"><span>Zona de peligro</span><button class="infobtn" data-act="info-data" aria-label="Más información">${ico('info')}</button></h4>
    <div class="group danger">
      ${row('wipe', 'trash', 'Borrar todos los datos', 'No se puede deshacer', 'red')}
    </div>
    <div class="info" style="text-align:center;margin-top:16px;font-size:12px">RIHITO NOTES · versión 1.6</div>
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
  return dialog(`<h3>${f ? 'Cambiar nombre' : 'Nueva carpeta'}</h3>
    <div class="field"><label for="fn">Nombre</label><input class="input" id="fn" maxlength="60" placeholder="Ej: Cuentas de FF" value="${esc(f ? f.name : '')}"></div>
    <div class="field"><label for="fe">Emoji (opcional)</label><input class="input" id="fe" maxlength="4" placeholder="💎 🎮 ⭐" value="${esc(f ? f.emoji : '')}"></div>
    <div class="field"><label>Color</label><div class="sw" id="fc"></div></div>
    <div class="row" style="margin-top:16px"><button class="btn ghost sm" data-close="cancel">Cancelar</button><button class="btn sm" id="fok">${ico('check')} Guardar</button></div>`,
  (ov, close) => {
    const paint = () => { $('#fc', ov).innerHTML = FCOLORS.map(c => `<button type="button" data-c="${c}" class="${c === color ? 'on' : ''}" style="background:${c}" aria-label="Color"></button>`).join(''); };
    paint();
    $('#fc', ov).addEventListener('click', e => { const b = e.target.closest('button'); if (b) { color = b.dataset.c; paint(); } });
    $('#fok', ov).addEventListener('click', () => {
      const name = $('#fn', ov).value.trim();
      if (!name) { toast('Escribe un nombre', true); return; }
      close({ name, emoji: $('#fe', ov).value.trim(), color });
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
      const k = await menuSheet('Más opciones', [['calc', 'Calculadora', 'calc'], ['stats', 'Estadísticas', 'chart'], ['backup', 'Copias de seguridad', 'download'], ['nn', 'Nueva nota', 'note'], ['nf', 'Nueva carpeta', 'folder']].concat(getAuth() ? [['lock', 'Bloquear app', 'lock']] : []));
      if (k === 'calc') go('#/calc'); else if (k === 'stats') go('#/stats'); else if (k === 'backup') go('#/profile'); else if (k === 'nn') newNoteChoice();
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
        const n = f.offers.length;
        if (await confirmBox('Eliminar carpeta', `Se eliminará “${f.name}”${n ? ` y sus ${n} oferta(s)` : ''}. No se puede deshacer.`, 'Eliminar')) {
          S.folders = S.folders.filter(x => x.id !== id); save(); toast('Carpeta eliminada');
          if (location.hash.startsWith('#/folder/')) go('#/folders', true); else route();
        }
      } break;
    }
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
    case 'wipe': {
      if (await confirmBox('Borrar todo', 'Se borrarán TODAS tus carpetas, ofertas y notas de este dispositivo. ¿Ya hiciste una copia de seguridad?', 'Continuar')) {
        const r = getAuth()
          ? await askPassword('Borrar todos los datos', 'Para borrar TODO escribe tu contraseña. Esto no se puede deshacer.', 'Borrar todo')
          : await confirmBox('Borrar todos los datos', 'Última confirmación: se borrará TODO. No se puede deshacer.', 'Borrar todo');
        if (r) { store.set(PREV_KEY, JSON.stringify(S)); S = defaultData(); S.folders = []; save(); toast('Datos borrados'); route(); }
      } break;
    }
    case 'forgot': {
      const r = await confirmBox('Olvidé mi contraseña', 'No existe forma de recuperarla: por seguridad está guardada sin poder leerse. Si continúas se borrarán la contraseña y TODOS los datos de este dispositivo; después podrás restaurar una copia de seguridad (.json) si la tienes.', 'Borrar todo y empezar de nuevo');
      if (r) { store.del(AUTH_KEY); store.set(PREV_KEY, JSON.stringify(S)); S = defaultData(); save(); unlocked = false; route(); }
      break;
    }
  }
});

async function newFolder() {
  const r = await folderDialog(null); if (!r) return;
  const f = { id: uid(), name: r.name, emoji: r.emoji, color: r.color, created: Date.now(), offers: [] };
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

/* menú de Contraseña: Poner / Cambiar / Quitar (según haya o no contraseña) */
async function passMenu() {
  const has = !!getAuth();
  const k = await menuSheet('Contraseña', has
    ? [['change', 'Cambiar contraseña', 'pencil'], ['remove', 'Quitar contraseña', 'trash', true]]
    : [['set', 'Poner contraseña', 'lock']]);
  if (k === 'set') await setPassDialog();
  else if (k === 'change') await changePass();
  else if (k === 'remove') {
    if (await askPassword('Quitar contraseña', 'Escribe tu contraseña para quitarla. La app se abrirá sin pedir nada.', 'Quitar')) {
      store.del(AUTH_KEY); unlocked = true; toast('Contraseña quitada'); route();
    }
  }
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

/* ----- enrutador ----- */
function route() {
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
    case 'offerform': viewOfferForm(a, b || 'new'); break;
    case 'calc': viewCalc(); break;
    case 'stats': viewStats(); break;
    case 'profile': viewProfile(); break;
    default: viewHome();
  }
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
