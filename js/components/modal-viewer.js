"use strict";

(() => {
  let modal;
  let content;
  let caption;
  let previousFocus;
  let zoomLevel = 1;

  document.addEventListener("DOMContentLoaded", initializeViewer);

  function initializeViewer() {
    modal = document.createElement("div");
    modal.className = "viewer-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Media viewer");
    modal.innerHTML = `
      <div class="viewer-dialog">
        <button class="viewer-close" type="button" aria-label="Close viewer">×</button>
        <div class="viewer-content"></div>
        <div class="viewer-controls" aria-label="Image controls">
          <button type="button" data-viewer-zoom-out aria-label="Zoom out">−</button>
          <button type="button" data-viewer-zoom-reset>100%</button>
          <button type="button" data-viewer-zoom-in aria-label="Zoom in">+</button>
          <button type="button" data-viewer-print>Print</button>
        </div>
        <p class="viewer-caption" hidden></p>
      </div>`;
    document.body.appendChild(modal);
    content = modal.querySelector(".viewer-content");
    caption = modal.querySelector(".viewer-caption");

    document.addEventListener("click", handleViewerClick);
    document.addEventListener("keydown", event => {
      if (!modal.classList.contains("open")) return;
      if (event.key === "Escape") {
        closeViewer();
        return;
      }
      if (event.key === "Tab") trapFocus(event);
    });
  }

  function handleViewerClick(event) {
    if (event.target.closest("[data-viewer-zoom-out]")) {
      setZoom(zoomLevel - 0.5);
      return;
    }
    if (event.target.closest("[data-viewer-zoom-reset]")) {
      setZoom(1);
      return;
    }
    if (event.target.closest("[data-viewer-zoom-in]")) {
      setZoom(zoomLevel + 0.5);
      return;
    }
    if (event.target.closest("[data-viewer-print]")) {
      window.print();
      return;
    }
    const trigger = event.target.closest("[data-viewer-src], [data-viewer-youtube]");
    if (trigger) {
      openViewer(trigger);
      return;
    }

    if (event.target === modal || event.target.closest(".viewer-close")) closeViewer();
  }

  function openViewer(trigger) {
    const youtubeId = trigger.dataset.viewerYoutube;
    const src = trigger.dataset.viewerSrc;
    if (!src && !youtubeId) return;

    previousFocus = document.activeElement;
    const type = youtubeId ? "youtube" : (trigger.dataset.viewerType || inferType(src));
    const title = trigger.dataset.viewerTitle || trigger.getAttribute("aria-label") || "";
    const frame = trigger.dataset.viewerFrame;

    const mediaMarkup = type === "youtube"
      ? `<iframe src="https://www.youtube-nocookie.com/embed/${escapeAttribute(youtubeId)}?autoplay=1" title="${escapeAttribute(title)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`
      : type === "video"
        ? `<video src="${escapeAttribute(src)}" controls autoplay playsinline></video>`
        : `<img src="${escapeAttribute(src)}" alt="${escapeAttribute(title)}">`;

    content.innerHTML = frame
      ? `<div class="viewer-framed-media"><div class="viewer-framed-stage"><div class="viewer-framed-content">${mediaMarkup}</div><img class="viewer-media-frame" src="${escapeAttribute(frame)}" alt="" aria-hidden="true"></div></div>`
      : mediaMarkup;

    const controls = modal.querySelector(".viewer-controls");
    controls.hidden = type !== "image";
    setZoom(1);

    caption.textContent = title;
    caption.hidden = !title;
    modal.classList.add("open");
    document.body.classList.add("no-scroll");
    modal.querySelector(".viewer-close").focus();
  }

  function closeViewer() {
    modal.classList.remove("open");
    document.body.classList.remove("no-scroll");
    content.innerHTML = "";
    setZoom(1);
    previousFocus?.focus?.();
  }

  function setZoom(nextLevel) {
    zoomLevel = Math.min(4, Math.max(1, nextLevel));
    const image = content?.querySelector("img:not(.viewer-media-frame)");
    if (image) image.style.transform = `scale(${zoomLevel})`;
    const reset = modal?.querySelector("[data-viewer-zoom-reset]");
    if (reset) reset.textContent = `${Math.round(zoomLevel * 100)}%`;
  }

  function trapFocus(event) {
    const focusable = [...modal.querySelectorAll("button,[href],video[controls],[tabindex]:not([tabindex='-1'])")];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  function inferType(src) {
    return /\.(mp4|webm|mov)(\?|$)/i.test(src) ? "video" : "image";
  }

  function escapeAttribute(value) {
    return String(value).replace(/[&<>"]/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;"
    })[character]);
  }
})();
