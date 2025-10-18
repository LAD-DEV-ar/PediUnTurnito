// public/js/booking.js
document.addEventListener('DOMContentLoaded', () => {
  // Elementos
  const serviceItems = document.querySelectorAll('[data-service-id]');
  const barberItems  = document.querySelectorAll('[data-barber-id]');
  const inputFecha = document.getElementById('input-fecha');
  const timesContainer = document.getElementById('times-container');
  const nextBtn = document.getElementById('next-btn');
  const backBtn = document.getElementById('back-btn');

  const miniServicio = document.getElementById('mini-servicio');
  const miniBarbero  = document.getElementById('mini-barbero');
  const miniFecha    = document.getElementById('mini-fecha');
  const miniHora     = document.getElementById('mini-hora');

  const duracionLabel = document.getElementById('duracion-label');
  const selectedBarberoLabel = document.getElementById('selected-barbero-label');

  const confServicio = document.getElementById('conf-servicio');
  const confBarbero  = document.getElementById('conf-barbero');
  const confFecha    = document.getElementById('conf-fecha');
  const confHora     = document.getElementById('conf-hora');

  let state = { step: 1, service: null, barber: null, date: null, start: null, name: '' };

  // Helpers
  function showStep(n) {
    for (let i = 1; i <= 4; i++) {
      const el = document.getElementById('step-' + i);
      if (el) el.style.display = (i === n ? 'block' : 'none');
    }
    state.step = n;
    backBtn.disabled = n === 1;
    nextBtn.innerText = (n === 4) ? 'Confirmar' : 'Siguiente';
    // enable/disable next button according to current step state
    updateNextState();
  }

  function updateNextState() {
    if (state.step === 1) {
      nextBtn.disabled = !(state.service && state.barber);
    } else if (state.step === 2) {
      nextBtn.disabled = !state.date;
    } else if (state.step === 3) {
      nextBtn.disabled = !state.start;
    } else {
      nextBtn.disabled = false;
    }
  }

  function gotoStep(n) {
    showStep(n);
    if (n === 3) fetchSlots();
    if (n === 4) fillConfirmation();
  }

  function fillConfirmation() {
    confServicio.innerText = state.service ? state.service.name : '-';
    confBarbero.innerText = state.barber ? state.barber.name : '-';
    confFecha.innerText = state.date || '-';
    confHora.innerText = state.start || '-';
  }

  // Selección de servicio
  serviceItems.forEach(it => {
    it.addEventListener('click', () => {
      serviceItems.forEach(x => x.classList.remove('selected'));
      it.classList.add('selected');

      const id = parseInt(it.dataset.serviceId, 10);
      const name = it.querySelector('strong') ? it.querySelector('strong').innerText.trim() : (it.dataset.nombre || '');
      const duration = parseInt(it.dataset.duracion || it.dataset.duration || '30', 10);
      const price = it.dataset.precio || it.dataset.price || '';

      state.service = { id, name, duration, price };

      miniServicio.innerText = name;
      duracionLabel.innerText = duration + ' min';
      updateNextState();
    });
  });

  // Selección de barbero
  barberItems.forEach(it => {
    it.addEventListener('click', () => {
      barberItems.forEach(x => x.classList.remove('selected'));
      it.classList.add('selected');

      const id = parseInt(it.dataset.barberId, 10);
      const name = it.dataset.nombre || (it.querySelector('strong') ? it.querySelector('strong').innerText.trim() : '');

      state.barber = { id, name };
      miniBarbero.innerText = name;
      selectedBarberoLabel.innerText = name;
      updateNextState();
    });
  });

  // Navegación
  backBtn.addEventListener('click', () => {
    if (state.step > 1) gotoStep(state.step - 1);
  });

  nextBtn.addEventListener('click', () => {
    if (state.step < 4) {
      // validations per step
      if (state.step === 1 && !(state.service && state.barber)) return alert('Elegí servicio y barbero');
      if (state.step === 2 && !state.date) return alert('Elegí una fecha');
      if (state.step === 3 && !state.start) return alert('Elegí un horario');
      gotoStep(state.step + 1);
      return;
    }

    // step 4 -> confirm and reserve
    const nameInput = document.getElementById('input-nombre').value.trim();
    if (!nameInput) return alert('Ingresá tu nombre');
    state.name = nameInput;

    const fd = new FormData();
    fd.append('date', state.date);
    fd.append('barber_id', state.barber.id);
    fd.append('service_id', state.service.id);
    // Ensure start includes seconds HH:MM:SS
    fd.append('start', normalizeTime(state.start));
    // If user is not logged, backend accepts client_id for testing; otherwise it will use session
    if (window.__BOOKING_DATA && window.__BOOKING_DATA.test_client_id) {
      fd.append('client_id', window.__BOOKING_DATA.test_client_id);
    }
    fd.append('name', state.name);

    nextBtn.disabled = true;
    fetch('/booking/reserve', { method: 'POST', body: fd })
      .then(async r => {
        nextBtn.disabled = false;
        if (!r.ok) {
          let err = {};
          try { err = await r.json(); } catch(e) {}
          return alert(err.error || 'Error al reservar');
        }
        const j = await r.json();
        alert('Reserva confirmada 👍');
        window.location.reload();
      }).catch(() => {
        nextBtn.disabled = false;
        alert('Error de conexión');
      });
  });

  // Fecha change
  if (inputFecha) {
    inputFecha.addEventListener('change', (e) => {
      state.date = e.target.value;
      miniFecha.innerText = state.date || '-';
      updateNextState();
      // If we already have barber + service, fetch slots
      if (state.service && state.barber) fetchSlots();
    });
  }

  // Fetch slots from backend
  function fetchSlots() {
    if (!state.date || !state.barber || !state.service) {
      timesContainer.innerHTML = '<div class="muted">Elegí servicio, barbero y fecha</div>';
      return;
    }
    const fd = new FormData();
    fd.append('date', state.date);
    fd.append('barber_id', state.barber.id);
    fd.append('service_id', state.service.id);

    timesContainer.innerHTML = 'Cargando...';
    fetch('/booking/slots', { method: 'POST', body: fd })
      .then(r => r.json())
      .then(json => {
        if (json.message && json.intervals && json.intervals.length === 0) {
          timesContainer.innerHTML = '<div class="muted">' + (json.message || 'No hay horarios') + '</div>';
          return;
        }
        renderTimes(json.intervals || []);
      }).catch(() => {
        timesContainer.innerHTML = '<div class="muted">Error al cargar horarios</div>';
      });
  }

  function renderTimes(intervals) {
    timesContainer.innerHTML = '';
    state.start = null;
    miniHora.innerText = '-';
    intervals.forEach(slot => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'time-btn' + (slot.available ? '' : ' disabled');
      // display HH:MM (sin segundos) para el usuario
      const displayStart = slot.start.length > 5 ? slot.start.substr(0,5) : slot.start;
      const displayEnd = slot.end.length > 5 ? slot.end.substr(0,5) : slot.end;
      btn.innerText = displayStart + ' - ' + displayEnd;

      if (slot.available) {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.time-btn').forEach(x => x.classList.remove('selected'));
          btn.classList.add('selected');
          state.start = slot.start; // keep the backend format (HH:MM:SS) if provided
          miniHora.innerText = displayStart;
          updateNextState();
        });
      }
      timesContainer.appendChild(btn);
    });
  }

  // Normaliza 'HH:MM' o 'HH:MM:SS' a 'HH:MM:SS'
  function normalizeTime(t) {
    if (!t) return '';
    const parts = t.split(':');
    if (parts.length === 2) return `${parts[0].padStart(2,'0')}:${parts[1].padStart(2,'0')}:00`;
    if (parts.length === 3) return `${parts[0].padStart(2,'0')}:${parts[1].padStart(2,'0')}:${parts[2].padStart(2,'0')}`;
    return t;
  }

  // Inicial
  showStep(1);
});
