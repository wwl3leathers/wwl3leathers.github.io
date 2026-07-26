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
        : createZoomImageMarkup(src, title);

    const displayedMedia = frame
      ? `<div class="viewer-framed-media"><div class="viewer-framed-stage"><div class="viewer-framed-content${type === "youtube" || type === "video" ? " viewer-framed-content--video" : ""}">${mediaMarkup}</div><img class="viewer-media-frame" src="${escapeAttribute(frame)}" alt="" aria-hidden="true"></div></div>`
      : mediaMarkup;

    stage.innerHTML = `
      <section class="viewer-stage" aria-label="${escapeAttribute(title)}">
        <div class="viewer-content">${displayedMedia}</div>
      </section>`;
    stage.classList.add("viewer-stage-active");
    document.body.classList.remove("portal-landing-active", "talvaren-section-active");
    document.querySelector("#contentStage")?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });

    const zoomViewport = stage.querySelector("[data-zoom-viewport]");
    if (zoomViewport) initializeImageZoom(zoomViewport);
  });

  document.addEventListener("talvaren:contentloaded", clearViewerState);

  function createZoomImageMarkup(src, title) {
    return `
      <div class="viewer-zoom-viewport" data-zoom-viewport tabindex="0" aria-label="${escapeAttribute(title)}">
        <img class="viewer-zoom-image" data-zoom-image src="${escapeAttribute(src)}" alt="${escapeAttribute(title)}" draggable="false">
        <p class="viewer-zoom-hint" data-zoom-hint>Pinch or double-tap to zoom</p>
      </div>`;
  }

  function initializeImageZoom(viewport) {
    const image = viewport.querySelector("[data-zoom-image]");
    const hint = viewport.querySelector("[data-zoom-hint]");
    if (!image || viewport.dataset.zoomBound === "true") return;

    viewport.dataset.zoomBound = "true";

    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let lastTap = 0;
    let pinchStartDistance = 0;
    let pinchStartScale = 1;
    let pinchStartTranslateX = 0;
    let pinchStartTranslateY = 0;
    let pinchFocusX = 0;
    let pinchFocusY = 0;
    let singleTouchStartX = 0;
    let singleTouchStartY = 0;
    let singleTouchTranslateX = 0;
    let singleTouchTranslateY = 0;

    const maxScale = 4;

    const getDistance = (touches) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.hypot(dx, dy);
    };

    const getMidpoint = (touches) => ({
      x: ((touches[0].clientX + touches[1].clientX) / 2) - viewport.getBoundingClientRect().left,
      y: ((touches[0].clientY + touches[1].clientY) / 2) - viewport.getBoundingClientRect().top
    });

    const clampTranslation = () => {
      const baseWidth = image.offsetWidth;
      const baseHeight = image.offsetHeight;
      const viewportWidth = viewport.clientWidth;
      const viewportHeight = viewport.clientHeight;
      const scaledWidth = baseWidth * scale;
      const scaledHeight = baseHeight * scale;

      const minimumX = Math.min(0, viewportWidth - scaledWidth);
      const minimumY = Math.min(0, viewportHeight - scaledHeight);

      translateX = Math.min(0, Math.max(minimumX, translateX));
      translateY = Math.min(0, Math.max(minimumY, translateY));
    };

    const render = () => {
      clampTranslation();
      image.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
      image.classList.toggle("is-zoomed", scale > 1.01);
      if (hint) hint.hidden = scale > 1.01;
    };

    const reset = () => {
      scale = 1;
      translateX = 0;
      translateY = 0;
      render();
    };

    const zoomAt = (nextScale, focusX, focusY) => {
      const boundedScale = Math.min(maxScale, Math.max(1, nextScale));
      const imagePointX = (focusX - translateX) / scale;
      const imagePointY = (focusY - translateY) / scale;

      scale = boundedScale;
      translateX = focusX - imagePointX * scale;
      translateY = focusY - imagePointY * scale;
      render();
    };

    const toggleDoubleTapZoom = (clientX, clientY) => {
      const bounds = viewport.getBoundingClientRect();
      const focusX = clientX - bounds.left;
      const focusY = clientY - bounds.top;
      if (scale > 1.01) reset();
      else zoomAt(2.25, focusX, focusY);
    };

    image.addEventListener("load", render, { once: true });

    viewport.addEventListener("dblclick", event => {
      event.preventDefault();
      toggleDoubleTapZoom(event.clientX, event.clientY);
    });

    viewport.addEventListener("touchstart", event => {
      if (event.touches.length >= 2) {
        event.preventDefault();
        pinchStartDistance = getDistance(event.touches);
        pinchStartScale = scale;
        pinchStartTranslateX = translateX;
        pinchStartTranslateY = translateY;
        const midpoint = getMidpoint(event.touches);
        pinchFocusX = midpoint.x;
        pinchFocusY = midpoint.y;
        return;
      }

      const touch = event.touches[0];
      singleTouchStartX = touch.clientX;
      singleTouchStartY = touch.clientY;
      singleTouchTranslateX = translateX;
      singleTouchTranslateY = translateY;
    }, { passive: false });

    viewport.addEventListener("touchmove", event => {
      if (event.touches.length >= 2) {
        event.preventDefault();

        const distance = getDistance(event.touches);
        const midpoint = getMidpoint(event.touches);
        const nextScale = pinchStartScale * (distance / Math.max(1, pinchStartDistance));
        const focusX = midpoint.x;
        const focusY = midpoint.y;
        const imagePointX = (pinchFocusX - pinchStartTranslateX) / pinchStartScale;
        const imagePointY = (pinchFocusY - pinchStartTranslateY) / pinchStartScale;

        scale = Math.min(maxScale, Math.max(1, nextScale));
        translateX = focusX - imagePointX * scale;
        translateY = focusY - imagePointY * scale;
        render();
        return;
      }

      if (scale <= 1.01) return;

      event.preventDefault();
      const touch = event.touches[0];
      translateX = singleTouchTranslateX + (touch.clientX - singleTouchStartX);
      translateY = singleTouchTranslateY + (touch.clientY - singleTouchStartY);
      render();
    }, { passive: false });

    viewport.addEventListener("touchend", event => {
      if (event.touches.length > 0) return;

      const now = Date.now();
      const changedTouch = event.changedTouches[0];
      if (changedTouch && now - lastTap < 300) {
        event.preventDefault();
        toggleDoubleTapZoom(changedTouch.clientX, changedTouch.clientY);
        lastTap = 0;
      } else {
        lastTap = now;
      }
    }, { passive: false });

    viewport.addEventListener("touchcancel", reset, { passive: true });

    viewport.addEventListener("wheel", event => {
      if (!event.ctrlKey) return;
      event.preventDefault();

      const bounds = viewport.getBoundingClientRect();
      const focusX = event.clientX - bounds.left;
      const focusY = event.clientY - bounds.top;
      const nextScale = scale * (event.deltaY < 0 ? 1.12 : 0.89);
      zoomAt(nextScale, focusX, focusY);
    }, { passive: false });

    viewport.addEventListener("keydown", event => {
      if (event.key === "Escape") reset();
      if (event.key === "+" || event.key === "=") zoomAt(scale * 1.25, viewport.clientWidth / 2, viewport.clientHeight / 2);
      if (event.key === "-" || event.key === "_") zoomAt(scale * 0.8, viewport.clientWidth / 2, viewport.clientHeight / 2);
    });

    requestAnimationFrame(render);
  }

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
      "\"": "&quot;"
    })[character]);
  }
})();
