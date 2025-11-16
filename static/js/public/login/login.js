document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("login-form");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        console.log("Interceptado!");
    });
});

  