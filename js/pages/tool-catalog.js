"use strict";

(() => {
  const STORAGE_KEY = "terrainvale-toolbox";

  document.addEventListener("DOMContentLoaded", initialize);
  document.addEventListener("talvaren:contentloaded", initialize);

  async function initialize() {
    const page = document.querySelector("[data-tool-catalog-page]");
    if (!page || page.dataset.ready === "true") return;
    page.dataset.ready = "true";

    try {
      const tools = await loadTools(page.dataset.catalogSrc);
      renderCatalogNavigation(page.querySelector("[data-tool-catalog-nav]"), tools);
      renderTools(page.querySelector("[data-tool-catalog-items]"), tools);
      syncButtons();
    } catch (error) {
      console.error(error);
      const target = page.querySelector("[data-tool-catalog-items]");
      if (target) target.innerHTML = '<p class="system-message">Tool information could not be loaded.</p>';
    }
  }

  async function loadTools(path) {
    if (!path) throw new Error("Tool catalog path is missing.");
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`Tools data failed: ${response.status}`);
    return response.json();
  }

  function renderCatalogNavigation(target, tools) {
    if (!target) return;
    target.innerHTML = tools.map((tool, index) => `
      <button class="suite-tool-link" type="button" data-scroll-tool="${tool.id}">
        <span class="suite-tool-number">${String(tool.catalogOrder || index + 1).padStart(2, "0")}</span>
        <img src="${tool.stamp}" alt="" aria-hidden="true">
        <span>${tool.name}</span>
      </button>`).join("");

    target.addEventListener("click", event => {
      const control = event.target.closest("[data-scroll-tool]");
      if (!control) return;
      document.getElementById(control.dataset.scrollTool)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function renderTools(target, tools) {
    if (!target) return;
    target.innerHTML = tools.map((tool, index) => toolMarkup(tool, index)).join('<hr class="tool-divider">');

    target.addEventListener("click", event => {
      const button = event.target.closest("[data-save-tool]");
      if (!button) return;
      toggleTool(button.dataset.saveTool);
      syncButtons();
    });
  }

  function toolMarkup(tool, index) {
    const screenshots = screenshotMarkup(tool);
    const video = videoMarkup(tool);
    const order = `${tool.collection} ${String(tool.catalogOrder || index + 1).padStart(2, "0")}`;
    const releaseTitle = tool.releaseTitle || tool.packageFile || "Release details pending";
    const releaseAction = tool.documentationPath
      ? `<a class="tool-release-button" href="${tool.documentationPath}" download>Download Release Documentation</a>`
      : '<span class="tool-release-button tool-release-pending">Release access will appear here when available</span>';

    return `
      <article class="tool-section" id="${tool.id}">
        <div class="tool-layout">
          <div class="tool-stamp-column">
            <img src="${tool.stamp}" alt="${tool.name}" class="tool-stamp${tool.collection.startsWith("STUDIO") ? " placeholder-stamp" : ""}">
            <button class="tool-save-button" type="button" data-save-tool="${tool.id}">Add to Toolbox</button>
            <a class="toolbox-link" href="#portal=tools&section=tools-toolbox">Review Toolbox</a>
          </div>
          <div class="tool-document">
            <div class="tool-heading-row">
              <div><p class="tool-order">${order}</p><h2>${tool.name}</h2></div>
              <span class="tool-status-chip">${tool.status}</span>
            </div>
            <p class="tool-introduction">${tool.description}</p>
            <h3>Problem Solved</h3>
            <p>${tool.problem}</p>
            <h3>Primary Features</h3>
            <ul>${tool.features.map(feature => `<li>${feature}</li>`).join("")}</ul>
            <h3>Requirements</h3>
            <ul>${tool.requirements.map(requirement => `<li>${requirement}</li>`).join("")}</ul>
            <h3>${tool.roleHeading || "Place in the VALE Workflow"}</h3>
            <p>${tool.workflowRole}</p>

            <section class="tool-release-panel" aria-label="${tool.name} release information">
              <div>
                <p class="tool-order">Release Package</p>
                <h3>${releaseTitle}</h3>
                <p>${tool.releaseState}</p>
              </div>
              <ul>${tool.packageContents.map(item => `<li>${item}</li>`).join("")}</ul>
              ${releaseAction}
            </section>

            <div class="tool-media">
              <h3>Images</h3>
              <div class="media-grid">${screenshots}</div>
              <h3>Demonstration Video</h3>
              ${video}
            </div>
          </div>
        </div>
      </article>`;
  }

  function screenshotMarkup(tool) {
    const screenshots = Array.isArray(tool.screenshots) ? [...tool.screenshots] : [];
    if (!screenshots.length && !tool.imageSlots) {
      return `<div class="tool-capability-panel"><img src="${tool.stamp}" alt=""><div><strong>Focused editor workflow</strong><span>${tool.features[0]}</span></div></div>
        <div class="tool-capability-panel"><img src="${tool.stamp}" alt=""><div><strong>Designed for TerrainVale</strong><span>${tool.workflowRole}</span></div></div>`;
    }
    const slotCount = Math.max(screenshots.length, Number(tool.imageSlots) || 2);
    const placeholder = tool.placeholderImage || tool.stamp;

    while (screenshots.length < slotCount) screenshots.push(placeholder);
    return screenshots.map((src, index) => {
      const isPlaceholder = index >= (tool.screenshots?.length || 0);
      const title = isPlaceholder ? `${tool.name} future image ${index + 1}` : `${tool.name} image ${index + 1}`;
      return `<button class="tool-screenshot-button${isPlaceholder ? " placeholder" : ""}" type="button" data-viewer-src="${src}" data-viewer-title="${title}">
        <img src="${src}" alt="${title}" class="tool-screenshot">
        ${isPlaceholder ? '<span class="tool-media-label">Future Image</span>' : ""}
      </button>`;
    }).join("");
  }

  function videoMarkup(tool) {
    if (tool.video) {
      return `<button class="tool-video-card" type="button" data-viewer-src="${tool.video.src}" data-viewer-type="video" data-viewer-title="${tool.video.title}">
        <span class="tool-video-play" aria-hidden="true">▶</span>
        <span><strong>${tool.video.title}</strong><small>Open full-screen demonstration</small></span>
      </button>`;
    }

    const mark = tool.collection === "VALE" ? "VALE" : "VIDEO";
    const message = tool.collection === "VALE"
      ? "Demonstration production is scheduled in the established TerrainVale sequence. Product information and release documentation are available now."
      : "This video space is reserved for the asset demonstration.";
    return `<div class="tool-video-status"><span class="tool-video-status-mark" aria-hidden="true">${mark}</span><div><strong>${tool.name} demonstration</strong><p>${message}</p></div></div>`;
  }

  function getSaved() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function toggleTool(toolId) {
    const saved = getSaved();
    const next = saved.includes(toolId) ? saved.filter(id => id !== toolId) : [...saved, toolId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    document.dispatchEvent(new CustomEvent("talvaren:toolboxchanged", { detail: { saved: next } }));
  }

  function syncButtons() {
    const saved = getSaved();
    document.querySelectorAll("[data-save-tool]").forEach(button => {
      const selected = saved.includes(button.dataset.saveTool);
      button.textContent = selected ? "✓ Added to Toolbox" : "Add to Toolbox";
      button.classList.toggle("saved", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }
})();
