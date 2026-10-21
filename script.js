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
     tile:  optional, z.B. { wide: true } = Querformat, { tall: true, size: 1 } = grosses Hochformat,
            size = Grösse (0–1), align: "left"/"right"
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
    { title: "Necessaire", type: "Museumsfilm", role: "Schnitt, Color Grading", img: "img/necessaire-still.webp", thumb: "img/necessaire-thumb.webp", video: "video/necessaire.mp4", real: true, tile: { wide: true, size: 0.62, pair: "Queer durch Berlin" },
      desc: "Ein Video zu einem Necessaire für das Rätische Museum in Chur." },
    { title: "Queer durch Berlin", type: "Dokumentarfilm", role: "Regie", img: "img/queer-berlin-still.webp", thumb: "img/queer-berlin-thumb.webp", video: "video/queer-berlin.mp4", real: true, tile: { tall: true, size: 1 },
      desc: "Ein Dokumentarfilm über queeres Leben in Berlin." },
    { title: "Brennpunkt Welschdörfli", type: "Reportage", role: "Regie, Schnitt", img: "img/welschdoerfli-still.webp", thumb: "img/welschdoerfli-thumb.webp", video: "video/welschdoerfli.mp4", real: true,
      desc: "" },
    { title: "BERN131", type: "Imagefilm", role: "Kamera", img: "img/bern131-still.webp", thumb: "img/bern131-thumb.webp", video: "video/bern131.mp4", real: true,
      desc: "Für Losinger Marazzi. Ein Blick in die Vorfertigung für das Bauprojekt BERN131." },
    { title: "Hochwasser", type: "Forschungsfilm", role: "Alles selbst", img: "img/hochwasser-still.webp", thumb: "img/hochwasser-thumb.webp", video: "video/hochwasser.mp4", real: true,
      desc: "Video für ein Forschungsprojekt der Universität Bern über Hochwassergefahr." },
    { title: "Patschifig", type: "3D-Intro (fiktiv)", role: "Alles selbst, in Blender", img: "img/patschifig-still.webp", thumb: "img/patschifig-thumb.webp", video: "video/patschifig.mp4", real: true,
      desc: "Fiktives Intro für ein Format bei RTR. Komplett selbst in Blender gebaut, beleuchtet, animiert und gerendert." },
    { title: "Cheer me on", type: "Dokumentarfilm", role: "Kamera", img: "img/cheer-me-on-still.webp", thumb: "img/cheer-me-on-thumb.webp", video: "video/cheer-me-on.mp4", real: true, tile: { wide: true, size: 0.6 },
      desc: "" },
    { title: "Leben mit dem Wind", type: "Dokumentarfilm", role: "Alles selbst", img: "img/leben-mit-dem-wind-still.webp", thumb: "img/leben-mit-dem-wind-thumb.webp", video: "video/leben-mit-dem-wind.mp4", real: true, tile: { wide: true, size: 0.6 },
      desc: "" },
    { title: "Nacht der Forschung", type: "Eventfilm", role: "Alles selbst", img: "img/nachtderforschung-still.webp", thumb: "img/nachtderforschung-thumb.webp", video: "video/nachtderforschung.mp4", real: true,
      desc: "Nacht der Forschung 2025 an der Universität Bern: Das Mobiliar Lab für Naturrisiken zeigt mit einem Lego-Modell, wie Hochwasser entsteht." },
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
        const tall = opt.wide ? false : opt.tall ? true : r1 > 0.55;
        const w = opt.size ? maxW * opt.size : maxW * (0.72 + r2 * 0.28);
        const h = tall ? w * 4 / 3 : w * 10 / 16;
        const free = colW - GAP - w;
        // Paar (z.B. Necessaire neben Berlin): zur Partner-Spalte hin ausrichten
        const partnerOf = (q) => PROJECTS.findIndex((o) => o.title === q);
        const pi = opt.pair ? partnerOf(opt.pair) : PROJECTS.findIndex((o) => o.tile && o.tile.pair === p.title);
        const align = opt.align || (pi < 0 ? "" : (pi % nCols) > c ? "right" : "left");
        const x = c * colW + GAP / 2 + (align === "right" ? free : align === "left" ? 0 : r3 * free);
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
        items.push({ el: b, y0, h, p });
      });
      columns.push({ speed, maxH, items, H });
    }
    // Paare auf gleiche Höhe bringen: wenn der Partner mittig im Bild ist,
    // steht das Paar-Bild mittig daneben (nur wenn es in der Spalte Platz hat)
    columns.forEach((col) => col.items.forEach((t) => {
      const opt = t.p.tile || {}; if (!opt.pair) return;
      const pc = columns.find((cc) => cc.items.some((u) => u.p.title === opt.pair)); if (!pc || pc === col) return;
      const u = pc.items.find((v) => v.p.title === opt.pair);
      const S = (cc) => TRAVEL * cc.H * cc.speed;
      const wp = (u.y0 - (pc.H - u.h) / 2) / S(pc);
      const y0 = (col.H - t.h) / 2 + wp * S(col);
      const free = col.items.every((v) => v === t || y0 + t.h + GAP <= v.y0 || v.y0 + v.h + GAP <= y0);
      if (free && y0 >= FADE + 20) t.y0 = y0;
    }));
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
  /* ---------- Showreel (Intro) ----------
     Solange video/showreel.mp4 fehlt, bleibt der Platzhalter sichtbar. */
  const reel = $("#showreel"), reelVideo = $("#reelVideo");
  // Safari spielt nur ab, wenn das Video sicher stumm ist; sonst beim ersten Scrollen/Tippen nochmal versuchen
  reelVideo.muted = true; reelVideo.defaultMuted = true; reelVideo.playsInline = true;
  reelVideo.setAttribute("muted", ""); reelVideo.setAttribute("playsinline", "");
  const tryPlay = () => { const pr = reelVideo.play(); if (pr && pr.catch) pr.catch(() => {}); };
  reelVideo.addEventListener("loadeddata", () => { reel.classList.add("is-ready"); tryPlay(); });
  reelVideo.addEventListener("canplay", tryPlay, { once: true });
  ["pointerdown", "touchstart", "scroll", "keydown"].forEach((ev) =>
    addEventListener(ev, () => { if (reelVideo.paused) tryPlay(); }, { passive: true, once: true }));
  document.addEventListener("visibilitychange", () => { if (!document.hidden && reelVideo.paused) tryPlay(); });
  tryPlay();
  reelVideo.addEventListener("error", () => { reelVideo.removeAttribute("src"); });
  // Klick aufs Showreel: weiter runter zum Text
  reel.addEventListener("click", () => {
    const t = $("#vorstellung"); scrollTo({ top: t.getBoundingClientRect().top + scrollY, behavior: "smooth" });
  });
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
  const lightSecs = [...$$(".band--bone")];
  const shardsEl = $("#shards");
  const updateHeader = () => {
    const sh = shardsEl.getBoundingClientRect();
    const on = (sh.top < 40 && sh.bottom > 40) ||   // heller Teil von "Über mich"
      lightSecs.some((el) => { const r = el.getBoundingClientRect(); return r.top < 40 && r.bottom > 40; });
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
  const reelBox = $("#showreel");
  const reelSec = $(".reel"), cards = $$(".reel__card").map((el) => ({ el, par: parseFloat(el.dataset.par), base: getComputedStyle(el).transform }));
  const marquees = $$(".marquee").map((m) => ({ m, track: $(".marquee__track", m), speed: parseFloat(m.dataset.speed), x: 0 }));
  const work = $(".work");
  /* Übergang zu "Über mich": "none" (fixe Kante, Standard), "leak" (Light Leak), "iris" (Kamerablende) oder "focus" (Schärfe ziehen) */
  const TRANSITION = "none";
  const shardsSec = $("#shards");
  const aboutme = $("#aboutme");
  const stage = $("#shards .shards__stage");
  const focusImg = $("#focusImg"), vf = $("#viewfinder"), vfAf = $("#vfAf"), aboutText = $("#aboutText");
  const contact = $(".contact");

  /* Maus = leichte Kamerabewegung im Intro */
  let mx = 0, my = 0, smx = 0, smy = 0;
  addEventListener("pointermove", (e) => { mx = e.clientX / vw - 0.5; my = e.clientY / vh - 0.5; }, { passive: true });

  /* Lade-Animation: Kamera zoomt beim Start aus den Ebenen heraus */
  const t0 = performance.now();
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  /* ---------- Kamerablende ----------
     r = 0 geschlossen, 1 ganz offen. Gezeichnet werden 9 Lamellen um eine
     polygonale Öffnung, die sich beim Schliessen leicht dreht. */
  const iris = $("#iris"), ictx = iris.getContext("2d");
  const BLADES = 9;
  let irisW = 0, irisH = 0, irisDpr = 1;
  function sizeIris() {
    irisDpr = Math.min(2, devicePixelRatio || 1);
    irisW = innerWidth; irisH = innerHeight;
    iris.width = irisW * irisDpr; iris.height = irisH * irisDpr;
  }
  sizeIris(); addEventListener("resize", sizeIris);
  const css = getComputedStyle(document.documentElement);
  function drawIris(r) {
    if (r >= 0.999) { iris.style.display = "none"; return; }
    iris.style.display = "block";
    const ctx = ictx, W = irisW, H = irisH, cx = W / 2, cy = H / 2;
    // Radius, bei dem die Öffnung (Vieleck) den ganzen Bildschirm freigibt
    const R = (Math.hypot(W, H) / 2) / Math.cos(Math.PI / BLADES) * 1.04;
    const ap = R * r;
    const rot = (1 - r) * 1.1;                        // Lamellen drehen beim Schliessen
    const far = Math.hypot(W, H) * 2;
    const tone = ["#04060d", "#0a0f1d"];
    ctx.setTransform(irisDpr, 0, 0, irisDpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (ap < 1) { ctx.fillStyle = tone[0]; ctx.fillRect(0, 0, W, H); return; }
    const p = [];
    for (let i = 0; i < BLADES; i++) {
      const ang = rot + (i / BLADES) * Math.PI * 2;
      p.push([cx + Math.cos(ang) * ap, cy + Math.sin(ang) * ap]);
    }
    // Richtung jeder Kante (p[i] → p[i+1]); die Lamellenkante läuft darüber hinaus nach aussen
    const u = p.map((pi, i) => {
      const q = p[(i + 1) % BLADES]; const dx = q[0] - pi[0], dy = q[1] - pi[1], l = Math.hypot(dx, dy) || 1;
      return [dx / l, dy / l];
    });
    for (let i = 0; i < BLADES; i++) {
      const a1 = p[(i + 1) % BLADES], a2 = p[(i + 2) % BLADES];
      const d1 = u[i], d2 = u[(i + 1) % BLADES];
      ctx.beginPath();
      ctx.moveTo(a1[0], a1[1]);
      ctx.lineTo(a1[0] + d1[0] * far, a1[1] + d1[1] * far);
      ctx.lineTo(a2[0] + d2[0] * far, a2[1] + d2[1] * far);
      ctx.lineTo(a2[0], a2[1]);
      ctx.closePath();
      // leichter Verlauf pro Lamelle, damit sie wie Metall wirken
      const g = ctx.createLinearGradient(a1[0], a1[1], a1[0] + d1[0] * 400, a1[1] + d1[1] * 400);
      g.addColorStop(0, i % 2 ? "#141b2c" : "#0d1322");
      g.addColorStop(1, tone[i % 2]);
      ctx.fillStyle = g;
      ctx.fill();
    }
    // feine Kanten in Big Fish
    ctx.strokeStyle = "rgba(153,163,142,.28)";
    ctx.lineWidth = 1;
    for (let i = 0; i < BLADES; i++) {
      const a1 = p[(i + 1) % BLADES], d1 = u[i];
      ctx.beginPath(); ctx.moveTo(a1[0], a1[1]); ctx.lineTo(a1[0] + d1[0] * far, a1[1] + d1[1] * far); ctx.stroke();
    }
  }

  /* ---------- Light Leak ----------
     I = 0 nichts, 1 ganz ausgebrannt. Mehrere warme Lichtflecken, die langsam
     wandern und flackern (Canvas mit mix-blend-mode: screen). */
  const LEAKS = [   // hellgrün (Big Fish / Salbei)
    { x: 0.08, y: 0.25, r: 0.75, c: [185, 200, 160], sp: 0.00031, ph: 0.0 },
    { x: 0.95, y: 0.15, r: 0.6,  c: [153, 175, 130], sp: 0.00023, ph: 1.7 },
    { x: 0.7,  y: 0.9,  r: 0.7,  c: [205, 222, 180], sp: 0.00027, ph: 3.1 },
    { x: 0.3,  y: 0.75, r: 0.5,  c: [140, 165, 120], sp: 0.00035, ph: 4.4 },
    { x: 0.55, y: 0.45, r: 0.55, c: [231, 236, 215], sp: 0.0002, ph: 2.2 },
  ];
  function drawLeak(I, now) {
    if (I <= 0.001) { iris.style.display = "none"; return; }
    iris.style.display = "block";
    iris.style.mixBlendMode = "screen";
    const ctx = ictx, W = irisW, H = irisH, D = Math.hypot(W, H);
    ctx.setTransform(irisDpr, 0, 0, irisDpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const flicker = 0.9 + 0.1 * Math.sin(now * 0.013) * Math.sin(now * 0.0071);
    LEAKS.forEach((l, i) => {
      const t = now * l.sp + l.ph;
      const x = (l.x + Math.sin(t) * 0.12) * W, y = (l.y + Math.cos(t * 1.3) * 0.1) * H;
      const rad = D * l.r * (0.4 + I * 0.9);
      const a = Math.min(1, I * 1.4) * flicker;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, `rgba(${l.c[0]},${l.c[1]},${l.c[2]},${0.85 * a})`);
      g.addColorStop(0.45, `rgba(${Math.round(l.c[0] * 0.7)},${Math.round(l.c[1] * 0.75)},${Math.round(l.c[2] * 0.65)},${0.35 * a})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    });
    // Ausbrennen: helles Grün (= Hintergrund danach) über alles, wenn I gegen 1 geht
    const burn = Math.max(0, (I - 0.6) / 0.4);
    if (burn > 0) {
      ctx.fillStyle = `rgba(231,233,223,${Math.pow(burn, 1.6) * 0.97})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(64, now - last); last = now;
    smx += (mx - smx) * 0.06; smy += (my - smy) * 0.06;
    const load = 1 - easeOut(clamp((now - t0) / 2600, 0, 1)); // 1 → 0

    /* INTRO */
    const r = intro.getBoundingClientRect();
    if (r.bottom > 0) {
      const p = clamp(-r.top / (r.height - vh), 0, 1);
      reelBox.style.transform = `scale(${1 + p * 0.08 + load * 0.06})`;
      reelBox.style.opacity = String(1 - clamp((p - 0.55) / 0.45, 0, 1) * 0.6);
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
    /* Über mich: Übergang */
    const sr = shardsSec.getBoundingClientRect();
    if (TRANSITION === "none") {
      // fixe Kante, keine Effekte
      vf.style.display = "none";
    } else if (TRANSITION === "leak") {
      // brennt rein, während die Sektion von unten kommt; blendet aus, sobald sie oben steht
      const sp = stickyProgress(shardsSec);
      let I = 0;
      if (sr.top < vh && sr.top > 0) I = easeInOut(clamp((1 - sr.top / vh - 0.2) / 0.8, 0, 1));
      else if (sr.top <= 0 && sr.bottom > 0) I = 1 - easeInOut(clamp((sp - 0.02) / 0.3, 0, 1));
      drawLeak(I, now);
      aboutme.style.visibility = sr.top > 2 ? "hidden" : "";
      stage.classList.toggle("is-light", sr.top <= 2);
      const o = sr.top <= 0 ? clamp((sp - 0.02) / 0.35, 0, 1) : 0;   // Porträt: überbelichtet → normal
      focusImg.style.filter = o < 0.999 ? `brightness(${1.7 - o * 0.7}) contrast(${0.8 + o * 0.2}) saturate(${0.6 + o * 0.4})` : "";
      focusImg.style.transform = "";
      const t = clamp((sp - 0.2) / 0.2, 0, 1);
      aboutText.style.opacity = String(t);
      aboutText.style.transform = `translate3d(0, ${(1 - t) * 30}px, 0)`;
      aboutText.style.pointerEvents = t > 0.5 ? "auto" : "none";
      vf.style.display = "none";
    } else if (TRANSITION === "iris") {
      // schliesst, während die Sektion von unten reinkommt; öffnet, sobald sie oben steht
      const sp = stickyProgress(shardsSec);
      const closing = clamp(1 - sr.top / vh, 0, 1);                 // 0 → 1 bis Sektion oben
      const opening = sr.top <= 0 ? clamp((sp - 0.02) / 0.3, 0, 1) : 0;
      let r = 1;
      if (sr.top < vh && sr.top > 0) r = 1 - easeInOut(clamp((closing - 0.25) / 0.75, 0, 1));
      else if (sr.top <= 0 && sr.bottom > 0) r = easeInOut(opening);
      iris.style.mixBlendMode = "normal";
      drawIris(r);
      aboutme.style.visibility = sr.top > 2 ? "hidden" : "";
      const t = clamp((sp - 0.18) / 0.2, 0, 1);
      aboutText.style.opacity = String(t);
      aboutText.style.transform = `translate3d(0, ${(1 - t) * 30}px, 0)`;
      aboutText.style.pointerEvents = t > 0.5 ? "auto" : "none";
      vf.style.display = "none";
    } else if (sr.top < vh && sr.bottom > 0) {
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
