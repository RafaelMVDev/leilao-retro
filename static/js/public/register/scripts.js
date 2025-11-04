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

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("register_form"); 

  form.addEventListener("submit", async (event) => {
    event.preventDefault(); 

    const formData = new FormData(form); 

    try {
      const response = await fetch("{{ url_for('auth_pages.submit_register') }}", {
        method: "POST",
        body: formData
      });

      // tenta ler como JSON (ajuste se seu backend retornar HTML)
      const data = await response.json();

      if (response.ok) {
        alert("✅ Cadastro realizado com sucesso!");
        console.log("Resposta do servidor:", data);
        // exemplo: redirecionar depois do sucesso
        // window.location.href = "/login";
      } else {
        alert("❌ Erro ao cadastrar: " + (data.message || "Verifique os campos."));
        console.error("Erro:", data);
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
      alert("⚠️ Não foi possível conectar ao servidor.");
    }
  });
});