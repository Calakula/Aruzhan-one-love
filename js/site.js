/* Borahae — Endterm defense prep · site behaviour (vanilla JS, no dependencies) */
(function () {
  'use strict';
  var root = document.documentElement;
  var LANGS = ['ru', 'kk', 'en'];
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; }

  /* ---------- language ---------- */
  function setLang(l) {
    if (LANGS.indexOf(l) === -1) l = 'ru';
    root.setAttribute('data-lang', l); root.setAttribute('lang', l); store('bdp-lang', l);
    document.querySelectorAll('[data-set-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-set-lang') === l)); });
    var t = document.body.getAttribute('data-title-' + l); if (t) document.title = t;
    renderTimer(); updateProgress();
  }
  /* ---------- theme ---------- */
  function setTheme(t) {
    root.setAttribute('data-theme', t); store('bdp-theme', t);
    var b = document.getElementById('themeBtn'); if (b) b.textContent = t === 'dark' ? '☾' : '☀';
  }

  /* ---------- timer: 1:30 presentation + 0:30 questions ---------- */
  var PH = { ru: ['Показ', 'Вопросы', 'Время вышло'], kk: ['Көрсету', 'Сұрақтар', 'Уақыт бітті'], en: ['Demo', 'Questions', 'Time is up'] };
  var tBox, tClock, tPhase, tStart, tBtn, tLeft = 120, tTimer = null;
  function fmt(s) { s = Math.max(0, s); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
  function renderTimer() {
    if (!tBox) return;
    var l = root.getAttribute('data-lang') || 'ru', i = tLeft > 30 ? 0 : tLeft > 0 ? 1 : 2;
    var shown = i === 0 ? tLeft - 30 : tLeft;
    tClock.textContent = fmt(i === 2 ? 0 : shown);
    tPhase.textContent = PH[l][i] + (i < 2 ? ' · ' + (i === 0 ? '1:30' : '0:30') : '');
    tBox.classList.toggle('warn', i === 1); tBox.classList.toggle('over', i === 2);
  }
  function timerTick() { tLeft--; renderTimer(); if (tLeft <= 0) { clearInterval(tTimer); tTimer = null; setBtn(); } }
  function setBtn() { var l = root.getAttribute('data-lang') || 'ru'; var m = { ru: ['Старт', 'Пауза'], kk: ['Бастау', 'Үзіліс'], en: ['Start', 'Pause'] }; tBtn.textContent = m[l][tTimer ? 1 : 0]; }

  /* ---------- checklist progress ---------- */
  function updateProgress() {
    var boxes = document.querySelectorAll('.checklist input'); if (!boxes.length) return;
    var n = 0; boxes.forEach(function (b) { if (b.checked) n++; });
    var bar = document.getElementById('progBar'), txt = document.getElementById('progTxt');
    if (bar) bar.style.width = (n / boxes.length * 100) + '%';
    if (txt) txt.textContent = n + ' / ' + boxes.length;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var q = (location.search.match(/[?&]lang=(ru|kk|en)/) || [])[1];
    setTheme(store('bdp-theme') || 'dark');
    document.querySelectorAll('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(b.getAttribute('data-set-lang')); }); });
    var tb = document.getElementById('themeBtn');
    if (tb) tb.addEventListener('click', function () { setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'); });

    /* copy full code */
    document.querySelectorAll('[data-copy]').forEach(function (b) {
      b.addEventListener('click', function () {
        var pre = document.getElementById(b.getAttribute('data-copy')); if (!pre) return;
        var text = Array.prototype.map.call(pre.querySelectorAll('.l'), function (l) { return l.querySelector('.c').textContent; }).join('\n');
        var done = function () { var o = b.textContent; b.textContent = '✓'; setTimeout(function () { b.textContent = o; }, 1200); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, done); else done();
      });
    });
    /* expand / collapse full code */
    document.querySelectorAll('[data-expand]').forEach(function (b) {
      b.addEventListener('click', function () {
        var pre = document.getElementById(b.getAttribute('data-expand')); var open = pre.classList.toggle('open');
        b.setAttribute('aria-expanded', String(open));
        b.querySelectorAll('.t').forEach(function (s) { s.hidden = false; });
        b.classList.toggle('is-open', open);
        b.querySelector('.when-closed').style.display = open ? 'none' : '';
        b.querySelector('.when-open').style.display = open ? '' : 'none';
      });
    });
    /* line badge → highlight lines in the full code */
    document.querySelectorAll('.linebtn').forEach(function (b) {
      b.addEventListener('click', function () {
        var pre = document.getElementById('fullcode'); if (!pre) return;
        var from = +b.getAttribute('data-from'), to = +b.getAttribute('data-to'), first = null;
        pre.querySelectorAll('.l.hl').forEach(function (l) { l.classList.remove('hl'); });
        pre.querySelectorAll('.l').forEach(function (l) { var n = +l.getAttribute('data-n'); if (n >= from && n <= to) { l.classList.add('hl'); if (!first) first = l; } });
        pre.classList.add('open');
        var ex = document.querySelector('[data-expand="fullcode"]'); if (ex) { ex.classList.add('is-open'); ex.querySelector('.when-closed').style.display = 'none'; ex.querySelector('.when-open').style.display = ''; }
        document.getElementById('full').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    /* checklist (saved in localStorage) */
    document.querySelectorAll('.checklist input').forEach(function (b, i) {
      b.checked = store('bdp-chk-' + i) === '1';
      b.addEventListener('change', function () { store('bdp-chk-' + i, b.checked ? '1' : '0'); updateProgress(); });
    });

    /* timer */
    tBox = document.getElementById('timer');
    if (tBox) {
      tClock = tBox.querySelector('.clock'); tPhase = tBox.querySelector('.phase'); tBtn = document.getElementById('timerStart');
      tBtn.addEventListener('click', function () {
        if (tLeft <= 0) tLeft = 120;
        if (tTimer) { clearInterval(tTimer); tTimer = null; } else { tTimer = setInterval(timerTick, 1000); }
        setBtn(); renderTimer();
      });
      document.getElementById('timerReset').addEventListener('click', function () { clearInterval(tTimer); tTimer = null; tLeft = 120; setBtn(); renderTimer(); });
    }

    /* back-to-top */
    var top = document.querySelector('.totop');
    if (top) { top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); }); window.addEventListener('scroll', function () { top.classList.toggle('show', window.scrollY > 500); }, { passive: true }); }

    setLang(q || store('bdp-lang') || 'ru');
    if (tBtn) setBtn();
  });
})();
