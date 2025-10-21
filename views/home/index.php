<?php
// views/home/index.php
// Variables: $featured (array de barberias)
?>

<div class="booking-root">
  <div class="container" style="grid-template-columns: 1fr; padding: 12px;">
    <main class="main" style="border-radius:14px; padding:18px;">
      <div class="card" style="margin-bottom:16px">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
          <div>
            <h1 style="margin:0">Buscá una barbería</h1>
            <div class="mini">Encontrá la barbería donde querés reservar</div>
          </div>
          <div style="min-width:260px">
            <input id="search-input" type="text" placeholder="Nombre, localidad o calle..." style="width:100%; padding:10px; border-radius:10px; border:1px solid rgba(255,255,255,0.04); background:transparent; color:inherit" />
          </div>
        </div>
      </div>

      <section id="results" class="card">
        <h2 style="margin:0 0 10px 0">Resultados</h2>
        <div id="results-list" class="list">
          <?php if(!empty($featured)): ?>
            <?php foreach($featured as $b): ?>
              <div class="item" data-barberia-id="<?= s($b->id) ?>">
                <div class="badge-pill"><?= strtoupper(substr($b->nombre,0,1)) ?></div>
                <div style="flex:1">
                  <strong><?= s($b->nombre) ?></strong>
                  <div class="mini"><?= s($b->localidad) ?> — <?= s($b->calle) ?> <?= s($b->altura) ?></div>
                </div>
                <div style="display:flex;gap:8px;align-items:center">
                  <a class="btn ghost" href="/booking?barberia=<?= s($b->id) ?>">Ver y reservar</a>
                </div>
              </div>
            <?php endforeach; ?>
          <?php else: ?>
            <div class="muted">No hay barberías registradas.</div>
          <?php endif; ?>
        </div>
      </section>
    </main>
  </div>
</div>



<script>
  // opcional: pasamos baseUrl u otras vars si querés
  window.__HOME_DATA = window.__HOME_DATA || {};
</script>
<script type="module" src="build/js/home.js" defer></script>
