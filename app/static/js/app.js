// Progressive-enhancement helpers (no inline JS, so a strict CSP applies).

// Confirm before submitting any form carrying a data-confirm message.
document.addEventListener("submit", function (e) {
  var form = e.target;
  if (form.matches && form.matches("form[data-confirm]")) {
    if (!window.confirm(form.getAttribute("data-confirm"))) {
      e.preventDefault();
    }
  }
});

// Set progress-bar widths from data-bar-width (avoids inline styles under CSP).
document.addEventListener("DOMContentLoaded", function () {
  var bars = document.querySelectorAll("[data-bar-width]");
  bars.forEach(function (el) {
    var pct = Math.max(0, Math.min(100, parseFloat(el.getAttribute("data-bar-width")) || 0));
    el.style.width = pct + "%";
  });
});
