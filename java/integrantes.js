/* =========================================================
   INTEGRANTES — integrantes.js (solo integrantes.html)
   Requiere: main.js, GSAP + ScrollTrigger (cargados antes)
   ========================================================= */
(() => {
  'use strict';
  if (!window.gsap || !window.ScrollTrigger) return;

  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Foto de perfil: se descubre de arriba hacia abajo ---------- */
  const destapar = (foto, extra = {}) => gsap.fromTo(foto,
    { clipPath: 'inset(0 0 100% 0)' },
    { clipPath: 'inset(0 0 0% 0)', duration: 1.6, ease: 'power3.inOut', clearProps: 'clipPath', ...extra }
  );

  if (!REDUCE) {
    /* Primera solapa: al entrar en pantalla */
    const primera = $('.tab-pane.active .int-foto');
    if (primera) {
      destapar(primera, {
        scrollTrigger: { trigger: primera, start: 'top 85%', toggleActions: 'play none none none' }
      });
    }

    /* Resto de solapas: al mostrarse */
    $$('[data-tabs] [data-bs-toggle="tab"]').forEach(btn => {
      btn.addEventListener('shown.bs.tab', () => {
        destapar($$('.int-foto', $(btn.dataset.bsTarget)));
      });
    });
  }

  /* ---------- Formación clásica: la fila apuntada queda, las demás se apagan ---------- */
  if (FINE && !REDUCE) {
    $$('.int-lista').forEach(lista => {
      const filas = $$('.int-fila', lista);
      const enfocar = activa => filas.forEach(f => {
        gsap.to(f, { opacity: !activa || f === activa ? 1 : .3, duration: .8, ease: 'power2.out', overwrite: 'auto' });
        gsap.to($('.t-h3', f), { x: f === activa ? 24 : 0, duration: 1, overwrite: 'auto' });
      });
      filas.forEach(f => f.addEventListener('pointerenter', () => enfocar(f)));
      lista.addEventListener('pointerleave', () => enfocar(null));
    });
  }
})();