const pptxgen = require("pptxgenjs");

const C = {
  navy: "123247", teal: "0B5663", aqua: "43A9B8", pale: "DDECEE",
  sky: "B9DDE4", sand: "D9B77B", rust: "B56243", ink: "17313A",
  gray: "587276", light: "F5F7F6", white: "FFFFFF", line: "C8D6D7",
  green: "6A8F72", blue: "28799A"
};

const COPY = {
  en: {
    lang: "en-US",
    title: "Where Does L.A.'s Water Come From?",
    subject: "Independent public geography project prospectus",
    footerLeft: "WHERE DOES L.A.'S WATER COME FROM?",
    footerRight: "KAI NOZAWA · INDEPENDENT PUBLIC GEOGRAPHY PROJECT",
    coverTitle: "WHERE DOES\nL.A.'S WATER\nCOME FROM?",
    coverSubtitle: "An independent public geography & cartography project",
    coverDocType: "PROJECT PROSPECTUS",
    coverAuthor: "Kai Nozawa",
    coverNote: "Independent project · Not for course credit",
    slides: {
      execTitle: "Project Overview",
      execSub: "EXECUTIVE SUMMARY",
      execHero: "From the tap to the source.\nMake an invisible urban system geographically legible.",
      execHeroEn: "A public map story of Southern California's long-distance water supply.",
      cards: [
        ["Deliverables", "Public StoryMap\nMethods & Sources\nProject prospectus"],
        ["Audience", "General public (primary)\nStudents & faculty (secondary)"],
        ["Geography", "Start at the L.A. tap\nTrace major supply corridors"],
        ["Frame", "Water security\nDrought resilience\nPublic geography"]
      ],
      execNote: "Not a course assignment — applies GIS 25 cartographic craft independently",
      problemTitle: "Why This Site Matters",
      problemSub: "THE PUBLIC GEOGRAPHY PROBLEM",
      visible: "VISIBLE",
      invisible: "INVISIBLE",
      visibleWord: "The tap",
      invisibleWord: "Sources, aqueducts, institutions",
      problemBullets: [
        "Residents usually see only the endpoint of the supply system",
        "Source regions span mountains, deserts, and political borders",
        "Drought, snowpack decline, and shared-river stress become urban risk"
      ],
      publicValue: "PUBLIC VALUE",
      publicValueBody: "In 8–12 minutes, a general reader should understand the water journey and dependency structure.",
      rqTitle: "Research Question",
      rqSub: "RESEARCH QUESTION",
      rqMain: "How is Los Angeles urban water spatially produced through local sources and long-distance interbasin transfers, and what vulnerabilities does that geography create under drought and climate stress?",
      rqItems: [
        ["01", "Corridors", "Which major corridors move water into Los Angeles?"],
        ["02", "Uncertainty", "How can dependency be shown without false precision?"],
        ["03", "Public design", "How can cartography make water security legible?"]
      ],
      geoTitle: "Supply Geography: Three Long Corridors + Local Sources",
      geoSub: "STUDY AREA & SUPPLY CORRIDORS · CONCEPTUAL, NOT TO SCALE",
      california: "CALIFORNIA",
      pacific: "PACIFIC\nOCEAN",
      la: "LOS ANGELES",
      routes: [
        ["LA AQUEDUCT\nEastern Sierra / Owens", "aqua"],
        ["STATE WATER PROJECT\nNorth / Delta", "green"],
        ["COLORADO RIVER\nShared Southwest supply", "sand"]
      ],
      local: "LOCAL\nSOURCES",
      geoCard1: ["Story protagonist", "The L.A. tap. Statewide context supports the story; it is not a full water-rights atlas."],
      geoCard2: ["v1 boundary", "No statewide rights atlas and no exact annual allotment claims."],
      frameTitle: "Conceptual Framework",
      frameSub: "CONCEPTUAL FRAMEWORK",
      frames: [
        ["01", "Interbasin transfer", "INTERBASIN TRANSFER", "Distant watersheds spatially produce urban water"],
        ["02", "Water security", "WATER SECURITY", "Read reliability, diversity, and supply stress"],
        ["03", "Hydrosocial view", "HYDROSOCIAL PERSPECTIVE", "Nature, infrastructure, and institutions shape urban water"],
        ["04", "Resilience", "RESILIENCE", "Diversify imports, local sources, and demand management"]
      ],
      frameNote: "Hazard frame for v1: supply-side drought and climate risk — not flood inundation mapping",
      storyTitle: "Public Site Narrative Design",
      storySub: "STORYMAP EXPERIENCE · ONE JOB PER CHAPTER",
      chapters: [
        ["0–1", "Entry", "Title → L.A. tap"],
        ["2", "Overview", "A city that imports water"],
        ["3–5", "Corridors", "Eastern Sierra / Colorado / SWP"],
        ["6", "Local", "Groundwater, recycling, capture"],
        ["7", "Risk", "Drought, climate, resilience"],
        ["8–9", "Trust", "Takeaway → Methods / Sources"]
      ],
      promise: "USER PROMISE",
      promiseBody: "Readers move in one path: where it comes from → why it is vulnerable → how the map can be trusted",
      methodsTitle: "GIS & Cartographic Methods",
      methodsSub: "METHODS & DATA GOVERNANCE",
      methodCards: [
        ["1. Compile public data", "LADWP / MWD / California DWR / USGS / Living Atlas\n\nRecord sources, access dates, and layer notes"],
        ["2. Build corridor maps", "Statewide view + regional insets\nRestrained basemaps\nProjection and label hierarchy"],
        ["3. Translate for the public", "StoryMap chapter sequence\nDefine technical terms briefly\nKeep language rules consistent"]
      ],
      uncertainty: "UNCERTAINTY RULE",
      uncertaintyBody: "Show ranges, years, sources, and notes. Do not present variable shares as fixed facts.",
      uncertaintyFooter: "Design what the map cannot say, not only what it can show.",
      audienceTitle: "Audience Design",
      audienceSub: "AUDIENCE & ACCESSIBILITY",
      audiences: [
        ["General public", "GENERAL PUBLIC", "Plain language\nShort chapters\nOne idea per section", "aqua"],
        ["Students", "STUDENTS / LEARNERS", "Clear diagrams of\ncorridors and dependency", "green"],
        ["Faculty", "FACULTY / ACADEMIC", "Question, methods,\nlimits, and sources", "rust"]
      ],
      langTitle: "Language system",
      langBody: "English-only prospectus for faculty review; Japanese-only version for separate distribution",
      deliverTitle: "Deliverables & v1 Scope",
      deliverSub: "DELIVERABLES & VERSION 1 BOUNDARY",
      deliverLabel: "DELIVER",
      deliverBullets: [
        "Public StoryMap: readable in 8–12 minutes",
        "Methods & Sources: data, dates, limits, software, citations",
        "Project prospectus for faculty feedback",
        "After publication, request informal (non-graded) advice"
      ],
      notLabel: "NOT IN V1",
      notBullets: [
        "User-contributed layer platform",
        "SAR flood detection",
        "Parcel-level consumption mapping",
        "Legal water-rights adjudication map"
      ],
      deliverNote: "Finish one strong site first, then expand in Phase 2",
      opsTitle: "Team, Tools & Budget",
      opsSub: "OPERATING MODEL & RESOURCE PLAN",
      opsCards: [
        ["Production", "Kai Nozawa\nResearch, maps, writing, publish, revise\n\nFaculty advises after completion"],
        ["Tools", "ArcGIS Online / StoryMaps\nArcGIS Pro when needed\nOpen public datasets\nDocument management"],
        ["Direct costs", "Prefer existing licenses and free data\n\nEstimated extras: $0–50\n(optional domain, etc.)"]
      ],
      opsHero: "Non-profit educational public deliverable",
      opsHeroEn: "Monetization is not a v1 success metric.",
      opsBullets: [
        "Success = quality, geographic integrity, reader understanding",
        "No access analytics or user-data collection in v1",
        "Useful for portfolio, transfer, and research conversations"
      ],
      timelineTitle: "Six-Week Delivery Roadmap",
      timelineSub: "INDEPENDENT DELIVERY TIMELINE",
      phases: [
        ["1", "Design", "Finalize outline\nSource inventory"],
        ["2–3", "Maps", "Basemaps\nCorridor layers"],
        ["3", "Writing", "Narrative draft\nMethods notes"],
        ["4", "Build", "StoryMap\nMethods section"],
        ["5", "Quality", "Self-review\nRevision"],
        ["5–6", "Publish", "Publish URL\nAsk for advice"]
      ],
      timelineNote: "Quality rule: do not expand scope to meet a date — finish one publishable product",
      riskTitle: "Risks, Limits & Ethics",
      riskSub: "RISK MANAGEMENT & CARTOGRAPHIC ETHICS",
      riskHeaders: ["Risk", "Why it matters", "Response"],
      risks: [
        ["False precision", "Variable annual shares look like fixed facts", "Show range, year, source, and notes"],
        ["Over-simplification", "Networks and rights collapse into one line", "Separate concept maps from data maps"],
        ["Source-region harm", "Source places become only resource zones", "Note history and local impacts briefly"],
        ["Official look", "Readers may assume agency endorsement", "State independent / unofficial clearly"],
        ["Scope creep", "Flood, full rights, and participation expand too early", "Lock v1 boundary; move extras to Phase 2"]
      ],
      evalTitle: "Success Criteria & Faculty Feedback",
      evalSub: "SUCCESS CRITERIA & INFORMAL FACULTY REVIEW",
      metrics: [
        ["01", "Clear question", "A first-time reader can state the purpose"],
        ["02", "Geographic care", "Corridors and source regions are responsibly shown"],
        ["03", "Map quality", "Hierarchy, legibility, ethical simplification"],
        ["04", "Academic integrity", "Sources, uncertainty, and limits are explicit"],
        ["05", "Public value", "A non-specialist leaves with lasting insight"]
      ],
      feedback: "FEEDBACK REQUESTED",
      feedbackBullets: [
        "Is this scope right for an independent project?",
        "Which water-source datasets are most trustworthy?",
        "Where does simplification become misleading?",
        "What should Phase 2 prioritize?"
      ],
      feedbackNote: "Bring the finished site and this prospectus for informal advice.",
      closeTitle: "TO UNDERSTAND LOS ANGELES,\nFOLLOW THE WATER.",
      closeSub: "Across mountains, deserts, and decades of infrastructure.",
      closeAuthor: "Kai Nozawa",
      closeUrl: "PROJECT URL: ________________________",
      closeFooter: "Independent public geography project · Prospectus"
    }
  },
  ja: {
    lang: "ja-JP",
    title: "ロサンゼルスの水はどこから来るのか？",
    subject: "独立した公開地理プロジェクト事業計画書",
    footerLeft: "ロサンゼルスの水はどこから来るのか？",
    footerRight: "野澤 海 · 独立公開地理プロジェクト",
    coverTitle: "ロサンゼルスの水は\nどこから来るのか？",
    coverSubtitle: "独立した公開地理・カートグラフィプロジェクト",
    coverDocType: "事業計画書",
    coverAuthor: "野澤 海（Kai Nozawa）",
    coverNote: "独立制作 · 単位提出課題ではない",
    slides: {
      execTitle: "プロジェクト概要",
      execSub: "EXECUTIVE SUMMARY",
      execHero: "蛇口から、水源まで。\n見えない都市システムを「読める地理」にする。",
      execHeroEn: "南カリフォルニアの長距離水供給をたどる公開マップストーリー。",
      cards: [
        ["成果物", "公開StoryMap\nMethods & Sources\n事業計画書"],
        ["読者", "一般大衆（主）\n学習者・教員（副）"],
        ["地理", "LAの蛇口を起点に\n主要供給回廊へ"],
        ["枠組み", "水の安全保障\n旱魃レジリエンス\n公共地理"]
      ],
      execNote: "学校課題ではなく、GIS 25の地図作法を応用する独立制作",
      problemTitle: "なぜこのサイトが必要か",
      problemSub: "THE PUBLIC GEOGRAPHY PROBLEM",
      visible: "見えるもの",
      invisible: "見えにくいもの",
      visibleWord: "蛇口",
      invisibleWord: "水源・導水路・制度",
      problemBullets: [
        "LAの住民が目にするのは供給システムの終点だけ",
        "水源は山・砂漠・行政境界を越えて遠距離に分散",
        "旱魃・雪包減少・共有河川の変動は都市側のリスクになる"
      ],
      publicValue: "公共的価値",
      publicValueBody: "一般読者が8–12分で「水の旅」と依存構造を理解する",
      rqTitle: "研究問い",
      rqSub: "RESEARCH QUESTION",
      rqMain: "ロサンゼルスの都市用水は、地元水源と長距離の流域間導水によって空間的にどのように生産され、その地理は旱魃・気候ストレス下でどのような脆弱性を生むか。",
      rqItems: [
        ["01", "主要回廊", "LAへ水を運ぶ主要な回廊は何か？"],
        ["02", "不確実性", "偽の正確さなしに依存をどう示すか？"],
        ["03", "公共性", "水の安全保障をどう読める地図にするか？"]
      ],
      geoTitle: "水の供給地理：三つの長距離回廊＋地域水源",
      geoSub: "対象地域と供給回廊 · 概念図（縮尺なし）",
      california: "カリフォルニア",
      pacific: "太平洋",
      la: "ロサンゼルス",
      routes: [
        ["LA水道橋\n東部シエラ / オーウェンズ", "aqua"],
        ["州水道プロジェクト\n北部 / デルタ", "green"],
        ["コロラド川\n南西部共有供給", "sand"]
      ],
      local: "地元\n水源",
      geoCard1: ["物語の主人公", "LAの蛇口。州全体は背景として、水源と依存を説明する。"],
      geoCard2: ["初版の境界", "全州の水利権アトラスや正確な年次配分は扱わない。"],
      frameTitle: "学術的な概念枠組み",
      frameSub: "CONCEPTUAL FRAMEWORK",
      frames: [
        ["01", "流域間導水", "INTERBASIN TRANSFER", "遠隔地の流域が都市の水を空間的に生産する"],
        ["02", "水の安全保障", "WATER SECURITY", "供給の信頼性・多様性・ストレスを読む"],
        ["03", "ハイドロソーシャル", "HYDROSOCIAL PERSPECTIVE", "自然・インフラ・制度が都市の水を形成する"],
        ["04", "レジリエンス", "RESILIENCE", "輸入・地域水源・需要管理の多様化を適応として捉える"]
      ],
      frameNote: "v1のハザード枠：洪水浸水域ではなく、供給側の旱魃・気候リスク",
      storyTitle: "公開サイトの物語設計",
      storySub: "STORYMAP EXPERIENCE · 1章1役割",
      chapters: [
        ["0–1", "入口", "タイトル → LAの蛇口"],
        ["2", "全景", "水を輸入する都市"],
        ["3–5", "三回廊", "東部シエラ / コロラド / SWP"],
        ["6", "地域", "地下水・再生水・雨水"],
        ["7", "リスク", "旱魃・気候・レジリエンス"],
        ["8–9", "信頼", "結論 → Methods / Sources"]
      ],
      promise: "読者への約束",
      promiseBody: "一般読者が「どこから来るか」→「なぜ脆弱か」→「どう信頼できるか」を一本道で理解する",
      methodsTitle: "調査・GIS・カートグラフィ方法",
      methodsSub: "METHODS & DATA GOVERNANCE",
      methodCards: [
        ["1. 公開データの収集", "LADWP / MWD / California DWR / USGS / Living Atlas\n\n出典・取得日・レイヤー説明を記録"],
        ["2. 回廊地図の制作", "州全体図＋地域拡大図\n控えめなベースマップ\n適切な投影とラベル階層"],
        ["3. 公共向け翻訳", "StoryMapによる章構成\n専門語は短く定義\n表記ルールを一貫させる"]
      ],
      uncertainty: "不確実性のルール",
      uncertaintyBody: "年により変動する供給比率、簡略化した回廊、法的権利ではない概算を明示する。",
      uncertaintyFooter: "データを集めるだけでなく、何を地図が言えないかも設計する。",
      audienceTitle: "読者設計",
      audienceSub: "AUDIENCE & ACCESSIBILITY",
      audiences: [
        ["一般大衆", "GENERAL PUBLIC", "平易な言葉\n短い章\n1章1メッセージ", "aqua"],
        ["学習者", "STUDENTS / LEARNERS", "回廊と依存を\n追える図解", "green"],
        ["教員・研究者", "FACULTY / ACADEMIC", "問い・方法・限界・\n出典の透明性", "rust"]
      ],
      langTitle: "言語システム",
      langBody: "教授レビュー用は英語版、別配布用は日本語版として資料を分ける",
      deliverTitle: "成果物と初版のスコープ",
      deliverSub: "DELIVERABLES & VERSION 1 BOUNDARY",
      deliverLabel: "成果物",
      deliverBullets: [
        "公開StoryMap：8–12分で通読できる地図物語",
        "Methods & Sources：データ、取得日、限界、ソフト、引用",
        "事業計画書：完成後のフィードバック用",
        "公開後に教授へ非採点の助言を依頼"
      ],
      notLabel: "v1に含めない",
      notBullets: [
        "ユーザー投稿レイヤー基盤",
        "SARによる洪水検出",
        "区画単位の使用量マップ",
        "水利権の法的確定図"
      ],
      deliverNote: "完成を優先：一つの強いサイトを公開してからPhase 2へ",
      opsTitle: "実行体制・必要資源・予算",
      opsSub: "OPERATING MODEL & RESOURCE PLAN",
      opsCards: [
        ["制作責任", "野澤 海\n調査・地図制作・本文・公開・改訂\n\n教授は完成後の助言者"],
        ["ツール", "ArcGIS Online / StoryMaps\n必要時は ArcGIS Pro\n公開機関のオープンデータ\n文書管理"],
        ["直接費", "既存ライセンスと無料データを優先\n\n想定追加費用：$0–50\n（任意ドメイン等）"]
      ],
      opsHero: "非営利・教育目的の公開成果物",
      opsHeroEn: "収益化はv1の成功指標にしない。",
      opsBullets: [
        "成功指標は公開品質・地理的正確性・読者理解",
        "アクセス解析やユーザーデータ収集は行わない",
        "将来のポートフォリオ・編入・研究相談に活用"
      ],
      timelineTitle: "6週間の制作ロードマップ",
      timelineSub: "INDEPENDENT DELIVERY TIMELINE",
      phases: [
        ["1", "設計", "章立て確定\nソース棚卸し"],
        ["2–3", "地図", "ベースマップ\n回廊レイヤー"],
        ["3", "文章", "本文ドラフト\nMethodsメモ"],
        ["4", "統合", "StoryMap\nMethods"],
        ["5", "品質", "自己レビュー\n改訂"],
        ["5–6", "公開", "URL公開\n教授へ相談"]
      ],
      timelineNote: "品質の基準：締切に合わせて範囲を広げず、公開できる一作品を完成させる",
      riskTitle: "リスク、限界、倫理",
      riskSub: "RISK MANAGEMENT & CARTOGRAPHIC ETHICS",
      riskHeaders: ["リスク", "なぜ問題か", "対応"],
      risks: [
        ["偽の正確さ", "年次変動する供給比率を固定値に見せない", "範囲・年・出典・注記を表示"],
        ["過度な単純化", "水道網・制度・水利権を一本線に還元しすぎる", "概念図と実データ図を区別"],
        ["地域への影響", "取水地域を単なる資源源として描かない", "歴史・地域影響を短く明示"],
        ["公式性の誤認", "行政機関の公認サイトに見える可能性", "独立制作・非公式を明記"],
        ["範囲膨張", "洪水・全水利権・参加型機能まで拡大", "v1境界を固定しPhase 2へ"]
      ],
      evalTitle: "完成条件と教授へお願いしたいフィードバック",
      evalSub: "SUCCESS CRITERIA & INFORMAL FACULTY REVIEW",
      metrics: [
        ["01", "問いの明瞭さ", "初見の読者が目的を説明できる"],
        ["02", "地理的正確性", "回廊・水源地域を責任を持って表現"],
        ["03", "地図品質", "階層・可読性・倫理的な単純化"],
        ["04", "学術的誠実さ", "出典・不確実性・限界を明記"],
        ["05", "公共的価値", "非専門家が持続する知見を得る"]
      ],
      feedback: "お願いしたい助言",
      feedbackBullets: [
        "独立プロジェクトとして範囲は適切か",
        "どの水源データが最も信頼できるか",
        "単純化が誤解に変わる境界はどこか",
        "Phase 2で何を優先すべきか"
      ],
      feedbackNote: "完成版サイト＋本計画書を持参し、非採点の感想・助言をお願いする。",
      closeTitle: "ロサンゼルスを理解するには、\n水を追え。",
      closeSub: "山と砂漠と、何十年ものインフラを越えて。",
      closeAuthor: "野澤 海（Kai Nozawa）",
      closeUrl: "公開URL：________________________",
      closeFooter: "独立した公開地理プロジェクト · 事業計画書"
    }
  }
};

function buildDeck(locale) {
  const L = COPY[locale];
  const S = L.slides;
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Kai Nozawa";
  pptx.subject = L.subject;
  pptx.title = L.title;
  pptx.company = "Independent Project";
  pptx.lang = L.lang;
  pptx.theme = {
    headFontFace: locale === "ja" ? "Hiragino Sans" : "Avenir Next",
    bodyFontFace: locale === "ja" ? "Hiragino Sans" : "Avenir Next",
    lang: L.lang
  };

  pptx.defineSlideMaster({
    title: "MASTER",
    background: { color: "F5F7F6" },
    objects: [
      { rect: { x: 0, y: 0, w: 0.16, h: 7.5, fill: { color: "0B5663" }, line: { color: "0B5663" } } },
      { line: { x: 0.55, y: 7.05, w: 12.2, h: 0, line: { color: "C8D6D7", width: 0.8 } } },
      { text: { text: L.footerLeft, options: { x: 0.62, y: 7.13, w: 5.5, h: 0.18, fontFace: "Avenir Next", fontSize: 7.5, color: "587276", charSpacing: locale === "en" ? 1.1 : 0, margin: 0 } } },
      { text: { text: L.footerRight, options: { x: 7.2, y: 7.13, w: 5.55, h: 0.18, fontFace: "Avenir Next", fontSize: 7.5, color: "587276", align: "right", margin: 0 } } }
    ],
    slideNumber: { x: 12.74, y: 7.1, color: "587276", fontFace: "Avenir Next", fontSize: 8 }
  });

  const ST = pptx.ShapeType;

  function slide(title, subtitle) {
    const s = pptx.addSlide("MASTER");
    s.addText(title, { x: 0.64, y: 0.4, w: 11.95, h: 0.55, fontSize: locale === "ja" ? 24 : 26, bold: true, color: C.navy, margin: 0, breakLine: false });
    if (subtitle) s.addText(subtitle, { x: 0.66, y: 1.0, w: 11.7, h: 0.27, fontSize: 10.5, color: C.teal, margin: 0, charSpacing: 0.35 });
    return s;
  }

  function addSectionLabel(s, text, x, y, w) {
    s.addText(String(text).toUpperCase(), { x, y, w, h: 0.2, fontFace: "Avenir Next", fontSize: 8, bold: true, color: C.aqua, charSpacing: 1.25, margin: 0 });
  }

  function addBullets(s, items, x, y, w, h, options = {}) {
    const runs = [];
    items.forEach((item, idx) => {
      runs.push({ text: item, options: { bullet: { indent: 14 }, hanging: 3, breakLine: idx < items.length - 1 } });
    });
    s.addText(runs, {
      x, y, w, h, fontSize: options.fontSize || 15, color: options.color || C.ink,
      breakLine: false, paraSpaceAfterPt: options.space || 12, valign: "mid",
      margin: options.margin || 0.05, fit: "shrink"
    });
  }

  function addCard(s, x, y, w, h, title, body, accent = C.aqua) {
    s.addShape(ST.roundRect, { x, y, w, h, rectRadius: 0.06, fill: { color: C.white }, line: { color: C.line, width: 1 } });
    s.addShape(ST.rect, { x, y, w: 0.07, h, fill: { color: accent }, line: { color: accent } });
    s.addText(title, { x: x + 0.23, y: y + 0.18, w: w - 0.4, h: 0.3, fontSize: 13, bold: true, color: C.navy, margin: 0, fit: "shrink" });
    s.addText(body, { x: x + 0.23, y: y + 0.58, w: w - 0.4, h: h - 0.73, fontSize: 10.5, color: C.gray, margin: 0, valign: "top", breakLine: false, fit: "shrink" });
  }

  function addPill(s, text, x, y, w, color = C.teal) {
    s.addShape(ST.roundRect, { x, y, w, h: 0.34, rectRadius: 0.08, fill: { color }, line: { color } });
    s.addText(text, { x: x + 0.08, y: y + 0.075, w: w - 0.16, h: 0.13, fontSize: 8, bold: true, color: C.white, align: "center", margin: 0, fit: "shrink" });
  }

  function addRoute(s, x1, y1, x2, y2, color, label, lx, ly, lw) {
    s.addShape(ST.line, { x: x1, y: y1, w: x2 - x1, h: y2 - y1, line: { color, width: 5, beginArrowType: "none", endArrowType: "triangle", transparency: 5 } });
    s.addText(label, { x: lx, y: ly, w: lw, h: 0.35, fontSize: 9, bold: true, color, margin: 0, fit: "shrink" });
  }

  // Cover
  {
    const s = pptx.addSlide();
    s.background = { color: C.navy };
    s.addShape(ST.rect, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: C.navy }, line: { color: C.navy } });
    [[0.8, 6.7, 5.1, 1.1, C.aqua], [3.2, 7.0, 6.7, 1.3, C.sky], [7.7, 7.4, 4.7, 2.0, C.sand]].forEach(r =>
      s.addShape(ST.arc, { x: r[0], y: r[1] - r[3], w: r[2], h: r[3], adjustPoint: 0.25, rotate: 180, line: { color: r[4], transparency: 12, width: 4 }, fill: { color: C.navy, transparency: 100 } })
    );
    s.addText(L.coverTitle, { x: 0.8, y: 0.95, w: 11.7, h: 2.4, fontFace: "Avenir Next", fontSize: locale === "ja" ? 34 : 36, bold: true, color: C.white, margin: 0, breakLine: false, fit: "shrink" });
    s.addShape(ST.line, { x: 0.84, y: 3.83, w: 11.4, h: 0, line: { color: C.aqua, width: 1.5 } });
    s.addText(L.coverSubtitle, { x: 0.84, y: 4.08, w: 11.4, h: 0.55, fontSize: 16, color: C.pale, margin: 0, breakLine: false });
    s.addText(L.coverDocType, { x: 0.84, y: 5.42, w: 6.2, h: 0.24, fontFace: "Avenir Next", fontSize: 9, bold: true, color: C.aqua, charSpacing: 1.4, margin: 0 });
    s.addText(L.coverAuthor, { x: 0.84, y: 5.79, w: 6.5, h: 0.35, fontSize: 15, bold: true, color: C.white, margin: 0 });
    s.addText(L.coverNote, { x: 0.84, y: 6.2, w: 7.5, h: 0.24, fontSize: 9.5, color: C.sky, margin: 0 });
  }

  // Executive summary
  {
    const s = slide(S.execTitle, S.execSub);
    s.addText(S.execHero, { x: 0.75, y: 1.52, w: 5.35, h: 1.35, fontSize: locale === "ja" ? 23 : 25, bold: true, color: C.navy, margin: 0, breakLine: false, fit: "shrink" });
    s.addText(S.execHeroEn, { x: 0.77, y: 3.02, w: 5.2, h: 0.65, fontFace: "Avenir Next", italic: true, fontSize: 14, color: C.teal, margin: 0 });
    addCard(s, 6.45, 1.43, 2.82, 1.6, S.cards[0][0], S.cards[0][1], C.aqua);
    addCard(s, 9.47, 1.43, 2.82, 1.6, S.cards[1][0], S.cards[1][1], C.green);
    addCard(s, 6.45, 3.27, 2.82, 1.6, S.cards[2][0], S.cards[2][1], C.sand);
    addCard(s, 9.47, 3.27, 2.82, 1.6, S.cards[3][0], S.cards[3][1], C.rust);
    s.addShape(ST.roundRect, { x: 6.45, y: 5.18, w: 5.84, h: 0.9, fill: { color: C.pale }, line: { color: C.pale } });
    s.addText(S.execNote, { x: 6.73, y: 5.45, w: 5.3, h: 0.35, fontSize: 12, bold: true, color: C.teal, align: "center", margin: 0, fit: "shrink" });
  }

  // Problem
  {
    const s = slide(S.problemTitle, S.problemSub);
    addSectionLabel(s, S.visible, 0.78, 1.55, 2.5);
    s.addText(S.visibleWord, { x: 0.78, y: 1.87, w: 3.1, h: 0.65, fontSize: locale === "ja" ? 34 : 36, bold: true, color: C.aqua, margin: 0 });
    addSectionLabel(s, S.invisible, 4.48, 1.55, 2.5);
    s.addText(S.invisibleWord, { x: 4.48, y: 1.87, w: 4.65, h: 0.65, fontSize: locale === "ja" ? 24 : 27, bold: true, color: C.navy, margin: 0, fit: "shrink" });
    s.addShape(ST.line, { x: 3.05, y: 2.18, w: 1.05, h: 0, line: { color: C.sand, width: 4, endArrowType: "triangle" } });
    addBullets(s, S.problemBullets, 0.83, 3.0, 6.0, 2.5, { fontSize: 16 });
    s.addShape(ST.roundRect, { x: 7.35, y: 2.95, w: 4.9, h: 2.55, fill: { color: C.navy }, line: { color: C.navy } });
    s.addText(S.publicValue, { x: 7.75, y: 3.35, w: 4.1, h: 0.25, fontFace: "Avenir Next", fontSize: 9, bold: true, color: C.aqua, charSpacing: 1.2, margin: 0 });
    s.addText(S.publicValueBody, { x: 7.75, y: 3.86, w: 4.05, h: 1.2, fontSize: locale === "ja" ? 18 : 20, bold: true, color: C.white, margin: 0, align: "center", valign: "mid", fit: "shrink" });
  }

  // Research question
  {
    const s = slide(S.rqTitle, S.rqSub);
    s.addShape(ST.roundRect, { x: 0.78, y: 1.43, w: 11.55, h: 1.55, fill: { color: C.navy }, line: { color: C.navy } });
    s.addText(S.rqMain, { x: 1.08, y: 1.7, w: 10.95, h: 1.0, fontSize: locale === "ja" ? 16 : 18, bold: true, color: C.white, align: "center", valign: "mid", margin: 0, fit: "shrink" });
    S.rqItems.forEach((q, i) => {
      const x = 0.78 + i * 3.95;
      s.addText(q[0], { x, y: 3.4, w: 0.65, h: 0.5, fontFace: "Avenir Next", fontSize: 28, bold: true, color: C.aqua, margin: 0 });
      s.addText(q[1], { x: x + 0.82, y: 3.47, w: 2.65, h: 0.35, fontSize: 16, bold: true, color: C.navy, margin: 0 });
      s.addShape(ST.line, { x, y: 4.12, w: 3.25, h: 0, line: { color: C.line, width: 1.2 } });
      s.addText(q[2], { x, y: 4.45, w: 3.35, h: 1.05, fontFace: "Avenir Next", fontSize: 12.5, color: C.gray, margin: 0, valign: "top", fit: "shrink" });
    });
  }

  // Geography
  {
    const s = slide(S.geoTitle, S.geoSub);
    s.addShape(ST.roundRect, { x: 5.1, y: 1.33, w: 2.62, h: 4.95, rectRadius: 0.08, fill: { color: "E8E0D0" }, line: { color: C.sand, width: 1.3 } });
    s.addText(S.california, { x: 5.45, y: 3.42, w: 1.9, h: 0.25, fontFace: "Avenir Next", fontSize: 8, bold: true, color: C.sand, charSpacing: 1.2, align: "center", margin: 0 });
    s.addText(S.pacific, { x: 3.45, y: 4.65, w: 1.35, h: 0.55, fontFace: "Avenir Next", fontSize: 8, color: C.blue, charSpacing: 1.0, margin: 0, align: "center" });
    s.addShape(ST.ellipse, { x: 6.42, y: 5.58, w: 0.23, h: 0.23, fill: { color: C.rust }, line: { color: C.white, width: 1 } });
    s.addText(S.la, { x: 6.69, y: 5.55, w: 1.5, h: 0.25, fontFace: "Avenir Next", fontSize: 8, bold: true, color: C.rust, margin: 0 });
    s.addShape(ST.ellipse, { x: 6.25, y: 2.15, w: 0.2, h: 0.2, fill: { color: C.aqua }, line: { color: C.aqua } });
    addRoute(s, 6.38, 2.27, 6.48, 5.55, C.aqua, S.routes[0][0], 7.8, 2.0, 2.2);
    s.addShape(ST.ellipse, { x: 5.76, y: 1.6, w: 0.2, h: 0.2, fill: { color: C.green }, line: { color: C.green } });
    addRoute(s, 5.88, 1.72, 6.45, 5.52, C.green, S.routes[1][0], 2.0, 1.35, 2.5);
    s.addShape(ST.ellipse, { x: 9.2, y: 4.05, w: 0.2, h: 0.2, fill: { color: C.sand }, line: { color: C.sand } });
    addRoute(s, 9.25, 4.18, 6.62, 5.62, C.sand, S.routes[2][0], 9.35, 3.55, 2.4);
    s.addShape(ST.ellipse, { x: 6.1, y: 5.9, w: 1.25, h: 0.55, fill: { color: C.pale }, line: { color: C.teal, width: 1.5, dash: "dash" } });
    s.addText(S.local, { x: 6.25, y: 6.0, w: 0.95, h: 0.35, fontFace: "Avenir Next", fontSize: 7.5, bold: true, color: C.teal, align: "center", margin: 0 });
    addCard(s, 0.78, 2.6, 3.05, 1.55, S.geoCard1[0], S.geoCard1[1], C.rust);
    addCard(s, 9.55, 5.0, 2.75, 1.45, S.geoCard2[0], S.geoCard2[1], C.teal);
  }

  // Framework
  {
    const s = slide(S.frameTitle, S.frameSub);
    S.frames.forEach((it, i) => {
      const y = 1.42 + i * 1.3;
      s.addText(it[0], { x: 0.82, y, w: 0.72, h: 0.45, fontFace: "Avenir Next", fontSize: 23, bold: true, color: C.aqua, margin: 0 });
      s.addText(it[1], { x: 1.72, y: y + 0.03, w: 2.75, h: 0.35, fontSize: 16.5, bold: true, color: C.navy, margin: 0 });
      addPill(s, it[2], 4.7, y + 0.01, 2.65, [C.teal, C.blue, C.green, C.rust][i]);
      s.addText(it[3], { x: 7.72, y: y + 0.02, w: 4.45, h: 0.43, fontSize: 12.5, color: C.gray, margin: 0, fit: "shrink" });
      if (i < 3) s.addShape(ST.line, { x: 0.82, y: y + 0.83, w: 11.35, h: 0, line: { color: C.line, width: 0.8 } });
    });
    s.addShape(ST.roundRect, { x: 0.82, y: 6.12, w: 11.35, h: 0.5, fill: { color: C.pale }, line: { color: C.pale } });
    s.addText(S.frameNote, { x: 1.1, y: 6.28, w: 10.8, h: 0.18, fontSize: 11.5, bold: true, color: C.teal, align: "center", margin: 0 });
  }

  // Story
  {
    const s = slide(S.storyTitle, S.storySub);
    S.chapters.forEach((c, i) => {
      const x = 0.72 + i * 2.05;
      s.addShape(ST.ellipse, { x: x + 0.57, y: 1.55, w: 0.68, h: 0.68, fill: { color: i < 2 ? C.aqua : i < 5 ? C.teal : C.navy }, line: { color: C.white, width: 2 } });
      s.addText(c[0], { x: x + 0.66, y: 1.76, w: 0.5, h: 0.18, fontFace: "Avenir Next", fontSize: 9, bold: true, color: C.white, align: "center", margin: 0 });
      if (i < 5) s.addShape(ST.line, { x: x + 1.25, y: 1.89, w: 1.37, h: 0, line: { color: C.line, width: 2 } });
      s.addText(c[1], { x, y: 2.52, w: 1.82, h: 0.35, fontSize: 16, bold: true, color: C.navy, align: "center", margin: 0 });
      s.addText(c[2], { x, y: 3.08, w: 1.82, h: 0.8, fontSize: 10.5, color: C.gray, align: "center", margin: 0, fit: "shrink" });
    });
    s.addShape(ST.roundRect, { x: 0.95, y: 4.45, w: 11.05, h: 1.25, fill: { color: C.white }, line: { color: C.line } });
    addSectionLabel(s, S.promise, 1.25, 4.77, 2.5);
    s.addText(S.promiseBody, { x: 2.9, y: 4.73, w: 8.65, h: 0.55, fontSize: locale === "ja" ? 15 : 16, bold: true, color: C.teal, margin: 0, align: "center", fit: "shrink" });
  }

  // Methods
  {
    const s = slide(S.methodsTitle, S.methodsSub);
    addCard(s, 0.78, 1.45, 3.58, 2.05, S.methodCards[0][0], S.methodCards[0][1], C.blue);
    addCard(s, 4.78, 1.45, 3.58, 2.05, S.methodCards[1][0], S.methodCards[1][1], C.aqua);
    addCard(s, 8.78, 1.45, 3.58, 2.05, S.methodCards[2][0], S.methodCards[2][1], C.green);
    s.addShape(ST.roundRect, { x: 0.78, y: 3.92, w: 11.58, h: 1.52, fill: { color: C.navy }, line: { color: C.navy } });
    s.addText(S.uncertainty, { x: 1.12, y: 4.25, w: 2.8, h: 0.2, fontFace: "Avenir Next", fontSize: 9, bold: true, color: C.aqua, charSpacing: 1.0, margin: 0 });
    s.addText(S.uncertaintyBody, { x: 3.55, y: 4.19, w: 8.15, h: 0.55, fontSize: locale === "ja" ? 15 : 16, bold: true, color: C.white, margin: 0, fit: "shrink" });
    s.addText(S.uncertaintyFooter, { x: 1.12, y: 5.78, w: 10.95, h: 0.35, fontSize: 15, italic: true, color: C.teal, align: "center", margin: 0 });
  }

  // Audience
  {
    const s = slide(S.audienceTitle, S.audienceSub);
    S.audiences.forEach((a, i) => {
      const x = 0.8 + i * 4.0;
      const color = C[a[3]];
      s.addShape(ST.roundRect, { x, y: 1.55, w: 3.55, h: 2.55, fill: { color: C.white }, line: { color, width: 1.4 } });
      s.addShape(ST.ellipse, { x: x + 1.42, y: 1.92, w: 0.72, h: 0.72, fill: { color }, line: { color } });
      s.addText(String(i + 1), { x: x + 1.62, y: 2.14, w: 0.3, h: 0.18, fontFace: "Avenir Next", fontSize: 10, bold: true, color: C.white, align: "center", margin: 0 });
      s.addText(a[0], { x: x + 0.25, y: 2.92, w: 3.05, h: 0.32, fontSize: 17, bold: true, color: C.navy, align: "center", margin: 0 });
      s.addText(a[1], { x: x + 0.25, y: 3.35, w: 3.05, h: 0.2, fontFace: "Avenir Next", fontSize: 7.5, bold: true, color, align: "center", charSpacing: 1, margin: 0 });
      s.addText(a[2], { x: x + 0.35, y: 3.73, w: 2.85, h: 0.58, fontSize: 11.5, color: C.gray, align: "center", margin: 0, fit: "shrink" });
    });
    s.addShape(ST.roundRect, { x: 0.8, y: 4.72, w: 11.55, h: 1.15, fill: { color: C.pale }, line: { color: C.pale } });
    s.addText(S.langTitle, { x: 1.1, y: 5.02, w: 2.4, h: 0.25, fontSize: 14, bold: true, color: C.teal, margin: 0 });
    s.addText(S.langBody, { x: 3.45, y: 4.98, w: 8.35, h: 0.45, fontSize: locale === "ja" ? 14 : 15, bold: true, color: C.navy, margin: 0, align: "center", fit: "shrink" });
  }

  // Deliverables
  {
    const s = slide(S.deliverTitle, S.deliverSub);
    addSectionLabel(s, S.deliverLabel, 0.8, 1.52, 2.5);
    addBullets(s, S.deliverBullets, 0.8, 1.95, 5.65, 3.5, { fontSize: 15.5 });
    addSectionLabel(s, S.notLabel, 7.05, 1.52, 2.5);
    addBullets(s, S.notBullets, 7.05, 1.95, 5.0, 2.9, { fontSize: 15.5, color: C.gray });
    s.addShape(ST.roundRect, { x: 7.05, y: 5.06, w: 5.0, h: 0.82, fill: { color: "F0E7DC" }, line: { color: C.sand } });
    s.addText(S.deliverNote, { x: 7.35, y: 5.28, w: 4.4, h: 0.4, fontSize: 12, bold: true, color: C.rust, align: "center", margin: 0, fit: "shrink" });
  }

  // Ops
  {
    const s = slide(S.opsTitle, S.opsSub);
    addCard(s, 0.8, 1.5, 3.55, 2.3, S.opsCards[0][0], S.opsCards[0][1], C.aqua);
    addCard(s, 4.78, 1.5, 3.55, 2.3, S.opsCards[1][0], S.opsCards[1][1], C.green);
    addCard(s, 8.76, 1.5, 3.55, 2.3, S.opsCards[2][0], S.opsCards[2][1], C.sand);
    s.addText(S.opsHero, { x: 0.8, y: 4.45, w: 4.8, h: 0.42, fontSize: locale === "ja" ? 17 : 18, bold: true, color: C.navy, margin: 0 });
    s.addText(S.opsHeroEn, { x: 0.82, y: 5.0, w: 4.5, h: 0.26, fontFace: "Avenir Next", fontSize: 11, italic: true, color: C.teal, margin: 0 });
    addBullets(s, S.opsBullets, 5.35, 4.3, 6.75, 1.65, { fontSize: 13.5, space: 8 });
  }

  // Timeline
  {
    const s = slide(S.timelineTitle, S.timelineSub);
    s.addShape(ST.line, { x: 1.05, y: 3.15, w: 10.9, h: 0, line: { color: C.line, width: 3 } });
    S.phases.forEach((p, i) => {
      const x = 0.7 + i * 2.05;
      const color = [C.aqua, C.blue, C.green, C.teal, C.sand, C.rust][i];
      s.addShape(ST.ellipse, { x: x + 0.63, y: 2.77, w: 0.75, h: 0.75, fill: { color }, line: { color: C.white, width: 2 } });
      s.addText(p[0], { x: x + 0.77, y: 3.0, w: 0.47, h: 0.18, fontFace: "Avenir Next", fontSize: 8.5, bold: true, color: C.white, align: "center", margin: 0 });
      s.addText(p[1], { x, y: 1.55, w: 2.0, h: 0.35, fontSize: 16, bold: true, color: C.navy, align: "center", margin: 0 });
      s.addText(p[2], { x, y: 1.98, w: 2.0, h: 0.58, fontSize: 10.5, color: C.gray, align: "center", margin: 0, fit: "shrink" });
      s.addText(locale === "ja" ? `${p[0]}週` : `WEEK ${p[0]}`, { x, y: 3.85, w: 2.0, h: 0.2, fontFace: "Avenir Next", fontSize: 8, bold: true, color, align: "center", charSpacing: 0.8, margin: 0 });
    });
    s.addShape(ST.roundRect, { x: 1.05, y: 4.75, w: 10.9, h: 1.02, fill: { color: C.pale }, line: { color: C.pale } });
    s.addText(S.timelineNote, { x: 1.45, y: 5.05, w: 10.1, h: 0.4, fontSize: 14, bold: true, color: C.teal, align: "center", margin: 0, fit: "shrink" });
  }

  // Risks
  {
    const s = slide(S.riskTitle, S.riskSub);
    const x = [0.78, 3.15, 8.05], widths = [2.25, 4.75, 4.25];
    S.riskHeaders.forEach((h, i) => {
      s.addShape(ST.rect, { x: x[i], y: 1.45, w: widths[i], h: 0.45, fill: { color: C.navy }, line: { color: C.white, width: 1 } });
      s.addText(h, { x: x[i] + 0.12, y: 1.58, w: widths[i] - 0.24, h: 0.18, fontSize: 10.5, bold: true, color: C.white, margin: 0, align: i === 0 ? "left" : "center" });
    });
    S.risks.forEach((r, ri) => {
      const y = 1.9 + ri * 0.89;
      [0, 1, 2].forEach(i => s.addShape(ST.rect, { x: x[i], y, w: widths[i], h: 0.89, fill: { color: ri % 2 ? "EEF3F2" : C.white }, line: { color: C.line, width: 0.6 } }));
      s.addText(r[0], { x: x[0] + 0.15, y: y + 0.23, w: widths[0] - 0.3, h: 0.32, fontSize: 12, bold: true, color: C.navy, margin: 0, fit: "shrink" });
      s.addText(r[1], { x: x[1] + 0.15, y: y + 0.17, w: widths[1] - 0.3, h: 0.5, fontSize: 10.5, color: C.gray, margin: 0, valign: "mid", fit: "shrink" });
      s.addText(r[2], { x: x[2] + 0.15, y: y + 0.17, w: widths[2] - 0.3, h: 0.5, fontSize: 10.5, bold: true, color: C.teal, margin: 0, valign: "mid", fit: "shrink" });
    });
  }

  // Evaluation
  {
    const s = slide(S.evalTitle, S.evalSub);
    S.metrics.forEach((m, i) => {
      const y = 1.42 + i * 0.92;
      s.addText(m[0], { x: 0.82, y, w: 0.55, h: 0.35, fontFace: "Avenir Next", fontSize: 16, bold: true, color: C.aqua, margin: 0 });
      s.addText(m[1], { x: 1.55, y: y + 0.02, w: 2.2, h: 0.3, fontSize: 13, bold: true, color: C.navy, margin: 0 });
      s.addText(m[2], { x: 3.85, y: y + 0.02, w: 3.0, h: 0.35, fontSize: 10.8, color: C.gray, margin: 0, fit: "shrink" });
    });
    s.addShape(ST.roundRect, { x: 7.25, y: 1.45, w: 5.05, h: 4.8, fill: { color: C.navy }, line: { color: C.navy } });
    s.addText(S.feedback, { x: 7.68, y: 1.85, w: 4.2, h: 0.22, fontFace: "Avenir Next", fontSize: 9, bold: true, color: C.aqua, charSpacing: 1.0, margin: 0 });
    addBullets(s, S.feedbackBullets, 7.68, 2.3, 4.15, 2.75, { fontSize: 14, color: C.white, space: 12 });
    s.addText(S.feedbackNote, { x: 7.68, y: 5.25, w: 4.15, h: 0.55, fontSize: 11.5, bold: true, color: C.sky, align: "center", margin: 0, fit: "shrink" });
  }

  // Closing
  {
    const s = pptx.addSlide();
    s.background = { color: C.teal };
    s.addText(S.closeTitle, { x: 0.85, y: 1.15, w: 11.6, h: 1.7, fontFace: "Avenir Next", fontSize: locale === "ja" ? 30 : 34, bold: true, color: C.white, align: "center", margin: 0, fit: "shrink" });
    s.addShape(ST.line, { x: 2.5, y: 3.35, w: 8.3, h: 0, line: { color: C.aqua, width: 1.5 } });
    s.addText(S.closeSub, { x: 2.0, y: 3.7, w: 9.3, h: 0.7, fontSize: 16, color: C.pale, align: "center", margin: 0 });
    s.addText(S.closeAuthor, { x: 0.9, y: 5.72, w: 4.5, h: 0.32, fontSize: 14, bold: true, color: C.white, margin: 0 });
    s.addText(S.closeUrl, { x: 5.45, y: 5.77, w: 6.9, h: 0.26, fontFace: "Avenir Next", fontSize: 10, color: C.sky, align: "right", margin: 0 });
    s.addText(S.closeFooter, { x: 0.9, y: 6.25, w: 7.5, h: 0.22, fontFace: "Avenir Next", fontSize: 9, color: C.sky, margin: 0 });
  }

  const out = locale === "ja"
    ? "geography-la-water/LA-Water-Project-Prospectus-JA.pptx"
    : "geography-la-water/LA-Water-Project-Prospectus-EN.pptx";
  return pptx.writeFile({ fileName: out }).then(() => out);
}

Promise.all([buildDeck("en"), buildDeck("ja")])
  .then((files) => {
    console.log(files.join("\n"));
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
