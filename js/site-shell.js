"use strict";

(() => {
  const pageInitializers = {
    "archives-artwork": initializeMediaControls,
    "archives-stories": initializeStoryLibrary,
    "archives-breadcrumbs": initializeBreadcrumbLibrary,
    "talvaren-media": initializeMediaControls,
    "community-feedback": initializeFeedbackForm,
    "community-contact": initializeContactPanel
  };

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".site-wallpaper")?.setAttribute("aria-hidden", "true");
    initializeMobileViewport();
    initializeCurrentPage();
  });

  document.addEventListener("talvaren:contentloaded", initializeCurrentPage);

  function initializeMobileViewport() {
    const viewport = window.visualViewport;
    if (!viewport) return;

    let frame = 0;
    const update = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const layoutHeight = document.documentElement.clientHeight;
        const shift = Math.min(0, viewport.height - layoutHeight + viewport.offsetTop);
        document.documentElement.style.setProperty("--mobile-viewport-shift-y", `${Math.round(shift)}px`);
      });
    };

    viewport.addEventListener("resize", update, { passive: true });
    viewport.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    window.addEventListener("orientationchange", update, { passive: true });
    window.addEventListener("pageshow", update, { passive: true });
    update();
  }

  function initializeCurrentPage(event) {
    const itemId = event?.detail?.itemId || document.querySelector("#dynamicContent")?.dataset.currentItem;
    const initializer = pageInitializers[itemId];
    if (initializer) initializer();

    document.querySelectorAll("[data-current-year]").forEach(node => {
      node.textContent = String(new Date().getFullYear());
    });
  }


  function initializeBreadcrumbLibrary() {
    initializeLibraryControls();
    initializeMediaControls();
  }

  function initializeStoryLibrary() {
    initializeLibraryControls();
    const library = document.querySelector("[data-story-library]");
    if (!library || library.dataset.storyBound === "true") return;
    library.dataset.storyBound = "true";

    library.addEventListener("click", async event => {
      const trigger = event.target.closest("[data-story-src]");
      if (!trigger) return;
      const stage = library.querySelector("[data-story-stage]");
      const index = library.querySelector("[data-story-index]");
      if (!stage || !index) return;
      trigger.disabled = true;
      trigger.textContent = "Opening…";
      try {
        const response = await fetch(trigger.dataset.storySrc, { cache: "no-store" });
        if (!response.ok) throw new Error(`Story failed: ${response.status}`);
        const text = await response.text();
        const parsed = new DOMParser().parseFromString(text, "text/html");
        const story = parsed.querySelector("[data-story-content]");
        if (!story) throw new Error("Story content was not found.");
        stage.innerHTML = story.innerHTML;
        index.hidden = true;
        stage.hidden = false;
        stage.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch (error) {
        console.error(error);
        trigger.textContent = "Unable to open";
      } finally {
        trigger.disabled = false;
        if (trigger.textContent === "Opening…") trigger.textContent = "Read collection";
      }
    });

  }

  function initializeLibraryControls() {
    const library = document.querySelector("[data-filter-library]");
    const search = document.querySelector("[data-library-search]");
    if (!library || !search || search.dataset.bound === "true") return;

    search.dataset.bound = "true";
    const cards = [...library.querySelectorAll(".library-card")];
    const status = document.querySelector("[data-library-status]");

    const applyFilter = () => {
      const query = search.value.trim().toLowerCase();
      let visible = 0;
      cards.forEach(card => {
        const match = !query || card.textContent.toLowerCase().includes(query);
        card.hidden = !match;
        if (match) visible += 1;
      });
      if (status) status.textContent = `${visible} ${visible === 1 ? "entry" : "entries"} shown`;
    };

    search.addEventListener("input", applyFilter);
    applyFilter();
  }

  function initializeMediaControls() {
    document.querySelectorAll("[data-viewer-src]").forEach(button => {
      button.setAttribute("aria-haspopup", "dialog");
    });
  }

  function initializeFeedbackForm() {
    const form = document.querySelector("[data-feedback-form]");
    if (!form || form.dataset.bound === "true") return;
    form.dataset.bound = "true";

    const message = form.querySelector("[data-form-message]");
    form.addEventListener("submit", event => {
      event.preventDefault();
      const formData = new FormData(form);
      const subject = String(formData.get("subject") || "General feedback");
      const feedback = String(formData.get("feedback") || "").trim();
      if (!feedback) {
        if (message) message.textContent = "Please enter your feedback before continuing.";
        form.querySelector("[name='feedback']")?.focus();
        return;
      }

      const mailto = new URL("mailto:");
      mailto.searchParams.set("subject", `Talvaren Studios feedback: ${subject}`);
      mailto.searchParams.set("body", feedback);
      if (message) message.textContent = "Your email application is opening with the feedback prepared.";
      window.location.href = mailto.toString();
    });
  }

  function initializeContactPanel() {
    const copyButtons = document.querySelectorAll("[data-copy-value]");
    copyButtons.forEach(button => {
      if (button.dataset.bound === "true") return;
      button.dataset.bound = "true";
      button.addEventListener("click", async () => {
        const value = button.dataset.copyValue || "";
        try {
          await navigator.clipboard.writeText(value);
          const original = button.textContent;
          button.textContent = "Copied";
          window.setTimeout(() => { button.textContent = original; }, 1400);
        } catch {
          window.prompt("Copy this value:", value);
        }
      });
    });
  }

  window.Talvaren = Object.assign(window.Talvaren || {}, {
    version: "2.0-r20",
    shellReady: true,
    initializeCurrentPage
  });
})();
