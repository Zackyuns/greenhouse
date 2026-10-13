document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const loginBtn = document.getElementById('loginBtn');
  const loginBtnText = document.getElementById('loginBtnText');
  const loginSpinner = document.getElementById('loginSpinner');
  const errorMessage = document.getElementById('errorMessage');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const rememberMeCheckbox = document.getElementById('rememberMe');

  // Cek apakah sudah login
  checkExistingSession();

  // Handle form submit
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const rememberMe = rememberMeCheckbox.checked;

    if (!username || !password) {
      showError('Username dan password harus diisi');
      return;
    }

    await login(username, password, rememberMe);
  });

  // Fungsi login
  async function login(username, password, rememberMe) {
    try {
      // Disable button
      setLoading(true);
      hideError();

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Simpan token dan user info
        if (rememberMe) {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          sessionStorage.setItem('authToken', data.token);
          sessionStorage.setItem('user', JSON.stringify(data.user));
        }

        // Redirect ke dashboard
        window.location.href = 'index.html';
      } else {
        showError(data.message || 'Login gagal. Periksa username dan password Anda.');
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('Terjadi kesalahan koneksi. Pastikan server backend berjalan.');
    } finally {
      setLoading(false);
    }
  }

  // Cek session yang sudah ada
  function checkExistingSession() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
      // Sudah login, redirect ke dashboard
      window.location.href = 'index.html';
    }
  }

  // Set loading state
  function setLoading(isLoading) {
    loginBtn.disabled = isLoading;
    loginBtnText.style.display = isLoading ? 'none' : 'inline';
    loginSpinner.style.display = isLoading ? 'inline-block' : 'none';
  }

  // Show error message
  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
  }

  // Hide error message
  function hideError() {
    errorMessage.style.display = 'none';
  }

  // Clear error saat user mengetik
  usernameInput.addEventListener('input', hideError);
  passwordInput.addEventListener('input', hideError);
});
