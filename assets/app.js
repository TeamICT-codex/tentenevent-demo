/* TENTenEVENT — interacties (prototype) */
(function () {
  "use strict";

  /* ---------- Mobiel menu ---------- */
  const burger = document.querySelector("[data-burger]");
  const menu = document.querySelector("[data-mobile-menu]");
  const backdrop = document.querySelector("[data-backdrop]");
  const closeBtn = document.querySelector("[data-mm-close]");
  function openMenu() { menu && menu.classList.add("open"); backdrop && backdrop.classList.add("open"); document.body.style.overflow = "hidden"; }
  function closeMenu() { menu && menu.classList.remove("open"); backdrop && backdrop.classList.remove("open"); document.body.style.overflow = ""; }
  burger && burger.addEventListener("click", openMenu);
  closeBtn && closeBtn.addEventListener("click", closeMenu);
  backdrop && backdrop.addEventListener("click", closeMenu);

  /* Mobiele accordions in menu */
  document.querySelectorAll(".mm-acc-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const sub = btn.nextElementSibling;
      const open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      sub && sub.classList.toggle("open", !open);
    });
  });

  /* ---------- FAQ-accordion ---------- */
  document.querySelectorAll(".faq-item").forEach((item) => {
    const q = item.querySelector(".faq-q");
    const a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", () => {
      const open = item.classList.contains("open");
      // Optioneel: sluit anderen in dezelfde groep
      if (item.dataset.solo !== "false") {
        const group = item.closest(".faq");
        group && group.querySelectorAll(".faq-item.open").forEach((o) => {
          if (o !== item) { o.classList.remove("open"); o.querySelector(".faq-a").style.maxHeight = null; o.querySelector(".faq-q").setAttribute("aria-expanded", "false"); }
        });
      }
      item.classList.toggle("open", !open);
      q.setAttribute("aria-expanded", String(!open));
      a.style.maxHeight = open ? null : a.scrollHeight + "px";
    });
  });

  /* ---------- Scroll-reveal ---------- */
  const reveals = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Tentgrootte-calculator ----------
     Aanbeveling op basis van: aantal gasten, zittend/staand, extra ruimte (buffet/dans/dj).
     Dit is een indicatieve adviestool — geen reservatie. */
  const calc = document.querySelector("[data-calc]");
  if (calc) {
    const guestsEl = calc.querySelector("[data-guests]");
    const guestsVal = calc.querySelector("[data-guests-val]");
    const out = {
      size: calc.querySelector("[data-out-size]"),
      type: calc.querySelector("[data-out-type]"),
      area: calc.querySelector("[data-out-area]"),
      formula: calc.querySelector("[data-out-formula]"),
      note: calc.querySelector("[data-out-note]"),
    };

    // m² per persoon richtwaarde
    function recommend() {
      const guests = parseInt(guestsEl.value, 10) || 0;
      const seating = (calc.querySelector("input[name='seating']:checked") || {}).value || "zittend";
      const extras = Array.from(calc.querySelectorAll("input[name='extra']:checked")).map((c) => c.value);

      // basis m²/persoon
      let perPax = seating === "zittend" ? 1.4 : 0.9; // zittend aan tafels vraagt meer ruimte
      let area = guests * perPax;
      // extra's
      let extraArea = 0;
      if (extras.includes("buffet")) extraArea += 6;
      if (extras.includes("dans")) extraArea += Math.max(10, guests * 0.4);
      if (extras.includes("dj")) extraArea += 4;
      area += extraArea;

      // kies tent uit catalogus
      const cat = [
        { m2: 13.5, label: "3 × 4,5 m", type: "Vouwtent", pax: 12 },
        { m2: 18,   label: "3 × 6 m",   type: "Vouwtent", pax: 18 },
        { m2: 24,   label: "4 × 6 m",   type: "Vouwtent", pax: 22 },
        { m2: 32,   label: "4 × 8 m",   type: "Vouw- of partytent", pax: 28 },
        { m2: 40,   label: "5 × 8 m",   type: "Partytent", pax: 34 },
        { m2: 48,   label: "6 × 8 m",   type: "Partytent", pax: 40 },
        { m2: 50,   label: "5 × 10 m",  type: "Partytent", pax: 44 },
        { m2: 60,   label: "6 × 10 m",  type: "Partytent", pax: 52 },
        { m2: 72,   label: "6 × 12 m",  type: "Partytent (of combinatie)", pax: 60 },
      ];
      let pick = cat.find((c) => c.m2 >= area) || cat[cat.length - 1];

      // Stertent-suggestie bij ruime, stijlvolle zittende setups
      let note = "Richtwaarde — wij bevestigen het juiste formaat op basis van je locatie en opstelling.";
      if (guests >= 40 && guests <= 65 && seating === "zittend" && !extras.includes("dans")) {
        note = "Tip: voor een stijlvol tuinfeest in deze grootte is onze stertent (Ø 14 m) een prachtig alternatief.";
      }
      if (guests > 60) {
        note = "Voor meer dan 60 gasten stellen we vaak een combinatie van tenten voor — vraag gericht advies aan.";
      }

      out.size.textContent = pick.label;
      out.type.textContent = pick.type;
      out.area.textContent = Math.ceil(area) + " m²";
      out.formula.textContent = guests <= 24 ? "Afhaling of plaatsing" : "Plaatsing aanbevolen";
      out.note.textContent = note;

      // geef de aanbeveling door aan het offerteformulier
      const cta = calc.querySelector("[data-calc-cta]");
      if (cta) cta.href = "offerte.html?gasten=" + guests + "&tent=" + encodeURIComponent(pick.label) + "&zit=" + seating;
    }

    function syncGuests() { if (guestsVal) guestsVal.textContent = guestsEl.value; recommend(); }
    guestsEl && guestsEl.addEventListener("input", syncGuests);
    calc.querySelectorAll("input[name='seating'],input[name='extra']").forEach((el) => el.addEventListener("change", recommend));
    syncGuests();
  }

  /* ---------- Meerstaps-offerteformulier ---------- */
  const form = document.querySelector("[data-multistep]");
  if (form) {
    const steps = Array.from(form.querySelectorAll(".fstep"));
    const bars = Array.from(form.querySelectorAll(".steps-bar .s"));
    const btnNext = form.querySelectorAll("[data-next]");
    const btnPrev = form.querySelectorAll("[data-prev]");
    let i = 0;

    function render() {
      steps.forEach((s, n) => s.classList.toggle("active", n === i));
      bars.forEach((b, n) => {
        b.classList.toggle("active", n === i);
        b.classList.toggle("done", n < i);
      });
      const top = form.getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({ top, behavior: "smooth" });
    }
    function valid(stepEl) {
      const required = stepEl.querySelectorAll("[required]");
      for (const f of required) {
        if (!f.value || (f.type === "checkbox" && !f.checked)) {
          f.focus();
          f.classList.add("err");
          f.style.boxShadow = "inset 0 0 0 2px #c4592e";
          setTimeout(() => (f.style.boxShadow = ""), 1600);
          return false;
        }
      }
      return true;
    }
    btnNext.forEach((b) => b.addEventListener("click", () => {
      if (!valid(steps[i])) return;
      if (i < steps.length - 1) { i++; render(); }
    }));
    btnPrev.forEach((b) => b.addEventListener("click", () => { if (i > 0) { i--; render(); } }));

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!valid(steps[i])) return;
      const done = form.querySelector("[data-done]");
      const card = form.querySelector("[data-form-card]");
      if (done && card) { card.style.display = "none"; done.style.display = "block"; window.scrollTo({ top: form.getBoundingClientRect().top + window.scrollY - 110, behavior: "smooth" }); }
    });
    render();
  }

  /* ---------- Offerteformulier voorinvullen vanuit querystring ----------
     Regiopagina's linken met ?regio=, de keuzehulp met ?gasten=&tent=&zit=,
     pakketkaarten met ?pakket=. Zo typt de bezoeker niets dubbel. */
  if (form) {
    const params = new URLSearchParams(window.location.search);
    const setVal = (id, v) => { const el = document.getElementById(id); if (el && v) el.value = v; };
    setVal("gemeente", params.get("regio"));
    setVal("gasten", params.get("gasten"));
    const zit = params.get("zit");
    if (zit) { const r = form.querySelector("input[name='ozs'][value='" + zit + "']"); if (r) r.checked = true; }
    const tentSel = document.getElementById("tent");
    if (tentSel && params.get("pakket")) tentSel.value = "Feestpakket (tent + tafels + stoelen)";
    const tentMaat = params.get("tent");
    if (tentMaat) {
      const opm = document.getElementById("opm");
      if (opm && !opm.value) opm.value = "Aanbevolen formaat via de keuzehulp: " + tentMaat;
    }
  }

  /* ---------- Themaschakelaar (licht standaard, donker secundair) ---------- */
  const docEl = document.documentElement;
  if (!docEl.getAttribute("data-theme")) docEl.setAttribute("data-theme", "light");
  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = docEl.getAttribute("data-theme") === "dark" ? "light" : "dark";
      docEl.setAttribute("data-theme", next);
      try { localStorage.setItem("te-theme", next); } catch (e) {}
    });
  });

  /* ---------- Jaartal footer ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = "2026"));
})();
