document.addEventListener('DOMContentLoaded', () => {

    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    const btnPrev = document.querySelector('.carousel-btn.prev');
    const btnNext = document.querySelector('.carousel-btn.next');

    let current = 0;
    let autoPlayInterval = null;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(ind => ind.classList.remove('active'));

        slides[index].classList.add('active');
        indicators[index].classList.add('active');

        current = index;
    }

    function nextSlide() {
        let next = (current + 1) % slides.length;
        showSlide(next);
    }

    function prevSlide() {
        let prev = (current - 1 + slides.length) % slides.length;
        showSlide(prev);
    }

    // Botões
    btnNext.addEventListener('click', nextSlide);
    btnPrev.addEventListener('click', prevSlide);

    // Indicadores clicáveis
    indicators.forEach(ind => {
        ind.addEventListener('click', () => {
            let index = Number(ind.dataset.slide);
            showSlide(index);
        });
    });

    // Autoplay
    function startAutoPlay() {
        autoPlayInterval = setInterval(nextSlide, 5200);
    }

    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }

    startAutoPlay();

    // Pausar ao passar o mouse
    const carousel = document.querySelector('.fade-carousel');
    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);

});