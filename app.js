/* ============================================
   GreenCare Pro – JavaScript Principal
   ============================================ */

// ========== NAVBAR SCROLL ==========
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ========== HAMBURGER ==========
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  hamburger.classList.toggle('active');
});
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navLinks.classList.remove('open');
}));

// ========== SCROLL REVEAL ==========
function initReveal() {
  const els = document.querySelectorAll(
    '.service-card, .why-item, .contact-card, .mini-review, .price-table-wrap, .quote-form-card, .quote-result-card'
  );
  els.forEach(el => el.classList.add('reveal'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
}
document.addEventListener('DOMContentLoaded', initReveal);

// ========== SET MIN DATE ==========
document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('booking-fecha');
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split('T')[0];
    dateInput.value = tomorrow.toISOString().split('T')[0];
  }
});

// ========== COTIZACIÓN CALCULATOR ==========
const precios = {
  corte_jardin:   { nombre: 'Corte de Jardín',        base: 299,  perM2: 1.5  },
  corte_arboles:  { nombre: 'Corte de Árboles',       base: 899,  perM2: 3.0  },
  poda_setos:     { nombre: 'Poda de Setos',           base: 399,  perM2: 1.8  },
  diseno:         { nombre: 'Diseño de Jardines',      base: 2500, perM2: 6.0  },
  riego:          { nombre: 'Sistema de Riego',        base: 1800, perM2: 4.5  },
  fertilizacion:  { nombre: 'Fertilización y Siembra', base: 499,  perM2: 1.2  },
  limpieza:       { nombre: 'Limpieza Profunda',       base: 350,  perM2: 1.0  },
  mantenimiento:  { nombre: 'Mantenimiento Integral',  base: 599,  perM2: 2.0  },
};

let lastQuoteService = '';

function calcularCotizacion() {
  const svcKey  = document.getElementById('q-servicio').value;
  const area    = parseInt(document.getElementById('q-area').value) || 100;
  const freqEl  = document.querySelector('input[name="freq"]:checked');
  const freq    = freqEl ? parseFloat(freqEl.value) : 1;
  const extras  = (document.getElementById('extra-retiro').checked ? 150 : 0)
                + (document.getElementById('extra-urgente').checked ? 200 : 0)
                + (document.getElementById('extra-foto').checked    ? 99  : 0);

  // Update area label
  document.getElementById('q-area-val').textContent = `${area} m²`;

  const placeholder = document.getElementById('quote-placeholder');
  const details     = document.getElementById('quote-details');

  if (!svcKey) {
    placeholder.style.display = 'block';
    details.style.display = 'none';
    return;
  }

  const svc    = precios[svcKey];
  const base   = svc.base + (area * svc.perM2);
  const descuento = (1 - freq);
  const descAmt   = Math.round(base * descuento);
  const afterDisc = base - descAmt;
  const total     = Math.round(afterDisc + extras);
  lastQuoteService = svc.nombre;

  // Show details
  placeholder.style.display = 'none';
  details.style.display = 'block';

  document.getElementById('r-svc-name').textContent = svc.nombre;
  document.getElementById('r-area').textContent = `Área: ${area} m²`;
  document.getElementById('r-base').textContent = `$${Math.round(base).toLocaleString('es-MX')}`;

  if (descAmt > 0) {
    document.getElementById('r-desc').textContent = `-$${descAmt.toLocaleString('es-MX')}`;
  } else {
    document.getElementById('r-desc').textContent = '—';
  }

  const extrasRow = document.getElementById('r-extras-row');
  if (extras > 0) {
    extrasRow.style.display = 'flex';
    document.getElementById('r-extras').textContent = `+$${extras.toLocaleString('es-MX')}`;
  } else {
    extrasRow.style.display = 'none';
  }

  document.getElementById('r-total').textContent = `$${total.toLocaleString('es-MX')} MXN`;
}

function agendarDesdeQuote() {
  if (lastQuoteService) {
    abrirAgendar(lastQuoteService);
  } else {
    document.getElementById('agendar').scrollIntoView({ behavior: 'smooth' });
  }
}

// ========== MODAL ==========
let selectedService = '';

function abrirAgendar(servicio) {
  selectedService = servicio;
  document.getElementById('modal-svc-title').textContent = servicio;
  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function cerrarModal(event) {
  if (event.target === document.getElementById('modal-overlay')) {
    cerrarModalBtn();
  }
}

function cerrarModalBtn() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function irAFormulario() {
  cerrarModalBtn();
  // Pre-select the service in the booking form
  const radios = document.querySelectorAll('input[name="booking-service"]');
  radios.forEach(r => {
    const label = r.closest('.svc-option');
    if (r.value === selectedService) {
      r.checked = true;
      label.classList.add('selected');
    } else {
      label.classList.remove('selected');
    }
  });
  setTimeout(() => {
    document.getElementById('agendar').scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

// ========== BOOKING FORM STEPS ==========
let currentStep = 1;
let selectedTime = '';

function nextStep(step) {
  // Validation
  if (step === 2) {
    const svc = document.querySelector('input[name="booking-service"]:checked');
    if (!svc) { showToast('⚠️ Por favor selecciona un servicio'); return; }
  }
  if (step === 3) {
    const fecha = document.getElementById('booking-fecha').value;
    if (!fecha) { showToast('⚠️ Selecciona una fecha para tu cita'); return; }
    if (!selectedTime) { showToast('⚠️ Selecciona un horario'); return; }
  }
  goToStep(step);
}

function prevStep(step) {
  goToStep(step);
}

function goToStep(step) {
  // Hide current
  document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));

  // Show target
  document.getElementById(`form-step-${step}`).classList.add('active');
  const indicator = document.getElementById(`step${step}-indicator`);
  if (indicator) indicator.classList.add('active');

  // Mark done
  for (let i = 1; i < step; i++) {
    const ind = document.getElementById(`step${i}-indicator`);
    if (ind) ind.classList.add('done');
  }

  currentStep = step;
  document.getElementById('booking-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function selectTime(btn) {
  document.querySelectorAll('.time-slot').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedTime = btn.dataset.time;
}

// Service option selection UI
document.addEventListener('DOMContentLoaded', () => {
  const opts = document.querySelectorAll('.svc-option');
  opts.forEach(opt => {
    opt.addEventListener('click', () => {
      opts.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });
});

// ========== CONFIRM BOOKING ==========
function confirmarCita() {
  const nombre = document.getElementById('booking-nombre').value.trim();
  const tel    = document.getElementById('booking-tel').value.trim();
  const email  = document.getElementById('booking-email').value.trim();
  const dir    = document.getElementById('booking-direccion').value.trim();
  const ciudad = document.getElementById('booking-ciudad').value.trim();
  const cp     = document.getElementById('booking-cp').value.trim();

  if (!nombre) { showToast('⚠️ Ingresa tu nombre completo'); return; }
  if (!tel)    { showToast('⚠️ Ingresa tu teléfono'); return; }
  if (!email || !email.includes('@')) { showToast('⚠️ Ingresa un correo válido'); return; }
  if (!dir)    { showToast('⚠️ Ingresa tu dirección'); return; }
  if (!ciudad) { showToast('⚠️ Ingresa tu ciudad'); return; }
  if (!cp)     { showToast('⚠️ Ingresa tu código postal'); return; }

  const svc    = document.querySelector('input[name="booking-service"]:checked')?.value || '—';
  const area   = document.getElementById('booking-area').value || '—';
  const fecha  = document.getElementById('booking-fecha').value;
  const urgencia = document.getElementById('booking-urgencia').value;
  const notas  = document.getElementById('booking-notas').value;

  const fechaFmt = fecha ? new Date(fecha + 'T12:00:00').toLocaleDateString('es-MX', { weekday:'long', year:'numeric', month:'long', day:'numeric' }) : '—';
  const urgencias = { normal: 'Normal', urgente: 'Urgente (+$200)', express: 'Express (+$400)' };

  // Build confirmation folio
  const folio = 'GC-' + Date.now().toString().slice(-6);

  document.getElementById('confirm-summary').innerHTML = `
    <strong>Folio:</strong> ${folio}<br/>
    <strong>Servicio:</strong> ${svc}<br/>
    <strong>Área:</strong> ${area !== '—' ? area + ' m²' : 'No especificada'}<br/>
    <strong>Fecha:</strong> ${fechaFmt}<br/>
    <strong>Horario:</strong> ${selectedTime || '—'}<br/>
    <strong>Urgencia:</strong> ${urgencias[urgencia] || urgencia}<br/>
    <strong>Cliente:</strong> ${nombre}<br/>
    <strong>Teléfono:</strong> ${tel}<br/>
    <strong>Email:</strong> ${email}<br/>
    <strong>Domicilio:</strong> ${dir}, ${ciudad} CP ${cp}<br/>
    ${notas ? `<strong>Notas:</strong> ${notas}` : ''}
  `;

  // Store for download
  window._lastBooking = { folio, svc, area, fechaFmt, horario: selectedTime, nombre, tel, email, dir, ciudad, cp, urgencia, notas };

  goToStep(4);
  document.getElementById('step4-indicator').classList.add('active');
  showToast('✅ ¡Cita confirmada exitosamente!');
}

// ========== DOWNLOAD RECEIPT ==========
function descargarComprobante() {
  const b = window._lastBooking;
  if (!b) return;
  const urgencias = { normal: 'Normal', urgente: 'Urgente (+$200)', express: 'Express (+$400)' };
  const texto = [
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '       🌿 GREENCARE PRO – COMPROBANTE',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    `Folio:         ${b.folio}`,
    `Fecha emisión: ${new Date().toLocaleString('es-MX')}`,
    '',
    '── SERVICIO ──────────────────────────────',
    `Servicio:      ${b.svc}`,
    `Área:          ${b.area !== '—' ? b.area + ' m²' : 'No especificada'}`,
    `Urgencia:      ${urgencias[b.urgencia] || b.urgencia}`,
    b.notas ? `Notas:         ${b.notas}` : '',
    '',
    '── CITA ──────────────────────────────────',
    `Fecha:         ${b.fechaFmt}`,
    `Horario:       ${b.horario || '—'}`,
    '',
    '── DATOS DEL CLIENTE ────────────────────',
    `Nombre:        ${b.nombre}`,
    `Teléfono:      ${b.tel}`,
    `Email:         ${b.email}`,
    `Domicilio:     ${b.dir}`,
    `Ciudad:        ${b.ciudad}   CP: ${b.cp}`,
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    'Te contactaremos en menos de 2 horas para',
    'confirmar tu cita. ¡Gracias por confiar en',
    'GreenCare Pro! 🌿',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '',
    'hola@greencarepro.mx | +52 55 0000 0000',
  ].join('\n');

  const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `comprobante-${b.folio}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('📄 Comprobante descargado');
}

// ========== NEW BOOKING ==========
function nuevaCita() {
  // Reset form
  document.getElementById('booking-form').reset();
  document.querySelectorAll('.svc-option').forEach(o => o.classList.remove('selected'));
  document.querySelectorAll('.time-slot').forEach(t => t.classList.remove('selected'));
  selectedTime = '';
  window._lastBooking = null;

  // Reset step indicators
  document.querySelectorAll('.step').forEach(s => { s.classList.remove('active', 'done'); });
  goToStep(1);
}

// ========== TOAST ==========
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
}

// ========== NEWSLETTER ==========
function suscribir() {
  const email = document.getElementById('newsletter-email').value.trim();
  if (!email || !email.includes('@')) {
    showToast('⚠️ Ingresa un correo válido');
    return;
  }
  document.getElementById('newsletter-email').value = '';
  showToast('✅ ¡Suscripción exitosa! Pronto recibirás consejos.');
}

// ========== ACTIVE NAV LINK ON SCROLL ==========
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY + 100;
  sections.forEach(sec => {
    const top = sec.offsetTop;
    const h   = sec.offsetHeight;
    const id  = sec.getAttribute('id');
    const link = document.querySelector(`.nav-link[href="#${id}"]`);
    if (link) {
      link.style.color = (scrollY >= top && scrollY < top + h) ? 'var(--green-400)' : '';
    }
  });
});

// ========== INIT QUOTE ON LOAD ==========
document.addEventListener('DOMContentLoaded', () => {
  // Set up area range event
  const areaRange = document.getElementById('q-area');
  if (areaRange) {
    areaRange.addEventListener('input', calcularCotizacion);
  }
});
