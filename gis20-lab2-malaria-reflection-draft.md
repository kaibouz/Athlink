# GIS 20 — Lab 2 Reflection Draft (Malaria / Spatial Data Models)

**Status:** Draft only — needs your public ArcGIS Online Web Map URL before Canvas submit  
**Due:** Wed Sep 16, 2026 11:59 PM PT · 300–500 words  
**Voice:** Kai / Module 2 terms (discrete vs continuous, vector vs raster, zonal stats, joins)

Paste into Canvas **text entry** after Part 1 (public map URL) is ready. Edit any line that doesn’t sound like you.

---

## Reflection (paste-ready, ~420 words)

**1. Discrete vs. Continuous Spatial Phenomena**

Module 2 describes discrete objects as features with clear boundaries, where the space between observations is not “filled” with that object. Continuous surfaces work differently: a value exists between measurement points and changes as a field. In this lab, the UN SALB administrative boundaries behave as discrete objects — each territory is a separate polygon with an edge. The Pf malaria incidence layers behave as continuous surfaces — incidence exists across the study area as a grid of values, not as separate “malaria objects” with hard edges. That categorization makes mathematical sense because boundary polygons support counting and joining by territory ID, while incidence needs a field model so every cell can hold a rate.

**2. Vector vs. Raster Representation**

Vector stores geometry with coordinates, nodes, and vertices (points, lines, polygons). Raster stores space as a regular grid of cells, each holding one value. I used vector for the SALB territories and raster for the Malaria Atlas Project incidence imagery. Spatial resolution mattered: coarser cells average local differences and can blur hotspots near a boundary, while finer cells keep more detail but still depend on the quality of the source surface. So the first “precision” limit was not my symbology — it was the cell size of the downloaded incidence layers.

**3. The Zonal Statistics “Bridge” & Data Aggregation**

Zonal Statistics acted as the bridge between continuous raster and discrete vector. It summarized many cell values inside each territory polygon into a single mean for that zone. That summary is useful for comparing administrative areas, but it also loses within-zone variation — a territory can look “average” even if one neighborhood is much higher. For policy, that trade-off matters: aggregated maps can guide resource allocation at the district scale, but they can also hide the places inside a polygon that need the most attention.

**4. Objects, Attributes, and Joins**

Join Features showed the relationship between the object (the territory geometry) and the attribute (the zonal mean / rate tables). Matching on `adm2nm` was necessary so the calculated statistics attached to the correct polygon instead of floating as a disconnected table. Once joined, Arcade expressions (like `MEAN * 1000` and percent change from 2016 to 2020) could live with the geometry and show up in pop-ups. In other words, the map only becomes informative when geometry and attributes stay linked through a reliable key.

---

## Submit checklist

- [ ] Complete Esri malaria tutorial in AGOL (boundaries → raster → zonal stats → join → Arcade → Above/Below symbology + pop-ups)
- [ ] Share Web Map **public**; test in Incognito (no login prompt)
- [ ] Canvas: paste public map URL + this reflection
- [ ] Dark Gray Canvas basemap; increases = red (flipped ramp)
