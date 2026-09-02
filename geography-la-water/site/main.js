document.addEventListener("DOMContentLoaded", () => {
  const dict = window.LA_WATER_I18N;
  const data = window.LA_WATER_DATA;
  const palette = data.palette;
  const buttons = [...document.querySelectorAll("[data-set-lang]")];
  const nodes = [...document.querySelectorAll("[data-i18n]")];
  const captionEl = document.getElementById("mapCaption");
  const panels = [...document.querySelectorAll("[data-scene]")];
  const railLinks = [...document.querySelectorAll("[data-rail]")];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let lang = "en";
  let activeScene = "cover";
  let mapReady = false;
  let coverIntroDone = false;
  let flowFrame = 0;

  function applyLang(next) {
    lang = next === "ja" ? "ja" : "en";
    const pack = dict[lang];
    document.documentElement.lang = lang;
    nodes.forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (pack[key]) el.textContent = pack[key];
    });
    buttons.forEach((b) => {
      const on = b.getAttribute("data-set-lang") === lang;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    setCaption(activeScene);
    try {
      localStorage.setItem("la_water_lang", lang);
    } catch {
      /* ignore */
    }
  }

  buttons.forEach((b) => {
    b.addEventListener("click", () => applyLang(b.getAttribute("data-set-lang")));
  });

  try {
    const saved = localStorage.getItem("la_water_lang");
    if (saved === "ja" || saved === "en") lang = saved;
    else if (navigator.language.toLowerCase().startsWith("ja")) lang = "ja";
  } catch {
    /* ignore */
  }
  applyLang(lang);

  function matchRoute(channel) {
    return [
      "match",
      ["get", "id"],
      "sierra",
      palette.sierra[channel],
      "swp",
      palette.swp[channel],
      "colorado",
      palette.colorado[channel],
      "#666",
    ];
  }

  const widthMain = ["interpolate", ["linear"], ["zoom"], 5, 2.8, 7, 4.5, 9, 7, 11, 10, 13, 13];
  const widthCasing = ["interpolate", ["linear"], ["zoom"], 5, 5.5, 7, 8, 9, 12, 11, 16, 13, 20];
  const widthGlow = ["interpolate", ["linear"], ["zoom"], 5, 10, 7, 16, 9, 22, 11, 28, 13, 34];
  const widthCore = ["interpolate", ["linear"], ["zoom"], 5, 1, 7, 1.6, 9, 2.4, 11, 3.2, 13, 4];

  const mapStyle = {
    version: 8,
    name: "esri-street-refined",
    glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    sources: {
      street: {
        type: "raster",
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
        attribution: "Tiles © Esri — World Street Map",
        maxzoom: 19,
      },
    },
    layers: [
      {
        id: "street",
        type: "raster",
        source: "street",
        paint: {
          "raster-saturation": -0.25,
          "raster-contrast": 0.08,
          "raster-brightness-min": 0.02,
          "raster-brightness-max": 0.92,
        },
      },
    ],
  };

  const map = new maplibregl.Map({
    container: "map",
    style: mapStyle,
    center: data.scenes.cover.center,
    zoom: data.scenes.cover.zoom - 0.45,
    bearing: data.scenes.cover.bearing,
    pitch: Math.max(0, data.scenes.cover.pitch - 8),
    attributionControl: true,
    interactive: false,
    hash: false,
    pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    antialias: true,
  });

  function lineFeature(id, coordinates) {
    return {
      type: "Feature",
      properties: { id },
      geometry: { type: "LineString", coordinates },
    };
  }

  function addCorridorLayer(id, paint, layout = {}) {
    map.addLayer({
      id,
      type: "line",
      source: "corridors",
      layout: { "line-cap": "round", "line-join": "round", ...layout },
      paint,
    });
  }

  function addLayers() {
    if (map.getSource("corridors")) return;
    try {
      map.addSource("corridors", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: Object.entries(data.routes).map(([id, route]) =>
            lineFeature(id, route.coordinates)
          ),
        },
        lineMetrics: true,
      });

      addCorridorLayer("corridors-casing", {
        "line-color": matchRoute("casing"),
        "line-width": widthCasing,
        "line-opacity": 0.72,
        "line-blur": 0.4,
      });

      addCorridorLayer("corridors-glow-outer", {
        "line-color": matchRoute("glow"),
        "line-width": widthGlow,
        "line-opacity": 0.22,
        "line-blur": 6,
      });

      addCorridorLayer("corridors-glow", {
        "line-color": matchRoute("glow"),
        "line-width": ["interpolate", ["linear"], ["zoom"], 5, 7, 9, 14, 13, 20],
        "line-opacity": 0.38,
        "line-blur": 2.5,
      });

      addCorridorLayer("corridors-line", {
        "line-color": matchRoute("line"),
        "line-width": widthMain,
        "line-opacity": 0.96,
      });

      addCorridorLayer("corridors-core", {
        "line-color": matchRoute("core"),
        "line-width": widthCore,
        "line-opacity": 0.88,
      });

      addCorridorLayer(
        "corridors-flow",
        {
          "line-color": "#ffffff",
          "line-width": ["interpolate", ["linear"], ["zoom"], 5, 0.8, 9, 1.4, 13, 2],
          "line-opacity": 0.55,
          "line-dasharray": [0, 2, 3],
        },
        { "line-cap": "butt" }
      );

      map.addSource("places", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: data.places.map((p) => ({
            type: "Feature",
            properties: { id: p.id, name: p.name, kind: p.kind },
            geometry: { type: "Point", coordinates: [p.lng, p.lat] },
          })),
        },
      });

      map.addLayer({
        id: "places-halo",
        type: "circle",
        source: "places",
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            5,
            ["case", ["==", ["get", "kind"], "city"], 5, 3],
            10,
            ["case", ["==", ["get", "kind"], "city"], 10, 6],
          ],
          "circle-color": "#f6f1e6",
          "circle-opacity": 0.92,
          "circle-stroke-width": 0,
        },
      });

      map.addLayer({
        id: "places-dot",
        type: "circle",
        source: "places",
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            5,
            ["case", ["==", ["get", "kind"], "city"], 4.5, 3],
            10,
            ["case", ["==", ["get", "kind"], "city"], 7, 4.5],
          ],
          "circle-color": [
            "match",
            ["get", "kind"],
            "city",
            "#0d2137",
            "local",
            "#365314",
            "#1c4a6e",
          ],
          "circle-stroke-width": 1.6,
          "circle-stroke-color": "#f6f1e6",
        },
      });

      map.addLayer({
        id: "places-label",
        type: "symbol",
        source: "places",
        layout: {
          "text-field": ["get", "name"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 5, 10, 8, 12, 11, 14],
          "text-font": ["Open Sans Bold"],
          "text-offset": [0, 1.15],
          "text-anchor": "top",
          "text-letter-spacing": 0.02,
        },
        paint: {
          "text-color": "#0d2137",
          "text-halo-color": "#f6f1e6",
          "text-halo-width": 2,
        },
      });

      mapReady = true;
      applyScene(activeScene, true);
      playCoverIntro();
      startFlowPulse();
    } catch (err) {
      console.error("Map layers failed", err);
    }
  }

  function playCoverIntro() {
    if (reduced || coverIntroDone || activeScene !== "cover") return;
    coverIntroDone = true;
    const scene = data.scenes.cover;
    map.easeTo({
      center: scene.center,
      zoom: scene.zoom,
      bearing: scene.bearing,
      pitch: scene.pitch,
      duration: 3200,
      easing: (t) => 1 - Math.pow(1 - t, 4),
    });
  }

  function startFlowPulse() {
    if (reduced || !map.getLayer("corridors-flow")) return;
    const tick = () => {
      if (!mapReady) return;
      flowFrame += 1;
      const pulse = 0.35 + 0.25 * Math.sin(flowFrame * 0.04);
      if (map.getLayer("corridors-flow")) {
        map.setPaintProperty("corridors-flow", "line-opacity", pulse);
      }
      if (map.getLayer("corridors-glow")) {
        const base = activeScene.startsWith("sierra") ||
          activeScene.startsWith("colorado") ||
          activeScene.startsWith("swp")
          ? 0.48
          : 0.38;
        map.setPaintProperty("corridors-glow", "line-opacity", base + 0.08 * Math.sin(flowFrame * 0.03));
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  map.on("load", addLayers);
  window.addEventListener("resize", () => map.resize());

  function setCaption(sceneId) {
    const scene = data.scenes[sceneId];
    if (!scene || !captionEl) return;
    captionEl.textContent = scene.caption[lang] || scene.caption.en;
  }

  function opacityExpr(name, activeOpacity, dimOpacity) {
    if (name === "all" || name === "la" || name === "local") return activeOpacity;
    if (name === "none") return dimOpacity * 0.5;
    return ["case", ["==", ["get", "id"], name], activeOpacity, dimOpacity];
  }

  function applyHighlight(name) {
    if (!mapReady || !map.getLayer("corridors-line")) return;
    const dim = 0.14;
    const on = 0.98;
    const glowDim = 0.1;
    const glowOn = name === "none" ? 0.06 : 0.42;

    map.setPaintProperty("corridors-casing", "line-opacity", opacityExpr(name, 0.78, dim));
    map.setPaintProperty("corridors-glow-outer", "line-opacity", opacityExpr(name, glowOn + 0.12, glowDim));
    map.setPaintProperty("corridors-glow", "line-opacity", opacityExpr(name, glowOn, glowDim));
    map.setPaintProperty("corridors-line", "line-opacity", opacityExpr(name, on, dim));
    map.setPaintProperty("corridors-core", "line-opacity", opacityExpr(name, 0.92, dim * 0.8));
    map.setPaintProperty("corridors-flow", "line-opacity", opacityExpr(name, 0.62, dim * 0.5));

    if (map.getLayer("places-dot")) {
      const localOn = name === "local" || name === "all" || name === "la";
      map.setPaintProperty("places-dot", "circle-opacity", [
        "case",
        ["==", ["get", "kind"], "local"],
        localOn ? 1 : 0.18,
        1,
      ]);
      map.setPaintProperty("places-label", "text-opacity", [
        "case",
        ["==", ["get", "kind"], "local"],
        localOn ? 1 : 0.2,
        1,
      ]);
    }
  }

  function applyScene(sceneId, instant) {
    const scene = data.scenes[sceneId];
    if (!scene) return;
    activeScene = sceneId;
    setCaption(sceneId);
    applyHighlight(scene.highlight);
    document.body.dataset.scene = sceneId;
    railLinks.forEach((a) => {
      const id = a.getAttribute("data-rail");
      const on =
        sceneId === id ||
        (id === "cover" && sceneId === "cover") ||
        (id === "sierra-source" && sceneId.startsWith("sierra")) ||
        (id === "colorado-source" && sceneId.startsWith("colorado")) ||
        (id === "swp-source" && sceneId.startsWith("swp"));
      a.classList.toggle("is-on", on);
    });
    if (!mapReady) return;
    const camera = {
      center: scene.center,
      zoom: scene.zoom,
      bearing: scene.bearing,
      pitch: scene.pitch,
    };
    const duration = instant ? 0 : sceneId.startsWith("sierra") || sceneId.startsWith("swp") || sceneId.startsWith("colorado") ? 1800 : 1500;
    if (instant || reduced) map.jumpTo(camera);
    else map.easeTo({ ...camera, duration, easing: (t) => 1 - Math.pow(1 - t, 3) });
  }

  function nearestPanel() {
    const mid = window.innerHeight * 0.42;
    let best = panels[0];
    let bestDist = Infinity;
    for (const el of panels) {
      const r = el.getBoundingClientRect();
      const cy = r.top + Math.min(r.height, window.innerHeight) * 0.28;
      const d = Math.abs(cy - mid);
      if (d < bestDist) {
        bestDist = d;
        best = el;
      }
    }
    return best;
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const el = nearestPanel();
      const next = el?.getAttribute("data-scene");
      if (next && next !== activeScene) applyScene(next, false);
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
});
