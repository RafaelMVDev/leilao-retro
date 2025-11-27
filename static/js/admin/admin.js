const BACKEND_ADMIN_URL = '/api/admin/auctions';

// Dados mockados (Mantidos)
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
        title: "Pintura a Óleo: Mar Adentro, uma obra de arte que se estende para o infinito",
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
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
}

function displayAdminMessage(message, type) {
    const box = document.getElementById('admin-message-box');

    // Remove 'hidden' e adiciona 'active' para iniciar a animação e reserva de espaço
    box.classList.remove('hidden', 'bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800', 'bg-blue-100', 'text-blue-800');
    box.classList.add('active', 'p-3');

    if (type === 'success') {
        box.classList.add('bg-green-100', 'text-green-800');
    } else if (type === 'error') {
        box.classList.add('bg-red-100', 'text-red-800');
    } else {
        box.classList.add('bg-blue-100', 'text-blue-800');
    }

    box.textContent = message;

    setTimeout(() => {
        box.classList.remove('active');
        setTimeout(() => {
            box.textContent = '';
            box.classList.add('hidden');
            box.classList.remove('p-3');
        }, 300); // 300ms é a duração da transição
    }, 5000);
}

function handleFinalize(auctionId) {
    const auctionIndex = mockAuctionsData.findIndex(a => a.id === auctionId);
    if (auctionIndex === -1) {
        displayAdminMessage(`Erro: Leilão ID ${auctionId} não encontrado.`, 'error');
        return;
    }

    if (mockAuctionsData[auctionIndex].status === 'open' || mockAuctionsData[auctionIndex].status === 'scheduled') {
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
        mockAuctionsData[auctionIndex].status = 'canceled';
        renderAuctionsTable();
        displayAdminMessage(`Leilão ID ${auctionId} cancelado com sucesso.`, 'info');
    } else {
        displayAdminMessage(`Não é possível cancelar leilão já ${mockAuctionsData[auctionIndex].status}.`, 'error');
    }
}

function handleEdit(auctionId) {
    // CORREÇÃO DE FUNCIONALIDADE: Informa que a edição é simulada.
    displayAdminMessage(`Ação de Edição: O botão está funcional, mas esta é uma função SIMULADA. Você precisa construir a rota de formulário para editar o Leilão ID ${auctionId}.`, 'info');
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
        row.className = 'hover:bg-gray-100 transition duration-150 border-b';

        const statusText = statusMap[auction.status] || 'Desconhecido';
        const statusCell = `<span class="status-badge status-${auction.status.toLowerCase()}">${statusText}</span>`;

        // CORREÇÃO DE RESPONSIVIDADE: Removido 'whitespace-nowrap' do Título e adicionado 'break-words'.
        row.innerHTML = `
            <td class="px-6 py-4 text-sm font-medium text-gray-900">${auction.id}</td>
            <td class="px-6 py-4 text-sm text-gray-500 break-words">${auction.title}</td> 
            <td class="px-6 py-4 whitespace-nowrap">${statusCell}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatCurrency(auction.currentBid)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(auction.endDate)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                <button onclick="handleEdit(${auction.id})" class="text-indigo-600 hover:text-indigo-900">Editar</button>
                ${auction.status === 'open' || auction.status === 'scheduled' ?
                `<button onclick="handleFinalize(${auction.id})" class="text-green-600 hover:text-green-900">Finalizar</button>` : ''}
                ${auction.status !== 'canceled' && auction.status !== 'finished' ?
                `<button onclick="handleCancel(${auction.id})" class="text-red-600 hover:text-red-900">Cancelar</button>` : ''}
            </td>
        `;

        tbody.appendChild(row);
    });
}

window.onload = function () {
    renderAuctionsTable();
};