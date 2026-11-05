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

  // Pupils track the pointer on desktop; touch devices get a soft idle drift.
  const eyesCard = document.getElementById('eyesCard');
  const pupils = [...document.querySelectorAll('.pupil')];
  const eyesFace = document.querySelector('.eyes-face');
  let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
  const setTarget = (x, y) => { targetX = Math.max(-13, Math.min(13, x)); targetY = Math.max(-13, Math.min(13, y)); };
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    window.addEventListener('pointermove', e => {
      const rect = eyesCard.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      setTarget(dx * 13, dy * 13);
    }, {passive:true});
  } else {
    let phase = 0;
    setInterval(() => { phase += .7; setTarget(Math.sin(phase) * 5, Math.cos(phase * .7) * 4); }, 1200);
  }
  const animateEyes = () => {
    currentX += (targetX - currentX) * .12;
    currentY += (targetY - currentY) * .12;
    pupils.forEach(p => { p.style.transform = `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px))`; });
    requestAnimationFrame(animateEyes);
  };
  animateEyes();
  const blink = () => {
    eyesFace.classList.add('blink');
    setTimeout(() => eyesFace.classList.remove('blink'), 190);
    setTimeout(blink, 2600 + Math.random() * 2300);
  };
  setTimeout(blink, 1700);
  document.querySelectorAll('a.button,button').forEach(el => {
    el.addEventListener('mouseenter', () => setTarget(0, -5));
    el.addEventListener('mouseleave', () => setTarget(0, 0));
  });

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
