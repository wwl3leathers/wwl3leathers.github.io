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

const params = new URLSearchParams(window.location.search);
const imageName = params.get("image");

const isArtwork = imageName && imageName.startsWith("a-");

let current = 0;

const image = document.getElementById("viewerImage");
const title = document.getElementById("imageTitle");

function loadImage(index){

    current = index;

    if(isArtwork){

        const imagePath = artwork[current];
        const fileName = imagePath.split("/").pop();

        title.textContent = "";

        image.src = imagePath;

        history.replaceState(
            null,
            "",
            "viewer.html?image=" + fileName
        );

    }else{

        title.textContent = breadcrumbs[current].title;

        image.src =
            "images/breadcrumbs/" +
            breadcrumbs[current].file;

        history.replaceState(
            null,
            "",
            "viewer.html?image=" +
            breadcrumbs[current].file
        );

    }

}

if(isArtwork){

    current = artwork.findIndex(path =>
        path.endsWith("/" + imageName)
    );

    if(current === -1)
        current = 0;

}else{

    current = breadcrumbs.findIndex(item =>
        item.file === imageName
    );

    if(current === -1)
        current = 0;

}

document.getElementById("prevBtn").onclick = ()=>{

    current--;

    if(current < 0)
        current = isArtwork
            ? artwork.length-1
            : breadcrumbs.length-1;

    loadImage(current);

};

document.getElementById("nextBtn").onclick = ()=>{

    current++;

    if(current >= (isArtwork ? artwork.length : breadcrumbs.length))
        current = 0;

    loadImage(current);

};

document.getElementById("closeBtn").onclick = ()=>{

    window.location.href = "archives.html";

};

image.onclick = ()=>{

    image.classList.toggle("zoomed");

};

loadImage(current);
