{
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

}
