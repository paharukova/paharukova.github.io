/* Квиз «Подбор занятий» — онлайн-школа «Шаг вперёд» (демо).
   Всё работает в браузере: ответы хранятся в объекте A, экраны рисуются функцией show().
   Заявка в демо никуда не отправляется. */
(function () {
  'use strict';

  var app = document.getElementById('app');
  var A = {};            // ответы: grade, subject, goal, level, format, freq
  var step = -1;         // -1 = стартовый экран, 0..5 = вопросы, 6 = результат, 7 = спасибо
  var lead = {};         // данные из формы

  // ---------- Маленькие иконки ----------
  var ICON = {
    clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    gift: '<svg viewBox="0 0 24 24"><rect x="3" y="9" width="18" height="12" rx="2"/><path d="M3 13h18M12 9v12M12 9c-2-4-6-4-6-1.5S9 9 12 9zm0 0c2-4 6-4 6-1.5S15 9 12 9z"/></svg>',
    ruble: '<svg viewBox="0 0 24 24"><path d="M8 20V4h5.5a4 4 0 0 1 0 8H6M6 16h8"/></svg>',
    back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    book: '<svg viewBox="0 0 24 24"><path d="M4 5.5C6.5 4 9.5 4 12 6c2.5-2 5.5-2 8-.5V19c-2.5-1.5-5.5-1.5-8 .5-2.5-2-5.5-2-8-.5z"/><path d="M12 6v13.5"/></svg>',
    tg: '<svg viewBox="0 0 24 24"><path d="M21 4.5L3.5 11.3c-.9.4-.9 1 0 1.3l4.4 1.4 1.7 5.3c.2.6.4.8.9.8.4 0 .6-.2.9-.5l2.2-2.1 4.5 3.3c.8.5 1.4.2 1.6-.8L22.6 6c.3-1.3-.5-1.9-1.6-1.5z"/></svg>',
    max: '<svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z"/></svg>',
    phone: '<svg viewBox="0 0 24 24"><path d="M6.6 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5.9 5.9l1.5-2 4 1.5v3c0 1-.8 1.8-1.8 1.8C10.4 19.2 4.8 13.6 4.8 5.3c0-1 .8-1.8 1.8-1.8z"/></svg>'
  };

  // ---------- Справочники ----------
  var GRADE = {
    g1: { label: '1–4 класс', exam: 'ВПР', lesson: 45, price: { ind: 900, grp: 500 } },
    g2: { label: '5–8 класс', exam: 'ВПР', lesson: 60, price: { ind: 1000, grp: 550 } },
    g3: { label: '9 класс', exam: 'ОГЭ', lesson: 60, price: { ind: 1200, grp: 650 } },
    g4: { label: '10–11 класс', exam: 'ЕГЭ', lesson: 60, price: { ind: 1300, grp: 700 } }
  };
  var SUBJ = {
    math: { name: 'Математика', po: 'по математике' },
    rus:  { name: 'Русский язык', po: 'по русскому языку' },
    eng:  { name: 'Английский', po: 'по английскому' },
    phys: { name: 'Физика', po: 'по физике' },
    read: { name: 'Чтение', po: 'по чтению' }
  };
  var TEACHER = {
    math: { name: 'Анна Сергеевна', ini: 'АС', exp: '9 лет', note: 'готовит к ОГЭ и ЕГЭ', c: 'indigo' },
    rus:  { name: 'Ольга Викторовна', ini: 'ОВ', exp: '12 лет', note: 'эксперт ОГЭ по русскому', c: 'orange' },
    eng:  { name: 'Мария Андреевна', ini: 'МА', exp: '7 лет', note: 'уровень C1, жила в Лондоне', c: 'mint' },
    phys: { name: 'Дмитрий Олегович', ini: 'ДО', exp: '10 лет', note: 'объясняет на опытах', c: 'yellow' },
    read: { name: 'Елена Павловна', ini: 'ЕП', exp: '15 лет', note: 'учитель начальных классов', c: 'pink' }
  };

  // ---------- Вопросы ----------
  var QUESTIONS = [
    {
      key: 'grade', title: 'В каком классе учится ребёнок?', hint: 'Подберём программу по возрасту', cols: 2,
      options: function () {
        return [
          { v: 'g1', t: 'Начальная школа', s: '1–4 класс', g: '1–4', c: 'yellow' },
          { v: 'g2', t: 'Средняя школа', s: '5–8 класс', g: '5–8', c: 'mint' },
          { v: 'g3', t: '9 класс', s: 'впереди ОГЭ', g: '9', c: 'indigo' },
          { v: 'g4', t: '10–11 класс', s: 'впереди ЕГЭ', g: '11', c: 'orange' }
        ];
      }
    },
    {
      key: 'subject', title: 'Какой предмет нужен?', hint: 'Если несколько — выберите главный, остальные обсудим на пробном уроке', cols: 2,
      options: function () {
        var last = A.grade === 'g1'
          ? { v: 'read', t: 'Чтение', s: 'техника и понимание', g: ICON.book, c: 'pink', svg: true }
          : { v: 'phys', t: 'Физика', s: 'с 7 класса', g: 'F', c: 'yellow' };
        return [
          { v: 'math', t: 'Математика', g: A.grade === 'g1' ? '2+2' : 'π', c: 'indigo' },
          { v: 'rus', t: 'Русский язык', g: 'Аа', c: 'orange' },
          { v: 'eng', t: 'Английский', g: 'Ab', c: 'mint' },
          last
        ];
      }
    },
    {
      key: 'goal', title: 'Чего хотите добиться?', hint: 'Выберите самое важное сейчас', cols: 1,
      options: function () {
        var ex = GRADE[A.grade].exam;
        var examText = ex === 'ВПР' ? 'Подготовиться к ВПР и контрольным' : 'Подготовиться к ' + ex;
        return [
          { v: 'grades', t: 'Подтянуть оценки', s: 'Чтобы в четверти не было троек', g: '5', c: 'orange' },
          { v: 'gaps', t: 'Разобраться в непонятных темах', s: 'Закрыть пробелы, которые тянутся с прошлого года', g: '?', c: 'mint' },
          { v: 'exam', t: examText, s: ex === 'ВПР' ? 'Спокойно написать проверочные' : 'Сдать на высокий балл без паники', g: ex, c: 'indigo', small: true },
          { v: 'deep', t: 'Углубиться, олимпиады', s: 'Ребёнку интересно, хочется больше школы', g: '★', c: 'yellow' }
        ];
      }
    },
    {
      key: 'level', title: 'Как сейчас дела с предметом?', hint: 'Честный ответ поможет подобрать темп', cols: 1,
      options: function () {
        return [
          { v: 'low', t: 'Трудно', s: 'Часто тройки и двойки, теряется интерес', g: '3', c: 'pink' },
          { v: 'mid', t: 'Средне', s: 'В целом справляется, но есть пробелы', g: '4', c: 'yellow' },
          { v: 'high', t: 'Хорошо', s: 'Учится уверенно и хочет большего', g: '5', c: 'mint' }
        ];
      }
    },
    {
      key: 'format', title: 'Как удобнее заниматься?', hint: 'Все занятия онлайн, с камерой и общей доской', cols: 1,
      options: function () {
        return [
          { v: 'ind', t: 'Один на один с преподавателем', s: 'Всё внимание — вашему ребёнку', g: '1:1', c: 'indigo', small: true },
          { v: 'grp', t: 'Мини-группа, 3–4 ученика', s: 'Дешевле, и вместе веселее', g: '3–4', c: 'orange', small: true },
          { v: 'any', t: 'Пока не знаю', s: 'Посоветуем по вашим ответам', g: '?', c: 'mint' }
        ];
      }
    },
    {
      key: 'freq', title: 'Сколько раз в неделю удобно?', hint: 'Время подберём под расписание ребёнка', cols: 2,
      options: function () {
        return [
          { v: '1', t: '1 раз', s: 'поддерживать уровень', g: '1×', c: 'mint' },
          { v: '2', t: '2 раза', s: 'выбирают чаще всего', g: '2×', c: 'indigo' },
          { v: '3', t: '3 раза', s: 'интенсив перед экзаменом', g: '3×', c: 'orange' },
          { v: 'any', t: 'Посоветуйте', s: 'подскажем по ответам', g: '?', c: 'yellow' }
        ];
      }
    }
  ];

  // ---------- Расчёт результата ----------
  function result() {
    var gr = GRADE[A.grade], sb = SUBJ[A.subject];
    var format = A.format === 'any' ? (A.level === 'low' || A.goal === 'exam' ? 'ind' : 'grp') : A.format;
    var freq = A.freq === 'any'
      ? ((A.goal === 'exam' && (A.grade === 'g3' || A.grade === 'g4')) || A.level === 'low' ? 2 : 1)
      : +A.freq;

    var title;
    if (A.goal === 'exam') title = 'Подготовка к ' + gr.exam + ' ' + sb.po;
    else if (A.goal === 'grades') title = sb.name + ': подтягиваем оценки';
    else if (A.goal === 'gaps') title = sb.name + ': закрываем пробелы';
    else title = sb.name + ': углублённый курс';

    var middle = {
      grades: 'Разбираем темы текущей четверти и помогаем с домашкой — оценки растут уже в первый месяц',
      gaps: 'Возвращаемся к пропущенным темам и закрываем их по одной, без зубрёжки',
      exam: 'Решаем задания ' + gr.exam + ' по порядку: от простых к сложным, с разбором ошибок',
      deep: 'Задачи повышенной сложности, нестандартные решения, подготовка к олимпиадам'
    }[A.goal];
    if (A.level === 'low') middle = 'Начинаем с того, что получается, — возвращаем уверенность. ' + middle;

    var last = A.goal === 'exam' && gr.exam !== 'ВПР'
      ? 'Через месяц — пробный вариант ' + gr.exam + ' и отчёт родителям: какой балл сейчас и куда растём'
      : 'Раз в неделю — короткий отчёт родителям в мессенджер: что прошли и что получается';

    var perLesson = gr.price[format];
    return {
      title: title,
      grade: gr.label,
      lesson: gr.lesson,
      format: format,
      formatText: format === 'ind' ? 'Один на один' : 'Мини-группа 3–4 ученика',
      freq: freq,
      perLesson: perLesson,
      month: perLesson * freq * 4,
      advised: A.format === 'any' || A.freq === 'any',
      plan: ['Бесплатный пробный урок: знакомимся и находим, какие темы проседают', middle, last],
      teacher: TEACHER[A.subject]
    };
  }

  // ---------- Помощники ----------
  function rub(n) { return n.toLocaleString('ru-RU') + ' ₽'; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function times(n) { return n === 1 ? 'раз' : (n < 5 ? 'раза' : 'раз'); }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function render(html, dir) {
    var screen = document.createElement('section');
    screen.className = 'screen' + (reduce ? '' : (dir === 'back' ? ' in-back' : ' in'));
    screen.innerHTML = html;
    app.innerHTML = '';
    app.appendChild(screen);
    var focus = screen.querySelector('[data-focus]');
    if (focus) focus.focus({ preventScroll: true });
    if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    return screen;
  }

  // ---------- Экраны ----------
  function startScreen(dir) {
    var s = render(
      '<div class="card start">' +
        '<p class="eyebrow">Подбор занятий за 1 минуту</p>' +
        '<h1 data-focus tabindex="-1">Узнайте, как&nbsp;подтянуть ребёнка по&nbsp;любимому и&nbsp;нелюбимому предмету</h1>' +
        '<p class="lead">Ответьте на 6 простых вопросов — и сразу увидите план занятий, преподавателя и цену.</p>' +
        '<ul class="perks">' +
          '<li><i class="ic">' + ICON.clock + '</i><span><b>1 минута</b>6 вопросов</span></li>' +
          '<li><i class="ic">' + ICON.ruble + '</i><span><b>Цена сразу</b>без звонков</span></li>' +
          '<li><i class="ic">' + ICON.gift + '</i><span><b>Урок в подарок</b>первый — бесплатно</span></li>' +
        '</ul>' +
        '<button class="btn btn-main" type="button" data-go="next">Подобрать занятия<span class="arr">→</span></button>' +
        '<div class="social">' +
          '<span class="faces"><i class="f1">А</i><i class="f2">М</i><i class="f3">Е</i><i class="f4">+</i></span>' +
          '<span>Уже подобрали занятия <b>1&nbsp;240 семьям</b> · ★&nbsp;4,9 на Яндекс Картах</span>' +
        '</div>' +
      '</div>', dir);
    s.querySelector('[data-go]').addEventListener('click', function () { go(0); });
  }

  function questionScreen(i, dir) {
    var q = QUESTIONS[i];
    var opts = q.options();
    // если ответ больше не подходит (например, сменили класс) — сбрасываем
    if (A[q.key] && !opts.some(function (o) { return o.v === A[q.key]; })) delete A[q.key];
    var left = QUESTIONS.length - i - 1;
    var hintLeft = left === 0 ? 'Последний вопрос — и покажем результат'
      : 'Потом ещё ' + left + ' ' + (left === 1 ? 'вопрос' : left < 5 ? 'вопроса' : 'вопросов');

    var html =
      '<div class="card q">' +
        '<div class="q-top">' +
          '<button class="back" type="button" data-back aria-label="Назад">' + ICON.back + '</button>' +
          '<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="' + QUESTIONS.length + '" aria-valuenow="' + (i + 1) + '" aria-label="Вопрос ' + (i + 1) + ' из ' + QUESTIONS.length + '">' +
            '<span style="width:' + ((i + 1) / QUESTIONS.length * 100) + '%"></span>' +
          '</div>' +
          '<span class="count">' + (i + 1) + '/' + QUESTIONS.length + '</span>' +
        '</div>' +
        '<h2 data-focus tabindex="-1">' + q.title + '</h2>' +
        '<p class="hint">' + q.hint + '</p>' +
        '<div class="opts cols-' + q.cols + '" role="radiogroup" aria-label="' + esc(q.title) + '">' +
          opts.map(function (o) {
            var on = A[q.key] === o.v;
            return '<button type="button" role="radio" aria-checked="' + on + '" class="opt' + (on ? ' on' : '') + '" data-v="' + o.v + '">' +
              '<span class="glyph c-' + o.c + (o.small ? ' sm' : '') + (o.svg ? ' svg' : '') + '">' + o.g + '</span>' +
              '<span class="opt-text"><b>' + o.t + '</b>' + (o.s ? '<small>' + o.s + '</small>' : '') + '</span>' +
              '<span class="tick">' + ICON.check + '</span>' +
            '</button>';
          }).join('') +
        '</div>' +
        '<p class="left">' + hintLeft + '</p>' +
      '</div>';

    var s = render(html, dir);
    s.querySelector('[data-back]').addEventListener('click', function () { go(i - 1, 'back'); });
    var busy = false;
    s.querySelectorAll('.opt').forEach(function (b) {
      b.addEventListener('click', function () {
        if (busy) return;
        busy = true;
        A[q.key] = b.dataset.v;
        if (TG) try { TG.HapticFeedback.selectionChanged(); } catch (e) {}
        s.querySelectorAll('.opt').forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', x === b); });
        setTimeout(function () { go(i + 1); }, reduce ? 0 : 280);
      });
    });
  }

  function resultScreen(dir) {
    var r = result();
    var t = r.teacher;
    var html =
      '<div class="card res">' +
        '<div class="q-top">' +
          '<button class="back" type="button" data-back aria-label="Назад к вопросам">' + ICON.back + '</button>' +
          '<div class="progress done"><span style="width:100%"></span></div>' +
          '<span class="count ok">' + ICON.check + '</span>' +
        '</div>' +
        '<p class="eyebrow">Ваша программа готова</p>' +
        '<h2 data-focus tabindex="-1">' + r.title + '</h2>' +
        '<ul class="chips">' +
          '<li>' + r.grade + '</li><li>' + r.formatText + '</li><li>' + r.freq + ' ' + times(r.freq) + ' в неделю</li><li>урок ' + r.lesson + ' мин</li>' +
        '</ul>' +
        (r.advised ? '<p class="advice">Формат и частоту подобрали по вашим ответам — на пробном уроке можно поменять.</p>' : '') +

        '<div class="block plan">' +
          '<h3>План на первый месяц</h3>' +
          '<ol>' + r.plan.map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ol>' +
        '</div>' +

        '<div class="row2">' +
          '<div class="block teacher">' +
            '<span class="ava c-' + t.c + '">' + t.ini + '</span>' +
            '<div><small>Преподаватель</small><b>' + t.name + '</b><span>' + t.exp + ' стажа · ' + t.note + '</span></div>' +
          '</div>' +
          '<div class="block price">' +
            '<small>Стоимость</small>' +
            '<b>' + rub(r.month) + '<em>/мес</em></b>' +
            '<span>' + rub(r.perLesson) + ' за урок · ' + r.freq * 4 + ' ' + (r.freq * 4 < 5 ? 'урока' : 'уроков') + '</span>' +
          '</div>' +
        '</div>' +

        '<form class="block form" novalidate>' +
          '<div class="gift"><i class="ic">' + ICON.gift + '</i><div><b>Первый урок — бесплатно</b><span>Запишитесь, и администратор подберёт удобное время</span></div></div>' +
          '<label class="fld"><span>Ваше имя</span><input name="name" autocomplete="given-name" placeholder="Например, Анна" required></label>' +
          '<label class="fld"><span>Телефон</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__" required></label>' +
          '<fieldset class="how"><legend>Где удобнее получить ответ?</legend>' +
            '<label><input type="radio" name="how" value="Telegram" checked><span>' + ICON.tg + 'Telegram</span></label>' +
            '<label><input type="radio" name="how" value="MAX"><span>' + ICON.max + 'MAX</span></label>' +
            '<label><input type="radio" name="how" value="Звонок"><span>' + ICON.phone + 'Звонок</span></label>' +
          '</fieldset>' +
          '<label class="agree"><input type="checkbox" name="agree"><span>Соглашаюсь на обработку персональных данных</span></label>' +
          '<p class="err" role="alert"></p>' +
          '<button class="btn btn-main" type="submit">Записаться бесплатно<span class="arr">→</span></button>' +
          '<p class="note">Демо: школа вымышлена, заявка никуда не отправляется.</p>' +
        '</form>' +
      '</div>';

    var s = render(html, dir);
    s.querySelector('[data-back]').addEventListener('click', function () { go(QUESTIONS.length - 1, 'back'); });

    var form = s.querySelector('form');
    var phone = form.elements.phone;
    phone.addEventListener('input', function () { phone.value = maskPhone(phone.value); });
    phone.addEventListener('focus', function () { if (!phone.value) phone.value = '+7 ('; });
    phone.addEventListener('blur', function () { if (phone.value === '+7 (') phone.value = ''; });

    if (lead.name) form.elements.name.value = lead.name;
    if (lead.phone) phone.value = lead.phone;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var err = form.querySelector('.err');
      var name = form.elements.name.value.trim();
      var digits = phone.value.replace(/\D/g, '');
      form.querySelectorAll('.bad').forEach(function (x) { x.classList.remove('bad'); });
      var msg = '';
      if (!name) { msg = 'Напишите, как к вам обращаться'; form.elements.name.parentNode.classList.add('bad'); }
      else if (digits.length !== 11) { msg = 'Проверьте номер телефона — нужно 10 цифр после +7'; phone.parentNode.classList.add('bad'); }
      else if (!form.elements.agree.checked) { msg = 'Отметьте согласие на обработку данных'; form.querySelector('.agree').classList.add('bad'); }
      err.textContent = msg;
      if (msg) return;
      lead = { name: name, phone: phone.value, how: form.elements.how.value, program: r.title };
      go(QUESTIONS.length + 1);
    });
  }

  function maskPhone(v) {
    var d = v.replace(/\D/g, '');
    if (d[0] === '8' || d[0] === '7') d = d.slice(1);
    d = d.slice(0, 10);
    var out = '+7 (' + d.slice(0, 3);
    if (d.length >= 3) out += ') ' + d.slice(3, 6);
    if (d.length >= 6) out += '-' + d.slice(6, 8);
    if (d.length >= 8) out += '-' + d.slice(8, 10);
    return out;
  }

  function thanksScreen(dir) {
    var how = lead.how === 'Звонок'
      ? 'позвонит вам'
      : 'напишет вам в ' + lead.how;
    var s = render(
      '<div class="card thanks">' +
        '<span class="big-ok">' + ICON.check + '</span>' +
        '<h2 data-focus tabindex="-1">Готово, ' + esc(lead.name) + '!</h2>' +
        '<p class="lead">Мария, администратор школы, ' + how + ' в течение 15 минут и подберёт время пробного урока.</p>' +
        '<div class="block summary">' +
          '<small>Ваша заявка</small>' +
          '<b>' + lead.program + '</b>' +
          '<span>' + esc(lead.phone) + ' · ' + lead.how + '</span>' +
        '</div>' +
        '<p class="tip">А пока можно подготовить тетрадь и вспомнить, какие темы в школе даются труднее всего — с них и начнём.</p>' +
        '<button class="btn btn-ghost" type="button" data-restart>Пройти подбор ещё раз</button>' +
        '<p class="note">Демо: школа вымышлена, заявка никуда не отправлена.</p>' +
      '</div>', dir);
    s.querySelector('[data-restart]').addEventListener('click', function () { A = {}; go(-1, 'back'); });
  }

  // ---------- Навигация ----------
  function go(n, dir) {
    step = n;
    if (n < 0) startScreen(dir);
    else if (n < QUESTIONS.length) questionScreen(n, dir);
    else if (n === QUESTIONS.length) resultScreen(dir);
    else thanksScreen(dir);
  }

  // ---------- Telegram (мини-приложение) ----------
  // Если квиз открыт внутри Telegram: раскрываем на весь экран, красим шапку
  // в цвет страницы и подставляем имя из профиля. В обычном браузере ничего не делаем.
  var TG = null;
  function initTelegram() {
    var w = window.Telegram && window.Telegram.WebApp;
    if (!w || !w.initData) return;            // не внутри Telegram
    TG = w;
    document.documentElement.classList.add('in-tg');
    try {
      TG.ready();
      TG.expand();
      TG.setHeaderColor('#FFF6EA');
      TG.setBackgroundColor('#FFF6EA');
      if (TG.setBottomBarColor) TG.setBottomBarColor('#FFF6EA');
    } catch (e) {}
    var u = TG.initDataUnsafe && TG.initDataUnsafe.user;
    if (u && u.first_name && !lead.name) lead.name = u.first_name;
  }
  var tgScript = document.getElementById('tgjs');
  if (window.Telegram && window.Telegram.WebApp) initTelegram();
  else if (tgScript) tgScript.addEventListener('load', initTelegram);

  go(-1);
})();
