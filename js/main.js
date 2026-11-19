/* ================================================================
   Татьяна Пахарукова — «живые» части страницы
   1) золотые искорки на первом экране;
   2) «Ваш сайт за 10 секунд» — мини-сайт собирается в телефоне;
   3) «Как я работаю» — сайт собирается по мере прокрутки;
   4) тонкая линия под шапкой и сообщения в мессенджеры с готовым текстом.
   ================================================================ */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(s, root) { return (root || document).querySelector(s); }
  function $$(s, root) { return Array.prototype.slice.call((root || document).querySelectorAll(s)); }

  // ⚙️ Контакты — поменять на свои
  var MAX = "https://max.ru/u/f9LHodD0cOJ_tmUglvRTNWrcXaifk9UuY4X419o49zy88yQsmVHHWd0ijb8";  // ссылка на мой профиль в MAX

  /* ---------- Линия под шапкой при прокрутке ---------- */
  var nav = $(".nav");
  function onScroll() { nav.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ================================================================
     1. Золотые искорки на первом экране
     ================================================================ */
  var hero = $(".hero"), canvas = $(".sparks");
  var heroVisible = true;
  new IntersectionObserver(function (e) { heroVisible = e[0].isIntersecting; if (heroVisible) kick(); }).observe(hero);

  var ctx = canvas.getContext("2d"), W = 0, H = 0, dpr = 1, sparks = [];
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = hero.clientWidth; H = hero.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.round(Math.min(60, W / 22));
    sparks = [];
    for (var i = 0; i < n; i++) sparks.push(newSpark(true));
  }
  function newSpark(anywhere) {
    // больше искорок справа, там, где фото
    var x = Math.random() < .65 ? W * (.45 + Math.random() * .55) : Math.random() * W;
    return { x: x, y: anywhere ? Math.random() * H : H + 10, r: .6 + Math.random() * 1.5,
             vy: -(.12 + Math.random() * .35), vx: (Math.random() - .5) * .15,
             ph: Math.random() * Math.PI * 2, sp: .02 + Math.random() * .03 };
  }

  var running = false;
  function kick() { if (!running && !reduce) { running = true; requestAnimationFrame(tick); } }
  function tick() {
    if (!heroVisible || document.hidden) { running = false; return; }
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < sparks.length; i++) {
      var p = sparks[i];
      p.x += p.vx; p.y += p.vy; p.ph += p.sp;
      if (p.y < -10) sparks[i] = p = newSpark(false);
      var a = (.25 + .45 * (Math.sin(p.ph) * .5 + .5)) * .7;   // мерцание
      ctx.beginPath();
      ctx.fillStyle = "rgba(244, 220, 168," + a.toFixed(3) + ")";
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(tick);
  }
  if (!reduce) {
    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", kick);
    kick();
  }

  /* ================================================================
     2. «Ваш сайт за 10 секунд»
     ================================================================ */
  var SPHERES = {
    beauty: { label: "салон красоты", bg: "#f3ebe8", soft: "#e6d6d1", ink: "#3b2f2e", acc: "#8f5d61", font: '"Forum", serif',
      def: "Студия «Лепесток»", kick: "салон красоты", title: "Красота рядом с домом",
      sub: "Маникюр, брови и стрижки. Запись онлайн за минуту.", btn: "Записаться", bar: "Выбрать время",
      list: [["Маникюр с покрытием", "от 1 500 ₽"], ["Оформление бровей", "от 900 ₽"], ["Женская стрижка", "от 1 200 ₽"]] },
    psy: { label: "психолог", bg: "#ecefea", soft: "#dbe1d8", ink: "#2c3530", acc: "#5d7465", font: '"Comfortaa", sans-serif',
      def: "Анна Смирнова", kick: "психолог", title: "Поговорим о том, что тревожит",
      sub: "Бережно и без оценок. Встречи в кабинете и онлайн.", btn: "Записаться на встречу", bar: "Записаться",
      list: [["Консультация, 50 минут", "от 3 000 ₽"], ["Онлайн-сессия", "от 2 500 ₽"], ["Знакомство, 15 минут", "бесплатно"]] },
    auto: { label: "автосервис", bg: "#1e2229", soft: "#2a2f38", ink: "#e9e6e1", acc: "#c08a4e", on: "#1e2229", font: '"Oswald", sans-serif',
      def: "Гараж 42", kick: "автосервис", title: "Ремонт за 1 день без очереди",
      sub: "Диагностика, ТО и шиномонтаж. Цена — заранее.", btn: "Записаться на ремонт", bar: "Позвонить мастеру",
      list: [["Диагностика", "от 800 ₽"], ["Замена масла", "от 600 ₽"], ["Шиномонтаж", "от 1 600 ₽"]] },
    law: { label: "юрист", bg: "#eceef1", soft: "#d9dee6", ink: "#1f2633", acc: "#3d5276", font: '"Forum", serif',
      def: "Бюро «Право»", kick: "юридическая помощь", title: "Защитим ваши интересы",
      sub: "Договоры, споры и суды. Объясняем простыми словами.", btn: "Получить консультацию", bar: "Задать вопрос юристу",
      list: [["Консультация", "от 2 000 ₽"], ["Составление договора", "от 5 000 ₽"], ["Суд под ключ", "от 30 000 ₽"]] },
    school: { label: "онлайн-школа", bg: "#eeecf3", soft: "#ddd9e8", ink: "#2a2640", acc: "#625a8e", font: '"Comfortaa", sans-serif',
      def: "Школа «Перемена»", kick: "онлайн-школа", title: "Учитесь с удовольствием",
      sub: "Живые уроки онлайн и проверка домашних заданий.", btn: "Пробный урок", bar: "Записаться на пробный",
      list: [["Пробный урок", "бесплатно"], ["Курс, 8 занятий", "от 6 400 ₽"], ["Индивидуально", "от 1 200 ₽"]] },
    cafe: { label: "кафе, пекарня", bg: "#f2ebe1", soft: "#e4d6c3", ink: "#3a2e22", acc: "#8a6443", font: '"Oswald", sans-serif',
      def: "Пекарня «Утро»", kick: "пекарня", title: "Свежая выпечка каждое утро",
      sub: "Печём с 7:00. Торты на заказ и доставка по району.", btn: "Заказать", bar: "Заказать с доставкой",
      list: [["Круассан", "от 150 ₽"], ["Завтрак", "от 390 ₽"], ["Торт на заказ", "от 1 800 ₽"]] }
  };

  var form = $(".builder-form"), input = $('input[name="biz"]', form), ms = $(".ms");
  var after = $(".builder-after"), want = $("[data-want]");
  var sphereChips = $$("[data-sphere]", form), current = "beauty", timers = [], building = false;

  function bizName() { return input.value.trim() || SPHERES[current].def; }
  function initial(name) { var c = name.replace(/[«»"'\s]/g, ""); return (c[0] || "•").toUpperCase(); }

  function paintStatic(sp) {
    ms.style.setProperty("--ms-bg", sp.bg); ms.style.setProperty("--ms-soft", sp.soft);
    ms.style.setProperty("--ms-ink", sp.ink); ms.style.setProperty("--ms-acc", sp.acc);
    ms.style.setProperty("--ms-font", sp.font);
    ms.style.setProperty("--ms-on", sp.on || "#fff");
    var name = bizName();
    $(".ms-name", ms).textContent = name;
    $(".ms-logo", ms).textContent = initial(name);
    $(".ms-kick", ms).textContent = sp.kick;
    $(".ms-sub", ms).textContent = sp.sub;
    $(".ms-hero .ms-btn", ms).textContent = sp.btn;
    $(".ms-btn-full", ms).textContent = sp.bar;
    $$(".ms-list li", ms).forEach(function (li, i) {
      li.querySelector("span").textContent = sp.list[i][0];
      li.querySelector("b").textContent = sp.list[i][1];
    });
  }

  function typeTitle(text) {
    var el = $(".ms-title", ms), i = 0;
    if (reduce) { el.textContent = text; return; }
    el.textContent = ""; el.classList.add("typing");
    (function next() {
      el.textContent = text.slice(0, ++i);
      if (i < text.length) timers.push(setTimeout(next, 32));
      else timers.push(setTimeout(function () { el.classList.remove("typing"); }, 600));
    })();
  }

  function build() {
    var sp = SPHERES[current];
    timers.forEach(clearTimeout); timers = [];
    paintStatic(sp);
    var els = $$(".ms-el", ms);
    if (reduce) {
      els.forEach(function (el) { el.classList.add("on"); });
      typeTitle(sp.title); done(); return;
    }
    building = true;
    ms.classList.remove("building");
    els.forEach(function (el) { el.classList.remove("on"); });
    $(".ms-title", ms).textContent = "";
    void ms.offsetWidth;                       // перезапуск полоски загрузки
    ms.classList.add("building");
    els.forEach(function (el, i) {
      timers.push(setTimeout(function () {
        el.classList.add("on");
        if (el.classList.contains("ms-hero")) typeTitle(sp.title);
      }, 350 + i * 330));
    });
    timers.push(setTimeout(function () { ms.classList.remove("building"); building = false; done(); }, 350 + els.length * 330 + 500));
  }

  function done() {
    after.hidden = false;
    var text = "Здравствуйте, Татьяна! Хочу прототип сайта для «" + bizName().replace(/[«»]/g, "") + "» (" + SPHERES[current].label + ").";
    want.dataset.text = text;
  }

  sphereChips.forEach(function (btn) {
    btn.addEventListener("click", function () {
      sphereChips.forEach(function (c) { c.setAttribute("aria-pressed", String(c === btn)); });
      current = btn.dataset.sphere;
      input.placeholder = "Например, " + SPHERES[current].def;
      build();
    });
  });
  form.addEventListener("submit", function (e) { e.preventDefault(); build(); });
  input.addEventListener("input", function () {   // название меняется прямо на глазах
    var name = bizName();
    $(".ms-name", ms).textContent = name;
    $(".ms-logo", ms).textContent = initial(name);
    if (!building && !after.hidden) done();
  });

  // первый показ — сам собирается, когда блок появляется на экране
  paintStatic(SPHERES[current]);
  $(".ms-title", ms).textContent = SPHERES[current].title;
  $$(".ms-el", ms).forEach(function (el) { el.classList.add("on"); });
  var shown = false;
  new IntersectionObserver(function (e, obs) {
    if (e[0].isIntersecting && !shown) { shown = true; obs.disconnect(); build(); }
  }, { threshold: .45 }).observe($(".phone"));

  /* ================================================================
     3. «Как я работаю» — сайт собирается при прокрутке
     ================================================================ */
  var frame = $(".bf"), stageWrap = $(".stage-wrap"), steps = $$(".story .step");
  function setStage(n) {
    frame.className = "bf s" + n;
    stageWrap.className = "stage-wrap st" + n;
    steps.forEach(function (s) { s.classList.toggle("active", +s.dataset.stage === n); });
  }
  setStage(0);
  var stepObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) setStage(+en.target.dataset.stage); });
  }, { rootMargin: "-45% 0px -45% 0px" });
  steps.forEach(function (s) { stepObs.observe(s); });

  /* ================================================================
     4. Сообщение в мессенджер с готовым текстом (блок «Контакты»)
     ================================================================ */
  var need = "", needChips = $$(".ask .chip");
  function updateLinks() {
    $('[data-msg="max"]').dataset.text = "Здравствуйте, Татьяна! Нужен сайт" + (need ? ": " + need : "") + ". Мой бизнес: ";
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
  /* ================================================================
     5. Две галочки перед кнопками мессенджеров
        Пока обе не отмечены, кнопки не открывают мессенджер.
        Галочки в конструкторе и в контактах связаны: отметили в одном
        месте — отмечены и в другом.
     ================================================================ */
  var agreeBoxes = $$("[data-agree]");
  function agreed() {
    return ["pd", "policy"].every(function (k) {
      return $$('[data-agree="' + k + '"]').some(function (b) { return b.checked; });
    });
  }
  function syncGates() {
    var ok = agreed();
    $$("[data-gated]").forEach(function (a) { a.setAttribute("aria-disabled", ok ? "false" : "true"); });
    if (ok) $$(".consent-err").forEach(function (e) { e.textContent = ""; });
  }
  agreeBoxes.forEach(function (box) {
    box.addEventListener("change", function () {
      $$('[data-agree="' + box.dataset.agree + '"]').forEach(function (b) { b.checked = box.checked; });
      syncGates();
    });
  });
  $$("[data-gated]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      if (agreed()) return;
      e.preventDefault();
      var wrap = a.closest(".builder-after, .contact-text");
      var err = wrap && $(".consent-err", wrap);
      if (err) err.textContent = "Отметьте обе галочки — тогда откроется мессенджер.";
      var first = wrap && $$("[data-agree]", wrap).filter(function (b) { return !b.checked; })[0];
      if (first) first.focus();
    });
  });
  syncGates();

  /* MAX не умеет открываться с готовым текстом, поэтому текст копируем,
     а посетитель вставляет его в чат сам. */
  $$("[data-copy], [data-max-link]").forEach(function (a) { a.href = MAX; });
  $$("[data-copy]").forEach(function (a) {
    a.addEventListener("click", function () {
      if (!agreed() || !a.dataset.text) return;
      var wrap = a.closest(".builder-after, .contact-text");
      var note = wrap && $(".copy-note", wrap);
      var text = a.dataset.text;
      function ok() { if (note) note.textContent = "Текст сообщения скопирован — вставьте его в чат MAX."; }
      function fallback() {            // запасной способ для старых браузеров
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

  /* ================================================================
     6. Уведомление о cookie — показывается один раз, пока не нажмут «Хорошо»
     ================================================================ */
  var cookieBar = $(".cookie"), seen = false;
  try { seen = localStorage.getItem("cookie-ok") === "1"; } catch (e) {}
  if (cookieBar && !seen) {
    cookieBar.hidden = false;
    $(".cookie-ok", cookieBar).addEventListener("click", function () {
      try { localStorage.setItem("cookie-ok", "1"); } catch (e) {}
      cookieBar.hidden = true;
    });
  }
})();
