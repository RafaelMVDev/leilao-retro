// Função para atualizar o valor do slider de preço na UI
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

window.onload = function () {
    setupSlider();
    console.log('Página de Leilões - Brilho Sutil carregada.');
};