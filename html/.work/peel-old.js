  /* ---------- Corner peel ----------
     Fold the bottom-right corner of the right-hand page while the pointer is
     inside its 200x200 zone, with the folded tip pinned to the pointer.

     Working from the page corner C, with the pointer P at (a, b) away from it,
     paper folds along the perpendicular bisector of C→P. That line meets the
     bottom edge at (a²+b²)/2a from the corner and the right edge at
     (a²+b²)/2b — so a pointer near one edge leaves a long fold along it. */
  function initCornerPeel(spread) {
    /* a crease leg may run at most this fraction of the page's side */
    var MAX_LEG = 0.8;
    var pages = [];

    spread.querySelectorAll('.leaf__face--front').forEach(function (face) {
      var svg = face.querySelector('.peel-fold');
      if (!svg) return;

      var paper = svg.querySelector('.peel-fold__paper');
      var voidTri = svg.querySelector('.peel-fold__void');
      var crease = svg.querySelector('.peel-fold__crease');
      var grad = svg.querySelector('linearGradient');
      var stops = [].slice.call(svg.querySelectorAll('stop'));
      var back = face.querySelector('.peel-back');
      var backInner = back && back.querySelector('.peel-back__inner');
      var leaf = face.closest('.leaf');
      var zone = parseFloat(getComputedStyle(face).getPropertyValue('--peel-zone')) || 200;
      /* distance in px from the crease for each colour band */
      var BANDS = [0, 3, 5.5, 10];

      /* the reverse of this sheet is the same leaf's back face — copy it in on
         first use so the fold can show it mirrored */
      function fillBack() {
        if (!backInner || backInner.childElementCount) return;
        var source = leaf && leaf.querySelector('.leaf__face--back');
        if (!source) return;
        [].slice.call(source.children).forEach(function (child) {
          var copy = child.cloneNode(true);
          copy.removeAttribute('id');
          copy.querySelectorAll('[id]').forEach(function (n) { n.removeAttribute('id'); });
          backInner.appendChild(copy);
        });
      }

      function paint(cx, cy) {
        var r = face.getBoundingClientRect();
        var W = r.width;
        var H = r.height;
        /* distance from the page corner, kept off zero so the fold stays finite */
        var a = Math.max(W - cx, 0.5);
        var b = Math.max(H - cy, 0.5);

        /* A cursor hugging one edge would send the crease off the far side of the
           sheet, which no paper does. Cap each crease leg at MAX_LEG of the page
           and solve the cap back into the nearest legal tip:
           leg = (a²+b²)/2a ≤ C  =>  a ≥ C − √(C² − b²). */
        var capX = MAX_LEG * W;
        var capY = MAX_LEG * H;
        a = Math.max(a, capX - Math.sqrt(Math.max(capX * capX - b * b, 0)));
        b = Math.max(b, capY - Math.sqrt(Math.max(capY * capY - a * a, 0)));

        var px = W - a;
        var py = H - b;
        var d2 = a * a + b * b;

        var bx = W - d2 / (2 * a), by = H;   /* crease end on the bottom edge */
        var rx = W, ry = H - d2 / (2 * b);   /* crease end on the right edge  */

        paper.setAttribute('points', bx + ',' + by + ' ' + rx + ',' + ry + ' ' + px + ',' + py);
        /* the corner the paper vacated, showing the sheet underneath */
        voidTri.setAttribute('points', bx + ',' + by + ' ' + rx + ',' + ry + ' ' + W + ',' + H);
        crease.setAttribute('x1', bx); crease.setAttribute('y1', by);
        crease.setAttribute('x2', rx); crease.setAttribute('y2', ry);

        /* Shade straight across the fold: the midpoint of corner→tip sits on the
           crease and that segment is perpendicular to it, so offset 0 lands on
           the crease everywhere and the bands run its whole length. */
        var mx = (W + px) / 2, my = (H + py) / 2;
        grad.setAttribute('x1', mx); grad.setAttribute('y1', my);
        grad.setAttribute('x2', px); grad.setAttribute('y2', py);

        /* band offsets are px distances from the crease, so the streak keeps a
           constant width however far the corner is lifted */
        var depth = Math.hypot(px - mx, py - my) || 1;
        BANDS.forEach(function (d, i) {
          stops[i].setAttribute('offset', Math.min(d / depth, 1));
        });
        stops[stops.length - 1].setAttribute('offset', 1);

        /* the lifted flap shadows the flat page it now lies over, away from the fold */
        var len = Math.hypot(a, b) || 1;
        paper.style.filter = 'drop-shadow(' + (-13 * a / len).toFixed(1) + 'px ' +
          (-13 * b / len).toFixed(1) + 'px 22px rgba(0,0,0,0.95))';

        /* Show the sheet's reverse inside the flap: clip the wrapper to the
           triangle, then reflect the copy across the crease. For a crease with
           unit direction (dx, dy) the reflection is
           [dx²-dy²  2dxdy; 2dxdy  dy²-dx²], translated to pin the crease. */
        if (backInner) {
          var cdx = (rx - bx) / (Math.hypot(rx - bx, ry - by) || 1);
          var cdy = (ry - by) / (Math.hypot(rx - bx, ry - by) || 1);
          var m11 = cdx * cdx - cdy * cdy;
          var m12 = 2 * cdx * cdy;
          back.style.clipPath = 'polygon(' + bx + 'px ' + by + 'px,' + rx + 'px ' + ry + 'px,' + px + 'px ' + py + 'px)';
          backInner.style.transform = 'matrix(' + m11 + ',' + m12 + ',' + m12 + ',' + (-m11) + ',' +
            (bx - (m11 * bx + m12 * by)) + ',' + (by - (m12 * bx - m11 * by)) + ')';
        }
      }

      function drop() {
        svg.classList.remove('is-lifted');
        if (back) back.classList.remove('is-lifted');
      }

      /* returns true while the pointer is inside this page's corner zone */
      function track(clientX, clientY) {
        var r = face.getBoundingClientRect();
        if (!r.width) return false;
        var px = clientX - r.left;
        var py = clientY - r.top;
        /* the sheet sits on fractional pixels, so allow a hair past its edge and
           clamp back in — otherwise the last row of the page ignores the pointer */
        if (px > r.width + 2 || py > r.height + 2) return false;
        px = Math.min(px, r.width);
        py = Math.min(py, r.height);
        if (r.width - px > zone || r.height - py > zone) return false;

        fillBack();
        paint(px, py);
        svg.classList.add('is-lifted');
        if (back) back.classList.add('is-lifted');
        return true;
      }

      pages.push({ leaf: leaf, track: track, drop: drop });
    });

    /* The leaves live in a 3D context whose hit region is unreliable along the
       very edge of a face, so track the pointer at the document level and decide
       by geometry. Rects are only read inside the frame callback, keeping this
       to one layout read per animation frame however fast the mouse moves. */
    var pending = null;
    var queued = null;

    function settle() {
      queued = null;
      var active = null;
      pages.forEach(function (p) {
        if (!active && p.leaf && !p.leaf.classList.contains('is-flipped')) active = p;
      });
      pages.forEach(function (p) { if (p !== active) p.drop(); });
      if (active && !active.track(pending[0], pending[1])) active.drop();
    }

    document.addEventListener('mousemove', function (e) {
      pending = [e.clientX, e.clientY];
      if (queued) return;
      queued = requestAnimationFrame(settle);
    }, { passive: true });
  }

