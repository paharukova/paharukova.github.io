/* Хвост трубой — интерактив: запись, вкладки цен, меню, чек-лист, обратный звонок */
(function () {
  "use strict";

  /* ---------- Мобильное меню ---------- */
  var burger = document.querySelector(".burger");
  var nav = document.getElementById("nav");
  function closeNav() { nav.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); burger.setAttribute("aria-label", "Открыть меню"); }
  burger.addEventListener("click", function () {
    var open = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
  });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) closeNav(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });

  /* ---------- Запись: окна приёма ---------- */
  var OPEN_H = 9, CLOSE_H = 21, STEP_MIN = 30, DAYS = 3, VISIBLE = 8;
  var dayTabs = document.getElementById("days");
  var slotsBox = document.getElementById("slots");
  var goBtn = document.getElementById("bookGo");
  var goText = document.getElementById("bookGoText");
  var nearestLabel = document.getElementById("nearestLabel");
  var tH = document.getElementById("tH"), tM = document.getElementById("tM"), tS = document.getElementById("tS");

  var state = { pet: "кошку", day: 0, slot: null, showAll: false };
  var days = [];
  var nearest = null;

  // Псевдослучайная «занятость», чтобы расписание выглядело живым и не прыгало при перерисовке
  function busy(dateKey, i) {
    var h = 0, s = dateKey + ":" + i;
    for (var k = 0; k < s.length; k++) h = (h * 31 + s.charCodeAt(k)) >>> 0;
    return h % 10 < 4;
  }

  function dayWord(d, i) {
    if (i === 0) return "сегодня";
    if (i === 1) return "завтра";
    return d.toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "long" });
  }

  function buildDays() {
    var now = new Date();
    days = [];
    for (var i = 0; i < DAYS; i++) {
      var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      var key = d.toISOString().slice(0, 10);
      var slots = [];
      for (var m = OPEN_H * 60, n = 0; m < CLOSE_H * 60; m += STEP_MIN, n++) {
        var t = new Date(d.getTime());
        t.setHours(0, m, 0, 0);
        if (t - now < 20 * 60 * 1000) continue; // прошедшие и слишком близкие
        slots.push({ time: t, label: pad(t.getHours()) + ":" + pad(t.getMinutes()), busy: busy(key, n) });
      }
      days.push({ date: d, word: dayWord(d, i), slots: slots });
    }
    nearest = null;
    for (var a = 0; a < days.length && !nearest; a++) {
      for (var b = 0; b < days[a].slots.length; b++) {
        if (!days[a].slots[b].busy) { nearest = { day: a, slot: days[a].slots[b] }; break; }
      }
    }
  }

  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function renderDays() {
    dayTabs.innerHTML = "";
    days.forEach(function (d, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "day" + (i === state.day ? " is-on" : "");
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", String(i === state.day));
      var top = i === 0 ? "Сегодня" : i === 1 ? "Завтра" : d.date.toLocaleDateString("ru-RU", { weekday: "short" }).replace(/^./, function (c) { return c.toUpperCase(); });
      b.innerHTML = top + " <small>" + d.date.getDate() + "</small>";
      b.addEventListener("click", function () {
        state.day = i; state.showAll = false;
        state.slot = firstFree(i);
        renderDays(); renderSlots(); renderGo();
      });
      dayTabs.appendChild(b);
    });
  }

  function firstFree(i) {
    var s = days[i].slots;
    for (var k = 0; k < s.length; k++) if (!s[k].busy) return s[k];
    return null;
  }

  function renderSlots() {
    slotsBox.innerHTML = "";
    var list = days[state.day].slots;
    if (!list.some(function (s) { return !s.busy; })) {
      var p = document.createElement("p");
      p.className = "slots__more";
      p.style.cursor = "default";
      p.textContent = "На этот день окон нет. Скорая помощь работает круглосуточно.";
      slotsBox.appendChild(p);
      return;
    }
    var shown = state.showAll ? list : list.slice(0, VISIBLE);
    shown.forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "slot" + (state.slot === s ? " is-on" : "");
      b.textContent = s.label;
      b.disabled = s.busy;
      b.setAttribute("aria-pressed", String(state.slot === s));
      if (s.busy) b.setAttribute("aria-label", s.label + ", занято");
      b.addEventListener("click", function () { state.slot = s; renderSlots(); renderGo(); });
      slotsBox.appendChild(b);
    });
    if (list.length > VISIBLE) {
      var more = document.createElement("button");
      more.type = "button";
      more.className = "slots__more";
      var rest = list.length - VISIBLE;
      more.textContent = state.showAll ? "Свернуть" : "Показать ещё " + rest + " " + plural(rest, "вариант", "варианта", "вариантов");
      more.addEventListener("click", function () { state.showAll = !state.showAll; renderSlots(); });
      slotsBox.appendChild(more);
    }
  }

  function renderGo() {
    if (state.slot) {
      goText.textContent = "Записать " + state.pet + " · " + days[state.day].word + ", " + state.slot.label;
      goBtn.disabled = false;
    } else {
      goText.textContent = "Выберите время";
      goBtn.disabled = true;
    }
  }

  function tick() {
    if (!nearest || nearest.slot.time - new Date() < 20 * 60 * 1000) {
      buildDays();
      if (state.slot && !days[state.day].slots.some(function (s) { return s.label === state.slot.label; })) {
        state.slot = firstFree(state.day);
        renderDays(); renderSlots(); renderGo();
      }
    }
    if (!nearest) return;
    var diff = Math.max(0, Math.floor((nearest.slot.time - new Date()) / 1000));
    var h = Math.floor(diff / 3600), m = Math.floor((diff % 3600) / 60), s = diff % 60;
    tH.textContent = pad(Math.min(h, 99)); tM.textContent = pad(m); tS.textContent = pad(s);
    nearestLabel.textContent = days[nearest.day].word + " в " + nearest.slot.label;
  }

  buildDays();
  if (nearest) { state.day = nearest.day; state.slot = nearest.slot; }
  renderDays(); renderSlots(); renderGo(); tick();
  setInterval(tick, 1000);

  document.getElementById("petChips").addEventListener("click", function (e) {
    var c = e.target.closest(".chip");
    if (!c) return;
    this.querySelectorAll(".chip").forEach(function (x) { x.classList.toggle("is-on", x === c); x.setAttribute("aria-pressed", String(x === c)); });
    state.pet = c.dataset.pet;
    renderGo();
  });
  document.querySelectorAll("#petChips .chip").forEach(function (x) { x.setAttribute("aria-pressed", String(x.classList.contains("is-on"))); });

  /* ---------- Запись: шаги ---------- */
  var steps = {};
  document.querySelectorAll(".book__step").forEach(function (el) { steps[el.dataset.step] = el; });
  function show(name) {
    Object.keys(steps).forEach(function (k) { steps[k].hidden = k !== name; });
    var focusEl = steps[name].querySelector("input, .book__title");
    if (focusEl && name !== "pick") { if (focusEl.tagName !== "INPUT") focusEl.setAttribute("tabindex", "-1"); focusEl.focus({ preventScroll: true }); }
  }

  var petNames = { "кошку": "кошка", "собаку": "собака", "грызуна": "грызун", "птицу": "птица", "питомца": "питомец" };
  goBtn.addEventListener("click", function () {
    if (!state.slot) return;
    document.getElementById("bookSummary").textContent =
      "Пациент: " + petNames[state.pet] + " · " + days[state.day].word + ", " + state.slot.label;
    show("form");
  });
  document.getElementById("bookBack").addEventListener("click", function () { show("pick"); goBtn.focus(); });

  function maskPhone(input) {
    input.addEventListener("input", function () {
      var d = input.value.replace(/\D/g, "");
      if (d[0] === "8" || d[0] === "7") d = d.slice(1);
      d = d.slice(0, 10);
      var out = "+7";
      if (d.length) out += " (" + d.slice(0, 3);
      if (d.length >= 3) out += ")";
      if (d.length > 3) out += " " + d.slice(3, 6);
      if (d.length > 6) out += "-" + d.slice(6, 8);
      if (d.length > 8) out += "-" + d.slice(8, 10);
      input.value = d.length ? out : "";
      input.removeAttribute("aria-invalid");
    });
  }
  function digits(v) { var d = v.replace(/\D/g, ""); if (d[0] === "7" || d[0] === "8") d = d.slice(1); return d; }

  var form = steps.form;
  var err = document.getElementById("bookErr");
  maskPhone(form.phone);
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    err.textContent = "";
    form.name.removeAttribute("aria-invalid");
    if (!form.name.value.trim()) { err.textContent = "Как к вам обращаться? Напишите имя."; form.name.setAttribute("aria-invalid", "true"); form.name.focus(); return; }
    if (digits(form.phone.value).length !== 10) { err.textContent = "Проверьте номер: нужно 10 цифр после +7."; form.phone.setAttribute("aria-invalid", "true"); form.phone.focus(); return; }
    var pet = form.pet.value.trim();
    document.getElementById("doneTitle").textContent = "Вы записаны!";
    document.getElementById("doneText").textContent =
      (pet ? pet + ", " : "") + days[state.day].word + " в " + state.slot.label +
      ". Администратор позвонит в течение 10 минут, чтобы подтвердить запись.";
    show("done");
  });
  document.getElementById("bookAgain").addEventListener("click", function () { form.reset(); err.textContent = ""; show("pick"); });

  /* ---------- Вкладки цен ---------- */
  var tabs = document.querySelectorAll(".tab");
  tabs.forEach(function (t) {
    t.addEventListener("click", function () {
      tabs.forEach(function (x) { var on = x === t; x.classList.toggle("is-on", on); x.setAttribute("aria-selected", String(on)); });
      document.querySelectorAll(".plist").forEach(function (p) { p.hidden = p.dataset.panel !== t.dataset.tab; });
    });
  });

  /* ---------- Чек-лист ---------- */
  var bag = document.getElementById("bag");
  bag.addEventListener("change", function () {
    var boxes = bag.querySelectorAll("input");
    var all = Array.prototype.every.call(boxes, function (b) { return b.checked; });
    bag.classList.toggle("is-done", all);
  });

  /* ---------- Обратный звонок ---------- */
  var call = document.getElementById("callForm");
  var callErr = document.getElementById("callErr");
  maskPhone(call.phone);
  call.addEventListener("submit", function (e) {
    e.preventDefault();
    if (digits(call.phone.value).length !== 10) { callErr.textContent = "Проверьте номер: нужно 10 цифр после +7."; call.phone.setAttribute("aria-invalid", "true"); call.phone.focus(); return; }
    callErr.textContent = "";
    call.hidden = true;
    document.getElementById("callOk").hidden = false;
  });
})();
