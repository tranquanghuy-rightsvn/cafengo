/* ==========================================================================
   Ngõ Coffee — gallery.js
   Mosaic không gian quán: hiện dần theo nhịp khi cuộn tới, và lightbox xem
   ảnh lớn (chuột, bàn phím, chạm).
   ========================================================================== */
(function () {
  'use strict';

  var d = document;
  var mosaic = d.getElementById('gallery-mosaic');
  if (!mosaic) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var tiles = [].slice.call(mosaic.querySelectorAll('.gtile'));

  /* ---------- Hiện dần khi cuộn tới ----------
     Độ trễ nằm ở CSS (transition-delay theo --i) nên ở đây chỉ cần bật class;
     cả cụm vào khung một lượt mà vẫn lệch nhịp nhau. */
  if (reduceMotion || !('IntersectionObserver' in window)) {
    tiles.forEach(function (t) { t.classList.add('is-visible'); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    tiles.forEach(function (t) { observer.observe(t); });
  }

  /* ---------- Dữ liệu ảnh, đọc thẳng từ markup ---------- */
  var items = tiles.map(function (tile) {
    var img = tile.querySelector('img');
    return {
      src: img.getAttribute('src'),
      alt: img.getAttribute('alt') || '',
      name: (tile.querySelector('.gtile__name') || {}).textContent || '',
      sub: (tile.querySelector('.gtile__sub') || {}).textContent || '',
      trigger: tile.querySelector('.gtile__btn'),
    };
  });

  /* ---------- Lightbox ---------- */
  var box = d.getElementById('lightbox');
  if (!box) return;

  var boxImg = d.getElementById('lightbox-img');
  var boxCount = d.getElementById('lightbox-count');
  var boxName = d.getElementById('lightbox-name');
  var boxSub = d.getElementById('lightbox-sub');
  var btnPrev = d.getElementById('lightbox-prev');
  var btnNext = d.getElementById('lightbox-next');
  var btnClose = d.getElementById('lightbox-close');

  var index = 0;
  var lastFocus = null;

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function show(i) {
    index = (i + items.length) % items.length;
    var it = items[index];
    /* bỏ is-ready trước rồi bật lại sau khi ảnh mới sẵn sàng, để mỗi lần
       chuyển ảnh đều có nhịp mờ-rồi-rõ thay vì nhảy phắt */
    box.classList.remove('is-ready');
    var next = new Image();
    next.onload = function () {
      boxImg.src = it.src;
      boxImg.alt = it.alt;
      box.classList.add('is-ready');
    };
    next.src = it.src;
    if (next.complete) next.onload();

    boxCount.textContent = pad(index + 1) + ' / ' + pad(items.length);
    boxName.textContent = it.name;
    boxSub.textContent = it.sub;
  }

  function open(i) {
    lastFocus = d.activeElement;
    box.hidden = false;
    /* ép trình duyệt vẽ trạng thái ẩn một nhịp, nếu không transition không chạy */
    void box.offsetWidth;
    box.classList.add('is-open');
    d.body.style.overflow = 'hidden';
    show(i);
    btnClose.focus();
  }

  function close() {
    box.classList.remove('is-open', 'is-ready');
    d.body.style.overflow = '';
    var done = function () { box.hidden = true; };
    if (reduceMotion) done();
    else setTimeout(done, 400);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  items.forEach(function (it, i) {
    if (!it.trigger) return;
    it.trigger.addEventListener('click', function () { open(i); });
  });

  btnPrev.addEventListener('click', function () { show(index - 1); });
  btnNext.addEventListener('click', function () { show(index + 1); });
  btnClose.addEventListener('click', close);
  box.querySelectorAll('[data-lb-close]').forEach(function (el) {
    el.addEventListener('click', close);
  });

  d.addEventListener('keydown', function (e) {
    if (box.hidden) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'ArrowLeft') { show(index - 1); return; }
    if (e.key === 'ArrowRight') { show(index + 1); return; }
    /* giữ tiêu điểm quẩn trong hộp: chỉ có 3 nút nên xoay vòng bằng tay */
    if (e.key === 'Tab') {
      var order = [btnPrev, btnNext, btnClose];
      var at = order.indexOf(d.activeElement);
      e.preventDefault();
      order[(at + (e.shiftKey ? -1 : 1) + order.length) % order.length].focus();
    }
  });

  /* ---------- Vuốt ngang trên thiết bị chạm ---------- */
  var touchX = null;
  box.addEventListener('touchstart', function (e) {
    touchX = e.changedTouches[0].clientX;
  }, { passive: true });
  box.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
  }, { passive: true });
})();
