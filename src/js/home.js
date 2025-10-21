
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('search-input');
  const resultsList = document.getElementById('results-list');

  function createCard(b) {
    const div = document.createElement('div');
    div.className = 'item';
    div.dataset.barberiaId = b.id;
    div.innerHTML = `
      <div class="badge-pill">${(b.nombre||'').charAt(0).toUpperCase()}</div>
      <div style="flex:1">
        <strong>${escapeHtml(b.nombre)}</strong>
        <div class="mini">${escapeHtml(b.localidad || '')} — ${escapeHtml((b.calle||'') + ' ' + (b.altura||''))}</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <a class="btn ghost" href="/booking?barberia=${encodeURIComponent(b.id)}">Ver y reservar</a>
      </div>
    `;
    return div;
  }

  function render(results) {
    resultsList.innerHTML = '';
    if (!results || results.length === 0) {
      resultsList.innerHTML = '<div class="muted">No se encontraron barberías.</div>';
      return;
    }
    results.forEach(b => {
      resultsList.appendChild(createCard(b));
    });
  }

  // Debounce
  let timer = null;
  input.addEventListener('input', (e) => {
    const q = e.target.value.trim();
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fetchResults(q);
    }, 300);
  });

  function fetchResults(q) {
    const fd = new FormData();
    fd.append('q', q);
    fetch('/barberias/search', { method: 'POST', body: fd })
      .then(r => r.json())
      .then(json => {
        render(json.items || []);
      }).catch(() => {
        resultsList.innerHTML = '<div class="muted">Error al buscar. Intentá de nuevo.</div>';
      });
  }

  // helper: escape texto antes de inyectar
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // carga inicial: si input vacío, no hacemos request (ya se muestran featured en la vista)
});
