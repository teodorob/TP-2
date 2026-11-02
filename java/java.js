document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('bg-video');
    const heroContent = document.getElementById('hero-content');

    if (video && heroContent) {
        // Cuando el video arranca, iniciamos el contador
        video.addEventListener('playing', () => {
            
            // Esperamos 3500 milisegundos (3.5 segundos) para mostrar el Hero
            setTimeout(() => {
                heroContent.classList.remove('opacity-0');
                heroContent.classList.add('animate__animated', 'animate__fadeInDown');
            }, 3500);

        });
    }
});