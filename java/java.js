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

/* ==========================================
   GALERÍA INTERACTIVA (Arte de Rocambole)
   ========================================== */

document.addEventListener("DOMContentLoaded", function() {
    // 1. Seleccionamos todas las imágenes que pertenecen a la galería
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    // 2. Seleccionamos los elementos del Modal que vamos a modificar
    const modalTitle = document.getElementById('modalTitle');
    const modalImage = document.getElementById('modalImage');
    const modalDescription = document.getElementById('modalDescription');

    // 3. Verificamos que los elementos existan en la página actual
    if (galleryItems.length > 0 && modalTitle && modalImage && modalDescription) {
        
        // 4. Recorremos cada imagen y le agregamos el evento 'click'
        galleryItems.forEach(item => {
            item.addEventListener('click', function() {
                
                // Extraemos los datos de los atributos personalizados (data-*) y el src
                const title = this.getAttribute('data-title');
                const description = this.getAttribute('data-description');
                const imageSrc = this.getAttribute('src');

                // Inyectamos los datos en la estructura del Modal
                modalTitle.textContent = title;
                modalDescription.textContent = description;
                modalImage.setAttribute('src', imageSrc);
            });
        });
    }
});