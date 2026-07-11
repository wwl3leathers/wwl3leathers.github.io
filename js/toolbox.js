const STORAGE_KEY = "terrainvale-toolbox";

const checkboxes = document.querySelectorAll(
    ".toolbox-select input[type='checkbox']"
);

function loadSelections() {
    const saved =
        JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    checkboxes.forEach(box => {
        box.checked = saved.includes(box.dataset.toolId);
    });
}

function saveSelections() {
    const selected = [];

    checkboxes.forEach(box => {
        if (box.checked) {
            selected.push(box.dataset.toolId);
        }
    });

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(selected)
    );
}

function readRouteSelection() {
    const params =
        new URLSearchParams(window.location.search);

    const tool =
        params.get("select");

    if (!tool) return;

    const checkbox =
        document.querySelector(
            `input[data-tool-id="${tool}"]`
        );

    if (checkbox) {
        checkbox.checked = true;
        saveSelections();
    }
}

checkboxes.forEach(box => {
    box.addEventListener(
        "change",
        saveSelections
    );
});

loadSelections();
readRouteSelection();
