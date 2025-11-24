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

  function createProductObject() {
    return {
      name: "",
      descriptionProduct: "",
      weight: "",
      width: "",
      height: "",
      depth: "",
      manufacturer: "",
      type: "",
      imagePreviews: [] // store data URLs for preview only
    };
  }

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
      const imagesHTML = (p.imagePreviews && p.imagePreviews.length)
        ? ` <div class="preview-thumb-list">${p.imagePreviews.map(src => `<img src="${src}" class="thumb">`).join('')}</div>`
        : '';
      li.innerHTML = `<strong>${p.name || "Item " + (i+1)}</strong> — ${p.description || ""} ${imagesHTML}`;
      previewProductsList.appendChild(li);
    });
  }

  // Create product form block
  addProductBtn.addEventListener("click", () => {
    const idx = products.length;
    products.push(createProductObject());

    const div = document.createElement("div");
    div.classList.add("product-form");
    div.dataset.index = idx;

    div.innerHTML = `
  <div class="product-header">
    <h4>Produto ${idx + 1}</h4>
    <button type="button" class="remove-product">✕</button>
  </div>

  <div class="form-group">
    <label>Nome do produto *</label>
    <input type="text" class="p-name" name="productName" placeholder="Ex: God of War" required>
  </div>

  <div class="form-group">
    <label>Descrição *</label>
    <textarea class="p-description" name="descriptionProduct" required></textarea>
  </div>

  <div class="form-group">
    <label>Categoria *</label>
    <select class="p-category" name="category" required>
      <option value="">Selecione...</option>
      <option value="games">Games</option>
      <option value="consoles">Consoles</option>
      <option value="acessorios">Acessórios</option>
    </select>
  </div>

  <div class="form-group">
    <label>Tipo do produto *</label>
    <select class="p-type" name="productType" required>
      <option value="">Selecione...</option>
      <option value="physical">Físico</option>
      <option value="digital">Digital</option>
    </select>
  </div>

  <div class="physical-fields">
    <div class="form-two-col">
      <div class="form-group">
        <label>Peso (kg)</label>
        <input type="number" step="0.01" name="weight" class="p-weight">
      </div>
      <div class="form-group">
        <label>Largura (cm)</label>
        <input type="number" step="0.01" name="width" class="p-width">
      </div>
    </div>

    <div class="form-two-col">
      <div class="form-group">
        <label>Altura (cm)</label>
        <input type="number" step="0.01" name="height" class="p-height">
      </div>
      <div class="form-group">
        <label>Profundidade (cm)</label>
        <input type="number" step="0.01" name="depth" class="p-depth">
      </div>
    </div>
  </div>

  <div class="digital-fields" style="display:none;">
    <div class="form-group">
      <label>Download URL</label>
      <input type="text" name="downloadUrl" class="p-download-url">
    </div>

    <div class="form-group">
      <label>Chave de Ativação</label>
      <input type="text" name="activationKey" class="p-activation-key">
    </div>

    <div class="form-group">
      <label>Validade do Download (dias)</label>
      <input type="number" name="downloadValidity" class="p-download-validity">
    </div>
  </div>

  <div class="form-group">
    <label>Fabricante</label>
    <select name="manufacturer" class="p-manufacturer">
      <option value="">Selecione...</option>
      <option value="sony">Sony</option>
      <option value="nintendo">Nintendo</option>
      <option value="microsoft">Microsoft</option>
      <option value="indie">Independente</option>
    </select>
  </div>

  <div class="form-group">
    <label>Imagens</label>
    <input type="file" class="p-images" multiple>
    <div class="product-image-previews"></div>
  </div>

  <hr>
`;

    productsSection.appendChild(div);

    // Remove product button
    div.querySelector('.remove-product').addEventListener('click', () => {
      const index = Number(div.dataset.index);
      products[index] = null; // mark removed
      div.remove();
      // compact products array and re-index dataset/index
      products = products.filter(p => p !== null);
      // reindex DOM nodes
      Array.from(productsSection.querySelectorAll('.product-form')).forEach((node, newIdx) => {
        node.dataset.index = newIdx;
        node.querySelector('.product-header h4').textContent = `Item ${newIdx + 1}`;
      });
      updatePreview();
    });

    // inputs event listeners
    const inputs = div.querySelectorAll("input, textarea");
    inputs.forEach(inp => {
      if (inp.classList.contains('p-images')) {
        inp.addEventListener('change', (ev) => {
          const i = Number(div.dataset.index);
          const files = Array.from(ev.target.files || []);
          // generate previews
          const previewContainer = div.querySelector('.product-image-previews');
          previewContainer.innerHTML = '';
          products[i].imagePreviews = [];

          files.forEach(file => {
            if (!file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = (e) => {
              products[i].imagePreviews.push(e.target.result);
              const img = document.createElement('img');
              img.src = e.target.result;
              img.classList.add('thumb');
              previewContainer.appendChild(img);
              updatePreview();
            };
            reader.readAsDataURL(file);
          });

          // store fileList on the input element for submission time
          inp._files = files;
        });
      } else {
        inp.addEventListener("input", () => {
          const i = Number(div.dataset.index);
          products[i] = {
            ...products[i],
            name: div.querySelector(".p-name").value,
            description: div.querySelector(".p-description").value,
            weight: div.querySelector(".p-weight").value,
            width: div.querySelector(".p-width").value,
            height: div.querySelector(".p-height").value,
            depth: div.querySelector(".p-depth").value,
            manufacturer: div.querySelector(".p-manufacturer").value,
            type: div.querySelector(".p-type").value,
            imagePreviews: products[i].imagePreviews || []
          };
          updatePreview();
        });
      }
    });

    updatePreview();
  });

  // Atualiza preview quando campos do leilão mudam
  ["title", "description", "lot_number", "minimum_bid", "minimum_increment"].forEach(name => {
    if (form[name]) form[name].addEventListener("input", updatePreview);
  });

  // Enviar formulário com arquivos
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validate basic required fields
    if (!form.title.value.trim()) { alert("Título obrigatório."); return; }
    if (!form.start_date.value || !form.end_date.value) { alert("Datas do leilão são obrigatórias."); return; }

    const auctionData = {
      title: form.title.value,
      description: form.description.value,
      start_date: form.start_date.value,
      end_date: form.end_date.value
    };

    const lotData = {
      lot_number: form.lot_number.value,
      minimum_bid: parseFloat(form.minimum_bid.value || 0),
      minimum_increment: parseFloat(form.minimum_increment.value || 0)
    };

    // Build products payload (without file objects)
    const productsPayload = Array.from(productsSection.querySelectorAll('.product-form')).map((node, i) => {
      return {
        index: i,
        name: node.querySelector('.p-name')?.value || "",
        description: node.querySelector('.p-description')?.value || "",
        weight: node.querySelector('.p-weight')?.value || "",
        width: node.querySelector('.p-width')?.value || "",
        height: node.querySelector('.p-height')?.value || "",
        depth: node.querySelector('.p-depth')?.value || "",
        manufacturer: node.querySelector('.p-manufacturer')?.value || "",
        type: node.querySelector('.p-type')?.value || ""
      };
    });

    // FormData: append JSON parts and files
    const fd = new FormData();
    // append JSON blobs
    fd.append('auction', new Blob([JSON.stringify(auctionData)], { type: "application/json" }));
    fd.append('lot', new Blob([JSON.stringify(lotData)], { type: "application/json" }));
    fd.append('products', new Blob([JSON.stringify(productsPayload)], { type: "application/json" }));

    // append files per product with key product_images_{index}
    Array.from(productsSection.querySelectorAll('.product-form')).forEach((node, i) => {
      const fileInput = node.querySelector('.p-images');
      if (fileInput && fileInput._files && fileInput._files.length) {
        fileInput._files.forEach((f, j) => {
          // key example: product_images_0 -> backend can iterate keys that start with product_images_
          fd.append(`product_images_${i}`, f);
        });
      }
    });

    try {
      const res = await fetch("/auctions/create", {
        method: "POST",
        // DO NOT set Content-Type; browser will set multipart boundary
        headers: { "X-CSRFToken": csrf },
        body: fd
      });

      // attempt to parse json response
      const json = await res.json();

      if (res.ok && json.success) {
        window.location.href = `/auction/${json.auction_id}`;
      } else {
        alert("Erro: " + (json.error || json.message || "não foi possível criar leilão"));
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão ao criar leilão.");
    }
  });

  // Inicializa preview
  updatePreview();
});
