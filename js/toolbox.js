const STORAGE_KEY = "terrainvale-toolbox";

/* ==========================================================
   TOOL DATA
========================================================== */

const tools = {

    "terrain-authority": {
        name: "Terrain Authority",
        collection: "VALE",
        status: "Coming Soon",
        price: "Coming Soon",
        packageFile: "TerrainAuthority.unitypackage",
        documentationFile: "TerrainAuthority.txt",
        description:
            "Foundational procedural terrain generation focused on believable, artist-directed environmental forms."
    },

    "territory-authority": {
        name: "Territory Authority",
        collection: "VALE",
        status: "Coming Soon",
        price: "Coming Soon",
        packageFile: "TerritoryAuthority.unitypackage",
        documentationFile: "TerritoryAuthority.txt",
        description:
            "Transforms large Unity terrains into standardized, interconnected territories for scalable world construction."
    },

    "path-authority": {
        name: "Path Authority",
        collection: "VALE",
        status: "Coming Soon",
        price: "Coming Soon",
        packageFile: "PathAuthority.unitypackage",
        documentationFile: "PathAuthority.txt",
        description:
            "Records reusable routes that preserve the intended truth of movement throughout a world."
    },

    "ribbon-authority": {
        name: "Ribbon Authority",
        collection: "VALE",
        status: "Coming Soon",
        price: "Coming Soon",
        packageFile: "RibbonAuthority.unitypackage",
        documentationFile: "RibbonAuthority.txt",
        description:
            "Transforms Path Authority routes into visible roads, rivers, bridges, trenches, and other linear features."
    },

    "grade-authority": {
        name: "Grade Authority",
        collection: "VALE",
        status: "Coming Soon",
        price: "Coming Soon",
        packageFile: "GradeAuthority.unitypackage",
        documentationFile: "GradeAuthority.txt",
        description:
            "Establishes believable environmental possibility through meaningful terrain grades rather than artificial barriers."
    },

    "paint-authority": {
        name: "Paint Authority",
        collection: "VALE",
        status: "Coming Soon",
        price: "Coming Soon",
        packageFile: "PaintAuthority.unitypackage",
        documentationFile: "PaintAuthority.txt",
        description:
            "Applies rule-based terrain texturing through height, slope, and painterly environmental relationships."
    }

};

/* ==========================================================
   PAGE ELEMENTS
========================================================== */

const checkboxes = document.querySelectorAll(
    ".toolbox-select input[type='checkbox']"
);

const stampButtons = document.querySelectorAll(
    ".toolbox-stamp-button"
);

const informationWall = document.getElementById(
    "toolboxInformationWall"
);

const toolboxSummary = document.getElementById(
    "toolboxSummary"
);

/* ==========================================================
   SAVED SELECTIONS
========================================================== */

function getSavedSelections() {

    try {

        return JSON.parse(
            localStorage.getItem(STORAGE_KEY)
        ) || [];

    } catch (error) {

        return [];

    }

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

function loadSelections() {

    const saved = getSavedSelections();

    checkboxes.forEach(box => {

        box.checked =
            saved.includes(box.dataset.toolId);

    });

}

/* ==========================================================
   INFORMATION WALL
========================================================== */

function showToolInformation(toolId) {

    const tool = tools[toolId];

    if (!tool || !informationWall) return;

    informationWall.innerHTML = `

        <h2>${tool.name}</h2>

        <p>
            ${tool.description}
        </p>

        <h3>Tool Information</h3>

        <ul>

            <li>
                <strong>Collection:</strong>
                ${tool.collection}
            </li>

            <li>
                <strong>Status:</strong>
                ${tool.status}
            </li>

            <li>
                <strong>Price:</strong>
                ${tool.price}
            </li>

            <li>
                <strong>Compatibility:</strong>
                Unity Editor
            </li>

        </ul>

        <h3>Included After Purchase</h3>

        <ul>

            <li>
                ${tool.packageFile}
            </li>

            <li>
                ${tool.documentationFile}
            </li>

        </ul>

        <p class="toolbox-note">
            The Unity package and documentation remain locked until
            payment has been completed.
        </p>

    `;

}

/* ==========================================================
   SELECTED TOOLS
========================================================== */

function getSelectedToolIds() {

    const selected = [];

    checkboxes.forEach(box => {

        if (box.checked) {

            selected.push(box.dataset.toolId);

        }

    });

    return selected;

}

function buildSelectedTool(toolId) {

    const tool = tools[toolId];

    if (!tool) return "";

    return `

        <div class="selected-tool">

            <h3>${tool.name}</h3>

            <p>
                <strong>Collection:</strong>
                ${tool.collection}
            </p>

            <p>
                <strong>Price:</strong>
                ${tool.price}
            </p>

            <p>
                <strong>Included files:</strong>
            </p>

            <ul>

                <li>
                    🔒 ${tool.packageFile}
                </li>

                <li>
                    🔒 ${tool.documentationFile}
                </li>

            </ul>

        </div>

    `;

}

function updateToolboxSummary() {

    if (!toolboxSummary) return;

    const selectedIds = getSelectedToolIds();

    const valeToolIds = Object.keys(tools).filter(
        toolId => tools[toolId].collection === "VALE"
    );

    const selectedValeIds = selectedIds.filter(
        toolId =>
            tools[toolId] &&
            tools[toolId].collection === "VALE"
    );

    const valeCollectionComplete =
        valeToolIds.length > 0 &&
        selectedValeIds.length === valeToolIds.length;

    let selectedToolsHTML = "";

    selectedIds.forEach(toolId => {

        selectedToolsHTML += buildSelectedTool(toolId);

    });

    if (selectedIds.length === 0) {

        selectedToolsHTML = `

            <p>
                No tools are currently selected.
            </p>

        `;

    }

    let discountHTML = `

        <p>
            <strong>Complete Collection Discount:</strong>
            Select all six VALE tools to receive 20% off the
            complete collection. Partial collection selections
            remain at their standard individual prices.
        </p>

    `;

    if (valeCollectionComplete) {

        discountHTML = `

            <p>
                <strong>
                    Complete Collection Discount Applied:
                </strong>
                All six VALE tools are selected. The complete
                collection qualifies for a 20% discount.
            </p>

        `;

    }

    toolboxSummary.innerHTML = `

        <h2>Selected Tools</h2>

        ${selectedToolsHTML}

        <p>
            <strong>Tools Selected:</strong>
            ${selectedIds.length}
        </p>

        ${discountHTML}

        <button type="button" disabled>
            Checkout Coming Soon
        </button>

    `;

}

/* ==========================================================
   ROUTING FROM TERRAINVALE
========================================================== */

function readRouteSelection() {

    const params =
        new URLSearchParams(window.location.search);

    const toolId =
        params.get("select");

    if (!toolId || !tools[toolId]) return;

    const checkbox =
        document.querySelector(
            `.toolbox-select input[data-tool-id="${toolId}"]`
        );

    if (checkbox) {

        checkbox.checked = true;

        saveSelections();

        showToolInformation(toolId);

    }

}

/* ==========================================================
   EVENTS
========================================================== */

checkboxes.forEach(box => {

    box.addEventListener("change", () => {

        saveSelections();

        updateToolboxSummary();

    });

});

stampButtons.forEach(button => {

    button.addEventListener("click", () => {

        const toolId =
            button.dataset.toolId;

        showToolInformation(toolId);

    });

});

/* ==========================================================
   STARTUP
========================================================== */

loadSelections();

readRouteSelection();

updateToolboxSummary();
