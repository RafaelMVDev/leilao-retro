document.addEventListener("DOMContentLoaded", () => {

    // Fonte dos dados (injetados pelo template)
    let allAuctions = Array.isArray(window.AUCTIONS) ? window.AUCTIONS : [];
    let totalPages = parseInt(window.TOTAL_PAGES || 1, 10);

    // Estado local
    let filteredAuctions = [...allAuctions];
    const grid = document.getElementById("auctions-grid");
    const filterCategory = document.getElementById("filter-category");
    const priceSlider = document.getElementById("price-slider");
    const priceLabelMax = document.getElementById("current-max-price");
    const searchInput = document.getElementById("search-input");
    const searchInputTop = document.getElementById("search-input-top");
    const orderSelect = document.getElementById("ordenar");
    const orderSelectTop = document.getElementById("ordenar-top");
    const applyFiltersBtn = document.getElementById("apply-filters");
    const paginationContainer = document.getElementById("pagination");

    // Utility: read query string
    function getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        return params;
    }

    function setQueryParams(params) {
        const base = `${location.pathname}?${params.toString()}`;
        window.location.href = base;
    }

    // Utility: parse price from current_bid string (supports BR and EN formats)
    function parsePrice(priceStr) {
        if (priceStr == null) return 0;
        // Remove currency symbol and spaces
        let s = priceStr.toString().replace(/[^\d,.\-]/g, "").trim();

        // If contains both '.' and ',', assume '.' thousand and ',' decimal (BR)
        if (s.indexOf('.') !== -1 && s.indexOf(',') !== -1) {
            s = s.replace(/\./g, ''); // remove thousand separators
            s = s.replace(',', '.'); // decimal comma to dot
        } else if (s.indexOf(',') !== -1 && s.indexOf('.') === -1) {
            // only comma -> decimal separator
            s = s.replace(',', '.');
        } // else only dot as decimal or integer, leave as-is

        const n = parseFloat(s);
        return isNaN(n) ? 0 : n;
    }

    // Utility: normalize string (remove accents, lowercase)
    function normalizeString(str) {
        if (!str) return "";
        // remove diacritics
        const normalized = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return normalized.toLowerCase();
    }

    // Build categories list from auctions
    function populateCategories() {
        const categories = new Set();
        allAuctions.forEach(a => {
            // If backend doesn't include category, fallback
            let cat = (a.category || a.tag || "Sem categoria");
            categories.add(cat);
        });
        // Clear existing options (keep 'ALL')
        filterCategory.innerHTML = `<option value="ALL">Todas as categorias</option>`;
        Array.from(categories).sort().forEach(cat => {
            const opt = document.createElement("option");
            opt.value = cat;
            opt.textContent = cat;
            filterCategory.appendChild(opt);
        });

        // if query string has category preselected, set it
        const params = getQueryParams();
        const qCat = params.get("categoria");
        if (qCat) {
            filterCategory.value = qCat;
        }
    }

    // Render single card
    function renderCard(auction) {

        const title = auction.title || "Sem título";
        const owner = auction.owner || "Não informado";
        const statusClass = (auction.status || "").toString().toLowerCase();
        let statusClassMap = "status-andamento";
        if (statusClass.includes("encerr") || statusClass.includes("finished")) statusClassMap = "status-encerrado";
        else if (statusClass.includes("breve") || statusClass.includes("upcom") || statusClass.includes("coming")) statusClassMap = "status-em-breve";

        const currentBidText = auction.current_bid || "R$ 0,00";
        const bidsCount = ("bids_count" in auction) ? auction.bids_count : 0;
        const remainingText = auction.remaining_time || computeRemaining(auction.end_date);
        const imageUrl = auction.cover_image || "/static/img/default_cover.jpg";
        const category = auction.category || auction.tag || "Sem categoria";
        const location = auction.location || "—";

        const card = document.createElement("div");
        card.className = "leilao-card";

        card.innerHTML = `
            <div class="leilao-imagem-placeholder">
                ${imageUrl ? `<img src="${imageUrl}" alt="${escapeHtml(title)}">` : `<span>Sem imagem</span>`}
                <span class="tag-local">${escapeHtml(location)}</span>
                <p class="text-xs" style="position:absolute; left:10px; bottom:8px;">${escapeHtml(category)}</p>
            </div>

            <div class="leilao-conteudo">
                <div class="leilao-visitas" style="margin-bottom:6px;">
                    <!-- visitas não fornecidas pelo backend; omitido -->
                </div>

                <h3 class="leilao-titulo">${escapeHtml(title)}</h3>

                <div style="display:flex; gap:10px; align-items:center; margin-bottom:8px;">
                    <span class="leilao-status ${statusClassMap}">${escapeHtml(auction.status_display || auction.status || "—")}</span>
                    <div style="font-size:0.85rem; color:#e0e0e0;">Vendedor: <strong style="color:var(--highlight-color);">${escapeHtml(owner)}</strong></div>
                </div>

                <div class="leilao-info">
                    <div class="leilao-valor">
                        <span>Valor Atual</span>
                        <strong>${escapeHtml(currentBidText)}</strong>
                    </div>

                    <div class="leilao-lances">
                        <span>Lances</span>
                        <strong>${escapeHtml(String(bidsCount))}</strong>
                    </div>

                    <div class="leilao-tempo">
                        <span>Termina em</span>
                        <strong id="timer-${auction.id}">${escapeHtml(remainingText)}</strong>
                    </div>
                </div>

                <div class="leilao-vendedor" style="margin-bottom:8px;">
                    Vendedor: <span>${escapeHtml(owner)}</span>
                </div>

                <button class="lance-btn" data-id="${auction.id}">
                    Ver Detalhes
                </button>
            </div>
        `;

        // Button action
        card.querySelector(".lance-btn")?.addEventListener("click", () => {
            window.location.href = `/auction/${auction.id}`;
        });

        return card;
    }

    // Render auctions list
    function renderAuctions(list) {
        if (!grid) return;
        grid.innerHTML = "";
        if (!list.length) {
            grid.innerHTML = `<p style="text-align:center;">Nenhum leilão encontrado.</p>`;
            return;
        }
        const fragment = document.createDocumentFragment();
        list.forEach(a => {
            fragment.appendChild(renderCard(a));
        });
        grid.appendChild(fragment);
    }

    // Compute remaining time from end_date (ISO or date string)
    function parseISODate(dateStr) {
        if (!dateStr) return null;
        // If already ends with Z, keep; else add Z to force UTC
        try {
            const s = typeof dateStr === "string" ? (dateStr.endsWith("Z") ? dateStr : dateStr + "Z") : dateStr;
            const d = new Date(s);
            if (isNaN(d.getTime())) return null;
            return d;
        } catch (e) {
            return null;
        }
    }

    function computeRemaining(endDateStr) {
        const now = new Date();
        const end = parseISODate(endDateStr);
        if (!end) return "Data inválida";
        const diff = end.getTime() - now.getTime();
        if (diff <= 0) return "Encerrado";
        const totalSeconds = Math.floor(diff / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    // Timers updater
    function startTimers() {
        setInterval(() => {
            filteredAuctions.forEach(a => {
                const el = document.getElementById(`timer-${a.id}`);
                if (!el) return;
                const text = a.remaining_time || computeRemaining(a.end_date);
                el.innerText = text;
            });
        }, 1000);
    }

    // Escape HTML (basic)
    function escapeHtml(unsafe) {
        if (unsafe === null || unsafe === undefined) return "";
        return String(unsafe)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Apply filters locally
    function aplicarFiltrosLocal() {
        const categoria = filterCategory?.value || "ALL";
        const maxPreco = priceSlider ? parseFloat(priceSlider.value) : Infinity;
        const q = (searchInput?.value || searchInputTop?.value || "").trim();

        filteredAuctions = allAuctions.filter(a => {
            // category
            const cat = a.category || a.tag || "Sem categoria";
            if (categoria !== "ALL" && cat !== categoria) return false;

            // price
            const price = parsePrice(a.current_bid);
            if (price > maxPreco) return false;

            // search fuzzy on title
            if (q) {
                const normalizedQ = normalizeString(q);
                const normalizedTitle = normalizeString(a.title || "");
                if (!normalizedTitle.includes(normalizedQ)) return false;
            }

            return true;
        });

        // ordenar
        const ordem = (orderSelect?.value || orderSelectTop?.value || "recente");
        switch (ordem) {
            case "menor-valor":
                filteredAuctions.sort((x, y) => parsePrice(x.current_bid) - parsePrice(y.current_bid));
                break;
            case "maior-valor":
                filteredAuctions.sort((x, y) => parsePrice(y.current_bid) - parsePrice(x.current_bid));
                break;
            case "mais-lances":
                filteredAuctions.sort((x, y) => (y.bids_count || 0) - (x.bids_count || 0));
                break;
            case "recente":
            default:
                // deixar a ordem recebida pelo backend (mantém como veio)
                break;
        }

        renderAuctions(filteredAuctions);
    }

    // Setup slider UI
    function setupSlider() {
        if (!priceSlider || !priceLabelMax) return;
        const maxVal = parseFloat(priceSlider.max || 10000);

        const update = () => {
            const v = parseFloat(priceSlider.value);
            const formatted = v.toFixed(2).replace(".", ",");
            priceLabelMax.textContent = (v === maxVal) ? `R$ ${formatted}+` : `R$ ${formatted}`;
            // aplicamos automaticamente para feedback rápido
            aplicarFiltrosLocal();
        };

        priceSlider.addEventListener("input", update);
        update();
    }

    // Setup search inputs
    function setupSearch() {
        if (searchInput) {
            searchInput.addEventListener("input", () => {
                // don't aggressively apply on every keystroke? small delay would be okay,
                // but keeping immediate for responsiveness
                aplicarFiltrosLocal();
            });
        }
        if (searchInputTop) {
            searchInputTop.addEventListener("input", () => aplicarFiltrosLocal());
        }
    }

    // Keep order select in sync (top and sidebar)
    function syncOrderSelects() {
        [orderSelect, orderSelectTop].forEach(sel => {
            if (!sel) return;
            sel.addEventListener("change", () => {
                if (orderSelect && orderSelectTop) {
                    orderSelect.value = sel.value;
                    orderSelectTop.value = sel.value;
                }
                aplicarFiltrosLocal();
            });
        });
    }

    // Pagination builder (JS-driven) - creates anchors that preserve filters querystring
    function buildPagination() {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = "";

        const params = getQueryParams();
        const currentPage = parseInt(params.get("page") || "1", 10);

        const total = Math.max(1, totalPages);

        // Helper to create page link
        function pageLink(page, text = null, isActive = false, disabled = false) {
            const a = document.createElement("a");
            a.textContent = text || String(page);
            if (isActive) a.classList.add("ativo");
            if (disabled) a.classList.add("disabled");
            // preserve other params (excluding page) and set page
            const cp = getQueryParams();
            cp.set("page", String(page));
            // add filter params from current UI (so if user filtered client-side and clicks page we preserve visual state)
            if (filterCategory?.value && filterCategory.value !== "ALL") cp.set("categoria", filterCategory.value);
            if (orderSelect?.value) cp.set("ordem", orderSelect.value);
            const q = (searchInput?.value || searchInputTop?.value || "").trim();
            if (q) cp.set("q", q);
            const maxP = priceSlider ? priceSlider.value : null;
            if (maxP) cp.set("max_price", maxP);

            a.href = `${location.pathname}?${cp.toString()}`;
            return a;
        }

        // prev / first
        paginationContainer.appendChild(pageLink(1, "<<", false, currentPage === 1));
        paginationContainer.appendChild(pageLink(Math.max(1, currentPage - 1), "<", false, currentPage === 1));

        // page numbers window
        const windowSize = 5;
        let start = Math.max(1, currentPage - Math.floor(windowSize / 2));
        let end = Math.min(total, start + windowSize - 1);
        if (end - start < windowSize - 1) {
            start = Math.max(1, end - windowSize + 1);
        }

        if (start > 1) {
            paginationContainer.appendChild(pageLink(1, "1"));
            if (start > 2) {
                const dots = document.createElement("span");
                dots.className = "ellipsis";
                dots.textContent = "...";
                paginationContainer.appendChild(dots);
            }
        }

        for (let p = start; p <= end; p++) {
            paginationContainer.appendChild(pageLink(p, String(p), p === currentPage));
        }

        if (end < total) {
            if (end < total - 1) {
                const dots = document.createElement("span");
                dots.className = "ellipsis";
                dots.textContent = "...";
                paginationContainer.appendChild(dots);
            }
            paginationContainer.appendChild(pageLink(total, String(total)));
        }

        // next / last
        paginationContainer.appendChild(pageLink(Math.min(total, currentPage + 1), ">", false, currentPage === total));
        paginationContainer.appendChild(pageLink(total, ">>", false, currentPage === total));
    }

    // Initialize UI: populate categories, bind events
    function initUI() {
        populateCategories();
        setupSlider();
        setupSearch();
        syncOrderSelects();

        // load filters from query string into UI
        const params = getQueryParams();
        const q = params.get("q");
        if (q) {
            if (searchInput) searchInput.value = q;
            if (searchInputTop) searchInputTop.value = q;
        }
        const cat = params.get("categoria");
        if (cat && filterCategory) filterCategory.value = cat;

        const ordem = params.get("ordem");
        if (ordem) {
            if (orderSelect) orderSelect.value = ordem;
            if (orderSelectTop) orderSelectTop.value = ordem;
        }

        const maxPrice = params.get("max_price");
        if (maxPrice && priceSlider) {
            const num = parseFloat(maxPrice);
            if (!isNaN(num)) {
                priceSlider.value = Math.min(num, parseFloat(priceSlider.max || 10000));
            }
        }

        // Apply button explicitly updates query string (so backend can render new page if user wants)
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener("click", () => {
                const p = getQueryParams();
                // set page to 1 when applying filters
                p.set("page", "1");
                if (filterCategory && filterCategory.value !== "ALL") p.set("categoria", filterCategory.value);
                else p.delete("categoria");
                if (orderSelect && orderSelect.value) p.set("ordem", orderSelect.value);
                if (searchInput && searchInput.value.trim()) p.set("q", searchInput.value.trim());
                else p.delete("q");
                if (priceSlider && priceSlider.value) p.set("max_price", priceSlider.value);

                // navigate (server may re-render page with backend pagination) - preserving server flow
                window.location.href = `${location.pathname}?${p.toString()}`;
            });
        }

        // initial render
        aplicarFiltrosLocal();
        buildPagination();
        startTimers();

        // keep top/bottom order selects in sync visually
        if (orderSelect && orderSelectTop) {
            orderSelect.addEventListener("change", () => { orderSelectTop.value = orderSelect.value; });
            orderSelectTop.addEventListener("change", () => { orderSelect.value = orderSelectTop.value; });
        }

        // Price slider label update (already done in setupSlider via input)
    }

    // If there is no auctions data at all, show friendly message
    if (!allAuctions.length) {
        const el = document.getElementById("auctions-grid");
        if (el) el.innerHTML = `<p style="text-align:center; padding:40px;">Nenhum leilão nesta página.</p>`;
        // but still build pagination so user can navigate pages
        buildPagination();
    }

    // Run init
    initUI();

});

/*
document.addEventListener("DOMContentLoaded", () => {

    let filteredAuctions = [...(window.AUCTIONS || [])];

    const grid = document.querySelector(".leilao-grid");
    const paginationButtons = document.querySelectorAll(".page-btn");

    const selectCategory = document.getElementById("filter-category");
    const slider = document.getElementById("price-slider");
    const priceLabelMax = document.getElementById("current-max-price");

    function parseISODate(dateStr) {
        if (!dateStr) return null;

        // Força interpretação como UTC
        return new Date(dateStr.endsWith("Z") ? dateStr : dateStr + "Z");
    }


    function calcularTempoRestante(endDate) {

        const now = new Date();
        const end = parseISODate(endDate);

        if (!end) return "Data inválida";

        const diff = end - now;

        if (diff <= 0) return "Encerrado";

        const totalSeconds = Math.floor(diff / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    function getStatusLabel(status) {
        switch (status) {
            case "EM_ANDAMENTO":
                return { text: "EM ANDAMENTO", class: "status-andamento" };

            case "ENCERRADO":
                return { text: "ENCERRADO", class: "status-encerrado" };

            case "EM_BREVE":
                return { text: "EM BREVE", class: "status-em-breve" };

            default:
                return { text: status, class: "status-andamento" };
        }
    }

    function renderAuctions(auctions) {

        if (!grid) {
            console.error("Container .leilao-grid não encontrado");
            return;
        }

        grid.innerHTML = "";

        if (!auctions.length) {
            grid.innerHTML = `<p style="text-align:center;">Nenhum leilão encontrado.</p>`;
            return;
        }

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
                            <strong>R$ ${parseFloat(auction.currentPrice || 0).toFixed(2)}</strong>
                        </div>

                        <div class="leilao-tempo">
                            <span>Tempo Restante</span>
                            <strong id="timer-${auction.idAuction}">
                                ${tempoRestante}
                            </strong>
                        </div>

                        <div class="leilao-bid-info">
                            <span>Lances</span>
                            <strong>${auction.totalBids || 0}</strong>
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
    }

    function ativarBotoes() {
        document.querySelectorAll(".lance-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                window.location.href = `/auction/${id}`;
            });
        });
    }


    function iniciarTimers() {

        setInterval(() => {

            filteredAuctions.forEach(auction => {

                const timerElement = document.getElementById(`timer-${auction.idAuction}`);

                if (!timerElement) return;

                timerElement.innerText = calcularTempoRestante(auction.endDate);
            });

        }, 1000);
    }


    function aplicarFiltros() {

        const categoriaSelecionada = selectCategory?.value || "ALL";
        const precoMaximo = slider ? parseFloat(slider.value) : Infinity;

        filteredAuctions = window.AUCTIONS.filter(auction => {

            const precoAtual = parseFloat(auction.currentPrice || 0);
            const categoriaAuction = auction.categoryName;

            const passaCategoria = categoriaSelecionada === "ALL"
                || categoriaAuction === categoriaSelecionada;

            const passaPreco = precoAtual <= precoMaximo;

            return passaCategoria && passaPreco;
        });

        renderAuctions(filteredAuctions);
    }

    function setupSlider() {

        if (slider && priceLabelMax) {

            const maxVal = parseFloat(slider.max);

            const updateSliderValue = () => {

                const value = parseFloat(slider.value);
                const formattedValue = value.toFixed(2).replace(".", ",");

                if (value == maxVal) {
                    priceLabelMax.textContent = `R$ ${formattedValue}+`;
                } else {
                    priceLabelMax.textContent = `R$ ${formattedValue}`;
                }

                aplicarFiltros();
            };

            updateSliderValue();
            slider.addEventListener("input", updateSliderValue);
        }
    }


    if (selectCategory) {
        selectCategory.addEventListener("change", aplicarFiltros);
    }

    paginationButtons.forEach(btn => {

        btn.addEventListener("click", () => {

            const page = btn.dataset.page;

            fetch(`/auctions?page=${page}`)
                .then(response => response.json())
                .then(data => {

                    window.AUCTIONS = data;
                    filteredAuctions = [...data];

                    renderAuctions(filteredAuctions);
                })
                .catch(err => console.error("Erro na paginação:", err));
        });

    });

    // ============================
    // 🚀 INIT
    // ============================
    setupSlider();
    renderAuctions(filteredAuctions);
    iniciarTimers();

    console.log("leilões carregado corretamente.");
});
*/