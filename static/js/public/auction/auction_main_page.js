// ====== Helper: formata data restante ======
function calcularTempoRestante(endDate) {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff <= 0) return "Encerrado";

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

// ====== Helper: status visual ======
function getStatusLabel(status) {
    switch (status) {
        case "EM_ANDAMENTO":
            return { text: "EM ANDAMENTO", class: "status-andamento" };
        case "ENCERRADO":
            return { text: "ENCERRADO", class: "status-encerrado" };
        case "EM_BREVE":
            return { text: "EM BREVE", class: "status-em-breve" };
        default:
            return { text: status, class: "status-encerrado" };
    }
}

// ====== Renderiza os leilões ======
function renderAuctions(auctions) {
    const grid = document.querySelector(".leilao-grid");

    if (!grid) {
        console.error("Container .leilao-grid não encontrado");
        return;
    }

    grid.innerHTML = "";

    auctions.forEach(auction => {

        const statusData = getStatusLabel(auction.statusAuction);
        const tempoRestante = calcularTempoRestante(auction.endDate);

        const card = document.createElement("div");
        card.classList.add("leilao-card");

        card.innerHTML = `
            <div class="leilao-imagem-placeholder">
                <span>Imagem do Item</span>
            </div>

            <div class="leilao-conteudo">
                <h3 class="leilao-titulo">${auction.title}</h3>

                <div class="leilao-vendedor">
                    Vendedor: <span>${auction.fkUserIdUser}</span>
                </div>

                <span class="leilao-status ${statusData.class}">
                    ${statusData.text}
                </span>

                <div class="leilao-info">

                    <div class="leilao-valor">
                        <span>Valor Atual</span>
                        <strong id="valor-${auction.idAuction}">--</strong>
                    </div>

                    <div class="leilao-tempo">
                        <span>Tempo Restante</span>
                        <strong id="timer-${auction.idAuction}">
                            ${tempoRestante}
                        </strong>
                    </div>

                    <div class="leilao-bid-info">
                        <span>Lances</span>
                        <strong id="bids-${auction.idAuction}">--</strong>
                    </div>

                </div>

                <button class="lance-btn" data-id="${auction.idAuction}">
                    Ver Detalhes
                </button>
            </div>
        `;

        grid.appendChild(card);
    });

    ativarBotoes();
    iniciarTimers(auctions);
}

// ====== Navegação para detalhes ======
function ativarBotoes() {
    document.querySelectorAll(".lance-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            window.location.href = `/auction/${id}`;  // ajuste se sua rota for diferente
        });
    });
}

// ====== Atualiza os segundos apenas ======
function iniciarTimers(auctions) {

    setInterval(() => {
        auctions.forEach(auction => {
            const timerElement = document.getElementById(`timer-${auction.idAuction}`);
            if (!timerElement) return;

            timerElement.innerText = calcularTempoRestante(auction.endDate);
        });
    }, 1000);
}

// ====== Slider (seu código mantido) ======
function setupSlider() {
    const slider = document.getElementById('price-slider');
    const priceLabelMax = document.getElementById('current-max-price');

    if (slider && priceLabelMax) {
        const maxVal = parseFloat(slider.max);

        const updateSliderValue = () => {
            const value = parseFloat(slider.value);
            const formattedValue = value.toFixed(2).replace('.', ',');

            if (value === maxVal) {
                priceLabelMax.textContent = `R$ ${formattedValue}+`;
            } else {
                priceLabelMax.textContent = `R$ ${formattedValue}`;
            }
        };

        updateSliderValue();
        slider.addEventListener('input', updateSliderValue);
    }
}

// ====== Init ======
window.onload = function () {
    setupSlider();

    if (window.AUCTIONS && Array.isArray(window.AUCTIONS)) {
        renderAuctions(window.AUCTIONS);
    } else {
        console.warn("Nenhum leilão recebido do backend.");
    }

    console.log("Página de Leilões carregada dinamicamente ✅");
};
