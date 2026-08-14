/* ==========================================================================
   Ngõ Coffee — messages.js
   Trang Lời nhắn: đọc messages.json, lọc, phân trang, dựng lưới mosaic.

   Trang tĩnh nên không có chỗ nào ghi ngược vào messages.json. File đó là dữ
   liệu nền; lời nhắn khách vừa gửi ở trang chủ được giữ trong localStorage rồi
   trộn vào đây, nhờ vậy luồng "gửi xong thấy ngay" vẫn đúng. Muốn lưu thật thì
   cần một endpoint nhỏ ghi thêm vào messages.json — phần đó nằm ngoài HTML tĩnh.
   ========================================================================== */
(function () {
  'use strict';

  var d = document;
  var grid = d.getElementById('msg-grid');
  if (!grid) return;

  var PER_PAGE = 20;
  var LOCAL_KEY = 'ngo-messages';
  var CLAMP_CHARS = 260;          /* dài hơn ngần này thì cắt bớt */

  var form = d.getElementById('msg-filter');
  var elName = d.getElementById('f-name');
  var elFrom = d.getElementById('f-from');
  var elTo = d.getElementById('f-to');
  var elClear = d.getElementById('f-clear');
  var elHint = d.getElementById('f-hint');
  var elStat = d.getElementById('msg-stat');
  var elEmpty = d.getElementById('msg-empty');
  var elPager = d.getElementById('msg-pager');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var all = [];

  /* ---------- Tiện ích ---------- */

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* dd/mm/yyyy hh:mm:ss — đọc thẳng phần ngày giờ trong chuỗi ISO để khỏi bị
     trình duyệt quy đổi múi giờ làm lệch mất vài tiếng */
  function stampOf(iso) {
    var m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    if (!m) return '';
    return m[3] + '/' + m[2] + '/' + m[1] + ' ' + m[4] + ':' + m[5] + ':' + m[6];
  }

  /* so sánh thời gian bằng chuỗi ISO đã chuẩn hoá — tránh new Date() lệch múi */
  function sortKey(iso) { return String(iso).slice(0, 19); }

  /* Thứ tự hiển thị: lời nhắn khách vừa gửi từ máy này luôn nằm trên cùng, rồi
     mới tới phần còn lại xếp theo thời gian mới nhất. Chốt cứng như vậy để bản
     xem thử không phụ thuộc đồng hồ máy khách — lệch giờ vẫn thấy ngay bài mình. */
  function order(a, b) {
    if (!!a.mine !== !!b.mine) return a.mine ? -1 : 1;
    var ka = sortKey(a.at), kb = sortKey(b.at);
    return ka < kb ? 1 : ka > kb ? -1 : 0;
  }

  function escapeHtml(t) {
    return String(t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* bỏ dấu để gõ "minh" vẫn ra "Trần Minh", gõ "ha" vẫn ra "Hà" */
  function fold(t) {
    return String(t).normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  }

  function initials(name) {
    var parts = String(name).trim().split(/\s+/);
    return (parts[parts.length - 1] || '?').charAt(0).toUpperCase();
  }

  /* tô đậm đúng đoạn khớp, kể cả khi người dùng gõ không dấu */
  function highlight(text, q) {
    var safe = escapeHtml(text);
    if (!q) return safe;
    var hay = fold(safe), needle = fold(q);
    var at = hay.indexOf(needle);
    if (at < 0) return safe;
    return safe.slice(0, at) + '<mark>' + safe.slice(at, at + needle.length) + '</mark>' + safe.slice(at + needle.length);
  }

  /* ---------- Tham số trên URL ---------- */

  function readParams() {
    var u = new URLSearchParams(window.location.search);
    var page = parseInt(u.get('page'), 10);
    return {
      page: page > 0 ? page : 1,
      q: (u.get('q') || '').trim(),
      from: (u.get('from') || '').trim(),
      to: (u.get('to') || '').trim(),
    };
  }

  function writeParams(p, replace) {
    var u = new URLSearchParams();
    if (p.q) u.set('q', p.q);
    if (p.from) u.set('from', p.from);
    if (p.to) u.set('to', p.to);
    if (p.page > 1) u.set('page', p.page);
    var qs = u.toString();
    var url = window.location.pathname + (qs ? '?' + qs : '');
    history[replace ? 'replaceState' : 'pushState']({}, '', url);
  }

  /* ---------- Lọc ---------- */

  function filtered(p) {
    var q = p.q ? fold(p.q) : '';
    /* datetime-local cho ra "2026-08-01T09:30" — nới hai đầu cho trọn phút */
    var from = p.from ? (p.from.length === 16 ? p.from + ':00' : p.from) : '';
    var to = p.to ? (p.to.length === 16 ? p.to + ':59' : p.to) : '';
    return all.filter(function (m) {
      if (q && fold(m.name).indexOf(q) < 0) return false;
      var k = sortKey(m.at);
      if (from && k < from) return false;
      if (to && k > to) return false;
      return true;
    });
  }

  /* ---------- Dựng một thẻ ---------- */

  var ACCENTS = ['a', 'b', 'c', 'd'];

  function cardOf(m, i, q) {
    var el = d.createElement('article');
    el.className = 'mcard mcard--' + ACCENTS[i % ACCENTS.length] + (m.mine ? ' mcard--mine' : '');
    el.style.setProperty('--i', i % PER_PAGE);

    var long = m.message.length > CLAMP_CHARS;
    var chips = '';
    if (m.mine) chips += '<span class="mcard__chip mcard__chip--mine">Bạn vừa gửi</span>';
    if (m.topic) chips += '<span class="mcard__chip mcard__chip--topic">' + escapeHtml(m.topic) + '</span>';
    if (m.spot) chips += '<span class="mcard__chip">' + escapeHtml(m.spot) + '</span>';

    el.innerHTML =
      '<div class="mcard__top">' +
        '<span class="mcard__avatar" aria-hidden="true">' + escapeHtml(initials(m.name)) + '</span>' +
        '<span class="mcard__who">' +
          '<span class="mcard__name">' + highlight(m.name, q) + '</span>' +
          '<time class="mcard__when" datetime="' + escapeHtml(m.at) + '">' + stampOf(m.at) + '</time>' +
        '</span>' +
      '</div>' +
      '<p class="mcard__text' + (long ? ' is-clamped' : '') + '">' + escapeHtml(m.message) + '</p>' +
      (long ? '<button type="button" class="mcard__more">Xem thêm</button>' : '') +
      (chips ? '<div class="mcard__foot">' + chips + '</div>' : '');

    if (long) {
      var btn = el.querySelector('.mcard__more');
      var txt = el.querySelector('.mcard__text');
      btn.addEventListener('click', function () {
        var open = txt.classList.toggle('is-clamped');
        btn.textContent = open ? 'Xem thêm' : 'Thu gọn';
        measure(el);                 /* đổi chiều cao thì phải đo lại ô lưới */
      });
    }
    return el;
  }

  /* ---------- Mosaic: đo chiều cao thật rồi gán số hàng ----------
     Hàng lưới đặt 1px và khe dọc 0, nên số hàng của một thẻ chính là chiều cao
     của nó tính bằng px, cộng thêm GAP để chừa khoảng cách phía dưới.

     Chỗ dễ sai: nếu đo khi thẻ ĐANG bị lưới ràng buộc thì đọc ra chiều cao đã
     bị cắt, lần đo sau lại càng sai. Nên phải nhả lưới về `auto` cho mọi thẻ
     trở lại chiều cao tự nhiên, đọc một lượt, rồi mới siết lại và gán span. */
  var ROW = 1, GAP = 20;

  function measureAll() {
    var cards = [].slice.call(grid.children);
    if (!cards.length) return;

    /* một cột thì lưới thường là đủ, không cần mosaic */
    if (window.innerWidth < 640) {
      grid.style.gridAutoRows = '';
      grid.style.rowGap = GAP + 'px';
      cards.forEach(function (el) { el.style.gridRowEnd = ''; });
      return;
    }

    /* 1. nhả ra để đo chiều cao thật */
    grid.style.gridAutoRows = 'auto';
    grid.style.rowGap = GAP + 'px';
    cards.forEach(function (el) { el.style.gridRowEnd = ''; });

    /* 2. đọc một lượt (một lần dồn layout, không xen kẽ đọc–ghi) */
    var heights = cards.map(function (el) { return el.getBoundingClientRect().height; });

    /* 3. siết lại rồi gán span */
    grid.style.gridAutoRows = ROW + 'px';
    grid.style.rowGap = '0px';
    cards.forEach(function (el, i) {
      el.style.gridRowEnd = 'span ' + Math.max(Math.round(heights[i]) + GAP, 1);
    });
  }

  /* đo lại đúng một thẻ (khi bấm Xem thêm / Thu gọn) */
  function measure() { measureAll(); }

  /* ---------- Phân trang ---------- */

  function pagerLink(p, page, label, cls) {
    var u = new URLSearchParams();
    if (p.q) u.set('q', p.q);
    if (p.from) u.set('from', p.from);
    if (p.to) u.set('to', p.to);
    if (page > 1) u.set('page', page);
    var qs = u.toString();
    return '<a href="' + (qs ? '?' + qs : './') + '" data-page="' + page + '"' +
           (cls ? ' class="' + cls + '"' : '') + '>' + label + '</a>';
  }

  /* mũi tên < > vẽ bằng SVG, xem .chev trong main.css */
  var CHEV_PREV = '<svg class="chev" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M14.5 5.5 8 12l6.5 6.5"/></svg>';
  var CHEV_NEXT = '<svg class="chev" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9.5 5.5 16 12l-6.5 6.5"/></svg>';

  function renderPager(p, pages) {
    if (pages <= 1) { elPager.hidden = true; elPager.innerHTML = ''; return; }
    var out = [];
    out.push(p.page > 1
      ? pagerLink(p, p.page - 1, CHEV_PREV)
      : '<span class="is-off">' + CHEV_PREV + '</span>');

    /* luôn hiện trang đầu, trang cuối, và cửa sổ quanh trang hiện tại */
    var show = [];
    for (var i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || Math.abs(i - p.page) <= 1) show.push(i);
    }
    var prev = 0;
    show.forEach(function (i) {
      if (prev && i - prev > 1) out.push('<span class="msg-pager__gap">…</span>');
      out.push(i === p.page
        ? '<span class="is-current" aria-current="page">' + i + '</span>'
        : pagerLink(p, i, String(i)));
      prev = i;
    });

    out.push(p.page < pages
      ? pagerLink(p, p.page + 1, CHEV_NEXT)
      : '<span class="is-off">' + CHEV_NEXT + '</span>');

    elPager.innerHTML = out.join('');
    elPager.hidden = false;
  }

  /* ---------- Vẽ ---------- */

  var io = null;

  function render(p, scroll) {
    var list = filtered(p);
    var pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
    if (p.page > pages) p.page = pages;

    var start = (p.page - 1) * PER_PAGE;
    var slice = list.slice(start, start + PER_PAGE);

    grid.innerHTML = '';
    if (io) io.disconnect();

    slice.forEach(function (m, i) { grid.appendChild(cardOf(m, i, p.q)); });
    grid.setAttribute('aria-busy', 'false');

    var filtering = !!(p.q || p.from || p.to);

    /* Câu "không khớp bộ lọc" chỉ đúng khi người dùng ĐÃ lọc. Lúc mới vào trang
       mà chưa gõ gì thì để trống, dòng thống kê phía trên đã nói đủ. */
    elEmpty.hidden = list.length !== 0 || !filtering;

    /* thống kê + nhắc bộ lọc đang bật */
    elStat.innerHTML = filtering
      ? 'Khớp <b>' + list.length + '</b> / ' + all.length + ' lời nhắn · trang ' + p.page + '/' + pages
      : 'Tất cả <b>' + all.length + '</b> lời nhắn · trang ' + p.page + '/' + pages;
    elHint.textContent = filtering ? 'Đang lọc' : '';

    renderPager(p, pages);

    /* hiện dần khi cuộn tới, độ trễ đã đặt sẵn qua --i */
    if (reduceMotion || !('IntersectionObserver' in window)) {
      [].forEach.call(grid.children, function (el) { el.classList.add('is-in'); });
    } else {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
      [].forEach.call(grid.children, function (el) { io.observe(el); });
    }

    /* ảnh chữ cần một nhịp để layout xong mới đo được chiều cao */
    requestAnimationFrame(function () { requestAnimationFrame(measureAll); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureAll);

    if (scroll) {
      var top = d.querySelector('.msg-body').getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  }

  /* ---------- Nạp dữ liệu ---------- */

  function localMessages() {
    try {
      var raw = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
      return raw.map(function (m) { m.mine = true; return m; });
    } catch (e) { return []; }
  }

  function boot(seed) {
    all = seed.concat(localMessages()).sort(order);

    var p = readParams();
    elName.value = p.q;
    elFrom.value = p.from;
    elTo.value = p.to;
    render(p, false);

    /* gửi form -> ghi vào URL rồi vẽ lại, không tải lại trang */
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var np = { page: 1, q: elName.value.trim(), from: elFrom.value, to: elTo.value };
      writeParams(np, false);
      render(np, true);
    });

    elClear.addEventListener('click', function () {
      elName.value = ''; elFrom.value = ''; elTo.value = '';
      var np = { page: 1, q: '', from: '', to: '' };
      writeParams(np, false);
      render(np, true);
    });

    /* phân trang: chặn tải lại, chỉ đổi URL (?page=2) rồi vẽ lại */
    elPager.addEventListener('click', function (e) {
      var a = e.target.closest('a[data-page]');
      if (!a) return;
      e.preventDefault();
      var np = readParams();
      np.page = parseInt(a.getAttribute('data-page'), 10) || 1;
      np.q = elName.value.trim(); np.from = elFrom.value; np.to = elTo.value;
      writeParams(np, false);
      render(np, true);
    });

    /* nút back/forward của trình duyệt vẫn phải chạy đúng */
    window.addEventListener('popstate', function () {
      var np = readParams();
      elName.value = np.q; elFrom.value = np.from; elTo.value = np.to;
      render(np, false);
    });

    /* Khách gửi lời nhắn ở tab trang chủ đang mở song song: trộn lại rồi vẽ
       ngay, không bắt họ tải lại trang mới thấy bài của mình. */
    window.addEventListener('storage', function (e) {
      if (e.key && e.key !== LOCAL_KEY) return;
      all = seed.concat(localMessages()).sort(order);
      render(readParams(), false);
    });

    var rt = null;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(measureAll, 140);
    }, { passive: true });
  }

  fetch('messages.json', { cache: 'no-cache' })
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (data) { boot(data.messages || []); })
    .catch(function (err) {
      grid.setAttribute('aria-busy', 'false');
      elStat.textContent = 'Không đọc được messages.json — hãy mở trang qua http:// thay vì file://';
      elEmpty.hidden = false;
      elEmpty.lastChild.textContent =
        ' Trình duyệt chặn đọc file JSON khi mở bằng file://. Chạy một server tĩnh rồi mở lại trang này.';
      /* vẫn cho xem những lời nhắn gửi từ chính máy này */
      var mine = localMessages();
      if (mine.length) { all = mine; elEmpty.hidden = true; render(readParams(), false); }
      console.warn('[loi-nhan]', err);
    });
})();
