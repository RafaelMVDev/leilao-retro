const MOCK_CURRENT_USER = "UsuarioLogado123"; 
const AUCTION_ID = 42; 
const BACKEND_BID_URL = `/api/auction/${AUCTION_ID}/bid`;

let userBalance = 650.00; 
let currentBidValue = null; 

const mockAuctionData = {
    auction_data: {
        title: "Coleção Rara: Super Nintendo (SNES) + 20 Jogos Clássicos",
        description: "Console Super Nintendo Entertainment System (SNES) em condição excelente, totalmente funcional. Acompanha dois controles originais e um lote de 20 jogos clássicos, incluindo The Legend of Zelda: A Link to the Past, Super Mario World e Donkey Kong Country. Um item essencial para colecionadores e entusiastas de jogos retrô. A carcaça está bem conservada, com leves marcas de uso natural. Todos os itens foram testados recentemente.",
        startDate: "2025-11-20T10:00:00Z",
        endDate: "2025-11-26T23:59:59Z",
        status: "open",
        user: "RafaMorales"
    },
    product_data: [{
        descriptionProduct: "O console mais influente dos anos 90.",
        productName: "Super Nintendo Entertainment System (Versão Americana)",
        productType: "físico",
        activationKey: null,
        downloadValidity: null,
        downloadUrl: null,
        manufacturer: "Nintendo",
        weight: 1.5,
        height: 7.5,
        width: 20, 
        depth: 24, 
        images: [
            "https://placehold.co/800x520/4a456e/fff?text=SNES+MAIN",
            "https://placehold.co/80x60/333/fff?text=Controle",
            "https://placehold.co/80x60/333/fff?text=Jogos+1",
            "https://placehold.co/80x60/333/fff?text=Jogos+2"
        ]
    }],
    lot_data: {
        minimumIncrement: 10.00,
        minimumBid: 400.00,
        lotNumber: 12345,
        currentBidValue: 450.00,
        currentWinnerId: "AnaC"
    },
    bids_data: [
        { bidValue: 450.00, bidDateTime: "2025-11-25T23:58:00Z", bidUser: "AnaC" },
        { bidValue: 440.00, bidDateTime: "2025-11-25T23:55:00Z", bidUser: "PedroG" },
        { bidValue: 430.00, bidDateTime: "2025-11-25T23:50:00Z", bidUser: "RafaMorales" },
        { bidValue: 420.00, bidDateTime: "2025-11-25T23:45:00Z", bidUser: "GamerBR" },
        { bidValue: 410.00, bidDateTime: "2025-11-25T23:40:00Z", bidUser: "ZeldaFan" },
    ]
};

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
        const remaining = calculateTimeRemaining(mockAuctionData.auction_data.endDate);
        timerElement.textContent = remaining;
        if (remaining === 'Finalizado') {
            clearInterval(window.timerInterval);
        }
    }
}

function formatBidTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;

    if (diffMs < 60000) return 'Há instantes';
    if (diffMs < 3600000) return `Há ${Math.floor(diffMs / 60000)} minutos`;
    if (diffMs < 86400000) return `Há ${Math.floor(diffMs / 3600000)} horas`;
    
    return date.toLocaleString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
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
    const nextMinBid = getNextMinBid(mockAuctionData.lot_data.currentBidValue, mockAuctionData.lot_data.minimumIncrement);
    
    if (mockAuctionData.auction_data.status !== 'open') {
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

    const bidValueToSend = currentBidValue;

    displayMessageBox("Enviando lance para o servidor...", 'success');

    try {
        const response = await fetch(BACKEND_BID_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                auction_id: AUCTION_ID,
                bid_value: bidValueToSend 
            })
        });

        const result = await response.json();

        if (response.ok) {
            userBalance = result.new_balance; 
            mockAuctionData.lot_data.currentBidValue = result.new_bid;
            mockAuctionData.lot_data.currentWinnerId = MOCK_CURRENT_USER; 
            mockAuctionData.bids_data.unshift({ bidValue: result.new_bid, bidDateTime: new Date().toISOString(), bidUser: MOCK_CURRENT_USER });

            renderAuctionDetails();
            displayMessageBox(`Lance de ${formatCurrency(bidValueToSend)} aceito!`, 'success');
        } else {
            displayMessageBox(`Erro: ${result.message || 'Falha ao processar lance.'}`, 'error');
        }

    } catch (error) {
        console.error('Falha na comunicação com a API:', error);
        displayMessageBox('Falha na comunicação com o servidor. Verifique sua conexão.', 'error');
    }

    currentBidValue = null; 
}


function renderAuctionDetails() {
    const { auction_data, product_data, lot_data, bids_data } = mockAuctionData;
    const product = product_data[0] || {};
    const nextMinBid = getNextMinBid(lot_data.currentBidValue, lot_data.minimumIncrement);
    
    document.getElementById('user-balance').innerHTML = `Seu Saldo: <strong>${formatCurrency(userBalance)}</strong>`;

    document.title = auction_data.title;
    document.getElementById('auction-title').textContent = auction_data.title;
    document.getElementById('auction-seller').innerHTML = `Vendido por: <strong>${auction_data.user}</strong> (98% Positivo)`;
    
    const statusElement = document.getElementById('auction-status');
    statusElement.textContent = {
        'open': 'Status: Aberto',
        'scheduled': 'Status: Agendado',
        'finished': 'Status: Finalizado',
        'canceled': 'Status: Cancelado'
    }[auction_data.status] || 'Status Desconhecido';
    statusElement.className = `auction-status status-${auction_data.status}`;


    document.getElementById('current-bid-value').textContent = formatCurrency(lot_data.currentBidValue);
    document.getElementById('total-bids-count').textContent = bids_data.length;

    const bidInput = document.getElementById('bid-input');
    const bidButton = document.getElementById('bid-button');
    const minBidText = document.getElementById('min-bid-text');
    
    bidInput.min = nextMinBid;
    bidInput.value = nextMinBid.toFixed(2);
    bidInput.placeholder = `Mínimo: ${formatCurrency(nextMinBid)}`;
    minBidText.innerHTML = `Seu lance deve ser no mínimo ${formatCurrency(nextMinBid)}. Adicione um valor acima disso para ter chances de ganhar.`;

    if (auction_data.status !== 'open') {
        bidButton.disabled = true;
        bidButton.textContent = `Leilão ${statusElement.textContent.split(': ')[1]}`;
        bidInput.disabled = true;
        minBidText.textContent = `Este leilão está ${statusElement.textContent.split(': ')[1].toLowerCase()} e não aceita novos lances.`;
    }

    const mainImagePlaceholder = document.getElementById('main-image-placeholder');
    const thumbnailGallery = document.getElementById('thumbnail-gallery');
    thumbnailGallery.innerHTML = ''; 

    if (product.images && product.images.length > 0) {
        const mainImage = document.createElement('img');
        mainImage.src = product.images[0];
        mainImage.alt = product.productName || 'Imagem Principal';
        mainImagePlaceholder.innerHTML = '';
        mainImagePlaceholder.appendChild(mainImage);
        
        product.images.forEach((url, index) => {
            const thumbnailItem = document.createElement('div');
            thumbnailItem.className = 'thumbnail-item';
            if (index === 0) thumbnailItem.classList.add('active');
            
            const thumbnailImg = document.createElement('img');
            thumbnailImg.src = url;
            thumbnailImg.alt = `Miniatura ${index + 1}`;
            thumbnailItem.appendChild(thumbnailImg);

            thumbnailItem.onclick = () => {
                document.querySelectorAll('.thumbnail-item').forEach(item => item.classList.remove('active'));
                thumbnailItem.classList.add('active');
                mainImage.src = url;
            };

            thumbnailGallery.appendChild(thumbnailItem);
        });
    } else {
        mainImagePlaceholder.textContent = "[Nenhuma imagem disponível]";
    }

    document.getElementById('details-description').textContent = auction_data.description;
    
    const specsList = document.getElementById('specs-list');
    specsList.innerHTML = ''; 

    specsList.innerHTML += `<li><strong>Nome do Produto:</strong> ${product.productName || 'N/A'}</li>`;
    specsList.innerHTML += `<li><strong>Tipo:</strong> ${product.productType === 'físico' ? 'Físico' : 'Digital'}</li>`;
    specsList.innerHTML += `<li><strong>Fabricante:</strong> ${product.manufacturer || 'N/A'}</li>`;
    
    if (product.productType === 'físico') {
        specsList.innerHTML += `<li><strong>Peso:</strong> ${product.weight ? product.weight + ' kg' : 'N/A'}</li>`;
        specsList.innerHTML += `<li><strong>Dimensões (AxLxP):</strong> ${product.height || 'N/A'}cm x ${product.width || 'N/A'}cm x ${product.depth || 'N/A'}cm</li>`;
    } else {
         specsList.innerHTML += `<li><strong>Chave de Ativação:</strong> ${product.activationKey ? 'Incluída' : 'Não Informada'}</li>`;
         specsList.innerHTML += `<li><strong>Validade Download:</strong> ${product.downloadValidity || 'Permanente'}</li>`;
         specsList.innerHTML += `<li><strong>URL de Download:</strong> ${product.downloadUrl ? '<a href="#">Link</a>' : 'Disponível após a compra'}</li>`;
    }

    const historyContent = document.getElementById('bid-history-content');
    historyContent.innerHTML = ''; 

    if (bids_data.length > 0) {
        const sortedBids = [...bids_data].sort((a, b) => new Date(b.bidDateTime) - new Date(a.bidDateTime));

        sortedBids.forEach(bid => {
            const item = document.createElement('div');
            item.className = 'bid-history-item';
            item.innerHTML = `
                <span class="bid-user">Usuário: <strong>${bid.bidUser}</strong>${bid.bidUser === lot_data.currentWinnerId ? ' (Vencedor Atual)' : ''}</span>
                <span class="bid-value-history">Valor: <strong>${formatCurrency(bid.bidValue)}</strong></span>
                <span class="bid-time-history">${formatBidTime(bid.bidDateTime)}</span>
            `;
            historyContent.appendChild(item);
        });
        document.querySelector('.tab-button[data-tab="history"]').textContent = `Histórico de Lances (${bids_data.length})`;
    } else {
        historyContent.innerHTML = '<p class="text-center text-gray-400">Nenhum lance foi registrado ainda.</p>';
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