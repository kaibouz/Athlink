# GIS 20 — Discussion 2: Discrete Objects vs. Continuous Surfaces

**Status:** Initial POSTED on Canvas (Sep 16, entry `12565615`) · Peer reply still needed (Mia Cassle draft below) · Reply was due Tue Sep 15 11:59 PM PT (late OK if open)  
**Length:** Initial ~250–350 words · Reply ~100–150 words  
**Voice note:** Written in Kai’s established style (LA water / human geography / sociology), using M2-2 terms. Course says AI-generated posts won’t meet expectations — own this before posting; edit any line that doesn’t sound like you.

---

## Initial Post (paste-ready, ~320 words)

**Part A — Discrete vs Continuous**

The phenomenon I care about for this post is **Los Angeles water infrastructure and drought stress** — the same issue I’m building toward in my water-access project. For the purpose of asking *where the pipes, aqueducts, and treatment plants sit*, I treat that infrastructure as a **discrete-object** phenomenon. Module 2 says discrete objects have clear boundaries, and the space between observations is not “filled” with that object. An aqueduct corridor or a treatment plant is either there as a feature or it isn’t. Rainfall totals and drought stress across the watershed, though, feel more like a **continuous surface**: values exist between observation points and change as a field, not as separate objects with hard edges. So depending on the question, I could defend **either** view — but for mapping the built water network itself, discrete is the cleaner start.

**Part B — Data model**

I would model the aqueducts, canals, and plants mainly as a **vector** data model (lines for conveyance, points or polygons for facilities). Vector fits discrete objects when geometry and connectivity matter — which nodes connect, which communities sit along which corridor. What gets lost is the smooth between-gauge change in precipitation or soil moisture; vector lines don’t naturally store that surface. If my purpose shifted to *how drought intensity varies across Southern California*, a **raster** surface would be better, even though coarser cells would blur sharp facility boundaries. A **TIN** could help if elevation or a 3D continuous field were the main story, but it isn’t my first choice for the pipe network.

**Part C — Challenge question**

When we study urban water access, under what conditions should drought stress be modeled as a continuous raster surface instead of as discrete infrastructure objects — and how would changing raster resolution change what we conclude about who faces higher risk?

---

## Peer reply draft (paste after Initial; ~130 words)

*(Pick a classmate whose Challenge Question you can answer with Vector/Raster/TIN tradeoffs. If no one has posted a usable challenge yet, reply to whoever discusses water, climate, or access, and still answer their challenge directly.)*

```
Hi — your challenge about choosing a data model really stuck with me because I’m dealing with the same tension in an LA water project.

I think the answer depends on the question. If we care about pipes, plants, and which corridor serves which neighborhood, vector discrete objects keep the boundaries and connections clear. But if the challenge is about a field that exists between gauges — rainfall, heat, or drought intensity — raster continuous surfaces usually fit better. What gets lost either way matters: vector can hide the smooth gradient of stress, while a coarse raster can smear community boundaries and make risk look more even than it is.

One extension I’d add is purpose-first modeling. Before picking Vector, Raster, or TIN, ask whether the map is meant to show objects people built, or a surface that fills the space between measurements. That choice changes who looks “at risk” on the final map.
```

---

## Checklist before submit

- [ ] Initial has Part A (phenomenon + discrete/continuous/either + boundaries / between observations)
- [ ] Part B names Vector/Raster/TIN + why + what is lost + when another model fits
- [ ] Part C is open-ended (not yes/no)
- [ ] Reply answers *their* challenge + adds one extension (~100–150 words)
- [ ] Did not confuse STAT “discrete variable” with GIS “discrete object”
