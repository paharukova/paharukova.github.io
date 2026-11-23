/* ================================================================
   Татьяна Пахарукова — версия 2, «живые» части страницы
   1) искорки: густые на первом экране и редкие по всей странице,
      плюс вспышки, когда золотое перо дорисовывает линию;
   2) луч за мышкой на первом экране;
   3) появление рисунков и графиков при прокрутке;
   4) «Ваш сайт за 10 секунд» — шесть мини-сайтов со своим характером;
   5) «Как я работаю» — сайт собирается при прокрутке;
   6) окно просмотра работы — сайт сам листается;
   7) мессенджеры с готовым текстом, cookie.
   ================================================================ */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(s, root) { return (root || document).querySelector(s); }
  function $$(s, root) { return Array.prototype.slice.call((root || document).querySelectorAll(s)); }
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  // ⚙️ Контакты
  var MAX = "https://max.ru/u/f9LHodD0cOJ_tmUglvRTNWrcXaifk9UuY4X419o49zy88yQsmVHHWd0ijb8";
  var TG = "https://t.me/tatyana_p42";
  /* Telegram открывается сразу с готовым текстом (t.me/ник?text=…).
     MAX так не умеет — для него текст копируем. Сайт через эти кнопки ничего не собирает. */
  function setText(a, text) {
    a.dataset.text = text;
    if (a.hasAttribute("data-tg")) a.href = TG + "?text=" + encodeURIComponent(text);
  }

  /* ---------- Линия под шапкой ---------- */
  var nav = $(".nav");
  function onScrollNav() { nav.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  /* ================================================================
     1. Искорки
     ================================================================ */
  var GOLD = "244, 220, 168";

  // 1а. Густые искорки на первом экране (как раньше)
  var hero = $(".hero"), heroCanvas = $(".sparks");
  var heroVisible = true;
  var hctx = heroCanvas.getContext("2d"), HW = 0, HH = 0, hsparks = [];
  function heroResize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    HW = hero.clientWidth; HH = hero.clientHeight;
    heroCanvas.width = HW * dpr; heroCanvas.height = HH * dpr;
    hctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.round(Math.min(60, HW / 22));
    hsparks = [];
    for (var i = 0; i < n; i++) hsparks.push(heroSpark(true));
  }
  function heroSpark(anywhere) {
    var x = Math.random() < .65 ? HW * (.45 + Math.random() * .55) : Math.random() * HW;
    return { x: x, y: anywhere ? Math.random() * HH : HH + 10, r: .6 + Math.random() * 1.5,
             vy: -(.12 + Math.random() * .35), vx: (Math.random() - .5) * .15,
             ph: Math.random() * Math.PI * 2, sp: .02 + Math.random() * .03 };
  }
  function drawHero() {
    hctx.clearRect(0, 0, HW, HH);
    for (var i = 0; i < hsparks.length; i++) {
      var p = hsparks[i];
      p.x += p.vx; p.y += p.vy; p.ph += p.sp;
      if (p.y < -10) hsparks[i] = p = heroSpark(false);
      var a = (.25 + .45 * (Math.sin(p.ph) * .5 + .5)) * .7;
      hctx.beginPath();
      hctx.fillStyle = "rgba(" + GOLD + "," + a.toFixed(3) + ")";
      hctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      hctx.fill();
    }
  }

  // 1б. Редкие искорки по всей странице. Холст закреплён на экране,
  //     искорки плывут вверх и при прокрутке сдвигаются с «глубиной»:
  //     крупные (ближние) — быстрее, мелкие (дальние) — медленнее.
  var pc = $(".page-sparks"), pctx = pc.getContext("2d"), PW = 0, PH = 0, psparks = [], bursts = [], popWait = 60;
  var lastY = window.scrollY;
  function pageResize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    PW = window.innerWidth; PH = window.innerHeight;
    pc.width = PW * dpr; pc.height = PH * dpr;
    pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.round(Math.min(70, PW * PH / 20000));
    psparks = [];
    for (var i = 0; i < n; i++) psparks.push(pageSpark(Math.random() * PH));
  }
  function pageSpark(y) {
    var z = .25 + Math.random() * .75;
    return { x: Math.random() * PW, y: y, z: z, r: .5 + z * 1.4, vy: -(.05 + z * .22), vx: (Math.random() - .5) * .1,
             ph: Math.random() * Math.PI * 2, sp: .015 + Math.random() * .03 };
  }
  function drawPage() {
    var dy = window.scrollY - lastY; lastY = window.scrollY;
    if (Math.abs(dy) > 400) dy = 0;          // прыжок по ссылке — без рывка
    pctx.clearRect(0, 0, PW, PH);
    for (var i = 0; i < psparks.length; i++) {
      var p = psparks[i];
      p.x += p.vx; p.y += p.vy - dy * p.z * .35; p.ph += p.sp;
      if (p.y < -12) { psparks[i] = p = pageSpark(PH + 10); }
      else if (p.y > PH + 12) { psparks[i] = p = pageSpark(-10); }
      var a = (.18 + .4 * (Math.sin(p.ph) * .5 + .5)) * (.35 + p.z * .5), r = p.r;
      if (p.pop) {                                   // вспыхивает и рассыпается салютиком
        p.pop += .07; r = p.r * (1 + p.pop * .5); a = Math.min(1, a + p.pop * .7);
        if (p.pop >= 1) { burst(p.x, p.y, 12); psparks[i] = pageSpark(PH + 10); continue; }
      }
      pctx.beginPath();
      pctx.fillStyle = "rgba(" + GOLD + "," + a.toFixed(3) + ")";
      pctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      pctx.fill();
    }
    // время от времени одна из ближних искорок рассыпается салютиком (средне: раз в 1,5–3 секунды)
    if (!reduce && --popWait <= 0) {
      popWait = 90 + Math.random() * 90;
      var cand = psparks.filter(function (q) { return !q.pop && q.z > .45 && q.y > PH * .1 && q.y < PH * .9; });
      if (cand.length) cand[Math.floor(Math.random() * cand.length)].pop = .01;
    }
    // вспышки: искорки разлетаются из точки и гаснут
    for (var j = bursts.length - 1; j >= 0; j--) {
      var b = bursts[j];
      b.x += b.vx; b.y += b.vy - dy; b.vx *= .96; b.vy = b.vy * .96 + .015; b.life -= .016;
      if (b.life <= 0) { bursts.splice(j, 1); continue; }
      pctx.beginPath();
      pctx.fillStyle = "rgba(" + GOLD + "," + Math.min(1, b.life * 1.4).toFixed(3) + ")";
      pctx.arc(b.x, b.y, b.r * (.5 + b.life * .5), 0, Math.PI * 2);
      pctx.fill();
    }
  }
  function burst(x, y, n) {
    if (reduce) return;
    for (var i = 0; i < (n || 14); i++) {
      var ang = Math.random() * Math.PI * 2, sp = .6 + Math.random() * 2.2;
      bursts.push({ x: x, y: y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - .4, r: .8 + Math.random() * 1.6, life: .7 + Math.random() * .5 });
    }
  }

  // 2. Луч за мышкой — по всему сайту: тянется следом с небольшой задержкой
  var glow = $(".glow"), gx = -400, gy = -400, tx = -400, ty = -400, hasHover = window.matchMedia("(hover: hover)").matches;
  var useGlow = glow && hasHover && !reduce;
  if (useGlow) {
    window.addEventListener("pointermove", function (e) {
      if (tx < -300) { gx = e.clientX; gy = e.clientY; }   // первое движение — сразу под мышкой
      tx = e.clientX; ty = e.clientY;
      glow.classList.add("on");
    }, { passive: true });
    document.documentElement.addEventListener("pointerleave", function () { glow.classList.remove("on"); });
  }
  function drawGlow() {
    if (!useGlow) return;
    gx += (tx - gx) * .45; gy += (ty - gy) * .45;   // ореол держится у стрелки
    glow.style.setProperty("--gx", gx.toFixed(1) + "px");
    glow.style.setProperty("--gy", gy.toFixed(1) + "px");
  }

  var running = false;
  function loop() {
    if (document.hidden) { running = false; return; }
    if (heroVisible) drawHero();
    drawGlow();
    drawPage();
    requestAnimationFrame(loop);
  }
  function kick() { if (!running && !reduce) { running = true; requestAnimationFrame(loop); } }
  if (!reduce) {
    heroResize(); pageResize();
    window.addEventListener("resize", function () { heroResize(); pageResize(); });
    document.addEventListener("visibilitychange", kick);
    new IntersectionObserver(function (e) { heroVisible = e[0].isIntersecting; }).observe(hero);
    kick();
  }

  /* ================================================================
     3. Появление при прокрутке
        Подчёркивания пером рисуются каждый раз, когда заголовок
        появляется на экране; переписка и галочки — один раз.
     ================================================================ */
  var markObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      var el = en.target;
      if (!en.isIntersecting) { el.classList.remove("drawn"); return; }
      if (el.classList.contains("drawn")) return;
      el.classList.add("drawn");
      var svg = $(".mark svg", el) || (el.classList.contains("mark") && $("svg", el));
      if (svg) setTimeout(function () {
        if (!el.classList.contains("drawn")) return;
        var r = svg.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) burst(r.right, r.top + r.height / 2, 12);
      }, 1200);
    });
  }, { threshold: .6 });
  $$("h1, h2").forEach(function (h) { if ($(".mark", h)) markObs.observe(h); });

  $$(".chat .msg, .chat .msg-typing").forEach(function (m, i) { m.style.transitionDelay = (.2 + i * .75).toFixed(2) + "s"; });
  var revObs = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.parentElement.classList.add("in");
      obs.unobserve(en.target);
    });
  }, { threshold: .2, rootMargin: "0px 0px -12% 0px" });
  $$(".chat, .incl").forEach(function (el) { revObs.observe(el); });

  /* Обо мне: переписка-уведомления. Сообщения всплывают по одному,
     клиент «пишет» чуть быстрее, Татьяна — чуть дольше; старые уходят вверх.
     В конце пауза и диалог начинается заново. */
  var lock = $(".lock"), reduceLock = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (lock && !reduceLock) {
    var feed = $(".lock-feed", lock), nts = $$(".nt", lock), ntTimer, ntStarted = false;
    var feedHeight = function () {    // высота под четыре сообщения подряд, самые длинные
      lock.classList.remove("live");
      var hs = nts.map(function (n) { return n.offsetHeight + 10; }), best = 0;
      for (var i = 0; i + 4 <= hs.length; i++) best = Math.max(best, hs[i] + hs[i + 1] + hs[i + 2] + hs[i + 3]);
      lock.style.setProperty("--feed-h", best + "px");
      lock.classList.add("live");
    };
    var ntStep = function (i) {
      if (i >= nts.length) {
        ntTimer = setTimeout(function () {
          feed.classList.add("fade");
          ntTimer = setTimeout(function () {
            nts.forEach(function (n) { n.classList.remove("on"); });
            feed.classList.remove("fade");
            ntStep(0);
          }, 650);
        }, 5000);
        return;
      }
      nts[i].classList.add("on");
      var next = nts[i + 1], wait = !next ? 0 : (next.classList.contains("nt-you") ? 1700 : 2300);
      ntTimer = setTimeout(function () { ntStep(i + 1); }, wait);
    };
    feedHeight();
    addEventListener("resize", function () {
      var was = nts.map(function (n) { return n.classList.contains("on"); });
      nts.forEach(function (n) { n.classList.add("on"); });
      feedHeight();
      nts.forEach(function (n, k) { n.classList.toggle("on", was[k]); });
    });
    new IntersectionObserver(function (en, obs) {
      if (en[0].isIntersecting && !ntStarted) { ntStarted = true; ntTimer = setTimeout(function () { ntStep(0); }, 500); obs.disconnect(); }
    }, { threshold: .3 }).observe(lock);
  }

  /* Цены: вкладки — цена досчитывает, полоска срока, схема сайта на маленьком телефоне */
  var prcTabs = $$(".prc-tab");
  if (prcTabs.length) {
    var PRC = [
      { n: "Сайт-визитка", s: 10000, d: "Одна страница: кто вы, услуги, цены, контакты и карта. Для мастеров, репетиторов, психологов.", t: "около недели", w: 25 },
      { n: "Лендинг", s: 15000, d: "Продающая страница под одну услугу или курс: выгоды, ответы на вопросы, форма заявки.", t: "1–2 недели", w: 45 },
      { n: "Сайт с онлайн-записью", s: 25000, d: "Услуги, мастера и запись на удобное время. Для салонов, клиник, автосервисов, студий.", t: "2–3 недели", w: 70 },
      { n: "Каталог или магазин", s: 40000, d: "Товары с фото и ценами, карточки, корзина или заявка. Для магазинов и производств.", t: "от 3 недель", w: 100 }
    ];
    var U = function (n, cls) { var h = ""; for (var k = 0; k < n; k++) h += "<u" + (cls && cls.indexOf(k) > -1 ? ' class="on"' : "") + "></u>"; return h; };
    var PRC_PAGES = [
      '<i class="s"></i><div class="blk"></div><i class="m"></i><i class="s"></i><div class="map"></div><div class="btn"></div>',
      '<i class="s"></i><div class="blk"></div><i class="m"></i><div class="btn"></div><div class="row">' + U(3) + '</div><i class="m"></i><i></i><i class="s"></i><div class="row">' + U(3) + '</div><i class="m"></i><div class="btn"></div>',
      '<i class="s"></i><div class="cal">' + U(21, [9]) + '</div><div class="slots">' + U(4, [1]) + '</div><i class="m"></i><i class="s"></i><div class="btn"></div>',
      '<i class="s"></i><div class="goods">' + U(6) + '</div><div class="btn"></div>'
    ];
    var prcNum = $(".prc-num"), prcPage = $(".prc-page"), prcBar = $(".prc-bar i"), prcShown = 10000, prcRaf;
    var prcFmt = function (n) { return Math.round(n).toLocaleString("ru-RU").replace(/\s/g, " "); };
    var prcPick = function (i) {
      var x = PRC[i];
      prcTabs.forEach(function (t, k) { t.setAttribute("aria-selected", String(k === i)); });
      $(".prc-name").textContent = x.n;
      $(".prc-desc").textContent = x.d;
      $(".prc-time").textContent = x.t;
      prcBar.style.setProperty("--w", x.w + "%");
      prcPage.classList.add("hide");
      setTimeout(function () { prcPage.innerHTML = PRC_PAGES[i]; prcPage.classList.remove("hide"); }, 250);
      cancelAnimationFrame(prcRaf);
      if (reduce) { prcShown = x.s; prcNum.textContent = prcFmt(x.s); return; }
      var from = prcShown, to = x.s, t0 = performance.now();
      (function step() {
        var k = Math.min(1, (performance.now() - t0) / 900), e = 1 - Math.pow(1 - k, 3);
        prcShown = from + (to - from) * e; prcNum.textContent = prcFmt(prcShown);
        if (k < 1) prcRaf = requestAnimationFrame(step);
      })();
    };
    prcTabs.forEach(function (t) { t.addEventListener("click", function () { prcPick(+t.dataset.i); }); });
    prcPage.innerHTML = PRC_PAGES[0];
  }

  /* Вопросы: открыт один ответ, остальные свёрнуты */
  var fqIts = $$(".fq-it");
  fqIts.forEach(function (it) {
    $(".fq-q", it).addEventListener("click", function () {
      var open = !it.classList.contains("on");
      fqIts.forEach(function (x) { x.classList.remove("on"); $(".fq-q", x).setAttribute("aria-expanded", "false"); });
      if (open) { it.classList.add("on"); $(".fq-q", it).setAttribute("aria-expanded", "true"); }
    });
  });

  /* Карточки «Где / Как оформляем / Связь» — их можно понажимать */
  var CITIES = ["Кемерово", "Москва", "Новосибирск", "Екатеринбург", "Сочи", "Казань", "Владивосток", "Калининград", "ваш город"];
  var geo = $(".pc-geo"), ci = 0;
  if (geo) geo.addEventListener("click", function () {
    ci = (ci + 1) % CITIES.length;
    $(".city", geo).textContent = CITIES[ci];
    var pin = $(".pin", geo);
    pin.style.left = (32 + Math.random() * 36) + "%";
    pin.style.top = (24 + Math.random() * 34) + "%";
    pin.classList.remove("drop"); void pin.offsetWidth; pin.classList.add("drop");
  });
  var doc = $(".pc-doc"), docTimers = [];
  if (doc) doc.addEventListener("click", function () {
    docTimers.forEach(clearTimeout); docTimers = [];
    doc.classList.remove("st1", "st2", "st3");
    [1, 2, 3].forEach(function (n) {
      docTimers.push(setTimeout(function () { doc.classList.remove("st" + (n - 1)); doc.classList.add("st" + n); }, 150 + (n - 1) * 750));
    });
  });
  var talk = $(".pc-talk");
  if (talk) $$("button", talk).forEach(function (btn) {
    btn.addEventListener("click", function () {
      $$("button", talk).forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      var bub = $(".bubble", talk);
      bub.textContent = btn.dataset.say + ". Отвечу в течение дня";
      bub.classList.remove("pop"); void bub.offsetWidth; bub.classList.add("pop");
    });
  });

  /* ================================================================
     4. «Ваш сайт за 10 секунд»
     ================================================================ */
  function chars(s) {
    return esc(s).replace(/&[a-z]+;|[^\s]|\s/g, function (c, i) {
      return c === " " ? " " : '<span class="ch" style="--i:' + (chars.n++) + '">' + c + "</span>";
    });
  }
  var ICON = {
    star: '<path d="M12 0c1 8 4 11 12 12-8 1-11 4-12 12-1-8-4-11-12-12 8-1 11-4 12-12z"/>',
    heart: '<path d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11z"/>',
    phone: '<path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z"/>',
    arrow: '<path d="M0 4h25M21 1l4 3-4 3"/>'
  };

  var SPHERES = {
    beauty: { label: "салон красоты", def: "Студия «Лепесток»", html: function (n) { var ring = esc(n.replace(/[«»"]/g, "")) + " • "; return '' +
      '<div class="b2-top ms-el"><b class="b2-name">' + esc(n) + '</b><span class="b2-pill">запись</span></div>' +
      '<div class="b2-photo ms-el"><img src="img/try/beauty.webp" alt="">' +
        '<svg class="b2-ring" viewBox="0 0 100 100"><defs><path id="b2r" d="M50 50m-38 0a38 38 0 1 1 76 0a38 38 0 1 1-76 0"/></defs><text><textPath href="#b2r" textLength="236" lengthAdjust="spacingAndGlyphs">' + ring + ring + '</textPath></text></svg></div>' +
      '<p class="b2-title ms-el">Маникюр, который<br>держится <em>4 недели</em></p>' +
      '<div class="b2-day ms-el"><p><b>Сегодня свободно 3 окна</b><span>10:00 — 20:00</span></p>' +
        '<div class="b2-line"><i class="busy" style="left:0;width:18%"></i><i class="free" style="left:18%;width:12%"></i><i class="busy" style="left:30%;width:28%"></i><i class="free" style="left:58%;width:10%"></i><i class="busy" style="left:68%;width:18%"></i><i class="free" style="left:86%;width:14%"></i></div>' +
        '<div class="b2-hours"><span>10</span><span>12</span><span>14</span><span>16</span><span>18</span><span>20</span></div></div>' +
      '<div class="b2-list ms-el"><p><span>Маникюр + покрытие</span><b>1 500</b></p><p><span>Брови под ключ</span><b>900</b></p><p><span>Стрижка</span><b>1 200</b></p></div>' +
      '<div class="b2-cta ms-el">Занять окно в 12:00</div>'; } },

    psy: { label: "психолог", def: "Анна Смирнова", html: function (n) { return '' +
      '<div class="p2-top ms-el"><p><b class="p2-name">' + esc(n) + '</b><span>психолог · встречи онлайн</span></p><span class="p2-on">онлайн</span></div>' +
      '<div class="p2-call ms-el"><img src="img/try/psy.webp" alt=""><span class="p2-live"><i></i>сессия <b data-tick="up" data-t="2892">48:12</b></span><span class="p2-self"></span>' +
        '<span class="p2-ctrl"><i class="mic"></i><i class="cam"></i><i class="end"></i></span></div>' +
      '<p class="p2-title ms-el">Можно начать<br>прямо из дома</p>' +
      '<div class="p2-check ms-el"><p class="p2-ch">Чек-ап за 2 минуты</p>' +
        '<p class="p2-bar"><span>сон</span><i style="--w:38%"></i></p><p class="p2-bar"><span>тревога</span><i style="--w:76%"></i></p><p class="p2-bar"><span>силы</span><i style="--w:30%"></i></p>' +
        '<p class="p2-note">Похоже на усталость. Разберём на первой встрече</p></div>' +
      '<div class="p2-cta ms-el">Записаться на онлайн-встречу</div>'; } },

    auto: { label: "автосервис", def: "Гараж 42", html: function (n) { return '' +
      '<div class="a2-tape ms-el"></div>' +
      '<p class="a2-name fit ms-el">' + chars(n.toUpperCase()) + '</p>' +
      '<p class="a2-sub ms-el">Ремонт и ТО без очереди · цена до начала работ</p>' +
      '<div class="a2-photo ms-el"><img src="img/try/auto.webp" alt=""><span class="a2-tag">мастер свободен<br><b>в 14:30</b></span></div>' +
      '<div class="a2-q ms-el"><p><b>Очередь на сегодня</b><span>2 места свободно</span></p><div class="a2-slots">' +
        '<span class="car"><i></i>9:00</span><span class="car"><i></i>11:00</span><span class="car"><i></i>13:00</span><span class="free">14:30</span><span class="car"><i></i>16:00</span><span class="free">18:00</span></div></div>' +
      '<div class="a2-list ms-el"><p><span>Диагностика</span><b>800 ₽</b></p><p><span>Замена масла</span><b>600 ₽</b></p><p><span>Шиномонтаж</span><b>1 600 ₽</b></p></div>' +
      '<div class="a2-cta ms-el">Записаться на 14:30 <i>→</i></div>'; } },

    law: { label: "юрист", def: "Бюро «Право»", html: function (n) { return '' +
      '<div class="l2-top ms-el"><b class="l2-name">' + esc(n) + '</b><span>юридическая помощь · онлайн и в офисе</span></div>' +
      '<div class="l2-photo ms-el"><img src="img/try/law.webp" alt=""></div>' +
      '<p class="l2-title ms-el">Решаем споры —<br>чаще без суда</p>' +
      '<div class="l2-stat ms-el"><svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="32"/><circle class="v" cx="40" cy="40" r="32" pathLength="100"/></svg><b>78%</b>' +
        '<p>споров закрываем<br>на этапе претензии,<br>без суда</p></div>' +
      '<div class="l2-facts ms-el"><p><b>15 мин</b>первая консультация бесплатно</p><p><b>1 день</b>на ответ по документам</p></div>' +
      '<div class="l2-cta ms-el">Задать вопрос юристу</div>'; } },

    school: { label: "онлайн-школа", def: "Школа «Перемена»", html: function (n) { return '' +
      '<div class="s-nav ms-el"><span class="s-logo"><i></i><i></i><i></i></span><p><b class="s-name">' + esc(n) + '</b><span>онлайн-школа · 1–11 класс</span></p></div>' +
      '<span class="s-st s-pi ms-el">π</span><span class="s-st s-five ms-el">5</span><span class="s-st s-ab ms-el">Ab</span>' +
      '<svg class="s-wave ms-el" viewBox="0 0 60 14"><path d="M2 8c7-8 12-8 18 0s12 8 18 0 12-8 18 0"/></svg>' +
      '<div class="s-card ms-el"><p class="s-step">Вопрос 2 из 6</p><div class="s-prog"><i></i></div>' +
        '<p class="s-q">В каком классе ваш ребёнок?</p>' +
        '<div class="s-opts"><span>1–4 класс</span><span class="on">5–8 класс</span><span>9 класс · ОГЭ</span><span>11 класс · ЕГЭ</span></div>' +
        '<div class="s-next">Дальше →</div></div>' +
      '<div class="s-perks ms-el"><p><b>1 минута</b>6 вопросов</p><p><b>Цена сразу</b>без звонков</p><p><b>Пробный</b>бесплатно</p></div>' +
      '<div class="s-teacher ms-el"><i>М</i><p><b>Ведёт уроки Мария</b>готовит к ОГЭ и ЕГЭ, отвечает в чате</p></div>' +
      '<p class="s-foot ms-el">После ответов — план занятий и преподаватель</p>'; } },

    cafe: { label: "кафе, пекарня", def: "Пекарня «Утро»", html: function (n) { return '' +
      '<p class="c2-name fit ms-el">' + chars(n) + '</p>' +
      '<p class="c2-sub ms-el">пекарня у дома · 7:00–21:00</p>' +
      '<div class="c2-photo ms-el"><img src="img/try/cafe.webp" alt=""><span class="c2-badge">горячие<br>из печи</span></div>' +
      '<div class="c2-oven ms-el"><p class="c2-t">Новая партия через <b data-tick="down" data-t="1453">24:13</b></p>' +
        '<div class="c2-batches"><span class="done">7:00</span><span class="done">9:00</span><span class="done">11:00</span><span class="next">13:00</span><span>15:00</span></div></div>' +
      '<div class="c2-menu ms-el"><p><span>Круассан</span><b>150 ₽</b></p><p><span>Хлеб на закваске</span><b>220 ₽</b></p><p><span>Синнабон</span><b>190 ₽</b></p></div>' +
      '<div class="c2-cta ms-el">Заказать к 13:00</div>'; } }
  };

  var form = $(".builder-form"), ms = $(".ms");
  var after = $(".builder-after"), want = $$("[data-want]");
  var sphereChips = $$("button[data-sphere]", form), current = null, timers = [], building = false;
  var nameBox = $(".sp-name", form), nameInput = $('input[name="biz"]', form), nameLabel = $(".sp-name-l", form);
  var tRead = $(".t-read"), tLab = $(".t-lab"), tUnit = $(".t-unit"), tArc = $(".t-arc"), timer = $(".b10-timer"), tRaf;

  /* Подсказка в поле меняется под сферу, чтобы было понятно, что вписывать.
     Салон, школу и пекарню оформляем как название: «Студия «…»», если человек
     не написал слово сам. Психолог и юрист — можно просто имя. */
  var ASK = {
    beauty: ["Название салона", "Например, Лепесток"],
    psy: ["Ваше имя", "Например, Анна Смирнова"],
    auto: ["Название автосервиса", "Например, Гараж 42"],
    law: ["Название бюро или ваше имя", "Например, Право"],
    school: ["Название школы", "Например, Перемена"],
    cafe: ["Название кафе или пекарни", "Например, Утро"]
  };
  var PREFIX = { beauty: "Студия", school: "Школа", cafe: "Пекарня" };
  var HAS_TYPE = /студи|салон|школ|кафе|пекарн|кофейн|бар\b|центр|«|"/i;

  function bizName() {
    var v = nameInput ? nameInput.value.replace(/\s+/g, " ").trim() : "";
    if (!v) return SPHERES[current].def;
    if (PREFIX[current] && !HAS_TYPE.test(v)) v = PREFIX[current] + " «" + v + "»";
    return v;
  }
  function initial(name) { var c = name.replace(/[«»"'\s]/g, ""); return esc((c[0] || "•").toUpperCase()); }

  // огромное имя подгоняем под ширину экрана телефона
  function fitAll() {
    $$(".fit", ms).forEach(function (el) {
      el.style.fontSize = "";
      var size = parseFloat(getComputedStyle(el).fontSize), min = 16;
      while (el.scrollWidth > el.clientWidth + 1 && size > min) { size -= 2; el.style.fontSize = size + "px"; }
    });
  }

  // заставка на телефоне, пока сфера не выбрана
  var INTRO = '<div class="i-scr">' +
    '<div class="i-nav"><i></i><i></i><i></i></div>' +
    '<div class="i-mid"><p class="i-ten">10</p><p class="i-sec">секунд</p>' +
    '<p class="i-hint">Выберите сферу&nbsp;— и&nbsp;здесь появится ваш сайт</p><span class="i-arrow" aria-hidden="true"></span></div>' +
    '<div class="i-sk"><i class="w"></i><i></i><i class="s"></i><i class="btn"></i></div></div>';

  function render() {
    if (!current) { ms.className = "ms ms-intro"; ms.innerHTML = INTRO; return; }
    var name = bizName();
    chars.n = 0;
    ms.className = "ms ms-" + current;
    ms.dataset.sphere = current;
    ms.innerHTML = '<span class="ms-paint" aria-hidden="true"></span>' + SPHERES[current].html(name, initial(name));
    fitAll();
  }

  // секундомер под телефоном: дуга — доля от 10 секунд
  function showTime(sec, final) {
    if (!tRead) return;
    tRead.textContent = sec.toFixed(1).replace(".", ",");
    if (tArc) tArc.style.strokeDashoffset = Math.max(0, 100 - sec * 10);
    if (final) {
      tLab.textContent = "Собрано за";
      tUnit.textContent = sec >= 1 && sec < 2 ? "секунду" : (sec < 5 ? "секунды" : "секунд");
      timer.classList.remove("run"); void timer.offsetWidth; timer.classList.add("done");
    }
  }
  function startTimer(t0) {
    if (!timer) return;
    timer.classList.remove("done"); timer.classList.add("run");
    tLab.textContent = "Собираю"; tUnit.textContent = "сек";
    cancelAnimationFrame(tRaf);
    (function tick() { showTime((performance.now() - t0) / 1000); if (building) tRaf = requestAnimationFrame(tick); })();
  }

  function build() {
    if (!current) return;
    timers.forEach(clearTimeout); timers = [];
    var t0 = performance.now();
    render();
    if (reduce) { done(t0); return; }
    var els = $$(".ms-el", ms);
    building = true;
    startTimer(t0);
    ms.classList.add("building", "blank");
    timers.push(setTimeout(function () { ms.classList.remove("blank"); }, 600));
    els.forEach(function (el, i) {
      timers.push(setTimeout(function () { el.classList.add("on"); }, 700 + i * 210));
    });
    timers.push(setTimeout(function () {
      ms.classList.remove("building"); building = false;
      if (nameDirty) { nameDirty = false; render(); $$(".ms-el", ms).forEach(function (el) { el.classList.add("on"); el.style.animation = "none"; }); }
      done(t0);
      var r = ms.getBoundingClientRect();
      burst(r.right - 10, r.top + 30, 14); burst(r.left + 10, r.bottom - 60, 10);
    }, 700 + els.length * 210 + 450));
  }

  function done(t0) {
    after.hidden = false;
    if (t0) { cancelAnimationFrame(tRaf); showTime((performance.now() - t0) / 1000, true); }
    var typed = nameInput && nameInput.value.replace(/\s+/g, " ").trim();
    var text = "Здравствуйте, Татьяна! Хочу прототип сайта, сфера: " + SPHERES[current].label + "." + (typed ? " Название: " + typed + "." : "");
    want.forEach(function (a) { setText(a, text); });
    wires();
  }

  // поле названия живёт внутри выбранной плашки
  function placeName() {
    if (!nameBox || !current) return;
    var plate = $('.sp[data-sp="' + current + '"]', form);
    $$(".sp", form).forEach(function (p) { p.classList.toggle("on", p === plate); });
    plate.appendChild(nameBox);
    nameLabel.textContent = ASK[current][0];
    nameInput.placeholder = ASK[current][1];
  }

  sphereChips.forEach(function (btn) {
    btn.addEventListener("click", function () {
      sphereChips.forEach(function (c) { c.setAttribute("aria-pressed", String(c === btn)); });
      if (current !== btn.dataset.sphere && nameInput) nameInput.value = "";   // у другой сферы — своё название
      current = btn.dataset.sphere;
      form.classList.add("picked");
      placeName();
      build();
      wires();
    });
  });
  form.addEventListener("submit", function (e) { e.preventDefault(); build(); });

  // название меняется на экране прямо во время набора
  var typingTimer, nameDirty = false;
  if (nameInput) nameInput.addEventListener("input", function () {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(function () {
      if (building) { nameDirty = true; return; }
      render();
      $$(".ms-el", ms).forEach(function (el) { el.classList.add("on"); el.style.animation = "none"; });
      if (!after.hidden) done();
    }, 250);
  });

  // тонкие линии от плашек к телефону; у выбранной — бегут золотые штрихи
  var wiresSvg = $(".wires", form), phoneEl = $(".phone", form);
  function wires() {
    if (!wiresSvg || !phoneEl) return;
    var box = form.getBoundingClientRect(), pb = phoneEl.getBoundingClientRect();
    if (getComputedStyle(wiresSvg).display === "none") return;
    wiresSvg.setAttribute("viewBox", "0 0 " + box.width + " " + box.height);
    var html = "";
    $$(".sp", form).forEach(function (pl) {
      var r = pl.getBoundingClientRect(), left = r.right <= pb.left + 1;
      var x1 = (left ? r.right : r.left) - box.left, y1 = r.top + Math.min(r.height / 2, 34) - box.top;
      var x2 = (left ? pb.left + 6 : pb.right - 6) - box.left;
      var y2 = Math.min(Math.max(y1, pb.top + 110 - box.top), pb.bottom - 110 - box.top), mx = (x1 + x2) / 2;
      html += '<path' + (pl.classList.contains("on") ? ' class="on"' : "") + ' d="M' + x1.toFixed(1) + " " + y1.toFixed(1) + " C" + mx.toFixed(1) + " " + y1.toFixed(1) + " " + mx.toFixed(1) + " " + y2.toFixed(1) + " " + x2.toFixed(1) + " " + y2.toFixed(1) + '"/>';
    });
    wiresSvg.innerHTML = html;
  }
  placeName();
  addEventListener("resize", wires);
  if (window.ResizeObserver) new ResizeObserver(wires).observe(form);

  // часы в мини-сайтах: эфир психолога идёт вперёд, до новой партии хлеба — назад
  setInterval(function () {
    $$("[data-tick]", ms).forEach(function (el) {
      var t = +el.dataset.t + (el.dataset.tick === "up" ? 1 : -1);
      if (t < 0) t = 1800;
      el.dataset.t = t;
      el.textContent = Math.floor(t / 60) + ":" + ("0" + t % 60).slice(-2);
    });
  }, 1000);

  // мини-сайт нарисован под экран шириной 318 px и масштабируется под настоящий размер телефона
  var screenEl = $(".phone-screen");
  function scaleMs() {
    var k = screenEl.clientWidth / 318;
    if (!k) return;
    ms.style.setProperty("--k", k.toFixed(4));
    ms.style.setProperty("--msh", (screenEl.clientHeight / k).toFixed(1) + "px");
  }
  scaleMs();
  if (window.ResizeObserver) new ResizeObserver(scaleMs).observe(screenEl);
  else window.addEventListener("resize", scaleMs);

  // первый показ: на телефоне заставка, сайт собирается, когда человек выберет сферу
  render();
  // шрифты мини-сайтов догрузились — подогнать имя ещё раз
  if (document.fonts) {
    Promise.all(['20px "Dela Gothic One"', '20px "Russo One"', '20px "Yeseva One"', '20px "Pacifico"', '800 20px "Unbounded"', '700 20px "Caveat"']
      .map(function (f) { return document.fonts.load(f).catch(function () {}); })).then(fitAll);
    document.fonts.addEventListener && document.fonts.addEventListener("loadingdone", fitAll);
  }

  /* ================================================================
     5. «Как я работаю» + что входит: окно сайта меняется по шагам
     ================================================================ */
  var krBw = $("#krBw");
  if (krBw) {
    krBw.innerHTML = '<div class="kr-bw-bar"><i></i><i></i><i></i><span class="kr-bw-url"><em class="kr-u0">план страницы</em><em class="kr-u1">прототип · черновик</em><em class="kr-u2">сайт · в&nbsp;работе</em><em class="kr-u3"><span class="kr-bw-lock"></span>flora-masterskaya.ru</em></span></div>' +
    '<div class="kr-bw-page">' +
      '<div class="kr-bw-nav"><b class="kr-logo kr-t">Флора</b><span class="kr-links"><i class="kr-t">Букеты</i><i class="kr-t">Доставка</i><i class="kr-t">Контакты</i></span><span class="kr-btn kr-t">Заказать</span></div>' +
      '<div class="kr-bw-hero"><div class="kr-copy"><p class="kr-h kr-t">Букеты с&nbsp;доставкой за&nbsp;2&nbsp;часа</p><p class="kr-p kr-t">Соберём под ваш повод и&nbsp;привезём к&nbsp;нужному времени</p><span class="kr-btn kr-t">Выбрать букет</span></div><div class="kr-img"></div></div>' +
      '<div class="kr-bw-cards"><div class="kr-c"><span class="kr-t">Розы</span><b class="kr-t">от 2&nbsp;900&nbsp;₽</b></div><div class="kr-c"><span class="kr-t">Пионы</span><b class="kr-t">от 3&nbsp;500&nbsp;₽</b></div><div class="kr-c"><span class="kr-t">Сезонные</span><b class="kr-t">от 1&nbsp;900&nbsp;₽</b></div></div>' +
    '</div>' +
    '<span class="kr-bw-badge kr-b0"><span><b>0&nbsp;₽</b><small>прототип</small></span></span>' +
    '<span class="kr-bw-badge kr-b3"><span><b>3</b><small>месяца правок бесплатно</small></span></span>' +
    '<div class="kr-bw-phone"><div><i class="kr-s"></i><i class="kr-w"></i><i></i><i class="kr-s"></i><i class="kr-b"></i></div></div>' +
    '<span class="kr-bw-pin kr-p1"><i>1</i>фото крупнее ✓</span><span class="kr-bw-pin kr-p2"><i>2</i>поменять цену ✓</span>' +
    '<div class="kr-bw-toast"><span class="kr-dot"></span><div><b>Новая заявка</b><span>Марина · букет на&nbsp;субботу</span></div></div>';
    /* 23.11 (2): блок «закрепляется» на экране; прокрутка колёсиком листает шаги вбок.
       После 4-го шага страница едет дальше, назад — так же в обратном порядке.
       На телефоне шаги просто идут друг под другом. */
    var kr = $(".kr"), krPin = $(".kr-pin"), krTrack = $(".kr-track"), krSteps = $$(".kr-step"), krPts = $$(".kr-pt");
    var krFillEl = $(".kr-road-fill"), krHint = $(".kr-hint"), krCur = -1, krT = [];
    var krReduce = matchMedia("(prefers-reduced-motion: reduce)").matches, krWide = matchMedia("(min-width: 901px)");
    var krSet = function (k) {
      if (k === krCur) return;
      krCur = k; krT.forEach(clearTimeout); krT = [];
      krTrack.style.transform = "translateX(" + (-k * 100) + "%)";
      krSteps.forEach(function (st, i) {
        st.classList.toggle("on", i === k);
        $$(".kr-chk li", st).forEach(function (li, n) {
          if (i < k) li.classList.add("ok");
          else if (i > k) li.classList.remove("ok");
          else { li.classList.remove("ok"); krT.push(setTimeout(function () { li.classList.add("ok"); }, krReduce ? 0 : 350 + n * 280)); }
        });
      });
      krPts.forEach(function (b, i) { b.classList.toggle("on", i === k); b.classList.toggle("done", i < k); });
      krFillEl.style.setProperty("--p", k / (krSteps.length - 1));
      krBw.dataset.st = k;
      if (krHint) krHint.classList.toggle("off", k > 0);
    };
    var krLen = function () { return kr.offsetHeight - krPin.offsetHeight; };
    var krScroll = function () {
      if (!krWide.matches) { if (krCur !== 0) krSet(0); $$(".kr-chk li").forEach(function (li) { li.classList.add("ok"); }); return; }
      var len = krLen(), prog = len > 0 ? ((parseFloat(getComputedStyle(krPin).top) || 0) - kr.getBoundingClientRect().top) / len : 0;
      krSet(Math.max(0, Math.min(krSteps.length - 1, Math.floor(prog * krSteps.length))));
    };
    krPts.forEach(function (b, i) {
      b.addEventListener("click", function () {
        if (!krWide.matches) { krSteps[i].scrollIntoView({ behavior: krReduce ? "auto" : "smooth", block: "center" }); return; }
        var top = kr.getBoundingClientRect().top + window.scrollY + krLen() * (i + .5) / krSteps.length;
        window.scrollTo({ top: top, behavior: krReduce ? "auto" : "smooth" });
      });
    });
    addEventListener("scroll", krScroll, { passive: true }); addEventListener("resize", krScroll);
    krScroll();
  }

  /* ================================================================
     6. Окно просмотра работы: длинный снимок сайта сам листается
     ================================================================ */
  var pv = $(".pv"), pvView = $(".pv-view", pv), pvImg = $(".pv-img", pv), pvBar = $(".pv-progress i", pv);
  var pvPlay = $(".pv-play", pv), pvUrl = $(".pv-url", pv), pvLive = $(".pv-live", pv);
  var pvPos = 0, pvLast = 0, pvRun = false, pvPaused = false, pvHoldUntil = 0, pvStartAt = 0;
  var narrow = window.matchMedia("(max-width: 700px)");

  function pvMax() { return Math.max(0, pvView.scrollHeight - pvView.clientHeight); }
  function pvProgress() { var m = pvMax(); pvBar.style.height = (m ? pvView.scrollTop / m * 100 : 100) + "%"; }
  function pvSetState() {
    pv.classList.toggle("paused", pvPaused);
    pvPlay.setAttribute("aria-label", pv.classList.contains("ended") ? "Смотреть ещё раз" : pvPaused ? "Продолжить" : "Пауза");
  }
  function pvTick(t) {
    if (!pv.open) { pvRun = false; return; }
    var dt = Math.min(64, t - (pvLast || t)); pvLast = t;
    var max = pvMax();
    if (!pvPaused && !pv.classList.contains("ended") && t > pvStartAt && t > pvHoldUntil && max > 0) {
      var speed = narrow.matches ? 75 : 120;           // пикселей в секунду
      pvPos = Math.min(max, pvPos + speed * dt / 1000);
      pvView.scrollTop = pvPos;
      if (pvPos >= max - 1) { pv.classList.add("ended"); pvSetState(); }
    }
    pvProgress();
    requestAnimationFrame(pvTick);
  }
  function pvHold() { pvHoldUntil = performance.now() + 2500; }

  function openPreview(shot) {
    var card = shot.closest(".project"), key = shot.dataset.preview;
    var type = $(".p-type", card).cloneNode(true);
    $$(".badge", type).forEach(function (b) { b.textContent = " · " + b.textContent; });
    $(".pv-type", pv).textContent = type.textContent.replace(/\s+/g, " ").trim();
    $("#pv-title").textContent = $("h3", card).textContent;
    var href = shot.getAttribute("href");
    pvUrl.textContent = /^https?:/.test(href) ? href.replace(/^https?:\/\//, "") : "paharukova.github.io/" + href;
    var live = key === "kviz";
    pv.classList.toggle("live", live);
    pvLive.hidden = !live;
    if (live) pvLive.src = href; else pvLive.removeAttribute("src");
    pv.classList.remove("ended", "short");
    pvPaused = reduce; pvPos = 0; pvLast = 0;
    pvImg.removeAttribute("src");
    pvImg.src = "img/full/" + key + (narrow.matches ? "-m" : "-d") + ".jpg";
    pvView.scrollTop = 0; pvProgress();
    pv.showModal();
    document.documentElement.classList.add("pv-lock");
    pvStartAt = performance.now() + 1200;
    var ready = function () {
      if (pvMax() < 4) { pv.classList.add("short"); pv.classList.add("ended"); }
      pvSetState();
    };
    if (pvImg.complete) ready(); else pvImg.onload = ready;
    pvSetState();
    if (!pvRun) { pvRun = true; requestAnimationFrame(pvTick); }
    if (!live) pvView.focus({ preventScroll: true });
  }

  $$("[data-preview]").forEach(function (shot) {
    shot.addEventListener("click", function (e) {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;   // открыть во вкладке, как обычно
      e.preventDefault();
      openPreview(shot);
    });
  });
  pvPlay.addEventListener("click", function () {
    if (pv.classList.contains("ended")) {
      if (pv.classList.contains("short")) return;
      pv.classList.remove("ended"); pvPos = 0; pvView.scrollTop = 0; pvPaused = false;
      pvStartAt = performance.now() + 500;
    } else pvPaused = !pvPaused;
    pvSetState();
  });
  $(".pv-close", pv).addEventListener("click", function () { pv.close(); });
  pv.addEventListener("click", function (e) { if (e.target === pv) pv.close(); });   // клик мимо окна
  pv.addEventListener("close", function () { document.documentElement.classList.remove("pv-lock"); pvLive.removeAttribute("src"); });
  ["wheel", "touchstart", "pointerdown"].forEach(function (ev) { pvView.addEventListener(ev, pvHold, { passive: true }); });
  pvView.addEventListener("keydown", function (e) { if (/Arrow|Page|Home|End|Space/.test(e.code)) pvHold(); });
  pvView.addEventListener("scroll", function () {
    if (Math.abs(pvView.scrollTop - pvPos) > 2) {          // листают сами — продолжим с этого места
      pvPos = pvView.scrollTop;
      if (pvPos < pvMax() - 1 && pv.classList.contains("ended") && !pv.classList.contains("short")) { pv.classList.remove("ended"); pvSetState(); }
    }
  }, { passive: true });

  /* ================================================================
     7. Мессенджеры с готовым текстом (блок «Контакты»)
     ================================================================ */
  var need = "", needChips = $$(".ask .chip");
  function updateLinks() {
    var text = "Здравствуйте, Татьяна! Нужен сайт" + (need ? ": " + need : "") + ". Мой бизнес: ";
    $$("[data-msg]").forEach(function (a) { setText(a, text); });
  }
  needChips.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var on = btn.getAttribute("aria-pressed") === "true";
      needChips.forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
      btn.setAttribute("aria-pressed", on ? "false" : "true");
      need = on ? "" : btn.dataset.need;
      updateLinks();
    });
  });
  updateLinks();

  /* MAX не умеет открываться с готовым текстом: копируем текст, посетитель вставляет его сам */
  $$("[data-copy], [data-max-link]").forEach(function (a) { a.href = MAX; });
  $$("[data-copy]").forEach(function (a) {
    a.addEventListener("click", function () {
      if (!a.dataset.text) return;
      var wrap = a.closest(".builder-after, .contact-text");
      var note = wrap && $(".copy-note", wrap);
      var text = a.dataset.text;
      function ok() { if (note) note.textContent = "Текст сообщения скопирован — вставьте его в чат MAX."; }
      function fallback() {
        var t = document.createElement("textarea");
        t.value = text; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
        document.body.appendChild(t); t.select();
        try { if (document.execCommand("copy")) ok(); } catch (e) {}
        document.body.removeChild(t);
      }
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(ok, fallback);
      else fallback();
    });
  });

  /* ---------- Cookie: показывается один раз ---------- */
  var cookieBar = $(".cookie"), seen = false;
  try { seen = localStorage.getItem("cookie-ok") === "1"; } catch (e) {}
  if (cookieBar && !seen) {
    cookieBar.hidden = false;
    $(".cookie-ok", cookieBar).addEventListener("click", function () {
      try { localStorage.setItem("cookie-ok", "1"); } catch (e) {}
      cookieBar.hidden = true;
    });
  }

  /* Обо мне (23.11): плитки-причины мягко светятся под мышкой,
     а при касании контур рассыпается салютиком (не чаще раза в 2 секунды на плитку) */
  function edgeBurst(el) {
    if (reduce) return;
    var r = el.getBoundingClientRect(), per = 2 * (r.width + r.height), n = 34;
    for (var i = 0; i < n; i++) {
      var d = (i + Math.random() * .6) / n * per, x, y, nx, ny;
      if (d < r.width) { x = r.left + d; y = r.top; nx = 0; ny = -1; }
      else if (d < r.width + r.height) { x = r.right; y = r.top + d - r.width; nx = 1; ny = 0; }
      else if (d < 2 * r.width + r.height) { x = r.right - (d - r.width - r.height); y = r.bottom; nx = 0; ny = 1; }
      else { x = r.left; y = r.bottom - (d - 2 * r.width - r.height); nx = -1; ny = 0; }
      var sp = .6 + Math.random() * 1.6, sw = (Math.random() - .5) * 1.2;
      bursts.push({ x: x, y: y, vx: nx * sp + (ny ? sw : 0), vy: ny * sp + (nx ? sw : 0) - .2, r: .6 + Math.random() * 1.1, life: .5 + Math.random() * .45 });
    }
  }
  document.querySelectorAll(".om-tile").forEach(function (t) {
    var last = 0;
    t.addEventListener("pointerenter", function (e) {
      if (e.pointerType !== "mouse" || Date.now() - last < 2000) return;
      last = Date.now(); edgeBurst(t);
      t.classList.remove("flash"); void t.offsetWidth; t.classList.add("flash");
    });
    t.addEventListener("pointermove", function (e) { var r = t.getBoundingClientRect(); t.style.setProperty("--mx", e.clientX - r.left + "px"); t.style.setProperty("--my", e.clientY - r.top + "px"); });
    t.addEventListener("pointerleave", function () { t.style.setProperty("--mx", "-300px"); });
  });

  /* ================================================================
     Вопросы (23.11): строка поиска. Вопросы и ответы — здесь, в QS.
     k — слова, по которым находится вопрос; t — короткая тема для кнопки «Часто ищут».
     ================================================================ */
  (function () {
    var form = $("#qsForm"); if (!form) return;
    var QS = [
      { q: "Сколько времени займёт сайт?", a: "Визитка&nbsp;— около недели, лендинг&nbsp;— 1–2 недели, магазин&nbsp;— от&nbsp;трёх недель. Сильнее всего сроки зависят от&nbsp;того, как быстро готовы тексты и&nbsp;фото.", k: "срок сроки время сколько долго быстро неделя недели когда готов делать займёт", t: "сроки" },
      { q: "Что нужно от&nbsp;меня?", a: "Рассказать о&nbsp;своём деле и&nbsp;прислать то, что есть: логотип, фото, цены, контакты. Если чего-то нет, подскажу, где взять, и&nbsp;помогу с&nbsp;текстами.", k: "нужно прислать материалы подготовить фото тексты логотип от меня что нужно", t: "что прислать" },
      { q: "Что такое домен и&nbsp;хостинг и&nbsp;сколько они стоят?", a: "Домен&nbsp;— это адрес сайта, например, vash-salon.ru. Хостинг&nbsp;— место в&nbsp;интернете, где сайт хранится. Помогу выбрать и&nbsp;подключить, а&nbsp;оплачиваете вы их напрямую, обычно это несколько тысяч рублей в&nbsp;год.", k: "домен хостинг адрес стоимость стоит стоят год сервер", t: "домен" },
      { q: "Вы работаете только в&nbsp;моём&nbsp;городе?", a: "Нет, я&nbsp;работаю удалённо с&nbsp;любым городом: всё обсуждаем в&nbsp;мессенджере или по&nbsp;телефону.", k: "город удалённо удаленно где находитесь другой город москва сочи регион", t: "другой город" },
      { q: "Как проходит оплата?", a: "Прототип бесплатный. Если он&nbsp;понравился, заключаем договор и&nbsp;вы вносите предоплату&nbsp;— 50%. Я&nbsp;работаю как самозанятая, чек пришлю сразу после оплаты.", k: "оплата оплатить платить предоплата деньги договор чек 50 самозанятая аванс стоимость цена", t: "оплата" },
      { q: "Как поменять цены или текст после запуска?", a: "Напишите мне, что поменять, и&nbsp;я&nbsp;внесу изменения. Первые 3&nbsp;месяца после запуска мелкие правки бесплатно: опечатки, цены, телефон, часы работы. Дальше&nbsp;— за&nbsp;небольшую плату, стоимость обсуждаем заранее.", k: "поменять изменить правки правка цены текст после запуска сам самому исправить", t: "правки" }
    ];
    var inp = $("#qsIn"), sug = $("#qsSug"), ans = $("#qsAns"), pop = $("#qsPop"), sel = -1, typed = false;
    var plain = function (s) { return s.replace(/&nbsp;/g, " "); };
    var ICO = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>';
    var stem = function (w) { return w.slice(0, Math.max(3, w.length - 2)); };
    var words = function (v) { return v.toLowerCase().split(/[^а-яёa-z0-9]+/).filter(function (w) { return w.length > 1; }); };
    var find = function (v) {
      var ws = words(v); if (!ws.length) return [];
      return QS.map(function (x, i) {
        var hay = (plain(x.q) + " " + x.k).toLowerCase(), s = 0;
        ws.forEach(function (w) { if (hay.indexOf(stem(w)) > -1) s++; });
        return { i: i, s: s };
      }).filter(function (o) { return o.s > 0; }).sort(function (a, b) { return b.s - a.s; });
    };
    var hl = function (text, v) {
      var t = plain(text);
      words(v).filter(function (w) { return w.length > 2; }).forEach(function (w) {
        t = t.replace(new RegExp("(" + stem(w).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[а-яёa-z]*)", "i"), "<mark>$1</mark>");
      });
      return t;
    };
    var renderSug = function () {
      var v = inp.value.trim(), res = find(v); sel = -1;
      if (!v) { sug.hidden = true; return; }
      sug.innerHTML = res.length
        ? res.map(function (o) { return '<li data-i="' + o.i + '">' + ICO + "<span>" + hl(QS[o.i].q, v) + "</span></li>"; }).join("")
        : "<li>" + ICO + "<span>Такого вопроса пока нет&nbsp;— задайте его мне в&nbsp;контактах ниже ↓</span></li>";
      sug.hidden = false;
    };
    var show = function (i) {
      typed = true; inp.value = plain(QS[i].q); sug.hidden = true;
      $$("button", pop).forEach(function (b, k) { b.classList.toggle("on", k === i); });
      ans.innerHTML = '<div class="qs-ans"><small>Ответ Татьяны</small><h3>' + QS[i].q + "</h3><p>" + QS[i].a + '</p><a href="#contact">Остался вопрос? Напишите мне ↓</a></div>';
    };
    QS.forEach(function (x, i) {
      var b = document.createElement("button"); b.type = "button"; b.textContent = x.t;
      b.addEventListener("click", function () { show(i); }); pop.appendChild(b);
    });
    inp.addEventListener("focus", function () { typed = true; inp.placeholder = "Например: сколько стоит домен?"; });
    inp.addEventListener("input", renderSug);
    inp.addEventListener("keydown", function (e) {
      var items = $$("li[data-i]", sug);
      if ((e.key === "ArrowDown" || e.key === "ArrowUp") && items.length) {
        e.preventDefault(); sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
        items.forEach(function (li, k) { li.classList.toggle("on", k === sel); });
      }
      if (e.key === "Escape") sug.hidden = true;
    });
    sug.addEventListener("mousedown", function (e) { var li = e.target.closest("li[data-i]"); if (li) { e.preventDefault(); show(+li.dataset.i); } });
    form.addEventListener("submit", function (e) {
      e.preventDefault(); var items = $$("li[data-i]", sug);
      if (sel > -1 && items[sel]) return show(+items[sel].dataset.i);
      var r = find(inp.value); if (r.length) show(r[0].i); else renderSug();
    });
    inp.addEventListener("blur", function () { setTimeout(function () { sug.hidden = true; }, 150); });
    /* вопросы сами печатаются в строке — когда раздел на экране и пока человек не нажал */
    if (!reduce) {
      var started = false;
      var typeLoop = function (n) {
        if (typed) return;
        var s = plain(QS[n % QS.length].q), k = 0;
        (function step() {
          if (typed) return;
          inp.placeholder = s.slice(0, k);
          if (k++ < s.length) setTimeout(step, 45); else setTimeout(function () { typeLoop(n + 1); }, 1600);
        })();
      };
      new IntersectionObserver(function (es, o) { if (es[0].isIntersecting && !started) { started = true; o.disconnect(); typeLoop(0); } }, { threshold: .4 }).observe(form);
    }
  })();

  /* «Напишите мне» (23.11): золотая линия рисуется, когда её долистали */
  (function () {
    var kl = $("#kLine"); if (!kl) return;
    if (reduce) { kl.classList.add("go"); return; }
    new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { o.disconnect(); kl.classList.add("go"); } }, { threshold: .9 }).observe(kl);
  })();

  /* Подвал (23.11): кнопка «Наверх» */
  $$("[data-up]").forEach(function (b) { b.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); }); });
})();
