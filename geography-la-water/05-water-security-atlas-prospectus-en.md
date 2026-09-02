# LA Water Security Atlas
## Faculty Prospectus / Research Platform Proposal

**Subtitle:** Understanding the Spatial Vulnerability of Southern California’s Water System  

**Author:** Kai Nozawa  
**Status:** Independent public geography project (not a course assignment)  
**Document type:** Hybrid research proposal × project prospectus for faculty review  
**Primary deliverable (horizon):** Interactive research platform  
**Near-term deliverable:** Public map essay prototype + this prospectus  

---

## 1. One-sentence purpose

> A research platform that makes Los Angeles’s water system understandable — and lets users see spatial vulnerability for themselves.

This is **not** a news site and **not** a scare campaign. The design goal is:

**Show data so users understand risk themselves.**

Entry experience: *Where does Los Angeles get its water?* → click → metropolitan Los Angeles map (not a world map).

---

## 2. Problem & significance

### 2.1 Why Los Angeles water

Los Angeles is a metropolitan water system produced across basins — not a city that drinks only local rain.

1. **Multi-source dependency (LADWP)** — Primary supplies: Los Angeles Aqueduct (Eastern Sierra), MWD purchases (SWP + Colorado River), local groundwater, and expanding recycled / stormwater capture (LADWP UWMP 2020; Briefing Book 2022–23).  
2. **L.A. Aqueduct is hydrologically volatile** — LAA share of city supply has ranged roughly **10–50%** with snowpack; recent years ~**230,000 AF/yr** (~75 billion gal). About **half** of historically exported Eastern Sierra water is now left for Owens/Mono environmental obligations (LADWP).  
3. **Dry years raise import dependence** — When Sierra snowpack falls, LAA deliveries drop and MWD purchases rise — an inverse relationship that maps vulnerability onto distant SWP and Colorado allocations (LADWP 2008; UWMP series).  
4. **Interbasin transfer as urban geography** — Metropolitan growth depended on moving water across mountains and deserts (Hundley 2001; Kahrl 1982). The tap is local; the production of water is regional and multi-state.

### 2.2 Why spatial vulnerability

Vulnerability is not only “less water.” It is where risk is produced, how it travels along corridors, and who inherits it.

1. **Climate risk is spatially transmitted** — Southwest water security is tightly coupled to warming, snowpack decline, and reservoir stress — risks that enter Southern California through shared rivers and mountain source regions (MacDonald 2010; Gleick 2010).  
2. **Colorado River over-allocation** — The 1922 Compact and later operations allocate a river whose twentieth-century assumptions overstate reliable flow; Mead/Powell shortage is a basin-scale stress that travels via the CRA into Southern California (Barnett & Pierce 2008; USBR shortage operations).  
3. **Infrastructure & energy exposure** — Long aqueducts require lift and pumping (e.g., Edmonston / Tehachapi on the SWP). Supply reliability is coupled to energy systems — outage and cost become water-security variables.  
4. **Public literacy gap = research opportunity** — Agency plans document mix and constraints; public tools rarely let users see cascading spatial risk or compare scenarios without false precision.

**Key sources:** LADWP UWMP / Briefing Book · Hundley 2001 · Kahrl 1982 · MacDonald 2010 · Barnett & Pierce 2008 · Gleick 2010 · Colorado River Compact / USBR

---

## 3. Research questions

**Primary RQ**  
How is Southern California’s urban water supply spatially produced and institutionally organized, and what vulnerabilities become visible when climate, drought, population, and energy stress are mapped together?

| ID | Focus | Question |
|---|---|---|
| RQ1 | Where | Which sources and corridors supply Los Angeles, and how do their geographies differ? |
| RQ2 | Why | Why does dependency persist — history, policy, agriculture, interstate compact, urban growth? |
| RQ3 | Risk | How do snowpack, drought, population, and energy constraints reshape vulnerability over time? |
| RQ4 | Scenarios | How do alternative futures compare under uncertainty — without claiming a single forecast? |

---

## 4. Platform architecture

### Layer 1 — Sources
Color-coded origins: Colorado River, Owens Valley / Eastern Sierra, State Water Project, local groundwater, recycled water.  
Click → annual volume, share *ranges*, seasonal pattern, recent trend — with explicit uncertainty.

### Layer 2 — Process (“How water is made”)
Correct the myth: L.A. water is not “created.” It is collected, treated, and conveyed.  
Snowpack → Reservoir → Aqueduct → Treatment → Distribution → House (3D process view).

### Layer 3 — Infrastructure
Asset dossiers (e.g., Colorado River Aqueduct): length, pumping plants, elevation lift, energy use, construction year, O&M context; photos, video, Street View.

### Layer 4 — Climate
Snowpack time series (e.g., 1980–present) coupled to reservoir relationship.

### Layer 5 — Drought
Episode path: 2012 → 2015 → 2022 → 2035 scenarios.

### Layer 6 — Population
Demand overlay: growth → demand → shortage pressure.

### Layer 7 — Energy
Conveyance is energy-intensive. Outage → pumping stop → supply risk (water–energy security nexus).

### Simulation engine
- **Stress simulation:** snowpack / Colorado River sliders → mapped cascading effects.  
- **Policy simulator:** e.g., 2035 population +15% → compare recycled water, desalination, groundwater recovery.  

**Important:** Do not declare a single future. Compare scenarios under shared assumptions — standard practice under climate/policy uncertainty.

### “Why” panels
History, policy/law, economy, energy–water nexus — so the work is not only a GIS product but a research platform.

---

## 5. Data sources (indicative)

- LADWP Urban Water Management Plans  
- Metropolitan Water District of Southern California (MWD)  
- California Department of Water Resources / State Water Project  
- U.S. Bureau of Reclamation (Colorado River operations)  
- USGS / state hydrography and basin layers  
- NASA / climate & snow products (as appropriate)  
- U.S. Census / ACS (population & demand context)  

All public maps include access dates, limits, and no false-precision annual shares.

---

## 6. Technical stack

| Phase | Stack |
|---|---|
| v1 (prototype live) | Scroll-linked map essay (MapLibre), methods chapter |
| v2 | Web GIS layers, time-series dashboards, scenario engine, cited “Why” explainers |
| Hosting | Static site + serverless APIs as needed |

Ethics: schematic corridors labeled; not a legal water-rights atlas; no agency endorsement implied.

---

## 7. Roadmap

| Phase | Focus | Success |
|---|---|---|
| **1** | Public water story + methods | Legible source→tap narrative; faculty feedback on scope & cartography |
| **2** | Atlas layers + dossiers | Sources, process, infrastructure; climate/drought series; energy–water link |
| **3** | Simulation + policy compare | Sliders; 2035 portfolio compare; documented assumptions |

**Horizon:** *California Resource Security Atlas* — Water · Energy · Wildfire · Housing · Ports & Logistics · Earthquakes — same GIS spine.

---

## 8. Academic alignment

**UC Berkeley Geography** — human–environment systems, critical infrastructure, climate adaptation, spatial analysis that asks *why*.  
**UCLA Geography** — urban environment, Southwest water resources, GIS, applied spatial science in Southern California.

Positioning for transfer / research:  
*A platform to understand Southern California’s resource, infrastructure, and environmental risks through spatial data — and to compare multiple future scenarios.*

---

## 9. Expected outcomes

1. Public literacy: non-specialists can explain sources, corridors, and key risks.  
2. Research readiness: transparent methods suitable for faculty critique.  
3. Portfolio signal: independent, spatial, policy-aware, expandable beyond water.  
4. Social value: education and civic discussion without official endorsement claims.

---

## 10. Feedback requested

1. Is Phase 1 → Phase 3 scope realistic for a strong independent project?  
2. Which datasets are most trustworthy for public synthesis vs. research-grade analysis?  
3. Where is the ethical line between helpful simplification and misleading cartography?  
4. Which “Why” panels should be prioritized first?  
5. Would GIS 27 / Independent Study / informal mentorship be appropriate later?

---

**Working title:** LA Water Security Atlas  
**Contact:** (add email)  
**Prototype URL:** (add when published)  
**Deck / PDF:** `LA-Water-Security-Atlas-Faculty-Prospectus-EN.pptx` / `.pdf`
