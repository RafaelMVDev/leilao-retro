// --- MOCKED DATA (Database/API Simulation) - Removed after database integration ---

const MOCK_USER_DATA = {
    name: "Rafael Morales Villela",
    nickname: "RafaMorales",
    phoneNumber: "(11) 97321-0013",
    zipCode: "04001-001",
    Country: "Brasil",
    Street: "Rua da Consolação, 1234",
    Number: "1234",
    District: "Centro",
    City: "São Paulo",
    State: "SP",
    balance: "R$ 850,50",
    coins: "2.500",
};

// --- DOM VARIABLES ---
const tabLinks = document.querySelectorAll('.profile-sidebar nav ul li a[data-tab]');
const contentTabs = document.querySelectorAll('.content-tab');
const profileForm = document.getElementById('profile_form');
const editSaveBtn = document.getElementById('edit_save_btn');
const saveCancelGroup = document.getElementById('save_cancel_group');
const newPassInput = document.getElementById('input_new_password');
const confirmPassInput = document.getElementById('input_confirm_password');

// MAIN INPUT FIELDS (HTML IDs)
const inputName = document.getElementById('input_nome');
const inputNickname = document.getElementById('input_nickname');
const inputPhone = document.getElementById('input_phoneNumber');

// ADDRESS VARIABLES
const cepInput = document.getElementById('input_zipCode');
const StreetInput = document.getElementById('input_Street');
const numberAdressInput = document.getElementById('input_numberAdress');
const DistrictInput = document.getElementById('input_district');
const CityInput = document.getElementById('input_City');
const StateInput = document.getElementById('input_State');

// CONVENIENCE VARIABLES (for compatibility with fetchAddressByCep)
const ruaInput = StreetInput;
const bairroInput = DistrictInput;
const cidadeInput = CityInput;
const estadoInput = StateInput;
const numeroInput = numberAdressInput;

// Modal
const customModal = document.getElementById('custom_modal');
const modalMessage = document.getElementById('modal_message');
const modalOkBtn = document.getElementById('modal_ok_btn');

let isEditing = false; // State to control the editing mode
// Stores original data to restore on cancel and to use as fallback on save
let originalFormData = {}; 
let currentActiveTab = 'personal'; // Initial active tab

// --- MODAL FUNCTIONS ---

function showCustomAlert(message, callback = null) {
    modalMessage.textContent = message;
    customModal.style.display = 'flex';
    modalOkBtn.onclick = () => {
        hideCustomAlert();
        if (callback) {
            callback();
        }
    };
}

function hideCustomAlert() {
    customModal.style.display = 'none';
}

// --- PROFILE LOGIC FUNCTIONS ---

// Loads the mocked data into the fields and the sidebar card.
function loadUserData() {
    // Loads user data (mocked) into inputs and cards
    inputName.value = MOCK_USER_DATA.name;
    inputNickname.value = MOCK_USER_DATA.nickname;
    inputPhone.value = MOCK_USER_DATA.phoneNumber;

    // Address Data
    cepInput.value = MOCK_USER_DATA.zipCode;
    // Note: Country is readonly, but its value is updated here.
    document.getElementById('input_Country').value = MOCK_USER_DATA.Country; 
    StreetInput.value = MOCK_USER_DATA.Street;
    numberAdressInput.value = MOCK_USER_DATA.Number; // Using MOCK_USER_DATA.Number
    DistrictInput.value = MOCK_USER_DATA.District;  // Using MOCK_USER_DATA.District
    CityInput.value = MOCK_USER_DATA.City;
    StateInput.value = MOCK_USER_DATA.State;

    // Updates Sidebar Card
    document.getElementById('user_nickname').textContent = MOCK_USER_DATA.nickname;
    document.getElementById('user_balance').textContent = MOCK_USER_DATA.balance;
    document.getElementById('user_coins').innerHTML = `${MOCK_USER_DATA.coins} <i class="fas fa-coins" style="color: gold;"></i>`;
}

/**
 * Toggles between View and Edit modes.
 * @param {boolean} editing - Whether to enter (true) or exit (false) edit mode.
 */
function toggleEditMode(editing) {
    isEditing = editing;
    // Excluding Country and Password fields (which only appear in edit mode)
    const inputs = profileForm.querySelectorAll('input:not(#input_Country)'); 

    inputs.forEach(input => {
        // Unlocks (false) or Locks (true) editing, except for password fields when not editing.
        if (input.type !== 'password' || editing) {
             input.readOnly = !editing; 
        }
    });

    // Shows/Hides password fields and save/cancel buttons
    newPassInput.style.display = editing ? 'block' : 'none';
    confirmPassInput.style.display = editing ? 'block' : 'none';
    saveCancelGroup.style.display = editing ? 'flex' : 'none';

    if (editing) {
        // Entering Edit Mode
        // Saves current MOCK data for restoration in case of cancellation
        originalFormData = { ...MOCK_USER_DATA }; 
        
        // When edit mode is active, the main button becomes View
        editSaveBtn.innerHTML = '<i class="fas fa-eye"></i> Visualizar Dados';
        disableAddressFields(false); // Enables address fields
    } else {
        // Exiting Edit Mode (after Cancel or Save)
        loadUserData(); // Ensures that values (updated or original) are shown in the inputs
        
        // Resets the button text to "Edit Data"
        editSaveBtn.innerHTML = '<i class="fas fa-edit"></i> Editar Dados';

        // Locks the address fields
        disableAddressFields(true);

        // Clears password fields for security
        newPassInput.value = '';
        confirmPassInput.value = '';
    }
}

/**
 * Disables or enables address fields (street, district, city, state) using readOnly.
 * @param {boolean} shouldDisable - Whether the fields should be locked (true) or not (false).
 */
function disableAddressFields(shouldDisable) {
    // Use readOnly to prevent editing, but allow reading the value in JS
    ruaInput.readOnly = shouldDisable;
    bairroInput.readOnly = shouldDisable;
    cidadeInput.readOnly = shouldDisable;
    estadoInput.readOnly = shouldDisable;
    numeroInput.readOnly = shouldDisable;
}

// --- CEP API Functions ---

function clearAddressFields() {
    ruaInput.value = '';
    bairroInput.value = '';
    cidadeInput.value = '';
    estadoInput.value = '';
}

function fetchAddressByCep() {
    if (!isEditing) return;
    let cep = cepInput.value.replace(/\D/g, '');

    if (cep.length !== 8) {
        if (cep.length > 0) {
            clearAddressFields();
            disableAddressFields(false);
        }
        return;
    }

    const url = `https://viacep.com.br/ws/${cep}/json/`;

    clearAddressFields();
    disableAddressFields(true);
    cepInput.style.backgroundColor = '#4a4a4a';

    fetch(url)
        .then(response => response.json())
        .then(data => {
            cepInput.style.backgroundColor = '';
            disableAddressFields(false);

            if (!data.erro) {
                StreetInput.value = data.logradouro || '';
                DistrictInput.value = data.bairro || '';
                CityInput.value = data.localidade || '';
                StateInput.value = data.uf || '';

                numeroInput.focus();
            } else {
                showCustomAlert('CEP não encontrado. Preencha o endereço manualmente.', () => {
                    numeroInput.focus();
                });
            }
        })
        .catch(error => {
            console.error('Erro ao buscar CEP:', error);
            cepInput.style.backgroundColor = '';
            disableAddressFields(false);
            showCustomAlert('Erro de conexão ao buscar CEP. Preencha manualmente.');
        });
}


// --- NAVIGATION AND EVENT FUNCTIONS ---

// Handles the click on the sidebar links, ensuring editing is blocked.
function handleTabClick(e) {
    const link = e.currentTarget;
    const targetTab = link.dataset.tab;

    if (!targetTab) return;

    if (isEditing) {
        e.preventDefault();
        showCustomAlert("Você tem alterações não salvas. Cancele ou Salve para trocar de aba.");
        return;
    }

    e.preventDefault();

    // Removes the 'active-tab' class from ALL links
    tabLinks.forEach(l => l.classList.remove('active-tab'));
    link.classList.add('active-tab'); // Adds it to the clicked link

    // Toggles content view (content-tab)
    contentTabs.forEach(content => {
        content.classList.remove('active');
    });

    // Adds the 'active' class only to the selected content
    document.getElementById(`content_${targetTab}`).classList.add('active');

    currentActiveTab = targetTab; // Keeps the state synchronized
}


// --- MAIN LOGIC (LISTENERS AND INITIALIZATION) ---

document.addEventListener('DOMContentLoaded', () => {
    // Loads data and initializes in view mode
    loadUserData();
    toggleEditMode(false);

    // Ensures the first tab ('personal') is marked on the link and content
    document.querySelector('a[data-tab="personal"]').classList.add('active-tab');
    document.getElementById('content_personal').classList.add('active');


    // Tab Navigation
    tabLinks.forEach(link => {
        link.addEventListener('click', handleTabClick);
    });

    // Main Button (Edit/View)
    editSaveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleEditMode(!isEditing);
    });

    // Cancel Button
    document.getElementById('cancel_edit_btn').addEventListener('click', () => {
        // Restores the original values in MOCK_USER_DATA (which were saved in originalFormData)
        // Important so that loadUserData() calls the correct values.
        for (const key in originalFormData) {
            if (MOCK_USER_DATA.hasOwnProperty(key)) {
                MOCK_USER_DATA[key] = originalFormData[key];
            }
        }
        // Returns to view mode, calls loadUserData() and restores fields.
        toggleEditMode(false);
    });

    // Form Listener (Save)
    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!isEditing) return; // Prevents submission if not in edit mode

        // Password validation
        if (newPassInput.value && newPassInput.value !== confirmPassInput.value) {
            showCustomAlert("Erro: A confirmação de senha não confere com a nova senha.", () => {
                newPassInput.focus();
            });
            return;
        }

        // Collects form data and uses original values as fallback for empty fields
        const formData = new FormData(profileForm);
        const updatedData = {};
        const inputElements = profileForm.querySelectorAll('input:not([type="password"])');

        inputElements.forEach(input => {
            const key = input.name;
            let value = formData.get(key); // Gets the current value

            // If the value is empty, uses the original value saved before editing
            if (!value && originalFormData[key]) {
                 value = input.value; 
            }
            if (value) {
                updatedData[key] = value;
            }
        });

        // Updates MOCK_USER_DATA with the correct keys (based on MOCK)
        // If updatedData[key] is undefined, it will fall back to `|| MOCK_USER_DATA.key`.
        MOCK_USER_DATA.name = updatedData.nome || MOCK_USER_DATA.name;
        MOCK_USER_DATA.nickname = updatedData.nickname || MOCK_USER_DATA.nickname;
        MOCK_USER_DATA.phoneNumber = updatedData.telefone || MOCK_USER_DATA.phoneNumber; // name="telefone"
        MOCK_USER_DATA.zipCode = updatedData.cep || MOCK_USER_DATA.zipCode;      // name="cep"
        MOCK_USER_DATA.Country = updatedData.pais || MOCK_USER_DATA.Country;      // name="pais"
        MOCK_USER_DATA.Street = updatedData.rua || MOCK_USER_DATA.Street;          // name="rua"
        MOCK_USER_DATA.Number = updatedData.numero || MOCK_USER_DATA.Number;        // name="numero" -> MOCK_USER_DATA.Number
        MOCK_USER_DATA.District = updatedData.bairro || MOCK_USER_DATA.District;      // name="bairro" -> MOCK_USER_DATA.District
        MOCK_USER_DATA.City = updatedData.cidade || MOCK_USER_DATA.City;          // name="cidade"
        MOCK_USER_DATA.State = updatedData.estado || MOCK_USER_DATA.State;         // name="estado"

        // After the successful POST simulation
        showCustomAlert("Perfil e dados atualizados com sucesso!", () => {
            // Returns to view mode. (loadUserData is called INSIDE toggleEditMode)
            toggleEditMode(false);
        });
    });

    // CEP API Listener
    cepInput.addEventListener('blur', fetchAddressByCep);
    cepInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter' && cepInput.value.replace(/\D/g, '').length === 8) {
            e.preventDefault();
            fetchAddressByCep();
        }
    });
});