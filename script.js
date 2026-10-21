/* Jule Buchmann Portfolio – Scroll-Effekte ohne Libraries */
(() => {
  "use strict";
  if (!document.documentElement.lang) document.documentElement.lang = "de";

  /* ======================================================
     PROJEKTE – hier eigene Projekte eintragen.
     img:   grosses Standbild (wird im Player angezeigt, bis das Video läuft)
     thumb: kleines Vorschaubild fürs Bilderfeld (ca. 480 px breit)
     video: Pfad zur .mp4-Datei (die Platzhalter-Videos in /video ersetzen)
     real:  true = echtes Projekt, false = Platzhalter
     tile:  optional, z.B. { size: 0.55, align: "right", wide: true } = kleineres Querformat-Bild rechts
     ====================================================== */
  const PROJECTS = [
    { title: "Fjälla", type: "Dokumentarfilm", role: "Regie, Kamera, Schnitt", img: "img/fjaella-still.webp", thumb: "img/fjaella-thumb.webp", video: "video/fjaella.mp4", real: true, tile: { wide: true },
      desc: "Die Band Fjälla während ihrer Recording-Session. Beobachtend gedreht, nah an den Leuten und an der Musik." },
    { title: "Jonny Breaux", type: "Livesession", role: "Kamera", img: "img/jonny-breaux-still.webp", thumb: "img/jonny-breaux-thumb.webp", video: "video/jonny-breaux.mp4", real: true,
      desc: "" },
    { title: "Radio RABE", type: "Live-Regie", role: "Bildregie", img: "img/still-radio.webp", thumb: "img/thumb-radio.webp", video: "video/radio.mp4", real: true,
      desc: "Bildregie für Live-Sendungen beim Berner Gemeinschaftsradio." },
    { title: "We Should Get Married", type: "Musikvideo", role: "Kamera, Color Grading", img: "img/photobooth-still.webp", thumb: "img/photobooth-thumb.webp", video: "video/photobooth.mp4", real: true,
      desc: "Musikvideo für Jonny Breaux zum Song „We Should Get Married“." },
    { title: "Brennpunkt Welschdörfli", type: "Reportage", role: "Regie, Schnitt", img: "img/welschdoerfli-still.webp", thumb: "img/welschdoerfli-thumb.webp", video: "video/welschdoerfli.mp4", real: true,
      desc: "" },
    { title: "Queer durch Berlin", type: "Dokumentarfilm", role: "Regie", img: "img/queer-berlin-still.webp", thumb: "img/queer-berlin-thumb.webp", video: "video/queer-berlin.mp4", real: true,
      desc: "Ein Dokumentarfilm über queeres Leben in Berlin." },
    { title: "BERN131", type: "Imagefilm", role: "Kamera", img: "img/bern131-still.webp", thumb: "img/bern131-thumb.webp", video: "video/bern131.mp4", real: true,
      desc: "Für Losinger Marazzi. Ein Blick in die Vorfertigung für das Bauprojekt BERN131." },
    { title: "Projekt 11", type: "Platzhalter", role: "", img: "img/platzhalter-city-still.webp", thumb: "img/platzhalter-city-thumb.webp", video: "video/platzhalter-city.mp4", real: false,
      desc: "Platzhalter. Hier kommt ein eigenes Projekt hin." },
    { title: "Patschifig", type: "3D-Intro (fiktiv)", role: "Alles selbst, in Blender", img: "img/patschifig-still.webp", thumb: "img/patschifig-thumb.webp", video: "video/patschifig.mp4", real: true,
      desc: "Fiktives Intro für ein Format bei RTR. Komplett selbst in Blender gebaut, beleuchtet, animiert und gerendert." },
    { title: "Cheer me on", type: "Dokumentarfilm", role: "Kamera", img: "img/cheer-me-on-still.webp", thumb: "img/cheer-me-on-thumb.webp", video: "video/cheer-me-on.mp4", real: true,
      desc: "" },
    { title: "Leben mit dem Wind", type: "Dokumentarfilm", role: "Alles selbst", img: "img/leben-mit-dem-wind-still.webp", thumb: "img/leben-mit-dem-wind-thumb.webp", video: "video/leben-mit-dem-wind.mp4", real: true,
      desc: "" },
    { title: "Projekt 12", type: "Platzhalter", role: "", img: "img/platzhalter-portrait-still.webp", thumb: "img/platzhalter-portrait-thumb.webp", video: "video/platzhalter-portrait.mp4", real: false,
      desc: "Platzhalter. Hier kommt ein eigenes Projekt hin." },
  ];

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let vh = innerHeight, vw = innerWidth;
  addEventListener("resize", () => { vh = innerHeight; vw = innerWidth; });

  /* Fortschritt 0..1 durch eine Sektion mit sticky Stage */
  const stickyProgress = (el) => {
    const r = el.getBoundingClientRect();
    return clamp(-r.top / Math.max(1, r.height - vh), 0, 1);
  };
  /* Fortschritt 0..1, solange die Sektion im Viewport durchläuft */
  const viewProgress = (el) => {
    const r = el.getBoundingClientRect();
    return clamp((vh - r.top) / (vh + r.height), 0, 1);
  };

  /* ---------- Arbeiten: verstreute Bilder (wie Caora) ----------
     Das Feld ist in Spalten geteilt. Jede Spalte treibt mit eigenem Tempo
     nach oben (= Tiefe), alle Bilder einer Spalte gleich schnell und mit
     festem Abstand. So überlappen sich die Bilder nie.
     Jede Spalte hat eine feste Anzahl Bilder: am Ende des Abschnitts
     sind alle oben rausgelaufen und das Feld ist leer. */
  const field = $("#workField");
  const TRAVEL = 2.2;   // wie weit eine Spalte wandert (in Feldhöhen, bei Tempo 1)
  const FADE = 140;     // px über denen ein Bild oben ganz ausblendet
  let GAP = 36;         // Mindestabstand zwischen Bildern in px (Handy: 20)
  let columns = [];

  function buildField() {
    // Jedes Projekt erscheint genau einmal. Verteilung Zeile für Zeile über die
    // Spalten, damit hintere Projekte in der Liste weiter unten auftauchen.
    field.innerHTML = "";
    columns = [];
    let seed = 7;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const W = field.clientWidth, H = field.clientHeight;
    GAP = W < 560 ? 20 : 36;
    const nCols = Math.min(PROJECTS.length, W < 560 ? 2 : W < 1000 ? 3 : 4);
    const colW = W / nCols;
    for (let c = 0; c < nCols; c++) {
      const list = PROJECTS.map((p, i) => ({ p, i })).filter(({ i }) => i % nCols === c);
      const n = list.length;
      const maxW = Math.min(colW - GAP, nCols === 2 ? 200 : 300);
      const maxH = maxW * 4 / 3;                       // grösstmögliche Bildhöhe (Hochformat 3:4)
      // Tempo so wählen, dass die Bilder einer Spalte nie überlappen
      const minSpeed = (n * (maxH + GAP)) / (TRAVEL * H);
      const speed = Math.max(0.65 + rand() * 0.6, minSpeed);
      const travel = TRAVEL * H * speed;
      const slot = travel / n;
      const items = [];
      list.forEach(({ p }, j) => {
        // optional pro Projekt: tile: { size: 0.55, align: "right", wide: true }
        const opt = p.tile || {};
        const r1 = rand(), r2 = rand(), r3 = rand();
        const tall = opt.wide ? false : r1 > 0.55;
        const w = opt.size ? maxW * opt.size : maxW * (0.72 + r2 * 0.28);
        const h = tall ? w * 4 / 3 : w * 10 / 16;
        const free = colW - GAP - w;
        const x = c * colW + GAP / 2 + (opt.align === "right" ? free : opt.align === "left" ? 0 : r3 * free);
        const y0 = FADE + 20 + j * slot + rand() * Math.max(0, Math.min(slot - GAP - h, H * 0.35));   // startet unter der Ausblend-Zone, bleibt im eigenen Slot
        const b = document.createElement("button");
        b.type = "button";
        b.className = "tile";
        b.style.left = x + "px";
        b.style.width = w + "px";
        b.innerHTML = `<img src="${p.thumb}" alt="" loading="lazy" decoding="async" style="aspect-ratio:${tall ? "3/4" : "16/10"}"><span class="tile__cap">${p.title} · ${p.type}</span>`;
        b.setAttribute("aria-label", `${p.title}: Video ansehen`);
        b.addEventListener("click", () => openProject(PROJECTS.indexOf(p)));
        field.appendChild(b);
        items.push({ el: b, y0, h });
      });
      columns.push({ speed, maxH, items, H });
    }
    // Tempo so strecken, dass das letzte Bild erst kurz vor Ende des Abschnitts oben raus ist
    const pExit = Math.max(...columns.map((col) => Math.max(...col.items.map((t) => t.y0 + t.h)) / (TRAVEL * col.H * col.speed)));
    const stretch = pExit / 0.94;
    columns.forEach((col) => { col.speed *= stretch; });
  }

  const placeTiles = (wp) => {
    columns.forEach((col) => {
      const shift = wp * TRAVEL * col.H * col.speed;
      col.items.forEach((t) => {
        const y = t.y0 - shift;
        t.el.style.transform = `translate3d(0, ${y}px, 0)`;
        // oben: ganzes Bild blendet aus, bevor es den Rand erreicht (kein angeschnittener Streifen)
        const op = Math.min(1, Math.max(0, y / FADE));
        t.el.style.opacity = op.toFixed(3);
        t.el.style.visibility = (y > col.H + 10 || op <= 0) ? "hidden" : "";
        t.el.style.pointerEvents = op > 0.15 ? "" : "none";
      });
    });
  };
  buildField();
  placeTiles(0);
  let lastW = innerWidth;
  addEventListener("resize", () => {
    if (Math.abs(innerWidth - lastW) < 40) return;   // Handy-Adressleiste ignorieren
    lastW = innerWidth; buildField(); placeTiles(stickyProgress($(".work")));
  });

  /* ---------- Video-Player ---------- */
  const player = $("#player"), plVideo = $("#plVideo"), plLoading = $("#plLoading");
  let current = 0;

  /* Videos werden erst beim Klick geladen (Streaming).
     Davor sieht man nur die kleinen Thumbnails (thumb-*.webp).        */
  plVideo.addEventListener("waiting", () => { plLoading.hidden = false; });
  plVideo.addEventListener("playing", () => { plLoading.hidden = true; });
  plVideo.addEventListener("canplay", () => { plLoading.hidden = true; });

  function openProject(i) {
    current = (i + PROJECTS.length) % PROJECTS.length;
    const p = PROJECTS[current];
    plVideo.poster = p.img;
    plLoading.hidden = false;
    plVideo.src = p.video;
    $("#plMeta").textContent = [p.type, p.role, p.real ? "" : "Platzhalter"].filter(Boolean).join(" · ");
    $("#plTitle").textContent = p.title;
    $("#plDesc").textContent = p.desc;
    if (!player.open) { if (typeof player.showModal === "function") player.showModal(); else player.setAttribute("open", ""); }
    const pr = plVideo.play(); if (pr && pr.catch) pr.catch(() => {});
  }
  const closePlayer = () => { plLoading.hidden = true; plVideo.pause(); plVideo.removeAttribute("src"); plVideo.load(); player.close ? player.close() : player.removeAttribute("open"); };
  $("#plClose").addEventListener("click", closePlayer);
  $("#plPrev").addEventListener("click", () => openProject(current - 1));
  $("#plNext").addEventListener("click", () => openProject(current + 1));
  player.addEventListener("cancel", (e) => { e.preventDefault(); closePlayer(); });
  addEventListener("keydown", (e) => {
    if (!player.open) return;
    if (e.key === "ArrowRight") openProject(current + 1);
    if (e.key === "ArrowLeft") openProject(current - 1);
  });

  /* ---------- Kontakt: Adresse kopieren ---------- */
  $("#copyMail").addEventListener("click", () => {
    const txt = $("#mailText").textContent.trim();
    const status = $("#copyStatus");
    const fallback = () => {
      const r = document.createRange(); r.selectNodeContents($("#mailText"));
      const s = getSelection(); s.removeAllRanges(); s.addRange(r);
      status.textContent = "Adresse markiert. Mit Cmd/Ctrl+C kopieren.";
    };
    try {
      navigator.clipboard.writeText(txt).then(() => { status.textContent = "Adresse kopiert."; }, fallback);
    } catch (e) { fallback(); }
  });

  /* ---------- Text, der beim Scrollen "aufleuchtet" ---------- */
  const reveals = $$(".reveal").map((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map((w) => `<span class="w">${w}</span>`).join(" ");
    return { el, words: $$(".w", el) };
  });

  /* ---------- Logo/Links dunkel über dem hellen Kontaktbereich ---------- */
  const lightSecs = $$(".band--bone");
  const updateHeader = () => {
    const on = lightSecs.some((el) => { const r = el.getBoundingClientRect(); return r.top < 40 && r.bottom > 40; });
    document.body.classList.toggle("on-light", on);
  };
  addEventListener("scroll", updateHeader, { passive: true });

  /* Menü beim Runterscrollen ausblenden, beim Hochscrollen zeigen */
  let lastY = scrollY;
  addEventListener("scroll", () => {
    const y = scrollY, d = y - lastY;
    if (Math.abs(d) < 6) return;
    document.body.classList.toggle("nav-hidden", d > 0 && y > 200);
    lastY = y;
  }, { passive: true });
  document.querySelector(".top-nav").addEventListener("focusin", () => document.body.classList.remove("nav-hidden"));
  updateHeader();

  if (reduce) {
    // Ruhiger Modus: keine Bewegung
    addEventListener("scroll", () => placeTiles(stickyProgress($(".work"))), { passive: true });
    return;
  }

  /* ---------- Elemente für den Loop ---------- */
  const intro = $(".intro");
  const layers = $$(".layer", intro).map((el) => ({ el, d: parseFloat(el.dataset.depth), fore: el.classList.contains("layer--fore") }));
  const logo = $("#introLogo"), lbTop = $("#lbTop"), lbBottom = $("#lbBottom"), cue = $(".intro__cue");
  const reelSec = $(".reel"), cards = $$(".reel__card").map((el) => ({ el, par: parseFloat(el.dataset.par), base: getComputedStyle(el).transform }));
  const marquees = $$(".marquee").map((m) => ({ m, track: $(".marquee__track", m), speed: parseFloat(m.dataset.speed), x: 0 }));
  const work = $(".work");
  const shardsSec = $("#shards");
  const focusImg = $("#focusImg"), vf = $("#viewfinder"), vfAf = $("#vfAf"), aboutText = $("#aboutText");
  const contact = $(".contact");

  /* Maus = leichte Kamerabewegung im Intro */
  let mx = 0, my = 0, smx = 0, smy = 0;
  addEventListener("pointermove", (e) => { mx = e.clientX / vw - 0.5; my = e.clientY / vh - 0.5; }, { passive: true });

  /* Lade-Animation: Kamera zoomt beim Start aus den Ebenen heraus */
  const t0 = performance.now();
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(64, now - last); last = now;
    smx += (mx - smx) * 0.06; smy += (my - smy) * 0.06;
    const load = 1 - easeOut(clamp((now - t0) / 2600, 0, 1)); // 1 → 0

    /* INTRO */
    const r = intro.getBoundingClientRect();
    if (r.bottom > 0) {
      const p = clamp(-r.top / (r.height - vh), 0, 1);
      layers.forEach(({ el, d, fore }) => {
        const s = 1 + p * d * (fore ? 1.6 : 0.9) + load * (0.15 + d * 0.35);
        const ty = -p * d * 22 + (fore ? p * 6 : 0);
        const tx = -smx * d * 40;
        const tyMouse = -smy * d * 22;
        el.style.transform = `translate3d(${tx}vw, calc(${ty}vh + ${tyMouse}px), 0) scale(${s})`;
        if (load > 0.001) el.style.filter = `blur(${load * d * 10}px)`; else if (el.style.filter) el.style.filter = "";
      });
      const lp = clamp(p * 1.8, 0, 1);
      logo.style.transform = `translate3d(${smx * -12}px, ${p * 26 - load * 4}vh, 0) scale(${1 - p * 0.15})`;
      logo.style.opacity = String(clamp(1 - lp * 1.2, 0, 1) * (1 - load));
      logo.style.letterSpacing = `${load * 0.4}em`;
      const bars = 1 - clamp(p / 0.22, 0, 1);
      lbTop.style.transform = `scaleY(${bars})`;
      lbBottom.style.transform = `scaleY(${bars})`;
      cue.style.opacity = String(1 - clamp(p * 8, 0, 1));
    }

    /* Collage-Parallaxe */
    const rp = viewProgress(reelSec) - 0.5;
    cards.forEach(({ el, par, base }) => {
      el.style.transform = `translateY(${rp * par * vh * 1.6}px) ${base === "none" ? "" : base}`;
    });

    /* Laufschriften: Zeit + Scroll */
    marquees.forEach((q) => {
      const half = q.track.scrollWidth / 2;
      q.x -= q.speed * dt * 0.06;
      const sx = (q.x - scrollY * q.speed * 0.5) % half;
      q.track.style.transform = `translate3d(${sx > 0 ? sx - half : sx}px,0,0)`;
    });

    /* Text-Highlights */
    reveals.forEach(({ el, words }) => {
      const b = el.getBoundingClientRect();
      if (b.bottom < -50 || b.top > vh + 50) return;
      const q = clamp((vh * 0.88 - b.top) / (b.height + vh * 0.35), 0, 1);
      const lit = Math.round(q * words.length * 1.05);
      words.forEach((w, i) => { w.style.opacity = i < lit ? "1" : "0.28"; });
    });

    /* Arbeiten: Bilderfeld treibt nach oben */
    const wr = work.getBoundingClientRect();
    if (wr.top < vh && wr.bottom > 0) placeTiles(stickyProgress(work));

    /* Bergstücke brechen auseinander */
    /* Über mich: Schärfe ziehen */
    const sr = shardsSec.getBoundingClientRect();
    if (sr.top < vh && sr.bottom > 0) {
      const sp = stickyProgress(shardsSec);
      const enter = clamp(1 - sr.top / vh, 0, 1);              // Sektion kommt von unten rein
      const f = easeInOut(clamp((sp - 0.04) / 0.42, 0, 1));    // 0 = unscharf, 1 = scharf
      focusImg.style.filter = f < 0.999 ? `blur(${(1 - f) * 26}px) brightness(${0.7 + f * 0.3})` : "";
      focusImg.style.transform = `scale(${1.06 - f * 0.06})`;
      vf.style.opacity = String(clamp(enter * 1.4, 0, 1) * (1 - clamp((sp - 0.62) / 0.18, 0, 1)));
      vf.style.inset = `${-14 - (1 - f) * 22}px`;
      vf.classList.toggle("is-sharp", f > 0.98);
      vfAf.style.opacity = String(1 - clamp((f - 0.85) / 0.15, 0, 1));
      const t = clamp((sp - 0.4) / 0.2, 0, 1);
      aboutText.style.opacity = String(t);
      aboutText.style.transform = `translate3d(0, ${(1 - t) * 30}px, 0)`;
      aboutText.style.pointerEvents = t > 0.5 ? "auto" : "none";
    }

    updateHeader();

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
