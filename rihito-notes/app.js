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
      created: Number(n.created) || Date.now(), updated: Number(n.updated) || Date.now()
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
  calc: '<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="11" x2="8.01" y2="11"/><line x1="12" y1="11" x2="12.01" y2="11"/><line x1="16" y1="11" x2="16.01" y2="11"/><line x1="8" y1="15" x2="8.01" y2="15"/><line x1="12" y1="15" x2="12.01" y2="15"/><line x1="16" y1="15" x2="16.01" y2="15"/><line x1="8" y1="18.5" x2="16" y2="18.5"/>',
  backspace: '<path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'
};
const ico = (n, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n]}</svg>`;
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
  const first = !getAuth();
  app.innerHTML = `<div class="lock">
    <div class="logo" role="img" aria-label="RIHITO NOTES"></div>
    <h2>${first ? 'Crea tu contraseña' : 'Bienvenido de nuevo'}</h2>
    <p class="s">${first ? 'Protegerá tus notas y ofertas cada vez que abras la app.' : 'Escribe tu contraseña para entrar.'}</p>
    <form id="lockForm" class="stack" autocomplete="off">
      <input class="input" id="p1" type="password" placeholder="${first ? 'Nueva contraseña (mín. 4 caracteres)' : 'Contraseña'}" autocomplete="${first ? 'new-password' : 'current-password'}" required>
      ${first ? '<input class="input" id="p2" type="password" placeholder="Repite la contraseña" autocomplete="new-password" required>' : ''}
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
  app.innerHTML = `<div class="screen">
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
function noteCard(n) {
  return `<div class="ncard" style="background:${n.bg};color:${n.fg};--acc:${n.accent}" data-go="#/note/${n.id}">
    <div class="nico">${ico('note')}</div>
    <div class="nmid"><b>${esc(n.title || 'Sin título')}</b><span class="pv">${esc((n.body || '').replace(/\s+/g, ' ').slice(0, 60)) || '&nbsp;'}</span><small>${dateStr(n.updated)}</small></div>
    <button class="dots" data-act="menu-note" data-id="${n.id}" aria-label="Opciones">${dotsIco}</button>
  </div>`;
}
function noteListHtml() {
  const q = noteQuery.trim().toLowerCase();
  const list = S.notes.filter(n => !q || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)).sort((a, b) => b.updated - a.updated);
  if (!list.length) return `<div class="empty">${S.notes.length ? 'No hay notas que coincidan.' : 'Todavía no tienes notas.<br>Toca “Crear Nota”.'}</div>`;
  return list.map(noteCard).join('');
}
function viewNotes() {
  app.innerHTML = `<div class="screen">
    ${hdr('Mis Notas', { back: '#/home', right: `<button class="iconbtn sq" data-act="new-note" aria-label="Nueva nota">${ico('pencil')}</button>` })}
    <label class="search">${ico('search')}<input id="q" type="search" placeholder="Buscar notas..." value="${esc(noteQuery)}"></label>
    <div class="list" id="noteList">${noteListHtml()}</div>
    <div style="margin-top:18px"><button class="btn" data-act="new-note">${ico('plus')} Crear Nota</button></div>
  </div>${nav('notes')}`;
  $('#q').addEventListener('input', e => { noteQuery = e.target.value; $('#noteList').innerHTML = noteListHtml(); });
}

/* Vista de lectura: se ve la nota con sus colores y un botón Editar */
function viewNoteRead(n) {
  app.innerHTML = `<div class="screen nonav">
    ${hdr('Nota', { back: '#/notes', right: `<button class="iconbtn" data-act="del-note-view" data-id="${n.id}" aria-label="Eliminar nota" style="color:#ef4444">${ico('trash')}</button>` })}
    <article class="reader" style="background:${n.bg};color:${n.fg};border-left-color:${n.accent}">
      <h2>${esc(n.title || 'Sin título')}</h2>
      <div class="rbody">${n.body ? esc(n.body) : '<span class="rempty">(Nota vacía)</span>'}</div>
    </article>
    <div class="status">Última edición: ${dateStr(n.updated)} ${timeStr(n.updated)}</div>
    <div style="margin-top:12px"><button class="btn" data-go="#/note/${n.id}/edit">${ico('pencil')} Editar</button></div>
  </div>`;
}

function viewNote(id, mode) {
  let note = id === 'new' ? null : S.notes.find(n => n.id === id);
  if (id !== 'new' && !note) { go('#/notes', true); return; }
  if (note && mode !== 'edit') { viewNoteRead(note); return; }
  const draft = note ? { ...note } : { id: uid(), title: '', body: '', bg: DEF_BG, fg: DEF_FG, accent: ACCENTS[S.notes.length % ACCENTS.length], created: Date.now(), updated: Date.now() };
  let stored = !!note, timer = null;

  app.innerHTML = `<div class="screen nonav">
    ${hdr(note ? 'Editar nota' : 'Nueva nota', { back: note ? '#/note/' + note.id : '#/notes', right: `<button class="iconbtn" data-act="del-note-editor" aria-label="Eliminar nota" style="color:#ef4444">${ico('trash')}</button>` })}
    <div class="editor" id="ed">
      <input class="t" id="nt" placeholder="Título" maxlength="120">
      <textarea class="b" id="nb" placeholder="Escribe aquí tu nota..."></textarea>
    </div>
    <div class="colors"><h4>Color de fondo</h4><div class="sw" id="swbg"></div></div>
    <div class="colors"><h4>Color del texto</h4><div class="sw" id="swfg"></div></div>
    <div class="status" id="st"></div>
    <div class="row" style="margin-top:8px"><button class="btn" id="saveBtn">${ico('check')} Guardar</button></div>
  </div>`;
  const ed = $('#ed'), nt = $('#nt'), nb = $('#nb'), st = $('#st');
  nt.value = draft.title; nb.value = draft.body;

  const paint = () => {
    ed.style.background = draft.bg; ed.style.color = draft.fg;
    const sw = (key, list) => list.map(c => `<button type="button" data-c="${c}" class="${draft[key].toLowerCase() === c ? 'on' : ''}" style="background:${c}" aria-label="Color ${c}"></button>`).join('') +
      `<label class="pick" title="Otro color"><input type="color" data-key="${key}" value="${draft[key]}"></label>`;
    $('#swbg').innerHTML = sw('bg', BG_SW); $('#swfg').innerHTML = sw('fg', FG_SW);
  };
  const commit = (msg) => {
    draft.title = nt.value; draft.body = nb.value;
    if (!stored && !draft.title.trim() && !draft.body.trim()) return false;
    draft.updated = Date.now();
    if (!stored) { S.notes.unshift(draft); stored = true; history.replaceState(null, '', '#/note/' + draft.id + '/edit'); }
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
    if (!nt.value.trim() && !nb.value.trim()) { toast('Escribe un título o contenido primero', true); return; }
    commit('Nota guardada'); toast('Nota guardada ✓'); go('#/note/' + draft.id, true);
  });
  window.__noteDel = async () => {
    if (!(await confirmBox('Eliminar nota', '¿Seguro que quieres eliminar esta nota? No se puede deshacer.', 'Eliminar'))) return;
    clearTimeout(timer); leaveHook = null;
    S.notes = S.notes.filter(n => n.id !== draft.id); save(); toast('Nota eliminada'); go('#/notes', true);
  };
  leaveHook = () => { clearTimeout(timer); commit(); window.__noteDel = null; };
  paint();
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
      ${f.offers.length ? `<button class="btn dangerline" data-act="del-all" data-f="${f.id}">${ico('trash')} Eliminar Todas</button>` : ''}
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
function viewCalc() {
  const st = { cur: '0', prev: null, op: null, fresh: false, done: false, err: false, expr: '' };
  const SYM = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  const keys = [['C', 'k-clear'], ['⌫', 'k-back'], ['%', 'k-pct'], ['/', 'op'],
    ['7'], ['8'], ['9'], ['*', 'op'], ['4'], ['5'], ['6'], ['-', 'op'], ['1'], ['2'], ['3'], ['+', 'op'],
    ['0', 'zero'], ['.'], ['=', 'op eq']];
  const label = k => k === '/' ? '÷' : k === '*' ? '×' : k === '-' ? '−' : k === '⌫' ? ico('backspace') : k;
  app.innerHTML = `<div class="screen nonav calc">
    <div class="calc-top" role="img" aria-label="Calculadora">
      <button class="calc-back" data-go="#/home" aria-label="Volver">${ico('back')}</button>
      <div class="calc-disp" aria-live="polite"><div class="calc-expr" id="cx">&nbsp;</div><div class="calc-val" id="cv">0</div></div>
    </div>
    <div class="calc-pad" id="cpad">${keys.map(([k, c]) => `<button type="button" class="ck ${c || ''}" data-k="${k}" aria-label="${k === '⌫' ? 'Borrar' : k === 'C' ? 'Limpiar' : k === '/' ? 'Dividir' : k === '*' ? 'Multiplicar' : k === '-' ? 'Restar' : k === '+' ? 'Sumar' : k === '=' ? 'Igual' : k === '%' ? 'Porcentaje' : k === '.' ? 'Punto decimal' : k}">${label(k)}</button>`).join('')}</div>
    <div class="calc-foot"></div>
  </div>`;
  const cv = $('#cv'), cx = $('#cx');
  const fmtN = n => {
    if (!Number.isFinite(n)) return null;
    let t = parseFloat(n.toPrecision(12)).toString();
    if (t === '-0') t = '0';
    if (t.length > 14) t = n.toExponential(6).replace(/\.?0+e/, 'e');
    return t;
  };
  const compute = (a, o, b) => {
    a = parseFloat(a); b = parseFloat(b);
    if (o === '+') return a + b; if (o === '-') return a - b; if (o === '*') return a * b;
    if (o === '/') return b === 0 ? NaN : a / b;
    return b;
  };
  const render = () => {
    const txt = st.err ? 'Error' : st.cur;
    cv.textContent = txt;
    const n = txt.length;
    cv.style.fontSize = (n <= 7 ? 13 : n <= 9 ? 12 : n <= 11 ? 10 : 8.5) + 'cqw';
    cx.textContent = st.expr || ' ';
  };
  const reset = () => { st.cur = '0'; st.prev = null; st.op = null; st.fresh = false; st.done = false; st.err = false; st.expr = ''; };
  const fail = () => { reset(); st.err = true; };
  const press = k => {
    if (/^[0-9]$/.test(k)) {
      if (st.err || st.done) reset();
      if (st.fresh) { st.cur = '0'; st.fresh = false; }
      if (st.cur.replace(/[-.]/g, '').length >= 12) return render();
      st.cur = st.cur === '0' ? k : st.cur + k;
    } else if (k === '.') {
      if (st.err || st.done) reset();
      if (st.fresh) { st.cur = '0'; st.fresh = false; }
      if (!st.cur.includes('.')) st.cur += '.';
    } else if (k === 'C') { reset(); }
    else if (k === '⌫') {
      if (st.err) reset();
      else if (!st.done && !st.fresh) { st.cur = st.cur.slice(0, -1); if (st.cur === '' || st.cur === '-') st.cur = '0'; }
    } else if (k === '%') {
      if (st.err) return;
      const v = parseFloat(st.cur);
      let r;
      if (st.op && st.prev !== null && !st.fresh) r = (st.op === '+' || st.op === '-') ? parseFloat(st.prev) * v / 100 : v / 100;
      else r = v / 100;
      st.cur = fmtN(r); st.done = false;
    } else if (k === '+' || k === '-' || k === '*' || k === '/') {
      if (st.err) return;
      if (st.op && !st.fresh) {
        const r = compute(st.prev, st.op, st.cur);
        if (!Number.isFinite(r)) { fail(); return render(); }
        st.cur = fmtN(r);
      }
      st.prev = st.cur; st.op = k; st.fresh = true; st.done = false; st.expr = st.prev + ' ' + SYM[k];
    } else if (k === '=') {
      if (st.err || !st.op || st.fresh) return;
      const r = compute(st.prev, st.op, st.cur);
      if (!Number.isFinite(r)) { fail(); return render(); }
      st.expr = st.prev + ' ' + SYM[st.op] + ' ' + st.cur + ' =';
      st.cur = fmtN(r); st.prev = null; st.op = null; st.done = true; st.fresh = false;
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
  app.innerHTML = `<div class="screen">
    ${hdr('Perfil', { back: '#/home' })}
    <div class="avatar"></div><div class="pname">RIHITO</div><div class="psub">Tu libreta, tus reglas</div>
    <div class="card"><h3>Copia de seguridad</h3>
      <div class="info" style="margin-bottom:12px">${S.meta.lastBackup ? `Última copia: <b>${dateStr(S.meta.lastBackup)} ${timeStr(S.meta.lastBackup)}</b>.` : '<b>Todavía no hay copias.</b>'} Guarda el archivo fuera de la app (Descargas, Google Drive, WhatsApp a ti mismo…).</div>
      <div class="stack">
        <button class="btn" data-act="export">${ico('download')} Exportar copia</button>
        ${canShare ? `<button class="btn ghost" data-act="share-backup">${ico('share')} Compartir copia…</button>` : ''}
        <button class="btn ghost" data-act="import">${ico('upload')} Importar / restaurar copia</button>
      </div>
      <input type="file" id="importFile" accept=".json,application/json" class="hide">
    </div>
    <div class="card"><h3>Seguridad</h3>
      <div class="stack">
        <button class="btn ghost" data-act="lock">${ico('lock')} Bloquear ahora</button>
        <button class="btn ghost" data-act="change-pass">${ico('pencil')} Cambiar contraseña</button>
      </div>
      <div class="info" style="margin-top:12px"><b>Importante:</b> la contraseña es local. Impide que otra persona abra la app en tu teléfono, pero los datos se guardan sin cifrar dentro del navegador del dispositivo. No uses una contraseña que uses en otros sitios y no guardes datos muy sensibles.</div>
    </div>
    <div class="card"><h3>Datos</h3>
      <button class="btn dangerline" data-act="wipe">${ico('trash')} Borrar todos los datos</button>
      <div class="info" style="margin-top:10px">Actualizar la app no borra tus datos. Sólo se pierden si borras los datos del navegador/app desde Ajustes de Android o desinstalas la app. Haz copias de vez en cuando.</div>
    </div>
    <div class="info" style="text-align:center;margin-top:14px">RIHITO NOTES · versión 1.2</div>
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
      const k = await menuSheet('Más opciones', [['calc', 'Calculadora', 'calc'], ['stats', 'Estadísticas', 'chart'], ['backup', 'Copias de seguridad', 'download'], ['nn', 'Nueva nota', 'note'], ['nf', 'Nueva carpeta', 'folder'], ['lock', 'Bloquear app', 'lock']]);
      if (k === 'calc') go('#/calc'); else if (k === 'stats') go('#/stats'); else if (k === 'backup') go('#/profile'); else if (k === 'nn') go('#/note/new');
      else if (k === 'nf') newFolder(); else if (k === 'lock') lockApp(); break;
    }
    case 'new-note': go('#/note/new'); break;
    case 'new-folder': newFolder(); break;
    case 'menu-note': {
      const n = S.notes.find(x => x.id === id); if (!n) break;
      const k = await menuSheet(n.title || 'Nota', [['edit', 'Editar', 'pencil'], ['del', 'Eliminar', 'trash', true]]);
      if (k === 'edit') go('#/note/' + id + '/edit');
      else if (k === 'del' && await confirmBox('Eliminar nota', '¿Seguro que quieres eliminar esta nota?', 'Eliminar')) {
        S.notes = S.notes.filter(x => x.id !== id); save(); toast('Nota eliminada'); route();
      } break;
    }
    case 'del-note-editor': window.__noteDel && window.__noteDel(); break;
    case 'del-note-view': {
      if (await confirmBox('Eliminar nota', '¿Seguro que quieres eliminar esta nota? No se puede deshacer.', 'Eliminar')) {
        S.notes = S.notes.filter(x => x.id !== id); save(); toast('Nota eliminada'); go('#/notes', true);
      } break;
    }
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
    case 'del-all': {
      const f = folderOf(fid); if (!f) break;
      if (await confirmBox('Eliminar todas', `Se eliminarán las ${f.offers.length} ofertas de “${f.name}”. La carpeta quedará vacía.`, 'Eliminar todas')) { f.offers = []; save(); toast('Ofertas eliminadas'); route(); }
      break;
    }
    case 'export': exportBackup(); break;
    case 'share-backup': shareBackup(); break;
    case 'import': { const inp = $('#importFile'); inp.value = ''; inp.onchange = () => inp.files[0] && importBackupFile(inp.files[0]); inp.click(); break; }
    case 'lock': lockApp(); break;
    case 'change-pass': changePass(); break;
    case 'wipe': {
      if (await confirmBox('Borrar todo', 'Se borrarán TODAS tus carpetas, ofertas y notas de este dispositivo. ¿Ya hiciste una copia de seguridad?', 'Continuar')) {
        const r = await dialog(`<h3>Confirmación final</h3><p>Escribe <b>BORRAR</b> para confirmar.</p><input class="input" id="wc" placeholder="BORRAR" autocomplete="off"><div class="row" style="margin-top:14px"><button class="btn ghost sm" data-close="cancel">Cancelar</button><button class="btn danger sm" id="wok">Borrar todo</button></div>`,
          (ov, close) => $('#wok', ov).addEventListener('click', () => { if ($('#wc', ov).value.trim().toUpperCase() === 'BORRAR') close(true); else toast('Escribe BORRAR', true); }));
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
function lockApp() { unlocked = false; history.replaceState(null, '', '#/home'); route(); }
async function changePass() {
  await dialog(`<h3>Cambiar contraseña</h3>
    <div class="stack"><input class="input" id="c0" type="password" placeholder="Contraseña actual" autocomplete="current-password">
    <input class="input" id="c1" type="password" placeholder="Nueva contraseña (mín. 4)" autocomplete="new-password">
    <input class="input" id="c2" type="password" placeholder="Repite la nueva contraseña" autocomplete="new-password"></div>
    <div class="row" style="margin-top:14px"><button class="btn ghost sm" data-close="cancel">Cancelar</button><button class="btn sm" id="cok">Guardar</button></div>`,
  (ov, close) => $('#cok', ov).addEventListener('click', async () => {
    if (!(await checkPassword($('#c0', ov).value))) return toast('La contraseña actual no es correcta', true);
    const n = $('#c1', ov).value;
    if (n.length < 4) return toast('Usa al menos 4 caracteres', true);
    if (n !== $('#c2', ov).value) return toast('Las contraseñas nuevas no coinciden', true);
    await setPassword(n); toast('Contraseña cambiada ✓'); close(true);
  }));
}

/* ----- enrutador ----- */
function route() {
  if (leaveHook) { const h = leaveHook; leaveHook = null; h(); }
  window.__noteDel = null;
  window.__calcKey = null;
  if (!unlocked) { viewLock(); return; }
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
window.addEventListener('hashchange', route);
document.addEventListener('keydown', e => { if (window.__calcKey) window.__calcKey(e); });
window.addEventListener('pagehide', () => { if (leaveHook) leaveHook(); });

/* se bloquea sola si la app estuvo más de 1 minuto en segundo plano */
let hiddenAt = 0;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { hiddenAt = Date.now(); if (leaveHook) leaveHook(); }
  else if (unlocked && hiddenAt && Date.now() - hiddenAt > 60000) lockApp();
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
