"use strict";

(() => {
  function closeDialogs() {
    document.querySelectorAll(".entry-dialog[open]").forEach(dialog => dialog.close());
    document.body.classList.remove("entry-dialog-open");
  }

  document.addEventListener("click", event => {
    const opener = event.target.closest("[data-entry-dialog]");
    if (opener) {
      const dialog = document.getElementById(opener.dataset.entryDialog);
      if (!dialog || dialog.open) return;
      dialog.showModal();
      dialog.scrollTop = 0;
      document.body.classList.add("entry-dialog-open");
      return;
    }

    const closeButton = event.target.closest("[data-close-entry-dialog]");
    if (closeButton) closeButton.closest("dialog")?.close();

    // Only the backdrop closes the panel, not a click in its padding.
    if (event.target.matches(".entry-dialog")) {
      const bounds = event.target.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom) {
        event.target.close();
      }
    }

    if (event.target.closest("[data-placeholder-download]")) {
      const status = document.getElementById("download-status");
      if (status) status.textContent = "Downloads are not available yet. No agreement has been recorded.";
    }
  });

  document.addEventListener("close", event => {
    if (event.target.matches?.(".entry-dialog")) {
      document.body.classList.remove("entry-dialog-open");
    }
  }, true);

  window.addEventListener("popstate", closeDialogs);
  window.addEventListener("pagehide", closeDialogs);
  document.addEventListener("talvaren:contentloaded", closeDialogs);
})();
