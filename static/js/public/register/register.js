const form = document.getElementById("register_form");
const stepUser = document.getElementById("step_user");
const stepAddr = document.getElementById("step_address");
const nextBtn = document.getElementById("next_step");
const backBtn = document.getElementById("back_step");

// --- ViaCEP API Functions ---

// Clears the address fields for a specific group. 
const clearAddressFields = (parentGroup) => {
    const fieldsToClear = [
        '.Street-input', '.District-input', '.City-input',
        '.State-input', '.Country-input'
    ];

    fieldsToClear.forEach(selector => {
        const input = parentGroup.querySelector(selector);
        if (input) {
            input.value = '';
            input.removeAttribute('readonly');
            input.classList.remove('api-filled');
        }
    });
};

// Fills the address fields with data from the API
const fillAddressFields = (parentGroup, data) => {
    const fields = {
        '.Street-input': data.logradouro,
        '.District-input': data.bairro,
        '.City-input': data.localidade,
        '.State-input': data.uf,
        '.Country-input': 'Brasil' // ViaCEP is Brazil only
    };

    for (const [selector, value] of Object.entries(fields)) {
        const input = parentGroup.querySelector(selector);
        if (input && value) { // Only fill and lock if there is a value
            input.value = value;
            input.setAttribute('readonly', true);
            input.classList.add('api-filled');
        }
    }

    // Focus on the Number field
    parentGroup.querySelector('.numberAdress-input')?.focus();
};

// Main function that fetches the zipCode from the API
const fetchAddress = async (zipCodeInput) => {
    const zipCode = zipCodeInput.value.replace(/\D/g, ''); // Cleans the zip code
    const parentGroup = zipCodeInput.closest('.address-group');
    const statusEl = parentGroup.querySelector('.zipCode-status');

    // Reset state
    clearAddressFields(parentGroup);
    zipCodeInput.classList.remove('zipCode-error');

    if (zipCode.length === 0) {
        statusEl.textContent = ''; // Clear status if the field is empty
        return;
    }

    if (zipCode.length !== 8) {
        statusEl.textContent = '❌'; // Invalid zip code
        zipCodeInput.classList.add('zipCode-error'); 
        return;
    }

    // Loading State
    statusEl.textContent = '⏳';

    try {
        const response = await fetch(`https://viacep.com.br/ws/${zipCode}/json/`);
        if (!response.ok) throw new Error('Network failure');

        const data = await response.json();

        if (data.error) {
            // 3. Error State (Zip Code not found)
            statusEl.textContent = '❌';
            zipCodeInput.classList.add('zipCode-error'); 
            alert('CEP não encontrado.');
        } else {
            // 4. Success State
            fillAddressFields(parentGroup, data);
            statusEl.textContent = '✅';
        }

    } catch (error) {
        console.error("Error fetching CEP:", error);
        statusEl.textContent = '❌';
        zipCodeInput.classList.add('zipCode-error'); 
        alert('Não foi possível consultar o CEP. Verifique sua conexão.');
    }
};

// Adds the listener to all zip code inputs 
document.querySelectorAll('.zipCode-input').forEach(input => {
    input.addEventListener('blur', () => fetchAddress(input));
});

// --- Form Navigation Logic ---

// Validation function 
function validateStep(stepElement) {
    const inputs = stepElement.querySelectorAll("input[required]");
    for (const input of inputs) {
        const fieldName = input.placeholder || input.name;
        if (input.type !== 'file' && !input.value.trim()) {
            alert(`Por favor, preencha o campo: ${fieldName}`);
            input.focus();
            return false;
        }
    }
    return true;
}

// --- Next button event ---
nextBtn.addEventListener("click", () => {
    if (validateStep(stepUser)) {
        // Password confirmation validation
        const passwordInput = stepUser.querySelector('input[name="password"]');
        const confirmPasswordInput = stepUser.querySelector('input[name="confirmPassword"]');

        if (passwordInput.value !== confirmPasswordInput.value) {
            alert('As senhas não coincidem!');
            confirmPasswordInput.focus();
            return;
        }

        // Hide Step 1 and show Step 2
        stepUser.classList.add("hidden");
        stepAddr.classList.remove("hidden");
    }
});

// --- Back button event ---
backBtn.addEventListener("click", () => {
    stepAddr.classList.add("hidden");
    stepUser.classList.remove("hidden");
});

// --- Form Submit Event ---
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validate the last step before final submission
    // (Will only validate the 'required' fields of Address 1)
    if (!validateStep(stepAddr)) {
        return;
    }

    const user_data = {};
    // Collects data from Step 1 (stepUser)
    stepUser.querySelectorAll("input").forEach(i => {
        if (i.name && i.name !== 'confirmPassword') user_data[i.name] = i.value;
    });
    // Collects data from Step 2 (stepAddr)
    const addr_data = {};
    stepAddr.querySelectorAll("input").forEach(i => {
        if (i.name) addr_data[i.name] = i.value;
    });

    const payload = { "user_data": user_data, "addr_data": addr_data };
    console.log("Data for submission:", payload); // Data ready for submission

    // ATTENTION: If you are running this code locally (without Flask/Jinja2), 
    // the 'fetch' line below will fail. Remove the '{{ url_for(...) }}' and 
    try {
        const response = await fetch("/submit_register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Cadastro realizado com sucesso!");
            form.reset();
            // Clears the CEP statuses
            document.querySelectorAll('.zipCode-status').forEach(s => s.textContent = '');
            document.querySelectorAll('.zipCode-input').forEach(i => i.classList.remove('zipCode-error'));
            document.querySelectorAll('.api-filled').forEach(i => {
                i.removeAttribute('readonly');
                i.classList.remove('api-filled');
            });
            // Returns to the first step
            stepAddr.classList.add("hidden");
            stepUser.classList.remove("hidden");
        } else {
            alert("Erro ao cadastrar usuário.");
        }
    } catch (err) {
        console.error(err);
        alert("Erro de conexão com o servidor.");
    }

});