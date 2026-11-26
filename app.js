/* Forja — app de treino pessoal. Tudo roda no aparelho; os dados ficam no localStorage. */
(() => {
'use strict';

const KEY = 'forja.v1';
const SEED = window.FORJA_SEED;
const GUIAS = SEED.guias;
const $app = document.getElementById('app');

/* ---------- utilidades ---------- */
const clone = (o) => JSON.parse(JSON.stringify(o));
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const fmtInt = (n) => Math.round(n).toLocaleString('pt-BR');
const fmtNum = (n) => (Math.round(n * 10) / 10).toLocaleString('pt-BR');
const DAY = 86400000;
const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const DIAS_C = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const startOfDay = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const startOfWeek = (t) => { const d = new Date(startOfDay(t)); const wd = (d.getDay() + 6) % 7; return d.getTime() - wd * DAY; };
const clock = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}` : `${m}:${String(ss).padStart(2, '0')}`;
};
const minutos = (ms) => Math.max(1, Math.round(ms / 60000));
const diaLabel = (t) => {
  const diff = Math.round((startOfDay(Date.now()) - startOfDay(t)) / DAY);
  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Ontem';
  const d = new Date(t);
  return `${DIAS_C[d.getDay()]}, ${d.getDate()} ${MESES[d.getMonth()]}`;
};
const haDias = (t) => {
  const diff = Math.round((startOfDay(Date.now()) - startOfDay(t)) / DAY);
  return diff === 0 ? 'hoje' : diff === 1 ? 'ontem' : `há ${diff} dias`;
};
const pace = (ms, km) => {
  if (!km) return '—';
  const s = ms / 1000 / km; const m = Math.floor(s / 60); const r = Math.round(s % 60);
  return `${m}:${String(r === 60 ? 59 : r).padStart(2, '0')}`;
};
const parseNum = (v) => { const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : 0; };

/* ---------- ícones ---------- */
const I = {
  back: '<path d="M15 6l-6 6 6 6"/>', chev: '<path d="M9 6l6 6-6 6"/>', close: '<path d="M6 6l12 12M18 6L6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', pencil: '<path d="M4 20h4L19 9l-4-4L4 16z"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  clockI: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', home: '<path d="M4 10l8-6 8 6v10H4z"/>',
  list: '<path d="M6 6h12M6 12h12M6 18h8"/>', chart: '<path d="M4 18l5-6 4 3 7-9"/>', down: '<path d="M6 9l6 6 6-6"/>',
  up: '<path d="M6 15l6-6 6 6"/>', trash: '<path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/>', trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8"/>',
  minimize: '<path d="M6 9l6 6 6-6"/>', bolt: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
  halter: '<path d="M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12"/>', corpo: '<circle cx="12" cy="5" r="2"/><path d="M12 7v7M8 10l4 2 4-2M9 21l3-7 3 7"/>',
  polia: '<circle cx="12" cy="5" r="2"/><path d="M12 7v9M9 19h6M12 16v3"/>', tempo: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M10 2h4"/>',
  corrida: '<circle cx="14" cy="4" r="2"/><path d="M8 21l3-6 3 3v4M6 12l3-3 4 1 3 3h3M11 15l-1-4"/>', caminhada: '<circle cx="12" cy="4" r="2"/><path d="M10 21l2-7 2 3v4M8 11l3-3 3 2 2 3"/>'
};
const ic = (n, size = 20, sw = 2, extra = '') => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${I[n]}</svg>`;

/* ---------- estado ---------- */
function fresh() { return { v: 1, fichas: clone(SEED.fichas), sessoes: [], ativa: null, descanso: null, meta: 4, avisouNotif: false }; }
function load() {
  try { const raw = localStorage.getItem(KEY); if (raw) { const s = JSON.parse(raw); if (s && s.v === 1 && Array.isArray(s.fichas)) return s; } } catch (e) { /* armazenamento indisponível */ }
  return fresh();
}
let S = load();
let storageOk = true;
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); storageOk = true; } catch (e) { storageOk = false; }
}
const UI = { sheet: null, modal: null, toast: null, draft: null, evoPeriodo: 90, addEx: null };

const ficha = (id) => S.fichas.find((f) => f.id === id);
const ordemForca = () => S.fichas.filter((f) => f.tipo === 'forca').sort((a, b) => (a.letra || 'Z').localeCompare(b.letra || 'Z'));
function fichaDeHoje() {
  const forca = ordemForca(); if (!forca.length) return null;
  const ultima = S.sessoes.find((s) => s.tipo === 'forca' && s.fichaId && ficha(s.fichaId));
  if (!ultima) return forca[0];
  if (startOfDay(ultima.inicio) === startOfDay(Date.now())) return ficha(ultima.fichaId);
  const i = forca.findIndex((f) => f.id === ultima.fichaId);
  return forca[(i + 1) % forca.length];
}
const tituloFicha = (f) => (f.letra ? `Treino ${f.letra} · ` : '') + (f.subtitulo || f.nome);
const nomeSessao = (s) => (s.letra ? `Treino ${s.letra} · ` : '') + s.nome;

/* histórico por exercício */
function historicoEx(exId) {
  const out = [];
  for (const s of S.sessoes) {
    if (s.tipo !== 'forca') continue;
    const e = s.exercicios.find((x) => x.exId === exId);
    if (!e) continue;
    const feitas = e.series.filter((x) => x.feita);
    if (!feitas.length) continue;
    const best = feitas.reduce((a, b) => (b.kg > a.kg || (b.kg === a.kg && b.reps > a.reps) ? b : a));
    out.push({ t: s.inicio, sessao: s.id, kg: best.kg, reps: best.reps, unidade: e.unidade, series: feitas });
  }
  return out; // mais recente primeiro
}
const melhorKgAntes = (exId, antesDe) => {
  let m = null;
  for (const h of historicoEx(exId)) if (h.t < antesDe && (m === null || h.kg > m)) m = h.kg;
  return m;
};
function volume(s) {
  if (s.tipo !== 'forca') return 0;
  let v = 0;
  for (const e of s.exercicios) if (e.unidade !== 's') for (const x of e.series) if (x.feita) v += (x.kg || 0) * (x.reps || 0);
  return v;
}
const seriesFeitas = (s) => s.tipo === 'forca' ? s.exercicios.reduce((a, e) => a + e.series.filter((x) => x.feita).length, 0) : 0;
const seriesTotal = (s) => s.tipo === 'forca' ? s.exercicios.reduce((a, e) => a + e.series.length, 0) : 0;
function recordes(s) {
  const out = [];
  if (s.tipo !== 'forca') return out;
  for (const e of s.exercicios) {
    if (e.unidade === 's') continue;
    const feitas = e.series.filter((x) => x.feita && x.kg > 0); if (!feitas.length) continue;
    const top = Math.max(...feitas.map((x) => x.kg));
    const antes = melhorKgAntes(e.exId, s.inicio);
    if (antes !== null && top > antes) out.push({ nome: e.nome, kg: top, ganho: top - antes, exId: e.exId });
  }
  return out;
}

/* ---------- roteamento ---------- */
function route() {
  // Hash simples (#home, #ficha--pernas) para funcionar também dentro de páginas hospedadas que só aceitam #nome.
  const h = (location.hash || '#home').replace(/^#\/?/, '');
  const i = h.indexOf('--');
  const name = (i >= 0 ? h.slice(0, i) : h.split('/')[0]) || 'home';
  const id = i >= 0 ? h.slice(i + 2) : (h.split('/')[1] || null);
  return { name, id: id ? decodeURIComponent(id) : null };
}
const go = (path, replace) => { const [n, id] = path.split('/'); const url = '#' + n + (id ? '--' + id : ''); if (replace) location.replace(url); else location.hash = url; };
function back(fallback) { if (history.length > 1 && UI.cameFromApp) history.back(); else go(fallback || 'home', true); }
window.addEventListener('hashchange', () => { UI.cameFromApp = true; UI.sheet = null; UI.modal = null; render(); const sc = $app.querySelector('.scroll'); if (sc) sc.scrollTop = 0; });

/* ---------- peças de UI ---------- */
const ill = (tipo, size) => `<img class="ill" src="img/cat-${esc(tipo)}.png" alt="" width="${size}" height="${size}" style="width:${size}px;height:${size}px" decoding="async">`;
function thumb(e) {
  if (e.img) return `<div class="thumb"><img src="img/ex-${esc(e.img)}.png" alt="" width="68" height="68" decoding="async"></div>`;
  let n = 'halter';
  if (e.icone) n = e.icone;
  else if (e.unidade === 's') n = 'tempo';
  else if (/polia/i.test(e.equip || '')) n = 'polia';
  else if (/corporal|banco|roda/i.test(e.equip || '')) n = 'corpo';
  return `<div class="thumb" style="color:var(--muted)">${ic(n, 32, 1.75)}</div>`;
}
const nav = (cur) => `<nav class="nav" aria-label="Navegação principal">
  <button data-a="go" data-to="home" ${cur === 'home' ? 'aria-current="page"' : ''}>${ic('home', 24)}Treinos</button>
  <button data-a="go" data-to="fichas" ${cur === 'fichas' ? 'aria-current="page"' : ''}>${ic('list', 24)}Fichas</button>
  <button data-a="go" data-to="historico" ${cur === 'historico' ? 'aria-current="page"' : ''}>${ic('chart', 24)}Histórico</button>
</nav>`;
function resumeBanner() {
  const a = S.ativa; if (!a) return '';
  return `<button class="resume" data-a="go" data-to="treino">
    <span style="flex:1;min-width:0"><span class="eyebrow y" style="display:block">Treino em andamento</span>
    <span style="display:block;font-weight:600;font-size:16px;margin-top:2px">${esc(nomeSessao(a))}</span></span>
    <span class="num" data-live="clock" style="font-size:20px">${clock(Date.now() - a.inicio)}</span>${ic('chev', 20)}</button>`;
}
const repsTxt = (e, reps) => e.unidade === 's' ? `${reps} s` : reps;
const valorEx = (e) => `${e.series} × ${e.unidade === 's' ? e.reps + ' s' : e.reps}`;
const cargaEx = (e) => e.kg ? `${fmtNum(e.kg)} kg` : '—';

/* ---------- telas ---------- */
function vHome() {
  const now = new Date();
  const ws = startOfWeek(Date.now());
  const dias = new Set(S.sessoes.map((s) => startOfDay(s.inicio)));
  const semana = S.sessoes.filter((s) => s.inicio >= ws).length;
  const hoje = fichaDeHoje();
  const strip = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((l, i) => {
    const t = ws + i * DAY; const d = new Date(t).getDate();
    const cls = (dias.has(t) ? ' done' : '') + (t === startOfDay(Date.now()) ? ' today' : '');
    return `<div class="d"><span>${l}</span><span class="dot${cls}">${d}</span></div>`;
  }).join('');
  const tiles = S.fichas.map((f) => `<button class="tile" data-a="sheet" data-id="${esc(f.id)}" aria-label="${esc(f.nome)}${hoje && hoje.id === f.id ? ', sugerido para hoje' : ''}">
      ${hoje && hoje.id === f.id ? '<span class="tag tag-today">Hoje</span>' : ''}
      ${f.letra ? `<span class="letter">${esc(f.letra)}</span>` : ''}
      ${ill(f.ilustracao, 80)}<span class="h2">${esc(f.nome)}</span></button>`).join('');
  return `<div class="screen"><div class="scroll">
    <div style="padding:calc(24px + var(--safe-t)) 16px 0;display:flex;justify-content:space-between;align-items:center">
      <div><div class="muted" style="font-size:14px;line-height:24px">${DIAS[now.getDay()]}, ${now.getDate()} ${MESES[now.getMonth()]}</div>
      <div class="h1">Bora treinar</div></div>
      <div style="text-align:right"><div class="num" style="font-size:24px;line-height:32px">${semana}<span class="muted">/${S.meta}</span></div>
      <div class="muted" style="font-size:12px">na semana</div></div>
    </div>
    <div class="week" aria-label="Dias treinados nesta semana">${strip}</div>
    ${resumeBanner()}
    <div class="pad" style="padding-bottom:24px">
      <div style="display:flex;align-items:center;justify-content:space-between;height:40px;margin:0 0 16px">
        <span class="h2">Escolher treino</span>
        <button class="pill" data-a="livre">${ic('plus', 16)}Treino livre</button>
      </div>
      <div class="grid">${tiles}</div>
    </div>
  </div>${nav('home')}${vSheet()}</div>`;
}

function vSheet() {
  if (!UI.sheet) return '';
  const f = ficha(UI.sheet); if (!f) return '';
  const hoje = fichaDeHoje();
  let meta, rows, more, cta;
  if (f.tipo === 'cardio') {
    const ult = S.sessoes.find((s) => s.fichaId === f.id);
    meta = ult ? `Última corrida ${haDias(ult.inicio)}` : `${f.etapas.length} etapas · ~${f.minutos} min`;
    rows = ult ? [['Tempo', clock(ult.fim - ult.inicio)], ['Distância', ult.distancia ? `${fmtNum(ult.distancia)} km` : '—'], ['Ritmo', ult.distancia ? `${pace(ult.fim - ult.inicio, ult.distancia)} /km` : '—']]
      : f.etapas.slice(0, 3).map((e) => [e.nome, e.valor]);
    more = 'Ver detalhes da corrida'; cta = 'Começar corrida';
  } else {
    const series = f.exercicios.reduce((a, e) => a + Number(e.series || 0), 0);
    meta = `${f.exercicios.length} exercícios · ${series} séries · ~${f.minutos} min`;
    rows = f.exercicios.slice(0, 3).map((e) => [e.nome, valorEx(e)]);
    more = `Ver os ${f.exercicios.length} exercícios`; cta = 'Começar treino';
  }
  const tag = f.tipo === 'cardio' ? `Cardio · ${f.subtitulo}` : `Treino ${f.letra}${hoje && hoje.id === f.id ? ' · Hoje' : ''}`;
  return `<div class="overlay">
    <button class="backdrop" data-a="closesheet" aria-label="Fechar"></button>
    <div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(f.nome)}">
      <div style="display:flex;align-items:center;gap:16px">
        <div style="width:80px;height:80px;flex:none">${ill(f.ilustracao, 80)}</div>
        <div style="flex:1;min-width:0"><div class="eyebrow y">${esc(tag)}</div><div class="h1">${esc(f.nome)}</div></div>
        <button data-a="closesheet" aria-label="Fechar" style="flex:none;width:44px;height:44px;border-radius:999px;border:1px solid rgba(255,184,28,.48);background:rgba(26,28,32,.56);color:var(--ink);display:flex;align-items:center;justify-content:center;padding:0">${ic('close')}</button>
      </div>
      <div class="muted" style="font-size:14px;line-height:24px;margin-top:8px">${esc(meta)}</div>
      <div class="chips">${f.musculos.map((m) => `<span class="chip sm">${esc(m)}</span>`).join('')}</div>
      <div style="margin-top:16px;padding-top:8px;border-top:1px solid rgba(255,184,28,.32)">
        ${rows.map((r, i) => `<div class="sheet-row"><span class="n">${f.tipo === 'cardio' ? '·' : i + 1}</span><span class="t">${esc(r[0])}</span><span class="num" style="font-size:14px">${esc(r[1])}</span></div>`).join('')}
        <button class="link" data-a="go" data-to="ficha/${esc(f.id)}">${esc(more)}${ic('chev', 16)}</button>
      </div>
      <button class="btn" style="margin-top:12px" data-a="start" data-id="${esc(f.id)}">${esc(cta)}</button>
    </div></div>`;
}

function vFichas() {
  const hoje = fichaDeHoje();
  const rows = S.fichas.map((f) => {
    const sub = f.tipo === 'cardio' ? `${f.etapas.length} etapas · ~${f.minutos} min` : `${f.exercicios.length} exercícios · ~${f.minutos} min`;
    return `<button class="exrow" data-a="go" data-to="ficha/${esc(f.id)}">
      <div class="thumb">${ill(f.ilustracao, 60)}</div>
      <div style="flex:1;min-width:0"><div class="nm">${f.letra ? `<span class="muted">${esc(f.letra)} · </span>` : ''}${esc(f.nome)}</div><div class="sb">${esc(sub)}</div></div>
      ${hoje && hoje.id === f.id ? '<span class="tag-today">Hoje</span>' : ''}${ic('chev', 20, 2, 'style="color:var(--muted);flex:none"')}</button>`;
  }).join('');
  return `<div class="screen"><div class="scroll"><div class="pad" style="padding-top:calc(24px + var(--safe-t));padding-bottom:24px">
    <div class="h1">Fichas</div>
    <div class="muted" style="font-size:14px;margin-top:4px">Toque numa ficha para ver ou editar.</div>
    <div style="margin-top:8px">${rows}</div>
    <div class="field" style="margin-top:24px"><label for="meta">Meta de treinos por semana</label>
      <div class="stepper"><button data-a="meta" data-d="-1" aria-label="Diminuir meta">−</button><span id="meta" class="num" style="min-width:48px;text-align:center;font-size:20px">${S.meta}</span><button data-a="meta" data-d="1" aria-label="Aumentar meta">+</button></div></div>
    <button class="btn ghost" style="margin-top:24px;height:48px;font-size:14px" data-a="restaurar">Restaurar fichas padrão</button>
    <p class="muted" style="font-size:12px;line-height:18px;margin-top:16px">Seus dados ficam só neste aparelho. Limpar os dados do navegador apaga o histórico.</p>
  </div></div>${nav('fichas')}${vModal()}</div>`;
}

function vDetalhe(id) {
  const f = ficha(id); if (!f) return vNotFound();
  const ult = S.sessoes.find((s) => s.fichaId === f.id);
  const hoje = fichaDeHoje();
  const cardio = f.tipo === 'cardio';
  const tag = cardio ? `Cardio · ${f.subtitulo}` : `Treino ${f.letra}${hoje && hoje.id === f.id ? ' · Hoje' : ''}`;
  const stats = cardio ? [[fmtNum(f.distanciaAlvo || 0), 'km'], [`~${f.minutos}`, 'min'], [f.ritmoAlvo || '—', 'ritmo /km']]
    : [[f.exercicios.length, 'exercícios'], [f.exercicios.reduce((a, e) => a + Number(e.series || 0), 0), 'séries'], [`~${f.minutos}`, 'min']];
  const lastTxt = ult ? `${cardio ? 'Última corrida' : 'Último treino'} · ${haDias(ult.inicio)}` : (cardio ? 'Nenhuma corrida ainda' : 'Ainda não feito');
  const lastVal = ult ? (cardio ? (ult.distancia ? `${fmtNum(ult.distancia)} km` : clock(ult.fim - ult.inicio)) : `${fmtInt(volume(ult))} kg`) : '';
  const list = cardio
    ? f.etapas.map((e) => `<div class="exrow">${thumb(e)}<div style="flex:1;min-width:0"><div class="nm">${esc(e.nome)}</div><div class="sb">${esc(e.detalhe)}</div></div><div class="rt"><div class="num" style="font-size:16px;line-height:24px">${esc(e.valor)}</div><div class="sb">${esc(e.alvo)}</div></div></div>`).join('')
    : f.exercicios.map((e) => `<button class="exrow" data-a="go" data-to="guia/${esc(e.id)}">${thumb(e)}<div style="flex:1;min-width:0"><div class="nm">${esc(e.nome)}</div><div class="sb">${esc(e.grupo)} · ${esc(e.equip)}</div></div><div class="rt"><div class="num" style="font-size:16px;line-height:24px">${esc(valorEx(e))}</div><div class="sb">${esc(cargaEx(e))}</div></div></button>`).join('');
  return `<div class="screen"><div class="scroll" style="padding-bottom:16px">
    <div class="hero">
      <div class="bgshapes" aria-hidden="true">
        <div style="position:absolute;left:96px;top:0;width:10px;height:200px;background:linear-gradient(90deg,#2E3238,#1F2227)"></div>
        <div style="position:absolute;left:0;top:96px;width:260px;height:8px;background:#2E3238"></div>
        <div style="position:absolute;left:28px;top:64px;width:76px;height:76px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#4A5058 0%,#2A2D33 45%,#1A1C20 100%)"></div>
        <div style="position:absolute;left:84px;top:80px;width:56px;height:56px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#3E434A 0%,#24272C 50%,#1A1C20 100%)"></div>
      </div>
      <div class="glow"></div><div class="shade"></div><div class="floor"></div>
      <button class="icon-btn back" data-a="back" aria-label="Voltar">${ic('back')}</button>
      <div class="art">${ill(f.ilustracao, 120)}</div>
      <div class="txt"><div class="eyebrow y">${esc(tag)}</div><h1>${esc(f.nome)}</h1>
        <div class="stats">${stats.map((s) => `<div><div class="v">${esc(s[0])}</div><div class="l">${esc(s[1])}</div></div>`).join('')}</div></div>
    </div>
    <div class="pad">
      <div class="lastbox"><span style="display:flex;align-items:center;gap:8px">${ic('clockI', 16)}${esc(lastTxt)}</span><span class="num" style="font-size:16px;color:var(--ink)">${esc(lastVal)}</span></div>
      <div class="eyebrow" style="margin-top:24px">${cardio ? 'Intensidade' : 'Músculos'}</div><div class="chips">${f.musculos.map((m) => `<span class="chip">${esc(m)}</span>`).join('')}</div>
      <div class="eyebrow" style="margin-top:16px">Equipamentos</div><div class="chips">${f.equipamentos.map((m) => `<span class="chip">${esc(m)}</span>`).join('')}</div>
      <div style="display:flex;align-items:baseline;justify-content:space-between;margin-top:32px"><span class="h2">${cardio ? 'Etapas' : 'Exercícios'}</span><span class="muted" style="font-size:13px">${cardio ? 'Ritmo alvo por km' : `Descanso ${f.descanso}s entre séries`}</span></div>
      <div style="margin-top:8px">${list}</div>
    </div>
  </div>
  <div class="bottombar">
    <button class="btn lg" style="flex:1" data-a="start" data-id="${esc(f.id)}">${cardio ? 'Começar corrida' : 'Começar treino'}</button>
    <button class="icon-btn round" data-a="go" data-to="editar/${esc(f.id)}" aria-label="Editar ficha">${ic('pencil')}</button>
  </div>${vModal()}</div>`;
}

function vEditar(id) {
  const f = ficha(id); if (!f) return vNotFound();
  if (!UI.draft || UI.draft.id !== id) UI.draft = clone(f);
  const d = UI.draft;
  const cardio = d.tipo === 'cardio';
  const tools = (i, n) => `<div class="tools">
      <button data-a="exmove" data-i="${i}" data-d="-1" aria-label="Subir" ${i === 0 ? 'disabled style="opacity:.3"' : ''}>${ic('up', 18)}</button>
      <button data-a="exmove" data-i="${i}" data-d="1" aria-label="Descer" ${i === n - 1 ? 'disabled style="opacity:.3"' : ''}>${ic('down', 18)}</button>
      <button data-a="exdel" data-i="${i}" aria-label="Remover" style="color:var(--danger)">${ic('trash', 18)}</button></div>`;
  const items = cardio
    ? d.etapas.map((e, i) => `<div class="edit-ex">
        <div style="display:flex;gap:8px;align-items:center"><input class="input" data-k="etapas.${i}.nome" value="${esc(e.nome)}" aria-label="Nome da etapa" style="flex:1">${tools(i, d.etapas.length)}</div>
        <input class="input" data-k="etapas.${i}.detalhe" value="${esc(e.detalhe)}" aria-label="Detalhe" placeholder="Detalhe (ex.: Forte · Z4)" style="margin-top:8px">
        <div class="row3" style="grid-template-columns:1fr 1fr"><div><div class="mini">Duração / distância</div><input class="input" data-k="etapas.${i}.valor" value="${esc(e.valor)}"></div><div><div class="mini">Ritmo alvo</div><input class="input" data-k="etapas.${i}.alvo" value="${esc(e.alvo)}"></div></div></div>`).join('')
    : d.exercicios.map((e, i) => `<div class="edit-ex">
        <div style="display:flex;gap:8px;align-items:center"><input class="input" data-k="exercicios.${i}.nome" value="${esc(e.nome)}" aria-label="Nome do exercício" style="flex:1">${tools(i, d.exercicios.length)}</div>
        <div class="row3" style="grid-template-columns:1fr 1fr"><input class="input" data-k="exercicios.${i}.grupo" value="${esc(e.grupo)}" placeholder="Músculo" aria-label="Músculo"><input class="input" data-k="exercicios.${i}.equip" value="${esc(e.equip)}" placeholder="Equipamento" aria-label="Equipamento"></div>
        <div class="row3"><div><div class="mini">Séries</div><input class="input num" inputmode="numeric" data-k="exercicios.${i}.series" data-n="1" value="${esc(e.series)}"></div>
        <div><div class="mini">${e.unidade === 's' ? 'Segundos' : 'Reps'}</div><input class="input num" inputmode="numeric" data-k="exercicios.${i}.reps" data-n="1" value="${esc(e.reps)}"></div>
        <div><div class="mini">Kg</div><input class="input num" inputmode="decimal" data-k="exercicios.${i}.kg" data-n="1" value="${esc(e.kg)}"></div></div></div>`).join('');
  return `<div class="screen"><div class="scroll"><div class="pad" style="padding-top:calc(16px + var(--safe-t));padding-bottom:24px">
    <div style="display:flex;align-items:center;gap:12px"><button class="icon-btn" data-a="canceledit" aria-label="Cancelar">${ic('close')}</button><div class="h2" style="flex:1">Editar ficha</div></div>
    <div class="field"><label for="f-nome">Nome</label><input id="f-nome" class="input" data-k="nome" value="${esc(d.nome)}"></div>
    ${cardio ? `<div class="row3" style="grid-template-columns:1fr 1fr;display:grid;gap:8px"><div class="field"><label>Distância (km)</label><input class="input num" inputmode="decimal" data-k="distanciaAlvo" data-n="1" value="${esc(d.distanciaAlvo)}"></div><div class="field"><label>Ritmo alvo</label><input class="input num" data-k="ritmoAlvo" value="${esc(d.ritmoAlvo)}"></div></div>`
    : `<div class="field"><label>Descanso entre séries</label><div class="stepper"><button data-a="rest" data-d="-15" aria-label="Menos 15 segundos">−</button><span class="num" style="min-width:72px;text-align:center;font-size:20px" id="restv">${d.descanso}s</span><button data-a="rest" data-d="15" aria-label="Mais 15 segundos">+</button></div></div>`}
    <div class="field"><label>Duração estimada (min)</label><input class="input num" inputmode="numeric" data-k="minutos" data-n="1" value="${esc(d.minutos)}" style="max-width:120px"></div>
    <div class="field"><label>${cardio ? 'Intensidade' : 'Músculos'} (separe por vírgula)</label><input class="input" data-k="musculos" data-list="1" value="${esc(d.musculos.join(', '))}"></div>
    <div class="field"><label>Equipamentos (separe por vírgula)</label><input class="input" data-k="equipamentos" data-list="1" value="${esc(d.equipamentos.join(', '))}"></div>
    <div class="h2" style="margin-top:28px">${cardio ? 'Etapas' : 'Exercícios'}</div>
    ${items}
    <button class="btn ghost" style="margin-top:12px;height:48px;border-style:dashed" data-a="exadd">${ic('plus', 18)}${cardio ? 'Adicionar etapa' : 'Adicionar exercício'}</button>
    <button class="btn danger" style="margin-top:24px;height:48px;font-size:14px" data-a="resetficha">Restaurar esta ficha ao padrão</button>
  </div></div>
  <div class="bottombar"><button class="btn lg" data-a="saveedit">Salvar alterações</button></div>${vModal()}</div>`;
}

function vTreino() {
  const a = S.ativa;
  if (!a) return `<div class="screen"><div class="empty" style="margin-top:30vh">Nenhum treino em andamento.<br><br><button class="btn" data-a="go" data-to="home">Ir para treinos</button></div></div>`;
  if (a.tipo === 'cardio') return vCorrida();
  if (S.descanso) return vDescanso();
  const n = a.exercicios.length;
  const e = a.exercicios[a.atual];
  const segs = a.exercicios.map((x, i) => {
    const done = x.series.length && x.series.every((s) => s.feita);
    return `<button class="${done ? 'done' : ''}${i === a.atual ? ' cur' : ''}" data-a="exgo" data-i="${i}" aria-label="Exercício ${i + 1}: ${esc(x.nome)}"></button>`;
  }).join('');
  let card = '';
  if (!e) {
    card = `<div class="card excard"><div class="empty">Treino livre: adicione o primeiro exercício.</div></div>`;
  } else {
    const hist = historicoEx(e.exId)[0];
    const pr = historicoEx(e.exId).reduce((m, h) => Math.max(m, h.kg), 0);
    const curIdx = e.series.findIndex((s) => !s.feita);
    const rows = e.series.map((s, i) => {
      const ant = hist && hist.series[i] ? `${fmtNum(hist.series[i].kg)} × ${repsTxt(e, hist.series[i].reps)}` : '—';
      return `<div class="setgrid setrow${s.feita ? ' done' : ''}${i === curIdx ? ' cur' : ''}">
        <span class="sn" style="font-weight:600">${i + 1}</span><span class="muted" style="font-size:13px">${esc(ant)}</span>
        <label><span class="sr">Carga série ${i + 1}</span><input data-set="${i}" data-f="kg" inputmode="decimal" value="${esc(fmtNum(s.kg))}"></label>
        <label><span class="sr">${e.unidade === 's' ? 'Segundos' : 'Reps'} série ${i + 1}</span><input data-set="${i}" data-f="reps" inputmode="numeric" value="${esc(s.reps)}"></label>
        <button class="check${s.feita ? ' on' : ''}" data-a="setcheck" data-i="${i}" aria-pressed="${s.feita}" aria-label="${s.feita ? 'Desmarcar' : 'Concluir'} série ${i + 1}">${ic('check', 22, s.feita ? 3 : 2.25)}</button></div>`;
    }).join('');
    const guia = GUIAS[e.exId];
    const prox = a.exercicios[a.atual + 1];
    card = `<div class="card excard">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
        <div style="min-width:0"><div class="eyebrow y">Exercício ${a.atual + 1} de ${n}</div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:4px"><h1 style="margin:0;font-family:var(--display);font-size:24px;line-height:30px">${esc(e.nome)}</h1>
          ${guia ? `<button class="qbtn" data-a="go" data-to="guia/${esc(e.exId)}" aria-label="Como fazer ${esc(e.nome)}">?</button>` : ''}</div>
          <div class="muted" style="font-size:13px;margin-top:2px">${esc(e.equip || '')}${e.descanso ? ` · descanso ${e.descanso}s` : ''}</div></div>
        ${pr ? `<span class="badge" style="flex:none">PR ${fmtNum(pr)} kg</span>` : ''}
      </div>
      <div class="setgrid sethead"><span>Série</span><span>Anterior</span><span>Kg</span><span>${e.unidade === 's' ? 'Seg' : 'Reps'}</span><span style="text-align:center">Feito</span></div>
      ${rows}
      <button class="pill" style="align-self:flex-start;border-style:dashed" data-a="setadd">${ic('plus', 16)}Adicionar série</button>
      <div class="muted" style="font-size:12px;display:flex;align-items:center;gap:6px">${ic('check', 14)}Toque no ✓ ao terminar a série. O descanso começa sozinho.</div>
      ${prox ? `<div class="muted" style="font-size:13px">A seguir: ${esc(prox.nome)}</div>` : ''}
    </div>`;
  }
  return `<div class="screen"><div class="scroll" style="padding-bottom:16px">
    <div class="sess-top"><button class="icon-btn" data-a="minimizar" aria-label="Minimizar treino">${ic('minimize')}</button>
      <span class="muted" style="font-size:14px;font-weight:600;text-align:center;flex:1">${esc(nomeSessao(a))}</span>
      <button class="finish" data-a="finalizar">Finalizar</button></div>
    <div style="padding:20px 16px 8px;display:flex;align-items:flex-end;justify-content:space-between">
      <div><div class="clock" data-live="clock">${clock(Date.now() - a.inicio)}</div><div class="muted" style="font-size:13px;margin-top:4px">Duração</div></div>
      <div style="display:flex;gap:20px;padding-bottom:20px">
        <div><div class="num" style="font-size:22px" data-live="vol">${fmtInt(volume(a))}</div><div class="muted" style="font-size:12px">kg volume</div></div>
        <div><div class="num" style="font-size:22px"><span data-live="sets">${seriesFeitas(a)}</span><span class="muted">/${seriesTotal(a)}</span></div><div class="muted" style="font-size:12px">séries</div></div>
      </div></div>
    <div class="segs">${segs}</div>
    ${card}
    <div class="exnav">
      <button class="btn ghost" data-a="exstep" data-d="-1" ${a.atual <= 0 ? 'disabled' : ''}>${ic('back', 18)}Anterior</button>
      <button class="btn ghost" data-a="exstep" data-d="1" ${a.atual >= n - 1 ? 'disabled' : ''}>Próximo${ic('chev', 18)}</button>
    </div>
    <div class="pad"><button class="btn ghost" style="height:48px;font-size:14px;border-style:dashed" data-a="addexsess">${ic('plus', 16)}Adicionar exercício ao treino</button></div>
  </div>${vModal()}${vAddEx()}</div>`;
}

function vDescanso() {
  const a = S.ativa, r = S.descanso;
  const e = a.exercicios[r.exIdx];
  const prox = proximaSerie();
  const left = r.fim - Date.now();
  const C = 2 * Math.PI * 138;
  const frac = Math.max(0, Math.min(1, left / (r.total * 1000)));
  return `<div class="screen"><div class="rest">
    <div style="align-self:stretch;display:flex;justify-content:space-between;align-items:center">
      <span class="muted" style="font-size:14px;font-weight:600">${esc(a.letra ? 'Treino ' + a.letra : a.nome)} · <span data-live="clock">${clock(Date.now() - a.inicio)}</span></span>
      <span class="badge" style="color:var(--primary-text)">Série ${r.setIdx + 1} feita</span></div>
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px">
      <div style="font-size:13px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--info)">Descanso</div>
      <div class="muted" style="font-size:13px;text-align:center">${esc(e ? e.nome : '')}</div>
      <div class="ring" role="timer" aria-live="off">
        <svg viewBox="0 0 300 300" aria-hidden="true"><circle cx="150" cy="150" r="138" fill="none" stroke="#2E3238" stroke-width="12"/>
        <circle data-live="ring" cx="150" cy="150" r="138" fill="none" stroke="#6CB2FF" stroke-width="12" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - frac)}"/></svg>
        <div class="t" data-live="rest">${clock(left + 999)}</div></div>
      <div style="display:flex;gap:16px;margin-top:8px"><button class="pill" style="height:48px;padding:0 24px" data-a="restadj" data-d="-15">−15s</button><button class="pill" style="height:48px;padding:0 24px" data-a="restadj" data-d="15">+15s</button></div>
    </div>
    ${prox ? `<div class="card" style="align-self:stretch;padding:16px;display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <div><div class="eyebrow">Próxima · série ${prox.s + 1}</div><div style="margin-top:4px;font-weight:600">${esc(prox.e.nome)}</div></div>
      <div class="num" style="font-size:24px">${fmtNum(prox.set.kg)}<span class="muted" style="font-size:14px;font-weight:500"> kg</span> × ${esc(repsTxt(prox.e, prox.set.reps))}</div></div>` : ''}
    <button class="btn lg" style="align-self:stretch" data-a="restskip">Pular descanso</button>
  </div></div>`;
}

function vCorrida() {
  const a = S.ativa;
  const i = a.etapas.findIndex((x) => !x.feita);
  const list = a.etapas.map((e, k) => `<div class="exrow" style="${k === i ? 'background:var(--primary-soft);border-radius:16px;padding:12px;border-bottom:0;margin:4px 0' : ''}">
    ${thumb(e)}<div style="flex:1;min-width:0"><div class="nm" style="${e.feita ? 'text-decoration:line-through;color:var(--muted)' : ''}">${esc(e.nome)}</div><div class="sb">${esc(e.detalhe)}</div></div>
    <div class="rt"><div class="num" style="font-size:16px">${esc(e.valor)}</div><div class="sb">${esc(e.alvo)}</div></div>
    ${e.feita ? `<span class="check on" style="width:32px;height:32px;border-radius:10px">${ic('check', 16, 2.5)}</span>` : ''}</div>`).join('');
  return `<div class="screen"><div class="scroll" style="padding-bottom:16px">
    <div class="sess-top"><button class="icon-btn" data-a="minimizar" aria-label="Minimizar corrida">${ic('minimize')}</button>
      <span class="muted" style="font-size:14px;font-weight:600">${esc(a.nome)} · ${esc(a.subtitulo || '')}</span>
      <button class="finish" data-a="finalizar">Finalizar</button></div>
    <div style="padding:24px 16px 8px"><div class="clock" style="font-size:72px;line-height:72px" data-live="clock">${clock(Date.now() - a.inicio)}</div><div class="muted" style="font-size:13px;margin-top:4px">Tempo total</div></div>
    <div class="segs">${a.etapas.map((e, k) => `<button class="${e.feita ? 'done' : ''}${k === i ? ' cur' : ''}" tabindex="-1" aria-hidden="true"></button>`).join('')}</div>
    <div class="pad">${list}</div>
  </div>
  <div class="bottombar">${i >= 0 ? `<button class="btn lg" data-a="etapa">Concluir: ${esc(a.etapas[i].nome)}</button>` : `<button class="btn lg" data-a="finalizar">Finalizar corrida</button>`}</div>
  ${vModal()}</div>`;
}

function vResumo(sid) {
  const ativa = sid === 'ativa';
  const s = ativa ? S.ativa : S.sessoes.find((x) => x.id === sid);
  if (!s) return vNotFound();
  const fim = s.fim || Date.now();
  const dur = fim - s.inicio;
  const d = new Date(s.inicio);
  const head = `${ativa ? 'Treino concluído' : diaLabel(s.inicio)} · ${DIAS_C[d.getDay()]}, ${d.getDate()} ${MESES[d.getMonth()]}`;
  let body;
  if (s.tipo === 'cardio') {
    body = `<div class="kpis" style="margin-top:20px">
        <div class="kpi"><div class="v">${clock(dur)}</div><div class="l">tempo</div></div>
        <div class="kpi"><div class="v">${s.distancia ? fmtNum(s.distancia) : '—'}</div><div class="l">km</div></div>
        <div class="kpi"><div class="v">${s.distancia ? pace(dur, s.distancia) : '—'}</div><div class="l">ritmo /km</div></div></div>
      ${ativa ? `<div class="field"><label for="dist">Distância percorrida (km)</label><input id="dist" class="input num" inputmode="decimal" data-a-input="dist" value="${s.distancia ? esc(fmtNum(s.distancia)) : ''}" placeholder="Ex.: 5,2"></div>
        <p class="muted" style="font-size:12px">Veja a distância no seu relógio e digite aqui para calcular o ritmo.</p>` : ''}
      <div class="h2" style="margin-top:24px">Etapas</div>
      ${s.etapas.map((e) => `<div class="hrow"><span style="flex:1">${esc(e.nome)}</span><span class="${e.feita ? '' : 'muted'}">${e.feita ? 'Feita' : 'Pulada'}</span></div>`).join('')}`;
  } else {
    const prs = ativa ? recordes(s) : (s.prs || []);
    const exs = s.exercicios.filter((e) => e.series.some((x) => x.feita));
    body = `<div class="kpis" style="margin-top:20px;grid-template-columns:repeat(2,1fr)">
        <div class="kpi"><div class="v">${clock(dur)}</div><div class="l">duração</div></div>
        <div class="kpi"><div class="v">${fmtInt(volume(s))}</div><div class="l">kg de volume</div></div>
        <div class="kpi"><div class="v">${seriesFeitas(s)}</div><div class="l">séries</div></div>
        <div class="kpi"><div class="v">${prs.length}</div><div class="l">recordes</div></div></div>
      ${prs.map((p) => `<div class="pr" style="margin-top:12px"><span style="color:var(--primary);flex:none">${ic('trophy', 28)}</span><div><div style="font-weight:600">Novo recorde: ${fmtNum(p.kg)} kg no ${esc(p.nome.toLowerCase())}</div><div class="muted" style="font-size:13px;margin-top:2px">+${fmtNum(p.ganho)} kg sobre o seu melhor anterior</div></div></div>`).join('')}
      <div class="h2" style="margin-top:24px">Exercícios</div>
      ${exs.length ? exs.map((e) => {
        const f = e.series.filter((x) => x.feita); const top = Math.max(...f.map((x) => x.kg || 0));
        return `<button class="hrow" data-a="go" data-to="evolucao/${esc(e.exId)}"><span style="flex:1;min-width:0">${esc(e.nome)}</span><span class="num">${f.length} ${f.length > 1 ? 'séries' : 'série'} · ${e.unidade === 's' ? Math.max(...f.map((x) => x.reps)) + ' s' : (top ? 'até ' + fmtNum(top) + ' kg' : f[0].reps + ' reps')}</span>${ic('chev', 18, 2, 'style="color:var(--muted)"')}</button>`;
      }).join('') : '<div class="empty">Nenhuma série marcada como feita.</div>'}`;
  }
  const canSave = s.tipo === 'cardio' ? true : seriesFeitas(s) > 0;
  const actions = ativa
    ? `<div class="bottombar" style="flex-direction:column"><button class="btn lg" data-a="salvar" ${canSave ? '' : 'disabled'}>Salvar no histórico</button>
       <div style="display:flex;gap:8px;width:100%"><button class="btn ghost" style="height:48px;font-size:14px" data-a="go" data-to="treino">Voltar ao treino</button><button class="btn danger" style="height:48px;font-size:14px" data-a="descartar">Descartar</button></div></div>`
    : `<div class="bottombar"><button class="btn danger" style="height:48px;font-size:14px" data-a="apagarsessao" data-id="${esc(s.id)}">Apagar do histórico</button></div>`;
  return `<div class="screen"><div class="scroll"><div class="pad" style="padding-top:calc(16px + var(--safe-t));padding-bottom:24px">
    ${ativa ? '' : `<button class="icon-btn" data-a="back" aria-label="Voltar" style="margin-bottom:12px">${ic('back')}</button>`}
    <div class="eyebrow y">${esc(head)}</div>
    <h1 class="h1" style="font-size:40px;line-height:48px">${esc(nomeSessao(s))}</h1>
    ${body}
  </div></div>${actions}${vModal()}</div>`;
}

function vHistorico() {
  const now = Date.now();
  const mes = new Date(); mes.setDate(1); mes.setHours(0, 0, 0, 0);
  const noMes = S.sessoes.filter((s) => s.inicio >= mes.getTime()).length;
  let streak = 0; let w = startOfWeek(now);
  const semanas = new Set(S.sessoes.map((s) => startOfWeek(s.inicio)));
  if (!semanas.has(w)) w -= 7 * DAY;
  while (semanas.has(w)) { streak++; w -= 7 * DAY; }
  const prs = S.sessoes.reduce((a, s) => a + (s.prs ? s.prs.length : 0), 0);
  const ws = startOfWeek(now);
  const vols = Array.from({ length: 8 }, (_, i) => {
    const a = ws - (7 - i) * 7 * DAY; const b = a + 7 * DAY;
    return S.sessoes.filter((s) => s.inicio >= a && s.inicio < b).reduce((t, s) => t + volume(s), 0);
  });
  const max = Math.max(1, ...vols);
  const bars = vols.map((v, i) => `<i class="${i === 7 ? 'cur' : ''}" style="height:${Math.max(4, (v / max) * 100)}%" title="${fmtInt(v)} kg"></i>`).join('');
  const list = S.sessoes.length ? S.sessoes.map((s) => {
    const dur = s.fim - s.inicio;
    const det = s.tipo === 'cardio' ? `${minutos(dur)} min${s.distancia ? ` · ${fmtNum(s.distancia)} km · ${pace(dur, s.distancia)} /km` : ''}` : `${minutos(dur)} min · ${fmtInt(volume(s))} kg`;
    return `<button class="hrow" data-a="go" data-to="sessao/${esc(s.id)}">
      <div class="thumb" style="width:52px;height:52px;border-radius:14px">${ill(ficha(s.fichaId) ? ficha(s.fichaId).ilustracao : (s.ilustracao || 'peito'), 44)}</div>
      <div style="flex:1;min-width:0"><div class="muted" style="font-size:12px">${esc(diaLabel(s.inicio))}</div><div style="font-weight:600">${esc(nomeSessao(s))}</div><div class="muted" style="font-size:13px">${esc(det)}</div></div>
      ${s.prs && s.prs.length ? `<span class="badge" style="flex:none">${s.prs.length} PR${s.prs.length > 1 ? 's' : ''}</span>` : ''}</button>`;
  }).join('') : '<div class="empty">Seus treinos salvos aparecem aqui.<br>Comece um treino na aba Treinos.</div>';
  return `<div class="screen"><div class="scroll"><div class="pad" style="padding-top:calc(24px + var(--safe-t));padding-bottom:24px">
    <div class="h1">Histórico</div>
    <div class="kpis" style="margin-top:16px">
      <div class="kpi"><div class="v">${noMes}</div><div class="l">treinos no mês</div></div>
      <div class="kpi"><div class="v">${streak}</div><div class="l">semanas seguidas</div></div>
      <div class="kpi"><div class="v">${prs}</div><div class="l">recordes</div></div></div>
    <div class="card" style="padding:16px;margin-top:16px"><div style="display:flex;justify-content:space-between"><span style="font-weight:600">Volume semanal</span><span class="muted" style="font-size:13px">8 semanas</span></div>
      <div class="bars" role="img" aria-label="Volume das últimas 8 semanas; esta semana: ${fmtInt(vols[7])} kg">${bars}</div></div>
    <div style="margin-top:16px">${list}</div>
  </div></div>${nav('historico')}</div>`;
}

function vEvolucao(exId) {
  const all = historicoEx(exId);
  const nome = (S.fichas.flatMap((f) => f.exercicios || []).find((e) => e.id === exId) || {}).nome
    || (S.sessoes.flatMap((s) => s.exercicios || []).find((e) => e.exId === exId) || {}).nome || 'Exercício';
  const desde = Date.now() - UI.evoPeriodo * DAY;
  const pts = all.filter((h) => h.t >= desde).slice().reverse();
  const best = all.reduce((m, h) => Math.max(m, h.kg), 0);
  const delta = pts.length > 1 ? pts[pts.length - 1].kg - pts[0].kg : 0;
  const per = { 30: '1 mês', 90: '3 meses', 365: '1 ano' };
  let chart = '<div class="empty">Faça este exercício em mais de um treino para ver a curva.</div>';
  if (pts.length > 1) {
    const W = 340, H = 160, P = 12;
    const ks = pts.map((p) => p.kg); const lo = Math.min(...ks), hi = Math.max(...ks); const span = hi - lo || 1;
    const t0 = pts[0].t, t1 = pts[pts.length - 1].t || t0 + 1;
    const xy = pts.map((p) => [P + ((p.t - t0) / ((t1 - t0) || 1)) * (W - 2 * P), H - P - ((p.kg - lo) / span) * (H - 2 * P)]);
    const d = xy.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' ');
    chart = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Carga máxima por treino: de ${fmtNum(pts[0].kg)} a ${fmtNum(pts[pts.length - 1].kg)} kg">
      <path d="${d} L${xy[xy.length - 1][0]},${H} L${xy[0][0]},${H} Z" fill="rgba(255,184,28,.12)"/>
      <path d="${d}" fill="none" stroke="#FFB81C" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
      ${xy.map((q) => `<circle cx="${q[0]}" cy="${q[1]}" r="4" fill="#1A1C20" stroke="#FFB81C" stroke-width="2"/>`).join('')}</svg>`;
  }
  return `<div class="screen"><div class="scroll"><div class="pad" style="padding-top:calc(16px + var(--safe-t));padding-bottom:24px">
    <button class="icon-btn" data-a="back" aria-label="Voltar">${ic('back')}</button>
    <div class="eyebrow" style="margin-top:16px">Evolução</div><h1 class="h1">${esc(nome)}</h1>
    <div style="display:flex;align-items:baseline;gap:8px;margin-top:8px"><span class="num" style="font-size:56px;line-height:60px">${best ? fmtNum(best) : '—'}</span><span class="muted" style="font-size:18px">kg</span></div>
    <div style="color:var(--primary-text);font-size:14px;font-weight:600">${all.length ? `Recorde${delta ? ` · ${delta > 0 ? '+' : ''}${fmtNum(delta)} kg em ${per[UI.evoPeriodo]}` : ''}` : 'Sem registros ainda'}</div>
    <div class="seg-ctl" style="margin-top:20px">${[30, 90, 365].map((p) => `<button data-a="evoper" data-p="${p}" aria-pressed="${UI.evoPeriodo === p}">${per[p]}</button>`).join('')}</div>
    <div class="card" style="padding:12px;margin-top:16px">${chart}</div>
    <div class="h2" style="margin-top:24px">Últimas sessões</div>
    ${all.length ? all.slice(0, 12).map((h) => `<div class="hrow"><span style="flex:1">${esc(diaLabel(h.t))}</span><span class="num">${fmtNum(h.kg)} kg × ${esc(h.unidade === 's' ? h.reps + ' s' : h.reps)}</span></div>`).join('') : '<div class="empty">Nenhuma sessão registrada.</div>'}
    ${GUIAS[exId] ? `<button class="btn ghost" style="margin-top:20px;height:48px;font-size:14px" data-a="go" data-to="guia/${esc(exId)}">Como fazer</button>` : ''}
  </div></div></div>`;
}

function vGuia(exId) {
  const ex = S.fichas.flatMap((f) => (f.exercicios || []).map((e) => ({ ...e, ficha: f }))).find((e) => e.id === exId);
  const g = GUIAS[exId];
  if (!ex && !g) return vNotFound();
  const nome = ex ? ex.nome : exId;
  return `<div class="screen"><div class="scroll"><div class="pad" style="padding-top:calc(16px + var(--safe-t));padding-bottom:24px">
    <div style="display:flex;justify-content:space-between;align-items:center"><span class="muted" style="font-size:14px;font-weight:600">${ex ? esc(tituloFicha(ex.ficha)) : ''}</span><button class="icon-btn" data-a="back" aria-label="Fechar">${ic('close')}</button></div>
    ${ex && ex.img ? `<div style="display:flex;justify-content:center;margin:16px 0 8px;padding:16px;border-radius:24px;background:radial-gradient(ellipse at 50% 70%,rgba(255,184,28,.25),rgba(255,184,28,0) 70%)"><img src="img/ex-${esc(ex.img)}.png" alt="" width="180" height="180" style="width:180px;height:180px;object-fit:contain"></div>` : '<div style="height:16px"></div>'}
    <h1 class="h1">${esc(nome)}</h1>
    ${ex ? `<div class="muted" style="font-size:14px;margin-top:4px">${esc(ex.equip)} · ${esc(valorEx(ex))} · ${ex.ficha.descanso}s de descanso</div><div class="chips"><span class="chip">${esc(ex.grupo)}</span></div>` : ''}
    ${g ? `${g.dica ? `<div class="note" style="margin-top:16px"><b style="color:var(--primary-text)">Dica:</b> ${esc(g.dica)}</div>` : ''}
      <div class="h2" style="margin-top:24px">Como fazer</div>
      <ol class="steps" style="padding-left:20px;margin:12px 0 0">${g.passos.map((p) => `<li>${esc(p)}</li>`).join('')}</ol>
      ${g.erro ? `<div class="note" style="border-color:rgba(255,107,111,.4)"><b style="color:var(--danger)">Erro comum:</b> ${esc(g.erro)}</div>` : ''}`
    : '<div class="empty">Ainda não há instruções para este exercício.</div>'}
    <div style="display:flex;gap:8px;margin-top:24px"><button class="btn ghost" data-a="go" data-to="evolucao/${esc(exId)}">Ver evolução</button><button class="btn" data-a="back">Entendi</button></div>
  </div></div></div>`;
}

function vModal() {
  const m = UI.modal; if (!m) return '';
  return `<div class="overlay" style="justify-content:center"><button class="backdrop" data-a="modalno" aria-label="Fechar"></button>
    <div class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="mt"><div id="mt" class="h2">${esc(m.title)}</div>
    ${m.text ? `<p class="muted" style="font-size:14px;line-height:21px;margin:8px 0 0">${esc(m.text)}</p>` : ''}
    <div style="display:flex;gap:8px;margin-top:20px"><button class="btn ghost" style="height:48px;font-size:15px" data-a="modalno">${esc(m.no || 'Cancelar')}</button>
    <button class="btn${m.danger ? ' danger' : ''}" style="height:48px;font-size:15px" data-a="modalok">${esc(m.ok || 'Confirmar')}</button></div></div></div>`;
}
function vAddEx() {
  if (!UI.addEx) return '';
  const nomes = [...new Map(S.fichas.flatMap((f) => (f.exercicios || []).map((e) => [e.nome, e]))).values()];
  return `<div class="overlay" style="justify-content:center"><button class="backdrop" data-a="addexno" aria-label="Fechar"></button>
    <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="ae"><div id="ae" class="h2">Adicionar exercício</div>
    <div class="field"><label for="ae-n">Nome</label><input id="ae-n" class="input" list="ae-list" placeholder="Ex.: Supino reto" autocomplete="off">
    <datalist id="ae-list">${nomes.map((e) => `<option value="${esc(e.nome)}">`).join('')}</datalist></div>
    <div class="row3" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:8px">
      <div class="field" style="margin-top:8px"><label for="ae-s">Séries</label><input id="ae-s" class="input num" inputmode="numeric" value="3"></div>
      <div class="field" style="margin-top:8px"><label for="ae-r">Reps</label><input id="ae-r" class="input num" inputmode="numeric" value="12"></div>
      <div class="field" style="margin-top:8px"><label for="ae-k">Kg</label><input id="ae-k" class="input num" inputmode="decimal" value="0"></div></div>
    <div style="display:flex;gap:8px;margin-top:20px"><button class="btn ghost" style="height:48px" data-a="addexno">Cancelar</button><button class="btn" style="height:48px" data-a="addexok">Adicionar</button></div></div></div>`;
}
const vNotFound = () => `<div class="screen"><div class="empty" style="margin-top:30vh">Não encontrei essa tela.<br><br><button class="btn" data-a="go" data-to="home">Voltar ao início</button></div></div>`;

/* ---------- render ---------- */
function render() {
  const r = route();
  let html;
  switch (r.name) {
    case 'home': html = vHome(); break;
    case 'fichas': html = vFichas(); break;
    case 'ficha': html = vDetalhe(r.id); break;
    case 'editar': html = vEditar(r.id); break;
    case 'treino': html = vTreino(); break;
    case 'resumo': html = vResumo('ativa'); break;
    case 'sessao': html = vResumo(r.id); break;
    case 'historico': html = vHistorico(); break;
    case 'evolucao': html = vEvolucao(r.id); break;
    case 'guia': html = vGuia(r.id); break;
    default: html = vNotFound();
  }
  if (r.name !== 'editar') UI.draft = null;
  const sc = $app.querySelector('.scroll'); const keep = sc && UI.lastRoute === location.hash ? sc.scrollTop : 0;
  $app.innerHTML = html + (UI.toast ? `<div class="toast" role="status">${esc(UI.toast)}</div>` : '') +
    (!storageOk ? '<div class="toast" role="alert" style="border-color:var(--danger)">Não consegui salvar neste navegador. Seus dados podem se perder.</div>' : '');
  const sc2 = $app.querySelector('.scroll'); if (sc2 && keep) sc2.scrollTop = keep;
  UI.lastRoute = location.hash;
}
function toast(msg) { UI.toast = msg; render(); clearTimeout(UI.tt); UI.tt = setTimeout(() => { UI.toast = null; render(); }, 2600); }
function confirmar(opts) { UI.modal = opts; render(); }

/* ---------- ações do treino ---------- */
function novaSessaoForca(f) {
  return {
    id: uid(), fichaId: f ? f.id : null, nome: f ? f.nome : 'Treino livre', letra: f ? f.letra : '', ilustracao: f ? f.ilustracao : 'peito', tipo: 'forca',
    inicio: Date.now(), fim: null, atual: 0,
    exercicios: f ? f.exercicios.map((e) => exParaSessao(e, f.descanso)) : []
  };
}
function exParaSessao(e, descanso) {
  const h = historicoEx(e.id)[0];
  const n = Math.max(1, Number(e.series) || 1);
  return {
    exId: e.id, nome: e.nome, grupo: e.grupo, equip: e.equip, img: e.img, unidade: e.unidade, descanso: descanso,
    series: Array.from({ length: n }, (_, i) => {
      const prev = h && (h.series[i] || h.series[h.series.length - 1]);
      return { kg: prev ? prev.kg : Number(e.kg) || 0, reps: prev ? prev.reps : Number(e.reps) || 0, feita: false };
    })
  };
}
function comecar(id) {
  const f = ficha(id);
  const run = () => {
    if (f && f.tipo === 'cardio') {
      S.ativa = { id: uid(), fichaId: f.id, nome: f.nome, subtitulo: f.subtitulo, letra: '', ilustracao: f.ilustracao, tipo: 'cardio', inicio: Date.now(), fim: null, distancia: null, etapas: f.etapas.map((e) => ({ ...e, feita: false })) };
    } else S.ativa = novaSessaoForca(f);
    S.descanso = null; save(); UI.sheet = null; go('treino');
  };
  if (S.ativa) {
    confirmar({ title: 'Já tem um treino em andamento', text: `Descartar "${nomeSessao(S.ativa)}" e começar ${f ? f.nome : 'um treino livre'}?`, ok: 'Descartar e começar', danger: true, onOk: run });
  } else run();
}
function proximaSerie() {
  const a = S.ativa; if (!a || a.tipo !== 'forca') return null;
  for (let k = 0; k < a.exercicios.length; k++) {
    const ei = (a.atual + k) % a.exercicios.length; const e = a.exercicios[ei];
    const s = e.series.findIndex((x) => !x.feita);
    if (s >= 0) return { ei, e, s, set: e.series[s] };
  }
  return null;
}
function iniciarDescanso(exIdx, setIdx, segundos) {
  if (!segundos) return;
  S.descanso = { fim: Date.now() + segundos * 1000, total: segundos, exIdx, setIdx, avisado: false };
  if ('Notification' in window && Notification.permission === 'default' && !S.avisouNotif) {
    S.avisouNotif = true;
    try { Notification.requestPermission(); } catch (e) { /* ignora */ }
  }
  save();
}
function fimDescanso(auto) {
  S.descanso = null;
  const p = proximaSerie();
  if (p) S.ativa.atual = p.ei;
  save(); render();
  if (auto) avisar();
}
let audioCtx = null;
function avisar() {
  try { if (navigator.vibrate) navigator.vibrate([300, 150, 300, 150, 300]); } catch (e) { /* ignora */ }
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.25, 0.5].forEach((t) => {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.frequency.value = 880; g.gain.setValueAtTime(0.0001, audioCtx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.25, audioCtx.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + t + 0.18);
      o.connect(g).connect(audioCtx.destination); o.start(audioCtx.currentTime + t); o.stop(audioCtx.currentTime + t + 0.2);
    });
  } catch (e) { /* sem áudio */ }
  if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
    const opts = { body: 'Hora da próxima série.', icon: 'img/icon-192.png', tag: 'forja-descanso', vibrate: [300, 150, 300] };
    if (navigator.serviceWorker && navigator.serviceWorker.ready) navigator.serviceWorker.ready.then((r) => r.showNotification('Descanso acabou', opts)).catch(() => { try { new Notification('Descanso acabou', opts); } catch (e) { /* ignora */ } });
    else { try { new Notification('Descanso acabou', opts); } catch (e) { /* ignora */ } }
  }
}

/* ---------- eventos ---------- */
document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-a]'); if (!el || el.disabled) return;
  const a = el.dataset.a;
  const A = S.ativa;
  switch (a) {
    case 'go': UI.sheet = null; go(el.dataset.to); break;
    case 'back': back(route().name === 'ficha' ? 'home' : route().name === 'sessao' ? 'historico' : 'home'); break;
    case 'sheet': UI.sheet = el.dataset.id; render(); setTimeout(() => { const b = $app.querySelector('.sheet [data-a="start"]'); if (b) b.focus({ preventScroll: true }); }, 30); break;
    case 'closesheet': UI.sheet = null; render(); break;
    case 'start': comecar(el.dataset.id); break;
    case 'livre': comecar(null); break;
    case 'meta': S.meta = Math.min(7, Math.max(1, S.meta + Number(el.dataset.d))); save(); render(); break;
    case 'restaurar': confirmar({ title: 'Restaurar fichas padrão?', text: 'Suas edições nas fichas serão substituídas. O histórico não é apagado.', ok: 'Restaurar', danger: true, onOk: () => { S.fichas = clone(SEED.fichas); save(); toast('Fichas restauradas.'); } }); break;
    case 'modalno': UI.modal = null; render(); break;
    case 'modalok': { const m = UI.modal; UI.modal = null; if (m && m.onOk) m.onOk(); render(); break; }

    /* editar */
    case 'canceledit': { const id = route().id; UI.draft = null; go('ficha/' + id, true); break; }
    case 'rest': UI.draft.descanso = Math.min(300, Math.max(0, UI.draft.descanso + Number(el.dataset.d))); document.getElementById('restv').textContent = UI.draft.descanso + 's'; break;
    case 'exmove': { const k = UI.draft.tipo === 'cardio' ? 'etapas' : 'exercicios'; const arr = UI.draft[k]; const i = Number(el.dataset.i), j = i + Number(el.dataset.d); if (j < 0 || j >= arr.length) break; [arr[i], arr[j]] = [arr[j], arr[i]]; render(); break; }
    case 'exdel': { const k = UI.draft.tipo === 'cardio' ? 'etapas' : 'exercicios'; UI.draft[k].splice(Number(el.dataset.i), 1); render(); break; }
    case 'exadd': {
      if (UI.draft.tipo === 'cardio') UI.draft.etapas.push({ id: uid(), nome: 'Nova etapa', detalhe: '', valor: '', alvo: '—', icone: 'corrida' });
      else UI.draft.exercicios.push({ id: 'ex-' + uid(), nome: 'Novo exercício', grupo: '', equip: '', series: 3, reps: 12, kg: 0 });
      render(); const ins = $app.querySelectorAll('.edit-ex'); const last = ins[ins.length - 1]; if (last) { last.scrollIntoView({ block: 'center' }); const i = last.querySelector('input'); if (i) { i.focus(); i.select(); } }
      break;
    }
    case 'resetficha': { const id = route().id; const base = SEED.fichas.find((f) => f.id === id); if (!base) { toast('Essa ficha não tem versão padrão.'); break; } confirmar({ title: 'Restaurar esta ficha?', text: 'As suas alterações nesta ficha serão perdidas.', ok: 'Restaurar', danger: true, onOk: () => { UI.draft = clone(base); } }); break; }
    case 'saveedit': {
      const d = UI.draft; const k = d.tipo === 'cardio' ? 'etapas' : 'exercicios';
      d.nome = (d.nome || '').trim() || 'Sem nome';
      d[k] = d[k].filter((e) => (e.nome || '').trim());
      if (k === 'exercicios') d.exercicios.forEach((e) => { e.series = Math.max(1, Math.round(parseNum(e.series)) || 1); e.reps = Math.max(1, Math.round(parseNum(e.reps)) || 1); e.kg = Math.max(0, parseNum(e.kg)); });
      d.minutos = Math.max(1, Math.round(parseNum(d.minutos)) || 1);
      const i = S.fichas.findIndex((f) => f.id === d.id); S.fichas[i] = d; save(); UI.draft = null; go('ficha/' + d.id, true); toast('Ficha salva.');
      break;
    }

    /* treino */
    case 'minimizar': go('home'); break;
    case 'exgo': A.atual = Number(el.dataset.i); save(); render(); break;
    case 'exstep': A.atual = Math.min(A.exercicios.length - 1, Math.max(0, A.atual + Number(el.dataset.d))); save(); render(); break;
    case 'setcheck': {
      const e = A.exercicios[A.atual]; const i = Number(el.dataset.i); const s = e.series[i];
      s.feita = !s.feita; save();
      if (s.feita) { iniciarDescanso(A.atual, i, e.descanso); if (!S.descanso) { const p = proximaSerie(); if (p && e.series.every((x) => x.feita)) A.atual = p.ei; save(); } }
      render(); break;
    }
    case 'setadd': { const e = A.exercicios[A.atual]; const last = e.series[e.series.length - 1] || { kg: 0, reps: 10 }; e.series.push({ kg: last.kg, reps: last.reps, feita: false }); save(); render(); break; }
    case 'addexsess': UI.addEx = true; render(); setTimeout(() => { const i = document.getElementById('ae-n'); if (i) i.focus(); }, 30); break;
    case 'addexno': UI.addEx = null; render(); break;
    case 'addexok': {
      const nome = (document.getElementById('ae-n').value || '').trim(); if (!nome) { document.getElementById('ae-n').focus(); break; }
      const known = S.fichas.flatMap((f) => (f.exercicios || []).map((e) => ({ e, f }))).find((x) => x.e.nome.toLowerCase() === nome.toLowerCase());
      const base = known ? { ...known.e } : { id: 'livre-' + nome.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-'), nome, grupo: '', equip: '' };
      base.series = Math.max(1, Math.round(parseNum(document.getElementById('ae-s').value)) || 3);
      base.reps = Math.max(1, Math.round(parseNum(document.getElementById('ae-r').value)) || 10);
      base.kg = Math.max(0, parseNum(document.getElementById('ae-k').value));
      const descanso = known ? known.f.descanso : (A.fichaId && ficha(A.fichaId) ? ficha(A.fichaId).descanso : 90);
      const ex = exParaSessao(base, descanso);
      ex.series.forEach((s) => { s.kg = base.kg; s.reps = base.reps; });
      A.exercicios.push(ex); A.atual = A.exercicios.length - 1; UI.addEx = null; save(); render(); break;
    }
    case 'restadj': S.descanso.fim += Number(el.dataset.d) * 1000; S.descanso.total = Math.max(S.descanso.total, Math.ceil((S.descanso.fim - Date.now()) / 1000)); if (S.descanso.fim <= Date.now()) { fimDescanso(false); break; } save(); tick(); break;
    case 'restskip': fimDescanso(false); break;
    case 'etapa': { const i = A.etapas.findIndex((x) => !x.feita); if (i >= 0) A.etapas[i].feita = true; save(); render(); break; }
    case 'finalizar': {
      if (A.tipo === 'forca' && seriesFeitas(A) === 0) { confirmar({ title: 'Nenhuma série feita', text: 'Marque pelo menos uma série com ✓ para salvar o treino, ou descarte.', ok: 'Descartar treino', no: 'Voltar', danger: true, onOk: () => { S.ativa = null; S.descanso = null; save(); go('home', true); } }); break; }
      A.fim = Date.now(); S.descanso = null; save(); go('resumo'); break;
    }
    case 'salvar': {
      A.fim = A.fim || Date.now();
      if (A.tipo === 'forca') {
        A.prs = recordes(A);
        A.exercicios = A.exercicios.map((e) => ({ ...e, series: e.series.filter((s) => s.feita) })).filter((e) => e.series.length);
      }
      S.sessoes.unshift(A); S.ativa = null; S.descanso = null; save(); go('historico', true); toast('Treino salvo no histórico.'); break;
    }
    case 'descartar': confirmar({ title: 'Descartar este treino?', text: 'As séries registradas serão perdidas.', ok: 'Descartar', danger: true, onOk: () => { S.ativa = null; S.descanso = null; save(); go('home', true); } }); break;
    case 'apagarsessao': { const id = el.dataset.id; confirmar({ title: 'Apagar do histórico?', text: 'Esse treino some do histórico e da evolução.', ok: 'Apagar', danger: true, onOk: () => { S.sessoes = S.sessoes.filter((s) => s.id !== id); save(); go('historico', true); } }); break; }
    case 'evoper': UI.evoPeriodo = Number(el.dataset.p); render(); break;
  }
});

document.addEventListener('input', (ev) => {
  const t = ev.target;
  if (t.dataset.k && UI.draft) {
    const path = t.dataset.k.split('.'); let o = UI.draft;
    for (let i = 0; i < path.length - 1; i++) o = o[path[i]];
    const last = path[path.length - 1];
    o[last] = t.dataset.list ? t.value.split(',').map((x) => x.trim()).filter(Boolean) : t.value;
    return;
  }
  if (t.dataset.set !== undefined && S.ativa && S.ativa.tipo === 'forca') {
    const e = S.ativa.exercicios[S.ativa.atual]; const s = e.series[Number(t.dataset.set)];
    s[t.dataset.f] = t.dataset.f === 'kg' ? Math.max(0, parseNum(t.value)) : Math.max(0, Math.round(parseNum(t.value)));
    save(); liveStats(); return;
  }
  if (t.id === 'ae-n') {
    const known = S.fichas.flatMap((f) => f.exercicios || []).find((e) => e.nome.toLowerCase() === t.value.trim().toLowerCase());
    if (known) {
      const h = historicoEx(known.id)[0];
      document.getElementById('ae-s').value = known.series;
      document.getElementById('ae-r').value = h ? h.reps : known.reps;
      document.getElementById('ae-k').value = fmtNum(h ? h.kg : known.kg);
    }
    return;
  }
  if (t.dataset.aInput === 'dist' && S.ativa) {
    const v = parseNum(t.value); S.ativa.distancia = v > 0 ? v : null; save();
    const kp = $app.querySelectorAll('.kpi .v'); const dur = (S.ativa.fim || Date.now()) - S.ativa.inicio;
    if (kp[1]) kp[1].textContent = S.ativa.distancia ? fmtNum(S.ativa.distancia) : '—';
    if (kp[2]) kp[2].textContent = S.ativa.distancia ? pace(dur, S.ativa.distancia) : '—';
  }
});
document.addEventListener('focusin', (ev) => { if (ev.target.matches('.setrow input, .input.num')) setTimeout(() => { try { ev.target.select(); } catch (e) { /* ignora */ } }, 0); });
document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape') {
    if (UI.modal) { UI.modal = null; render(); } else if (UI.addEx) { UI.addEx = null; render(); } else if (UI.sheet) { UI.sheet = null; render(); }
  }
  if (ev.key === 'Enter' && ev.target.id && ev.target.id.startsWith('ae-')) { const b = $app.querySelector('[data-a="addexok"]'); if (b) b.click(); }
});

function liveStats() {
  const a = S.ativa; if (!a) return;
  const v = $app.querySelector('[data-live="vol"]'); if (v) v.textContent = fmtInt(volume(a));
  const s = $app.querySelector('[data-live="sets"]'); if (s) s.textContent = seriesFeitas(a);
}
function tick() {
  const a = S.ativa;
  if (a) $app.querySelectorAll('[data-live="clock"]').forEach((n) => { n.textContent = clock(Date.now() - a.inicio); });
  const r = S.descanso;
  if (r) {
    const left = r.fim - Date.now();
    if (left <= 0) {
      if (route().name === 'treino') fimDescanso(true);
      else { S.descanso = null; const p = proximaSerie(); if (p) a.atual = p.ei; save(); avisar(); if (route().name === 'home') render(); }
      return;
    }
    const t = $app.querySelector('[data-live="rest"]'); if (t) t.textContent = clock(left + 999);
    const ring = $app.querySelector('[data-live="ring"]');
    if (ring) { const C = 2 * Math.PI * 138; ring.setAttribute('stroke-dashoffset', String(C * (1 - Math.max(0, Math.min(1, left / (r.total * 1000)))))); }
  }
}
setInterval(tick, 250);
document.addEventListener('visibilitychange', () => { if (!document.hidden) { S = load(); render(); } });
window.addEventListener('storage', (e) => { if (e.key === KEY) { S = load(); render(); } });

/* ---------- inicialização ---------- */
if (!location.hash) location.replace('#home');
render();
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => { /* sem modo offline neste endereço */ }); });
}
window.__forja = { get state() { return S; } };
})();
