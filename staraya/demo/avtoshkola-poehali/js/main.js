/* Поехали! — демо автошколы */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- меню ---------- */
  const menu = $('[data-menu]');
  const openers = $$('[data-menu-open]');
  let lastOpener = null;
  const setMenu = (open, opener) => {
    if (open) {
      lastOpener = opener || null;
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add('is-open'));
      document.body.style.overflow = 'hidden';
      $('[data-menu-close]', menu).focus();
    } else {
      menu.classList.remove('is-open');
      document.body.style.overflow = '';
      setTimeout(() => { menu.hidden = true; }, 300);
      if (lastOpener) lastOpener.focus({ preventScroll: true });
    }
    openers.forEach(b => b.setAttribute('aria-expanded', String(open)));
  };
  openers.forEach(b => b.addEventListener('click', () => setMenu(true, b)));
  $('[data-menu-close]', menu).addEventListener('click', () => setMenu(false));
  $$('a', menu).forEach(a => a.addEventListener('click', () => { lastOpener = null; setMenu(false); }));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });

  /* ---------- плавающая панель после главного экрана ---------- */
  const bar = $('[data-bar]');
  const hero = $('[data-hero]');
  if (bar && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => bar.classList.toggle('is-show', !e.isIntersecting), { threshold: 0.12 }).observe(hero);
  }

  /* ---------- форма записи ---------- */
  const digits = v => v.replace(/\D/g, '');
  const formatTel = (v) => {
    let d = digits(v);
    if (!d) return '';
    if (d[0] === '8') d = '7' + d.slice(1);
    if (d[0] !== '7') d = '7' + d;
    d = d.slice(0, 11);
    let out = '+7';
    if (d.length > 1) out += ' ' + d.slice(1, 4);
    if (d.length > 4) out += ' ' + d.slice(4, 7);
    if (d.length > 7) out += '-' + d.slice(7, 9);
    if (d.length > 9) out += '-' + d.slice(9, 11);
    return out;
  };

  $$('[data-form]').forEach(form => {
    const tel = $('input[type="tel"]', form);
    const err = $('.field__err', form);
    const btn = $('button[type="submit"]', form);
    const done = $('.form__done', form);

    tel.addEventListener('input', () => {
      tel.value = formatTel(tel.value);
      if (tel.getAttribute('aria-invalid') === 'true' && digits(tel.value).length === 11) {
        tel.removeAttribute('aria-invalid'); err.textContent = '';
      }
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (digits(tel.value).length !== 11) {
        tel.setAttribute('aria-invalid', 'true');
        err.textContent = tel.value ? 'В номере не хватает цифр: нужно 11, например +7 900 123-45-67' : 'Оставь телефон, чтобы мы могли перезвонить';
        tel.focus();
        return;
      }
      btn.disabled = true;
      const label = btn.innerHTML;
      btn.textContent = 'Отправляем…';
      setTimeout(() => { done.hidden = false; btn.disabled = false; btn.innerHTML = label; }, 700);
    });
  });

  /* стрелки в карточках категорий выбирают курс в форме */
  $$('[data-pick]').forEach(a => a.addEventListener('click', () => {
    const radio = $$('#final input[name="kurs"]').find(r => r.value === a.dataset.pick);
    if (radio) radio.checked = true;
  }));

  /* ---------- билет: 3 вопроса ---------- */
  const QUIZ = [
    {
      q: 'С какой скоростью можно ехать на легковой машине в городе, если знаков нет?',
      a: ['50 км/ч', '60 км/ч', '70 км/ч'],
      right: 1,
      why: 'В населённых пунктах — не больше 60 км/ч, если знаки не разрешают другое.'
    },
    {
      q: 'Что означает мигающий жёлтый сигнал светофора?',
      a: ['Движение запрещено, скоро загорится красный', 'Движение разрешено, впереди нерегулируемый перекрёсток или переход', 'Светофор сломан, можно ехать как угодно'],
      right: 1,
      why: 'Мигающий жёлтый разрешает движение и предупреждает: дальше перекрёсток или переход, где светофор не помогает. Действуют знаки и правило помехи справа.'
    },
    {
      q: 'Солнечный день, загородная трасса. Нужно ли включать свет?',
      a: ['Нет, днём свет не нужен', 'Только если едешь быстрее 90 км/ч', 'Да: ближний свет или дневные ходовые огни всегда'],
      right: 2,
      why: 'Днём на ходу всегда должны гореть фары ближнего света или дневные ходовые огни, и в городе, и за городом.'
    }
  ];

  const quiz = $('[data-quiz]');
  if (quiz) {
    const el = {
      num: $('[data-q-num]', quiz), text: $('[data-q-text]', quiz), answers: $('[data-q-answers]', quiz),
      explain: $('[data-q-explain]', quiz), next: $('[data-q-next]', quiz), result: $('[data-q-result]', quiz),
      score: $('[data-q-score]', quiz), verdict: $('[data-q-verdict]', quiz), again: $('[data-q-again]', quiz),
      count: $('.quiz__count', quiz)
    };
    let i = 0, score = 0;
    const letters = ['А', 'Б', 'В'];

    const render = () => {
      const item = QUIZ[i];
      el.num.textContent = i + 1;
      el.text.textContent = item.q;
      el.explain.hidden = true;
      el.next.hidden = true;
      el.answers.innerHTML = '';
      item.a.forEach((txt, k) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ans';
        b.innerHTML = `<span class="ans__mark">${letters[k]}</span><span></span>`;
        b.lastChild.textContent = txt;
        b.addEventListener('click', () => choose(k));
        el.answers.appendChild(b);
      });
    };

    const choose = (k) => {
      const item = QUIZ[i];
      const btns = $$('.ans', el.answers);
      btns.forEach(b => b.disabled = true);
      const ok = k === item.right;
      if (ok) score++;
      btns[item.right].classList.add('is-right');
      btns[item.right].firstChild.innerHTML = '<svg aria-hidden="true"><use href="#i-check"/></svg>';
      if (!ok) {
        btns[k].classList.add('is-wrong');
        btns[k].firstChild.innerHTML = '<svg aria-hidden="true"><use href="#i-x"/></svg>';
      }
      el.explain.textContent = (ok ? 'Верно! ' : 'Не совсем. ') + item.why;
      el.explain.hidden = false;
      if (i < QUIZ.length - 1) {
        el.next.hidden = false;
        el.next.focus({ preventScroll: true });
      } else {
        setTimeout(finish, 900);
      }
    };

    const finish = () => {
      el.text.textContent = '';
      el.answers.innerHTML = '';
      el.explain.hidden = true;
      el.count.hidden = true;
      el.score.textContent = score;
      el.verdict.textContent = score === 3
        ? 'Отлично! Теория тебе даётся. Осталось научиться водить — это к нам.'
        : score === 2
          ? 'Почти! Остальное разберём на теории, там всё объясняют на живых примерах.'
          : 'Ничего страшного: для этого и есть автошкола. Через месяц такие вопросы будут щёлкаться как орешки.';
      el.result.hidden = false;
    };

    el.next.addEventListener('click', () => { i++; render(); });
    el.again.addEventListener('click', () => {
      i = 0; score = 0; el.result.hidden = true; el.count.hidden = false; render();
    });
    render();
  }

  /* ---------- шаги: машинка едет при прокрутке ---------- */
  const steps = $('[data-steps]');
  if (steps) {
    const items = $$('.step', steps);
    let ticking = false;
    const update = () => {
      ticking = false;
      const r = steps.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      steps.style.setProperty('--p', p.toFixed(4));
      const vertical = window.matchMedia('(max-width:760px)').matches;
      items.forEach((s, k) => {
        let on;
        if (vertical) {
          const sr = s.getBoundingClientRect();
          on = (sr.top + sr.height * 0.4 - r.top) / r.height <= p;
        } else {
          on = p >= (k + 0.5) / items.length - 0.08;
        }
        s.classList.toggle('is-on', on);
      });
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }
})();
