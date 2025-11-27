const BACKEND_ADMIN_URL = '/api/admin/auctions'; 

// Dados mockados para simular uma lista de leilões no lado do administrador
let mockAuctionsData = [
    {
        id: 101,
        title: "Console Raro Super Nintendo + Jogos",
        status: "open", 
        currentBid: 450.00,
        currentWinner: "AnaC",
        endDate: "2025-11-26T23:59:59Z",
        seller: "RafaMorales"
    },
    {
        id: 102,
        title: "Pintura a Óleo: Mar Adentro",
        status: "scheduled", 
        currentBid: 0.00,
        currentWinner: null,
        endDate: "2025-12-05T15:00:00Z",
        seller: "ArtePura"
    },
    {
        id: 103,
        title: "Relógio Suíço Antigo de Bolso",
        status: "open", 
        currentBid: 1250.00,
        currentWinner: "ColecionadorX",
        endDate: "2025-11-28T10:00:00Z",
        seller: "JoalheriaVintage"
    },
    {
        id: 104,
        title: "Coleção Completa de Mangás Dragon Ball Z",
        status: "finished", 
        currentBid: 320.00,
        currentWinner: "GokuFan",
        endDate: "2025-11-20T20:00:00Z",
        seller: "LivrariaOnline"
    },
    {
        id: 105,
        title: "Placa de Vídeo RTX 4090",
        status: "canceled", 
        currentBid: 5500.00,
        currentWinner: "TechGuy",
        endDate: "2025-12-10T12:00:00Z",
        seller: "HardwareFast"
    },
];

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

function displayAdminMessage(message, type) {
    const box = document.getElementById('admin-message-box');
    box.textContent = message;
    box.classList.remove('hidden', 'bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800', 'bg-blue-100', 'text-blue-800');
    
    if (type === 'success') {
        box.classList.add('bg-green-100', 'text-green-800');
    } else if (type === 'error') {
        box.classList.add('bg-red-100', 'text-red-800');
    } else {
        box.classList.add('bg-blue-100', 'text-blue-800');
    }

    setTimeout(() => {
        box.classList.add('hidden');
    }, 5000);
}

function handleFinalize(auctionId) {
    const auctionIndex = mockAuctionsData.findIndex(a => a.id === auctionId);
    if (auctionIndex === -1) {
        displayAdminMessage(`Erro: Leilão ID ${auctionId} não encontrado.`, 'error');
        return;
    }

    if (mockAuctionsData[auctionIndex].status === 'open' || mockAuctionsData[auctionIndex].status === 'scheduled') {
        console.log(`[API CALL SIMULATED] POST ${BACKEND_ADMIN_URL}/finalize/${auctionId}`);
        
        mockAuctionsData[auctionIndex].status = 'finished';
        
        renderAuctionsTable();
        displayAdminMessage(`Leilão ID ${auctionId} finalizado com sucesso! O vencedor foi ${mockAuctionsData[auctionIndex].currentWinner || 'N/A'}.`, 'success');
    } else {
        displayAdminMessage(`Não é possível finalizar o leilão ID ${auctionId} no status atual (${mockAuctionsData[auctionIndex].status}).`, 'error');
    }
}

function handleCancel(auctionId) {
    const auctionIndex = mockAuctionsData.findIndex(a => a.id === auctionId);
    if (auctionIndex === -1) return;

    if (mockAuctionsData[auctionIndex].status !== 'finished' && mockAuctionsData[auctionIndex].status !== 'canceled') {
 
        console.log(`[API CALL SIMULATED] POST ${BACKEND_ADMIN_URL}/cancel/${auctionId}`);

        mockAuctionsData[auctionIndex].status = 'canceled';
        
        renderAuctionsTable();
        displayAdminMessage(`Leilão ID ${auctionId} cancelado com sucesso.`, 'info');
    } else {
        displayAdminMessage(`Não é possível cancelar leilão já ${mockAuctionsData[auctionIndex].status}.`, 'error');
    }
}

function handleEdit(auctionId) {
    displayAdminMessage(`Simulando redirecionamento para a edição do Leilão ID ${auctionId}...`, 'info');
    console.log(`Admin action: Edit Auction ID ${auctionId}`);
    // Em um ambiente real, seria um window.location.href para a rota de edição.
}

function renderAuctionsTable() {
    const tbody = document.getElementById('auctions-table-body');
    if (!tbody) return;

    tbody.innerHTML = ''; 

    const statusMap = {
        'open': 'Aberto',
        'scheduled': 'Agendado',
        'finished': 'Finalizado',
        'canceled': 'Cancelado'
    };

    mockAuctionsData.forEach(auction => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-100 transition duration-150';
        
        const statusText = statusMap[auction.status] || 'Desconhecido';
        const statusCell = `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full status-${auction.status.toLowerCase()}">${statusText}</span>`;

        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${auction.id}</td>
            <td class="px-6 py-4 max-w-xs truncate text-sm text-gray-500">${auction.title}</td>
            <td class="px-6 py-4 whitespace-nowrap">${statusCell}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatCurrency(auction.currentBid)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(auction.endDate)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="handleEdit(${auction.id})" class="text-indigo-600 hover:text-indigo-900 mr-3">Editar</button>
                ${auction.status === 'open' || auction.status === 'scheduled' ?
                    `<button onclick="handleFinalize(${auction.id})" class="text-green-600 hover:text-green-900 mr-3">Finalizar</button>` : ''}
                ${auction.status !== 'canceled' && auction.status !== 'finished' ?
                    `<button onclick="handleCancel(${auction.id})" class="text-red-600 hover:text-red-900">Cancelar</button>` : ''}
            </td>
        `;

        tbody.appendChild(row);
    });
}

window.onload = function() {
    renderAuctionsTable();
    console.log('Painel de Administração carregado.');
};