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
  function wireForm(form, message) {
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
      flash(form, message, true);
      form.reset();
    });
  }

  function flash(form, text, ok) {
    var note = form.querySelector('.form-note');
    if (!note) {
      note = d.createElement('p');
      note.className = 'form-note';
      note.setAttribute('role', 'status');
      note.setAttribute('aria-live', 'polite');
      form.appendChild(note);
    }
    note.textContent = text;
    note.classList.toggle('form-note--warn', !ok);
    note.classList.add('is-shown');
    clearTimeout(note._t);
    note._t = setTimeout(function () { note.classList.remove('is-shown'); }, 5000);
  }

  wireForm(d.querySelector('.contact__panel form'), 'Cảm ơn bạn, quán đã nhận lời nhắn và sẽ trả lời sớm.');
  wireForm(d.querySelector('.feedback form'), 'Cảm ơn bạn đã dành thời gian, quán đọc hết từng dòng.');
})();
