(() => {
  const body = document.body;
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle.querySelector('.theme-icon');
  const savedTheme = localStorage.getItem('saniya-theme');
  if (savedTheme === 'dark') body.classList.add('dark');
  const updateThemeIcon = () => { themeIcon.textContent = body.classList.contains('dark') ? '☀' : '☾'; };
  updateThemeIcon();
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark');
    localStorage.setItem('saniya-theme', body.classList.contains('dark') ? 'dark' : 'light');
    updateThemeIcon();
  });
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  menuToggle.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }));
  // Interactive mascot: cursor tracking, spring movement and idle blinking.
  const mascotCanvas = document.getElementById('mascotCanvas');
  if (mascotCanvas) {
    // Safety: the canvas must be sized by CSS, never by its own pixel buffer (prevents runaway growth on high-DPI screens).
    mascotCanvas.style.width = '100%';
    mascotCanvas.style.height = '100%';
    const ctx = mascotCanvas.getContext('2d');
    const sprite = new Image();
    // Sprite sheet configuration.
    const SPRITE_PATH = 'assets/mascot-sheet.webp';
    const FRAME_COUNT = 33;
    const IDLE_FRAME = 16;
    const LAST_LOOK_FRAME = 30;
    const BLINK_FRAMES = [31, 32];
    let frameWidth = 0, frameHeight = 0, canvasWidth = 0, canvasHeight = 0, dpr = 1;
    // Spring animation state.
    let position = IDLE_FRAME, velocity = 0, target = IDLE_FRAME, followingCursor = false, lastTime = 0;
    // Idle blinking state.
    let blinkActive = false, blinkStarted = 0, nextBlink = 3000 + Math.random() * 2500;
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    // Load the horizontal sprite sheet.
    sprite.onload = () => {
      frameWidth = sprite.naturalWidth / FRAME_COUNT;
      frameHeight = sprite.naturalHeight;
      resizeCanvas();
    };
    sprite.onerror = () => { console.error(`Mascot sprite sheet not found: ${SPRITE_PATH}`); };
    sprite.src = SPRITE_PATH;
    // Keep the canvas sharp on high-density screens.
    function resizeCanvas() {
      const rect = mascotCanvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvasWidth = rect.width;
      canvasHeight = rect.height;
      mascotCanvas.width = Math.round(canvasWidth * dpr);
      mascotCanvas.height = Math.round(canvasHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener('resize', resizeCanvas, { passive: true });
    if ('ResizeObserver' in window) {
      const mascotObserver = new ResizeObserver(resizeCanvas);
      mascotObserver.observe(mascotCanvas);
    }
    // Convert cursor position into a target animation frame.
    function handlePointerMove(event) {
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
      followingCursor = true;
      const normalizedX = (event.clientX / window.innerWidth - 0.5) / 0.41;
      const x = clamp(normalizedX, -1, 1);
      // Ease the movement towards the selected frame.
      const eased = Math.sign(x) * (1 - Math.pow(1 - Math.abs(x), 1.6));
      target = eased < 0 ? IDLE_FRAME + eased * IDLE_FRAME : IDLE_FRAME + eased * (LAST_LOOK_FRAME - IDLE_FRAME);
    }
    function returnToIdle() { followingCursor = false; target = IDLE_FRAME; }
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    // Return to eye contact when the pointer leaves the page.
    document.addEventListener('pointerout', event => { if (!event.relatedTarget) returnToIdle(); });
    window.addEventListener('blur', returnToIdle);
    // Draw one frame from the horizontal sprite sheet.
    function drawFrame(index, alpha = 1) {
      if (!frameWidth || !frameHeight) return;
      const frame = clamp(index, 0, FRAME_COUNT - 1);
      const scale = Math.min(canvasWidth / frameWidth, canvasHeight / frameHeight);
      const drawWidth = frameWidth * scale, drawHeight = frameHeight * scale;
      const x = (canvasWidth - drawWidth) / 2, y = (canvasHeight - drawHeight) / 2;
      ctx.globalAlpha = alpha;
      ctx.drawImage(sprite, frame * frameWidth, 0, frameWidth, frameHeight, x, y, drawWidth, drawHeight);
      ctx.globalAlpha = 1;
    }
    // Smoothly animate between the selected frames.
    function drawAnimation(timestamp) {
      requestAnimationFrame(drawAnimation);
      if (!frameWidth || !frameHeight) return;
      const dt = lastTime ? Math.min((timestamp - lastTime) / 1000, 0.032) : 0;
      lastTime = timestamp;
      // Critically damped spring interpolation.
      const stiffness = followingCursor ? 170 : 55;
      const damping = 2 * Math.sqrt(stiffness);
      velocity += (stiffness * (target - position) - damping * velocity) * dt;
      position += velocity * dt;
      // Stop tiny movements to avoid unnecessary calculations.
      if (Math.abs(target - position) < 0.001 && Math.abs(velocity) < 0.001) {
        position = target;
        velocity = 0;
      }
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      // Play an idle blink when the character is resting.
      const isIdle = Math.abs(position - IDLE_FRAME) < 0.3 && Math.abs(velocity) < 0.15;
      if (!blinkActive && isIdle && timestamp >= nextBlink) {
        blinkActive = true;
        blinkStarted = timestamp;
      }
      if (blinkActive) {
        const elapsed = timestamp - blinkStarted;
        if (elapsed < 110) drawFrame(BLINK_FRAMES[0]);
        else if (elapsed < 220) drawFrame(BLINK_FRAMES[1]);
        else {
          blinkActive = false;
          nextBlink = timestamp + 3000 + Math.random() * 2500;
          drawFrame(IDLE_FRAME);
        }
        return;
      }
      // Blend adjacent frames for smooth transitions.
      const currentFrame = clamp(Math.floor(position), 0, LAST_LOOK_FRAME);
      const nextFrame = Math.min(currentFrame + 1, LAST_LOOK_FRAME);
      const fraction = position - Math.floor(position);
      drawFrame(currentFrame);
      if (fraction > 0.005 && nextFrame !== currentFrame) drawFrame(nextFrame, fraction);
    }
    requestAnimationFrame(drawAnimation);
  }
  // Gentle reveal as sections enter the viewport.
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  // Scroll progress indicator.
  const progressBar = document.getElementById('progressBar');
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
  document.getElementById('year').textContent = new Date().getFullYear();
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

  // Projects: start with one card, scroll to reveal all (tablet/desktop only)
  const projectStage = document.getElementById('projectStage');
  const projectTrack = document.getElementById('projectTrack');
  if (projectStage && projectTrack && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    window.addEventListener('load', () => ScrollTrigger.refresh());
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    gsap.matchMedia().add('(min-width: 640px) and (prefers-reduced-motion: no-preference)', () => {
      const cards = gsap.utils.toArray('#projectTrack .project-card');
      const n = cards.length, GAP = 20, PAD = 16;
      const step = () => cards[0].offsetWidth + GAP;
      // how far the row overflows the stage on each side
      const overflow = () => Math.max(0, ((n - 1) * step() + cards[0].offsetWidth) / 2 - (projectStage.clientWidth / 2 - PAD));

      cards.forEach(c => { c.style.transition = 'none'; });
      gsap.set(cards, { x: 0, y: 0, opacity: 1, zIndex: i => n - i });
      gsap.set(projectTrack, { x: 0 });

      const revealTime = 0.8 + 0.18 * (n - 1);
      const tl = gsap.timeline({
        scrollTrigger: { trigger: '#projects', start: 'top top', end: '+=2400', pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true }
      });
      tl.to({}, { duration: 0.3 });                                   // hold on the single card
      tl.to(cards, { x: i => (i - (n - 1) / 2) * step(), ease: 'power3.out', duration: 0.8, stagger: 0.18 }, 'reveal');
      tl.to(projectTrack, { x: () => overflow(), ease: 'power3.out', duration: revealTime }, 'reveal');
      tl.to(projectTrack, { x: () => -overflow(), ease: 'none', duration: 1.2 }); // pan to the last card
      tl.to({}, { duration: 0.3 });                                   // hold the full row
    });
  }

   // Contact section TextCursor background
  const contactSection = document.getElementById('contact');
  const cursorLayer = document.getElementById('contactCursorLayer');

  if (
    contactSection &&
    cursorLayer &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    const TRAIL_TEXT = 'SA.';
    const SPACING = 68;
    const MAX_POINTS = 7;

    let lastX = 0;
    let lastY = 0;
    let hasMoved = false;
    const stamps = [];

    contactSection.addEventListener('pointermove', event => {
      const rect = contactSection.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (!hasMoved) {
        lastX = x;
        lastY = y;
        hasMoved = true;
      }

      const dx = x - lastX;
      const dy = y - lastY;
      const distance = Math.hypot(dx, dy);

      if (distance < SPACING) return;

      const angle = Math.atan2(dy, dx) * 180 / Math.PI;

      const stamp = document.createElement('span');
      stamp.className = 'contact-cursor-item';
      stamp.textContent = TRAIL_TEXT;

      stamp.style.left = `${x}px`;
      stamp.style.top = `${y}px`;
      stamp.style.transform =
        `translate(-50%, -50%) rotate(${angle}deg)`;

      cursorLayer.appendChild(stamp);
      stamps.push(stamp);

      while (stamps.length > MAX_POINTS) {
        stamps.shift().remove();
      }

      setTimeout(() => {
        stamp.remove();
        const index = stamps.indexOf(stamp);
        if (index !== -1) stamps.splice(index, 1);
      }, 850);

      lastX = x;
      lastY = y;
    });

    contactSection.addEventListener('pointerleave', () => {
      hasMoved = false;
    });
  }

  // Project summaries use only the information supplied in the resume/project brief.
  const caseStudies = {
    chrom: { eyebrow: 'FREELANCE WEBSITE DESIGN & DEVELOPMENT', title: 'Studio Chrom', text: 'A freelance website project for a creative studio. The work focused on presenting the studio’s identity and requirements through a considered website experience, with attention to visual presentation, page structure, responsive layouts and navigation. The live website is available to explore.', tools: 'Website design · Development · Responsive UX · Content structure', link: 'https://www.studiochrom.in/' },
    voting: { eyebrow: 'WEB / SECURITY PROJECT', title: 'Cloud-Based Voting System', text: 'A secure online voting platform built with user authentication, efficient data handling and clear result presentation. The project explored how a digital voting experience can organise participation and display outcomes clearly.', tools: 'Web development · Authentication · Cloud concepts' },
    news: { eyebrow: 'DATA SCIENCE PROJECT', title: 'Fake News Detection System', text: 'A Python-based machine learning project focused on identifying potentially misleading news content. The work involved data cleaning, model training and efforts to improve model accuracy.', tools: 'Python · Machine learning · Data cleaning' },
    quiz: { eyebrow: 'FRONT-END PROJECT', title: 'Online Quiz System', text: 'A browser-based quiz application with question display, answer input and score tracking. It was created to practise building interactive interfaces with core web technologies.', tools: 'HTML · CSS · JavaScript' },
    lab: { eyebrow: 'NETWORKING PROJECT', title: 'Home Lab Network Setup', text: 'A hands-on project exploring network setup and practical networking concepts. It connects with an ongoing interest in networking fundamentals and TCP/IP models.', tools: 'Networking · TCP/IP' },
    blog: { eyebrow: 'WEB PROJECT', title: 'Blog Platform', text: 'A digital platform project focused on creating, organising and presenting written content. Further implementation details and a public project link can be added when available.', tools: 'Web development · Content organisation' },
    automation: { eyebrow: 'AUTOMATION PROJECT', title: 'Automation Script', text: 'A scripting project exploring how repetitive tasks can be simplified and workflows made more efficient. Specific implementation details can be added as the project is documented.', tools: 'Scripting · Automation' }
  };
  const dialog = document.getElementById('caseDialog');
  document.querySelectorAll('.case-study-trigger').forEach(button => button.addEventListener('click', () => {
    const item = caseStudies[button.dataset.case];
    document.getElementById('dialogEyebrow').textContent = item.eyebrow;
    document.getElementById('dialogTitle').textContent = item.title;
    document.getElementById('dialogText').textContent = item.text;
    document.getElementById('dialogTools').textContent = item.tools;
    const link = document.getElementById('dialogLink');
    if (item.link) { link.href = item.link; link.hidden = false; } else { link.hidden = true; }
    dialog.showModal();
  }));
  document.getElementById('dialogClose').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
})();
