document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("createAuctionForm");
  const addProductBtn = document.getElementById("addProductBtn");
  const productsSection = document.getElementById("productsSection");
  const csrf = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

  let products = [];
  const previewTitle = document.getElementById("previewTitle");
  const previewDescription = document.getElementById("previewDescription");
  const previewLotNum = document.getElementById("previewLotNum");
  const previewMinBid = document.getElementById("previewMinBid");
  const previewIncrement = document.getElementById("previewIncrement");
  const previewProductsList = document.getElementById("previewProductsList");

  const titleInput = form.querySelector("[name='title']");
  const descriptionInput = form.querySelector("[name='description']");
  const lotNumberInput = form.querySelector("[name='lot_number']");
  const minimumBidInput = form.querySelector("[name='minimum_bid']");
  const minimumIncrementInput = form.querySelector("[name='minimum_increment']");
  function updateAuctionPreview() {

    previewTitle.innerText = titleInput.value || "—";
    previewDescription.innerText = descriptionInput.value || "—";
    previewLotNum.innerText = lotNumberInput.value || "—";

    previewMinBid.innerText = minimumBidInput.value 
      ? parseFloat(minimumBidInput.value).toFixed(2)
      : "0.00";

    previewIncrement.innerText = minimumIncrementInput.value 
      ? parseFloat(minimumIncrementInput.value).toFixed(2)
      : "0.00";

    // ========= Atualizar Produtos =========
    previewProductsList.innerHTML = "";

    const productForms = document.querySelectorAll(".product-form");

    productForms.forEach((productDiv, index) => {

      const name = productDiv.querySelector(".p-name").value;
      const category = productDiv.querySelector(".p-category").value;
      const type = productDiv.querySelector(".p-type").value;

      const li = document.createElement("li");

      li.innerText = `${name || "Produto sem nome"} 
      (${category || "sem categoria"} | ${type || "tipo indefinido"})`;

      previewProductsList.appendChild(li);
    });
  }
 
  titleInput.addEventListener("input", updateAuctionPreview);
  descriptionInput.addEventListener("input", updateAuctionPreview);
  lotNumberInput.addEventListener("input", updateAuctionPreview);
  minimumBidInput.addEventListener("input", updateAuctionPreview);
  minimumIncrementInput.addEventListener("input", updateAuctionPreview);

  function createProductBlock(index) {

    const wrapper = document.createElement("div");
    wrapper.classList.add("product-form");
    wrapper.dataset.index = index;

    wrapper.innerHTML = `

      <h4>Produto ${index + 1}</h4>
      <br>
      <div class="product-select-row">
    <select name="category" class="p-category" required>
        <option value="">Categoria *</option>
        <option value="games">Games</option>
        <option value="consoles">Consoles</option>
        <option value="customized">Customized</option>
    </select>

    <select name="productType" class="p-type" required>
        <option value="">Tipo do produto *</option>
        <option value="physical">Físico</option>
        <option value="digital">Digital</option>
    </select>
</div>

    
      <input type="text" name="productName" class="p-name" placeholder="Nome do produto *" required>

      <textarea name="descriptionProduct" class="p-description" placeholder="Descrição do produto *" required></textarea>


      <input type="text" name="manufacturer" class="p-manufacturer" placeholder="Fabricante do produto">

      <!-- CAMPOS FÍSICOS -->
      <div class="physical-fields hidden">

        <input type="number" step="0.01" name="weight" placeholder="Peso (kg)">
        <input type="number" step="0.01" name="width" placeholder="Largura (cm)">
        <input type="number" step="0.01" name="height" placeholder="Altura (cm)">
        <input type="number" step="0.01" name="depth" placeholder="Profundidade (cm)">

      </div>

      <!-- CAMPOS DIGITAIS -->
      <div class="digital-fields hidden">

        <input type="text" name="downloadUrl" placeholder="URL de download">
        <input type="text" name="activationKey" placeholder="Chave de ativação">
        <input type="number" name="downloadValidity" placeholder="Validade do download (dias)">

      </div>

      <div class="form-group">
        <label>Imagens do produto</label>
        <input type="file" class="p-images" multiple>
        <div class="product-image-previews"></div>
      </div>

      <button type="button" class="remove-product">Remover produto</button>
      <hr>
    `;

    // Alternância dos campos físico/digital
    const typeSelect = wrapper.querySelector(".p-type");
    const physicalFields = wrapper.querySelector(".physical-fields");
    const digitalFields = wrapper.querySelector(".digital-fields");

    typeSelect.addEventListener("change", () => {
      if (typeSelect.value === "physical") {
        physicalFields.classList.remove("hidden");
        digitalFields.classList.add("hidden");
      } 
      else if (typeSelect.value === "digital") {
        digitalFields.classList.remove("hidden");
        physicalFields.classList.add("hidden");
      } 
      else {
        digitalFields.classList.add("hidden");
        physicalFields.classList.add("hidden");
      }
    });

    
    wrapper.querySelector(".remove-product").addEventListener("click", () => {
      wrapper.remove();
      updateAuctionPreview();
    });


    const fileInput = wrapper.querySelector(".p-images");
    const previewBox = wrapper.querySelector(".product-image-previews");

    fileInput.addEventListener("change", (e) => {
      previewBox.innerHTML = "";
      const files = Array.from(e.target.files);

      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          const img = document.createElement("img");
          img.src = reader.result;
          img.classList.add("thumb");
          previewBox.appendChild(img);
        };
        reader.readAsDataURL(file);
      });

      fileInput._files = files;
    });

    return wrapper;
  }

  addProductBtn.addEventListener("click", () => {
    const index = productsSection.children.length;
    const productBlock = createProductBlock(index);
    productsSection.appendChild(productBlock);

    updateAuctionPreview(); // atualiza ao criar produto

    // Atualizar sempre que editar produto
    productBlock.addEventListener("input", updateAuctionPreview);
    productBlock.addEventListener("change", updateAuctionPreview);
  });


  // SUBMIT
  form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fd = new FormData(form);

  // ================= AUCTION DATA =================
  const auctionData = {
    title: form.querySelector("[name='title']").value,
    description: form.querySelector("[name='description']").value,
    start_date: form.querySelector("[name='start_date']").value,
    end_date: form.querySelector("[name='end_date']").value
  };

  fd.append("auctionData", JSON.stringify(auctionData));

  // ================= LOT DATA =================
  const lotData = {
    lot_number: form.querySelector("[name='lot_number']").value,
    minimum_bid: form.querySelector("[name='minimum_bid']").value,
    minimum_increment: form.querySelector("[name='minimum_increment']").value
  };

  fd.append("lotData", JSON.stringify(lotData));

  // ================= PRODUCTS =================
  const productForms = document.querySelectorAll(".product-form");

  productForms.forEach((productDiv, index) => {

    const data = {
      productName: productDiv.querySelector(".p-name").value,
      descriptionProduct: productDiv.querySelector(".p-description").value,
      category: productDiv.querySelector(".p-category").value,
      productType: productDiv.querySelector(".p-type").value,
      manufacturer: productDiv.querySelector(".p-manufacturer").value,

      weight: productDiv.querySelector("[name='weight']")?.value || null,
      width: productDiv.querySelector("[name='width']")?.value || null,
      height: productDiv.querySelector("[name='height']")?.value || null,
      depth: productDiv.querySelector("[name='depth']")?.value || null,

      downloadUrl: productDiv.querySelector("[name='downloadUrl']")?.value || null,
      activationKey: productDiv.querySelector("[name='activationKey']")?.value || null,
      downloadValidity: productDiv.querySelector("[name='downloadValidity']")?.value || null
    };

    fd.append(`products[${index}]`, JSON.stringify(data));

    // IMAGENS
    const imgInput = productDiv.querySelector(".p-images");
    if (imgInput && imgInput._files) {
      imgInput._files.forEach(file => {
        fd.append(`product_images_${index}`, file);
      });
    }
  });

  // ================= FETCH =================
  const response = await fetch("/auctions/create", {
    method: "POST",
    headers: { 
      "X-CSRFToken": csrf 
    },
    body: fd
  });

  const json = await response.json();

  if (json.success) {
    window.location.href = `/auction/${json.auction_id}`;
  } else {
    alert("Erro: " + json.message);
  }
});

});
