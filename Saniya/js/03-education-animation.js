{
  // Education bars animation
const educationGraph = document.getElementById('educationGraph');
const educationReplay = document.getElementById('educationReplay');

if (educationGraph && educationReplay) {
  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  let educationPlayed = false;

  const playEducation = () => {
    educationGraph.classList.remove('is-running');

    // Restart animation
    void educationGraph.offsetWidth;

    educationGraph.classList.add('is-running');
    educationPlayed = true;
  };

  const educationObserver = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting) && !educationPlayed) {
      playEducation();
      educationObserver.disconnect();
    }
  }, { threshold: .28 });

  educationObserver.observe(educationGraph);

  educationReplay.addEventListener('click', playEducation);

  if (reducedMotion) {
    educationGraph.classList.add('is-running');
  }
}

}
