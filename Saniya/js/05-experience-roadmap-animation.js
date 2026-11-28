{
      // Experience roadmap: scroll-driven, with decode text
  const rm = document.getElementById('roadmap');
  if (rm) {
    const HOP_MS = 1100;                         // marker travel time between dots
    const MILESTONES = [0.14, 0.40, 0.66, 0.90]; // dot positions along the road
    const CHARS = '01<>/\\{}[]#$%&*+=?ABCDEFGHJKMNPQRSTUVWXYZ'; // scramble characters
    const DEC = '.exp-date,.exp-type,h3,h4,li,p';
    const road = document.getElementById('rmRoad');
    const fill = document.getElementById('rmFill');
    const marker = document.getElementById('rmMarker');
    const nodes = [...rm.querySelectorAll('.rm-node')];
    const labels = [...rm.querySelectorAll('.rm-label')];
    const items = [...document.querySelectorAll('.exp-item')];
    const headEls = [...document.querySelectorAll('#experience .section-heading .eyebrow, #experience .section-heading h2, #experience .section-heading .section-lead')];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const L = road.getTotalLength();
    let cur = 0, shown = -1, raf = 0, timers = [];
    fill.style.strokeDasharray = L;
    MILESTONES.forEach((m, i) => {
      const pt = road.getPointAtLength(L * m);
      nodes[i].setAttribute('cx', pt.x);
      nodes[i].setAttribute('cy', pt.y);
      labels[i].style.left = (pt.x / 600 * 100) + '%';
      labels[i].style.top = (pt.y / 340 * 100) + '%';
    });
    const render = p => {
      cur = p;
      fill.style.strokeDashoffset = L * (1 - p);
      const pt = road.getPointAtLength(L * p);
      marker.setAttribute('transform', `translate(${pt.x} ${pt.y})`);
      MILESTONES.forEach((m, i) => {
        const on = p >= m - 0.001;
        nodes[i].classList.toggle('on', on);
        labels[i].classList.toggle('on', on);
      });
    };
    const moveTo = target => {
      cancelAnimationFrame(raf);
      const from = cur, t0 = performance.now();
      const tick = now => {
        const t = Math.min((now - t0) / HOP_MS, 1);
        render(from + (target - from) * (1 - Math.pow(1 - t, 3))); // ease-out
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    // ---- decode helpers (keeps <em>/<br> structure intact) ----
    const prep = el => {
      if (el._tn) return;
      const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      el._tn = []; let n;
      while ((n = w.nextNode())) if (n.nodeValue.trim()) el._tn.push({ n, t: n.nodeValue });
      el._len = el._tn.reduce((s, o) => s + o.t.length, 0);
    };
    const restore = el => {
      if (!el._tn) return;
      el._tn.forEach(o => { o.n.nodeValue = o.t; });
      el.classList.remove('decoding');
      el.style.minHeight = '';
    };
    const stop = el => { el._run = (el._run || 0) + 1; restore(el); };
    const decode = els => {
      els.forEach(prep);
      els.forEach(e => { e.style.minHeight = e.offsetHeight + 'px'; }); // stops layout jumping
      const runs = els.map(e => (e._run = (e._run || 0) + 1));
      const t0 = performance.now();
      const tick = now => {
        let busy = false;
        els.forEach((e, k) => {
          if (e._run !== runs[k]) return;
          const dur = Math.min(1000, 400 + e._len * 9);   // decode speed per line
          const t = (now - t0 - k * 130) / dur;            // 130 = delay between lines
          if (t >= 1) { restore(e); return; }
          busy = true;
          e.classList.add('decoding');
          const cut = Math.max(0, t) * e._len;
          let base = 0;
          e._tn.forEach(o => {
            o.n.nodeValue = [...o.t].map((c, i) => (c === ' ' || c === '\n' || base + i < cut) ? c : CHARS[Math.random() * CHARS.length | 0]).join('');
            base += o.t.length;
          });
        });
        if (busy) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const reveal = i => {
      if (i <= shown) return;
      for (let k = shown + 1; k <= i; k++) {
        items[k].classList.add('on');
        if (!reduce) decode([...items[k].querySelectorAll(DEC)]);
      }
      shown = i;
      reduce ? render(MILESTONES[i]) : moveTo(MILESTONES[i]);
    };
    const replay = () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout); timers = [];
      items.forEach(it => { it.classList.remove('on'); [...it.querySelectorAll(DEC)].forEach(stop); });
      shown = -1; render(0);
      items.forEach((_, i) => timers.push(setTimeout(() => reveal(i), 250 + i * HOP_MS * 1.15)));
    };
    document.getElementById('rmReplay').addEventListener('click', () => { if (!reduce) replay(); });

    if (reduce) {
      items.forEach(it => it.classList.add('on'));
      shown = items.length - 1; render(1);
    } else {
      render(0);
      // each text block reveals when it scrolls into view
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting || e.boundingClientRect.top < 0) reveal(items.indexOf(e.target));
        });
      }, { rootMargin: '0px 0px -30% 0px' });
      items.forEach(it => io.observe(it));
      // heading decodes once when it appears
      const headIo = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) { decode(headEls); headIo.disconnect(); }
      }, { threshold: 0.4 });
      headIo.observe(headEls[0]);
    }
  }


}
