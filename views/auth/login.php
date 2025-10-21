<main>
  <h1>Inicio de Sesion</h1>
  <p>Inicia con tu usuario para empezar a usar PediUnTurnito</p>

  <form method="POST" action="/login" class="form-auth" novalidate>
    <div class="field">
        <label for="email">Email</label>
        <input id="email" name="email" type="email" required value="<?= htmlspecialchars($email ?? '') ?>" />
      </div>

      <div class="field">
        <label for="password">Contraseña</label>
        <div class="password-field">
          <input id="password" name="password" type="password" required />
          <button type="button" class="toggle-pass" aria-label="Mostrar contraseña"><i class="fa-solid fa-eye"></i></button>
        </div>
      </div>

      <div class="auth-actions">
        <button type="submit" class="btn btn--primary">Entrar</button>
      </div>

      <div class="auth-footer">
        <a class="" href="/registro">Crear cuenta</a>
        <a class="" href="/olvide">¿Olvidaste tu contraseña?</a>
      </div>
  </form>
</main>

<script src="build/js/helperLogin.js" defer></script>
