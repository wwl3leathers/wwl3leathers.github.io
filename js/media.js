document.addEventListener("DOMContentLoaded", () => {

   "use strict";

   /* =====================================================
      REQUIRED PAGE ELEMENTS
   ===================================================== */

   const heroContent = document.getElementById("heroContent");
   const heroMirror = document.getElementById("heroMirror");
   const mirrorSection = heroMirror
       ? heroMirror.closest(".document")
       : null;

   const mediaRows = Array.from(
       document.querySelectorAll(".media-row")
   );

   if (!heroContent || !heroMirror || !mirrorSection) {

       console.error(
           "Talvaren Media: Mirror elements were not found."
       );

       return;
   }

   if (mediaRows.length < 2) {

       console.error(
           "Talvaren Media: Moving Visions or Captured Visions is missing."
       );

       return;
   }

   const videoRow = mediaRows[0];
   const imageRow = mediaRows[1];

   const videoCards = Array.from(
       videoRow.querySelectorAll(".media-card")
   );

   const imageCards = Array.from(
       imageRow.querySelectorAll(".media-card")
   );

   const videoArrows = Array.from(
       videoRow.querySelectorAll(".media-arrow")
   );

   const imageArrows = Array.from(
       imageRow.querySelectorAll(".media-arrow")
   );

   const groups = {
       video: {
           cards: videoCards,
           arrows: videoArrows
       },
       image: {
           cards: imageCards,
           arrows: imageArrows
       }
   };

   let currentGroup = "video";
   let currentIndex = 0;

   /* =====================================================
      SELF-CONTAINED INTERACTION STYLES
   ===================================================== */

   const interactionStyles = document.createElement("style");

   interactionStyles.textContent = `
       .media-card {
           font-family: Georgia, serif;
           cursor: pointer;
       }

       .media-card.active {
           border-color: #d8c5a2;
           box-shadow:
               0 0 0 2px rgba(216,197,162,.25),
               0 12px 28px rgba(0,0,0,.38);
       }

       .media-current-caption {
           width: min(1000px, 92%);
           margin: -55px auto 55px;
           padding: 22px 26px;
           color: #3a3125;
           text-align: center;
           background: rgba(214,198,160,.96);
           border: 1px solid rgba(77,58,34,.28);
           border-radius: 10px;
           box-shadow: 0 10px 26px rgba(0,0,0,.28);
       }

       .media-current-caption h2 {
           margin: 0 0 10px;
           color: #2c2419;
           font-size: 1.8rem;
       }

       .media-current-caption p {
           margin: 0;
           line-height: 1.65;
       }

       .media-expand-button {
           position: relative;
           z-index: 5;
           display: block;
           margin: 18px auto 0;
           padding: 10px 18px;
           color: #f1e3c3;
           font-family: Georgia, serif;
           font-size: 1rem;
           font-weight: bold;
           cursor: pointer;
           background: rgba(38,45,55,.92);
           border: 1px solid rgba(216,197,162,.55);
           border-radius: 8px;
           box-shadow: 0 6px 16px rgba(0,0,0,.30);
       }

       .media-expand-button:hover {
           background: rgba(65,76,90,.98);
           border-color: #d8c5a2;
       }

       .talvaren-media-overlay {
           position: fixed;
           inset: 0;
           z-index: 10000;
           display: flex;
           align-items: center;
           justify-content: center;
           padding: 74px 74px 118px;
           background: rgba(4,6,8,.97);
       }

       .talvaren-media-overlay[hidden] {
           display: none;
       }

       .talvaren-overlay-stage {
           position: relative;
           width: min(1800px, 88vw);
           aspect-ratio: 16 / 10;
       }

       .talvaren-overlay-content {
           position: absolute;
           top: 50%;
           left: 50%;
           z-index: 1;
           width: 75%;
           aspect-ratio: 16 / 9;
           transform: translate(-50%, calc(-50% - 12px));
           display: flex;
           align-items: center;
           justify-content: center;
           overflow: hidden;
           background: #050505;
       }

       .talvaren-overlay-content iframe,
       .talvaren-overlay-content img {
           width: 100%;
           height: 100%;
           display: block;
           border: 0;
           object-fit: contain;
       }

       .talvaren-overlay-frame {
           position: absolute;
           inset: 0;
           z-index: 2;
           width: 100%;
           height: 100%;
           object-fit: contain;
           pointer-events: none;
       }

       .talvaren-overlay-back {
           position: absolute;
           top: 18px;
           left: 18px;
           z-index: 4;
           padding: 11px 18px;
           color: #f3e6c8;
           font-family: Georgia, serif;
           font-size: 1rem;
           font-weight: bold;
           cursor: pointer;
           background: rgba(50,42,31,.96);
           border: 1px solid rgba(216,197,162,.62);
           border-radius: 8px;
       }

       .talvaren-overlay-arrow {
           position: absolute;
           top: 50%;
           z-index: 4;
           transform: translateY(-50%);
           padding: 18px;
           color: #f3e6c8;
           font-size: 3rem;
           line-height: 1;
           cursor: pointer;
           background: rgba(20,20,20,.70);
           border: 1px solid rgba(216,197,162,.42);
           border-radius: 10px;
       }

       .talvaren-overlay-left {
           left: 18px;
       }

       .talvaren-overlay-right {
           right: 18px;
       }

       body.talvaren-overlay-open {
           overflow: hidden;
       }

       @media (max-width: 768px) {
           .media-current-caption {
               width: 96%;
               margin: -20px auto 45px;
               padding: 18px;
           }

           .talvaren-media-overlay {
               padding: 70px 8px 145px;
           }

           .talvaren-overlay-stage {
               width: 98vw;
           }

           .talvaren-overlay-arrow {
               top: auto;
               bottom: 76px;
               transform: none;
               padding: 9px 18px;
               font-size: 2rem;
           }

           .talvaren-overlay-left {
               left: 24%;
           }

           .talvaren-overlay-right {
               right: 24%;
           }

           

           .talvaren-overlay-caption p {
               font-size: .82rem;
           }
       }
   `;

   document.head.appendChild(interactionStyles);

   /* =====================================================
      CAPTION BELOW THE NORMAL MIRROR
   ===================================================== */

   const caption = document.createElement("div");
   caption.className = "media-current-caption";

   const captionTitle = document.createElement("h2");
   const captionDescription = document.createElement("p");

   caption.appendChild(captionTitle);
   caption.appendChild(captionDescription);

   mirrorSection.insertAdjacentElement("afterend", caption);

   /* =====================================================
      FULL-SIZE BUTTON
   ===================================================== */

   const expandButton = document.createElement("button");

   expandButton.type = "button";
   expandButton.className = "media-expand-button";
   expandButton.textContent = "View Full Size";

   mirrorSection.appendChild(expandButton);

   /* =====================================================
      FULL-SCREEN VIEWER
   ===================================================== */

   const overlay = document.createElement("div");

   overlay.className = "talvaren-media-overlay";
   overlay.hidden = true;

   overlay.innerHTML = `
       <button
           class="talvaren-overlay-back"
           type="button"
           aria-label="Return to the Media page">
           ← Back
       </button>

       <button
           class="talvaren-overlay-arrow talvaren-overlay-left"
           type="button"
           aria-label="Previous vision">
           &#10094;
       </button>

       <div class="talvaren-overlay-stage">
           <div class="talvaren-overlay-content"></div>

           <img
               src="images/Talvaren_Mirror.PNG"
               alt=""
               class="talvaren-overlay-frame">
       </div>

       <button
           class="talvaren-overlay-arrow talvaren-overlay-right"
           type="button"
           aria-label="Next vision">
           &#10095;
       </button>

   `;

   document.body.appendChild(overlay);

   const overlayContent = overlay.querySelector(
       ".talvaren-overlay-content"
   );

   const overlayBack = overlay.querySelector(
       ".talvaren-overlay-back"
   );

   const overlayPrevious = overlay.querySelector(
       ".talvaren-overlay-left"
   );

   const overlayNext = overlay.querySelector(
       ".talvaren-overlay-right"
   );


   /* =====================================================
      MEDIA INFORMATION
   ===================================================== */

   function getCards(groupName) {

       return groups[groupName]?.cards || [];
   }

   function getMediaInformation(card) {

       const type = card.dataset.mediaType || "placeholder";
       const heading = card.querySelector("h3");
       const paragraph = card.querySelector("p");
       const thumbnail = card.querySelector("img");

       return {
           type,
           title:
               heading?.textContent.trim() ||
               "More to Come",
           description:
               paragraph?.textContent.trim() ||
               "More visions will be added.",
           videoId:
               card.dataset.videoId || "",
           imageSource:
               card.dataset.imageSource ||
               thumbnail?.getAttribute("src") ||
               "images/Logo-min.PNG"
       };
   }

   /* =====================================================
      CREATE MEDIA ELEMENTS
   ===================================================== */

   function createVideoElement(videoId, title, autoplay) {

       const iframe = document.createElement("iframe");

       const parameters = new URLSearchParams({
           autoplay: autoplay ? "1" : "0",
           rel: "0",
           playsinline: "1"
       });

       iframe.src =
           `https://www.youtube-nocookie.com/embed/${videoId}` +
           `?${parameters.toString()}`;

       iframe.title = title;

       iframe.allow =
           "accelerometer; autoplay; clipboard-write; " +
           "encrypted-media; gyroscope; picture-in-picture; " +
           "web-share";

       iframe.allowFullscreen = true;

       return iframe;
   }

   function createImageElement(source, title) {

       const image = document.createElement("img");

       image.src = source;
       image.alt = title;

       return image;
   }

   function placeMedia(container, media, autoplay) {

       container.replaceChildren();

       if (media.type === "video" && media.videoId) {

           container.appendChild(
               createVideoElement(
                   media.videoId,
                   media.title,
                   autoplay
               )
           );

           return;
       }

       container.appendChild(
           createImageElement(
               media.imageSource,
               media.title
           )
       );
   }

   /* =====================================================
      SELECT AND DISPLAY MEDIA
   ===================================================== */

   function normalizeIndex(groupName, index) {

       const cards = getCards(groupName);

       if (!cards.length) {
           return 0;
       }

       return (
           (index % cards.length) +
           cards.length
       ) % cards.length;
   }

   function markSelectedCard() {

       document
           .querySelectorAll(".media-card.active")
           .forEach((card) => {

               card.classList.remove("active");
           });

       const selectedCard =
           getCards(currentGroup)[currentIndex];

       selectedCard?.classList.add("active");
   }

   function updateNormalCaption(media) {

       captionTitle.textContent = media.title;
       captionDescription.textContent = media.description;
   }


   function selectMedia(groupName, index) {

       const cards = getCards(groupName);

       if (!cards.length) {
           return;
       }

       currentGroup = groupName;
       currentIndex = normalizeIndex(groupName, index);

       const card = cards[currentIndex];
       const media = getMediaInformation(card);

       markSelectedCard();
       placeMedia(heroContent, media, false);
       updateNormalCaption(media);
   }

   function moveCurrentSelection(amount) {

       selectMedia(
           currentGroup,
           currentIndex + amount
       );
   }

   /* =====================================================
      FULL-SCREEN FUNCTIONS
   ===================================================== */

   function renderFullScreen() {

       const cards = getCards(currentGroup);

       if (!cards.length) {
           return;
       }

       const media = getMediaInformation(
           cards[currentIndex]
       );

       placeMedia(overlayContent, media, false);
   }

   function openFullScreen() {

       renderFullScreen();

       overlay.hidden = false;

       document.body.classList.add(
           "talvaren-overlay-open"
       );
   }

   function closeFullScreen() {

       overlay.hidden = true;
       overlayContent.replaceChildren();

       document.body.classList.remove(
           "talvaren-overlay-open"
       );
   }

   function moveFullScreenSelection(amount) {

       moveCurrentSelection(amount);
       renderFullScreen();
   }

   /* =====================================================
      THUMBNAIL EVENTS
   ===================================================== */

   videoCards.forEach((card, index) => {

       card.addEventListener("click", () => {

           selectMedia("video", index);

           mirrorSection.scrollIntoView({
               behavior: "smooth",
               block: "center"
           });
       });
   });

   imageCards.forEach((card, index) => {

       card.addEventListener("click", () => {

           selectMedia("image", index);

           mirrorSection.scrollIntoView({
               behavior: "smooth",
               block: "center"
           });
       });
   });

   /* =====================================================
      NORMAL ROW ARROWS
   ===================================================== */

   function attachRowArrows(groupName) {

       const arrows = groups[groupName].arrows;
       const cards = groups[groupName].cards;

       if (arrows.length < 2 || !cards.length) {
           return;
       }

       arrows[0].addEventListener("click", () => {

           if (currentGroup !== groupName) {
               selectMedia(groupName, cards.length - 1);
               return;
           }

           moveCurrentSelection(-1);
       });

       arrows[1].addEventListener("click", () => {

           if (currentGroup !== groupName) {
               selectMedia(groupName, 0);
               return;
           }

           moveCurrentSelection(1);
       });
   }

   attachRowArrows("video");
   attachRowArrows("image");

   /* =====================================================
      OPEN FULL-SCREEN
   ===================================================== */

   expandButton.addEventListener(
       "click",
       openFullScreen
   );

   heroMirror.addEventListener(
       "click",
       openFullScreen
   );

   heroContent.addEventListener("click", (event) => {

       if (event.target.tagName === "IMG") {
           openFullScreen();
       }
   });

   /* =====================================================
      FULL-SCREEN CONTROLS
   ===================================================== */

   overlayBack.addEventListener(
       "click",
       closeFullScreen
   );

   overlayPrevious.addEventListener("click", () => {

       moveFullScreenSelection(-1);
   });

   overlayNext.addEventListener("click", () => {

       moveFullScreenSelection(1);
   });

   overlay.addEventListener("click", (event) => {

       if (event.target === overlay) {
           closeFullScreen();
       }
   });

   document.addEventListener("keydown", (event) => {

       if (overlay.hidden) {
           return;
       }

       if (event.key === "Escape") {
           closeFullScreen();
       } else if (event.key === "ArrowLeft") {
           moveFullScreenSelection(-1);
       } else if (event.key === "ArrowRight") {
           moveFullScreenSelection(1);
       }
   });

   /* =====================================================
      MOBILE SWIPE IN FULL-SCREEN
   ===================================================== */

   let touchStartX = null;

   overlay.addEventListener(
       "touchstart",
       (event) => {

           touchStartX =
               event.changedTouches[0].clientX;
       },
       { passive: true }
   );

   overlay.addEventListener(
       "touchend",
       (event) => {

           if (touchStartX === null) {
               return;
           }

           const touchEndX =
               event.changedTouches[0].clientX;

           const difference = touchEndX - touchStartX;

           touchStartX = null;

           if (Math.abs(difference) < 50) {
               return;
           }

           if (difference > 0) {
               moveFullScreenSelection(-1);
           } else {
               moveFullScreenSelection(1);
           }
       },
       { passive: true }
   );

   /* =====================================================
      INITIAL PAGE STATE
   ===================================================== */

   selectMedia("video", 0);
});
