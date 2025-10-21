// public/js/admin.js
document.addEventListener('DOMContentLoaded', () => {
  // Tabs
  document.querySelectorAll('.admin-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
      const tab = btn.dataset.tab;
      const el = document.getElementById('tab-' + tab);
      if (el) el.style.display = 'block';
      // cargar datos del tab
      if (tab === 'barberias') loadBarberias();
      if (tab === 'servicios') loadServicios();
      if (tab === 'horarios') loadHorarios();
      if (tab === 'barberos') loadBarberos();
      if (tab === 'turnos') loadTurnos();
      if (tab === 'citas') loadCitas();
    });
  });

  // initial tab
  document.querySelector('.admin-tab')?.click();

  // ---------- Barberias ----------
  const barberiasList = document.getElementById('barberias-list');
  const barberiaFormWrap = document.getElementById('barberia-form-wrap');
  document.getElementById('btn-new-barberia').addEventListener('click', () => {
    showBarberiaForm();
  });
  document.getElementById('barberia-cancel').addEventListener('click', (e) => { barberiaFormWrap.style.display = 'none'; });

  document.getElementById('barberia-save').addEventListener('click', () => {
    const id = document.getElementById('barberia-id').value;
    const nombre = document.getElementById('barberia-nombre').value;
    const localidad = document.getElementById('barberia-localidad').value;
    const calle = document.getElementById('barberia-calle').value;
    const altura = document.getElementById('barberia-altura').value;
    const fd = new FormData();
    if (id) fd.append('id', id);
    fd.append('nombre', nombre); fd.append('localidad', localidad); fd.append('calle', calle); fd.append('altura', altura);
    fetch('/admin/barberia/save', { method:'POST', body: fd }).then(r => r.json()).then(json => {
      if (json.error) return alert(json.error);
      barberiaFormWrap.style.display = 'none';
      loadBarberias();
      populateBarberiaSelects();
    }).catch(()=>alert('Error al guardar'));
  });

  function loadBarberias() {
    barberiasList.innerHTML = 'Cargando...';
    fetch('/admin/barberia/list', { method: 'POST' }).then(r => r.json()).then(json => {
      barberiasList.innerHTML = '';
      (json.items || []).forEach(b => {
        const d = document.createElement('div');
        d.className = 'item';
        d.innerHTML = `<div style="flex:1"><strong>${escapeHtml(b.nombre)}</strong><div class="mini">${escapeHtml(b.localidad || '')} — ${escapeHtml((b.calle||'')+' '+(b.altura||''))}</div></div>
          <div style="display:flex;gap:8px">
            <button class="btn ghost btn-edit-barberia" data-id="${b.id}">Editar</button>
            <button class="btn ghost btn-delete-barberia" data-id="${b.id}">Eliminar</button>
          </div>`;
        barberiasList.appendChild(d);
      });
      // listeners
      document.querySelectorAll('.btn-edit-barberia').forEach(btn => btn.addEventListener('click', (e) => {
        const id = btn.dataset.id; editBarberia(id);
      }));
      document.querySelectorAll('.btn-delete-barberia').forEach(btn => btn.addEventListener('click', (e) => {
        if (!confirm('Eliminar barbería?')) return;
        const fd = new FormData(); fd.append('id', btn.dataset.id);
        fetch('/admin/barberia/delete', { method:'POST', body: fd }).then(r=>r.json()).then(json=>{
          if (json.error) return alert(json.error);
          loadBarberias(); populateBarberiaSelects();
        });
      }));
    }).catch(()=>barberiasList.innerHTML='Error al cargar');
  }

  function showBarberiaForm(data = null) {
    document.getElementById('barberia-form-wrap').style.display = 'block';
    document.getElementById('barberia-id').value = data ? data.id : '';
    document.getElementById('barberia-nombre').value = data ? data.nombre : '';
    document.getElementById('barberia-localidad').value = data ? data.localidad : '';
    document.getElementById('barberia-calle').value = data ? data.calle : '';
    document.getElementById('barberia-altura').value = data ? data.altura : '';
    document.getElementById('barberia-form-title').innerText = data ? 'Editar barbería' : 'Nueva barbería';
  }

  function editBarberia(id) {
    // obtener datos desde el listado (simple approach: reload and find)
    fetch('/admin/barberia/list', { method:'POST' }).then(r=>r.json()).then(json=>{
      const item = (json.items || []).find(x => String(x.id) === String(id));
      if (item) showBarberiaForm(item);
    });
  }

  // ---------- Servicios ----------
  const serviciosList = document.getElementById('servicios-list');
  document.getElementById('btn-new-servicio').addEventListener('click', () => {
    document.getElementById('servicio-form-wrap').style.display = 'block';
    populateBarberiaSelects(); // ensure selects populated
  });
  document.getElementById('servicio-cancel').addEventListener('click', () => document.getElementById('servicio-form-wrap').style.display='none');
  document.getElementById('servicio-save').addEventListener('click', () => {
    const id = document.getElementById('servicio-id').value;
    const id_barberia = document.getElementById('servicio-barberia').value;
    const nombre = document.getElementById('servicio-nombre').value;
    const duracion = document.getElementById('servicio-duracion').value;
    const precio = document.getElementById('servicio-precio').value;
    const fd = new FormData();
    if (id) fd.append('id', id);
    fd.append('id_barberia', id_barberia);
    fd.append('nombre', nombre); fd.append('duracion_min', duracion); fd.append('precio', precio);
    fetch('/admin/servicio/save', { method:'POST', body: fd }).then(r=>r.json()).then(json=>{
      if (json.error) return alert(json.error);
      document.getElementById('servicio-form-wrap').style.display='none';
      loadServicios();
    }).catch(()=>alert('Error'));
  });

  function loadServicios() {
    serviciosList.innerHTML = 'Cargando...';
    const barberiaId = (document.getElementById('servicios-barberia-filter') || {}).value || '';
    const fd = new FormData();
    if (barberiaId) fd.append('id_barberia', barberiaId);

    // DEBUG: ver qué se está enviando
    console.debug('[loadServicios] id_barberia=', barberiaId);

    fetch('/admin/servicio/list', { method:'POST', body: fd })
      .then(r => r.json())
      .then(json => {
        serviciosList.innerHTML = '';
        const items = json.items || [];
        if (items.length === 0) {
          serviciosList.innerHTML = '<div class="muted">No hay servicios.</div>';
          return;
        }
        items.forEach(s => {
          const d = document.createElement('div');
          d.className = 'item';
          d.innerHTML = `<div style="flex:1"><strong>${escapeHtml(s.nombre)}</strong><div class="mini">${s.duracion_min} min · $${s.precio}</div></div>
            <div style="display:flex;gap:8px">
              <button class="btn ghost btn-edit-servicio" data-id="${s.id}">Editar</button>
              <button class="btn ghost btn-delete-servicio" data-id="${s.id}">Eliminar</button>
            </div>`;
          serviciosList.appendChild(d);
        });

        // listeners
        document.querySelectorAll('.btn-edit-servicio').forEach(b => b.addEventListener('click', e => editServicio(b.dataset.id)));
        document.querySelectorAll('.btn-delete-servicio').forEach(b => b.addEventListener('click', e => {
          if (!confirm('Eliminar servicio?')) return;
          const fd = new FormData(); fd.append('id', b.dataset.id);
          fetch('/admin/servicio/delete', { method:'POST', body: fd }).then(() => loadServicios());
        }));
      })
      .catch(err => {
        console.error('loadServicios error', err);
        serviciosList.innerHTML = 'Error al cargar servicios';
      });
  }

  function editServicio(id) {
    // Pedimos TODOS los servicios de forma simple y buscamos el que corresponde.
    // Esto evita pasar id_barberia vacío y confundir al servidor.
    fetch('/admin/servicio/list', { method: 'POST' })
      .then(r => r.json())
      .then(json => {
        const s = (json.items || []).find(x => String(x.id) === String(id));
        if (!s) return alert('Servicio no encontrado');
        document.getElementById('servicio-id').value = s.id;
        populateBarberiaSelects();
        // esperamos a que se populen selects (pequeña espera)
        setTimeout(() => {
          const sel = document.getElementById('servicio-barberia');
          if (sel) sel.value = s.id_barberia || '';
          document.getElementById('servicio-nombre').value = s.nombre || '';
          document.getElementById('servicio-duracion').value = s.duracion_min || '';
          document.getElementById('servicio-precio').value = s.precio || '';
          document.getElementById('servicio-form-wrap').style.display = 'block';
        }, 150);
      })
      .catch(err => {
        console.error('editServicio error', err);
        alert('Error al obtener servicio');
      });
  }

  // ---------- Horarios ----------
  const horariosList = document.getElementById('horarios-list');
  document.getElementById('btn-new-horario').addEventListener('click', () => { document.getElementById('horario-form-wrap').style.display='block'; populateBarberiaSelects(); });
  document.getElementById('horario-cancel').addEventListener('click', () => document.getElementById('horario-form-wrap').style.display='none');
  document.getElementById('horario-save').addEventListener('click', () => {
    const fd = new FormData();
    const id = document.getElementById('horario-id').value; if (id) fd.append('id', id);
    fd.append('id_barberia', document.getElementById('horario-barberia').value);
    fd.append('dia_semana', document.getElementById('horario-dia').value);
    fd.append('hora_apertura', document.getElementById('horario-apertura').value);
    fd.append('hora_cierre', document.getElementById('horario-cierre').value);
    fd.append('intervalo_min', document.getElementById('horario-intervalo').value);
    fetch('/admin/horario/save', { method:'POST', body: fd }).then(r=>r.json()).then(json=>{
      if (json.error) return alert(json.error);
      document.getElementById('horario-form-wrap').style.display='none';
      loadHorarios();
    }).catch(()=>alert('Error'));
  });

  function loadHorarios() {
    horariosList.innerHTML = 'Cargando...';
    const idb = document.getElementById('horarios-barberia-filter').value || '';
    const fd = new FormData(); if (idb) fd.append('id_barberia', idb);
    fetch('/admin/horario/list', { method:'POST', body: fd }).then(r=>r.json()).then(json=>{
      horariosList.innerHTML = '';
      (json.items||[]).forEach(h=>{
        const d = document.createElement('div'); d.className='item';
        d.innerHTML = `<div style="flex:1"><strong>${escapeHtml(h.dia_semana)}</strong><div class="mini">${h.hora_apertura} — ${h.hora_cierre} · ${h.intervalo_min} min</div></div>
          <div style="display:flex;gap:8px">
            <button class="btn ghost btn-edit-horario" data-id="${h.id}">Editar</button>
            <button class="btn ghost btn-delete-horario" data-id="${h.id}">Eliminar</button>
          </div>`;
        horariosList.appendChild(d);
      });
      document.querySelectorAll('.btn-edit-horario').forEach(b=>b.addEventListener('click',e=>editHorario(b.dataset.id)));
      document.querySelectorAll('.btn-delete-horario').forEach(b=>b.addEventListener('click',e=>{
        if (!confirm('Eliminar horario?')) return;
        const fd = new FormData(); fd.append('id', b.dataset.id);
        fetch('/admin/horario/delete', { method:'POST', body: fd }).then(r=>r.json()).then(json=> loadHorarios());
      }));
    }).catch(()=>horariosList.innerHTML='Error');
  }

  function editHorario(id) {
    const fd = new FormData(); fd.append('id_barberia','');
    fetch('/admin/horario/list', { method:'POST', body: fd }).then(r=>r.json()).then(json=>{
      const h = (json.items||[]).find(x=>String(x.id)===String(id));
      if (!h) return alert('No encontrado');
      document.getElementById('horario-id').value = h.id;
      populateBarberiaSelects();
      setTimeout(()=> {
        document.getElementById('horario-barberia').value = h.id_barberia;
        document.getElementById('horario-dia').value = h.dia_semana;
        document.getElementById('horario-apertura').value = h.hora_apertura;
        document.getElementById('horario-cierre').value = h.hora_cierre;
        document.getElementById('horario-intervalo').value = h.intervalo_min;
        document.getElementById('horario-form-wrap').style.display='block';
      }, 200);
    });
  }

  // ---------- Barberos ----------
  const barberosList = document.getElementById('barberos-list');
  document.getElementById('btn-new-barbero').addEventListener('click', () => { document.getElementById('barbero-form-wrap').style.display='block'; populateBarberiaSelects(); });
  document.getElementById('barbero-cancel').addEventListener('click', ()=>document.getElementById('barbero-form-wrap').style.display='none');
  document.getElementById('barbero-save').addEventListener('click', () => {
    const fd = new FormData();
    const id = document.getElementById('barbero-id').value; if (id) fd.append('id', id);
    fd.append('id_barberia', document.getElementById('barbero-barberia').value);
    fd.append('nombre', document.getElementById('barbero-nombre').value);
    fd.append('email', document.getElementById('barbero-email').value);
    fd.append('telefono', document.getElementById('barbero-telefono').value);
    fd.append('password', document.getElementById('barbero-password').value);
    fetch('/admin/barbero/save', { method:'POST', body: fd }).then(r=>r.json()).then(json=>{
      if (json.error) return alert(json.error);
      document.getElementById('barbero-form-wrap').style.display='none';
      loadBarberos();
    }).catch(()=>alert('Error'));
  });

  function loadBarberos() {
    barberosList.innerHTML = 'Cargando...';
    const idb = document.getElementById('barberos-barberia-filter').value || '';
    const fd = new FormData(); if (idb) fd.append('id_barberia', idb);
    fetch('/admin/barbero/list', { method:'POST', body: fd }).then(r=>r.json()).then(json=>{
      barberosList.innerHTML = '';
      (json.items||[]).forEach(u=>{
        const d = document.createElement('div'); d.className='item';
        d.innerHTML = `<div style="flex:1"><strong>${escapeHtml(u.nombre)}</strong><div class="mini">${escapeHtml(u.email||'')} · ${escapeHtml(u.telefono||'')}</div></div>
          <div style="display:flex;gap:8px">
            <button class="btn ghost btn-edit-barbero" data-id="${u.id}">Editar</button>
            <button class="btn ghost btn-delete-barbero" data-id="${u.id}">Eliminar</button>
          </div>`;
        barberosList.appendChild(d);
      });
      document.querySelectorAll('.btn-edit-barbero').forEach(b=>b.addEventListener('click',e=>editBarbero(b.dataset.id)));
      document.querySelectorAll('.btn-delete-barbero').forEach(b=>b.addEventListener('click',e=>{
        if (!confirm('Eliminar barbero?')) return;
        const fd = new FormData(); fd.append('id', b.dataset.id);
        fetch('/admin/barbero/delete', { method:'POST', body: fd }).then(r=>r.json()).then(json=> loadBarberos());
      }));
    }).catch(()=>barberosList.innerHTML='Error');
  }

  function editBarbero(id) {
    const fd = new FormData(); fd.append('id_barberia','');
    fetch('/admin/barbero/list', { method:'POST', body: fd }).then(r=>r.json()).then(json=>{
      const u = (json.items||[]).find(x=>String(x.id)===String(id));
      if (!u) return alert('No encontrado');
      populateBarberiaSelects();
      setTimeout(()=> {
        document.getElementById('barbero-id').value = u.id;
        document.getElementById('barbero-barberia').value = u.id_barberia;
        document.getElementById('barbero-nombre').value = u.nombre;
        document.getElementById('barbero-email').value = u.email;
        document.getElementById('barbero-telefono').value = u.telefono;
        document.getElementById('barbero-form-wrap').style.display='block';
      }, 200);
    });
  }

  // ---------- Turnos ----------
  const turnosList = document.getElementById('turnos-list');
  document.getElementById('turnos-refresh').addEventListener('click', loadTurnos);

  function loadTurnos() {
    turnosList.innerHTML = 'Cargando...';
    const fd = new FormData();
    const idb = document.getElementById('turnos-barberia-filter').value; if (idb) fd.append('id_barberia', idb);
    const idbr = document.getElementById('turnos-barbero-filter').value; if (idbr) fd.append('id_barbero', idbr);
    const f = document.getElementById('turnos-fecha-filter').value; if (f) fd.append('fecha', f);

    fetch('/admin/turnos/list', { method:'POST', body: fd }).then(r=>r.json()).then(json=>{
      turnosList.innerHTML = '';
      (json.items||[]).forEach(t=>{
        const d = document.createElement('div'); d.className='item';
        d.innerHTML = `<div style="flex:1"><strong>${t.fecha} ${t.hora_inicio}</strong><div class="mini">Barbero: ${escapeHtml(String(t.id_barbero))} · Estado: ${escapeHtml(t.estado)}</div></div>
          <div style="display:flex;gap:8px">
            <button class="btn ghost btn-mark-free" data-id="${t.id}">Marcar libre</button>
            <button class="btn ghost btn-mark-reserved" data-id="${t.id}">Marcar reservado</button>
          </div>`;
        turnosList.appendChild(d);
      });
      // attach handlers for marking (simple: request not implemented server-side; you can add endpoints)
      document.querySelectorAll('.btn-mark-free').forEach(b => b.addEventListener('click', () => {
        if (!confirm('Marcar este turno como libre?')) return;
        const fd = new FormData(); fd.append('id', b.dataset.id); fd.append('estado', 'libre');
        fetch('/admin/turnos/update', { method:'POST', body: fd }).then(()=>loadTurnos()).catch(()=>alert('Error'));
      }));
      document.querySelectorAll('.btn-mark-reserved').forEach(b => b.addEventListener('click', () => {
        if (!confirm('Marcar este turno como reservado?')) return;
        const fd = new FormData(); fd.append('id', b.dataset.id); fd.append('estado', 'reservado');
        fetch('/admin/turnos/update', { method:'POST', body: fd }).then(()=>loadTurnos()).catch(()=>alert('Error'));
      }));
    }).catch(()=>turnosList.innerHTML='Error');
  }

  // ---------- Citas ----------
  const citasList = document.getElementById('citas-list');
  function loadCitas() {
    citasList.innerHTML = 'Cargando...';
    fetch('/admin/cita/list', { method: 'POST' }).then(r=>r.json()).then(json=>{
      citasList.innerHTML = '';
      (json.items||[]).forEach(c=>{
        const d = document.createElement('div'); d.className='item';
        d.innerHTML = `<div style="flex:1"><strong>${escapeHtml(c.servicio_nombre || 'Servicio')}</strong><div class="mini">${escapeHtml(c.cliente_nombre||'')} — ${escapeHtml(c.fecha||'')} ${escapeHtml(c.hora_inicio||'')}</div></div>
          <div style="display:flex;gap:8px">
            <button class="btn ghost btn-cancel-cita" data-id="${c.id}">Cancelar</button>
          </div>`;
        citasList.appendChild(d);
      });
      document.querySelectorAll('.btn-cancel-cita').forEach(b => b.addEventListener('click', () => {
        if (!confirm('Cancelar cita?')) return;
        const fd = new FormData(); fd.append('id', b.dataset.id);
        fetch('/admin/cita/cancel', { method:'POST', body: fd }).then(r=>r.json()).then(json=> {
          if (json.error) return alert(json.error);
          loadCitas(); loadTurnos(); loadBarberias();
        });
      }));
    }).catch(()=>citasList.innerHTML='Error');
  }

  // ---------- Helpers ----------
  function escapeHtml(s) {
    if (!s) return '';
    return String(s).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]);
  }

  // populate barberia selects used in several forms
  function populateBarberiaSelects() {
    fetch('/admin/barberia/list', { method:'POST' })
      .then(r => r.json())
      .then(json => {
        const items = json.items || [];
        const selects = [
          document.getElementById('servicio-barberia'),
          document.getElementById('servicios-barberia-filter'),
          document.getElementById('horario-barberia'),
          document.getElementById('horarios-barberia-filter'),
          document.getElementById('barbero-barberia'),
          document.getElementById('barberos-barberia-filter'),
          document.getElementById('turnos-barberia-filter')
        ];
        selects.forEach(s => {
          if (!s) return;
          // label distinto si es el filtro de servicios (muestra "Todas las barberías")
          const defaultText = (s.id === 'servicios-barberia-filter') ? 'Todas las barberías' : 'Seleccione';
          s.innerHTML = `<option value="">${defaultText}</option>`;
          items.forEach(b => {
            const opt = document.createElement('option');
            opt.value = b.id;
            opt.textContent = b.nombre;
            s.appendChild(opt);
          });
        });
      })
      .catch(err => {
        console.error('populateBarberiaSelects error', err);
      });
  }

  // Recargar servicios al cambiar el filtro de barbería
  const serviciosFilter = document.getElementById('servicios-barberia-filter');
  if (serviciosFilter) {
    serviciosFilter.addEventListener('change', () => {
      loadServicios();
    });
  }
  // inicializar selects
  populateBarberiaSelects();

});
