/* ============================================================
   AHMAD — Portfolio · Motion layer
   Vanilla JS + GSAP + ScrollTrigger + Lenis
   ============================================================ */

(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ---------- Lenis smooth scroll ---------- */
  var lenis = null;
  if (!prefersReduced && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- Preloader ---------- */
  var preloader = document.getElementById("preloader");
  var preloaderFill = document.getElementById("preloaderFill");
  var preloaderCount = document.getElementById("preloaderCount");

  function runPreloader() {
    var counter = { v: 0 };
    var tl = gsap.timeline({ onComplete: function () { preloader.classList.add("is-done"); } });

    /* 1) counter 0→100 on the ink screen */
    tl.to(counter, {
      v: 100, duration: 1.6, ease: "power2.inOut",
      onUpdate: function () {
        var val = Math.round(counter.v);
        preloaderCount.textContent = val;
        preloaderFill.style.width = val + "%";
      }
    })
      /* 2) inner content fades out */
      .to(preloaderCount, { opacity: 0, y: -12, duration: 0.35, ease: "power2.out" }, "-=0.2")
      .to(preloaderFill, { scaleX: 0, transformOrigin: "right", duration: 0.4, ease: "power2.inOut" }, "-=0.1")
      .to(".preloader__name", { opacity: 0, y: -20, duration: 0.4, ease: "power2.in" }, "<")
      /* 3) paper curtain closes over the ink screen */
      .to(".preloader__panel--a", { x: "0%", duration: 0.55, ease: "power3.inOut" }, "-=0.1")
      .to(".preloader__panel--b", { x: "0%", duration: 0.55, ease: "power3.inOut" }, "<0.05")
      /* 4) ink background is fully covered → drop it, then OPEN the curtain */
      .set(preloader, { backgroundColor: "rgba(20, 18, 15, 0)" })
      .to(".preloader__panel--a", { x: "-101%", duration: 0.85, ease: "power4.inOut" }, "+=0.05")
      .to(".preloader__panel--b", { x: "101%", duration: 0.85, ease: "power4.inOut" }, "<0.08");

    tl.add(heroIntro, "-=0.5");
  }

  /* ---------- Hero intro ---------- */
  function heroIntro() {
    var tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.to(".hero__word", { y: "0%", duration: 1.3, stagger: 0.12 }, 0)
      .fromTo(".hero__meta > span", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.08 }, 0.5)
      .fromTo(".hero__lede, .hero__ctas .btn", { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }, 0.75)
      .fromTo(".hero__badge", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.8)" }, 1.1)
      .fromTo(".nav", { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 0.4);
  }

  /* ---------- Cursor ---------- */
  if (finePointer && !prefersReduced) {
    var cursor = document.getElementById("cursor");
    var ring = cursor.querySelector(".cursor__ring");
    var dot = cursor.querySelector(".cursor__dot");
    var label = document.getElementById("cursorLabel");
    var mx = 0, my = 0, rx = 0, ry = 0;

    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + "px"; dot.style.top = my + "px";
      cursor.style.opacity = 1;
    });
    document.addEventListener("mouseleave", function () { cursor.style.opacity = 0; });

    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.left = rx + "px"; ring.style.top = ry + "px";
      label.style.left = rx + "px"; label.style.top = ry + "px";
      requestAnimationFrame(loop);
    })();

    var hoverTargets = "a, button, .accordion__row, [data-magnetic]";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest(hoverTargets)) cursor.classList.add("is-hover");
      if (e.target.closest("[data-project] .project__media, .project__view")) cursor.classList.add("is-view");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest(hoverTargets)) cursor.classList.remove("is-hover");
      if (e.target.closest("[data-project] .project__media, .project__view")) cursor.classList.remove("is-view");
    });
    window.addEventListener("mousedown", function () { cursor.classList.add("is-down"); });
    window.addEventListener("mouseup", function () { cursor.classList.remove("is-down"); });
  } else if (cursor) {
    cursor.style.display = "none";
  }

  /* ---------- Magnetic elements ---------- */
  if (finePointer && !prefersReduced) {
    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.3;
        var y = (e.clientY - r.top - r.height / 2) * 0.3;
        el.style.transform = "translate(" + x + "px," + y + "px)";
      });
      el.addEventListener("mouseleave", function () {
        el.style.transform = "translate(0,0)";
      });
    });
  }

  /* ---------- Tilt on project cards ---------- */
  if (finePointer && !prefersReduced) {
    document.querySelectorAll("[data-tilt]").forEach(function (card) {
      var media = card.querySelector(".project__media");
      if (!media) return;
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(media, { rotateY: px * 4, rotateX: py * -4, transformPerspective: 900, duration: 0.5, ease: "power2.out" });
      });
      card.addEventListener("mouseleave", function () {
        gsap.to(media, { rotateX: 0, rotateY: 0, duration: 0.7, ease: "power3.out" });
      });
    });
  }

  /* ---------- Scroll reveals ---------- */
  function scrollReveals() {
    if (prefersReduced) { document.querySelectorAll(".project__poster, .project__title, .about__word, .contact__word, .stat__num").forEach(function (el) { el.style.opacity = 1; }); return; }

    /* Section heads */
    gsap.utils.toArray(".section-head").forEach(function (head) {
      gsap.fromTo(head.children, { y: 60, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1, ease: "power3.out", stagger: 0.12,
        scrollTrigger: { trigger: head, start: "top 85%", once: true }
      });
    });

    /* Projects: poster scale + parallax, title rise, top row fade */
    gsap.utils.toArray("[data-project]").forEach(function (proj) {
      var poster = proj.querySelector(".project__poster");
      var title = proj.querySelector(".project__title");
      var top = proj.querySelector(".project__top");
      var info = proj.querySelector(".project__desc");

      var st = {
        trigger: proj, start: "top 80%", once: true
      };
      if (poster) gsap.fromTo(poster, { scale: 1.18 }, { scale: 1, duration: 1.4, ease: "power3.out", scrollTrigger: st });
      if (title) gsap.fromTo(title, { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: proj, start: "top 72%", once: true } });
      if (top) gsap.fromTo(top, { opacity: 0 }, { opacity: 1, duration: 0.9, scrollTrigger: { trigger: proj, start: "top 85%", once: true } });
      if (info) gsap.fromTo(info, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: proj, start: "top 65%", once: true } });

      var wrap = proj.querySelector("[data-parallax-wrap]");
      if (wrap) {
        gsap.fromTo(wrap, { yPercent: -6 }, {
          yPercent: 6, ease: "none",
          scrollTrigger: { trigger: proj, start: "top bottom", end: "bottom top", scrub: 0.6 }
        });
      }
    });

    /* About statement — word by word */
    var words = document.querySelectorAll(".about__word");
    if (words.length) {
      gsap.to(words, {
        opacity: 1, duration: 0.35, stagger: 0.045, ease: "none",
        scrollTrigger: { trigger: "#statement", start: "top 78%", end: "bottom 45%", scrub: 0.4 }
      });
    }

    /* Stats count-up (supports decimals + suffix spans) */
    gsap.utils.toArray("[data-stat]").forEach(function (stat) {
      var numEl = stat.querySelector("[data-count]");
      if (!numEl) return;
      var target = parseFloat(numEl.getAttribute("data-count"));
      var decimals = parseInt(numEl.getAttribute("data-decimals") || "0", 10);
      var obj = { v: 0 };
      gsap.to(obj, {
        v: target, duration: 1.6, ease: "power2.out",
        scrollTrigger: { trigger: stat, start: "top 88%", once: true },
        onUpdate: function () { numEl.textContent = obj.v.toFixed(decimals); }
      });
    });

    /* Contact title */
    gsap.utils.toArray(".contact__word").forEach(function (w, i) {
      gsap.to(w, {
        y: "0%", duration: 1.2, ease: "power4.out",
        scrollTrigger: { trigger: "#contact", start: "top 75%", once: true }
      });
    });
  }

  /* ---------- Accordion ---------- */
  (function () {
    var rows = document.querySelectorAll("[data-acc]");
    rows.forEach(function (row) {
      row.addEventListener("click", function () {
        var isOpen = row.classList.contains("is-open");
        rows.forEach(function (r) { r.classList.remove("is-open"); });
        if (!isOpen) row.classList.add("is-open");
      });
    });
  })();

  /* ---------- Back to top ---------- */
  var backTop = document.getElementById("backTop");
  if (backTop) {
    backTop.addEventListener("click", function () {
      if (lenis) lenis.scrollTo(0, { duration: 1.4 });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Anchor links (smooth via lenis) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { duration: 1.3, offset: 0 });
      else target.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ---------- Init ---------- */
  if (prefersReduced) {
    document.querySelectorAll(".preloader").forEach(function (p) { p.style.display = "none"; });
    document.querySelectorAll(".hero__word, .contact__word").forEach(function (w) { w.style.transform = "none"; });
    if (window.gsap) scrollReveals();
  } else if (window.gsap) {
    runPreloader();
    scrollReveals();
  } else {
    /* CDN failed — never trap the visitor behind the preloader */
    preloader.style.display = "none";
    document.querySelectorAll(".hero__word, .contact__word").forEach(function (w) { w.style.transform = "none"; });
  }

  /* Rebuild triggers on resize (handles layout shifts) */
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
