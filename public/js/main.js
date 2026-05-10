// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (btn && menu) {
    btn.addEventListener('click', function() {
      menu.classList.toggle('hidden');
    });
  }

  // Auto-close alerts
  document.querySelectorAll('.alert-auto-close').forEach(function(el) {
    setTimeout(function() {
      el.style.display = 'none';
    }, 5000);
  });
});
