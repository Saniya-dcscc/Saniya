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
    const ctx = mascotCanvas.getContext('2d');
    const sprite = new Image();

    // Sprite sheet configuration.
    const SPRITE_PATH = 'assets/mascot-sheet.webp';
    const FRAME_COUNT = 33;
    const IDLE_FRAME = 16;
    const LAST_LOOK_FRAME = 30;
    const BLINK_FRAMES = [31, 32];

    let frameWidth = 0;
    let frameHeight = 0;
    let canvasWidth = 0;
    let canvasHeight = 0;
    let dpr = 1;

    // Spring animation state.
    let position = IDLE_FRAME;
    let velocity = 0;
    let target = IDLE_FRAME;
    let followingCursor = false;
    let lastTime = 0;

    // Idle blinking state.
    let blinkActive = false;
    let blinkStarted = 0;
    let nextBlink = 3000 + Math.random() * 2500;

    const clamp = (value, min, max) =>
      Math.max(min, Math.min(max, value));

    // Load the horizontal sprite sheet.
    sprite.onload = () => {
      frameWidth = sprite.naturalWidth / FRAME_COUNT;
      frameHeight = sprite.naturalHeight;

      resizeCanvas();
    };

    sprite.onerror = () => {
      console.error(
        `Mascot sprite sheet not found: ${SPRITE_PATH}`
      );
    };

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

    window.addEventListener('resize', resizeCanvas, {
      passive: true
    });

    if ('ResizeObserver' in window) {
      const mascotObserver = new ResizeObserver(resizeCanvas);
      mascotObserver.observe(mascotCanvas);
    }

    // Convert cursor position into a target animation frame.
    function handlePointerMove(event) {
      if (!window.matchMedia(
        '(hover: hover) and (pointer: fine)'
      ).matches) return;

      followingCursor = true;

      const normalizedX =
        (event.clientX / window.innerWidth - 0.5) / 0.41;

      const x = clamp(normalizedX, -1, 1);

      // Ease the movement towards the selected frame.
      const eased =
        Math.sign(x) *
        (1 - Math.pow(1 - Math.abs(x), 1.6));

      target = eased < 0
        ? IDLE_FRAME + eased * IDLE_FRAME
        : IDLE_FRAME + eased * (LAST_LOOK_FRAME - IDLE_FRAME);
    }

    function returnToIdle() {
      followingCursor = false;
      target = IDLE_FRAME;
    }

    window.addEventListener(
      'pointermove',
      handlePointerMove,
      { passive: true }
    );

    // Return to eye contact when the pointer leaves the page.
    document.addEventListener('pointerout', event => {
      if (!event.relatedTarget) {
        returnToIdle();
      }
    });

    window.addEventListener('blur', returnToIdle);

    // Draw one frame from the horizontal sprite sheet.
    function drawFrame(index, alpha = 1) {
      if (!frameWidth || !frameHeight) return;

      const frame = clamp(index, 0, FRAME_COUNT - 1);

      const scale = Math.min(
        canvasWidth / frameWidth,
        canvasHeight / frameHeight
      );

      const drawWidth = frameWidth * scale;
      const drawHeight = frameHeight * scale;

      const x = (canvasWidth - drawWidth) / 2;
      const y = (canvasHeight - drawHeight) / 2;

      ctx.globalAlpha = alpha;

      ctx.drawImage(
        sprite,
        frame * frameWidth,
        0,
        frameWidth,
        frameHeight,
        x,
        y,
        drawWidth,
        drawHeight
      );

      ctx.globalAlpha = 1;
    }

    // Smoothly animate between the selected frames.
    function drawAnimation(timestamp) {
      requestAnimationFrame(drawAnimation);

      if (!frameWidth || !frameHeight) return;

      const dt = lastTime
        ? Math.min((timestamp - lastTime) / 1000, 0.032)
        : 0;

      lastTime = timestamp;

      // Critically damped spring interpolation.
      const stiffness = followingCursor ? 170 : 55;
      const damping = 2 * Math.sqrt(stiffness);

      velocity += (
        stiffness * (target - position) -
        damping * velocity
      ) * dt;

      position += velocity * dt;

      // Stop tiny movements to avoid unnecessary calculations.
      if (
        Math.abs(target - position) < 0.001 &&
        Math.abs(velocity) < 0.001
      ) {
        position = target;
        velocity = 0;
      }

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Play an idle blink when the character is resting.
      const isIdle =
        Math.abs(position - IDLE_FRAME) < 0.3 &&
        Math.abs(velocity) < 0.15;

      if (!blinkActive && isIdle && timestamp >= nextBlink) {
        blinkActive = true;
        blinkStarted = timestamp;
      }

      if (blinkActive) {
        const elapsed = timestamp - blinkStarted;

        if (elapsed < 110) {
          drawFrame(BLINK_FRAMES[0]);
        } else if (elapsed < 220) {
          drawFrame(BLINK_FRAMES[1]);
        } else {
          blinkActive = false;
          nextBlink =
            timestamp + 3000 + Math.random() * 2500;
          drawFrame(IDLE_FRAME);
        }

        return;
      }

      // Blend adjacent frames for smooth transitions.
      const currentFrame = clamp(
        Math.floor(position),
        0,
        LAST_LOOK_FRAME
      );

      const nextFrame = Math.min(
        currentFrame + 1,
        LAST_LOOK_FRAME
      );

      const fraction = position - Math.floor(position);

      drawFrame(currentFrame);

      if (fraction > 0.005 && nextFrame !== currentFrame) {
        drawFrame(nextFrame, fraction);
      }
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
  }, {threshold: .12});
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // Scroll progress indicator.
  const progressBar = document.getElementById('progressBar');
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  };
  window.addEventListener('scroll', updateProgress, {passive:true});
  updateProgress();
  document.getElementById('year').textContent = new Date().getFullYear();

  // Project summaries use only the information supplied in the resume/project brief.
  const caseStudies = {
    chrom: {eyebrow:'FREELANCE WEBSITE DESIGN & DEVELOPMENT',title:'Studio Chrom',text:'A freelance website project for a creative studio. The work focused on presenting the studio’s identity and requirements through a considered website experience, with attention to visual presentation, page structure, responsive layouts and navigation. The live website is available to explore.',tools:'Website design · Development · Responsive UX · Content structure',link:'https://www.studiochrom.in/'},
    voting:{eyebrow:'WEB / SECURITY PROJECT',title:'Cloud-Based Voting System',text:'A secure online voting platform built with user authentication, efficient data handling and clear result presentation. The project explored how a digital voting experience can organise participation and display outcomes clearly.',tools:'Web development · Authentication · Cloud concepts'},
    news:{eyebrow:'DATA SCIENCE PROJECT',title:'Fake News Detection System',text:'A Python-based machine learning project focused on identifying potentially misleading news content. The work involved data cleaning, model training and efforts to improve model accuracy.',tools:'Python · Machine learning · Data cleaning'},
    quiz:{eyebrow:'FRONT-END PROJECT',title:'Online Quiz System',text:'A browser-based quiz application with question display, answer input and score tracking. It was created to practise building interactive interfaces with core web technologies.',tools:'HTML · CSS · JavaScript'},
    lab:{eyebrow:'NETWORKING PROJECT',title:'Home Lab Network Setup',text:'A hands-on project exploring network setup and practical networking concepts. It connects with an ongoing interest in networking fundamentals and TCP/IP models.',tools:'Networking · TCP/IP'},
    blog:{eyebrow:'WEB PROJECT',title:'Blog Platform',text:'A digital platform project focused on creating, organising and presenting written content. Further implementation details and a public project link can be added when available.',tools:'Web development · Content organisation'},
    automation:{eyebrow:'AUTOMATION PROJECT',title:'Automation Script',text:'A scripting project exploring how repetitive tasks can be simplified and workflows made more efficient. Specific implementation details can be added as the project is documented.',tools:'Scripting · Automation'}
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
