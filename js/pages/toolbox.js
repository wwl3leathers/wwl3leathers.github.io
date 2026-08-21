"use strict";

(() => {
  const STORAGE_KEY = "terrainvale-toolbox";
  let tools = [];
  let currentToolId = "terrain-authority";

  document.addEventListener("DOMContentLoaded", initialize);
  document.addEventListener("talvaren:contentloaded", initialize);
  document.addEventListener("talvaren:toolboxchanged", refreshVisibleToolbox);
  window.addEventListener("storage", event => {
    if (event.key === STORAGE_KEY) refreshVisibleToolbox();
  });

  async function initialize() {
    const page = document.querySelector("[data-toolbox-page]");
    if (!page || page.dataset.ready === "true") return;
    page.dataset.ready = "true";

    try {
      tools = await loadTools();
      currentToolId = getSaved()[0] || tools[0]?.id || "";
      renderGrid(page.querySelector("[data-toolbox-grid]"));
      renderInformation(page.querySelector("[data-toolbox-information]"), currentToolId);
      renderSummary(page.querySelector("[data-toolbox-summary]"));
      bindPage(page);
    } catch (error) {
      console.error(error);
      page.insertAdjacentHTML("afterbegin", '<p class="system-message">Toolbox information could not be loaded.</p>');
    }
  }

  async function loadTools() {
    const paths = ["data/tools.json", "data/studio-assets.json"];
    const responses = await Promise.all(paths.map(path => fetch(path, { cache: "no-store" })));
    const failed = responses.find(response => !response.ok);
    if (failed) throw new Error(`Tools data failed: ${failed.status}`);
    const catalogs = await Promise.all(responses.map(response => response.json()));
    return catalogs.flat();
  }

  function bindPage(page) {
    page.addEventListener("click", event => {
      const view = event.target.closest("[data-view-tool]");
      if (view) {
        currentToolId = view.dataset.viewTool;
        renderInformation(page.querySelector("[data-toolbox-information]"), currentToolId);
        updateActiveCard(page);
      }
    });

    page.addEventListener("change", event => {
      const checkbox = event.target.closest("[data-select-tool]");
      if (!checkbox) return;
      updateSaved(checkbox.dataset.selectTool, checkbox.checked);
      renderSummary(page.querySelector("[data-toolbox-summary]"));
    });
  }

  function refreshVisibleToolbox() {
    const page = document.querySelector("[data-toolbox-page]");
    if (!page || !tools.length) return;
    const saved = getSaved();
    if (!tools.some(tool => tool.id === currentToolId)) currentToolId = saved[0] || tools[0]?.id || "";
    renderGrid(page.querySelector("[data-toolbox-grid]"));
    renderInformation(page.querySelector("[data-toolbox-information]"), currentToolId);
    renderSummary(page.querySelector("[data-toolbox-summary]"));
  }

  function renderGrid(target) {
    if (!target) return;
    const saved = getSaved();
    target.innerHTML = tools.map(tool => `
      <article class="toolbox-tool${tool.id === currentToolId ? " active" : ""}" data-tool-card="${tool.id}">
        <button class="toolbox-stamp-button" type="button" data-view-tool="${tool.id}" aria-label="View ${tool.name} information">
          <img src="${tool.stamp}" alt="${tool.name}" class="toolbox-stamp${tool.collection.startsWith("STUDIO") ? " placeholder-stamp" : ""}">
        </button>
        <label class="toolbox-select">
          <input type="checkbox" data-select-tool="${tool.id}" ${saved.includes(tool.id) ? "checked" : ""}>
          <span>Select</span>
        </label>
        <p class="toolbox-status">${tool.status.toUpperCase()}</p>
      </article>`).join("");
  }

  function renderInformation(target, toolId) {
    const tool = tools.find(item => item.id === toolId) || tools[0];
    if (!target || !tool) return;
    target.innerHTML = `
      <div class="toolbox-information-heading">
        <img src="${tool.stamp}" alt="" class="toolbox-information-stamp${tool.collection.startsWith("STUDIO") ? " placeholder-stamp" : ""}">
        <div><p class="tool-order">${tool.collection} Collection</p><h2>${tool.name}</h2></div>
      </div>
      <p>${tool.description}</p>
      <h3>Problem Solved</h3>
      <p>${tool.problem}</p>
      <h3>Primary Features</h3>
      <ul>${tool.features.map(feature => `<li>${feature}</li>`).join("")}</ul>
      <h3>Requirements</h3>
      <ul>${tool.requirements.map(requirement => `<li>${requirement}</li>`).join("")}</ul>
      <h3>${tool.roleHeading || "Place in the VALE Workflow"}</h3>
      <p>${tool.workflowRole}</p>
      <h3>Release Format</h3>
      <p>One self-contained <code>.unitypackage</code> and one plain-text manual. No sample scenes, bundled videos, version folders, or unnecessary extra assets.</p>
      <p class="toolbox-note">${tool.releaseState}</p>`;
  }

  function renderSummary(target) {
    if (!target) return;
    const selected = getSaved().map(id => tools.find(tool => tool.id === id)).filter(Boolean);
    const valeTools = tools.filter(tool => tool.collection === "VALE");
    const selectedValeIds = new Set(selected.filter(tool => tool.collection === "VALE").map(tool => tool.id));
    const complete = valeTools.length > 0 && valeTools.every(tool => selectedValeIds.has(tool.id));
    target.innerHTML = `
      <h2>Selected Tools</h2>
      ${selected.length ? `<div class="selected-tools-list">${selected.map(tool => `<div class="selected-tool"><strong>${tool.name}</strong><span>${tool.price}</span></div>`).join("")}</div>` : "<p>No tools are currently selected.</p>"}
      <p><strong>Tools Selected:</strong> ${selected.length}</p>
      <p><strong>${complete ? "TerrainVale Collection Discount Applied:" : "TerrainVale Collection Discount:"}</strong> ${complete ? "All six VALE tools are selected. The TerrainVale collection qualifies for a 20% discount." : "Select all six VALE tools to receive 20% off the TerrainVale collection. Studio Assets are priced independently, and select assets may be free."}</p>
      <button class="talvaren-button" type="button" disabled>Checkout Coming Soon</button>`;
  }

  function updateActiveCard(page) {
    page.querySelectorAll("[data-tool-card]").forEach(card => card.classList.toggle("active", card.dataset.toolCard === currentToolId));
  }

  function getSaved() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function updateSaved(toolId, selected) {
    const saved = getSaved();
    const next = selected ? [...new Set([...saved, toolId])] : saved.filter(id => id !== toolId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
})();
