/* ==========================================================================
   Ngõ Coffee — flipbook.js
   Two-page 3D menu book (7 leaves = 14 pages) + mobile category switcher.
   Spread 0 shows the closed front cover on the right; each flip moves one
   leaf to the left half, revealing the next spread.
   ========================================================================== */
(function () {
  'use strict';

  var spread = document.getElementById('flip-spread');
  if (spread) initBook();
  initMobileMenu();
  initShare();

  function initBook() {
    var leaves = [].slice.call(spread.querySelectorAll('.leaf'));
    var total = leaves.length;              /* 7 leaves */
    var maxSpread = total;                  /* spread index 0..7 */
    var current = 0;

    var prev = document.getElementById('flip-prev');
    var next = document.getElementById('flip-next');
    var restart = document.getElementById('flip-restart');
    var peel = null;

    function render() {
      leaves.forEach(function (leaf, idx) {
        var flipped = idx < current;
        leaf.classList.toggle('is-flipped', flipped);
        /* flipped leaves stack upward on the left, unflipped stack downward
           on the right, so the topmost visible face is always correct */
        leaf.style.zIndex = String(flipped ? total + idx : total - idx);
      });

      if (prev) prev.disabled = current === 0;
      if (next) next.disabled = current === maxSpread;
    }

    /* the curl already showed the sheet travelling, so land on the new spread
       without letting the leaf's own transition swing it a second time */
    function commitTurn(s) {
      var target = Math.max(0, Math.min(maxSpread, s));
      if (target === current) return;
      current = target;
      spread.classList.add('is-instant');
      render();
      void spread.offsetWidth;
      requestAnimationFrame(function () {
        spread.classList.remove('is-instant');
        drainQueue();
      });
    }

    function drainQueue() {
      if (!queuedSteps) return;
      var dir = queuedSteps > 0 ? 1 : -1;
      queuedSteps -= dir;
      goTo(current + dir);
    }

    /* steps asked for while a sheet is mid-turn, played out once it lands */
    var queuedSteps = 0;

    function goTo(s) {
      var target = Math.max(0, Math.min(maxSpread, s));
      if (peel && peel.isTurning()) {
        /* Keep up with quick repeated clicks instead of dropping them, but never
           bank steps past the covers — otherwise they play out later and drag the
           book back the other way. */
        var dir = target > current ? 1 : target < current ? -1 : 0;
        var banked = current + queuedSteps + dir;
        if (dir && banked >= 0 && banked <= maxSpread) queuedSteps += dir;
        return;
      }
      if (target === current) { queuedSteps = 0; return; }

      /* One step onto a paper leaf rolls softly, however it was triggered —
         button, dot, key or a click away from the corners. Only the board
         leaves (the two covers) still swing flat, and so do multi-page jumps. */
      var step = target - current;
      if (peel && Math.abs(step) === 1) {
        var turningLeaf = step > 0 ? current : current - 1;
        if (peel.curlLeaf(turningLeaf, step, function () { commitTurn(target); })) return;
      }

      current = target;
      if (peel) peel.dropAll();   /* a turning sheet must not carry its dog-ear */
      render();
      drainQueue();
    }

    if (prev) prev.addEventListener('click', function () { goTo(current - 1); });
    if (next) next.addEventListener('click', function () { goTo(current + 1); });
    if (restart) restart.addEventListener('click', function () { goTo(0); });

    /* Click anywhere on the right-hand page to go forward, anywhere on the
       left-hand page to go back — the whole spread is the control surface. */
    spread.addEventListener('click', function (e) {
      /* let real controls, links and form fields do their own thing */
      if (e.target.closest('button, a, input, textarea, select, label')) return;
      /* don't flip when the click was the end of a text selection */
      var sel = window.getSelection();
      if (sel && sel.toString().length) return;
      /* nor when it was a click on a page's scrollbar */
      var scroller = e.target.closest('.page-list, .cover--back');
      if (scroller && e.clientX > scroller.getBoundingClientRect().right - scrollbarWidth(scroller)) return;

      var r = spread.getBoundingClientRect();
      /* Grabbed by a corner? Roll that sheet over. The direction comes from the
         sheet being held, not from where the click landed, so the page that
         animates is always the page that turns. */
      var heldDir = peel ? peel.heldDirection() : 0;
      if (heldDir && peel.curlHeld(function () { commitTurn(current + heldDir); })) return;
      goTo(e.clientX - r.left > r.width / 2 ? current + 1 : current - 1);
    });

    function scrollbarWidth(el) {
      return el.offsetWidth - el.clientWidth;
    }

    peel = initCornerPeel(spread, function () { return current; });

    /* arrow keys — only while the book is on screen */
    var inView = false;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
      }, { threshold: 0.25 }).observe(spread);
    }
    document.addEventListener('keydown', function (e) {
      if (!inView) return;
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (e.key === 'ArrowRight') { goTo(current + 1); }
      else if (e.key === 'ArrowLeft') { goTo(current - 1); }
      else return;
      e.preventDefault();
    });

    render();
  }

  /* ---------- Corner peel ----------
     All four outer corners of the open book react: the two right-hand ones on
     the recto, the two left-hand ones on the verso. While the pointer sits in a
     corner's zone the sheet folds back with its tip pinned to the pointer.

     Working from the grabbed corner C, with the pointer P at (a, b) away from
     it, paper folds along the perpendicular bisector of C→P. That line meets the
     horizontal edge at (a²+b²)/2a from the corner and the vertical edge at
     (a²+b²)/2b — so a pointer near one edge leaves a long fold along it.

     The whole overlay is built here rather than in the markup: it is invisible
     at rest, so keeping it out of the HTML costs nothing and covers all four
     corners without repeating a dozen nodes per page. */
  /* The part of a page still lying flat: its rectangle cut by the crease, keeping
     the side away from the corner being turned. Returns a clip-path polygon, or
     an empty one once the crease has run off the far edge. */
  function flatSidePolygon(W, H, crease, sx, sy) {
    var ax = crease.hx, ay = crease.hy;
    var nx = crease.vy - ay;              /* normal of the crease line */
    var ny = -(crease.vx - ax);
    /* the flat side is the one holding the corner opposite the one being turned */
    var refX = sx > 0 ? 0 : W;
    var refY = sy > 0 ? 0 : H;
    var sign = (nx * (refX - ax) + ny * (refY - ay)) >= 0 ? 1 : -1;

    var rect = [[0, 0], [W, 0], [W, H], [0, H]];
    var out = [];
    for (var i = 0; i < rect.length; i++) {
      var p = rect[i], q = rect[(i + 1) % rect.length];
      var dp = sign * (nx * (p[0] - ax) + ny * (p[1] - ay));
      var dq = sign * (nx * (q[0] - ax) + ny * (q[1] - ay));
      if (dp >= 0) out.push(p);
      if ((dp >= 0) !== (dq >= 0)) {
        var k = dp / (dp - dq);
        out.push([p[0] + k * (q[0] - p[0]), p[1] + k * (q[1] - p[1])]);
      }
    }
    if (out.length < 3) return 'polygon(0 0, 0 0, 0 0)';
    return 'polygon(' + out.map(function (v) {
      return v[0].toFixed(2) + 'px ' + v[1].toFixed(2) + 'px';
    }).join(',') + ')';
  }

  function initCornerPeel(spread, getCurrent) {
    /* a crease leg may run at most this fraction of the page's side */
    var MAX_LEG = 0.8;
    /* px offsets from the crease for the shading bands */
    var BANDS = [0, 3, 5.5, 10];
    /* how long a corner-led page turn takes */
    var CURL_MS = 820;
    /* a sheet mid-turn sits above every other leaf */
    var TURN_Z = 200;
    /* how much brighter a lifted sheet reads than one lying flat (mirrors the
       --peel-lift default in the stylesheet) */
    var LIFT = 1.9;
    var SVG_NS = 'http://www.w3.org/2000/svg';
    var uid = 0;

    var leaves = [].slice.call(spread.querySelectorAll('.leaf'));
    var faces = [];

    leaves.forEach(function (leaf, index) {
      /* A leaf carrying a cover is board, not paper: neither of its sides folds,
         because turning either one swings the stiff board with it. That rules out
         the first and last leaves entirely, not just their cover faces. */
      if (leaf.querySelector('.cover')) return;
      var front = leaf.querySelector('.leaf__face--front');
      var back = leaf.querySelector('.leaf__face--back');
      /* a recto is grabbable along its right edge, a verso along its left one */
      if (front) faces.push(makeFace(front, back, index, 1));
      if (back) faces.push(makeFace(back, front, index, -1));
    });

    /* face      — the sheet being folded
       reverse   — the face whose content shows through the fold
       index     — which leaf it belongs to
       side      — +1 for a right-hand page, -1 for a left-hand one */
    function makeFace(face, reverse, index, side) {
      /* `--peel-zone` may be a share of the page width ("33%") or a flat length
         ("200px"); a share keeps the grab area sensible on a small book */
      var zoneToken = (getComputedStyle(face).getPropertyValue('--peel-zone') || '').trim();
      var zoneIsRatio = zoneToken.slice(-1) === '%';
      var zoneValue = parseFloat(zoneToken);
      if (!isFinite(zoneValue)) { zoneValue = 33; zoneIsRatio = true; }
      function zoneFor(r) {
        return zoneIsRatio ? r.width * zoneValue / 100 : zoneValue;
      }
      var parts = null;
      var hold = null;

      /* built on first use so an untouched page costs nothing */
      function build() {
        if (parts) return parts;
        var id = 'peel-grad-' + (uid++);

        var back = document.createElement('div');
        back.className = 'peel-back';
        back.setAttribute('aria-hidden', 'true');
        var backInner = document.createElement('div');
        backInner.className = 'peel-back__inner';
        back.appendChild(backInner);

        if (reverse) {
          [].slice.call(reverse.children).forEach(function (child) {
            if (child.classList.contains('peel-back') || child.classList.contains('peel-fold')) return;
            var copy = child.cloneNode(true);
            copy.removeAttribute('id');
            copy.querySelectorAll('[id]').forEach(function (n) { n.removeAttribute('id'); });
            backInner.appendChild(copy);
          });
        }

        var svg = document.createElementNS(SVG_NS, 'svg');
        svg.setAttribute('class', 'peel-fold');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');

        var defs = document.createElementNS(SVG_NS, 'defs');
        var grad = document.createElementNS(SVG_NS, 'linearGradient');
        grad.setAttribute('id', id);
        grad.setAttribute('gradientUnits', 'userSpaceOnUse');
        var stops = [];
        for (var i = 0; i < BANDS.length + 1; i++) {
          var stop = document.createElementNS(SVG_NS, 'stop');
          grad.appendChild(stop);
          stops.push(stop);
        }
        defs.appendChild(grad);

        var voidTri = document.createElementNS(SVG_NS, 'polygon');
        voidTri.setAttribute('class', 'peel-fold__void');
        var paper = document.createElementNS(SVG_NS, 'polygon');
        paper.setAttribute('class', 'peel-fold__paper');
        paper.setAttribute('fill', 'url(#' + id + ')');
        var crease = document.createElementNS(SVG_NS, 'line');
        crease.setAttribute('class', 'peel-fold__crease');

        svg.appendChild(defs);
        svg.appendChild(voidTri);
        svg.appendChild(paper);
        svg.appendChild(crease);

        face.appendChild(back);
        face.appendChild(svg);

        parts = { back: back, backInner: backInner, svg: svg, grad: grad,
                  stops: stops, voidTri: voidTri, paper: paper, crease: crease };
        return parts;
      }

      /* sx, sy: which corner is held, as a direction from the page's middle
         (sx = +1 right edge, -1 left edge; sy = +1 bottom edge, -1 top edge) */
      function paint(r, px, py, sx, sy, uncapped) {
        var p = build();
        var W = r.width;
        var H = r.height;
        var cornerX = sx > 0 ? W : 0;
        var cornerY = sy > 0 ? H : 0;

        /* distance from the grabbed corner, kept off zero so the fold stays finite */
        var a = Math.max(Math.abs(cornerX - px), 0.5);
        var b = Math.max(Math.abs(cornerY - py), 0.5);

        /* A cursor hugging one edge would send the crease off the far side of the
           sheet, which no paper does. Cap each crease leg at MAX_LEG of the page
           and solve the cap back into the nearest legal tip:
           leg = (a²+b²)/2a ≤ C  =>  a ≥ C − √(C² − b²). */
        if (!uncapped) {
          var capX = MAX_LEG * W;
          var capY = MAX_LEG * H;
          a = Math.max(a, capX - Math.sqrt(Math.max(capX * capX - b * b, 0)));
          b = Math.max(b, capY - Math.sqrt(Math.max(capY * capY - a * a, 0)));
        }

        var tipX = cornerX - sx * a;
        var tipY = cornerY - sy * b;
        var d2 = a * a + b * b;

        /* crease ends on the horizontal and the vertical edge */
        var hx = cornerX - sx * (d2 / (2 * a)), hy = cornerY;
        var vx = cornerX, vy = cornerY - sy * (d2 / (2 * b));

        p.paper.setAttribute('points', hx + ',' + hy + ' ' + vx + ',' + vy + ' ' + tipX + ',' + tipY);
        /* the corner the paper vacated, showing the sheet underneath */
        p.voidTri.setAttribute('points', hx + ',' + hy + ' ' + vx + ',' + vy + ' ' + cornerX + ',' + cornerY);
        p.crease.setAttribute('x1', hx); p.crease.setAttribute('y1', hy);
        p.crease.setAttribute('x2', vx); p.crease.setAttribute('y2', vy);

        /* Shade straight across the fold: the midpoint of corner→tip sits on the
           crease and that segment is perpendicular to it, so offset 0 lands on
           the crease everywhere and the bands run its whole length. */
        var mx = (cornerX + tipX) / 2, my = (cornerY + tipY) / 2;
        p.grad.setAttribute('x1', mx); p.grad.setAttribute('y1', my);
        p.grad.setAttribute('x2', tipX); p.grad.setAttribute('y2', tipY);

        /* band offsets are px distances from the crease, so the streak keeps a
           constant width however far the corner is lifted */
        var depth = Math.hypot(tipX - mx, tipY - my) || 1;
        BANDS.forEach(function (d, i) {
          p.stops[i].setAttribute('offset', Math.min(d / depth, 1));
        });
        p.stops[p.stops.length - 1].setAttribute('offset', 1);

        /* the lifted flap shadows the flat page it now lies over, away from the fold */
        var len = Math.hypot(a, b) || 1;
        p.paper.style.filter = 'drop-shadow(' + (-13 * sx * a / len).toFixed(1) + 'px ' +
          (-13 * sy * b / len).toFixed(1) + 'px 22px rgba(0,0,0,0.95))';

        /* Show the sheet's reverse inside the flap: clip the wrapper to the
           triangle, then reflect the copy across the crease. For a crease with
           unit direction (dx, dy) the reflection is
           [dx²-dy²  2dxdy; 2dxdy  dy²-dx²], translated to pin the crease. */
        var cl = Math.hypot(vx - hx, vy - hy) || 1;
        var cdx = (vx - hx) / cl;
        var cdy = (vy - hy) / cl;
        var m11 = cdx * cdx - cdy * cdy;
        var m12 = 2 * cdx * cdy;
        var tx = hx - (m11 * hx + m12 * hy);
        var ty = hy - (m12 * hx - m11 * hy);
        p.back.style.clipPath = 'polygon(' + hx + 'px ' + hy + 'px,' + vx + 'px ' + vy + 'px,' + tipX + 'px ' + tipY + 'px)';
        /* The copy is laid over the front of the sheet but depicts its back, so
           mirror it across the page's centre line first: the sheet's outer edge
           has to end up away from the spine, not against it. Composing that
           mirror with the crease reflection gives the matrix below — and at the
           end of a turn it reduces to a plain shift of one page width, which is
           exactly where the turned page lands. */
        p.backInner.style.transform = 'matrix(' + (-m11) + ',' + (-m12) + ',' + m12 + ',' + (-m11) + ',' +
          (m11 * W + tx) + ',' + (m12 * W + ty) + ')';

        p.svg.classList.add('is-lifted');
        p.back.classList.add('is-lifted');
        return { hx: hx, hy: hy, vx: vx, vy: vy };
      }

      function drop() {
        hold = null;
        if (!parts) return;
        /* clear anything a turn left behind so the next hover starts clean */
        parts.svg.style.opacity = '';
        parts.backInner.style.removeProperty('--peel-lift');
        parts.svg.classList.remove('is-lifted');
        parts.back.classList.remove('is-lifted');
      }

      /* true while the pointer is holding one of this page's outer corners */
      function track(clientX, clientY) {
        var r = face.getBoundingClientRect();
        if (!r.width || !r.height) return false;
        var px = clientX - r.left;
        var py = clientY - r.top;
        /* the sheet sits on fractional pixels, so allow a hair past its edge and
           clamp back in — otherwise the outermost row ignores the pointer */
        if (px < -2 || py < -2 || px > r.width + 2 || py > r.height + 2) return false;
        px = Math.min(Math.max(px, 0), r.width);
        py = Math.min(Math.max(py, 0), r.height);

        var zone = zoneFor(r);
        var sx = side;                                   /* only the outer edge is grabbable */
        if (Math.abs((sx > 0 ? r.width : 0) - px) > zone) return false;
        var sy = py > r.height / 2 ? 1 : -1;              /* nearer the bottom or the top */
        if (Math.abs((sy > 0 ? r.height : 0) - py) > zone) return false;

        hold = { a: Math.abs((sx > 0 ? r.width : 0) - px), b: Math.abs((sy > 0 ? r.height : 0) - py), sx: sx, sy: sy };
        paint(r, px, py, sx, sy);
        return true;
      }

      /* Carry the fold on across the sheet: the tip travels out to twice the
         page width while the fold straightens (b → 0), so the crease sweeps from
         the grabbed corner over to the spine and the leaf ends up turned. */
      /* `start` overrides the held corner: pass {a:0, b:0} to roll the sheet
         evenly from the middle of its outer edge instead of from a corner. */
      function curl(done, start) {
        var from = start || hold;
        if (!from) return false;
        var leafEl = leaves[index];
        var p0 = build();
        /* Let the sheet escape its page box and ride over the other half. The
           overlay moves up to the leaf — same box, so the geometry is unchanged
           — so that the face underneath can be clipped to the part still lying
           flat without clipping the travelling sheet with it. */
        if (leafEl) {
          leafEl.classList.add('is-turning');
          leafEl.style.zIndex = String(TURN_Z);
          leafEl.appendChild(p0.back);
          leafEl.appendChild(p0.svg);
          /* A verso carries its own rotateY(180deg); hoisting the overlay out of
             it would drop that half of the transform and leave the fold mirrored
             against the leaf. Re-apply it so the overlay keeps the exact frame it
             had inside the page. */
          if (side < 0) {
            p0.back.style.transform = 'rotateY(180deg)';
            p0.svg.style.transform = 'rotateY(180deg)';
          }
        }
        var a0 = from.a;
        var b0 = from.b;
        var sx = from.sx, sy = from.sy;
        var started = null;

        function step(now) {
          if (started === null) started = now;
          var t = Math.min((now - started) / CURL_MS, 1);
          /* steady speed from start to finish — no easing on the travel */
          var e = t;
          var r = face.getBoundingClientRect();
          /* a = 2W lands the crease exactly on the spine and the tip exactly on
             the far edge, so the last frame coincides with the turned page */
          var a = a0 + (2 * r.width - a0) * e;
          var b = b0 * (1 - e);
          var crease = paint(r, (sx > 0 ? r.width : 0) - sx * a, (sy > 0 ? r.height : 0) - sy * b, sx, sy, true);
          /* Ease the raised-sheet lighting back to normal as the turn lands: the
             specular banding fades out and the brightness lift returns to 1, so
             the final frame is lit exactly like the flat page it becomes. */
          var p = build();
          p.svg.style.opacity = String(1 - e);
          p.backInner.style.setProperty('--peel-lift', String(LIFT + (1 - LIFT) * e));
          /* Hide the part of the sheet that has already lifted, so the page
             underneath shows through instead of the old one sitting there until
             the very last instant. */
          face.style.clipPath = flatSidePolygon(r.width, r.height, crease, sx, sy);

          if (t < 1) { requestAnimationFrame(step); return; }
          /* Let this last frame paint before swapping in the real page: the two
             are identical now, so the exchange is invisible. */
          requestAnimationFrame(function () {
            drop();
            face.style.clipPath = '';
            if (leafEl) {
              leafEl.classList.remove('is-turning');
              p0.back.style.transform = '';
              p0.svg.style.transform = '';
              face.appendChild(p0.back);
              face.appendChild(p0.svg);
            }
            done();   /* the caller re-renders, which restores the leaf's z-index */
          });
        }
        requestAnimationFrame(step);
        return true;
      }

      return { leaf: leaves[index], index: index, side: side, track: track, drop: drop, curl: curl };
    }

    /* A face is grabbable only while it is the page on show: the recto of the
       current spread, or the verso of the leaf just turned. */
    function isLive(f) {
      var current = getCurrent();
      return f.side > 0 ? f.index === current : f.index === current - 1;
    }

    /* The leaves live in a 3D context whose hit region is unreliable along the
       very edge of a face, so track the pointer at the document level and decide
       by geometry. Rects are only read inside the frame callback, keeping this
       to one layout read per animation frame however fast the mouse moves. */
    var pending = null;
    var queued = null;
    var held = null;
    var turning = false;

    function settle() {
      queued = null;
      if (turning) return;
      held = null;
      faces.forEach(function (f) {
        if (!held && isLive(f) && f.track(pending[0], pending[1])) held = f;
      });
      faces.forEach(function (f) { if (f !== held) f.drop(); });
    }

    document.addEventListener('mousemove', function (e) {
      pending = [e.clientX, e.clientY];
      if (queued) return;
      queued = requestAnimationFrame(settle);
    }, { passive: true });

    return {
      /* Turning a leaf must wipe any fold still on screen. Without this the
         sheet keeps its dog-ear as it rotates away and the fold appears to sit
         on the board cover underneath — which never folds. */
      dropAll: function () {
        if (turning) return;
        if (queued) { cancelAnimationFrame(queued); queued = null; }
        held = null;
        faces.forEach(function (f) { f.drop(); });
      },

      /* Is a corner being held right now, and which way would it turn? */
      heldDirection: function () {
        return held ? held.side : 0;
      },

      isTurning: function () { return turning; },

      /* Roll a given leaf over even though no corner is held: the fold starts as
         a straight crease along the outer edge, so the sheet rolls evenly from
         the middle rather than peeling from a corner. Returns false for the
         board leaves, which swing flat instead. */
      curlLeaf: function (index, dir, done) {
        if (turning) return false;
        var side = dir > 0 ? 1 : -1;
        var target = null;
        faces.forEach(function (f) {
          if (!target && f.index === index && f.side === side) target = f;
        });
        if (!target) return false;
        /* a dog-ear left on some other page must not ride along */
        faces.forEach(function (f) { if (f !== target) f.drop(); });
        var started = target.curl(function () {
          turning = false;
          held = null;
          done();
        }, { a: 0, b: 0, sx: side, sy: 1 });
        if (started) turning = true;
        return started;
      },

      /* Roll the held sheet over from its fold instead of swinging it flat.
         Returns false when no corner is held, so the caller can fall back. */
      curlHeld: function (done) {
        if (!held || turning) return false;
        var target = held;
        faces.forEach(function (f) { if (f !== target) f.drop(); });
        var started = held.curl(function () {
          turning = false;
          held = null;
          done();
        });
        if (started) turning = true;
        return started;
      },
    };
  }


  /* ---------- Mobile category switcher ---------- */
  function initMobileMenu() {
    var chips = [].slice.call(document.querySelectorAll('.menu-chip'));
    var panels = [].slice.call(document.querySelectorAll('.menu-panel'));
    if (!chips.length) return;

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var cat = chip.dataset.cat;
        chips.forEach(function (c) { c.classList.toggle('is-active', c === chip); });
        panels.forEach(function (p) { p.classList.toggle('is-active', p.dataset.cat === cat); });
      });
    });
  }

  /* ---------- Share button (native share / clipboard, no network calls) ---------- */
  function initShare() {
    var btn = document.getElementById('menu-share');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var url = location.href.split('#')[0] + '#menu';
      if (navigator.share) {
        navigator.share({ title: 'Ngõ Coffee — Sách thực đơn', url: url }).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url).catch(function () {});
      }
    });
  }
})();
