// public/build/js/admin.js
// Admin panel frontend (versión completa, integrada)
// Recomendación: mantener este archivo en public/build/js/admin.js y referenciarlo como /build/js/admin.js?v=timestamp
/* eslint-disable no-console */

const SELECTORS = {
  tabs: '.admin-tab',
  sections: '.admin-section',

  // barberias
  barberiasList: '#barberias-list',
  btnNewBarberia: '#btn-new-barberia',
  barberiaFormWrap: '#barberia-form-wrap',
  barberiaSave: '#barberia-save',
  barberiaCancel: '#barberia-cancel',
  barberiaId: '#barberia-id',
  barberiaNombre: '#barberia-nombre',
  barberiaLocalidad: '#barberia-localidad',
  barberiaCalle: '#barberia-calle',
  barberiaAltura: '#barberia-altura',

  // servicios
  serviciosList: '#servicios-list',
  serviciosFilter: '#servicios-barberia-filter',
  servicioFormWrap: '#servicio-form-wrap',
  btnNewServicio: '#btn-new-servicio',
  servicioSave: '#servicio-save',
  servicioCancel: '#servicio-cancel',
  servicioId: '#servicio-id',
  servicioBarberia: '#servicio-barberia',
  servicioNombre: '#servicio-nombre',
  servicioDuracion: '#servicio-duracion',
  servicioPrecio: '#servicio-precio',

  // horarios
  horariosList: '#horarios-list',
  horariosFilter: '#horarios-barberia-filter',
  btnNewHorario: '#btn-new-horario',
  horarioFormWrap: '#horario-form-wrap',
  horarioSave: '#horario-save',
  horarioCancel: '#horario-cancel',
  horarioId: '#horario-id',
  horarioBarberia: '#horario-barberia',
  horarioDia: '#horario-dia',
  horarioApertura: '#horario-apertura',
  horarioCierre: '#horario-cierre',
  horarioIntervalo: '#horario-intervalo',

  // barberos
  barberosList: '#barberos-list',
  barberosFilter: '#barberos-barberia-filter',
  btnNewBarbero: '#btn-new-barbero',
  barberoFormWrap: '#barbero-form-wrap',
  barberoSave: '#barbero-save',
  barberoCancel: '#barbero-cancel',
  barberoId: '#barbero-id',
  barberoBarberia: '#barbero-barberia',
  barberoNombre: '#barbero-nombre',
  barberoEmail: '#barbero-email',
  barberoTelefono: '#barbero-telefono',
  barberoPassword: '#barbero-password',

  // turnos
  turnosList: '#turnos-list',
  turnosFilterBarberia: '#turnos-barberia-filter',
  turnosFilterBarbero: '#turnos-barbero-filter',
  turnosFilterFecha: '#turnos-fecha-filter',
  turnosRefresh: '#turnos-refresh',

  // citas
  citasList: '#citas-list',

  // modal cita
  citaModal: '#cita-modal',
  citaModalBody: '#cita-modal-body',
  citaModalClose: '#cita-modal-close',
  citaModalClose2: '#cita-modal-close-2',
  citaModalBackdrop: '#cita-modal .modal-backdrop'
};

// util DOM helpers
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const byId = id => document.getElementById(id.replace('#',''));
const create = (tag, props = {}) => Object.assign(document.createElement(tag), props);

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showLoading(el, text = 'Cargando...') {
  if (!el) return;
  el.innerHTML = `<div class="muted">${escapeHtml(text)}</div>`;
}
function showEmpty(el, text = 'No hay registros.') {
  if (!el) return;
  el.innerHTML = `<div class="muted">${escapeHtml(text)}</div>`;
}
function showError(el, text = 'Error al cargar') {
  if (!el) return;
  el.innerHTML = `<div class="muted">${escapeHtml(text)}</div>`;
}

// Fetch helpers with AbortController
const controllers = {};
function abortIfRunning(key) {
  if (controllers[key]) {
    try { controllers[key].abort(); } catch(e){}
  }
  const ctrl = new AbortController();
  controllers[key] = ctrl;
  return ctrl.signal;
}
async function postJSON(url, formData = new FormData(), signal) {
  const opts = { method: 'POST', body: formData };
  if (signal) opts.signal = signal;
  const res = await fetch(url, opts);
  if (!res.ok) {
    // try to read body
    let txt = '';
    try { txt = await res.text(); } catch(e) {}
    const err = new Error(`HTTP ${res.status} ${res.statusText} ${txt ? '- ' + txt : ''}`);
    err.status = res.status;
    throw err;
  }
  return await res.json();
}

// debounce
function debounce(fn, wait = 180) {
  let t;
  return function(...args) {
    clearTimeout(t);
    t = setTimeout(()=>fn.apply(this,args), wait);
  };
}

// mapping cache for barberos (id -> object) used by turnos rendering
let barberosMap = {}; // { id: {id, nombre, email, ...} }

// ---------------- DOMContentLoaded ----------------
document.addEventListener('DOMContentLoaded', () => {

  // Tabs
  $$(SELECTORS.tabs).forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      $$(SELECTORS.sections).forEach(s => s.style.display = 'none');
      const section = document.getElementById(`tab-${tab}`);
      if (section) section.style.display = 'block';
      $$(SELECTORS.tabs).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // lazy load for the tab
      if (tab === 'barberias') loadBarberias();
      if (tab === 'servicios') loadServicios();
      if (tab === 'horarios') loadHorarios();
      if (tab === 'barberos') loadBarberos();
      if (tab === 'turnos') loadTurnos();
      if (tab === 'citas') loadCitas();
    });
  });

  // Click first tab
  (document.querySelector(SELECTORS.tabs) || { click: ()=>{} }).click();

  // populate barberias + barberos selects
  populateBarberiaSelects();

  // Attach modal close listeners
  document.querySelector(SELECTORS.citaModalClose)?.addEventListener('click', closeCitaModal);
  document.querySelector(SELECTORS.citaModalClose2)?.addEventListener('click', closeCitaModal);
  document.querySelector(SELECTORS.citaModalBackdrop)?.addEventListener('click', closeCitaModal);

  // Barberia form bindings
  document.querySelector(SELECTORS.btnNewBarberia)?.addEventListener('click', () => showBarberiaForm());
  document.querySelector(SELECTORS.barberiaCancel)?.addEventListener('click', () => { document.querySelector(SELECTORS.barberiaFormWrap).style.display = 'none'; });
  document.querySelector(SELECTORS.barberiaSave)?.addEventListener('click', saveBarberia);

  // Servicio bindings
  document.querySelector(SELECTORS.btnNewServicio)?.addEventListener('click', () => {
    document.querySelector(SELECTORS.servicioFormWrap).style.display = 'block';
    byId('servicio-id').value = '';
    byId('servicio-nombre').value = '';
    byId('servicio-duracion').value = '';
    byId('servicio-precio').value = '';
    populateBarberiaSelects();
  });
  document.querySelector(SELECTORS.servicioCancel)?.addEventListener('click', () => { document.querySelector(SELECTORS.servicioFormWrap).style.display = 'none'; });
  document.querySelector(SELECTORS.servicioSave)?.addEventListener('click', saveServicio);
  document.querySelector(SELECTORS.serviciosFilter)?.addEventListener('change', debounce(loadServicios, 150));

  // Horario bindings
  document.querySelector(SELECTORS.btnNewHorario)?.addEventListener('click', () => {
    document.querySelector(SELECTORS.horarioFormWrap).style.display = 'block';
    byId('horario-id').value = '';
    byId('horario-intervalo').value = '30';
    populateBarberiaSelects();
  });
  document.querySelector(SELECTORS.horarioCancel)?.addEventListener('click', () => { document.querySelector(SELECTORS.horarioFormWrap).style.display = 'none'; });
  document.querySelector(SELECTORS.horarioSave)?.addEventListener('click', saveHorario);
  document.querySelector(SELECTORS.horariosFilter)?.addEventListener('change', debounce(() => {
    const bid = document.querySelector(SELECTORS.horariosFilter).value || '';
    populateBarberoSelects(bid); // keep barbero list in sync (if any)
    loadHorarios();
  }, 160));

  // Barbero bindings
  document.querySelector(SELECTORS.btnNewBarbero)?.addEventListener('click', () => {
    document.querySelector(SELECTORS.barberoFormWrap).style.display = 'block';
    byId('barbero-id').value = '';
    byId('barbero-password').value = '';
    populateBarberiaSelects();
  });
  document.querySelector(SELECTORS.barberoCancel)?.addEventListener('click', () => { document.querySelector(SELECTORS.barberoFormWrap).style.display = 'none'; });
  document.querySelector(SELECTORS.barberoSave)?.addEventListener('click', saveBarbero);
  document.querySelector(SELECTORS.barberosFilter)?.addEventListener('change', debounce(loadBarberos, 150));

  // Turnos filters
  document.querySelector(SELECTORS.turnosFilterBarberia)?.addEventListener('change', () => {
    const bid = document.querySelector(SELECTORS.turnosFilterBarberia).value || '';
    populateBarberoSelects(bid); // update barbero selector based on barberia
    loadTurnos();
  });
  document.querySelector(SELECTORS.turnosFilterBarbero)?.addEventListener('change', debounce(loadTurnos, 120));
  document.querySelector(SELECTORS.turnosFilterFecha)?.addEventListener('change', debounce(loadTurnos, 120));
  document.querySelector(SELECTORS.turnosRefresh)?.addEventListener('click', loadTurnos);

  // Initial small loads (for active tab)
  const activeBtn = document.querySelector(`${SELECTORS.tabs}.active`) || document.querySelector(SELECTORS.tabs);
  if (activeBtn) {
    const tab = activeBtn.dataset.tab;
    if (tab === 'barberias') loadBarberias();
    if (tab === 'servicios') loadServicios();
    if (tab === 'horarios') loadHorarios();
    if (tab === 'barberos') loadBarberos();
    if (tab === 'turnos') loadTurnos();
    if (tab === 'citas') loadCitas();
  }

}); // DOMContentLoaded end

// ------------------- Barberias -------------------
async function loadBarberias() {
  const el = document.querySelector(SELECTORS.barberiasList);
  if (!el) return;
  showLoading(el, 'Cargando barberías...');
  const signal = abortIfRunning('barberias');
  try {
    const json = await postJSON('/admin/barberia/list', new FormData(), signal);
    const items = json.items || [];
    if (!items.length) return showEmpty(el, 'No hay barberías.');
    el.innerHTML = '';
    items.forEach(b => {
      const row = create('div', { className: 'item' });
      row.innerHTML = `<div style="flex:1"><strong>${escapeHtml(b.nombre)}</strong><div class="mini">${escapeHtml(b.localidad||'')} — ${escapeHtml((b.calle||'')+' '+(b.altura||''))}</div></div>
        <div style="display:flex;gap:8px">
          <button class="btn ghost btn-edit-barberia" data-id="${b.id}">Editar</button>
          <button class="btn ghost btn-delete-barberia" data-id="${b.id}">Eliminar</button>
        </div>`;
      el.appendChild(row);
    });
    $$('.btn-edit-barberia').forEach(btn => btn.addEventListener('click', (e)=> {
      const id = btn.dataset.id;
      const items = Array.from(el.querySelectorAll('.item'));
      // find data from rendered DOM (we don't keep full list memory here), so refetch
      postJSON('/admin/barberia/list', new FormData()).then(json => {
        const b = (json.items||[]).find(x => String(x.id) === String(id));
        if (b) showBarberiaForm(b);
      }).catch(err => console.error('editBarberia fetch error', err));
    }));
    $$('.btn-delete-barberia').forEach(btn => btn.addEventListener('click', async () => {
      if (!confirm('Eliminar barbería?')) return;
      const fd = new FormData(); fd.append('id', btn.dataset.id);
      try {
        await postJSON('/admin/barberia/delete', fd);
        await loadBarberias();
        await populateBarberiaSelects();
      } catch(err) {
        console.error('deleteBarberia error', err);
        alert('Error al eliminar barbería');
      }
    }));
  } catch(err) {
    console.error('loadBarberias error', err);
    showError(el, 'Error al cargar barberías');
  }
}

function showBarberiaForm(data = null) {
  const wrap = document.querySelector(SELECTORS.barberiaFormWrap);
  if (!wrap) return;
  wrap.style.display = 'block';
  byId('barberia-id').value = data ? data.id : '';
  byId('barberia-nombre').value = data ? data.nombre : '';
  byId('barberia-localidad').value = data ? data.localidad : '';
  byId('barberia-calle').value = data ? data.calle : '';
  byId('barberia-altura').value = data ? data.altura : '';
  byId('barberia-form-title').innerText = data ? 'Editar barbería' : 'Nueva barbería';
}

async function saveBarberia() {
  const id = byId('barberia-id').value;
  const nombre = byId('barberia-nombre').value.trim();
  if (!nombre) return alert('Nombre requerido');
  const fd = new FormData();
  if (id) fd.append('id', id);
  fd.append('nombre', nombre);
  fd.append('localidad', byId('barberia-localidad').value.trim());
  fd.append('calle', byId('barberia-calle').value.trim());
  fd.append('altura', byId('barberia-altura').value.trim());
  try {
    await postJSON('/admin/barberia/save', fd);
    document.querySelector(SELECTORS.barberiaFormWrap).style.display = 'none';
    await loadBarberias();
    await populateBarberiaSelects();
  } catch(err) {
    console.error('saveBarberia error', err);
    alert('Error al guardar barbería');
  }
}

// ------------------- Servicios -------------------
async function loadServicios() {
  const el = document.querySelector(SELECTORS.serviciosList);
  if (!el) return;
  showLoading(el, 'Cargando servicios...');
  const signal = abortIfRunning('servicios');
  const fd = new FormData();
  const bid = document.querySelector(SELECTORS.serviciosFilter)?.value || '';
  if (bid) fd.append('id_barberia', bid);
  try {
    const json = await postJSON('/admin/servicio/list', fd, signal);
    const items = json.items || [];
    if (!items.length) return showEmpty(el, 'No hay servicios.');
    el.innerHTML = '';
    items.forEach(s => {
      const d = create('div', { className: 'item' });
      d.innerHTML = `<div style="flex:1"><strong>${escapeHtml(s.nombre)}</strong><div class="mini">${escapeHtml(String(s.duracion_min || s.duration_min || ''))} min · $${escapeHtml(String(s.precio || s.price || ''))}</div></div>
        <div style="display:flex;gap:8px">
          <button class="btn ghost btn-edit-servicio" data-id="${s.id}">Editar</button>
          <button class="btn ghost btn-delete-servicio" data-id="${s.id}">Eliminar</button>
        </div>`;
      el.appendChild(d);
    });
    $$('.btn-edit-servicio').forEach(b => b.addEventListener('click', (e)=> editServicio(b.dataset.id)));
    $$('.btn-delete-servicio').forEach(b => b.addEventListener('click', async () => {
      if (!confirm('Eliminar servicio?')) return;
      const fd = new FormData(); fd.append('id', b.dataset.id);
      try { await postJSON('/admin/servicio/delete', fd); await loadServicios(); } catch(err){ console.error('delete servicio', err); alert('Error al eliminar'); }
    }));
  } catch(err) {
    console.error('loadServicios error', err);
    showError(el, 'Error al cargar servicios');
  }
}

async function editServicio(id) {
  try {
    const json = await postJSON('/admin/servicio/list', new FormData());
    const s = (json.items || []).find(x => String(x.id) === String(id));
    if (!s) return alert('Servicio no encontrado');
    document.querySelector(SELECTORS.servicioFormWrap).style.display = 'block';
    byId('servicio-id').value = s.id;
    await populateBarberiaSelects();
    setTimeout(()=> {
      byId('servicio-barberia').value = s.id_barberia || s.id_barberia || '';
      byId('servicio-nombre').value = s.nombre || s.name || '';
      byId('servicio-duracion').value = s.duracion_min || s.duration_min || '';
      byId('servicio-precio').value = s.precio || s.price || '';
    }, 120);
  } catch(err) {
    console.error('editServicio error', err);
    alert('Error al cargar servicio');
  }
}

async function saveServicio() {
  const id = byId('servicio-id').value;
  const id_barberia = byId('servicio-barberia').value;
  const nombre = byId('servicio-nombre').value.trim();
  if (!id_barberia) return alert('Seleccioná una barbería');
  if (!nombre) return alert('Nombre requerido');
  const fd = new FormData();
  if (id) fd.append('id', id);
  fd.append('id_barberia', id_barberia);
  fd.append('nombre', nombre);
  fd.append('duracion_min', String(parseInt(byId('servicio-duracion').value || 0, 10) || 0));
  fd.append('precio', byId('servicio-precio').value || '0');
  try {
    await postJSON('/admin/servicio/save', fd);
    document.querySelector(SELECTORS.servicioFormWrap).style.display = 'none';
    await loadServicios();
  } catch(err) {
    console.error('saveServicio error', err);
    alert('Error al guardar servicio');
  }
}

// ------------------- Horarios -------------------
async function loadHorarios() {
  const el = document.querySelector(SELECTORS.horariosList);
  if (!el) return;
  showLoading(el, 'Cargando horarios...');
  const signal = abortIfRunning('horarios');
  const fd = new FormData();
  const bid = document.querySelector(SELECTORS.horariosFilter)?.value || '';
  if (bid) fd.append('id_barberia', bid);
  try {
    const json = await postJSON('/admin/horario/list', fd, signal);
    const items = json.items || [];
    if (!items.length) return showEmpty(el, 'No hay horarios registrados.');
    // ordenar por día y hora
    const order = ['lunes','martes','miércoles','jueves','viernes','sábado','domingo'];
    items.sort((a,b) => {
      const da = order.indexOf(a.dia_semana), db = order.indexOf(b.dia_semana);
      if (da !== db) return da - db;
      return (a.hora_apertura||'').localeCompare(b.hora_apertura||'');
    });
    el.innerHTML = '';
    items.forEach(h => {
      const inicio = (h.hora_apertura || '').substr(0,5);
      const fin = (h.hora_cierre || '').substr(0,5);
      const intervalo = h.intervalo_min || h.intervalo || '-';
      const item = create('div', { className: 'item' });
      item.innerHTML = `<div style="flex:1"><strong>${escapeHtml(h.dia_semana||'-')}</strong><div class="mini">${escapeHtml(inicio)} — ${escapeHtml(fin)} · Intervalo: ${escapeHtml(String(intervalo))} min</div></div>
        <div style="display:flex;gap:8px">
          <button class="btn ghost btn-edit-horario" data-id="${h.id}">Editar</button>
          <button class="btn ghost btn-delete-horario" data-id="${h.id}">Eliminar</button>
        </div>`;
      el.appendChild(item);
    });
    $$('.btn-edit-horario').forEach(b => b.addEventListener('click', () => editHorario(b.dataset.id)));
    $$('.btn-delete-horario').forEach(b => b.addEventListener('click', async () => {
      if (!confirm('Eliminar horario?')) return;
      const fd = new FormData(); fd.append('id', b.dataset.id);
      try { await postJSON('/admin/horario/delete', fd); await loadHorarios(); } catch(err){ console.error('deleteHorario', err); alert('Error al eliminar horario'); }
    }));
  } catch(err) {
    console.error('loadHorarios error', err);
    showError(el, 'Error al cargar horarios');
  }
}

async function editHorario(id) {
  try {
    const json = await postJSON('/admin/horario/list', new FormData());
    const h = (json.items || []).find(x => String(x.id) === String(id));
    if (!h) return alert('Horario no encontrado');
    document.querySelector(SELECTORS.horarioFormWrap).style.display = 'block';
    byId('horario-id').value = h.id;
    await populateBarberiaSelects();
    setTimeout(() => {
      byId('horario-barberia').value = h.id_barberia || '';
      byId('horario-dia').value = h.dia_semana || 'lunes';
      byId('horario-apertura').value = (h.hora_apertura || '').substr(0,5);
      byId('horario-cierre').value = (h.hora_cierre || '').substr(0,5);
      byId('horario-intervalo').value = h.intervalo_min || 30;
    }, 120);
  } catch(err) {
    console.error('editHorario error', err);
    alert('Error al editar horario');
  }
}

async function saveHorario() {
  const id = byId('horario-id').value;
  const id_barberia = byId('horario-barberia').value;
  if (!id_barberia) return alert('Seleccioná una barbería');
  const dia = byId('horario-dia').value;
  const apertura = byId('horario-apertura').value;
  const cierre = byId('horario-cierre').value;
  const intervalo = parseInt(byId('horario-intervalo').value || 30, 10);
  if (!apertura || !cierre) return alert('Ingresá horas válidas');
  const fd = new FormData();
  if (id) fd.append('id', id);
  fd.append('id_barberia', id_barberia);
  fd.append('dia_semana', dia);
  fd.append('hora_apertura', apertura);
  fd.append('hora_cierre', cierre);
  fd.append('intervalo_min', String(intervalo));
  try {
    await postJSON('/admin/horario/save', fd);
    document.querySelector(SELECTORS.horarioFormWrap).style.display = 'none';
    await loadHorarios();
  } catch(err) {
    console.error('saveHorario error', err);
    alert('Error al guardar horario');
  }
}

// ------------------- Barberos -------------------
async function loadBarberos() {
  const el = document.querySelector(SELECTORS.barberosList);
  if (!el) return;
  showLoading(el, 'Cargando barberos...');
  const signal = abortIfRunning('barberos');
  const fd = new FormData();
  const idb = document.querySelector(SELECTORS.barberosFilter)?.value || '';
  if (idb) fd.append('id_barberia', idb);
  try {
    const json = await postJSON('/admin/barbero/list', fd, signal);
    const items = json.items || [];
    if (!items.length) return showEmpty(el, 'No hay barberos.');
    el.innerHTML = '';
    // refresh barberosMap for lookups
    barberosMap = {};
    items.forEach(u => { barberosMap[String(u.id)] = u; });
    items.forEach(u => {
      const row = create('div', { className: 'item' });
      row.innerHTML = `<div style="flex:1"><strong>${escapeHtml(u.nombre)}</strong><div class="mini">${escapeHtml(u.email||'')} · ${escapeHtml(u.telefono||'')}</div></div>
        <div style="display:flex;gap:8px">
          <button class="btn ghost btn-edit-barbero" data-id="${u.id}">Editar</button>
          <button class="btn ghost btn-delete-barbero" data-id="${u.id}">Eliminar</button>
        </div>`;
      el.appendChild(row);
    });
    $$('.btn-edit-barbero').forEach(b => b.addEventListener('click', () => editBarbero(b.dataset.id)));
    $$('.btn-delete-barbero').forEach(b => b.addEventListener('click', async () => {
      if (!confirm('Eliminar barbero?')) return;
      const fd = new FormData(); fd.append('id', b.dataset.id);
      try { await postJSON('/admin/barbero/delete', fd); await loadBarberos(); } catch(err){ console.error('deleteBarbero', err); alert('Error al eliminar'); }
    }));
  } catch(err) {
    console.error('loadBarberos error', err);
    showError(el, 'Error al cargar barberos');
  }
}

async function editBarbero(id) {
  try {
    const json = await postJSON('/admin/barbero/list', new FormData());
    const u = (json.items || []).find(x => String(x.id) === String(id));
    if (!u) return alert('Barbero no encontrado');
    document.querySelector(SELECTORS.barberoFormWrap).style.display = 'block';
    await populateBarberiaSelects();
    setTimeout(() => {
      byId('barbero-id').value = u.id;
      byId('barbero-barberia').value = u.id_barberia || '';
      byId('barbero-nombre').value = u.nombre || '';
      byId('barbero-email').value = u.email || '';
      byId('barbero-telefono').value = u.telefono || '';
    }, 120);
  } catch(err) {
    console.error('editBarbero error', err);
    alert('Error al cargar barbero');
  }
}

async function saveBarbero() {
  const id = byId('barbero-id').value;
  const id_barberia = byId('barbero-barberia').value;
  const nombre = byId('barbero-nombre').value.trim();
  const email = byId('barbero-email').value.trim();
  const telefono = byId('barbero-telefono').value.trim();
  const password = byId('barbero-password').value.trim();
  if (!id_barberia) return alert('Seleccioná una barbería');
  if (!nombre || !email) return alert('Nombre y email son requeridos');
  const fd = new FormData();
  if (id) fd.append('id', id);
  fd.append('id_barberia', id_barberia);
  fd.append('nombre', nombre);
  fd.append('email', email);
  fd.append('telefono', telefono);
  if (password) fd.append('password', password);
  try {
    await postJSON('/admin/barbero/save', fd);
    document.querySelector(SELECTORS.barberoFormWrap).style.display = 'none';
    await loadBarberos();
  } catch(err) {
    console.error('saveBarbero error', err);
    alert('Error al guardar barbero');
  }
}

// ------------------- Turnos -------------------
async function loadTurnos() {
  const el = document.querySelector(SELECTORS.turnosList);
  if (!el) return;
  showLoading(el, 'Cargando turnos...');
  const signal = abortIfRunning('turnos');
  const fd = new FormData();
  const idb = document.querySelector(SELECTORS.turnosFilterBarberia)?.value || '';
  const idbr = document.querySelector(SELECTORS.turnosFilterBarbero)?.value || '';
  const fecha = document.querySelector(SELECTORS.turnosFilterFecha)?.value || '';
  if (idb) fd.append('id_barberia', idb);
  if (idbr) fd.append('id_barbero', idbr);
  if (fecha) fd.append('fecha', fecha);
  try {
    // ensure barbero select is populated for visual mapping
    await populateBarberoSelects(idb);

    const json = await postJSON('/admin/turnos/list', fd, signal);
    const items = json.items || [];
    if (!items.length) return showEmpty(el, 'No hay turnos.');
    // sort by fecha desc, hora_inicio asc
    items.sort((a,b) => {
      if (a.fecha !== b.fecha) return (b.fecha || '').localeCompare(a.fecha || '');
      return (a.hora_inicio || '').localeCompare(b.hora_inicio || '');
    });
    el.innerHTML = '';
    items.forEach(t => {
      // try get barbero name from map
      const barbero = barberosMap[String(t.id_barbero)] || null;
      const barberoNombre = barbero ? (barbero.nombre || barbero.name) : (t.barbero_nombre || t.barbero || String(t.id_barbero));
      const inicio = (t.hora_inicio || '').substr(0,5);
      const fin = (t.hora_fin || '').substr(0,5);
      const item = create('div', { className: 'item' });
      item.innerHTML = `<div style="flex:1">
        <strong>${escapeHtml(t.fecha || '')} ${escapeHtml(inicio)}</strong>
        <div class="mini">Barbero: ${escapeHtml(barberoNombre)} · Estado: ${escapeHtml(t.estado || '-')}</div>
      </div>
      <div style="display:flex;gap:8px">
        ${t.estado === 'reservado' ? `<button class="btn ghost btn-view-cita" data-turno="${t.id}">Ver cita</button>` : ''}
      </div>`;
      el.appendChild(item);
    });
    // bind view-cita buttons
    $$('.btn-view-cita').forEach(b => b.addEventListener('click', (ev) => {
      const turnoId = ev.currentTarget.dataset.turno;
      fetchCitaByTurno(turnoId);
    }));
  } catch(err) {
    console.error('loadTurnos error', err);
    showError(el, 'Error al cargar turnos');
  }
}

// ------------------- Citas -------------------
async function loadCitas() {
  const el = document.querySelector(SELECTORS.citasList);
  if (!el) return;
  showLoading(el, 'Cargando citas...');
  try {
    const json = await postJSON('/admin/cita/list', new FormData());
    const items = json.items || [];
    if (!items.length) return showEmpty(el, 'No hay citas.');
    renderCitas(items);
  } catch(err) {
    console.error('loadCitas error', err);
    showError(document.querySelector(SELECTORS.citasList), 'Error al cargar citas');
  }
}

function renderCitas(items) {
  const el = document.querySelector(SELECTORS.citasList);
  if (!el) return;
  el.innerHTML = '';
  items.forEach(c => {
    // robust fallbacks for field names
    const servicio = c.servicio_nombre || c.servicio || c.servicioName || c.servicio_nombre_servicio || c.servicio_nombre || c.servicio_nombre || c.servicio || c.servicio_producto || c.servicio_nombre;
    const cliente = c.cliente_nombre || c.cliente || c.nombre_cliente || c.clienteName || c.cliente_nombre;
    const fecha = c.fecha || c.fecha_turno || (c.fecha_creado ? c.fecha_creado : '');
    const hora = (c.hora_inicio || c.hora || '').substr(0,5);
    const idTurno = c.id_turno || c.idTurno || c.turno_id || c.id_turno;
    const idCita = c.id || c.cita_id || c.id_cita;
    const d = create('div', { className: 'item' });
    d.innerHTML = `<div style="flex:1">
      <strong>${escapeHtml(servicio || 'Servicio')}</strong>
      <div class="mini">${escapeHtml(cliente || '—')} — ${escapeHtml(fecha)} ${escapeHtml(hora)}</div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn ghost btn-view-cita" data-turno="${escapeHtml(idTurno || '')}" data-cita="${escapeHtml(idCita || '')}">Ver</button>
      <button class="btn ghost btn-cancel-cita" data-id="${escapeHtml(idCita || '')}">Cancelar</button>
    </div>`;
    el.appendChild(d);
  });
  // bind buttons
  $$('.btn-view-cita').forEach(b => b.addEventListener('click', (ev)=> {
    const turno = ev.currentTarget.dataset.turno || '';
    const cita = ev.currentTarget.dataset.cita || '';
    if (turno) fetchCitaByTurno(turno);
    else if (cita) fetchCitaById(cita);
    else alert('No hay identificador válido para la cita');
  }));
  $$('.btn-cancel-cita').forEach(b => b.addEventListener('click', async (ev) => {
    const id = ev.currentTarget.dataset.id;
    if (!id) return alert('ID inválido');
    if (!confirm('Cancelar cita?')) return;
    const fd = new FormData(); fd.append('id', id);
    try {
      await postJSON('/admin/cita/cancel', fd);
      await loadCitas();
      await loadTurnos();
    } catch(err) {
      console.error('cancelCita error', err);
      alert('Error al cancelar cita');
    }
  }));
}

// ---------------- Modal Cita (REEMPLAZAR por esta versión) ----------------
  function _safeText(v){ return v == null || v === '' ? '—' : String(v); }
  function _formatDate(d) {
    if (!d) return '';
    const p = String(d).split('-');
    if (p.length === 3) return `${p[2]}/${p[1]}/${p[0]}`;
    return d;
  }
  function _formatTime(t){ if (!t) return ''; return String(t).substr(0,5); }

  function openCitaModalFromObject(item) {
    const modal = document.querySelector('#cita-modal');
    const body = document.querySelector('#cita-modal-body');
    const title = document.querySelector('#cita-modal-title');
    const subtitle = document.querySelector('#cita-modal-subtitle');

    if (!modal || !body || !title || !subtitle) {
      console.error('Modal de cita: elementos DOM no encontrados');
      return;
    }

    // Si item es nulo/indefinido mostramos aviso
    if (!item || Object.keys(item).length === 0) {
      title.textContent = 'Detalle de la cita';
      subtitle.textContent = 'No hay información disponible';
      body.innerHTML = '<div class="muted">La información de la cita no está disponible. Reintentá luego.</div>';
      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden','false');
      return;
    }

    // Lectura robusta de campos (múltiples nombres posibles)
    const servicio = item.servicio_nombre || item.servicio || item.nombre_servicio || item.servicioName || item.servicio_name || _safeText(item.servicio_nombre);
    const cliente = item.cliente_nombre || item.cliente || item.nombre_cliente || item.clienteName || _safeText(item.cliente_nombre);
    const clienteEmail = item.cliente_email || item.email || item.clienteEmail || '';
    const clienteTelefono = item.cliente_telefono || item.telefono || item.clienteTelefono || '';
    const barbero = item.barbero_nombre || item.barbero || item.barberoName || '';
    const fecha = item.fecha || item.fecha_turno || item.fecha_cita || '';
    const horaInicio = item.hora_inicio || item.hora || item.hora_inicio_turno || '';
    const horaFin = item.hora_fin || item.hora_fin_turno || '';
    const precio = item.servicio_precio || item.precio || item.price || '';

    title.textContent = servicio ? `Cita: ${servicio}` : 'Detalle de la cita';
    subtitle.textContent = `${barbero ? 'Barbero: ' + barbero + ' · ' : ''}${_formatDate(fecha)} ${_formatTime(horaInicio)}`;

    // cuerpo
    body.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr;gap:8px">
        <div><strong>Cliente:</strong> ${escapeHtml(cliente || '—')}</div>
        <div><strong>Email:</strong> ${escapeHtml(clienteEmail || '—')}</div>
        <div><strong>Teléfono:</strong> ${escapeHtml(clienteTelefono || '—')}</div>
        <hr />
        <div><strong>Servicio:</strong> ${escapeHtml(servicio || '—')}</div>
        <div><strong>Precio:</strong> $${escapeHtml(String(precio || '—'))}</div>
        <div><strong>Barbero:</strong> ${escapeHtml(barbero || '—')}</div>
        <div><strong>Fecha / Hora:</strong> ${escapeHtml(_formatDate(fecha))} ${escapeHtml(_formatTime(horaInicio))} — ${escapeHtml(_formatTime(horaFin))}</div>
        <div><strong>ID cita:</strong> ${escapeHtml(String(item.id || item.cita_id || '—'))} — <strong>ID turno:</strong> ${escapeHtml(String(item.id_turno || item.turno_id || '—'))}</div>
      </div>
    `;

    // Mostrar
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden','false');
  }

  // cerrar modal
  function closeCitaModal() {
    const modal = document.querySelector('#cita-modal');
    if (!modal) return;
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden','true');
  }

  // ATTACH close handlers (si aún no lo están)
  document.querySelector('#cita-modal-close')?.addEventListener('click', closeCitaModal);
  document.querySelector('#cita-modal-close-2')?.addEventListener('click', closeCitaModal);
  document.querySelector('#cita-modal .modal-backdrop')?.addEventListener('click', closeCitaModal);

  // Fetch + mostrar: por turno o por id
  async function fetchCitaByTurno(turnoId) {
    const modal = document.querySelector('#cita-modal');
    const body = document.querySelector('#cita-modal-body');
    if (modal && body) {
      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden','false');
      body.innerHTML = '<div class="muted">Cargando cita…</div>';
      document.querySelector('#cita-modal-subtitle').textContent = 'Cargando…';
    }

    try {
      const fd = new FormData(); fd.append('id_turno', turnoId);
      const json = await postJSON('/admin/cita/get', fd);
      if (json && json.item) {
        openCitaModalFromObject(json.item);
        return;
      }
      // si backend devuelve {items:[...]} o similar
      if (json && json.items && json.items.length) {
        openCitaModalFromObject(json.items[0]);
        return;
      }
      // nada
      openCitaModalFromObject(null);
    } catch (err) {
      console.error('fetchCitaByTurno error', err);
      if (body) body.innerHTML = `<div class="muted">Error al solicitar la cita: ${escapeHtml(err.message || '')}</div>`;
    }
  }

  async function fetchCitaById(id) {
    const modal = document.querySelector('#cita-modal');
    const body = document.querySelector('#cita-modal-body');
    if (modal && body) {
      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden','false');
      body.innerHTML = '<div class="muted">Cargando cita…</div>';
      document.querySelector('#cita-modal-subtitle').textContent = 'Cargando…';
    }

    try {
      const fd = new FormData(); fd.append('id', id);
      const json = await postJSON('/admin/cita/get', fd);
      if (json && json.item) openCitaModalFromObject(json.item);
      else openCitaModalFromObject(null);
    } catch (err) {
      console.error('fetchCitaById error', err);
      if (body) body.innerHTML = `<div class="muted">Error al solicitar la cita: ${escapeHtml(err.message || '')}</div>`;
    }
  }


// ------------------- Select population -------------------
// populate barberías into all relevant selects
async function populateBarberiaSelects() {
  const fd = new FormData();
  try {
    const json = await postJSON('/admin/barberia/list', fd);
    const items = json.items || [];
    const mapping = [
      SELECTORS.servicioBarberia,
      SELECTORS.serviciosFilter,
      SELECTORS.horarioBarberia,
      SELECTORS.horariosFilter,
      SELECTORS.barberoBarberia,
      SELECTORS.barberosFilter,
      SELECTORS.turnosFilterBarberia
    ];
    mapping.forEach(sel => {
      const el = document.querySelector(sel);
      if (!el) return;
      const defaultText = (sel === SELECTORS.serviciosFilter) ? 'Todas las barberías' : 'Seleccione';
      el.innerHTML = `<option value="">${defaultText}</option>`;
      items.forEach(b => {
        const opt = create('option'); opt.value = b.id; opt.textContent = b.nombre;
        el.appendChild(opt);
      });
    });
    // after barberias loaded, populate barberos for current barberia filter in turnos
    const bid = document.querySelector(SELECTORS.turnosFilterBarberia)?.value || '';
    await populateBarberoSelects(bid);
  } catch(err) {
    console.error('populateBarberiaSelects error', err);
  }
}

// populate barbero selects; if id_barberia provided, request barberos of that barberia
async function populateBarberoSelects(id_barberia = '') {
  const selects = [ SELECTORS.turnosFilterBarbero ];
  const fd = new FormData();
  if (id_barberia) fd.append('id_barberia', id_barberia);
  try {
    const json = await postJSON('/admin/barbero/list', fd);
    const items = json.items || [];
    // update barberosMap for lookup
    barberosMap = {};
    items.forEach(b => { barberosMap[String(b.id)] = b; });

    selects.forEach(sel => {
      const el = document.querySelector(sel);
      if (!el) return;
      el.innerHTML = `<option value="">Barbero</option>`;
      items.forEach(b => {
        const opt = create('option'); opt.value = b.id; opt.textContent = b.nombre;
        el.appendChild(opt);
      });
    });
  } catch(err) {
    console.error('populateBarberoSelects error', err);
  }
}

// ------------------- Utils / Export (not needed) -------------------
// nothing to export; file executed as script module

// EOF
