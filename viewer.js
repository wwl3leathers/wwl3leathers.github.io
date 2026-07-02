const breadcrumbs = [
    { title:"Brownies", file:"brownies.PNG" },
    { title:"Church Grimm", file:"church-grimm.PNG" },
    { title:"Domovoi", file:"domovoi.PNG" },
    { title:"Dryads", file:"dryads.PNG" },
    { title:"Elves", file:"elves.PNG" },
    { title:"Fairy Rings", file:"fairy-rings.PNG" },
    { title:"Green Lights", file:"green-lights.PNG" },
    { title:"Kobolds", file:"kobolds.PNG" },
    { title:"Old Man Winter", file:"old-man-winter.PNG" },
    { title:"Phantom Roads", file:"phantom-roads.PNG" },
    { title:"Selkies", file:"selkies.PNG" },
    { title:"Strange Gifts – Part I", file:"strange-gifts-part-1.PNG" },
    { title:"Strange Gifts – Part II", file:"strange-gifts-part-2.PNG" },
    { title:"Strange Gifts – Part III", file:"strange-gifts-part-3.PNG" },
    { title:"The Guiding Hand", file:"the-guiding-hand.PNG" },
    { title:"The Hidden Hearth", file:"the-hidden-hearth.PNG" },
    { title:"Tommyknockers", file:"tommyknockers.PNG" }
];

// artwork.js must define:
// const artwork = [
//     { file:"a-amber.PNG" },
//     { file:"a-brix.PNG" },
//     ...
// ];

const params = new URLSearchParams(window.location.search);

const imageName = params.get("image");

const isArtwork = imageName && imageName.startsWith("a-");

const collection = isArtwork ? artwork : breadcrumbs;

let current = collection.findIndex(item => item.file === imageName);

if (current === -1)
    current = 0;

const image = document.getElementById("viewerImage");
const title = document.getElementById("imageTitle");

function loadImage(index){

    current = index;

    if(collection[current].title)
        title.textContent = collection[current].title;
    else
        title.textContent = "";

    image.src = isArtwork
        ? "images/artwork/" + collection[current].file
        : "images/breadcrumbs/" + collection[current].file;
}

document.getElementById("prevBtn").addEventListener("click",()=>{

    current--;

    if(current < 0)
        current = collection.length - 1;

    loadImage(current);

});

document.getElementById("nextBtn").addEventListener("click",()=>{

    current++;

    if(current >= collection.length)
        current = 0;

    loadImage(current);

});

document.getElementById("closeBtn").addEventListener("click",()=>{

    window.location.href = "archives.html";

});

image.addEventListener("click",()=>{

    image.classList.toggle("zoomed");

});

loadImage(current);
