# STAT C1000 — Exam 1 学習シート & 確認テスト
**Scope:** Variable classification + Population / Sample / Parameter / Statistic / Sampling  
**Source review PDF:** Math 54 Exam 1 style (variables + UCSD stratified study)

---

## 満点ルーティン（毎回この順で書く）

1. **Variable of interest**（何を測っているか、英語で明確に）
2. **Qualitative** (categorical) **or Quantitative** (numerical)
3. **nominal / ordinal / discrete / continuous**
4. **Level of measurement:** Nominal · Ordinal · Interval · Ratio

記号: **μ** = 母平均（parameter） / **x̄** = 標本平均（statistic）

---

## 1) 変数分類の決定木

| 質問 | Yes | No |
|---|---|---|
| ラベル・カテゴリ？（計算に使わない数字含む） | Qualitative → 順序ある？ **Ordinal** : **Nominal** | Quantitative へ |
| 数えられる整数？ | **Discrete** | **Continuous** |
| 真のゼロがあり、比が意味ある？ | **Ratio** | **Interval** |

### Level of measurement

| Level | 意味 | 例 |
|---|---|---|
| Nominal | 名前だけ。順序なし | blood type, zip code, race |
| Ordinal | 順序あり。間隔は等しくない | 1–5 stars, letter grade |
| Interval | 差は意味あり。真のゼロなし | °C, military time, year |
| Ratio | 差も比もOK。真のゼロあり | weight, money, time duration, counts |

**罠:** Zip code / jersey number / student ID → 数字でも **Qualitative + Nominal**

---

## 2) Parameter vs Statistic

| | 平均 | 割合 | SD | 特徴 |
|---|---|---|---|---|
| Population | **μ** | **p** | **σ** | 通常は未知（true mean） |
| Sample | **x̄** | **p̂** | **s** | データから計算 |

---

## 3) Sampling methods

| Method | キーワード |
|---|---|
| Simple random | everyone equal chance |
| **Stratified** | break into groups (race/major), random from **each** |
| Cluster | pick groups, survey **all** in chosen groups |
| Systematic | every k-th |
| Convenience | hallway / volunteers（弱い） |

**ReviewのUCSD問題 = Stratified**（raceで分けて各層からrandom）

---

## 4) Review PDF — 模範解答（暗記）

### Q1

| | Variable | Type | Subtype | Level |
|---|---|---|---|---|
| A shoes | # pairs of shoes | Quantitative | Discrete | Ratio |
| B military time | time of day | Quantitative | Continuous | **Interval** |
| C car weight | car weight | Quantitative | Continuous | Ratio |
| D star ratings | restaurant rating | **Qualitative** | **Ordinal** | Ordinal |
| E time to beach | travel time | Quantitative | Continuous | Ratio |

### Q2 UCSD textbooks

- **A Parameter:** μ = true mean textbook spending per semester for UCSD students  
- **B Population:** All UC San Diego students  
- **C Variable:** money spent on textbooks/semester — Quantitative, continuous, **ratio**  
- **D Sample:** 400 students; method = **stratified random sampling** (by race)  
- **E Statistic:** x̄ = (sum of 400 spending amounts) / 400  

---

## 5) 確認テスト（自分で解いてから下の解答へ）

**分類（4点セットで書く）**

1. Number of siblings you have  
2. Blood type (A, B, AB, O)  
3. Temperature of coffee in °C  
4. Letter grade (A–F)  
5. Distance from home to SMC (miles)  
6. Year of birth (e.g. 2005)  
7. Zip code of your residence  

**短答**

8. SMC: sample 20 from each major (n=200) for mean weekly study hours. Sampling method?  
9. That study: population parameter (symbol + words)?  
10. Statistic (symbol) + how to calculate?  
11. Parameter vs statistic — which is usually unknown?  
12. Every 10th student entering the library. Sampling method?  

### 解答

1. # siblings · Quantitative · Discrete · Ratio  
2. blood type · Qualitative · Nominal · Nominal  
3. coffee temp °C · Quantitative · Continuous · **Interval**  
4. letter grade · Qualitative · Ordinal · Ordinal  
5. distance · Quantitative · Continuous · Ratio  
6. year of birth · Quantitative · Discrete · **Interval**  
7. zip code · Qualitative · Nominal · Nominal  
8. Stratified random sampling (strata = major)  
9. μ = true mean weekly study hours for all SMC students  
10. x̄ = (sum of 200 hours) / 200  
11. Parameter unknown; statistic from sample  
12. Systematic sampling  

---

## 明日の直前 30 秒チェック

1. zip → Qualitative  
2. °C / military time → Interval  
3. money / weight / duration → Ratio  
4. by race then random from each → Stratified  
5. μ ≠ x̄  

Interactive版（解答隠し・採点）: Cursor canvas `stat-c1000-exam1-study.canvas.tsx`
