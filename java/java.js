/* =========================================================
   PATRICIO REY — main.js (global, todas las páginas)
   Requiere (CDN): Bootstrap bundle + GSAP + ScrollTrigger + Lenis
   ========================================================= */
(() => {
  'use strict';

  const root = document.documentElement;
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  let lenis = null;

  /* ---------- Imágenes faltantes: queda visible la trama ---------- */
  $$('img').forEach(img => {
    img.addEventListener('error', () => img.classList.add('is-missing'));
    img.addEventListener('load', () => img.classList.remove('is-missing'));
    if (img.getAttribute('src') && img.complete && img.naturalWidth === 0) img.classList.add('is-missing');
  });

  /* ---------- Texto al ancho del contenedor ---------- */
  function fitAll() {
    $$('[data-fit-box]').forEach(box => {
      const ref = $('[data-fit]', box);
      if (!ref) return;
      box.style.setProperty('--fs', '100px');
      const cs = getComputedStyle(box);
      const avail = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const w = ref.getBoundingClientRect().width;
      if (w) box.style.setProperty('--fs', (100 * avail / w * .995).toFixed(2) + 'px');
    });
  }
  const fontsReady = Promise.race([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    new Promise(r => setTimeout(r, 1800))
  ]);

  if (REDUCE) $$('video[autoplay]').forEach(v => { v.removeAttribute('autoplay'); v.pause(); });

  /* Sin GSAP: sitio estático pero funcional */
  if (!window.gsap || !window.ScrollTrigger) {
    root.classList.remove('js');
    fontsReady.then(fitAll);
    addEventListener('resize', fitAll);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out', duration: 1.4 });

  /* ---------- Scroll suave ---------- */
  if (!REDUCE && window.Lenis) {
    lenis = new Lenis({ lerp: .07, wheelMultiplier: .9 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- Cortina entre páginas ---------- */
  const curtain = $('.curtain');
  const [layerA, layerB] = curtain ? $$('.curtain__layer', curtain) : [];
  const cLabel = curtain && $('.curtain__label', curtain);

  function curtainOut() {
    const tl = gsap.timeline({ defaults: { duration: REDUCE ? 0 : 1.3, ease: 'power4.inOut' } });
    if (!curtain) return tl;
    return tl
      .set(curtain, { visibility: 'visible' })
      .to(layerB, { yPercent: -100 })
      .to(layerA, { yPercent: -100 }, REDUCE ? 0 : .16)
      .set(curtain, { visibility: 'hidden' });
  }

  function curtainIn(label, done) {
    if (!curtain || REDUCE) return done();
    if (cLabel) cLabel.textContent = label;
    gsap.timeline({ defaults: { duration: 1.1, ease: 'power4.inOut' }, onComplete: done })
      .set(curtain, { visibility: 'visible' })
      .fromTo(layerA, { yPercent: 100 }, { yPercent: 0 })
      .fromTo(layerB, { yPercent: 100 }, { yPercent: 0 }, .14)
      .fromTo(cLabel, { yPercent: 110 }, { yPercent: 0, duration: 1, ease: 'power3.out' }, .7);
  }

  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || a.matches('[data-bs-toggle]') || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if ((a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.hash) return;
    if (!/\.html?$/.test(url.pathname)) return;
    e.preventDefault();
    curtainIn(a.dataset.label || a.textContent.trim().replace(/\s+/g, ' '), () => { location.href = url.href; });
  });

  addEventListener('pageshow', e => {
    if (!e.persisted || !curtain) return;
    gsap.set([layerA, layerB], { yPercent: -100 });
    gsap.set(curtain, { visibility: 'hidden' });
  });

  /* ---------- Desfase de serigrafía ---------- */
  const setOffset = (el, x, y) => {
    el.style.setProperty('--mx', x.toFixed(3) + 'em');
    el.style.setProperty('--my', y.toFixed(3) + 'em');
  };

  function misregPointer(area) {
    if (!FINE || REDUCE) return;
    const st = { x: .035, y: .025 };
    const apply = () => setOffset(area, st.x, st.y);
    area.addEventListener('pointermove', e => {
      const r = area.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - .5;
      const ny = (e.clientY - r.top) / r.height - .5;
      gsap.to(st, { x: .035 + nx * .05, y: .025 + ny * .04, duration: 1.6, ease: 'power2.out', overwrite: true, onUpdate: apply });
    });
    area.addEventListener('pointerleave', () => {
      gsap.to(st, { x: .035, y: .025, duration: 2, ease: 'power2.out', overwrite: true, onUpdate: apply });
    });
  }

  $$('[data-misreg-scroll]').forEach(el => {
    if (REDUCE) return;
    const st = { v: .12 };
    const apply = () => setOffset(el, st.v, st.v * .6);
    apply();
    gsap.to(st, {
      v: .03, ease: 'none', onUpdate: apply,
      scrollTrigger: { trigger: el, start: 'top 90%', end: 'center 45%', scrub: 1.5 }
    });
  });

  /* ---------- Entrada del hero ---------- */
  function buildIntro() {
    const hero = $('[data-intro]');
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power4.out' } });
    if (!hero) return tl;
    tl.eventCallback('onComplete', () => misregPointer(hero));
    if (REDUCE) return tl;

    const lines = $$('.line > *', hero);
    const media = $$('.hero__media', hero);
    const fades = $$('[data-intro-fade]', hero);
    const off = { v: .16 };
    const apply = () => setOffset(hero, off.v, off.v * .7);
    apply();

    return tl
      .fromTo(lines, { yPercent: 105 }, { yPercent: 0, duration: 1.8, stagger: .14 })
      .fromTo(media, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 2, ease: 'power3.inOut' }, .2)
      .to(off, { v: .035, duration: 2.4, ease: 'power2.out', onUpdate: apply }, .5)
      .fromTo(fades, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 1.6, stagger: .12 }, .9);
  }
  const intro = buildIntro();

  /* ---------- Barra amarilla: bucle infinito continuo ---------- */
  $$('[data-marquee]').forEach(m => {
    if (REDUCE) return;
    const track = $('.marquee__track', m);
    const group = $('.marquee__group', m);
    const setX = gsap.quickSetter(track, 'x', 'px');
    const speed = parseFloat(m.dataset.speed || 45);
    let x = 0, boost = 0, w = group.offsetWidth;
    gsap.ticker.add((t, dt) => {
      const v = lenis ? Math.min(Math.abs(lenis.velocity), 60) : 0;
      boost += (v * 3 - boost) * .04;
      x = gsap.utils.wrap(-w, 0, x - (speed + boost) * dt / 1000);
      setX(x);
    });
    addEventListener('resize', () => { w = group.offsetWidth; });
    fontsReady.then(() => { w = group.offsetWidth; });
  });

  /* ---------- La Mística + capas que se apoyan unas sobre otras ---------- */
  const mm = gsap.matchMedia();
  const mistica = $('[data-words-pin]');
  const wordsEl = $('[data-words]');
  let spans = [];
  if (wordsEl) {
    const words = wordsEl.textContent.trim().split(/\s+/);
    const frag = document.createDocumentFragment();
    words.forEach((w, i) => {
      const s = document.createElement('span');
      s.textContent = w;
      frag.append(s, i < words.length - 1 ? ' ' : '');
    });
    wordsEl.textContent = '';
    wordsEl.append(frag);
    spans = [...wordsEl.children];
  }

  const layers = $$('[data-layer]');
  layers.forEach(p => {
    const shade = document.createElement('div');
    shade.className = 'sec__shade';
    shade.setAttribute('aria-hidden', 'true');
    p.append(shade);
  });

  mm.add({
    desk: '(min-width: 768px)',
    reduce: '(prefers-reduced-motion: reduce)'
  }, ctx => {
    const { desk, reduce } = ctx.conditions;
    if (reduce) return;
    const gaps = [];

    /* Celular: el párrafo se entinta con el scroll normal */
    if (!desk && spans.length) {
      gsap.fromTo(spans, { opacity: .12 }, {
        opacity: 1, ease: 'none', stagger: .06,
        scrollTrigger: { trigger: wordsEl, start: 'top 85%', end: 'bottom 40%', scrub: 1.4 }
      });
    }

    /* Escritorio: cada sección se termina de leer, queda fija un tramo
       (data-hold, en vh) y recién después la siguiente sube y la tapa */
    if (desk) {
      layers.forEach((panel, i) => {
        if (i === layers.length - 1) return;
        const gap = document.createElement('div');
        gap.className = 'pin-gap';
        gap.setAttribute('aria-hidden', 'true');
        gap.style.height = parseFloat(panel.dataset.hold || 60) + 'vh';
        panel.after(gap);
        gaps.push(gap);
        const next = gap.nextElementSibling || layers[i + 1];

        ScrollTrigger.create({
          trigger: panel,
          start: 'bottom bottom',
          end: () => '+=' + (gap.offsetHeight + innerHeight),
          pin: true,
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true
        });

        gsap.fromTo($('.sec__shade', panel), { opacity: 0 }, {
          opacity: .55, ease: 'none',
          scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top', scrub: true, invalidateOnRefresh: true }
        });

        /* La Mística: se entinta mientras está fija y queda completa un buen rato */
        if (panel === mistica && spans.length) {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: panel,
              start: 'top 75%',
              end: () => 'bottom+=' + gap.offsetHeight + ' bottom',
              scrub: 1.2,
              invalidateOnRefresh: true
            }
          });
          tl.fromTo(spans, { opacity: .12 }, { opacity: 1, ease: 'none', duration: .5, stagger: .06 });
          tl.to({}, { duration: tl.duration() * .9 });
        }
      });
    }

    return () => gaps.forEach(g => g.remove());
  });

  /* ---------- Línea de tiempo vertical ---------- */
  $$('[data-timeline]').forEach(tl => {
    const fill = $('.timeline__fill', tl);
    const hitos = $$('.hito', tl);
    if (REDUCE) {
      gsap.set(fill, { scaleY: 1 });
      hitos.forEach(h => h.classList.add('is-active'));
      return;
    }
    gsap.fromTo(fill, { scaleY: 0 }, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: tl, start: 'top 65%', end: 'bottom 65%', scrub: 1.4 }
    });
    hitos.forEach(h => ScrollTrigger.create({
      trigger: h,
      start: 'top 65%',
      onEnter: () => h.classList.add('is-active'),
      onLeaveBack: () => h.classList.remove('is-active')
    }));
  });

  /* ---------- Solapas ---------- */
  $$('[data-tabs]').forEach(nav => {
    const bar = $('.tabs-pr__bar', nav);
    const move = (btn, instant) => {
      if (!btn || !bar) return;
      gsap.to(bar, { x: btn.offsetLeft, width: btn.offsetWidth, duration: instant || REDUCE ? 0 : 1.1, ease: 'power3.inOut' });
    };
    const current = () => $('.active', nav);
    $$('[data-bs-toggle="tab"]', nav).forEach(btn => {
      btn.addEventListener('show.bs.tab', () => move(btn));
      btn.addEventListener('shown.bs.tab', () => {
        if (REDUCE) return;
        const pane = $(btn.dataset.bsTarget);
        gsap.fromTo($$('[data-pane-item]', pane), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1.4, stagger: .12 });
        ScrollTrigger.refresh();
      });
    });
    fontsReady.then(() => move(current(), true));
    addEventListener('resize', () => move(current(), true));
  });

  /* ---------- Entradas con deslizamiento suave ---------- */
  $$('[data-slide]').forEach(el => {
    if (REDUCE) return;
    const dir = el.dataset.slide === 'right' ? 1 : -1;
    gsap.fromTo(el, { x: dir * 80, autoAlpha: 0 }, {
      x: 0, autoAlpha: 1, duration: 2, ease: 'power3.out', delay: parseFloat(el.dataset.delay || 0),
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
    });
  });

  /* ---------- Discografía: carrusel continuo que frena en hover ---------- */
  $$('[data-carousel]').forEach(c => {
    if (REDUCE) return;
    c.classList.add('is-auto');
    const track = $('.disco__track', c);
    const group = $('.disco__group', c);
    const setX = gsap.quickSetter(track, 'x', 'px');
    const base = parseFloat(c.dataset.speed || 38);
    const st = { v: base };
    let x = 0, w = group.offsetWidth;
    gsap.ticker.add((t, dt) => {
      x = gsap.utils.wrap(-w, 0, x - st.v * dt / 1000);
      setX(x);
    });
    const viewport = $('.disco__viewport', c);
    const brake = () => gsap.to(st, { v: 0, duration: .7, ease: 'power2.out', overwrite: true });
    const go = () => gsap.to(st, { v: base, duration: 1.8, ease: 'power2.inOut', overwrite: true });
    viewport.addEventListener('pointerenter', brake);
    viewport.addEventListener('pointerleave', go);
    viewport.addEventListener('focusin', brake);
    viewport.addEventListener('focusout', go);
    addEventListener('resize', () => { w = group.offsetWidth; });
  });

  /* ---------- Volver arriba ---------- */
  $$('[data-top]').forEach(b => b.addEventListener('click', () => {
    lenis ? lenis.scrollTo(0, { duration: 2.2 }) : scrollTo({ top: 0, behavior: REDUCE ? 'auto' : 'smooth' });
  }));

  /* ---------- Arranque ---------- */
  fontsReady.then(() => {
    fitAll();
    ScrollTrigger.refresh();
    curtainOut().add(() => intro.play(), REDUCE ? 0 : '-=.8');
  });

  let rT;
  addEventListener('resize', () => {
    clearTimeout(rT);
    rT = setTimeout(() => { fitAll(); ScrollTrigger.refresh(); }, 200);
  });
})();
