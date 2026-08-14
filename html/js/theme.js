/* ==========================================================================
   Ngõ Coffee — theme.js
   Đổi giao diện Tối ⇄ Sáng ngay trong trang, không đổi URL, không tải lại.

   Toàn bộ màu nằm ở hai khối token trong css/main.css, nên việc ở đây chỉ là
   bật/tắt thuộc tính data-theme trên thẻ <html>. Phần còn lại là làm cho cú
   chuyển đó mượt:
     · Có View Transitions  -> loang tròn từ chính chỗ vừa bấm.
     · Không có             -> chuyển màu bằng CSS transition trong ~450ms.
   ========================================================================== */
(function () {
  'use strict';

  var d = document;
  var root = d.documentElement;
  var KEY = 'ngo-theme';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var btn = d.getElementById('theme-toggle');
  var btnMobile = d.getElementById('theme-toggle-mobile');
  var mapImg = d.getElementById('map-img');

  function current() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  /* Nhãn và trạng thái của hai nút luôn mô tả việc SẼ xảy ra khi bấm. */
  function syncControls() {
    var light = current() === 'light';
    if (btn) {
      btn.setAttribute('aria-pressed', light ? 'true' : 'false');
      btn.setAttribute('aria-label', light ? 'Chuyển sang giao diện tối' : 'Chuyển sang giao diện sáng');
    }
    if (btnMobile) {
      btnMobile.setAttribute('aria-pressed', light ? 'true' : 'false');
      var label = btnMobile.querySelector('.nav-mobile__theme-label');
      if (label) label.textContent = light ? 'Giao diện tối' : 'Giao diện sáng';
    }
    var meta = d.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', light ? '#faf7f1' : '#121414');
  }

  /* Bản đồ có hai file ảnh, CSS không đổi hộ được. */
  function syncMap() {
    if (!mapImg) return;
    var want = mapImg.getAttribute(current() === 'light' ? 'data-src-light' : 'data-src-dark');
    if (want && mapImg.getAttribute('src') !== want) mapImg.setAttribute('src', want);
  }

  function apply(next) {
    if (next === 'light') root.setAttribute('data-theme', 'light');
    else root.removeAttribute('data-theme');
    try { localStorage.setItem(KEY, next); } catch (e) { /* bỏ qua */ }
    syncControls();
    syncMap();
  }

  /* Chuyển bằng CSS transition — dùng khi trình duyệt chưa có View Transitions.
     Chỉ bật transition trong lúc đổi rồi tắt ngay, để mọi lúc khác trang không
     phải gánh thêm transition trên hàng nghìn phần tử. */
  var animTimer = null;
  function fade(next) {
    root.classList.add('theme-anim');
    apply(next);
    clearTimeout(animTimer);
    animTimer = setTimeout(function () { root.classList.remove('theme-anim'); }, 620);
  }

  /* Chuyển bằng View Transitions — loang một hình tròn từ điểm vừa bấm ra
     hết màn hình. Bán kính lấy bằng khoảng cách tới góc xa nhất. */
  function reveal(next, x, y) {
    var far = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );
    var t = d.startViewTransition(function () { apply(next); });
    t.ready.then(function () {
      root.animate(
        { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)',
                     'circle(' + far + 'px at ' + x + 'px ' + y + 'px)'] },
        {
          duration: 620,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    }).catch(function () { /* trình duyệt huỷ giữa chừng thì thôi */ });
  }

  function toggle(e) {
    var next = current() === 'light' ? 'dark' : 'light';

    if (btn) {
      btn.classList.remove('is-pinged');
      void btn.offsetWidth;               /* ép vẽ lại để animation chạy lần nữa */
      btn.classList.add('is-pinged');
    }

    if (reduceMotion) { apply(next); return; }

    if (!d.startViewTransition) { fade(next); return; }

    /* tâm vòng loang: chỗ con trỏ vừa bấm, hoặc giữa nút nếu bấm bằng bàn phím */
    var src = e && e.currentTarget ? e.currentTarget : btn;
    var x = window.innerWidth - 56;
    var y = 40;
    if (e && e.clientX) { x = e.clientX; y = e.clientY; }
    else if (src) {
      var r = src.getBoundingClientRect();
      x = r.left + r.width / 2;
      y = r.top + r.height / 2;
    }
    reveal(next, x, y);
  }

  if (btn) btn.addEventListener('click', toggle);
  if (btnMobile) btnMobile.addEventListener('click', toggle);

  syncControls();
  syncMap();

  /* Nạp sẵn ảnh bản đồ của theme còn lại để lần bấm đầu không phải chờ. */
  window.addEventListener('load', function () {
    if (!mapImg) return;
    var other = mapImg.getAttribute(current() === 'light' ? 'data-src-dark' : 'data-src-light');
    if (other) { var pre = new Image(); pre.src = other; }
  });
})();
