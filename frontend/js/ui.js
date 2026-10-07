function showAlert(type, message) {
  const area = document.getElementById('alert-area');
  if (!area) return;

  const alertEl = document.createElement('div');
  alertEl.className = `alert alert-${type} alert-dismissible fade show`;
  alertEl.setAttribute('role', 'alert');
  alertEl.textContent = message;

  const dismissBtn = document.createElement('button');
  dismissBtn.type = 'button';
  dismissBtn.className = 'btn-close';
  dismissBtn.setAttribute('aria-label', 'Close');
  dismissBtn.addEventListener('click', () => alertEl.remove());

  alertEl.appendChild(dismissBtn);
  area.appendChild(alertEl);

  setTimeout(() => {
    if (alertEl.isConnected) {
      if (window.bootstrap && bootstrap.Alert) {
        bootstrap.Alert.getOrCreateInstance(alertEl).close();
      } else {
        alertEl.remove();
      }
    }
  }, 4000);
}
