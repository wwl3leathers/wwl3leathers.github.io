document.addEventListener("DOMContentLoaded", () => {

    const heroContent = document.getElementById("heroContent");

    const videoCards = document.querySelectorAll(
        '.media-card[data-media-type="video"]'
    );

    const imageCards = document.querySelectorAll(
        '.media-card[data-media-type="image"]'
    );

    const placeholderCards = document.querySelectorAll(
        '.media-card[data-media-type="placeholder"]'
    );

    function showVideo(videoId, title) {

        heroContent.innerHTML = `
            <iframe
                src="https://www.youtube-nocookie.com/embed/${videoId}"
                title="${title}"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen>
            </iframe>
        `;
    }

    function showImage(imageSource, altText) {

        heroContent.innerHTML = `
            <img
                src="${imageSource}"
                alt="${altText}">
        `;
    }

    videoCards.forEach((card) => {

        card.addEventListener("click", () => {

            const videoId = card.dataset.videoId;
            const title = card.querySelector("h3").textContent;

            showVideo(videoId, title);

        });

    });

    imageCards.forEach((card) => {

        card.addEventListener("click", () => {

            const imageSource = card.dataset.imageSource;
            const title = card.querySelector("h3").textContent;

            showImage(imageSource, title);

        });

    });

    placeholderCards.forEach((card) => {

        card.addEventListener("click", () => {

            showImage(
                "images/Logo-min.PNG",
                "More Talvaren media to come"
            );

        });

    });

    showVideo(
        "Y4BLEG5Ce8Y",
        "Talvaren - First Journey"
    );

});
