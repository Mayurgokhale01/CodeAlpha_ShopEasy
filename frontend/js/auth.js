const apiBase = 'http://localhost:3000/api';

async function handleAuth(event, endpoint) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const values = Object.fromEntries(formData.entries());

  const response = await fetch(`${apiBase}/auth/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values)
  });

  const result = await response.json();
  if (!response.ok) {
    document.getElementById('form-message').textContent = result.error || 'Auth failed';
    return;
  }

  localStorage.setItem('shopEasyToken', result.token);
  localStorage.setItem('shopEasyUser', JSON.stringify(result.user));
  window.location.href = 'index.html';
}

if (document.getElementById('login-form')) {
  document.getElementById('login-form').addEventListener('submit', (e) => handleAuth(e, 'login'));
}

if (document.getElementById('register-form')) {
  document.getElementById('register-form').addEventListener('submit', (e) => handleAuth(e, 'register'));
}
