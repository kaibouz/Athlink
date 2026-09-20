# GIS 20 — Discussion 2: Seeing the World in GIS  
## Discrete Objects vs. Continuous Surfaces

**Status:** Paste-ready initial post (Beyond Making Maps is already graded 10/10)  
**Canvas:** https://online.smc.edu/courses/85288/assignments/2313328  
**Note:** Write in your own voice before posting. Course expects your reasoning, not a copied template.

---

## Paste-ready Initial Post

**Parts A–B**

I chose **Los Angeles water access** as my phenomenon, and I treat it as an **either** case. **Aqueducts, canals, pumps, and plants** are **discrete objects** — they have clear boundaries, and between pipe segments there is not “more pipe” filling space the way temperature does. **Snowpack, rainfall, and drought stress** in the source regions are **continuous surfaces** — values exist between observation points and change gradually across space. So the same water story needs both views: discrete for the built system that moves water, continuous for the conditions that stress that system.

For infrastructure I would use a **vector** model (lines for corridors, points for facilities) because I care about exact routes and which neighborhoods sit near or far from supply. What vector loses is the smooth drought field across a basin. If the purpose shifts to mapping drought or snowpack, **raster** is better for continuous values, but it loses sharp boundary precision as cell size aggregates detail. **TIN** would matter more for source-area elevation; for access, vector + raster matter more.

**Part C — Challenge question**

When we map urban water security, under what conditions should drought be a continuous raster surface, and when does treating supply infrastructure as discrete vector features change the story about who is vulnerable?

---

## Word count (approx.)

Parts A–B ≈ 180 words · Part C separate

---

## Quick self-check before paste

- [ ] Part A uses GIS language (boundaries / between observations), not only STAT “count vs measure”
- [ ] Part B names a model + what is lost + when another model fits
- [ ] Challenge is open-ended (not yes/no)
- [ ] Sounds like you (LA water / access), not a generic template

---

## Reply — Mia Cassle (paste-ready, ~140 words)

**Her challenge:** How much geographic detail should a disease map show to help communities without invading privacy or stigmatizing neighborhoods?

```
Hi Mia — I liked how you separated discrete reported cases from a continuous “estimated risk” surface, and how you chose county/neighborhood polygons so the map compares communities instead of showing individual patients.

To your challenge question: I think the useful level of detail is usually aggregated units like neighborhoods or ZIP-like areas with rates, not point locations of cases. In GIS terms, that means trading precision for privacy — aggregation and coarser resolution hide personal locations, but they can also erase within-area differences and make a whole community look the same. A raster risk surface can help planning, but only if we label it as estimated risk, not confirmed infections, so people are not treated as a stigma layer.

One extension: before publishing fine detail, I’d ask whether more testing (not more disease) is driving the pattern — otherwise the map can unfairly mark neighborhoods that are simply better measured.
```

