/** Sign-in page controller: posts credentials, redirects into the app on success. */

const form = document.getElementById('loginForm');
const roleInput = document.getElementById('role');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const errorBox = document.getElementById('loginError');
const btn = document.getElementById('loginBtn');

document.getElementById('demoTbl').addEventListener('click', (e) => {
  const row = e.target.closest('tr[data-username]');
  if (!row) return;
  usernameInput.value = row.dataset.username;
  passwordInput.value = row.dataset.password;
  usernameInput.focus();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorBox.hidden = true;
  btn.disabled = true;
  btn.textContent = 'Signing in…';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: roleInput.value,
        username: usernameInput.value.trim(),
        password: passwordInput.value
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error?.message || 'Sign in failed');
    window.location.href = '/';
  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.hidden = false;
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
});
