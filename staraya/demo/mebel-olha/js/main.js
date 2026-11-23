/* Ольха — демо, версия 2 */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- логотип: «о» по меркам настоящей буквы и подгонка по ширине ---------- */
  var mark = $('#mark');
  var o = $('#lens');
  if (!reduce) mark.classList.add('pre');

  function markFont() {
    var cs = getComputedStyle(mark);
    return { w: cs.fontWeight, fam: cs.fontFamily, ls: parseFloat(cs.getPropertyValue('--mark-ls')) || 0 };
  }

  function measureO() {
    var S = 200;
    var f = markFont();
    var c = document.createElement('canvas');
    c.width = S * 2; c.height = S * 2;
    var x = c.getContext('2d');
    x.font = f.w + ' ' + S + 'px ' + f.fam;
    var m = x.measureText('о');
    var inkW = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
    var asc = m.actualBoundingBoxAscent, desc = m.actualBoundingBoxDescent;
    // толщина штриха: идём по средней строке слева направо
    x.fillStyle = '#000';
    x.fillText('о', S / 2, S * 1.5);
    var y = Math.round(S * 1.5 - (asc - desc) / 2);
    var row = x.getImageData(0, y, c.width, 1).data;
    var first = -1, last = -1;
    for (var i = 0; i < c.width; i++) {
      var a = row[i * 4 + 3];
      if (a > 128 && first < 0) first = i;
      if (first >= 0 && a <= 128) { last = i; break; }
    }
    var st = last > first ? (last - first) : S * 0.15;
    var adv = m.width;
    var left = m.actualBoundingBoxLeft; // обычно отрицательный = боковой отступ
    var lsb = -left, rsb = adv - inkW - lsb;
    var em = function (v) { return (v / S).toFixed(4) + 'em'; };
    var LD = (asc + desc) * 1.06;                       // диаметр «линзы» с фото
    var gap = 0.1 * S;
    o.style.setProperty('--ld', em(LD));
    o.style.setProperty('--lb', em(0));
    o.style.setProperty('--gw', em(inkW));
    o.style.setProperty('--ow', em(Math.max(inkW, LD + 2 * st + 2 * gap)));
    o.style.setProperty('--oh', em(asc + desc));
    o.style.setProperty('--st', em(st));
    o.style.setProperty('--ol', em(lsb));
    o.style.setProperty('--or', em(rsb + f.ls * S));
    o.style.setProperty('--ov', em(-desc));
  }

  /* ---------- закреплённая шапка ---------- */
  var topbar = $('#topbar');
  var root = document.documentElement;
  function topHeight() {
    if (!topbar.classList.contains('is-small')) {
      root.style.setProperty('--top-h', topbar.offsetHeight + 'px');
    }
    return parseFloat(getComputedStyle(root).getPropertyValue('--top-h')) || topbar.offsetHeight;
  }
  topHeight();
  var sTick = false;
  window.addEventListener('scroll', function () {
    if (sTick) return;
    sTick = true;
    requestAnimationFrame(function () {
      sTick = false;
      topbar.classList.toggle('is-small', window.scrollY > 40);
    });
  }, { passive: true });
  topbar.classList.toggle('is-small', window.scrollY > 40);

  /* логотип: по ширине экрана, но не выше, чем позволяет высота окна */
  function fit() { fitOnce(); fitOnce(); }   // второй проход уточняет первый
  function fitOnce() {
    var cs = getComputedStyle(mark.parentNode);
    var box = mark.parentNode.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    // меряем логотип в его текущем размере: ширина и высота растут ровно пропорционально размеру шрифта
    var mcs = getComputedStyle(mark);
    var cur = parseFloat(mcs.fontSize);
    var pad = parseFloat(mcs.paddingTop) + parseFloat(mcs.paddingBottom);
    var r = mark.getBoundingClientRect();
    if (!r.width || !cur) return;
    var fs = cur * box / r.width;
    if (window.innerWidth > 820) {
      var under = $('.under').offsetHeight;
      var avail = window.innerHeight - topHeight() - under - 8;
      var fsH = cur * (avail - pad) / (r.height - pad);
      if (fsH > 0) fs = Math.min(fs, fsH);
    }
    mark.style.fontSize = Math.max(fs, 56).toFixed(2) + 'px';
  }

  function setup() {
    try { measureO(); } catch (e) { /* остаются запасные размеры из CSS */ }
    fit();
    setTimeout(function () { mark.classList.remove('pre'); }, 60);
  }
  function whenFont(cb) {
    if (!(document.fonts && document.fonts.load)) return cb();
    var f = markFont();
    Promise.race([
      document.fonts.load(f.w + ' 100px ' + f.fam, 'ольха'),
      new Promise(function (r) { setTimeout(r, 1500); })
    ]).then(cb, cb);
  }

  whenFont(setup);
  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { topHeight(); fit(); }, 80); });
  // ещё раз, когда загрузились все шрифты и картинки: высота текста под логотипом могла измениться
  window.addEventListener('load', function () { topHeight(); fit(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { topHeight(); fit(); });

  /* ---------- линза: модели сменяют друг друга ---------- */
  var models = [
    { name: 'Кресло «Рама»', meta: 'ясень, лён · 58 × 56 × 78 см' },
    { name: 'Стул «Лён»', meta: 'ольха, рогожка · 46 × 52 × 82 см' },
    { name: 'Кресло «Облако»', meta: 'букле, без каркаса · 90 × 95 × 68 см' },
    { name: 'Табурет «Волна»', meta: 'ясень, гнутая фанера · высота 65 см' },
    { name: 'Пуф «Камень»', meta: 'лён · Ø 50 × 42 см' }
  ];
  var imgs = $$('.o__lens img');
  var nowN = $('#nowN'), nowName = $('#nowName'), nowMeta = $('#nowMeta'), bar = $('#nowBar');
  var cur = 0, timer;
  var DUR = 3800;

  function show(n) {
    cur = (n + imgs.length) % imgs.length;
    imgs.forEach(function (im, i) { im.classList.toggle('is-on', i === cur); });
    nowN.textContent = ('0' + (cur + 1)).slice(-2);
    nowName.textContent = models[cur].name;
    nowMeta.textContent = models[cur].meta;
    bar.classList.remove('run');
    void bar.offsetWidth;
    if (!reduce) bar.classList.add('run');
  }
  function loop() {
    clearTimeout(timer);
    if (reduce) return;
    timer = setTimeout(function () { show(cur + 1); loop(); }, DUR);
  }
  bar.parentNode.style.setProperty('--dur', DUR + 'ms');
  function next() { show(cur + 1); loop(); }
  $('#lensNext').addEventListener('click', next);
  $('.o__lens').addEventListener('click', next);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) clearTimeout(timer); else loop();
  });
  show(0); loop();

  /* ---------- каталог: слова-фильтры ---------- */
  var words = $$('.w');
  var tiles = $$('.tile[data-c]');
  words.forEach(function (w) {
    w.addEventListener('click', function () {
      words.forEach(function (x) { x.classList.toggle('is-on', x === w); x.setAttribute('aria-pressed', String(x === w)); });
      var f = w.dataset.f, n = 0;
      tiles.forEach(function (t) {
        var on = f === 'all' || t.dataset.c === f;
        t.classList.toggle('is-out', !on);
        t.classList.remove('is-in');
        if (on) { void t.offsetWidth; t.style.animationDelay = (n++ * 70) + 'ms'; t.classList.add('is-in'); }
      });
    });
  });

  /* ---------- как заказать: открыт только один пункт ---------- */
  var acc = $$('#acc details');
  acc.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) acc.forEach(function (x) { if (x !== d) x.open = false; });
    });
  });

  /* ---------- комплекты: стрелки ---------- */
  var strip = $('#strip');
  function stepW() { var c = strip.children[0]; return c.getBoundingClientRect().width + 14; }
  $('#setsPrev').addEventListener('click', function () { strip.scrollBy({ left: -stepW(), behavior: reduce ? 'auto' : 'smooth' }); });
  $('#setsNext').addEventListener('click', function () { strip.scrollBy({ left: stepW(), behavior: reduce ? 'auto' : 'smooth' }); });

  /* ---------- плитки «под ваш размер» подставляют модель в заявку ---------- */
  var form = $('#form');
  $$('.tile[data-c]').forEach(function (t) {
    $('.tile__img', t).addEventListener('click', function () {
      form.msg.value = $('h3', t).textContent + ' под мой размер. ';
    });
  });

  /* ---------- заявка ---------- */
  var err = $('#formErr');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var phone = form.phone.value.replace(/\D/g, '');
    var bad = [];
    form.phone.closest('.fld').classList.toggle('is-bad', phone.length < 10);
    if (phone.length < 10) bad.push('Проверьте телефон: нужно 10–11 цифр, чтобы мастер смог перезвонить.');
    if (!form.agree.checked) bad.push('Поставьте галочку согласия, без неё мы не можем принять заявку.');
    if (bad.length) { err.textContent = bad.join(' '); err.hidden = false; return; }
    err.hidden = true;
    form.classList.add('is-sent');
    $('#formOk').hidden = false;
  });
  form.phone.addEventListener('input', function () { form.phone.closest('.fld').classList.remove('is-bad'); });
})();
