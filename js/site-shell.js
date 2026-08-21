"use strict";

(() => {
  const pageInitializers = {
    "archives-artwork": initializeMediaControls,
    "archives-stories": initializeStoryLibrary,
    "archives-breadcrumbs": initializeBreadcrumbLibrary,
    "talvaren-media": initializeMediaControls,
    "community-feedback": initializeFeedbackForm
  };

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".site-wallpaper")?.setAttribute("aria-hidden", "true");
    initializeMobileViewport();
    initializeCurrentPage();
  });

  document.addEventListener("talvaren:contentloaded", initializeCurrentPage);

  function initializeMobileViewport() {
    const viewport = window.visualViewport;

    document.addEventListener("focusin", updateMobileFormEntryState);
    document.addEventListener("focusout", () => window.setTimeout(updateMobileFormEntryState, 0));
    window.addEventListener("pageshow", updateMobileFormEntryState, { passive: true });
    updateMobileFormEntryState();

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

  function updateMobileFormEntryState() {
    const activeElement = document.activeElement;
    const isFeedbackControl = Boolean(
      activeElement?.closest?.("[data-feedback-form]") &&
      activeElement.matches("input:not([type=\"hidden\"]), textarea, select")
    );
    document.body.classList.toggle("mobile-form-entry-active", isFeedbackControl);
  }

  function collapseMobileSecondaryNavigation(itemId) {
    if (!itemId || !window.matchMedia("(max-width: 900px)").matches) return;
    const mobileSecondary = document.querySelector("#mobileSecondaryNavigation");
    if (!mobileSecondary) return;
    mobileSecondary.hidden = true;
    document.body.classList.add("mobile-secondary-collapsed");
    document.body.classList.remove("mobile-secondary-expanded");
  }

  function initializeCurrentPage(event) {
    const itemId = event?.detail?.itemId || document.querySelector("#dynamicContent")?.dataset.currentItem;
    const initializer = pageInitializers[itemId];
    collapseMobileSecondaryNavigation(itemId);
    if (initializer) initializer();

    initializeShareButtons();

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
      button.removeAttribute("aria-haspopup");
    });
  }

  function initializeFeedbackForm() {
    const form = document.querySelector("[data-feedback-form]");
    if (!form || form.dataset.bound === "true") return;
    form.dataset.bound = "true";

    const message = form.querySelector("[data-form-message]");
    const success = form.closest(".page-document")?.querySelector("[data-feedback-success]");
    const params = new URLSearchParams(window.location.search);

    if (params.get("feedback") === "sent") {
      if (success) {
        success.hidden = false;
        window.requestAnimationFrame(() => {
          const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          success.focus({ preventScroll: true });
          success.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
        });
      }

      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete("feedback");
      history.replaceState(
        history.state,
        "",
        `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`
      );
    }

    form.addEventListener("submit", () => {
      if (success) success.hidden = true;
      if (message) message.textContent = "Sending your feedback to Talvaren Studios…";
    });
  }

  function initializeShareButtons() {
    document.querySelectorAll("[data-share-button]").forEach(button => {
      if (button.dataset.shareBound === "true") return;
      button.dataset.shareBound = "true";

      button.addEventListener("click", async () => {
        const shareData = {
          title: button.dataset.shareTitle || document.title || "Talvaren Studios",
          text: button.dataset.shareText || "Explore Talvaren Studios.",
          url: window.location.href
        };

        try {
          if (navigator.share) {
            await navigator.share(shareData);
            return;
          }

          await navigator.clipboard.writeText(shareData.url);
          const original = button.textContent;
          button.textContent = "Link Copied";
          window.setTimeout(() => { button.textContent = original; }, 1600);
        } catch (error) {
          if (error?.name === "AbortError") return;
          window.prompt("Copy this link:", shareData.url);
        }
      });
    });
  }

  window.Talvaren = Object.assign(window.Talvaren || {}, {
    version: "2.0-r24",
    shellReady: true,
    initializeCurrentPage
  });
})();
