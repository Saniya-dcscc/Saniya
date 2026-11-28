{
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

}
