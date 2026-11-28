{
    // ===== 3D CERTIFICATION CARD CAROUSEL =====

  const certCarousel = document.getElementById('certCarousel');

  if (certCarousel) {
    const stage = document.getElementById('certCarouselStage');
    const cards = [...stage.querySelectorAll('.cert-card')];

    const prevButton = document.getElementById('certPrev');
    const nextButton = document.getElementById('certNext');
    const replayButton = document.getElementById('certReplay');
    const dotsContainer = document.getElementById('certDots');

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let activeIndex = 0;
    let autoplayTimer = null;

    // Create navigation dots.
    cards.forEach((card, index) => {
      const dot = document.createElement('button');

      dot.type = 'button';
      dot.className = 'cert-dot';
      dot.setAttribute('aria-label', `Show certification ${index + 1}`);

      dot.addEventListener('click', () => {
        setActive(index);
        restartAutoplay();
      });

      dotsContainer.appendChild(dot);
    });

    const dots = [...dotsContainer.querySelectorAll('.cert-dot')];

    // Update 3D positions.
    function updateCarousel() {
      const spacing = Math.min(
        260,
        Math.max(130, stage.clientWidth * 0.24)
      );

      cards.forEach((card, index) => {
        let offset = index - activeIndex;

        // Shortest circular direction.
        if (offset > cards.length / 2) {
          offset -= cards.length;
        }

        if (offset < -cards.length / 2) {
          offset += cards.length;
        }

        const distance = Math.abs(offset);

        const positions = {
          x: offset * spacing,
          z: distance === 0 ? 0 : -115 * distance,
          rotate: offset * -24,
          scale: distance === 0 ? 1 : distance === 1 ? 0.84 : 0.68,
          opacity: distance === 0 ? 1 : distance === 1 ? 0.85 : 0.42
        };

        card.style.setProperty('--card-x', `${positions.x}px`);
        card.style.setProperty('--card-z', `${positions.z}px`);
        card.style.setProperty('--card-rotate', `${positions.rotate}deg`);
        card.style.setProperty('--card-scale', positions.scale);
        card.style.setProperty('--card-opacity', positions.opacity);
        card.style.setProperty('--card-index', 10 - distance);

        card.style.setProperty(
          '--card-visibility',
          distance > 2 ? 'hidden' : 'visible'
        );

        card.style.pointerEvents = distance <= 2 ? 'auto' : 'none';

        card.classList.toggle('is-active', distance === 0);

        card.setAttribute('aria-hidden', String(distance !== 0));

        card.addEventListener('click', () => {
          if (index !== activeIndex) {
            setActive(index);
            restartAutoplay();
          }
        }, { once: true });
      });

      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === activeIndex);
        dot.setAttribute('aria-pressed', String(index === activeIndex));
      });
    }

    // Change active card.
    function setActive(index) {
      activeIndex = (index + cards.length) % cards.length;
      updateCarousel();
    }

    function nextCard() {
      setActive(activeIndex + 1);
    }

    function previousCard() {
      setActive(activeIndex - 1);
    }

    // Automatic rotation.
    function stopAutoplay() {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }

    function startAutoplay() {
      stopAutoplay();

      if (reducedMotion) return;

      autoplayTimer = setInterval(() => {
        nextCard();
      }, 4000);
    }

    function restartAutoplay() {
      startAutoplay();
    }

    // Navigation controls.
    nextButton.addEventListener('click', () => {
      nextCard();
      restartAutoplay();
    });

    prevButton.addEventListener('click', () => {
      previousCard();
      restartAutoplay();
    });

    // Replay the complete carousel.
    replayButton.addEventListener('click', () => {
      setActive(0);
      restartAutoplay();
    });

    // Pause while the visitor interacts with the carousel.
    certCarousel.addEventListener('mouseenter', stopAutoplay);

    certCarousel.addEventListener('mouseleave', () => {
      startAutoplay();
    });

    certCarousel.addEventListener('focusin', stopAutoplay);

    certCarousel.addEventListener('focusout', event => {
      if (!certCarousel.contains(event.relatedTarget)) {
        startAutoplay();
      }
    });

    // Keyboard navigation.
    certCarousel.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight') {
        nextCard();
        restartAutoplay();
      }

      if (event.key === 'ArrowLeft') {
        previousCard();
        restartAutoplay();
      }
    });

    // Recalculate card spacing when the screen changes.
    window.addEventListener('resize', updateCarousel, {
      passive: true
    });

    // Initial setup.
    setActive(0);
    startAutoplay();
  }

}
