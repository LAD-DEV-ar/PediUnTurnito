<?php
// views/booking/index.php
// Variables provistas por Router->render: $services (array de Service), $barbers (array de Usuario)
// Usamos la función s() para escapar outputs
?>


<div class="booking-root">
  <div class="container">
    <aside class="aside">
      <div class="logo">
        <div class="mark">B</div>
        <div>
          <strong>PediUnTurnito</strong>
          <div class="mini">Reservá tu turno</div>
        </div>
      </div>

      <h1>Paso a paso</h1>
      <div class="lead">Completa los pasos para confirmar tu reserva. Podés volver hacia atrás en cualquier momento.</div>

      <div id="stepper" style="margin-top:12px"></div>

      <div class="card" style="margin-top:18px">
        <div class="mini">Resumen</div>
        <div id="resumen-mini" style="margin-top:8px">
          <div class="row"><div class="muted">Servicio</div><div id="mini-servicio">-</div></div>
          <div class="row"><div class="muted">Barbero</div><div id="mini-barbero">-</div></div>
          <div class="row"><div class="muted">Fecha</div><div id="mini-fecha">-</div></div>
          <div class="row"><div class="muted">Hora</div><div id="mini-hora">-</div></div>
        </div>
      </div>
    </aside>

    <main class="main">
      <!-- STEP 1: Selección servicio + barbero -->
      <section id="step-1" class="card">
        <h2>1) Elegí servicio</h2>
        <div id="lista-servicios" class="list" style="margin-top:10px">
          <?php foreach($services as $s): ?>
            <div class="item" data-service-id="<?= s($s->id) ?>"
                 data-duracion="<?= s($s->duracion_min) ?>"
                 data-precio="<?= s($s->precio) ?>">
              <div class="badge">✂️</div>
              <div style="flex:1">
                <strong><?= s($s->nombre) ?></strong>
                <div class="mini"><?= s($s->duracion_min) ?> min · $<?= s($s->precio) ?></div>
              </div>
            </div>
          <?php endforeach; ?>
        </div>

        <div class="card" style="margin-top:12px">
          <strong>Elegí barbero</strong>
          <div id="barber-list" class="list" style="margin-top:8px">
            <?php foreach($barbers as $b): ?>
              <div class="item" data-barber-id="<?= s($b->id) ?>" data-nombre="<?= s($b->nombre) ?>">
                <div class="badge">👤</div>
                <div style="flex:1">
                  <strong><?= s($b->nombre) ?></strong>
                  <div class="mini"><?= s($b->telefono ?? '') ?></div>
                </div>
              </div>
            <?php endforeach; ?>
          </div>
        </div>
      </section>

      <!-- STEP 2: Fecha -->
      <section id="step-2" class="card" style="display:none">
        <h2>2) Elegí fecha</h2>
        <input id="input-fecha" type="date" style="padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.04);background:transparent;color:inherit" />
      </section>

      <!-- STEP 3: Horarios -->
      <section id="step-3" class="card" style="display:none">
        <h2>3) Elegí horario</h2>
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
          <div class="chip">Intervalo base: <strong id="interval-label">30 min</strong></div>
          <div class="chip">Duración: <strong id="duracion-label">-</strong></div>
          <div class="chip">Barbero: <strong id="selected-barbero-label">-</strong></div>
        </div>
        <div id="times-container" class="times"></div>
      </section>

      <!-- STEP 4: Confirmación -->
      <section id="step-4" class="card" style="display:none">
        <h2>4) Confirmá</h2>
        <div class="summary card" style="padding:12px">
          <div class="row"><div>Servicio</div><div id="conf-servicio">-</div></div>
          <div class="row"><div>Barbero</div><div id="conf-barbero">-</div></div>
          <div class="row"><div>Fecha</div><div id="conf-fecha">-</div></div>
          <div class="row"><div>Hora</div><div id="conf-hora">-</div></div>
        </div>

        <label for="input-nombre" class="mini" style="margin-top:8px;display:block">Tu nombre</label>
        <input id="input-nombre" placeholder="Tu nombre" style="width:100%;padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,0.04);background:transparent;color:inherit;margin-top:6px" />
      </section>

      <div class="controls" style="margin-top:14px">
        <button id="back-btn" class="btn ghost" disabled>Volver</button>
        <div style="flex:1"></div>
        <button id="next-btn" class="btn" disabled>Siguiente</button>
      </div>
    </main>
  </div>
</div>

<script>
  // Datos para el frontend si querés pasarlos desde PHP (opcional)
  window.__BOOKING_DATA = window.__BOOKING_DATA || {};
</script>
<script src="build/js/booking.js" defer></script>
