
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>404 — Página no encontrada</title>
  <link rel="stylesheet" href="build/css/app.css">
  <style>
    /* Pequeños ajustes locales para esta página */
    body { background: linear-gradient(180deg,#071025 0%,#071428 60%); }
    .notfound-wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; }
    .notfound-card { max-width:900px; width:100%; border-radius:14px; padding:28px; text-align:left; }
    .code { font-weight:800; font-size:48px; letter-spacing:2px; display:inline-block; min-width:92px; text-align:center; }
    .headline { font-size:20px; margin-bottom:6px; font-weight:700; }
    .muted { color:#94a3b8; }
    .small { font-size:13px; color:#cbd5e1; margin-top:12px; }
    .actions { margin-top:18px; display:flex; gap:8px; flex-wrap:wrap; }
  </style>
</head>
<body>
  <div class="notfound-wrap">
    <div class="card notfound-card">
      <div style="display:flex;gap:16px;align-items:center">
        <div class="code" aria-hidden="true">404</div>
        <div>
          <div class="headline">Página no encontrada</div>
          <div class="muted">La URL que buscás no existe o ya no está disponible.</div>
        </div>
      </div>

      <div style="margin-top:16px; color:#e6eef8">
        <p>Probá alguna de las siguientes opciones:</p>
        <ul style="margin-left:18px; margin-top:8px; color:#cbd5e1">
          <li>Volvé a la <a href="/" style="color:inherit; text-decoration:underline">página principal</a>.</li>
          <li>Buscá una barbería desde el inicio.</li>
          <li>Si llegaste desde un enlace, contactá al administrador o revisá la dirección.</li>
        </ul>
      </div>

      <div class="actions">
        <a class="btn" href="/">Ir al inicio</a>
        <button class="btn ghost" onclick="history.back()">Volver</button>
        <a class="btn ghost" href="mailto:soporte@tu-dominio.com">Contactar soporte</a>
      </div>

      <div class="small">Código: 404 · PediUnTurnito</div>
    </div>
  </div>
</body>
</html>
