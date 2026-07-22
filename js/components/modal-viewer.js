"use strict";

(() => {
  document.addEventListener("click", event => {
    const trigger = event.target.closest("[data-viewer-src], [data-viewer-youtube]");
    if (!trigger) return;

    const stage = document.querySelector("#dynamicContent");
    if (!stage) return;

    const youtubeId = trigger.dataset.viewerYoutube;
    const src = trigger.dataset.viewerSrc;
    if (!src && !youtubeId) return;

    event.preventDefault();

    const type = youtubeId ? "youtube" : (trigger.dataset.viewerType || inferType(src));
    const title = trigger.dataset.viewerTitle || trigger.getAttribute("aria-label") || "Expanded media";
    const frame = trigger.dataset.viewerFrame;

    const mediaMarkup = type === "youtube"
      ? `<iframe src="https://www.youtube-nocookie.com/embed/${escapeAttribute(youtubeId)}?autoplay=1" title="${escapeAttribute(title)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`
      : type === "video"
        ? `<video src="${escapeAttribute(src)}" controls autoplay playsinline></video>`
        : `<img src="${escapeAttribute(src)}" alt="${escapeAttribute(title)}">`;

    const displayedMedia = frame
      ? `<div class="viewer-framed-media"><div class="viewer-framed-stage"><div class="viewer-framed-content">${mediaMarkup}</div><img class="viewer-media-frame" src="${escapeAttribute(frame)}" alt="" aria-hidden="true"></div></div>`
      : mediaMarkup;

    stage.innerHTML = `
      <section class="viewer-stage" aria-label="${escapeAttribute(title)}">
        <div class="viewer-content">${displayedMedia}</div>
      </section>`;
    stage.classList.add("viewer-stage-active");
    document.body.classList.remove("portal-landing-active", "talvaren-section-active");
    document.querySelector("#contentStage")?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.addEventListener("talvaren:contentloaded", clearViewerState);

  function clearViewerState() {
    document.querySelector("#dynamicContent")?.classList.remove("viewer-stage-active");
  }

  function inferType(src) {
    return /\.(mp4|webm|mov)(\?|$)/i.test(src) ? "video" : "image";
  }

  function escapeAttribute(value) {
    return String(value).replace(/[&<>\"]/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '\"': "&quot;"
    })[character]);
  }
})();
