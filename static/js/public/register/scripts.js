 const toggleButton = document.getElementById('theme-toggle');
    const body = document.body;

    if (localStorage.getItem('theme') === 'light') {
      body.classList.add('light-theme');
      toggleButton.textContent = 'Modo Claro';
    } else {
      body.classList.add('dark-theme');
    }

    toggleButton.addEventListener('click', () => {
      if (body.classList.contains('light-theme')) {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        toggleButton.textContent = 'Modo Escuro';
        localStorage.setItem('theme', 'dark');
      } else {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        toggleButton.textContent = 'Modo Claro';
        localStorage.setItem('theme', 'light');
      }
    });