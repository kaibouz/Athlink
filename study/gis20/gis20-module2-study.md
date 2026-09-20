# GIS 20 · Module 2 学習ノート
**Week 2–3 · Spatial Data Fundamentals (Liu)**  
**Sources:** M2-2 Study Guide · Discussion 2 · Lab 2 · Essentials of GIS (Campbell & Shin) Ch.4

Companion canvas: `gis20-module2-study.canvas.tsx`

---

## モジュール地図

| 項目 | 役割 |
|---|---|
| M2-1 Reading | OER / 指定読書 |
| M2-2 Study Guide | object/attribute · discrete/continuous · Vector/Raster/TIN |
| Discussion 2 | 現象 → 見方 → モデル → challenge → reply |
| Reading Quiz 2 | 用語チェック |
| Lab 2 malaria | raster × vector + zonal / join の実践 |

**一文:** GIS は現実を全部保存できない → **geospatial data model** で簡略化する。

- **Object / geometry** = どこにあるか（形・位置）
- **Attribute** = それは何か（表の列）

---

## 現象の見方（Part A の核）

| 見方 | 定義 | 例 |
|---|---|---|
| **Discrete objects** | 境界がはっきり。観測のあいだに「そのもの」はない | roads, streams, parcels, buildings |
| **Continuous surfaces** | 観測のあいだにも値が続き、面として変わる | elevation, temperature, pressure |
| **Either** | 目的で切り方が変わる | population（個人 vs 密度面） |

キーワード: boundaries · exists between observations · surfaces vs objects · purpose

### 水プロジェクト対応

| レイヤ | 見方 |
|---|---|
| Aqueduct / canal / plant | Discrete |
| Snowpack / rainfall / drought | Continuous |
| Neighborhood access | Either |

---

## 3モデル（Part B の核）

### Vector
- **Point** (0D) · **Line/arc** (1D, nodes+vertices) · **Polygon** (2D)
- 属性は別DB、IDでリンク
- **Topology** = 接続・隣接を明示（gap / overshoot / sliver を減らす）

### Raster
- 格子セルに1値
- **Spatial resolution** = セルの大きさ
- **Aggregation** = 粗いセルにまとめると局所差が消える
- continuous に強い（土地被覆クラスでも可）

### TIN
- 不規則点を三角形でつないだ surface（特に elevation）
- 測定点を残しやすい／急な起伏に強い
- 単純表示だけなら raster の方が楽なことも多い

---

## 選び方（答案の型）

> I choose ___ because [phenomenon view]. This model fits because ___. It loses ___. Another model would be better when ___.

| 目的 | 向きやすい | 失いやすい |
|---|---|---|
| 境界・接続・正確位置 | Vector | 面の滑らかな変化 |
| どこでも続く場の値 | Raster | 細い境界の正確さ |
| 標高を点優先で表面化 | TIN | 単純さ |
| コミュニティ比較 | Vector polygon + rates | 内部差（aggregation） |
| 推定リスク面 | Raster | 「確定症例」との混同 |

---

## Lab 2 接続

| Lab | Module 語彙 |
|---|---|
| SALB 行政界 | Discrete → Vector polygon |
| Pf malaria raster | Continuous / grid → Raster |
| Zonal Statistics | continuous を discrete 領域に要約（bridge） |
| Join Features | geometry ↔ attribute |
| Reflection | simplification + 何が失われたか |

---

## 確認ドリル

1. 川（水路そのもの）→ Discrete + Vector line  
2. 流域の降水量 → Continuous + Raster（粗い resolution で局所差が消える）  
3. Topology → 接続・隣接の関係を明示  
4. 人口 either → 個人点 / 密度面  

---

## 注意（STAT と混ぜない）

| | STAT | GIS Module 2 |
|---|---|---|
| 対象 | 1変数の値の取り方 | 空間現象の存在のしかた |
| Discrete | 数えられる整数 | 境界のある物体 |
| Continuous | 測れる量 | どこでも値が続く面 |
