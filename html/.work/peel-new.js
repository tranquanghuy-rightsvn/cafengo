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
  function initCornerPeel(spread, getCurrent) {
    /* a crease leg may run at most this fraction of the page's side */
    var MAX_LEG = 0.8;
    /* px offsets from the crease for the shading bands */
    var BANDS = [0, 3, 5.5, 10];
    var SVG_NS = 'http://www.w3.org/2000/svg';
    var uid = 0;

    var leaves = [].slice.call(spread.querySelectorAll('.leaf'));
    var faces = [];

    leaves.forEach(function (leaf, index) {
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
      var zone = parseFloat(getComputedStyle(face).getPropertyValue('--peel-zone')) || 200;
      var parts = null;

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
      function paint(r, px, py, sx, sy) {
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
        var capX = MAX_LEG * W;
        var capY = MAX_LEG * H;
        a = Math.max(a, capX - Math.sqrt(Math.max(capX * capX - b * b, 0)));
        b = Math.max(b, capY - Math.sqrt(Math.max(capY * capY - a * a, 0)));

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
        p.back.style.clipPath = 'polygon(' + hx + 'px ' + hy + 'px,' + vx + 'px ' + vy + 'px,' + tipX + 'px ' + tipY + 'px)';
        p.backInner.style.transform = 'matrix(' + m11 + ',' + m12 + ',' + m12 + ',' + (-m11) + ',' +
          (hx - (m11 * hx + m12 * hy)) + ',' + (hy - (m12 * hx - m11 * hy)) + ')';

        p.svg.classList.add('is-lifted');
        p.back.classList.add('is-lifted');
      }

      function drop() {
        if (!parts) return;
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

        var sx = side;                                   /* only the outer edge is grabbable */
        if (Math.abs((sx > 0 ? r.width : 0) - px) > zone) return false;
        var sy = py > r.height / 2 ? 1 : -1;              /* nearer the bottom or the top */
        if (Math.abs((sy > 0 ? r.height : 0) - py) > zone) return false;

        paint(r, px, py, sx, sy);
        return true;
      }

      return { leaf: leaves[index], index: index, side: side, track: track, drop: drop };
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

    function settle() {
      queued = null;
      var held = null;
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
  }

