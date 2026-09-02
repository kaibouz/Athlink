/**
 * LA Water Security Atlas — Faculty prospectus (EN + JA, separate decks)
 * Usage: node geography-la-water/generate-atlas-prospectus.js
 */
const pptxgen = require("pptxgenjs");
const path = require("path");

const OUT = path.join(__dirname);
const C = {
  navy: "0B1F33",
  ink: "14233A",
  teal: "0E5F6B",
  aqua: "2A8F9E",
  pale: "E8F2F3",
  sand: "C4A574",
  rust: "A85A3A",
  gray: "5A6B73",
  light: "F4F6F5",
  white: "FFFFFF",
  line: "C5D2D4",
  blue: "1F5F7A",
  gold: "9A7B3C",
};

const COPY = {
  en: {
    lang: "en-US",
    file: "LA-Water-Security-Atlas-Faculty-Prospectus-EN.pptx",
    titleMeta: "LA Water Security Atlas — Faculty Prospectus",
    footerBrand: "LA WATER SECURITY ATLAS",
    footerAuthor: "KAI NOZAWA",
    coverKicker: "FACULTY PROSPECTUS  ·  RESEARCH PLATFORM PROPOSAL",
    coverTitle: "LA Water Security Atlas",
    coverSub: "Understanding the Spatial Vulnerability of\nSouthern California’s Water System",
    coverAuthor: "Kai Nozawa  ·  Independent public geography project  ·  Santa Monica College GIS craft applied as method",
    coverNote: "Prepared for informal faculty review  ·  Not a course assignment",
    s2k: "POSITIONING",
    s2t: "Not a news site — a research platform anyone can read",
    s2hero: "A research platform that makes Los Angeles’s water system understandable —\nand lets users see spatial vulnerability for themselves.",
    s2cards: [
      ["Design principle", "Show data so users understand risk themselves — not a lecture that tells them what to fear."],
      ["Entry question", "Where does Los Angeles get its water?\nClick → metropolitan Los Angeles map (not a world map)."],
      ["Academic fit", "Human–environment interaction · water security · infrastructure · climate risk · scenario analysis."],
    ],
    s3k: "PROBLEM & SIGNIFICANCE · 1/2",
    s3t: "Why Los Angeles water",
    s3lede: "Los Angeles is a metropolitan water system produced across basins — not a city that drinks only local rain.",
    s3items: [
      ["Multi-source dependency (LADWP)", "Primary supplies: Los Angeles Aqueduct (Eastern Sierra), MWD purchases (SWP + Colorado River), local groundwater, and expanding recycled / stormwater capture (LADWP UWMP 2020; Briefing Book 2022–23)."],
      ["L.A. Aqueduct is hydrologically volatile", "LAA share of city supply has ranged roughly 10–50% with snowpack; recent years ~230,000 AF/yr (~75 billion gal). About half of historically exported Eastern Sierra water is now left for Owens/Mono environmental obligations (LADWP)."],
      ["Dry years raise import dependence", "When Sierra snowpack falls, LAA deliveries drop and MWD purchases rise — an inverse relationship that maps vulnerability onto distant SWP and Colorado allocations (LADWP Securing L.A.’s Water Supply, 2008; UWMP series)."],
      ["Interbasin transfer as urban geography", "Metropolitan growth depended on moving water across mountains and deserts (Hundley 2001; Kahrl 1982). The tap is local; the production of water is regional and multi-state."],
    ],
    s3bk: "PROBLEM & SIGNIFICANCE · 2/2",
    s3bt: "Why spatial vulnerability",
    s3blede: "Vulnerability is not only “less water.” It is where risk is produced, how it travels along corridors, and who inherits it.",
    s3bitems: [
      ["Climate risk is spatially transmitted", "Southwest water security is tightly coupled to warming, snowpack decline, and reservoir stress — risks that enter Southern California through shared rivers and mountain source regions (MacDonald 2010; Gleick 2010)."],
      ["Colorado River over-allocation", "The 1922 Compact and later operations allocate a river whose twentieth-century assumptions overstate reliable flow; Mead/Powell shortage is a basin-scale stress that travels via the CRA into Southern California (Barnett & Pierce 2008; USBR shortage operations)."],
      ["Infrastructure & energy exposure", "Long aqueducts require lift and pumping (e.g., Edmonston / Tehachapi on the SWP). Supply reliability is coupled to energy systems — outage and cost become water-security variables, not side notes."],
      ["Public literacy gap = research opportunity", "Agency plans document mix and constraints; public tools rarely let users see cascading spatial risk or compare scenarios without false precision. That is the Atlas design gap."],
    ],
    s3bcite: "Key sources: LADWP UWMP / Briefing Book · Hundley 2001 · Kahrl 1982 · MacDonald 2010 · Barnett & Pierce 2008 · Gleick 2010 · Colorado River Compact / USBR",
    s4k: "RESEARCH QUESTIONS",
    s4t: "From Where to Why — and What if",
    s4rq: "Primary RQ: How is Southern California’s urban water supply spatially produced and institutionally organized, and what vulnerabilities become visible when climate, drought, population, and energy stress are mapped together?",
    s4cards: [
      ["RQ1 · Where", "Which sources and corridors supply Los Angeles, and how do their geographies differ?"],
      ["RQ2 · Why", "Why does dependency persist — history, policy, agriculture, interstate compact, urban growth?"],
      ["RQ3 · Risk", "How do snowpack, drought, population, and energy constraints reshape vulnerability over time?"],
      ["RQ4 · Scenarios", "How do alternative futures compare under uncertainty — without claiming a single forecast?"],
    ],
    s5k: "PLATFORM ARCHITECTURE",
    s5t: "Seven layers + simulation — one GIS foundation",
    s5layers: [
      ["1", "Sources", "Colorado · Owens · SWP · Groundwater · Recycled"],
      ["2", "Process", "Snow → reservoir → aqueduct → treatment → tap"],
      ["3", "Infrastructure", "Length · pumps · lift · power · cost · media"],
      ["4", "Climate", "Snowpack time series · reservoir coupling"],
      ["5", "Drought", "2012 → 2015 → 2022 → 2035 scenarios"],
      ["6", "Population", "Demand overlay · growth stress"],
      ["7", "Energy", "Conveyance power · outage → supply risk"],
    ],
    s5note: "+ Core features: Scenario Simulation  ·  Policy Simulator  ·  “Why” panels (history · policy · compact)",
    s6k: "LAYERS 1–3",
    s6t: "Sources · Process · Infrastructure",
    s6cards: [
      ["Layer 1 · Sources", "Color-coded supply origins:\n• Colorado River\n• Owens Valley / Eastern Sierra\n• State Water Project\n• Local groundwater\n• Recycled water\n\nClick → annual volume, share ranges, seasonal pattern, recent trend — with uncertainty notes."],
      ["Layer 2 · How water is made", "Correct the common myth: L.A. water is not “created.” It is collected, treated, and conveyed.\n\nSnowpack → Reservoir → Aqueduct → Treatment → Distribution → House\n\nExplorable 3D process view for public literacy."],
      ["Layer 3 · Infrastructure", "Asset dossiers (e.g. Colorado River Aqueduct):\n• Length · pumping plants · elevation lift\n• Energy use · build year · O&M context\n• Photos · video · Street View links\n\nMakes infrastructure a first-class geographic object."],
    ],
    s7k: "LAYERS 4–7",
    s7t: "Climate · Drought · Population · Energy",
    s7cards: [
      ["Layer 4 · Climate", "Snowpack series (1980–present) beside reservoir relationship — climate signal made spatial."],
      ["Layer 5 · Drought", "Episode path: 2012 → 2015 → 2022 → 2035 scenarios. Stress as history + futures, not a single year."],
      ["Layer 6 · Population", "Demand overlay: growth → water demand → shortage pressure. Couples demography to supply geography."],
      ["Layer 7 · Energy", "Conveyance is energy-intensive. Outage → pumping stop → supply risk. Links water security to energy security."],
    ],
    s8k: "SIMULATION ENGINE",
    s8t: "Scenario analysis — compare futures, do not declare one",
    s8lede: "Climate, population, and policy are uncertain. Research and policy analysis rely on “what if” comparison — not single-point prediction.",
    s8cards: [
      ["Stress Simulation", "Sliders (examples):\n• Snowpack 100% → 70% → 40% → 20%\n• Colorado River −20%\n\nMap outputs update for reservoirs, deliveries, agriculture, households, and power demand — so users see cascading spatial effects."],
      ["Policy Simulator (2035)", "Example: population +15%.\nCompare portfolios:\n• Needed water vs shortfall\n• Recycled water +30%\n• Desalination option\n• Groundwater recovery\n\nGoal: transparent trade-offs under shared assumptions."],
    ],
    s9k: "ACADEMIC DEPTH",
    s9t: "GIS product → research platform: answer Why",
    s9hero: "Berkeley / UCLA Geography evaluates not only map craft, but whether the work explains structure, power, history, and institutions.",
    s9cards: [
      ["History", "How Owens, Colorado, and SWP corridors were built into metropolitan life"],
      ["Policy & law", "Compacts, court limits, local agreements, wholesale institutions (MWD, LADWP, DWR)"],
      ["Economy", "Agriculture, urban growth, and demand management as geographic forces"],
      ["Energy–water nexus", "Lift, pumping, and outage risk as coupled infrastructure security"],
    ],
    s10k: "DATA & TECHNOLOGY",
    s10t: "Authoritative sources · transparent methods · open stack",
    s10cards: [
      ["Indicative data sources", "• LADWP Urban Water Management Plans\n• Metropolitan Water District (MWD)\n• California DWR / State Water Project\n• U.S. Bureau of Reclamation (Colorado)\n• USGS / state hydrography & basins\n• NASA / climate & snow products (as appropriate)\n• U.S. Census / ACS (population & demand context)\n\nAll layers: access dates, limits, and no false-precision shares."],
      ["Technical stack (v1 → v2)", "v1 (live prototype):\nStatic map essay + scroll-linked corridors\n\nv2 platform:\n• Web GIS (MapLibre / ArcGIS)\n• Time-series dashboards\n• Scenario engine (rules + models)\n• Optional LLM “explain Why” panels grounded in cited sources\n• Hosting: static + serverless APIs\n\nEthics: schematic corridors labeled; not a legal rights atlas."],
    ],
    s11k: "ROADMAP",
    s11t: "Phase 1–3 — then California Resource Security Atlas",
    s11phases: [
      ["Phase 1", "Public water story + methods", "Ship legible source→tap narrative; academic sources; faculty feedback on scope & cartography."],
      ["Phase 2", "Atlas layers + dossiers", "Sources, process, infrastructure panels; climate/drought time series; energy–water link."],
      ["Phase 3", "Simulation + policy compare", "Snowpack/Colorado sliders; 2035 portfolio compare; documented assumptions & uncertainty."],
    ],
    s11horizon: "Horizon: California Resource Security Atlas — Water · Energy · Wildfire · Housing · Ports · Earthquakes — same GIS spine.",
    s12k: "ACADEMIC ALIGNMENT",
    s12t: "Why this fits UC Berkeley & UCLA Geography",
    s12cards: [
      ["UC Berkeley Geography", "Emphasizes human–environment systems, critical infrastructure, climate adaptation, and spatial analysis that asks why patterns exist.\n\nThis project pairs public cartography with scenario analysis and institutional explanation — not decoration maps."],
      ["UCLA Geography", "Strong tradition in urban environment, water resources of the Southwest, GIS, and applied spatial science in Southern California.\n\nL.A. as study area + regional hydrosocial system is a natural fit for portfolio and later research."],
    ],
    s13k: "OUTCOMES & IMPACT",
    s13t: "What success looks like",
    s13cards: [
      ["Public literacy", "A non-specialist can explain L.A. water sources, corridors, and key risks after using the site."],
      ["Research readiness", "Transparent methods, sources, and scenario assumptions suitable for faculty critique."],
      ["Portfolio signal", "Transfer-ready artifact: independent, spatial, policy-aware, expandable beyond water."],
      ["Social value", "Supports education and civic discussion without claiming official agency endorsement."],
    ],
    s14k: "REQUEST FOR FEEDBACK",
    s14t: "What I am asking faculty",
    s14asks: [
      "Is the Phase 1 → Phase 3 scope realistic for a strong independent project?",
      "Which datasets are most trustworthy for public synthesis vs. research-grade analysis?",
      "Where is the ethical line between helpful simplification and misleading cartography?",
      "Which “Why” panels (history, compact, energy–water) should be prioritized first?",
      "Would GIS 27 / Independent Study / informal mentorship be appropriate later?",
    ],
  },
  ja: {
    lang: "ja-JP",
    file: "LA-Water-Security-Atlas-Faculty-Prospectus-JA.pptx",
    titleMeta: "LA Water Security Atlas — 教授向け事業計画・研究提案",
    footerBrand: "LA WATER SECURITY ATLAS",
    footerAuthor: "野澤カイ",
    coverKicker: "教授向け資料  ·  研究プラットフォーム提案",
    coverTitle: "LA Water Security Atlas",
    coverSub: "南カリフォルニアの水システムの\n空間的脆弱性を理解する",
    coverAuthor: "野澤カイ  ·  独立した公開地理学プロジェクト  ·  SMC GISの技術を方法として応用",
    coverNote: "非公式な教員レビュー用  ·  授業課題ではありません",
    s2k: "位置づけ",
    s2t: "ニュースサイトではない — 誰でも読める研究プラットフォーム",
    s2hero: "ロサンゼルスの水システムを理解可能にし、\nユーザー自身が空間的脆弱性を見抜ける研究プラットフォーム。",
    s2cards: [
      ["設計原則", "データを見せた結果、ユーザー自身がリスクを理解できる。恐れを教える講義ではない。"],
      ["入口の問い", "Where does Los Angeles get its water?\nクリック → LA広域地図（世界地図ではない）。"],
      ["学術的適合", "人間と環境の相互作用 · 水安全保障 · インフラ · 気候リスク · シナリオ分析。"],
    ],
    s3k: "問題と意義 · 1/2",
    s3t: "なぜLAの水か",
    s3lede: "ロサンゼルスは「近所の雨だけを飲む都市」ではない。流域を越えて生産される大都市の水システムである。",
    s3items: [
      ["多水源依存（LADWP）", "主な供給: ロサンゼルス水道橋（東部シエラ）、MWD購入水（州水道＋コロラド川）、地元地下水、拡大中の再生水／雨水貯留（LADWP UWMP 2020; Briefing Book 2022–23）。"],
      ["LA水道橋は水文的に変動が大きい", "市供給に占めるLAAの割合は積雪次第でおおよそ10–50%。近年は約23万エーカーフィート／年（約750億ガロン）。歴史的に輸出していた東部シエラ水の約半分は、オーウェンズ／モノの環境義務のため現地に残す（LADWP）。"],
      ["乾燥年は輸入依存が高まる", "シエラの積雪が減るとLAA供給が落ち、MWD購入が増える — 逆相関。脆弱性が遠いSWP・コロラドの割当に載る（LADWP 2008; UWMP系列）。"],
      ["流域間導水としての都市地理", "山と砂漠を越える導水なしに大都市成長は語れない（Hundley 2001; Kahrl 1982）。蛇口は地元。水の生産は広域・多州。"],
    ],
    s3bk: "問題と意義 · 2/2",
    s3bt: "なぜ空間的脆弱性か",
    s3blede: "脆弱性は「水が少ない」だけではない。リスクがどこで生まれ、どの回廊を伝わり、誰が継承するかである。",
    s3bitems: [
      ["気候リスクは空間的に伝わる", "南西部の水安全保障は温暖化・積雪減少・貯水ストレスと強く結合する。そのリスクは共有河川と山岳水源を通じて南カリフォルニアへ入る（MacDonald 2010; Gleick 2010）。"],
      ["コロラド川の過大割当", "1922年協定以降の枠組みは、20世紀の流量想定に対して過大割当になりやすい。ミード／パウエルの不足は流域スケールのストレスであり、コロラド川水道橋経由で南カリフォルニアへ届く（Barnett & Pierce 2008; USBR不足運用）。"],
      ["インフラとエネルギーの暴露", "長距離水道は揚水を要する（例: SWPのエドモンストン／テハチャピ）。供給の信頼性はエネルギー系と結合する — 停電とコストは「脇役」ではなく水安全保障の変数。"],
      ["公開リテラシーのギャップ＝研究機会", "機関計画は構成と制約を記録する。しかし一般向けツールは、偽の精確さなしに連鎖する空間リスクやシナリオ比較を見せるものが少ない。それがAtlasの設計ギャップ。"],
    ],
    s3bcite: "主な出典: LADWP UWMP / Briefing Book · Hundley 2001 · Kahrl 1982 · MacDonald 2010 · Barnett & Pierce 2008 · Gleick 2010 · コロラド川協定 / USBR",
    s4k: "研究問い",
    s4t: "Where から Why、そして What if へ",
    s4rq: "主問い: 南カリフォルニアの都市用水は空間的・制度的にどのように生産され、気候・旱魃・人口・エネルギーのストレスを重ねると、どのような脆弱性が見えるか？",
    s4cards: [
      ["RQ1 · Where", "ロサンゼルスを支える水源と回廊は何か。それぞれの地理はどう異なるか。"],
      ["RQ2 · Why", "なぜ依存が続くのか — 歴史、政策、農業、州間協定、都市成長。"],
      ["RQ3 · Risk", "積雪、旱魃、人口、エネルギー制約は、時間とともに脆弱性をどう変えるか。"],
      ["RQ4 · Scenarios", "不確実性の下で、代替将来をどう比較するか — 単一予測を断定せずに。"],
    ],
    s5k: "プラットフォーム構成",
    s5t: "7レイヤー + シミュレーション — ひとつのGIS基盤",
    s5layers: [
      ["1", "水源", "コロラド · オーウェンズ · SWP · 地下水 · 再生水"],
      ["2", "過程", "雪 → 貯水 → 水道橋 → 浄水 → 蛇口"],
      ["3", "インフラ", "延長 · ポンプ · 揚程 · 電力 · 費用 · メディア"],
      ["4", "気候", "積雪時系列 · 貯水との関係"],
      ["5", "旱魃", "2012 → 2015 → 2022 → 2035"],
      ["6", "人口", "需要の重なり · 成長ストレス"],
      ["7", "エネルギー", "導水電力 · 停電 → 供給リスク"],
    ],
    s5note: "+ 中核機能: シナリオ・シミュレーション  ·  政策シミュレータ  ·  「なぜ」パネル（歴史 · 政策 · 協定）",
    s6k: "レイヤー 1–3",
    s6t: "水源 · 過程 · インフラ",
    s6cards: [
      ["Layer 1 · 水源", "色分けされた供給源:\n• コロラド川\n• オーウェンズ谷／東部シエラ\n• 州水道プロジェクト\n• 地元地下水\n• 再生水\n\nクリック → 年間量、構成比の幅、季節変化、近年推移 — 不確実性注記付き。"],
      ["Layer 2 · 水はどう「作られる」か", "誤解の訂正: LAの水は「作られる」のではなく、集められ、浄水され、運ばれる。\n\n積雪 → 貯水池 → 水道橋 → 浄水場 → 配水 → 家庭\n\n一般向けの3D過程ビュー。"],
      ["Layer 3 · インフラ", "資産ドシエ（例: コロラド川水道橋）:\n• 延長 · ポンプ場 · 標高差\n• 消費電力 · 建設年 · 維持の文脈\n• 写真 · 動画 · Street View\n\nインフラを第一級の地理オブジェクトにする。"],
    ],
    s7k: "レイヤー 4–7",
    s7t: "気候 · 旱魃 · 人口 · エネルギー",
    s7cards: [
      ["Layer 4 · 気候", "積雪量の時系列（1980〜現在）と貯水との関係 — 気候シグナルを空間化する。"],
      ["Layer 5 · 旱魃", "2012 → 2015 → 2022 → 2035。単年ではなく、歴史と将来のストレスとして。"],
      ["Layer 6 · 人口", "需要オーバーレイ: 人口増 → 水需要増 → 不足圧力。人口と供給地理を結合。"],
      ["Layer 7 · エネルギー", "導水は電力集約的。停電 → 揚水停止 → 供給リスク。水とエネルギー安全保障をつなぐ。"],
    ],
    s8k: "シミュレーション",
    s8t: "シナリオ分析 — 将来を比較し、断定しない",
    s8lede: "気候・人口・政策は不確実。研究と政策分析は「もし〜なら」の比較に依る。単一点予測ではない。",
    s8cards: [
      ["ストレス・シミュレーション", "スライダー例:\n• 積雪 100% → 70% → 40% → 20%\n• コロラド川 −20%\n\n貯水・供給・農業・住宅・電力への影響を地図で更新し、連鎖する空間効果を見せる。"],
      ["政策シミュレータ（2035）", "例: 人口 +15%。\n比較ポートフォリオ:\n• 必要水量 vs 不足量\n• 再生水 +30%\n• 海水淡水化\n• 地下水回復\n\n共通仮定の下でトレードオフを透明にする。"],
    ],
    s9k: "学術的深さ",
    s9t: "GIS作品から研究プラットフォームへ — Why に答える",
    s9hero: "Berkeley / UCLA Geography が評価するのは地図技術だけでなく、構造・権力・歴史・制度を説明できるかである。",
    s9cards: [
      ["歴史", "オーウェンズ・コロラド・SWPの回廊が、いかに都市生活に組み込まれたか"],
      ["政策・法", "協定、裁判制約、地域合意、卸供給機関（MWD、LADWP、DWR）"],
      ["経済", "農業、都市成長、需要管理という地理的な力"],
      ["水–エネルギー連関", "揚水・ポンプと停電リスクを結合したインフラ安全保障"],
    ],
    s10k: "データと技術",
    s10t: "権威ある出典 · 透明な方法 · オープンな技術",
    s10cards: [
      ["想定データ源", "• LADWP Urban Water Management Plans\n• Metropolitan Water District (MWD)\n• California DWR / 州水道プロジェクト\n• 米国開拓局（コロラド）\n• USGS／州の水文・盆地\n• NASA／気候・積雪（適宜）\n• 米国センサス／ACS（人口・需要）\n\n全レイヤー: 取得日・限界・偽の精確なシェアなし。"],
      ["技術スタック（v1 → v2）", "v1（現行プロトタイプ）:\nスクロール連動マップエッセイ\n\nv2 プラットフォーム:\n• Web GIS（MapLibre / ArcGIS）\n• 時系列ダッシュボード\n• シナリオエンジン\n• 出典に根拠づけた「なぜ」説明（任意でLLM）\n• 静的配信 + サーバレスAPI\n\n倫理: 模式的回廊と明記。水利権図ではない。"],
    ],
    s11k: "ロードマップ",
    s11t: "Phase 1–3 — その先は California Resource Security Atlas",
    s11phases: [
      ["Phase 1", "公開水物語 + 方法", "水源→蛇口の読みやすい物語を公開。学術出典。範囲と地図表現への教員フィードバック。"],
      ["Phase 2", "アトラス層 + ドシエ", "水源・過程・インフラ。気候／旱魃の時系列。水–エネルギー連関。"],
      ["Phase 3", "シミュレーション + 政策比較", "積雪／コロラドのスライダー。2035ポートフォリオ比較。仮定と不確実性の文書化。"],
    ],
    s11horizon: "展望: California Resource Security Atlas — 水 · エネルギー · 山火事 · 住宅 · 港湾 · 地震 — 同じGIS背骨。",
    s12k: "学術的対応",
    s12t: "なぜ UC Berkeley と UCLA Geography に合うか",
    s12cards: [
      ["UC Berkeley Geography", "人間–環境システム、重要インフラ、気候適応、「なぜ」を問う空間分析を重視する。\n\n本プロジェクトは公開カートグラフィとシナリオ分析・制度説明を組み合わせる。装飾地図ではない。"],
      ["UCLA Geography", "都市環境、南西部の水資源、GIS、南カリフォルニアの応用空間科学に強い伝統がある。\n\nLAを研究地域とし、広域のハイドロソーシャル・システムを扱うことは、ポートフォリオと将来研究に自然に適合する。"],
    ],
    s13k: "成果とインパクト",
    s13t: "成功の定義",
    s13cards: [
      ["一般リテラシー", "専門家でなくても、水源・回廊・主要リスクを説明できる。"],
      ["研究準備性", "教員批判に耐える透明な方法・出典・シナリオ仮定。"],
      ["ポートフォリオ信号", "編入向け: 独立、空間的、政策意識、水を超えて拡張可能。"],
      ["社会的価値", "公式機関の承認を装わず、教育と市民議論を支える。"],
    ],
    s14k: "フィードバック依頼",
    s14t: "教員に伺いたいこと",
    s14asks: [
      "Phase 1 → Phase 3 の範囲は、強い独立プロジェクトとして現実的か。",
      "公開総合と研究グレード分析のそれぞれで、最も信頼できるデータセットは何か。",
      "有用な簡略化と誤解を招く地図表現の倫理的境界はどこか。",
      "「なぜ」パネル（歴史、協定、水–エネルギー）で、まず優先すべきはどれか。",
      "GIS 27／Independent Study／非公式メンタリングは、後に適切か。",
    ],
  },
};

function footer(slide, ST, t, page, total) {
  slide.addShape(ST.rect, {
    x: 0, y: 5.28, w: 13.333, h: 0.22, fill: { color: C.navy },
  });
  slide.addText(t.footerBrand, {
    x: 0.4, y: 5.3, w: 6, h: 0.18,
    fontSize: 8, fontFace: "Arial", color: C.pale, bold: true, margin: 0,
  });
  slide.addText(`${t.footerAuthor}  ·  ${page} / ${total}`, {
    x: 8.2, y: 5.3, w: 4.7, h: 0.18,
    fontSize: 8, fontFace: "Arial", color: C.pale, align: "right", margin: 0,
  });
}

function kicker(slide, text) {
  slide.addText(text, {
    x: 0.5, y: 0.28, w: 12.3, h: 0.28,
    fontSize: 11, fontFace: "Arial", color: C.teal, bold: true,
    charSpacing: 2, margin: 0,
  });
}

function title(slide, text) {
  slide.addText(text, {
    x: 0.5, y: 0.55, w: 12.3, h: 0.55,
    fontSize: 24, fontFace: "Arial", color: C.navy, bold: true, margin: 0,
  });
}

function card(slide, ST, x, y, w, h, head, body, accent = C.teal) {
  slide.addShape(ST.roundRect, {
    x, y, w, h,
    fill: { color: C.white },
    line: { color: C.line, width: 1 },
    rectRadius: 0.06,
  });
  slide.addShape(ST.rect, { x, y, w: 0.08, h, fill: { color: accent } });
  slide.addText(head, {
    x: x + 0.22, y: y + 0.14, w: w - 0.35, h: 0.28,
    fontSize: 12, fontFace: "Arial", color: C.navy, bold: true, margin: 0,
  });
  slide.addText(body, {
    x: x + 0.22, y: y + 0.42, w: w - 0.35, h: h - 0.55,
    fontSize: 11, fontFace: "Arial", color: C.gray, margin: 0, valign: "top",
  });
}

async function buildDeck(lang) {
  const t = COPY[lang];
  const pptx = new pptxgen();
  const ST = pptx.ShapeType;
  pptx.defineLayout({ name: "WIDE", width: 13.333, height: 5.5 });
  pptx.layout = "WIDE";
  pptx.author = "Kai Nozawa";
  pptx.title = t.titleMeta;
  pptx.subject = t.titleMeta;
  pptx.lang = t.lang;
  const TOTAL = 15;

  {
    const s = pptx.addSlide();
    s.addShape(ST.rect, { x: 0, y: 0, w: 13.333, h: 5.5, fill: { color: C.navy } });
    s.addShape(ST.rect, { x: 0, y: 0, w: 0.18, h: 5.5, fill: { color: C.aqua } });
    s.addText(t.coverKicker, {
      x: 0.7, y: 1.15, w: 11.5, h: 0.3,
      fontSize: 12, fontFace: "Arial", color: C.aqua, bold: true, charSpacing: 2, margin: 0,
    });
    s.addText(t.coverTitle, {
      x: 0.7, y: 1.6, w: 11.5, h: 0.7,
      fontSize: 38, fontFace: "Arial", color: C.white, bold: true, margin: 0,
    });
    s.addText(t.coverSub, {
      x: 0.7, y: 2.45, w: 10.5, h: 0.9,
      fontSize: 18, fontFace: "Arial", color: C.pale, margin: 0,
    });
    s.addText(t.coverAuthor, {
      x: 0.7, y: 4.2, w: 11.5, h: 0.3,
      fontSize: 12, fontFace: "Arial", color: C.line, margin: 0,
    });
    s.addText(t.coverNote, {
      x: 0.7, y: 4.55, w: 11.5, h: 0.25,
      fontSize: 11, fontFace: "Arial", color: C.gray, margin: 0,
    });
  }

  {
    const s = pptx.addSlide();
    s.addShape(ST.rect, { x: 0, y: 0, w: 13.333, h: 5.5, fill: { color: C.light } });
    kicker(s, t.s2k);
    title(s, t.s2t);
    s.addShape(ST.roundRect, {
      x: 0.5, y: 1.35, w: 12.3, h: 1.15, fill: { color: C.navy }, rectRadius: 0.06,
    });
    s.addText(t.s2hero, {
      x: 0.75, y: 1.55, w: 11.8, h: 0.75,
      fontSize: 17, fontFace: "Arial", color: C.white, margin: 0, valign: "middle",
    });
    t.s2cards.forEach((c, i) => card(s, ST, 0.5 + i * 4.15, 2.75, 3.95, 1.9, c[0], c[1]));
    footer(s, ST, t, 2, TOTAL);
  }

  // Problem 1/2 — Why LA water
  {
    const s = pptx.addSlide();
    s.addShape(ST.rect, { x: 0, y: 0, w: 13.333, h: 5.5, fill: { color: C.light } });
    kicker(s, t.s3k);
    title(s, t.s3t);
    s.addText(t.s3lede, {
      x: 0.5, y: 1.12, w: 12.3, h: 0.32,
      fontSize: 12, fontFace: "Arial", color: C.gray, margin: 0,
    });
    t.s3items.forEach((it, i) => {
      const y = 1.48 + i * 0.82;
      s.addShape(ST.roundRect, {
        x: 0.5, y, w: 12.3, h: 0.76,
        fill: { color: C.white }, rectRadius: 0.05, line: { color: C.line, width: 1 },
      });
      s.addText(String(i + 1).padStart(2, "0"), {
        x: 0.65, y: y + 0.18, w: 0.55, h: 0.4,
        fontSize: 14, fontFace: "Arial", color: C.aqua, bold: true, margin: 0,
      });
      s.addText(it[0], {
        x: 1.3, y: y + 0.08, w: 11.2, h: 0.26,
        fontSize: 13, fontFace: "Arial", color: C.navy, bold: true, margin: 0,
      });
      s.addText(it[1], {
        x: 1.3, y: y + 0.34, w: 11.2, h: 0.38,
        fontSize: 11, fontFace: "Arial", color: C.gray, margin: 0,
      });
    });
    footer(s, ST, t, 3, TOTAL);
  }

  // Problem 2/2 — Why spatial vulnerability
  {
    const s = pptx.addSlide();
    s.addShape(ST.rect, { x: 0, y: 0, w: 13.333, h: 5.5, fill: { color: C.light } });
    kicker(s, t.s3bk);
    title(s, t.s3bt);
    s.addText(t.s3blede, {
      x: 0.5, y: 1.12, w: 12.3, h: 0.32,
      fontSize: 12, fontFace: "Arial", color: C.gray, margin: 0,
    });
    t.s3bitems.forEach((it, i) => {
      const y = 1.45 + i * 0.78;
      s.addShape(ST.roundRect, {
        x: 0.5, y, w: 12.3, h: 0.72,
        fill: { color: C.white }, rectRadius: 0.05, line: { color: C.line, width: 1 },
      });
      s.addText(String(i + 1).padStart(2, "0"), {
        x: 0.65, y: y + 0.16, w: 0.55, h: 0.4,
        fontSize: 14, fontFace: "Arial", color: C.aqua, bold: true, margin: 0,
      });
      s.addText(it[0], {
        x: 1.3, y: y + 0.06, w: 11.2, h: 0.24,
        fontSize: 13, fontFace: "Arial", color: C.navy, bold: true, margin: 0,
      });
      s.addText(it[1], {
        x: 1.3, y: y + 0.3, w: 11.2, h: 0.38,
        fontSize: 11, fontFace: "Arial", color: C.gray, margin: 0,
      });
    });
    s.addText(t.s3bcite, {
      x: 0.5, y: 4.65, w: 12.3, h: 0.28,
      fontSize: 10, fontFace: "Arial", color: C.teal, margin: 0,
    });
    footer(s, ST, t, 4, TOTAL);
  }

  {
    const s = pptx.addSlide();
    s.addShape(ST.rect, { x: 0, y: 0, w: 13.333, h: 5.5, fill: { color: C.light } });
    kicker(s, t.s4k);
    title(s, t.s4t);
    s.addShape(ST.roundRect, {
      x: 0.5, y: 1.3, w: 12.3, h: 1.25, fill: { color: C.pale }, rectRadius: 0.06,
    });
    s.addText(t.s4rq, {
      x: 0.75, y: 1.5, w: 11.8, h: 0.9,
      fontSize: 14, fontFace: "Arial", color: C.ink, margin: 0, valign: "middle",
    });
    t.s4cards.forEach((r, i) => {
      const x = 0.5 + (i % 2) * 6.4;
      const y = 2.8 + Math.floor(i / 2) * 1.05;
      card(s, ST, x, y, 6.15, 0.95, r[0], r[1], i % 2 === 0 ? C.teal : C.gold);
    });
    footer(s, ST, t, 5, TOTAL);
  }

  {
    const s = pptx.addSlide();
    s.addShape(ST.rect, { x: 0, y: 0, w: 13.333, h: 5.5, fill: { color: C.light } });
    kicker(s, t.s5k);
    title(s, t.s5t);
    t.s5layers.forEach((L, i) => {
      const x = 0.4 + i * 1.82;
      s.addShape(ST.roundRect, {
        x, y: 1.35, w: 1.7, h: 2.85,
        fill: { color: C.white }, rectRadius: 0.06, line: { color: C.line, width: 1 },
      });
      s.addShape(ST.ellipse, {
        x: x + 0.5, y: 1.55, w: 0.7, h: 0.7, fill: { color: C.navy },
      });
      s.addText(L[0], {
        x: x + 0.5, y: 1.7, w: 0.7, h: 0.4,
        fontSize: 18, fontFace: "Arial", color: C.white, bold: true, align: "center", margin: 0,
      });
      s.addText(L[1], {
        x: x + 0.1, y: 2.4, w: 1.5, h: 0.4,
        fontSize: 13, fontFace: "Arial", color: C.navy, bold: true, align: "center", margin: 0,
      });
      s.addText(L[2], {
        x: x + 0.1, y: 2.9, w: 1.5, h: 1.1,
        fontSize: 10, fontFace: "Arial", color: C.gray, align: "center", margin: 0,
      });
    });
    s.addText(t.s5note, {
      x: 0.5, y: 4.45, w: 12.3, h: 0.35,
      fontSize: 12, fontFace: "Arial", color: C.teal, bold: true, margin: 0,
    });
    footer(s, ST, t, 6, TOTAL);
  }

  {
    const s = pptx.addSlide();
    s.addShape(ST.rect, { x: 0, y: 0, w: 13.333, h: 5.5, fill: { color: C.light } });
    kicker(s, t.s6k);
    title(s, t.s6t);
    const accents = [C.teal, C.blue, C.gold];
    t.s6cards.forEach((c, i) => card(s, ST, 0.5 + i * 4.15, 1.3, 4.0, 3.4, c[0], c[1], accents[i]));
    footer(s, ST, t, 7, TOTAL);
  }

  {
    const s = pptx.addSlide();
    s.addShape(ST.rect, { x: 0, y: 0, w: 13.333, h: 5.5, fill: { color: C.light } });
    kicker(s, t.s7k);
    title(s, t.s7t);
    t.s7cards.forEach((b, i) => {
      const x = 0.5 + (i % 2) * 6.4;
      const y = 1.3 + Math.floor(i / 2) * 1.7;
      card(s, ST, x, y, 6.15, 1.55, b[0], b[1], i < 2 ? C.teal : C.rust);
    });
    footer(s, ST, t, 8, TOTAL);
  }

  {
    const s = pptx.addSlide();
    s.addShape(ST.rect, { x: 0, y: 0, w: 13.333, h: 5.5, fill: { color: C.light } });
    kicker(s, t.s8k);
    title(s, t.s8t);
    s.addText(t.s8lede, {
      x: 0.5, y: 1.2, w: 12.3, h: 0.4,
      fontSize: 13, fontFace: "Arial", color: C.gray, margin: 0,
    });
    card(s, ST, 0.5, 1.75, 6.15, 2.85, t.s8cards[0][0], t.s8cards[0][1], C.teal);
    card(s, ST, 6.85, 1.75, 5.95, 2.85, t.s8cards[1][0], t.s8cards[1][1], C.gold);
    footer(s, ST, t, 9, TOTAL);
  }

  {
    const s = pptx.addSlide();
    s.addShape(ST.rect, { x: 0, y: 0, w: 13.333, h: 5.5, fill: { color: C.light } });
    kicker(s, t.s9k);
    title(s, t.s9t);
    s.addShape(ST.roundRect, {
      x: 0.5, y: 1.3, w: 12.3, h: 1.0, fill: { color: C.navy }, rectRadius: 0.06,
    });
    s.addText(t.s9hero, {
      x: 0.75, y: 1.5, w: 11.8, h: 0.6,
      fontSize: 14, fontFace: "Arial", color: C.white, margin: 0, valign: "middle",
    });
    t.s9cards.forEach((w, i) => card(s, ST, 0.5 + i * 3.2, 2.55, 3.05, 2.1, w[0], w[1], C.aqua));
    footer(s, ST, t, 10, TOTAL);
  }

  {
    const s = pptx.addSlide();
    s.addShape(ST.rect, { x: 0, y: 0, w: 13.333, h: 5.5, fill: { color: C.light } });
    kicker(s, t.s10k);
    title(s, t.s10t);
    card(s, ST, 0.5, 1.3, 6.15, 3.4, t.s10cards[0][0], t.s10cards[0][1], C.teal);
    card(s, ST, 6.85, 1.3, 5.95, 3.4, t.s10cards[1][0], t.s10cards[1][1], C.blue);
    footer(s, ST, t, 11, TOTAL);
  }

  {
    const s = pptx.addSlide();
    s.addShape(ST.rect, { x: 0, y: 0, w: 13.333, h: 5.5, fill: { color: C.light } });
    kicker(s, t.s11k);
    title(s, t.s11t);
    t.s11phases.forEach((p, i) => {
      const x = 0.5 + i * 4.2;
      s.addShape(ST.roundRect, {
        x, y: 1.3, w: 4.0, h: 2.35,
        fill: { color: C.white }, rectRadius: 0.06, line: { color: C.line, width: 1 },
      });
      s.addText(p[0], {
        x: x + 0.25, y: 1.5, w: 3.5, h: 0.3,
        fontSize: 12, fontFace: "Arial", color: C.aqua, bold: true, margin: 0,
      });
      s.addText(p[1], {
        x: x + 0.25, y: 1.85, w: 3.5, h: 0.45,
        fontSize: 14, fontFace: "Arial", color: C.navy, bold: true, margin: 0,
      });
      s.addText(p[2], {
        x: x + 0.25, y: 2.4, w: 3.5, h: 1.0,
        fontSize: 12, fontFace: "Arial", color: C.gray, margin: 0,
      });
    });
    s.addShape(ST.roundRect, {
      x: 0.5, y: 3.85, w: 12.3, h: 0.95, fill: { color: C.navy }, rectRadius: 0.06,
    });
    s.addText(t.s11horizon, {
      x: 0.75, y: 4.1, w: 11.8, h: 0.5,
      fontSize: 13, fontFace: "Arial", color: C.white, margin: 0, valign: "middle",
    });
    footer(s, ST, t, 12, TOTAL);
  }

  {
    const s = pptx.addSlide();
    s.addShape(ST.rect, { x: 0, y: 0, w: 13.333, h: 5.5, fill: { color: C.light } });
    kicker(s, t.s12k);
    title(s, t.s12t);
    card(s, ST, 0.5, 1.3, 6.15, 3.4, t.s12cards[0][0], t.s12cards[0][1], C.teal);
    card(s, ST, 6.85, 1.3, 5.95, 3.4, t.s12cards[1][0], t.s12cards[1][1], C.blue);
    footer(s, ST, t, 13, TOTAL);
  }

  {
    const s = pptx.addSlide();
    s.addShape(ST.rect, { x: 0, y: 0, w: 13.333, h: 5.5, fill: { color: C.light } });
    kicker(s, t.s13k);
    title(s, t.s13t);
    t.s13cards.forEach((o, i) => {
      const x = 0.5 + (i % 2) * 6.4;
      const y = 1.3 + Math.floor(i / 2) * 1.7;
      card(s, ST, x, y, 6.15, 1.55, o[0], o[1]);
    });
    footer(s, ST, t, 14, TOTAL);
  }

  {
    const s = pptx.addSlide();
    s.addShape(ST.rect, { x: 0, y: 0, w: 13.333, h: 5.5, fill: { color: C.light } });
    kicker(s, t.s14k);
    title(s, t.s14t);
    t.s14asks.forEach((a, i) => {
      const y = 1.25 + i * 0.6;
      s.addShape(ST.roundRect, {
        x: 0.5, y, w: 12.3, h: 0.52,
        fill: { color: C.white }, rectRadius: 0.04, line: { color: C.line, width: 1 },
      });
      s.addText(`${i + 1}.  ${a}`, {
        x: 0.75, y: y + 0.12, w: 11.8, h: 0.3,
        fontSize: 13, fontFace: "Arial", color: C.ink, margin: 0,
      });
    });
    footer(s, ST, t, 15, TOTAL);
  }

  const outPath = path.join(OUT, t.file);
  await pptx.writeFile({ fileName: outPath });
  console.log(outPath);
}

async function main() {
  await buildDeck("en");
  await buildDeck("ja");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
