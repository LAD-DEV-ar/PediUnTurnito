const passwordInput = document.getElementById('password');
const togglePassBtn = document.querySelector('.toggle-pass');
const icon = togglePassBtn.querySelector('i');

togglePassBtn.addEventListener('click', () => {
  const isPasswordVisible = passwordInput.type === 'text';

  // Alterna el tipo del input
  passwordInput.type = isPasswordVisible ? 'password' : 'text';

  // Cambia el icono según el estado
  if (isPasswordVisible) {
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
    togglePassBtn.setAttribute('aria-label', 'Mostrar contraseña');
  } else {
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
    togglePassBtn.setAttribute('aria-label', 'Ocultar contraseña');
  }
});
