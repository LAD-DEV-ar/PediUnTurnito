<?php
// views/admin/index.php
// Variables inyectadas: totalBarberias, totalServicios, totalBarberos, recentCitas
require_login_simple('/');
?>
<link rel="stylesheet" href="/public/css/booking.css">

<div class="booking-root" style="max-width:1200px;margin:0 auto">
  <div class="card" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
    <div>
      <h1 style="margin:0">Panel Admin</h1>
      <div class="mini">Gestioná barberías, servicios, horarios, barberos, turnos y citas.</div>
    </div>
    <div style="display:flex;gap:12px;align-items:center">
      <div class="badge-pill">Barberías: <?= s($totalBarberias) ?></div>
      <div class="badge-pill">Servicios: <?= s($totalServicios) ?></div>
      <div class="badge-pill">Barberos: <?= s($totalBarberos) ?></div>
    </div>
  </div>

  <div class="card" style="padding:0;overflow:hidden">
    <div style="display:grid;grid-template-columns:220px 1fr;min-height:520px">
      <nav style="padding:12px;border-right:1px solid rgba(255,255,255,0.02)">
        <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px">
          <li><button class="btn ghost admin-tab" data-tab="barberias">Barberías</button></li>
          <li><button class="btn ghost admin-tab" data-tab="servicios">Servicios</button></li>
          <li><button class="btn ghost admin-tab" data-tab="horarios">Horarios</button></li>
          <li><button class="btn ghost admin-tab" data-tab="barberos">Barberos</button></li>
          <li><button class="btn ghost admin-tab" data-tab="turnos">Turnos</button></li>
          <li><button class="btn ghost admin-tab" data-tab="citas">Citas</button></li>
        </ul>
      </nav>

      <main style="padding:14px">
        <!-- Barberias -->
        <section id="tab-barberias" class="admin-section">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <h2 style="margin:0">Barberías</h2>
            <button id="btn-new-barberia" class="btn">Nueva barbería</button>
          </div>
          <div id="barberias-list" class="list"></div>
          <div id="barberia-form-wrap" style="margin-top:12px;display:none">
            <div class="card">
              <h3 id="barberia-form-title">Nueva barbería</h3>
              <input type="hidden" id="barberia-id" />
              <label>Nombre</label>
              <input id="barberia-nombre" type="text" />
              <label>Localidad</label>
              <input id="barberia-localidad" type="text" />
              <label>Calle</label>
              <input id="barberia-calle" type="text" />
              <label>Altura</label>
              <input id="barberia-altura" type="text" />
              <div style="display:flex;gap:8px;margin-top:8px">
                <button id="barberia-save" class="btn">Guardar</button>
                <button id="barberia-cancel" class="btn ghost">Cancelar</button>
              </div>
            </div>
          </div>
        </section>

        <!-- Servicios -->
        <section id="tab-servicios" class="admin-section" style="display:none">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <h2 style="margin:0">Servicios</h2>
            <div style="display:flex;gap:8px;align-items:center">
              <select id="servicios-barberia-filter">
                <option value="">Todas las barberías</option>
              </select>
              <button id="btn-new-servicio" class="btn">Nuevo servicio</button>
            </div>
          </div>
          <div id="servicios-list" class="list"></div>

          <div id="servicio-form-wrap" style="margin-top:12px;display:none">
            <div class="card">
              <h3 id="servicio-form-title">Nuevo servicio</h3>
              <input type="hidden" id="servicio-id" />
              <label>Barbería</label>
              <select id="servicio-barberia"></select>
              <label>Nombre</label><input id="servicio-nombre" type="text" />
              <label>Duración (min)</label><input id="servicio-duracion" type="number" />
              <label>Precio</label><input id="servicio-precio" type="text" />
              <div style="display:flex;gap:8px;margin-top:8px">
                <button id="servicio-save" class="btn">Guardar</button>
                <button id="servicio-cancel" class="btn ghost">Cancelar</button>
              </div>
            </div>
          </div>
        </section>

        <!-- Horarios -->
        <section id="tab-horarios" class="admin-section" style="display:none">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <h2 style="margin:0">Horarios</h2>
            <div style="display:flex;gap:8px;align-items:center">
              <select id="horarios-barberia-filter"><option value="">Elegí barbería</option></select>
              <button id="btn-new-horario" class="btn">Agregar horario</button>
            </div>
          </div>
          <div id="horarios-list" class="list"></div>

          <div id="horario-form-wrap" style="margin-top:12px;display:none">
            <div class="card">
              <h3 id="horario-form-title">Nuevo horario</h3>
              <input type="hidden" id="horario-id" />
              <label>Barbería</label><select id="horario-barberia"></select>
              <label>Día de la semana</label>
              <select id="horario-dia">
                <option value="lunes">lunes</option><option value="martes">martes</option><option value="miércoles">miércoles</option>
                <option value="jueves">jueves</option><option value="viernes">viernes</option><option value="sábado">sábado</option><option value="domingo">domingo</option>
              </select>
              <label>Hora apertura</label><input id="horario-apertura" type="time" />
              <label>Hora cierre</label><input id="horario-cierre" type="time" />
              <label>Intervalo (min)</label><input id="horario-intervalo" type="number" value="30" />
              <div style="display:flex;gap:8px;margin-top:8px">
                <button id="horario-save" class="btn">Guardar</button>
                <button id="horario-cancel" class="btn ghost">Cancelar</button>
              </div>
            </div>
          </div>
        </section>

        <!-- Barberos -->
        <section id="tab-barberos" class="admin-section" style="display:none">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <h2 style="margin:0">Barberos</h2>
            <div style="display:flex;gap:8px;align-items:center">
              <select id="barberos-barberia-filter"><option value="">Todas las barberías</option></select>
              <button id="btn-new-barbero" class="btn">Nuevo barbero</button>
            </div>
          </div>
          <div id="barberos-list" class="list"></div>

          <div id="barbero-form-wrap" style="margin-top:12px;display:none">
            <div class="card">
              <h3 id="barbero-form-title">Nuevo barbero</h3>
              <input type="hidden" id="barbero-id" />
              <label>Barbería</label><select id="barbero-barberia"></select>
              <label>Nombre</label><input id="barbero-nombre" type="text" />
              <label>Email</label><input id="barbero-email" type="email" />
              <label>Teléfono</label><input id="barbero-telefono" type="text" />
              <label>Contraseña (si nuevo o cambiar)</label><input id="barbero-password" type="password" />
              <div style="display:flex;gap:8px;margin-top:8px">
                <button id="barbero-save" class="btn">Guardar</button>
                <button id="barbero-cancel" class="btn ghost">Cancelar</button>
              </div>
            </div>
          </div>
        </section>

        <!-- Turnos -->
        <section id="tab-turnos" class="admin-section" style="display:none">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <h2 style="margin:0">Turnos</h2>
            <div style="display:flex;gap:8px;align-items:center">
              <select id="turnos-barberia-filter"><option value="">Todas</option></select>
              <select id="turnos-barbero-filter"><option value="">Barbero</option></select>
              <input id="turnos-fecha-filter" type="date" />
              <button id="turnos-refresh" class="btn">Filtrar</button>
            </div>
          </div>
          <div id="turnos-list" class="list"></div>
        </section>

        <!-- Citas -->
        <section id="tab-citas" class="admin-section" style="display:none">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <h2 style="margin:0">Citas recientes</h2>
            <div class="mini muted">Podés cancelar una cita desde aquí</div>
          </div>
          <div id="citas-list" class="list"></div>
        </section>

      </main>
    </div>
  </div>
</div>

<script>
  // pasar vars si querés
</script>
<script src="build/js/admin.js" type="module" defer></script>
