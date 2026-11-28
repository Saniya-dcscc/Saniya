{
// ===== Animated Pill Navigation =====

const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');
const desktopNav = document.getElementById('desktopNav');
const navGlide = document.getElementById('navGlide');

if (menuToggle && mobileNav) {
  const closeMenu = () => {
    mobileNav.classList.remove('open');
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
  };

  menuToggle.addEventListener('click', () => {
    const open = !mobileNav.classList.contains('open');

    mobileNav.classList.toggle('open', open);
    menuToggle.classList.toggle('active', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute(
      'aria-label',
      open ? 'Close navigation' : 'Open navigation'
    );
  });

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', event => {
    if (
      mobileNav.classList.contains('open') &&
      !mobileNav.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });
}

// Desktop sliding pill indicator
if (desktopNav && navGlide) {
  const links = [...desktopNav.querySelectorAll('a')];

  const moveGlide = link => {
    if (!link) return;

    const navRect = desktopNav.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();

    navGlide.style.width = `${linkRect.width}px`;
    navGlide.style.transform =
      `translateX(${linkRect.left - navRect.left}px)`;
    navGlide.style.opacity = '1';
  };

  const activateLink = link => {
    links.forEach(item => item.classList.toggle('active', item === link));
    moveGlide(link);
  };

  links.forEach(link => {
    link.addEventListener('mouseenter', () => moveGlide(link));

    link.addEventListener('click', () => {
      activateLink(link);
    });
  });

  desktopNav.addEventListener('mouseleave', () => {
    const active = desktopNav.querySelector('a.active') || links[0];
    moveGlide(active);
  });

  const initial = links.find(link =>
    link.getAttribute('href') === window.location.hash
  ) || links[0];

  activateLink(initial);

  window.addEventListener('resize', () => {
    moveGlide(desktopNav.querySelector('a.active') || links[0]);
  });

  // Update active navigation item while scrolling
  const sections = links
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible) {
        const active = links.find(
          link => link.getAttribute('href') === `#${visible.target.id}`
        );
        if (active) activateLink(active);
      }
    }, {
      rootMargin: '-20% 0px -65% 0px',
      threshold: [0, 0.2, 0.5]
    });

    sections.forEach(section => observer.observe(section));
  }
}

  mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }));

}
