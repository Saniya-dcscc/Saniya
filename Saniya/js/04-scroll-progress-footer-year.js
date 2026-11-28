{
  // Scroll progress indicator.
  const progressBar = document.getElementById('progressBar');
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
  document.getElementById('year').textContent = new Date().getFullYear();

}
