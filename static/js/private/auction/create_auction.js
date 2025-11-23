document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("createAuctionForm");
  const addProductBtn = document.getElementById("addProductBtn");
  const productsSection = document.getElementById("productsSection");

  // Preview elements
  const previewTitle = document.getElementById("previewTitle");
  const previewDesc = document.getElementById("previewDescription");
  const previewLotNum = document.getElementById("previewLotNum");
  const previewMinBid = document.getElementById("previewMinBid");
  const previewIncrement = document.getElementById("previewIncrement");
  const previewProductsList = document.getElementById("previewProductsList");
  const csrf = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

  let products = [];

  // Atualiza preview do leilão
  function updatePreview() {
    previewTitle.textContent = form.title.value || "—";
    previewDesc.textContent = form.description.value || "—";
    previewLotNum.textContent = form.lot_number.value || "—";
    previewMinBid.textContent = parseFloat(form.minimum_bid.value || 0).toFixed(2);
    previewIncrement.textContent = parseFloat(form.minimum_increment.value || 0).toFixed(2);

    previewProductsList.innerHTML = "";
    products.forEach((p, i) => {
      const li = document.createElement("li");
      li.textContent = `${p.name || "Item"} — ${p.description || ""}`;
      previewProductsList.appendChild(li);
    });
  }

  // Adicionar novo formulário de produto
  addProductBtn.addEventListener("click", () => {
    const idx = products.length;
    products.push({ name: "", description: "" });

    const div = document.createElement("div");
    div.classList.add("product-form");
    div.dataset.index = idx;

    div.innerHTML = `
      <div class="form-group">
        <label>Nome do Item</label>
        <input type="text" class="p-name" placeholder="Nome do produto">
      </div>
      <div class="form-group">
        <label>Descrição do Item</label>
        <textarea class="p-description" rows="2" placeholder="Descrição do produto"></textarea>
      </div>
      <div class="form-two-col">
        <div class="form-group">
          <label>Peso (kg)</label>
          <input type="number" class="p-weight" step="0.01">
        </div>
        <div class="form-group">
          <label>Largura (cm)</label>
          <input type="number" class="p-width" step="0.01">
        </div>
      </div>
      <div class="form-two-col">
        <div class="form-group">
          <label>Altura (cm)</label>
          <input type="number" class="p-height" step="0.01">
        </div>
        <div class="form-group">
          <label>Profundidade (cm)</label>
          <input type="number" class="p-depth" step="0.01">
        </div>
      </div>
      <div class="form-group">
        <label>Fabricante</label>
        <input type="text" class="p-manufacturer" placeholder="Fabricante">
      </div>
      <div class="form-group">
        <label>Tipo de Produto</label>
        <input type="text" class="p-type" placeholder="Ex: Jogo, Console, Cartucho">
      </div>
    `;

    productsSection.appendChild(div);

    // escutadores nos inputs desse bloco
    const inputs = div.querySelectorAll("input, textarea");
    inputs.forEach(inp => {
      inp.addEventListener("input", () => {
        const i = Number(div.dataset.index);
        products[i] = {
          name: div.querySelector(".p-name").value,
          description: div.querySelector(".p-description").value,
          weight: div.querySelector(".p-weight").value,
          width: div.querySelector(".p-width").value,
          height: div.querySelector(".p-height").value,
          depth: div.querySelector(".p-depth").value,
          manufacturer: div.querySelector(".p-manufacturer").value,
          type: div.querySelector(".p-type").value
        };
        updatePreview();
      });
    });

    updatePreview();
  });

  // Atualiza preview quando campos do leilão mudam
  ["title", "description", "lot_number", "minimum_bid", "minimum_increment"].forEach(name => {
    form[name].addEventListener("input", updatePreview);
  });

  // Enviar formulário
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const auctionData = {
      title: form.title.value,
      description: form.description.value,
      start_date: form.start_date.value,
      end_date: form.end_date.value
    };

    const lotData = {
      lot_number: form.lot_number.value,
      minimum_bid: parseFloat(form.minimum_bid.value),
      minimum_increment: parseFloat(form.minimum_increment.value)
    };

    const payload = {
      auction: auctionData,
      lot: lotData,
      products
    };
    console.log(csrf)
    const res = await fetch("http://127.0.0.1:5000/auctions/create", {
      method: "POST",

      headers: { "Content-Type": "application/json","X-CSRFToken": csrf  },
   
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (json.success) {
      window.location.href = `/auction/${json.auction_id}`;
    } else {
      alert("Erro: " + (json.error || "não foi possível criar leilão"));
    }
  });

  // Inicializa preview
  updatePreview();
});
