/* =========================================================
   ALESSIO MARIANO — script.js
   ---------------------------------------------------------
   Per aggiungere contenuti:
   - metti i video in  progetti/video/
   - metti le foto in  progetti/foto/
   e aggiungi una voce negli array qui sotto.
   "fallback" è opzionale: viene usato se il file locale non c'è.
   ========================================================= */

const CDN = "https://res.cloudinary.com/o40vc5qd/video/upload/q_auto/f_auto/br_1800k/w_720/";

const PROJECTS = [
  { title: "Myto - Fantasma",            src: "progetti/video/fantasma.mp4",   fallback: CDN + "fantasma03.mov" },
  { title: "Bekkeria - Ghettomood",      src: "progetti/video/ghettomood.mp4", fallback: CDN + "ghettomood05.mp4" },
  { title: "Kid Yugi ft. Anna - Push It", src: "progetti/video/push-it.mp4",    fallback: CDN + "post4-web.mp4" },
  { title: "Bekkeria - Ras",             src: "progetti/video/ras.mp4",        fallback: CDN + "mio12.mp4" },
];

const VIDEOS = [
  { title: "Archive 01", src: "progetti/video/archive-01.mp4", fallback: "https://res.cloudinary.com/o40vc5qd/video/upload/v1790972547/video3-web.mp4" },
  { title: "Archive 02", src: "progetti/video/archive-02.mp4", fallback: "https://res.cloudinary.com/o40vc5qd/video/upload/q_auto:good/f_mp4/br_1200k/w_720/video5.mp4" },
];

const PHOTOS = [
  { title: "Tenerife", src: "progetti/foto/foto-01.jpg", fallback: "https://marianoalessio.com/assets/archive/photo-cover.jpg" },
  { title: "Foto 02",  src: "progetti/foto/foto-02.jpg" },
  { title: "Foto 03",  src: "progetti/foto/foto-03.jpg" },
];

/* ---------- Helpers ---------- */
const $ = (sel) => document.querySelector(sel);

function createVideo({ src, fallback }, { autoplay = false, controls = false } = {}) {
  const video = document.createElement("video");
  video.muted = !controls;
  video.loop = !controls;
  video.playsInline = true;
  video.preload = autoplay ? "auto" : "metadata";
  video.controls = controls;
  if (autoplay) video.autoplay = true;

  [src, fallback].filter(Boolean).forEach((url) => {
    const source = document.createElement("source");
    source.src = url;
    video.appendChild(source);
  });
  return video;
}

function pad(n) { return String(n).padStart(2, "0"); }

/* ---------- Timecode VHS ---------- */
function startTimecode() {
  const el = $("#timecode");
  if (!el) return;
  const start = performance.now();
  const tick = () => {
    const t = (performance.now() - start) / 1000;
    const frames = Math.floor((t % 1) * 25);
    const s = Math.floor(t) % 60;
    const m = Math.floor(t / 60) % 60;
    const h = Math.floor(t / 3600);
    el.textContent = `${pad(h)}:${pad(m)}:${pad(s)}:${pad(frames)}`;
    requestAnimationFrame(tick);
  };
  tick();
}

function setVhsDate() {
  const el = $("#vhs-date");
  if (!el) return;
  const months = ["GEN.", "FEB.", "MAR.", "APR.", "MAG.", "GIU.", "LUG.", "AGO.", "SET.", "OTT.", "NOV.", "DIC."];
  const d = new Date();
  el.textContent = `${months[d.getMonth()]} ${pad(d.getDate())} ${d.getFullYear()}`;
}

/* =========================================================
   INDEX
   ========================================================= */
function initIntro() {
  const title = $(".intro-title");
  const enter = $("#enter");
  const transition = $("#transition");

  // Glitch casuale sul titolo
  if (title) {
    const glitch = () => {
      title.classList.add("is-glitching");
      setTimeout(() => title.classList.remove("is-glitching"), 550);
      setTimeout(glitch, 2500 + Math.random() * 4000);
    };
    setTimeout(glitch, 1800);
  }

  // Tasto ENTRA → effetto "TV off" e poi home
  if (enter && transition) {
    enter.addEventListener("click", (e) => {
      e.preventDefault();
      transition.classList.add("is-active");
      setTimeout(() => { window.location.href = enter.href; }, 700);
    });
  }
}

/* =========================================================
   HOME
   ========================================================= */
function initHome() {
  renderHero();
  renderArchive();
  renderProjects();
  initLightbox();
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();
}

// I video partono solo quando sono visibili sullo schermo
const autoplayObserver = new IntersectionObserver((entries) => {
  entries.forEach(({ target, isIntersecting }) => {
    if (isIntersecting) target.play().catch(() => {});
    else target.pause();
  });
}, { threshold: 0.2 });

function loopVideo(item) {
  const video = createVideo(item);
  autoplayObserver.observe(video);
  return video;
}

function renderHero() {
  const hero = $("#hero");
  if (hero && VIDEOS[0]) hero.prepend(loopVideo(VIDEOS[0]));

  // L'header diventa bianco quando si esce dall'hero
  const header = $(".site-header");
  if (!hero || !header) return;
  new IntersectionObserver(([entry]) => {
    header.classList.toggle("is-solid", !entry.isIntersecting);
  }, { rootMargin: "-80px 0px 0px 0px" }).observe(hero);
}

function renderArchive() {
  const photo = $("#archive-photo");
  const video = $("#archive-video");
  // carica tutte le foto, così quelle mancanti vengono escluse dalla galleria
  PHOTOS.forEach((p, i) => {
    const img = createImage(p);
    if (i === 0 && photo) photo.appendChild(img);
  });
  if (video && VIDEOS[1]) video.appendChild(loopVideo(VIDEOS[1]));

  document.querySelectorAll("[data-gallery]").forEach((card) => {
    card.addEventListener("click", () => {
      const type = card.dataset.gallery;
      openLightbox(type === "photo" ? PHOTOS : VIDEOS, 0, type);
    });
  });
}

function renderProjects() {
  const grid = $("#project-grid");
  if (!grid) return;
  PROJECTS.forEach((p, i) => {
    const card = document.createElement("button");
    card.className = "card";
    const media = document.createElement("div");
    media.className = "card-media";
    media.appendChild(loopVideo(p));
    card.appendChild(media);
    card.insertAdjacentHTML("beforeend", `<span class="card-title">${p.title}</span>`);
    card.addEventListener("click", () => openLightbox(PROJECTS, i, "video"));
    grid.appendChild(card);
  });
}

// Immagine con fallback: se il file locale non c'è usa "fallback"
function createImage(item) {
  const img = new Image();
  img.alt = item.title;
  img.src = item.src;
  img.onerror = () => {
    if (item.fallback && img.src !== item.fallback) {
      img.src = item.fallback;
      item.src = item.fallback;
    } else {
      item.missing = true;
      img.remove();
    }
  };
  return img;
}

/* ---------- Lightbox (galleria con frecce) ---------- */
const gallery = { items: [], index: 0, type: "video" };

function initLightbox() {
  const box = $("#lightbox");
  if (!box) return;
  $("#lightbox-close").addEventListener("click", closeLightbox);
  $("#lightbox-prev").addEventListener("click", () => stepLightbox(-1));
  $("#lightbox-next").addEventListener("click", () => stepLightbox(1));
  document.addEventListener("keydown", (e) => {
    if (!box.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") stepLightbox(-1);
    if (e.key === "ArrowRight") stepLightbox(1);
  });
}

function openLightbox(items, index, type) {
  gallery.items = items.filter((it) => !it.missing);
  gallery.index = Math.max(0, gallery.items.indexOf(items[index]));
  gallery.type = type;
  const multiple = gallery.items.length > 1;
  $("#lightbox-prev").hidden = !multiple;
  $("#lightbox-next").hidden = !multiple;
  showLightboxItem();
  const box = $("#lightbox");
  box.classList.add("is-open");
  box.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function stepLightbox(dir) {
  const n = gallery.items.length;
  if (n < 2) return;
  gallery.index = (gallery.index + dir + n) % n;
  showLightboxItem();
}

function showLightboxItem() {
  const item = gallery.items[gallery.index];
  const media = $("#lightbox-media");
  media.innerHTML = "";
  if (!item) return;

  if (gallery.type === "video") {
    const video = createVideo(item, { autoplay: true, controls: true });
    media.appendChild(video);
    video.play().catch(() => {});
  } else {
    const img = new Image();
    img.src = item.src;
    img.alt = item.title;
    media.appendChild(img);
  }
  $("#lightbox-caption").textContent = item.title;
}

function closeLightbox() {
  const box = $("#lightbox");
  if (!box || !box.classList.contains("is-open")) return;
  box.classList.remove("is-open");
  box.setAttribute("aria-hidden", "true");
  $("#lightbox-media").innerHTML = "";
  document.body.style.overflow = "";
}

/* ---------- Avvio ---------- */
startTimecode();
setVhsDate();
if (document.body.classList.contains("intro")) initIntro();
if (document.body.classList.contains("home")) initHome();
