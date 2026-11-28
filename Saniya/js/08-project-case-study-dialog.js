{
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

}
