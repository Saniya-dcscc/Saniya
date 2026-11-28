{
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

}
