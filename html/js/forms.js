/* ==========================================================================
   Ngõ Coffee — forms.js
   Hành vi của khối liên hệ và form cảm nhận: chọn chip chủ đề, chip danh mục
   thực đơn bản mobile, sao chép thông tin, gửi form.
   Không gọi ra API nào — mọi thứ chạy tại chỗ.
   ========================================================================== */
(function () {
  'use strict';

  var d = document;

  /* Chọn một nút trong nhóm, bỏ chọn các nút còn lại. */
  function pickOne(container, sel, cls, onPick) {
    if (!container) return;
    var btns = [].slice.call(container.querySelectorAll(sel));
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.disabled) return;
        btns.forEach(function (b) { b.classList.remove(cls); b.setAttribute('aria-pressed', 'false'); });
        btn.classList.add(cls);
        btn.setAttribute('aria-pressed', 'true');
        if (onPick) onPick(btn);
      });
      btn.setAttribute('aria-pressed', btn.classList.contains(cls) ? 'true' : 'false');
    });
  }

  /* ---------- Liên hệ: chip chủ đề ---------- */
  pickOne(d.getElementById('contact-chips'), '.chip', 'is-active');

  /* ---------- Thực đơn phiên bản mobile: chip danh mục ---------- */
  var menuChips = d.querySelector('.menu-chips');
  if (menuChips) {
    var panels = [].slice.call(d.querySelectorAll('.menu-panel'));
    pickOne(menuChips, '.menu-chip', 'is-active', function (btn) {
      var chips = [].slice.call(menuChips.querySelectorAll('.menu-chip'));
      var at = chips.indexOf(btn);
      panels.forEach(function (p, i) { p.classList.toggle('is-active', i === at); });
    });
  }

  /* ---------- Nút sao chép ---------- */
  [].slice.call(d.querySelectorAll('.info__copy')).forEach(function (btn) {
    var original = btn.textContent;
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy') || '';
      var done = function () {
        btn.textContent = '[ Đã chép ]';
        setTimeout(function () { btn.textContent = original; }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, done);
      } else {
        /* trình duyệt cũ: mượn một ô ẩn rồi execCommand */
        var ta = d.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:absolute;left:-9999px';
        d.body.appendChild(ta);
        ta.select();
        try { d.execCommand('copy'); } catch (e) { /* chịu, bỏ qua */ }
        d.body.removeChild(ta);
        done();
      }
    });
  });

  /* ---------- Gửi form ----------
     Trang tĩnh nên không gửi đi đâu cả: chặn submit, báo đã nhận rồi dọn form. */
  function wireForm(form, message, onSent) {
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var required = [].slice.call(form.querySelectorAll('[required]'));
      var missing = required.filter(function (f) { return !f.value.trim(); });
      required.forEach(function (f) { f.classList.remove('is-invalid'); });
      if (missing.length) {
        missing.forEach(function (f) { f.classList.add('is-invalid'); });
        missing[0].focus();
        flash(form, 'Bạn điền giúp quán những ô có dấu * nhé.', false);
        return;
      }
      var saved = onSent ? onSent(form) : null;   /* đọc dữ liệu TRƯỚC khi reset */
      /* Lưu được thì chỉ luôn cho khách chỗ xem lại bài mình vừa gửi. */
      flash(form, message, true, saved ? 'Xem lời nhắn của bạn' : '');
      form.reset();
    });
  }

  function flash(form, text, ok, linkLabel) {
    var note = form.querySelector('.form-note');
    if (!note) {
      note = d.createElement('p');
      note.className = 'form-note';
      note.setAttribute('role', 'status');
      note.setAttribute('aria-live', 'polite');
      form.appendChild(note);
    }
    note.textContent = text;
    if (linkLabel) {
      var a = d.createElement('a');
      a.className = 'form-note__link';
      a.href = 'loi-nhan/';
      a.textContent = linkLabel;
      note.appendChild(d.createTextNode(' '));
      note.appendChild(a);
    }
    note.classList.toggle('form-note--warn', !ok);
    note.classList.add('is-shown');
    clearTimeout(note._t);
    /* có link thì để lâu hơn một chút, đủ thời gian đọc rồi bấm */
    note._t = setTimeout(function () { note.classList.remove('is-shown'); }, linkLabel ? 9000 : 5000);
  }

  /* ---------- Lưu lời nhắn để trang Lời nhắn đọc lại ----------
     Trang tĩnh không ghi ngược được vào loi-nhan/messages.json, nên lời nhắn
     vừa gửi được giữ trong localStorage rồi trộn vào danh sách bên đó. Nhờ vậy
     luồng "gửi xong thấy ngay" vẫn đúng khi xem thử. Muốn lưu thật thì cần một
     endpoint nhỏ ghi thêm vào messages.json. */
  var STORE = 'ngo-messages';

  function stamp() {
    var t = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return t.getFullYear() + '-' + p(t.getMonth() + 1) + '-' + p(t.getDate()) + 'T' +
           p(t.getHours()) + ':' + p(t.getMinutes()) + ':' + p(t.getSeconds()) + '+07:00';
  }

  function keep(entry) {
    if (!entry.name || !entry.message) return null;
    try {
      var list = JSON.parse(localStorage.getItem(STORE) || '[]');
      entry.id = 'local-' + Date.now();
      entry.at = stamp();
      list.push(entry);
      /* giữ 200 cái gần nhất là quá đủ cho bản xem thử */
      if (list.length > 200) list = list.slice(-200);
      localStorage.setItem(STORE, JSON.stringify(list));
      paintCount();                  /* con số trên nút phải khớp ngay lập tức */
      return entry;
    } catch (e) { return null; }     /* hết dung lượng hoặc bị chặn thì bỏ qua */
  }

  function val(form, sel) {
    var el = form.querySelector(sel);
    return el ? el.value.trim() : '';
  }

  var contactForm = d.querySelector('.contact__panel form');
  var feedbackForm = d.querySelector('.feedback form');

  wireForm(contactForm, 'Cảm ơn bạn, quán đã nhận lời nhắn và sẽ trả lời sớm.', function (f) {
    var chip = d.querySelector('#contact-chips .chip.is-active');
    return keep({ name: val(f, '#ct-name'), spot: '', topic: chip ? chip.textContent.trim() : '',
                  message: val(f, '#ct-msg') });
  });
  wireForm(feedbackForm, 'Cảm ơn bạn đã dành thời gian, quán đọc hết từng dòng.', function (f) {
    return keep({ name: val(f, '#fb-name'), spot: val(f, '#fb-role'), topic: '',
                  message: val(f, '#fb-msg') });
  });

  /* ---------- Số lời nhắn trên nút "Xem tất cả lời nhắn" ----------
     Bằng số bài trong messages.json cộng số bài khách vừa gửi ở máy này. Tách
     riêng seedCount để lúc gửi xong còn cộng lại được mà không phải fetch lần nữa. */
  var allBtn = d.getElementById('fb-all-count');
  var seedCount = null;

  function paintCount() {
    if (!allBtn || seedCount === null) return;
    var mine = 0;
    try { mine = JSON.parse(localStorage.getItem(STORE) || '[]').length; } catch (e) {}
    allBtn.textContent = '(' + (seedCount + mine) + ')';
  }

  if (allBtn) {
    fetch('loi-nhan/messages.json', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data) return;
        seedCount = data.count || (data.messages || []).length;
        paintCount();
      })
      .catch(function () { /* mở bằng file:// thì thôi, không hiện số */ });
  }
})();
