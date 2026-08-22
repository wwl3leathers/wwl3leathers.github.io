"use strict";

(() => {
  const state = { model: null, portalId: "", itemId: "", homeContent: "" };
  const elements = {};
  const routeMetadata = {
    "talvaren-history": {
      title: "Talvaren History | Talvaren Studios",
      description: "Explore the recorded history and discoveries of Talvaren.",
      schemaType: "CreativeWork"
    },
    "talvaren-places": {
      title: "Places of Talvaren | Talvaren Studios",
      description: "Explore the settlements, wilderness, underground regions, and forgotten sites of Talvaren.",
      schemaType: "CreativeWork"
    },
    "talvaren-peoples": {
      title: "Peoples of Talvaren | Talvaren Studios",
      description: "Explore the distinct peoples, professions, loyalties, and histories of Talvaren.",
      schemaType: "CreativeWork"
    },
    "talvaren-about": {
      title: "About Talvaren | Talvaren Studios",
      description: "Learn why Talvaren exists and how its choices, friction, classes, and character systems shape the world.",
      schemaType: "CreativeWork"
    },
    "talvaren-classes": {
      title: "Talvaren Classes & Races | Fantasy RPG Systems",
      description: "Explore the classes, races, progression concepts, and character systems planned for the Talvaren fantasy MMORPG.",
      schemaType: "VideoGame"
    },
    "talvaren-founders-hall": {
      title: "Founder's Hall | Talvaren",
      description: "Become a part of Talvaren through the Founder's Hall.",
      schemaType: "WebPage"
    },
    "talvaren-media": {
      title: "Talvaren Media | Videos, Images & Development Footage",
      description: "View preserved Talvaren media, including fantasy world imagery, development captures, gameplay-related videos, and Unity tool demonstrations.",
      schemaType: "CollectionPage"
    },
    "talvaren-enter": {
      title: "Enter Talvaren | Download & Access",
      description: "Find Talvaren availability, download access, system requirements, installation guidance, and server information when released.",
      schemaType: "VideoGame"
    },
    "archives-stories": {
      title: "Fantasy Stories | Fantastical Archives",
      description: "Read original fantasy stories from the Talvaren Studios Fantastical Archives.",
      schemaType: "CollectionPage"
    },
    "archives-artwork": {
      title: "Fantasy Artwork Gallery | Fantastical Archives",
      description: "Browse the Talvaren Studios fantasy artwork collection.",
      schemaType: "CollectionPage"
    },
    "archives-breadcrumbs": {
      title: "Historical Breadcrumbs | Folklore & Worldbuilding",
      description: "Explore folklore, myths, legends, traditions, and historical inspirations preserved for Talvaren.",
      schemaType: "CollectionPage"
    },
    "community-portfolio": {
      title: "Technical Portfolio | Talvaren Studios",
      description: "View Walter Lewis's technical portfolio.",
      schemaType: "Person"
    },
    "community-feedback": {
      title: "Feedback | Talvaren Studios",
      description: "Share feedback about Talvaren Studios and its projects.",
      schemaType: "WebPage"
    },
    "community-friends": {
      title: "Friends of Talvaren | Talvaren Studios",
      description: "Discover independent developers, creators, and small businesses supported by Talvaren Studios.",
      schemaType: "CollectionPage"
    }
  };

  document.addEventListener("DOMContentLoaded", initializeNavigation);

  async function initializeNavigation() {
    cacheElements();
    if (!elements.primary || !elements.secondary || !elements.content) return;

    try {
      const response = await fetch("data/navigation.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`Navigation data failed: ${response.status}`);
      state.model = await response.json();
    } catch (error) {
      console.error(error);
      elements.content.innerHTML = '<p class="system-message">Navigation could not be loaded.</p>';
      return;
    }

    renderPrimaryNavigation();
    bindGlobalNavigation();
    bindContentActions();
    await restoreRoute();
    document.body.classList.remove("shell-loading");
    registerServiceWorker();
  }

  function cacheElements() {
    elements.primary = document.querySelector("#primaryNavigation");
    elements.secondary = document.querySelector("#secondaryNavigation");
    elements.secondaryTitle = document.querySelector("#secondaryNavigationTitle");
    elements.mobilePrimary = document.querySelector("#mobilePrimaryNavigation");
    elements.mobileSecondary = document.querySelector("#mobileSecondaryNavigation");
    elements.content = document.querySelector("#dynamicContent");
    elements.stage = document.querySelector("#contentStage");
    elements.secondaryRail = document.querySelector(".secondary-rail");
    state.homeContent = elements.content?.innerHTML || "";
  }

  function renderPrimaryNavigation() {
    elements.primary.innerHTML = state.model.portals.map(primaryButton).join("");
    elements.mobilePrimary.innerHTML = state.model.portals.map(mobilePrimaryButton).join("");
  }

  function portalHref(portalId) {
    const hrefs = {
      talvaren: "talvaren.html",
      gateway: "#portal=gateway",
      archives: "archives.html",
      community: "#portal=community"
    };
    return hrefs[portalId] || "#";
  }

  function primaryButton(portal) {
    return `<a class="primary-nav-button" href="${portalHref(portal.id)}" data-portal="${portal.id}" aria-label="${portal.label}"><span class="primary-nav-label">${portal.shortLabel}</span></a>`;
  }

  function mobilePrimaryButton(portal) {
    return `<a class="mobile-primary-link" href="${portalHref(portal.id)}" data-portal="${portal.id}"><span>${portal.shortLabel}</span></a>`;
  }

  function bindGlobalNavigation() {
    document.addEventListener("click", async event => {
      const jumpControl = event.target.closest("[data-jump-target]");
      if (jumpControl) {
        const jumpTarget = document.getElementById(jumpControl.dataset.jumpTarget);
        if (jumpTarget) {
          const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          jumpTarget.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
        }
        return;
      }

      const portalControl = event.target.closest("[data-portal], [data-open-portal]");
      if (portalControl) {
        event.preventDefault();
        await openPortal(portalControl.dataset.portal || portalControl.dataset.openPortal, true);
        return;
      }

      const targetControl = event.target.closest("[data-nav-target]");
      if (targetControl) {
        event.preventDefault();
        const [portalId, itemId] = targetControl.dataset.navTarget.split(":");
        await openPortalItem(portalId, itemId, true);
        return;
      }

      const sectionControl = event.target.closest("[data-nav-item]");
      if (sectionControl) {
        event.preventDefault();
        await openItem(sectionControl.dataset.navItem, true);
        return;
      }

      const retryControl = event.target.closest("[data-retry-item]");
      if (retryControl) await openItem(retryControl.dataset.retryItem, false);
    });

    window.addEventListener("popstate", restoreRoute);
  }

  async function openPortal(portalId, updateHistory = false) {
    const portal = getPortal(portalId);
    if (!portal) return;

    state.portalId = portal.id;
    state.itemId = "";
    renderSecondaryNavigation(portal, portal.items, portal.title);
    updateActiveStates();
    if (portal.landing) {
      await loadPortalLanding(portal);
    } else {
      renderPortalLanding(portal);
      setMetadata("");
    }
    if (updateHistory) writeRoute();
  }

  function renderSecondaryNavigation(portal, items, title) {
    elements.secondaryTitle.textContent = title;
    elements.secondaryRail.hidden = false;
    elements.mobileSecondary.hidden = false;
    document.body.classList.remove("no-secondary-navigation");
    document.body.classList.remove("mobile-secondary-collapsed");
    elements.secondaryRail.setAttribute("data-active-portal", portal.id);
    elements.secondary.innerHTML = items.map(secondaryButton).join("");
    elements.mobileSecondary.innerHTML = items.map(item => `<a class="mobile-secondary-link" href="${item.path}" data-nav-item="${item.id}">${item.label}</a>`).join("");
    elements.mobileSecondary.style.setProperty("--mobile-secondary-columns", String(Math.min(items.length, 4)));
    document.body.classList.toggle("mobile-secondary-expanded", items.length > 4);
    elements.mobileSecondary.scrollLeft = 0;
    window.requestAnimationFrame(() => { elements.mobileSecondary.scrollLeft = 0; });
  }

  function secondaryButton(item) {
    return `<a class="secondary-nav-link" href="${item.path}" data-nav-item="${item.id}">${item.label}</a>`;
  }

  async function openPortalItem(portalId, itemId, updateHistory = false) {
    const portal = getPortal(portalId);
    if (!portal) return;
    if (!findItem(portal, itemId)) {
      await openPortal(portalId, updateHistory);
      return;
    }
    state.portalId = portal.id;
    state.itemId = "";
    renderSecondaryNavigation(portal, portal.items, portal.title);
    updateActiveStates();
    await openItem(itemId, false);
    if (updateHistory) writeRoute();
  }

  async function openItem(itemId, updateHistory = false) {
    const portal = getPortal(state.portalId);
    const match = findItem(portal, itemId);
    if (!match) return;

    state.itemId = match.item.id;
    updateActiveStates();
    await loadItem(match.item);
    if (updateHistory) writeRoute();
  }

  async function loadItem(item) {
    document.body.classList.remove("portal-landing-active");
    document.body.classList.toggle("talvaren-section-active", item.id.startsWith("talvaren-"));
    document.body.classList.toggle("talvaren-about-active", item.id === "talvaren-about");
    elements.content.classList.remove("viewer-stage-active");
    document.body.classList.add("shell-loading");
    try {
      const response = await fetch(item.path, { cache: "no-store" });
      if (!response.ok) throw new Error(`Content failed: ${response.status}`);
      const text = await response.text();
      const sectionBanner = item.id.startsWith("talvaren-") && item.id !== "talvaren-about"
        ? `<div class="talvaren-section-banner"><img src="images/branding/Talvaren_Banner.PNG" alt="Talvaren Studios — Forging Reality One Tool at a Time"></div>`
        : "";
      elements.content.innerHTML = sectionBanner + extractMainContent(text);
      elements.content.dataset.currentItem = item.id;
      bindContentActions();
      announceContentLoaded(item.id);
      elements.stage?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
      setMetadata(item.id);
    } catch (error) {
      console.error(error);
      elements.content.innerHTML = `<section class="content-panel"><h1>Page unavailable</h1><p>This section could not be loaded.</p><button class="talvaren-button" type="button" data-retry-item="${item.id}">Try again</button></section>`;
    } finally {
      document.body.classList.remove("shell-loading");
    }
  }

  async function loadPortalLanding(portal) {
    const landing = portal.landing;
    document.body.classList.remove("portal-landing-active");
    document.body.classList.toggle("talvaren-section-active", landing.id.startsWith("talvaren-"));
    document.body.classList.toggle("talvaren-about-active", landing.id === "talvaren-about");
    elements.content.classList.remove("viewer-stage-active");
    document.body.classList.add("shell-loading");
    try {
      const response = await fetch(landing.path, { cache: "no-store" });
      if (!response.ok) throw new Error(`Content failed: ${response.status}`);
      const text = await response.text();
      elements.content.innerHTML = extractMainContent(text);
      elements.content.dataset.currentItem = landing.id;
      bindContentActions();
      announceContentLoaded(landing.id);
      elements.stage?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
      setMetadata(landing.id, false);
    } catch (error) {
      console.error(error);
      elements.content.innerHTML = `<section class="content-panel"><h1>Page unavailable</h1><p>This section could not be loaded.</p><button class="talvaren-button" type="button" data-open-portal="${portal.id}">Try again</button></section>`;
    } finally {
      document.body.classList.remove("shell-loading");
    }
  }

  function clearContent() {
    document.body.classList.remove("portal-landing-active");
    document.body.classList.remove("talvaren-section-active");
    document.body.classList.remove("talvaren-about-active");
    elements.content.classList.remove("viewer-stage-active");
    elements.content.innerHTML = state.homeContent;
    delete elements.content.dataset.currentItem;
  }

  function renderPortalLanding(portal) {
    document.body.classList.add("portal-landing-active");
    document.body.classList.remove("talvaren-section-active");
    document.body.classList.remove("talvaren-about-active");
    elements.content.classList.remove("viewer-stage-active");
    elements.content.innerHTML = `
      <section class="portal-landing" aria-label="${portal.label}">
        <img class="portal-landing-banner" src="images/branding/Talvaren_Banner.PNG" alt="Talvaren Studios — Forging Reality One Tool at a Time">
      </section>`;
    delete elements.content.dataset.currentItem;
  }

  function extractMainContent(text) {
    const parsed = new DOMParser().parseFromString(text, "text/html");
    const explicit = parsed.querySelector("[data-page-content], main");
    return explicit ? explicit.innerHTML : (parsed.body.innerHTML || text);
  }

  function updateActiveStates() {
    document.querySelectorAll("[data-portal]").forEach(control => {
      const active = control.dataset.portal === state.portalId;
      control.classList.toggle("active", active);
      control.setAttribute("aria-current", active ? "page" : "false");
    });
    document.querySelectorAll("[data-nav-item]").forEach(control => {
      const active = control.dataset.navItem === state.itemId;
      control.classList.toggle("active", active);
      control.setAttribute("aria-current", active ? "page" : "false");
    });
  }

  function bindContentActions() {
    document.querySelectorAll("[data-nav-item]").forEach(control => {
      if (!findItem(getPortal(state.portalId), control.dataset.navItem)) control.setAttribute("disabled", "");
    });
  }

  async function restoreRoute() {
    const route = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const requestedPortal = getPortal(route.get("portal"));
    const requestedItem = route.get("section");
    const portal = requestedItem
      ? state.model.portals.find(candidate => findItem(candidate, requestedItem)) || requestedPortal
      : requestedPortal;
    if (!portal) {
      clearNavigation();
      return;
    }
    if (requestedItem) {
      await openPortalItem(portal.id, requestedItem, false);
    } else {
      await openPortal(portal.id, false);
    }
  }

  function clearNavigation() {
    state.portalId = "";
    state.itemId = "";
    elements.secondary.innerHTML = "";
    elements.mobileSecondary.innerHTML = "";
    elements.secondaryRail.hidden = true;
    elements.mobileSecondary.hidden = true;
    elements.mobileSecondary.style.removeProperty("--mobile-secondary-columns");
    document.body.classList.remove("mobile-secondary-expanded");
    document.body.classList.add("no-secondary-navigation");
    clearContent();
    updateActiveStates();
    resetHomeMetadata();
  }

  function resetHomeMetadata() {
    const title = "Talvaren Studios | Talvaren Fantasy MMORPG";
    const description = "Talvaren Studios is an independent game studio and the home of Talvaren, a fantasy MMORPG currently in development.";
    document.title = title;
    updateMeta("name", "description", description);
    updateMeta("property", "og:title", title);
    updateMeta("property", "og:description", description);
    updateMeta("property", "og:url", `${location.origin}${location.pathname}`);
    updateMeta("name", "twitter:title", title);
    updateMeta("name", "twitter:description", description);
  }

  function writeRoute() {
    const params = new URLSearchParams();
    if (state.portalId) params.set("portal", state.portalId);
    if (state.itemId) params.set("section", state.itemId);
    history.pushState({}, "", params.toString() ? `#${params.toString()}` : location.pathname);
  }

  function announceContentLoaded(itemId) {
    document.dispatchEvent(new CustomEvent("talvaren:contentloaded", { detail: { portalId: state.portalId, itemId } }));
  }

  function getPortal(portalId) {
    return state.model?.portals.find(portal => portal.id === portalId);
  }

  function findItem(portal, itemId) {
    const item = portal?.items.find(candidate => candidate.id === itemId);
    return item ? { item } : null;
  }

  function setMetadata(itemId, includeSection = true) {
    const fallbackDescription = document.querySelector("#dynamicContent .page-lede, #dynamicContent .page-subtitle, #dynamicContent header p")?.textContent?.trim();
    const metadata = routeMetadata[itemId] || {};
    const title = metadata.title || "Talvaren Studios";
    const description = (metadata.description || fallbackDescription || "Talvaren Studios").slice(0, 200);
    const params = new URLSearchParams();
    if (state.portalId) params.set("portal", state.portalId);
    if (includeSection && itemId) params.set("section", itemId);
    const canonicalUrl = `${location.origin}${location.pathname}${params.toString() ? `#${params.toString()}` : ""}`;
    document.title = title;
    updateMeta("name", "description", description.slice(0, 160));
    updateMeta("property", "og:title", title);
    updateMeta("property", "og:description", description);
    updateMeta("property", "og:url", canonicalUrl);
    updateMeta("name", "twitter:title", title);
    updateMeta("name", "twitter:description", description);
  }

  function updateMeta(attribute, key, content) {
    let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
    if (!element) {
      element = document.createElement("meta");
      element.setAttribute(attribute, key);
      document.head.appendChild(element);
    }
    element.setAttribute("content", content);
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
    navigator.serviceWorker.register("sw.js").catch(error => console.warn("Offline support unavailable:", error));
  }
})();
