// public/js/booking.js
document.addEventListener('DOMContentLoaded', () => {
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

  function showStep(n) {
    for (let i = 1; i <= 4; i++) {
      const el = document.getElementById('step-' + i);
      if (el) el.style.display = (i === n ? 'block' : 'none');
    }
    state.step = n;
    backBtn.disabled = n === 1;
    nextBtn.innerText = (n === 4) ? 'Confirmar' : 'Siguiente';
    updateNextState();
  }

  function updateNextState() {
    if (state.step === 1) nextBtn.disabled = !(state.service && state.barber);
    else if (state.step === 2) nextBtn.disabled = !state.date;
    else if (state.step === 3) nextBtn.disabled = !state.start;
    else nextBtn.disabled = false;
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
    confHora.innerText = state.start ? state.start.substr(0,5) : '-';
  }

  serviceItems.forEach(it => {
    it.addEventListener('click', () => {
      serviceItems.forEach(x => x.classList.remove('selected'));
      it.classList.add('selected');
      const id = parseInt(it.dataset.serviceId, 10);
      const name = it.querySelector('strong') ? it.querySelector('strong').innerText.trim() : '';
      const duration = parseInt(it.dataset.duracion || '30', 10);
      const price = it.dataset.precio || '';
      state.service = { id, name, duration, price };
      miniServicio.innerText = name;
      duracionLabel.innerText = duration + ' min';
      updateNextState();
    });
  });

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

  backBtn.addEventListener('click', () => { if (state.step > 1) gotoStep(state.step - 1); });

  nextBtn.addEventListener('click', () => {
    if (state.step < 4) {
      if (state.step === 1 && !(state.service && state.barber)) return alert('Elegí servicio y barbero');
      if (state.step === 2 && !state.date) return alert('Elegí una fecha');
      if (state.step === 3 && !state.start) return alert('Elegí un horario');
      gotoStep(state.step + 1);
      return;
    }

    // Confirmar y reservar
    const nameInput = document.getElementById('input-nombre').value.trim();
    if (!nameInput) return alert('Ingresá tu nombre');
    state.name = nameInput;

    const fd = new FormData();
    fd.append('date', state.date);
    fd.append('barber_id', state.barber.id);
    fd.append('service_id', state.service.id);
    fd.append('start', normalizeTime(state.start)); // HH:MM:SS

    // Si pasamos test_client_id desde la vista lo incluimos para pruebas
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
        alert('Reserva confirmada 👍 (cita_id: ' + (j.cita_id || '-') + ')');
        window.location.reload();
      }).catch(() => {
        nextBtn.disabled = false;
        alert('Error de conexión');
      });
  });

  if (inputFecha) {
    inputFecha.addEventListener('change', (e) => {
      state.date = e.target.value; // YYYY-MM-DD
      miniFecha.innerText = state.date || '-';
      updateNextState();
      if (state.service && state.barber) fetchSlots();
    });
  }
    // pide al backend solo para obtener el 'base' (intervalo) para mostrar en la UI
  function fetchIntervalForPreview(barberId, date, serviceId = null) {
    const fd = new FormData();
    fd.append('date', date);
    fd.append('barber_id', barberId);
    // si no hay servicio, podés mandar service_id vacío; backend debería devolver base si encuentra horario
    if (serviceId) fd.append('service_id', serviceId);

    fetch('/booking/slots', { method: 'POST', body: fd })
      .then(r => r.json())
      .then(json => {
        const intervalLabelEl = document.getElementById('interval-label');
        if (json && typeof json.base !== 'undefined' && json.base !== null) {
          intervalLabelEl.innerText = json.base + ' min';
        } else {
          intervalLabelEl.innerText = '—';
        }
      }).catch(() => {
        document.getElementById('interval-label').innerText = '—';
      });
  }


  function fetchSlots() {
    if (!state.date || !state.barber || !state.service) {
      timesContainer.innerHTML = '<div class="muted">Elegí servicio, barbero y fecha</div>';
      // si hay barber pero falta fecha, podemos pedir la info usando hoy como fecha de muestra:
      if (state.barber && !state.date) {
        // usar fecha hoy sólo para mostrar intervalo base
        const today = new Date().toISOString().slice(0,10);
        fetchIntervalForPreview(state.barber.id, today, state.service ? state.service.id : null);
      } else {
        // si no hay barber o servicio, seteamos label por defecto
        document.getElementById('interval-label').innerText = '—';
      }
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
        // actualizar el label del intervalo con lo que devuelve el servidor
        const intervalLabelEl = document.getElementById('interval-label');
        if (json && typeof json.base !== 'undefined' && json.base !== null) {
          intervalLabelEl.innerText = json.base + ' min';
        } else {
          intervalLabelEl.innerText = '—';
        }

        if (json.message && (!json.intervals || json.intervals.length === 0)) {
          timesContainer.innerHTML = '<div class="muted">' + (json.message || 'No hay horarios') + '</div>';
          return;
        }
        renderTimes(json.intervals || []);
      }).catch(() => {
        timesContainer.innerHTML = '<div class="muted">Error al cargar horarios</div>';
        document.getElementById('interval-label').innerText = '—';
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
      const displayStart = (slot.start || '').length >= 5 ? slot.start.substr(0,5) : slot.start;
      const displayEnd = (slot.end || '').length >= 5 ? slot.end.substr(0,5) : slot.end;
      btn.innerText = displayStart + ' - ' + displayEnd;
      if (slot.available) {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.time-btn').forEach(x => x.classList.remove('selected'));
          btn.classList.add('selected');
          state.start = slot.start; // keep HH:MM:SS if server returns it
          miniHora.innerText = displayStart;
          updateNextState();
        });
      }
      timesContainer.appendChild(btn);
    });
  }

  function normalizeTime(t) {
    if (!t) return '';
    const parts = t.split(':').map(p => p.trim());
    if (parts.length === 2) return `${parts[0].padStart(2,'0')}:${parts[1].padStart(2,'0')}:00`;
    if (parts.length === 3) return `${parts[0].padStart(2,'0')}:${parts[1].padStart(2,'0')}:${parts[2].padStart(2,'0')}`;
    return t;
  }

  showStep(1);
});
