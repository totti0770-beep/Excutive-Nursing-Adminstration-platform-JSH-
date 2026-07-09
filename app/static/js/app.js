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
