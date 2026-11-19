/* =========================================================
   OKTUBRE — ok.js (solo oktubre.html)
   Requiere: main.js, GSAP + ScrollTrigger (cargados antes)
   ========================================================= */
(() => {
  'use strict';
  if (!window.gsap || !window.ScrollTrigger) return;

  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const fontsReady = Promise.race([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    new Promise(r => setTimeout(r, 1800))
  ]);

  /* ---------- Máquina de escribir (portada, una sola vez) ---------- */
  const typeTargets = $$('[data-typewriter]');
  const typeChars = [];
  typeTargets.forEach(el => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const frag = document.createDocumentFragment();
      [...node.textContent].forEach(ch => {
        const s = document.createElement('span');
        s.className = 'tw';
        s.textContent = ch;
        frag.append(s);
        typeChars.push(s);
      });
      node.replaceWith(frag);
    });
  });
  if (!REDUCE && typeChars.length) {
    typeTargets.forEach(el => el.classList.add('is-typing'));
    gsap.set(typeChars, { opacity: 0 });
    fontsReady.then(() => {
      gsap.to(typeChars, {
        opacity: 1, duration: .03, stagger: .016, ease: 'none', delay: .6,
        onComplete: () => typeTargets.forEach(el => el.classList.remove('is-typing'))
      });
    });
  }

  /* ---------- Máquina de escribir en loop infinito (cita "Oktubre no era...") ----------
     Arranca sola al cargar la página — ya NO espera a entrar en viewport.
     La sección vive pineada detrás del hold del hero (data-hold="40"), así que
     esperar scroll hacía falta recorrer miles de píxeles antes de que arrancara,
     y por eso parecía no tener ninguna animación. Tipea → pausa → borra → pausa, en bucle. */
  $$('[data-typewriter-loop]').forEach(el => {
    const full = el.textContent.trim();
    if (REDUCE || !full) return;
    el.setAttribute('aria-label', full);
    el.textContent = '';

    const TYPE_MS = 70;
    const DELETE_MS = 42;
    const HOLD_MS = 2400;
    const PAUSE_MS = 700;
    let i = 0, typing = true;

    const tick = () => {
      if (typing) {
        i++;
        el.textContent = full.slice(0, i);
        if (i >= full.length) { typing = false; setTimeout(tick, HOLD_MS); return; }
        setTimeout(tick, TYPE_MS);
      } else {
        i--;
        el.textContent = full.slice(0, i);
        if (i <= 0) { typing = true; setTimeout(tick, PAUSE_MS); return; }
        setTimeout(tick, DELETE_MS);
      }
    };

    fontsReady.then(() => setTimeout(tick, 900));
  });

  /* ---------- Entradas suaves ---------- */
  $$('[data-reveal]').forEach(el => {
    if (REDUCE) return;
    gsap.fromTo(el, { autoAlpha: 0, y: 48 }, {
      autoAlpha: 1, y: 0, duration: 1.6, delay: parseFloat(el.dataset.delay || 0), ease: 'power3.out',
      clearProps: 'transform,opacity,visibility',
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
    });
  });

  /* ---------- Spotlight: oscurece la sección y deja la tapa iluminada ---------- */
  if (FINE) $$('.ok-cover').forEach(img => {
    const sec = img.closest('section');
    const dim = document.createElement('div');
    dim.className = 'ok-dim';
    dim.setAttribute('aria-hidden', 'true');
    sec.append(dim);
    img.addEventListener('pointerenter', () => dim.classList.add('is-on'));
    img.addEventListener('pointerleave', () => dim.classList.remove('is-on'));
  });

  /* ---------- Lupa de inspección sobre la tapa (Rocambole) ---------- */
  const LENS = 180;
  const ZOOM = 2.2;
  $$('[data-lens]').forEach(fig => {
    const img = fig.querySelector('.ok-cover');
    const lens = fig.querySelector('.ok-lens');
    if (!img || !lens || !FINE) return;
    lens.style.backgroundImage = `url("${img.currentSrc || img.src}")`;

    const place = e => {
      const r = img.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      lens.style.left = `${x - LENS / 2}px`;
      lens.style.top = `${y - LENS / 2}px`;
      lens.style.backgroundSize = `${r.width * ZOOM}px ${r.height * ZOOM}px`;
      lens.style.backgroundPosition = `${-(x * ZOOM - LENS / 2)}px ${-(y * ZOOM - LENS / 2)}px`;
    };

    img.addEventListener('pointerenter', e => { fig.classList.add('is-lens'); place(e); });
    img.addEventListener('pointermove', place);
    img.addEventListener('pointerleave', () => fig.classList.remove('is-lens'));
  });

  /* ---------- Tarjetas postal con volteo 3D ---------- */
  const flipCards = $$('[data-flip]');
  if (FINE) {
    /* Desktop/mouse: gira con hover */
    flipCards.forEach(card => {
      card.addEventListener('pointerenter', () => card.classList.add('is-flipped'));
      card.addEventListener('pointerleave', () => card.classList.remove('is-flipped'));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.classList.toggle('is-flipped'); }
      });
    });
  } else {
    /* Táctil: toca para girar, y se gira sola al pasar por el centro de pantalla */
    flipCards.forEach(card => {
      card.addEventListener('click', () => card.classList.toggle('is-flipped'));
    });
    if ('IntersectionObserver' in window) {
      const flipObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => entry.target.classList.toggle('is-flipped', entry.isIntersecting));
      }, { rootMargin: '-42% 0px -42% 0px' });
      flipCards.forEach(card => flipObserver.observe(card));
    }
  }
})();