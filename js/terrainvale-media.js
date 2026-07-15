document.addEventListener("DOMContentLoaded", () => {

    "use strict";

    /* =====================================================
       TERRAINVALE FULLSCREEN MEDIA VIEWER
    ===================================================== */

    const imageElements = Array.from(
        document.querySelectorAll(".tool-screenshot")
    );

    const videoElements = Array.from(
        document.querySelectorAll(".tool-video")
    );

    const mediaElements = [
        ...imageElements,
        ...videoElements
    ];

    if (mediaElements.length === 0) {
        return;
    }

    /* =====================================================
       VIEWER STATE
    ===================================================== */

    let currentMediaIndex = -1;
    let currentMediaType = "";
    let previousFocusedElement = null;
    let viewerIsOpen = false;

    /* =====================================================
       CREATE VIEWER ELEMENTS
    ===================================================== */

    const viewer = document.createElement("div");
    viewer.className = "terrainvale-media-viewer";
    viewer.setAttribute("aria-hidden", "true");

    const viewerBackdrop = document.createElement("div");
    viewerBackdrop.className = "terrainvale-media-viewer__backdrop";

    const viewerDialog = document.createElement("div");
    viewerDialog.className = "terrainvale-media-viewer__dialog";
    viewerDialog.setAttribute("role", "dialog");
    viewerDialog.setAttribute("aria-modal", "true");
    viewerDialog.setAttribute(
        "aria-label",
        "Fullscreen media viewer"
    );
    viewerDialog.setAttribute("tabindex", "-1");

    const closeButton = document.createElement("button");
    closeButton.className = "terrainvale-media-viewer__close";
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "Close media viewer");
    closeButton.innerHTML = "&times;";

    const previousButton = document.createElement("button");
    previousButton.className =
        "terrainvale-media-viewer__navigation " +
        "terrainvale-media-viewer__navigation--previous";
    previousButton.type = "button";
    previousButton.setAttribute(
        "aria-label",
        "View previous media"
    );
    previousButton.innerHTML = "&#10094;";

    const nextButton = document.createElement("button");
    nextButton.className =
        "terrainvale-media-viewer__navigation " +
        "terrainvale-media-viewer__navigation--next";
    nextButton.type = "button";
    nextButton.setAttribute(
        "aria-label",
        "View next media"
    );
    nextButton.innerHTML = "&#10095;";

    const mediaStage = document.createElement("div");
    mediaStage.className = "terrainvale-media-viewer__stage";

    const fullscreenImage = document.createElement("img");
    fullscreenImage.className =
        "terrainvale-media-viewer__image";
    fullscreenImage.alt = "";
    fullscreenImage.hidden = true;

    const fullscreenVideo = document.createElement("video");
    fullscreenVideo.className =
        "terrainvale-media-viewer__video";
    fullscreenVideo.controls = true;
    fullscreenVideo.preload = "metadata";
    fullscreenVideo.playsInline = true;
    fullscreenVideo.hidden = true;

    const mediaCaption = document.createElement("div");
    mediaCaption.className =
        "terrainvale-media-viewer__caption";
    mediaCaption.hidden = true;

    const mediaCounter = document.createElement("div");
    mediaCounter.className =
        "terrainvale-media-viewer__counter";
    mediaCounter.setAttribute("aria-live", "polite");

    /* =====================================================
       BUILD VIEWER STRUCTURE
    ===================================================== */

    mediaStage.appendChild(fullscreenImage);
    mediaStage.appendChild(fullscreenVideo);

    viewerDialog.appendChild(closeButton);
    viewerDialog.appendChild(previousButton);
    viewerDialog.appendChild(mediaStage);
    viewerDialog.appendChild(nextButton);
    viewerDialog.appendChild(mediaCaption);
    viewerDialog.appendChild(mediaCounter);

    viewer.appendChild(viewerBackdrop);
    viewer.appendChild(viewerDialog);

    document.body.appendChild(viewer);

    /* =====================================================
       MEDIA IDENTIFICATION
    ===================================================== */

    function getMediaType(element) {

        if (element.matches("video")) {
            return "video";
        }

        if (
            element.dataset.mediaType &&
            element.dataset.mediaType.toLowerCase() === "video"
        ) {
            return "video";
        }

        return "image";
    }

    function getMediaSource(element, mediaType) {

        if (element.dataset.fullscreenSrc) {
            return element.dataset.fullscreenSrc;
        }

        if (mediaType === "video") {

            if (element.currentSrc) {
                return element.currentSrc;
            }

            if (element.src) {
                return element.src;
            }

            const sourceElement = element.querySelector("source");

            if (sourceElement && sourceElement.src) {
                return sourceElement.src;
            }

            return "";
        }

        return element.currentSrc || element.src || "";
    }

       /* =====================================================
       MEDIA CAPTION HELPERS
    ===================================================== */

    function getMediaCaption(element) {

        if (element.dataset.caption) {
            return element.dataset.caption.trim();
        }

        if (element.getAttribute("aria-label")) {
            return element.getAttribute("aria-label").trim();
        }

        if (element.alt) {
            return element.alt.trim();
        }

        const figureElement = element.closest("figure");

        if (figureElement) {

            const figcaptionElement =
                figureElement.querySelector("figcaption");

            if (figcaptionElement) {
                return figcaptionElement.textContent.trim();
            }
        }

        return "";
    }

    function getMediaAltText(element, caption) {

        if (element.alt && element.alt.trim()) {
            return element.alt.trim();
        }

        if (caption) {
            return caption;
        }

        return "TerrainVale media preview";
    }

    /* =====================================================
       VIDEO SOURCE MANAGEMENT
    ===================================================== */

    function clearFullscreenVideo() {

        fullscreenVideo.pause();
        fullscreenVideo.removeAttribute("src");

        while (fullscreenVideo.firstChild) {
            fullscreenVideo.removeChild(
                fullscreenVideo.firstChild
            );
        }

        fullscreenVideo.load();
    }

    function loadVideoSource(element) {

        clearFullscreenVideo();

        const sourceElements = Array.from(
            element.querySelectorAll("source")
        );

        if (sourceElements.length > 0) {

            sourceElements.forEach((sourceElement) => {

                const newSource =
                    document.createElement("source");

                newSource.src =
                    sourceElement.currentSrc ||
                    sourceElement.src;

                if (sourceElement.type) {
                    newSource.type = sourceElement.type;
                }

                fullscreenVideo.appendChild(newSource);
            });

            fullscreenVideo.load();
            return;
        }

        const videoSource = getMediaSource(
            element,
            "video"
        );

        if (videoSource) {
            fullscreenVideo.src = videoSource;
            fullscreenVideo.load();
        }
    }

    /* =====================================================
       VIEWER DISPLAY
    ===================================================== */

    function updateNavigationButtons() {

        const multipleMediaItems =
            mediaElements.length > 1;

        previousButton.hidden = !multipleMediaItems;
        nextButton.hidden = !multipleMediaItems;

        previousButton.disabled = !multipleMediaItems;
        nextButton.disabled = !multipleMediaItems;
    }

    function updateMediaCounter() {

        if (mediaElements.length <= 1) {
            mediaCounter.hidden = true;
            mediaCounter.textContent = "";
            return;
        }

        mediaCounter.hidden = false;
        mediaCounter.textContent =
            `${currentMediaIndex + 1} / ${mediaElements.length}`;
    }

    function displayMedia(index) {

        if (
            index < 0 ||
            index >= mediaElements.length
        ) {
            return;
        }

        const selectedElement = mediaElements[index];
        const selectedType =
            getMediaType(selectedElement);

        const selectedCaption =
            getMediaCaption(selectedElement);

        currentMediaIndex = index;
        currentMediaType = selectedType;

        fullscreenImage.hidden = true;
        fullscreenVideo.hidden = true;

        fullscreenImage.removeAttribute("src");
        fullscreenImage.alt = "";

        clearFullscreenVideo();

        if (selectedType === "video") {

            loadVideoSource(selectedElement);

            fullscreenVideo.poster =
                selectedElement.poster || "";

            fullscreenVideo.hidden = false;

        } else {

            const imageSource = getMediaSource(
                selectedElement,
                "image"
            );

            fullscreenImage.src = imageSource;

            fullscreenImage.alt = getMediaAltText(
                selectedElement,
                selectedCaption
            );

            fullscreenImage.hidden = false;
        }

        if (selectedCaption) {

            mediaCaption.textContent = selectedCaption;
            mediaCaption.hidden = false;

        } else {

            mediaCaption.textContent = "";
            mediaCaption.hidden = true;
        }

        updateNavigationButtons();
        updateMediaCounter();
    }

    /* =====================================================
       OPEN AND CLOSE VIEWER
    ===================================================== */

    function openViewer(index) {

        if (
            index < 0 ||
            index >= mediaElements.length
        ) {
            return;
        }

        previousFocusedElement =
            document.activeElement;

        displayMedia(index);

        viewer.classList.add(
            "terrainvale-media-viewer--open"
        );

        viewer.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "terrainvale-media-viewer-active"
        );

        viewerIsOpen = true;

        window.requestAnimationFrame(() => {
            closeButton.focus();
        });
    }

    function closeViewer() {

        if (!viewerIsOpen) {
            return;
        }

        fullscreenVideo.pause();

        viewer.classList.remove(
            "terrainvale-media-viewer--open"
        );

        viewer.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "terrainvale-media-viewer-active"
        );

        viewerIsOpen = false;
        currentMediaType = "";

        if (
            previousFocusedElement &&
            typeof previousFocusedElement.focus === "function"
        ) {
            previousFocusedElement.focus();
        }

        previousFocusedElement = null;
    }

    /* =====================================================
       MEDIA NAVIGATION
    ===================================================== */

    function showPreviousMedia() {

        if (mediaElements.length <= 1) {
            return;
        }

        let previousIndex =
            currentMediaIndex - 1;

        if (previousIndex < 0) {
            previousIndex =
                mediaElements.length - 1;
        }

        displayMedia(previousIndex);
    }

    function showNextMedia() {

        if (mediaElements.length <= 1) {
            return;
        }

        let nextIndex =
            currentMediaIndex + 1;

        if (nextIndex >= mediaElements.length) {
            nextIndex = 0;
        }

        displayMedia(nextIndex);
    }

         /* =====================================================
       EVENT HANDLERS
    ===================================================== */

    function handleMediaActivation(event) {

        event.preventDefault();

        const activatedElement = event.currentTarget;

        const mediaIndex =
            mediaElements.indexOf(
                activatedElement
            );

        if (mediaIndex !== -1) {
            openViewer(mediaIndex);
        }
    }

    function handleMediaKeydown(event) {

        const activationKeys = [
            "Enter",
            " "
        ];

        if (
            !activationKeys.includes(event.key)
        ) {
            return;
        }

        event.preventDefault();

        handleMediaActivation(event);
    }

    function handleViewerKeydown(event) {

        if (!viewerIsOpen) {
            return;
        }

        switch (event.key) {

            case "Escape":
                event.preventDefault();
                closeViewer();
                break;

            case "ArrowLeft":
                event.preventDefault();
                showPreviousMedia();
                break;

            case "ArrowRight":
                event.preventDefault();
                showNextMedia();
                break;

            case "Home":
                event.preventDefault();
                displayMedia(0);
                break;

            case "End":
                event.preventDefault();
                displayMedia(
                    mediaElements.length - 1
                );
                break;

            case "Tab":

                trapFocus(event);

                break;

            default:
                break;
        }
    }

    /* =====================================================
       FOCUS MANAGEMENT
    ===================================================== */

    function getFocusableElements() {

        return Array.from(

            viewer.querySelectorAll(

                'button, video, [href], [tabindex]:not([tabindex="-1"])'

            )

        ).filter((element) => {

            return (
                !element.hidden &&
                !element.disabled &&
                element.offsetParent !== null
            );

        });

    }

    function trapFocus(event) {

        const focusableElements =
            getFocusableElements();

        if (
            focusableElements.length === 0
        ) {
            return;
        }

        const firstElement =
            focusableElements[0];

        const lastElement =
            focusableElements[
                focusableElements.length - 1
            ];

        if (
            event.shiftKey &&
            document.activeElement === firstElement
        ) {

            event.preventDefault();
            lastElement.focus();
            return;
        }

        if (
            !event.shiftKey &&
            document.activeElement === lastElement
        ) {

            event.preventDefault();
            firstElement.focus();
        }
    }

    /* =====================================================
       CLICK HANDLERS
    ===================================================== */

    viewerBackdrop.addEventListener(
        "click",
        closeViewer
    );

    closeButton.addEventListener(
        "click",
        closeViewer
    );

    previousButton.addEventListener(
        "click",
        showPreviousMedia
    );

    nextButton.addEventListener(
        "click",
        showNextMedia
    );

    viewer.addEventListener(
        "keydown",
        handleViewerKeydown
    );

    /* =====================================================
       REGISTER MEDIA ELEMENTS
    ===================================================== */

    mediaElements.forEach((element) => {

        if (!element.hasAttribute("tabindex")) {
            element.tabIndex = 0;
        }

        if (!element.hasAttribute("role")) {
            element.setAttribute(
                "role",
                "button"
            );
        }

        if (
            !element.hasAttribute(
                "aria-label"
            )
        ) {

            const mediaType =
                getMediaType(element);

            element.setAttribute(

                "aria-label",

                mediaType === "video"
                    ? "Open video fullscreen"
                    : "Open image fullscreen"

            );
        }

        element.addEventListener(
            "click",
            handleMediaActivation
        );

        element.addEventListener(
            "keydown",
            handleMediaKeydown
        );

    });

    /* =====================================================
       CLEANUP ON PAGE HIDE
    ===================================================== */

    window.addEventListener(
        "pagehide",
        () => {

            fullscreenVideo.pause();

        }
    );

    window.addEventListener(
        "blur",
        () => {

            if (
                currentMediaType === "video"
            ) {

                fullscreenVideo.pause();

            }

        }
    );

});                     
