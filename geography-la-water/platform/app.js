document.addEventListener("DOMContentLoaded", () => {
  const data = window.ATLAS_DATA;
  const dict = window.ATLAS_I18N;
  const palette = data.palette;

  const gate = document.getElementById("gate");
  const app = document.getElementById("app");
  const enterBtn = document.getElementById("enterBtn");
  const langButtons = [...document.querySelectorAll("[data-set-lang]")];
  const i18nNodes = [...document.querySelectorAll("[data-i18n]")];

  let lang = "en";
  let map = null;
  let activeLayer = "sources";
  let selectedId = null;
  let whyId = data.why[0].id;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function t(key) {
    return (dict[lang] && dict[lang][key]) || key;
  }

  function loc(obj) {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return obj[lang] || obj.en || "";
  }

  function applyLang(next) {
    lang = next === "ja" ? "ja" : "en";
    document.documentElement.lang = lang;
    i18nNodes.forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict[lang][key]) el.textContent = dict[lang][key];
    });
    langButtons.forEach((b) => {
      const on = b.getAttribute("data-set-lang") === lang;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    try {
      localStorage.setItem("atlas_lang", lang);
    } catch {
      /* ignore */
    }
    buildLayers();
    buildProcess();
    buildDrought();
    buildWhy();
    buildCites();
    if (selectedId) showDetail(selectedId);
    updateSim();
    drawSnowChart();
  }

  langButtons.forEach((b) => {
    b.addEventListener("click", () => applyLang(b.getAttribute("data-set-lang")));
  });

  try {
    const saved = localStorage.getItem("atlas_lang");
    if (saved === "ja" || saved === "en") lang = saved;
    else if (navigator.language.toLowerCase().startsWith("ja")) lang = "ja";
  } catch {
    /* ignore */
  }

  function buildLayers() {
    const list = document.getElementById("layerList");
    const layers = [
      { id: "sources", label: t("layer1"), sub: lang === "ja" ? "水源をクリック" : "Click a source" },
      { id: "process", label: t("layer2"), sub: lang === "ja" ? "過程を可視化" : "Process chain" },
      { id: "infra", label: t("layer3"), sub: lang === "ja" ? "資産ドシエ" : "Asset dossiers" },
      { id: "climate", label: t("layer4"), sub: lang === "ja" ? "積雪指数" : "Snowpack index" },
      { id: "drought", label: t("layer5"), sub: lang === "ja" ? "2012→2035" : "2012 → 2035" },
      { id: "population", label: t("layer6"), sub: lang === "ja" ? "需要圧力" : "Demand pressure" },
      { id: "energy", label: t("layer7"), sub: lang === "ja" ? "揚水・停電リスク" : "Lift & outage risk" },
    ];
    list.innerHTML = "";
    layers.forEach((layer) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "layer-btn" + (activeLayer === layer.id ? " active" : "");
      btn.innerHTML = `<strong>${layer.label}</strong><span class="sub">${layer.sub}</span>`;
      btn.addEventListener("click", () => setLayer(layer.id));
      list.appendChild(btn);
    });

    // Source quick picks when sources layer active
    if (activeLayer === "sources" || activeLayer === "infra" || activeLayer === "energy") {
      const wrap = document.createElement("div");
      wrap.style.marginTop = "0.65rem";
      wrap.style.display = "grid";
      wrap.style.gap = "0.3rem";
      const items =
        activeLayer === "infra" || activeLayer === "energy"
          ? data.infrastructure.filter((i) => activeLayer !== "energy" || i.id === "edmonston" || i.source === "swp")
          : data.sources;
      items.forEach((item) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "layer-btn";
        const color = palette[item.color || item.source || item.id]?.line || "#2ec4b6";
        b.innerHTML = `<span class="source-swatch" style="background:${color}"></span>${loc(item.title)}`;
        b.addEventListener("click", () => {
          selectedId = item.id;
          showDetail(item.id);
          flyTo(item.fly);
          highlightRoutes(item.color || item.source || item.id);
        });
        wrap.appendChild(b);
      });
      list.appendChild(wrap);
    }
  }

  function buildProcess() {
    const box = document.getElementById("processBox");
    const steps = document.getElementById("processSteps");
    box.hidden = activeLayer !== "process";
    steps.innerHTML = "";
    data.process.forEach((step, i) => {
      const li = document.createElement("li");
      li.innerHTML = `<span class="idx">${String(i + 1).padStart(2, "0")}</span>${loc(step)}`;
      if (i === 2) li.classList.add("active");
      steps.appendChild(li);
    });
  }

  function buildDrought() {
    const box = document.getElementById("droughtBox");
    const path = document.getElementById("droughtPath");
    box.hidden = activeLayer !== "drought";
    path.innerHTML = "";
    data.droughtPath.forEach((d) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${d.year}</strong> — ${loc(d)}`;
      path.appendChild(li);
    });
  }

  function buildWhy() {
    const tabs = document.getElementById("whyTabs");
    const body = document.getElementById("whyBody");
    tabs.innerHTML = "";
    data.why.forEach((w) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = loc(w.title);
      b.className = whyId === w.id ? "active" : "";
      b.addEventListener("click", () => {
        whyId = w.id;
        buildWhy();
      });
      tabs.appendChild(b);
    });
    const active = data.why.find((w) => w.id === whyId) || data.why[0];
    body.textContent = loc(active.body);
  }

  function buildCites() {
    const ul = document.getElementById("citeList");
    ul.innerHTML = "";
    data.citations.forEach((c) => {
      const li = document.createElement("li");
      li.textContent = c;
      ul.appendChild(li);
    });
  }

  function findEntity(id) {
    return (
      data.sources.find((s) => s.id === id) ||
      data.infrastructure.find((i) => i.id === id) ||
      null
    );
  }

  function showDetail(id) {
    const entity = findEntity(id);
    const empty = document.getElementById("detailEmpty");
    const card = document.getElementById("detailCard");
    if (!entity) {
      empty.hidden = false;
      card.hidden = true;
      return;
    }
    empty.hidden = true;
    card.hidden = false;
    const facts = entity.facts ? loc(entity.facts) : [];
    card.innerHTML = `
      <h3>${loc(entity.title)}</h3>
      ${entity.share ? `<p class="meta">${loc(entity.share)}</p>` : ""}
      ${entity.volume ? `<p class="meta">${loc(entity.volume)}</p>` : ""}
      <p>${loc(entity.note || entity.body)}</p>
      ${
        facts.length
          ? `<div class="fact-row">${facts.map((f) => `<span>${f}</span>`).join("")}</div>`
          : ""
      }
    `;
  }

  function setLayer(id) {
    activeLayer = id;
    document.getElementById("climateBox").hidden = id !== "climate";
    buildLayers();
    buildProcess();
    buildDrought();
    if (id === "climate") drawSnowChart();
    if (id === "population") {
      document.getElementById("popSlider").focus();
    }
    if (id === "energy") {
      selectedId = "edmonston";
      showDetail("edmonston");
      const asset = data.infrastructure.find((i) => i.id === "edmonston");
      if (asset) {
        flyTo(asset.fly);
        highlightRoutes("swp");
      }
    }
    if (id === "sources") {
      flyTo(data.overview);
      highlightRoutes("all");
    }
    if (id === "process") {
      flyTo({ center: [-118.4, 35.2], zoom: 6.4, bearing: -8, pitch: 30 });
      highlightRoutes("all");
    }
    if (id === "infra") {
      flyTo(data.overview);
      highlightRoutes("all");
    }
    if (id === "drought") {
      flyTo(data.overview);
      highlightRoutes("all");
    }
    updateRouteStressVisual();
  }

  function flyTo(view) {
    if (!map || !view) return;
    map.flyTo({
      center: view.center,
      zoom: view.zoom,
      bearing: view.bearing || 0,
      pitch: view.pitch || 0,
      duration: reduced ? 0 : 1400,
      essential: true,
    });
  }

  function highlightRoutes(which) {
    if (!map || !map.getLayer("routes-line")) return;
    const ids = which === "all" ? ["sierra", "swp", "colorado"] : [which];
    const filter =
      which === "all"
        ? ["in", ["get", "id"], ["literal", ["sierra", "swp", "colorado"]]]
        : ["==", ["get", "id"], which === "groundwater" || which === "recycled" ? "sierra" : which];
    // Keep all visible but emphasize selected
    map.setPaintProperty("routes-glow", "line-opacity", [
      "match",
      ["get", "id"],
      ids[0] || "sierra",
      0.55,
      ids[1] || "",
      0.55,
      ids[2] || "",
      0.55,
      0.18,
    ]);
    map.setPaintProperty("routes-line", "line-opacity", [
      "case",
      ["in", ["get", "id"], ["literal", ids.length ? ids : ["sierra", "swp", "colorado"]]],
      0.95,
      0.25,
    ]);
    void filter;
  }

  function drawSnowChart() {
    const canvas = document.getElementById("snowChart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const series = data.climateSeries;
    const pad = 16;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    ctx.fillRect(0, 0, w, h);
    // baseline 100
    const y100 = pad + ((160 - 100) / 160) * (h - pad * 2);
    ctx.strokeStyle = "rgba(217,199,163,0.45)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(pad, y100);
    ctx.lineTo(w - pad, y100);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = "#2ec4b6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    series.forEach((pt, i) => {
      const x = pad + (i / (series.length - 1)) * (w - pad * 2);
      const y = pad + ((160 - pt.snow) / 160) * (h - pad * 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    series.forEach((pt, i) => {
      const x = pad + (i / (series.length - 1)) * (w - pad * 2);
      const y = pad + ((160 - pt.snow) / 160) * (h - pad * 2);
      ctx.fillStyle = pt.snow < 70 ? "#f59e0b" : "#2ec4b6";
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function updateSim() {
    const snow = Number(document.getElementById("snowSlider").value);
    const colorado = Number(document.getElementById("coloradoSlider").value);
    const pop = Number(document.getElementById("popSlider").value);
    const recycled = Number(document.getElementById("recycledSlider").value);

    document.getElementById("snowOut").textContent = `${snow}%`;
    document.getElementById("coloradoOut").textContent = `${colorado}%`;
    document.getElementById("popOut").textContent = `+${pop}%`;
    document.getElementById("recycledOut").textContent = `+${recycled}%`;

    // Illustrative literacy model — not operational
    const laaShare = Math.max(8, Math.min(52, snow * 0.38));
    const coloradoShare = Math.max(10, Math.min(40, colorado * 0.28));
    const swpShare = Math.max(12, 48 - laaShare * 0.35 - (colorado - 70) * 0.08);
    const localBase = 18 + recycled * 0.55;
    const demand = 100 + pop;
    const supplyProxy = laaShare + coloradoShare + swpShare + localBase;
    const importDep = Math.max(35, Math.min(88, ((laaShare + coloradoShare + swpShare) / supplyProxy) * 100 + pop * 0.35 - recycled * 0.4));
    const localShare = Math.max(8, Math.min(45, (localBase / supplyProxy) * 100));
    const energyRisk = Math.max(20, Math.min(95, 35 + (100 - colorado) * 0.25 + (100 - snow) * 0.15 + pop * 0.6 - recycled * 0.35));
    const stress = Math.max(10, Math.min(98, (importDep * 0.45 + energyRisk * 0.35 + (100 - Math.min(supplyProxy, 110)) * 0.4) / 1.1));

    document.getElementById("mStress").textContent = `${Math.round(stress)}`;
    document.getElementById("mImport").textContent = `${Math.round(importDep)}%`;
    document.getElementById("mLocal").textContent = `${Math.round(localShare)}%`;
    document.getElementById("mEnergy").textContent = `${Math.round(energyRisk)}`;

    updateRouteStressVisual(stress, snow, colorado);
  }

  function updateRouteStressVisual(stress, snow, colorado) {
    if (!map || !map.getLayer("routes-line")) return;
    const s = stress ?? 50;
    const sn = snow ?? 80;
    const co = colorado ?? 85;
    map.setPaintProperty("routes-glow", "line-color", [
      "match",
      ["get", "id"],
      "sierra",
      sn < 60 ? "#f59e0b" : palette.sierra.glow,
      "colorado",
      co < 70 ? "#f97316" : palette.colorado.glow,
      "swp",
      s > 65 ? "#fb7185" : palette.swp.glow,
      "#888",
    ]);
  }

  ["snowSlider", "coloradoSlider", "popSlider", "recycledSlider"].forEach((id) => {
    document.getElementById(id).addEventListener("input", updateSim);
  });

  document.getElementById("resetView").addEventListener("click", () => flyTo(data.entry));
  document.getElementById("overviewView").addEventListener("click", () => {
    flyTo(data.overview);
    highlightRoutes("all");
  });

  function initMap() {
    const style = {
      version: 8,
      name: "atlas-street",
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
            "raster-saturation": -0.3,
            "raster-contrast": 0.1,
            "raster-brightness-min": 0.02,
            "raster-brightness-max": 0.88,
          },
        },
      ],
    };

    map = new maplibregl.Map({
      container: "map",
      style,
      center: data.entry.center,
      zoom: data.entry.zoom,
      bearing: data.entry.bearing,
      pitch: data.entry.pitch,
      attributionControl: true,
    });
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");

    map.on("load", () => {
      const features = Object.values(data.routes).map((r) => ({
        type: "Feature",
        properties: { id: r.id, name: loc(r.name) },
        geometry: { type: "LineString", coordinates: r.coordinates },
      }));
      map.addSource("routes", {
        type: "geojson",
        data: { type: "FeatureCollection", features },
      });
      map.addLayer({
        id: "routes-glow",
        type: "line",
        source: "routes",
        paint: {
          "line-color": [
            "match",
            ["get", "id"],
            "sierra",
            palette.sierra.glow,
            "swp",
            palette.swp.glow,
            "colorado",
            palette.colorado.glow,
            "#888",
          ],
          "line-width": 14,
          "line-opacity": 0.35,
          "line-blur": 4,
        },
      });
      map.addLayer({
        id: "routes-line",
        type: "line",
        source: "routes",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": [
            "match",
            ["get", "id"],
            "sierra",
            palette.sierra.line,
            "swp",
            palette.swp.line,
            "colorado",
            palette.colorado.line,
            "#888",
          ],
          "line-width": 3.5,
          "line-opacity": 0.95,
        },
      });

      data.places.forEach((p) => {
        const el = document.createElement("div");
        el.className = "map-marker";
        const color =
          p.kind === "city"
            ? "#2ec4b6"
            : palette[p.source]?.line || "#94a3b8";
        el.style.background = color;
        el.title = loc(p.name);
        el.style.cursor = "pointer";
        el.addEventListener("click", () => {
          if (p.source) {
            selectedId = p.source === "groundwater" ? "groundwater" : p.source;
            const src = data.sources.find((s) => s.id === selectedId);
            if (src) {
              showDetail(src.id);
              flyTo(src.fly);
              highlightRoutes(src.id === "groundwater" || src.id === "recycled" ? "all" : src.id);
            }
          } else if (p.id === "tehachapi") {
            selectedId = "edmonston";
            showDetail("edmonston");
            flyTo(data.infrastructure.find((i) => i.id === "edmonston").fly);
            highlightRoutes("swp");
          }
        });
        new maplibregl.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(map);
      });

      map.on("click", "routes-line", (e) => {
        const id = e.features?.[0]?.properties?.id;
        if (!id) return;
        selectedId = id;
        const src = data.sources.find((s) => s.id === id);
        if (src) {
          showDetail(src.id);
          flyTo(src.fly);
          highlightRoutes(id);
        }
      });
      map.on("mouseenter", "routes-line", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "routes-line", () => {
        map.getCanvas().style.cursor = "";
      });

      highlightRoutes("all");
      updateSim();
      setTimeout(() => flyTo(data.overview), reduced ? 0 : 600);
    });
  }

  enterBtn.addEventListener("click", () => {
    gate.style.opacity = "0";
    gate.style.transition = reduced ? "none" : "opacity 0.45s ease";
    setTimeout(() => {
      gate.hidden = true;
      app.hidden = false;
      initMap();
      // rebuild i18n nodes after app visible
      applyLang(lang);
    }, reduced ? 0 : 420);
  });

  applyLang(lang);
});
