/* =========================================================
   CONTACTO — contacto.js (solo contacto.html)
   Validación del formulario + contador de caracteres
   ========================================================= */
(() => {
  'use strict';
  const form = document.getElementById('form-contacto');
  if (!form) return;

  const campos = {
    nombre:  { min: 3,  vacio: 'Ingresá tu nombre y apellido.', corto: 'Debe tener al menos 3 caracteres.' },
    email:   { vacio: 'Ingresá tu correo electrónico.', formato: 'Ingresá un correo electrónico válido.' },
    motivo:  { vacio: 'Seleccioná un motivo de contacto.' },
    mensaje: { min: 15, vacio: 'Escribí tu mensaje.', corto: 'Debe tener al menos 15 caracteres.' }
  };

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const mensaje = document.getElementById('mensaje');
  const contador = document.getElementById('contador-caracteres');
  const exito = document.getElementById('mensaje-exito');

  function actualizarContador() {
    if (!mensaje || !contador) return;
    contador.textContent = `${mensaje.value.length} / 500 caracteres`;
  }
  mensaje && mensaje.addEventListener('input', actualizarContador);

  function validarCampo(id) {
    const el = document.getElementById(id);
    const err = document.getElementById('error-' + id);
    const cfg = campos[id];
    if (!el) return true;
    const val = el.value.trim();
    let msg = '';

    if (!val) msg = cfg.vacio;
    else if (id === 'email' && !emailRe.test(val)) msg = cfg.formato;
    else if (cfg.min && val.length < cfg.min) msg = cfg.corto;

    if (msg) {
      el.classList.add('is-invalid');
      if (err) err.textContent = msg;
      return false;
    }
    el.classList.remove('is-invalid');
    if (err) err.textContent = '';
    return true;
  }

  Object.keys(campos).forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur', () => validarCampo(id));
    el.addEventListener('input', () => { if (el.classList.contains('is-invalid')) validarCampo(id); });
    el.addEventListener('change', () => { if (el.classList.contains('is-invalid')) validarCampo(id); });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const ok = Object.keys(campos).map(validarCampo).every(Boolean);

    if (!ok) {
      exito && exito.classList.add('d-none');
      const primerError = form.querySelector('.is-invalid');
      if (primerError) primerError.focus();
      return;
    }

    exito && exito.classList.remove('d-none');
    form.reset();
    actualizarContador();
    exito && exito.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
})();