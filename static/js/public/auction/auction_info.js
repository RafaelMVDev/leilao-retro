const MOCK_CURRENT_USER = window.CURRENT_USER;
const AUCTION_ID = window.AUCTION_ID;
const BACKEND_BID_URL = `/auctions/${AUCTION_ID}/make_bid`;
const csrf = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

let userBalance = window.USER_BALANCE;
let currentBidValue = null;

// Agora os dados vêm do window
const auction_data = window.AUCTION_DATA;
const product_data = window.PRODUCT_DATA;
const lot_data = window.LOT_DATA;
let bids_data = window.BIDS_DATA;

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function getNextMinBid(currentBid, increment) {
    return currentBid + increment;
}

function calculateTimeRemaining(endDateString) {
    const now = new Date();
    const end = new Date(endDateString);
    const diffMs = end - now;

    if (diffMs <= 0) return 'Finalizado';

    let diff = Math.floor(diffMs / 1000);
    const days = Math.floor(diff / (24 * 60 * 60));
    diff -= days * (24 * 60 * 60);
    const hours = Math.floor(diff / (60 * 60));
    diff -= hours * (60 * 60);
    const minutes = Math.floor(diff / 60);
    const seconds = diff - minutes * 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    return parts.slice(0, 3).join(' ');
}

function updateTimer() {
    const timerElement = document.getElementById('time-remaining');
    if (timerElement) {
        const remaining = calculateTimeRemaining(auction_data.end_date);
        timerElement.textContent = remaining;
        if (remaining === 'Finalizado') clearInterval(window.timerInterval);
    }
}

function formatBidTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();


    let diff = Math.floor(Math.abs((now - date) / 1000)); // diferença em segundos
    console.log(now)
    console.log(date)
    console.log(diff)
    if (diff < 0) diff = 0;

    const hours = Math.floor(diff / 3600);
    diff %= 3600;

    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;

    let parts = [];

    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}min`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    return `Há ${parts.join(" ")}`;
}

function displayMessageBox(message, type) {
    const box = document.getElementById('bid-message-box');
    box.textContent = message;
    box.className = `message-box mt-3 ${type}`; 
    
    setTimeout(() => {
        box.textContent = '';
        box.className = 'message-box mt-3'; 
    }, 5000);
}

function showConfirmationModal(bidValue) {
    currentBidValue = bidValue;
    
    document.getElementById('modal-bid-value').textContent = formatCurrency(bidValue);
    document.getElementById('modal-new-balance').textContent = formatCurrency(userBalance - bidValue);

    document.getElementById('confirmation-modal').classList.remove('hidden');
    document.getElementById('confirmation-modal').style.display = 'flex';
}

function hideConfirmationModal() {
    document.getElementById('confirmation-modal').classList.add('hidden');
    document.getElementById('confirmation-modal').style.display = 'none';
}

function handleBidSubmission() {
    const bidInput = document.getElementById('bid-input');
    const userBid = parseFloat(bidInput.value);
    
    const nextMinBid = getNextMinBid(lot_data.currentBidValue, lot_data.minimumIncrement);

    if (auction_data.status !== 'Open') {
        displayMessageBox("O leilão não está aberto para lances.", 'error');
        return;
    }

    if (isNaN(userBid) || userBid <= 0) {
        displayMessageBox("Por favor, insira um valor de lance válido.", 'error');
        return;
    }

    if (userBid < nextMinBid) {
        displayMessageBox(`Seu lance deve ser de no mínimo ${formatCurrency(nextMinBid)}.`, 'error');
        return;
    }

    if (userBid > userBalance) {
        displayMessageBox(`SALDO INSUFICIENTE. Seu saldo atual é de ${formatCurrency(userBalance)}.`, 'error');
        return;
    }

    showConfirmationModal(userBid);
}

async function confirmBid() { 
    hideConfirmationModal();

    if (currentBidValue === null) return;

    displayMessageBox("Enviando lance para o servidor...", 'success');

    try {
        const response = await fetch(BACKEND_BID_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "X-CSRFToken": csrf 
            },
            body: JSON.stringify({
                bid_value: currentBidValue
            })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            console.log(result)
            userBalance = result.new_balance;
            lot_data.current_bid = result.new_bid;
            lot_data.currentWinnerId = result.current_winner;

            bids_data.unshift({
                value: result.new_bid,
                datetime: new Date().toISOString(),
                user: result.current_winner
            });

            renderAuctionDetails();

            displayMessageBox(
                `Lance de ${formatCurrency(currentBidValue)} aceito!`,
                'success'
            );
        } else {
            displayMessageBox(result.message || "Erro ao processar lance.", 'error');
        }

    } catch (err) {
        console.error(err);
        displayMessageBox("Erro na comunicação com o servidor.", "error");
    }

    currentBidValue = null;
}

function renderAuctionDetails() {
    console.log(product_data)
    const nextMinBid = getNextMinBid(lot_data.currentBidValue, lot_data.minimumIncrement);

    document.getElementById('user-balance').innerHTML = `Seu Saldo: <strong>${formatCurrency(userBalance)}</strong>`;
    document.getElementById('auction-title').textContent = auction_data.title;
    document.getElementById('auction-seller').innerHTML = `Vendido por: <strong>${auction_data.owner}</strong>`;
    document.getElementById('current-bid-value').textContent = formatCurrency(lot_data.current_bid);
    document.getElementById('total-bids-count').textContent = bids_data.length;
    document.getElementById('details-description').textContent = auction_data.description;
    const bidInput = document.getElementById('bid-input');
    bidInput.value = nextMinBid.toFixed(2);
    bidInput.min = nextMinBid;

    const historyContent = document.getElementById('bid-history-content');
    historyContent.innerHTML = "";

    bids_data.sort((a, b) => new Date(b.bidDateTime) - new Date(a.bidDateTime));

    bids_data.forEach(bid => {
        const item = document.createElement('div');
        item.className = 'bid-history-item';

        item.innerHTML = `
            <span class="bid-user">Usuário: <strong>${bid.user}</strong>${bid.user === lot_data.currentWinnerId ? ' (Vencedor Atual)' : ''}</span>
            <span class="bid-value-history">Valor: <strong>${formatCurrency(bid.value)}</strong></span>
            
        `;

        historyContent.appendChild(item);
    });
    const mainImagePlaceholder = document.getElementById('main-image-placeholder');
const thumbnailGallery = document.getElementById('thumbnail-gallery');
thumbnailGallery.innerHTML = '';
mainImagePlaceholder.innerHTML = '';

const specsList = document.getElementById('specs-list');
specsList.innerHTML = '';


product_data.forEach((product, productIndex) => {

    // ---- IMAGES ----
    if (product.images && product.images.length > 0) {
        // if it's the first product, defines it as principal
        if (productIndex === 0) {
            const mainImage = document.createElement('img');
            mainImage.src = "/static/" + product.images[0];
            mainImage.alt = product.productName || 'Imagem Principal';
            mainImagePlaceholder.appendChild(mainImage);
        }

        product.images.forEach((url, index) => {
            const thumbnailItem = document.createElement('div');
            thumbnailItem.className = 'thumbnail-item';
            if (productIndex === 0 && index === 0) thumbnailItem.classList.add('active');

            const thumbnailImg = document.createElement('img');
            thumbnailImg.src = "/static/" + url;
            thumbnailImg.alt = `Produto ${productIndex + 1} - Imagem ${index + 1}`;

            thumbnailItem.appendChild(thumbnailImg);

            thumbnailItem.onclick = () => {
                document.querySelectorAll('.thumbnail-item').forEach(item => item.classList.remove('active'));
                thumbnailItem.classList.add('active');

                const mainImg = mainImagePlaceholder.querySelector("img");
                if (mainImg) {
                    mainImg.src = "/static/" + url;
                }
            };

            thumbnailGallery.appendChild(thumbnailItem);
        });
    }

    // ---- Product Specifications ----
    specsList.innerHTML += `
        <li><strong>Produto ${productIndex + 1}</strong></li>
        <li><strong>Nome:</strong> ${product.productName || 'N/A'}</li>
        <li><strong>Tipo:</strong> ${product.productType === 'físico' ? 'Físico' : 'Digital'}</li>
        <li><strong>Fabricante:</strong> ${product.manufacturer || 'N/A'}</li>
    `;

    if (product.productType === 'físico') {
        specsList.innerHTML += `
            <li><strong>Peso:</strong> ${product.weight ? product.weight + ' kg' : 'N/A'}</li>
            <li><strong>Dimensões:</strong> 
                ${product.height || 'N/A'}cm x 
                ${product.width || 'N/A'}cm x 
                ${product.depth || 'N/A'}cm
            </li>
        `;
    } else {
        specsList.innerHTML += `
            <li><strong>Chave de Ativação:</strong> ${product.activationKey ? 'Incluída' : 'Não Informada'}</li>
            <li><strong>Validade Download:</strong> ${product.downloadValidity || 'Permanente'}</li>
            <li><strong>URL de Download:</strong> ${product.downloadUrl ? '<a href="#">Link</a>' : 'Disponível após a compra'}</li>
        `;
    }

    specsList.innerHTML += `<hr>`;
});

if (product_data.length === 0) {
    mainImagePlaceholder.textContent = "[Nenhum produto disponível]";
    specsList.innerHTML = "<li>Nenhum produto cadastrado neste lote.</li>";
}
    window.timerInterval = setInterval(updateTimer, 1000);
    updateTimer();

}

function switchTab(tabName) {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');

    document.querySelector(`.tab-button[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`tab-${tabName}`).style.display = 'block';
}

window.onload = function() {
    renderAuctionDetails();
    switchTab('details');

    document.getElementById('bid-button').addEventListener('click', handleBidSubmission);
    document.getElementById('modal-confirm-btn').addEventListener('click', confirmBid);
    document.getElementById('modal-cancel-btn').addEventListener('click', hideConfirmationModal);
};
