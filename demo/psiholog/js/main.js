/* Дарья Лебедева — психолог. Демо, версия 2. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* меню на телефоне */
  var burger = $('.burger'), nav = $('.nav');
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }); });

  /* шапка: когда большое имя уехало, строка меню «прилипает» и показывает маленькое имя */
  var bar = $('#bar'), headEl = $('.head');
  function stick() { bar.classList.toggle('stuck', window.scrollY > headEl.offsetHeight - 2); }
  window.addEventListener('scroll', stick, { passive: true }); stick();

  /* вкладки «С чем помогаю» */
  var tabs = $$('[role="tab"]');
  var panels = $('.panels');
  function select(tab) {
    panels.classList.add('anim');
    tabs.forEach(function (t) {
      var on = t === tab, panel = document.getElementById(t.getAttribute('aria-controls'));
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      panel.hidden = !on;
      panel.classList.toggle('is-active', on);
    });
    tab.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(t); });
    t.addEventListener('keydown', function (e) {
      var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!k) return;
      var next = tabs[(i + k + tabs.length) % tabs.length];
      select(next); next.focus();
    });
  });

  /* на телефоне круглая кнопка появляется после первого экрана, чтобы не закрывать текст */
  var bubble = $('.bubble'), hero = $('.hero');
  function bub() { bubble.classList.toggle('show', hero.getBoundingClientRect().bottom < window.innerHeight * 0.6); }
  window.addEventListener('scroll', bub, { passive: true }); bub();
  /* когда на экране форма записи или подвал — кружок не нужен */
  if ('IntersectionObserver' in window) {
    var seen = new Set();
    var bio = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) seen.add(x.target); else seen.delete(x.target); });
      bubble.classList.toggle('away', seen.size > 0);
    }, { threshold: 0.2 });
    [$('#book'), $('.foot')].forEach(function (el) { if (el) bio.observe(el); });
  }

  /* «Когда пора прийти»: отметки и подсказка */
  var signBtns = $$('.signs__list button'), signsNote = $('#signsNote');
  var signsDefault = signsNote ? signsNote.textContent : '';
  signBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true');
      var n = signBtns.filter(function (x) { return x.getAttribute('aria-pressed') === 'true'; }).length;
      signsNote.innerHTML = n ? '<b>Совпадений: ' + n + ' из 4.</b> Это уже повод поговорить — первые 20 минут знакомства бесплатно.' : signsDefault;
    });
  });

  /* кнопки «Записаться» во вкладках и в ценах сразу отмечают тему и формат в заявке */
  $$('[data-topic]').forEach(function (b) {
    b.addEventListener('click', function () {
      var c = $('#topicChips input[value="' + b.dataset.topic + '"]'); if (c) c.checked = true;
    });
  });
  $$('a[data-format]').forEach(function (b) {
    b.addEventListener('click', function () {
      var r = $('#formatChips input[value="' + b.dataset.format + '"]'); if (r) r.checked = true;
    });
  });

  /* форма (демо) */
  var form = $('#form'), msg = $('#formMsg');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    $$('.field input[required]', form).forEach(function (inp) {
      var bad = !inp.value.trim();
      inp.closest('.field').classList.toggle('err', bad);
      if (bad) ok = false;
    });
    var agree = $('.agree input', form);
    agree.closest('.agree').classList.toggle('err', !agree.checked);
    if (!agree.checked) ok = false;
    msg.className = 'form__msg';
    if (!ok) { msg.textContent = 'Заполните имя, контакт и поставьте галочку — и всё готово.'; return; }
    msg.classList.add('ok');
    msg.textContent = form.elements.name.value.trim() + ', спасибо! Это демо-сайт, поэтому заявка никуда не ушла. На настоящем сайте Дарья получила бы её в Telegram и ответила в течение дня.';
  });

  /* плавное появление блоков при прокрутке */
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var els = $$('.why__pic, .big-title, .why__intro, .why__list li, .signs, .places__head, .place, .about__text, .steps__list li, .center-title, .offer__text, .offer__pic, .card--faq, .book__head, .form');
    els.forEach(function (el) { el.classList.add('rise'); });
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* демо-ссылки */
  var toast = $('#toast'), tt;
  $$('[data-demo]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      toast.textContent = 'Это демо: на настоящем сайте здесь будет ссылка';
      toast.classList.add('show'); clearTimeout(tt);
      tt = setTimeout(function () { toast.classList.remove('show'); }, 2200);
    });
  });
})();
