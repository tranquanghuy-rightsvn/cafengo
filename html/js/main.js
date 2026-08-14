/* ==========================================================================
   Ngõ Coffee — main.js
   Shared behaviour: scroll progress, header state, mobile nav, active-section
   tracking, back-to-top, cursor glow, scroll reveal
   ========================================================================== */
(function () {
  'use strict';

  var d = document;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scroll progress + header state + back-to-top ---------- */
  var progress = d.getElementById('scroll-progress');
  var header = d.getElementById('site-header');
  var toTop = d.getElementById('to-top');

  function onScroll() {
    var y = window.scrollY || d.documentElement.scrollTop;
    var max = d.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    if (header) header.classList.toggle('is-scrolled', y > 20);
    if (toTop) toTop.classList.toggle('is-visible', y > 600);
  }

  var scheduled = false;
  window.addEventListener('scroll', function () {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function () { onScroll(); scheduled = false; });
  }, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Mobile navigation ---------- */
  var overlay = d.getElementById('nav-overlay');
  var openBtn = d.getElementById('nav-open');
  var closeBtn = d.getElementById('nav-close');

  function setNav(open) {
    if (!overlay) return;
    overlay.classList.toggle('is-open', open);
    overlay.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (openBtn) openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    d.body.style.overflow = open ? 'hidden' : '';
  }

  if (openBtn) openBtn.addEventListener('click', function () { setNav(true); });
  if (closeBtn) closeBtn.addEventListener('click', function () { setNav(false); });
  if (overlay) {
    overlay.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setNav(false); });
    });
  }
  d.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setNav(false);
  });

  /* ---------- Active section tracking in nav ---------- */
  var sections = [].slice.call(d.querySelectorAll('main section[id]'));
  /* Chỉ theo dõi link trỏ tới mục trong chính trang này. Link sang trang khác
     ("loi-nhan/", "../index.html#menu") không được đụng vào, nếu không cuộn một
     cái là nút Lời nhắn trên trang lời nhắn bị gỡ mất trạng thái đang mở. */
  var navLinks = [].slice.call(d.querySelectorAll('.nav-desktop .nav-link, .nav-mobile a'))
    .filter(function (a) { return (a.getAttribute('href') || '').charAt(0) === '#'; });

  if (sections.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = '#' + entry.target.id;
        navLinks.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = [].slice.call(d.querySelectorAll('.reveal'));
  if (!reveals.length) {
    /* nothing to do */
  } else if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    reveals.forEach(function (el) { revealer.observe(el); });
  }

  /* ---------- Cursor glow (fine pointers only) ---------- */
  var glow = d.getElementById('cursor-glow');
  if (glow && window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion) {
    var gx = 0, gy = 0, pending = false;
    window.addEventListener('mousemove', function (e) {
      gx = e.clientX; gy = e.clientY;
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        glow.style.transform = 'translate3d(' + gx + 'px,' + gy + 'px,0) translate(-50%,-50%)';
        glow.style.opacity = '1';
        pending = false;
      });
    }, { passive: true });
    d.addEventListener('mouseleave', function () { glow.style.opacity = '0'; });
  }

  /* ---------- Glass panels: pointer-tracked sheen ---------- */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    d.addEventListener('mousemove', function (e) {
      var panel = e.target.closest && e.target.closest('.glass');
      if (!panel) return;
      var r = panel.getBoundingClientRect();
      panel.style.setProperty('--mouse-x', (e.clientX - r.left) + 'px');
      panel.style.setProperty('--mouse-y', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }
})();
