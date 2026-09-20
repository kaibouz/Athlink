import {
  Button,
  Callout,
  Card,
  CardBody,
  CardHeader,
  Divider,
  H1,
  H2,
  H3,
  Pill,
  Row,
  Spacer,
  Stack,
  Stat,
  Table,
  Text,
  useCanvasState,
  useHostTheme,
} from "cursor/canvas";

type Tab = "sheet" | "review" | "quiz" | "answers";

const TABS: { id: Tab; label: string }[] = [
  { id: "sheet", label: "学習シート" },
  { id: "review", label: "Review解答" },
  { id: "quiz", label: "確認テスト" },
  { id: "answers", label: "テスト解答" },
];

type ClassAnswer = {
  variable: string;
  kind: string;
  subtype: string;
  level: string;
};

type StudyQ =
  | {
      id: string;
      kind: "classify";
      prompt: string;
      answer: ClassAnswer;
      tip: string;
    }
  | {
      id: string;
      kind: "short";
      prompt: string;
      answer: string;
      tip: string;
    };

const QUIZ: StudyQ[] = [
  {
    id: "q1",
    kind: "classify",
    prompt: "Number of siblings you have",
    answer: {
      variable: "number of siblings",
      kind: "Quantitative",
      subtype: "Discrete",
      level: "Ratio",
    },
    tip: "数えられる整数 → discrete。0人は本当のゼロ → ratio。",
  },
  {
    id: "q2",
    kind: "classify",
    prompt: "Blood type (A, B, AB, O)",
    answer: {
      variable: "blood type",
      kind: "Qualitative",
      subtype: "Nominal",
      level: "Nominal",
    },
    tip: "カテゴリに順序なし → nominal。",
  },
  {
    id: "q3",
    kind: "classify",
    prompt: "Temperature of coffee in °C",
    answer: {
      variable: "coffee temperature (°C)",
      kind: "Quantitative",
      subtype: "Continuous",
      level: "Interval",
    },
    tip: "差は意味あり。0°Cは「熱がない」ではない → interval（ratioではない）。",
  },
  {
    id: "q4",
    kind: "classify",
    prompt: "Letter grade in a class (A, B, C, D, F)",
    answer: {
      variable: "letter grade",
      kind: "Qualitative",
      subtype: "Ordinal",
      level: "Ordinal",
    },
    tip: "順序はあるが間隔は等しくない → ordinal。",
  },
  {
    id: "q5",
    kind: "classify",
    prompt: "Distance from home to SMC in miles",
    answer: {
      variable: "distance to SMC (miles)",
      kind: "Quantitative",
      subtype: "Continuous",
      level: "Ratio",
    },
    tip: "測れる量で真のゼロあり → continuous + ratio。",
  },
  {
    id: "q6",
    kind: "classify",
    prompt: "Year of birth (e.g., 2005)",
    answer: {
      variable: "year of birth",
      kind: "Quantitative",
      subtype: "Discrete (or continuous in some texts)",
      level: "Interval",
    },
    tip: "年の差は意味あり。年0は「生まれていない」ではない → interval。多くの採点は Discrete + Interval。",
  },
  {
    id: "q7",
    kind: "short",
    prompt:
      "SMC surveys students by major, then randomly picks 20 from each major (total 200) to estimate mean weekly study hours. Sampling method?",
    answer: "Stratified random sampling (strata = major)",
    tip: "先にグループ分け → 各層から無作為 = stratified。",
  },
  {
    id: "q8",
    kind: "short",
    prompt:
      "In that SMC study, what is the population parameter (symbol + words)?",
    answer:
      "μ = true mean weekly study hours for all SMC students",
    tip: "母集団の平均は μ。標本平均は x̄。",
  },
  {
    id: "q9",
    kind: "short",
    prompt:
      "Same study: what is the statistic (symbol) and how do you calculate it?",
    answer:
      "x̄ = sample mean = (sum of 200 students’ weekly study hours) / 200",
    tip: "統計量は標本から計算。平均なら合計÷n。",
  },
  {
    id: "q10",
    kind: "short",
    prompt:
      "Parameter vs statistic: which one is usually unknown and which one is computed from data?",
    answer:
      "Parameter (μ, p, σ…) is usually unknown (population). Statistic (x̄, p̂, s…) is computed from the sample.",
    tip: "Greek letters ≈ parameter。ラテン/帽子付き ≈ statistic。",
  },
  {
    id: "q11",
    kind: "classify",
    prompt: "Zip code of your residence",
    answer: {
      variable: "zip code",
      kind: "Qualitative",
      subtype: "Nominal",
      level: "Nominal",
    },
    tip: "数字に見えるが計算に使わないラベル → qualitative nominal。",
  },
  {
    id: "q12",
    kind: "short",
    prompt:
      "Every 10th student entering the library is surveyed. Sampling method?",
    answer: "Systematic sampling",
    tip: "一定間隔で選ぶ = systematic。クラスターはグループごと全部。",
  },
];

/** PDF Exam 1 Q1 — 各小問 7 pts: Variable(1) + Qual/Quant(2) + subtype(2) + level(2) */
const REVIEW_CLASS: {
  letter: string;
  prompt: string;
  answer: ClassAnswer;
  writeUp: string;
  why: string;
  trap: string;
}[] = [
  {
    letter: "A",
    prompt: "The number of pairs of shoes you own",
    answer: {
      variable: "number of pairs of shoes owned",
      kind: "Quantitative",
      subtype: "Discrete",
      level: "Ratio",
    },
    writeUp:
      "Variable: number of pairs of shoes owned. Quantitative (numerical). Discrete. Ratio level.",
    why: "整数で数えられる（1足、2足…）→ Discrete。0足は「本当にゼロ」で、2足は1足の2倍と言える → Ratio。",
    trap: "「靴の種類」なら Qualitative。ここでは個数なので Quantitative。",
  },
  {
    letter: "B",
    prompt: "The time of day measured in military time",
    answer: {
      variable: "time of day (military time)",
      kind: "Quantitative",
      subtype: "Continuous",
      level: "Interval",
    },
    writeUp:
      "Variable: time of day in military time. Quantitative. Continuous. Interval level.",
    why: "時刻は数値。差（1400−1300=1時間）は意味あり。だが 0000 は「時間がない」ではなく任意の基準 → 真のゼロなし → Interval（Ratio ではない）。",
    trap: "所要時間（duration）と混同しない。duration は Ratio、clock time は Interval。",
  },
  {
    letter: "C",
    prompt: "How much your car weighs?",
    answer: {
      variable: "car weight",
      kind: "Quantitative",
      subtype: "Continuous",
      level: "Ratio",
    },
    writeUp:
      "Variable: weight of the car. Quantitative. Continuous. Ratio level.",
    why: "測れる量で小数もあり得る → Continuous。0重量は真のゼロ、2倍の重さも意味あり → Ratio。",
    trap: "特になし。金額・体重・距離と同パターン。",
  },
  {
    letter: "D",
    prompt: "Restaurant ratings from one star to five stars",
    answer: {
      variable: "restaurant star rating",
      kind: "Qualitative",
      subtype: "Ordinal",
      level: "Ordinal",
    },
    writeUp:
      "Variable: restaurant rating (1–5 stars). Qualitative (categorical). Ordinal. Ordinal level.",
    why: "カテゴリに順序あり（5★＞4★）だが、星の差が等間隔とは限らない。Quantitative の discrete/continuous にはしない。",
    trap: "数字に見えても平均を安易に取る前提でない限り Qualitative + Ordinal。",
  },
  {
    letter: "E",
    prompt: "The time it takes you to get from your house to the nearest beach",
    answer: {
      variable: "travel time to nearest beach",
      kind: "Quantitative",
      subtype: "Continuous",
      level: "Ratio",
    },
    writeUp:
      "Variable: travel time from home to nearest beach. Quantitative. Continuous. Ratio level.",
    why: "所要時間（duration）は測れる連続量。0分は真のゼロ → Ratio。B の「時刻」と違う。",
    trap: "military time（Interval）と travel time（Ratio）を取り違えない。",
  },
];

/** PDF Exam 1 Q2 — UCSD stratified textbook study */
const REVIEW_Q2: {
  id: string;
  title: string;
  points: string;
  writeUp: string;
  why: string;
}[] = [
  {
    id: "r2a",
    title: "A) Population parameter",
    points: "4 pts (symbol 2 + description 2)",
    writeUp:
      "μ = the true mean amount of money UC San Diego students spend on textbooks per semester (by race / overall mean of interest).",
    why: "「true average」＝母平均 → 記号は μ（x̄ ではない）。by race とあれば各 race の μ でも可。必ず symbol + 英語の説明。",
  },
  {
    id: "r2b",
    title: "B) Targeted population",
    points: "2 pts",
    writeUp: "All UC San Diego students (the current student body).",
    why: "標本の400人ではなく、知りたい全体。具体的に大学名まで書く。",
  },
  {
    id: "r2c",
    title: "C) Variable of interest + type + level",
    points: "8 pts (describe 4 + type/level 4)",
    writeUp:
      "Variable: amount of money spent on textbooks per semester. Quantitative, continuous, ratio level of measurement.",
    why: "測っているのは金額。連続量で真のゼロあり → Ratio。race は層分けの軸であり、ここでの variable of interest ではない。",
  },
  {
    id: "r2d",
    title: "D) Sample + sampling method",
    points: "3 pts",
    writeUp:
      "Sample: 400 UCSD students. Method: stratified random sampling (strata = race/ethnicity); a random sample is taken from each racial group.",
    why: "「break into ethnic groups … random sample from each race」＝ Stratified。Cluster（グループを選んで中を全部）と混同しない。",
  },
  {
    id: "r2e",
    title: "E) Statistic + how to calculate",
    points: "7 pts (symbol/desc 4 + calculation 3)",
    writeUp:
      "x̄ = sample mean textbook spending for the 400 students. Calculate: sum the 400 spending amounts and divide by 400. (If by race: compute x̄ within each stratum.)",
    why: "標本から計算する値＝統計量 x̄。計算手順（合計÷n）まで書くと配点を取りやすい。",
  },
];

function formatClass(a: ClassAnswer): string {
  return `${a.variable} | ${a.kind} | ${a.subtype} | ${a.level}`;
}

function classifyScore(user: string, answer: ClassAnswer): boolean {
  const u = user.toLowerCase();
  const need = [
    answer.kind.toLowerCase().split("/")[0].trim(),
    answer.subtype.toLowerCase().split("(")[0].trim().split("/")[0].trim(),
    answer.level.toLowerCase(),
  ];
  // accept common synonyms
  const aliases: Record<string, string[]> = {
    qualitative: ["qualitative", "categorical", "attribute", "カテゴリ"],
    quantitative: ["quantitative", "numerical", "数値"],
    discrete: ["discrete"],
    continuous: ["continuous"],
    nominal: ["nominal"],
    ordinal: ["ordinal"],
    interval: ["interval"],
    ratio: ["ratio"],
  };
  return need.every((key) => {
    const base = key.replace(/\s+/g, " ").trim();
    const opts = aliases[base] || [base];
    return opts.some((o) => u.includes(o));
  });
}

function shortScore(user: string, answer: string): boolean {
  const u = user.toLowerCase();
  const keys = answer
    .toLowerCase()
    .split(/[=,;()/]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3)
    .slice(0, 4);
  const hits = keys.filter((k) => u.includes(k.slice(0, Math.min(12, k.length))));
  return hits.length >= Math.min(2, keys.length);
}

export default function StatC1000Exam1Study() {
  const theme = useHostTheme();
  const [tab, setTab] = useCanvasState<Tab>("tab", "sheet");
  const [revealed, setRevealed] = useCanvasState<Record<string, boolean>>(
    "revealed",
    {},
  );
  const [answers, setAnswers] = useCanvasState<Record<string, string>>(
    "quizAnswers",
    {},
  );
  const [checked, setChecked] = useCanvasState<boolean>("checked", false);
  const [showTips, setShowTips] = useCanvasState<boolean>("showTips", false);

  const results = QUIZ.map((q) => {
    const user = (answers[q.id] || "").trim();
    if (!user) return { id: q.id, ok: false as boolean, blank: true };
    if (q.kind === "classify") {
      return { id: q.id, ok: classifyScore(user, q.answer), blank: false };
    }
    return { id: q.id, ok: shortScore(user, q.answer), blank: false };
  });
  const answered = results.filter((r) => !r.blank).length;
  const correct = results.filter((r) => r.ok).length;

  return (
    <Stack gap={20} style={{ maxWidth: 920, margin: "0 auto", padding: 20 }}>
      <Stack gap={6}>
        <H1>STAT C1000 · Exam 1 学習シート</H1>
        <Text tone="secondary">
          範囲: 変数の分類（質的/量的・名義/順序/離散/連続・測定尺度）＋母集団パラメータ / 標本 / 標本抽出 / 統計量。出典 PDF は Math 54 Exam 1 Review 形式。
        </Text>
        <Row gap={8} style={{ flexWrap: "wrap" }}>
          <Pill tone="info">明日の小テスト対策</Pill>
          <Pill>閉書想定</Pill>
          <Pill>記号 μ / x̄ 必須</Pill>
        </Row>
      </Stack>

      <Row gap={8} style={{ flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <span key={t.id}>
            <Button
              variant={tab === t.id ? "primary" : "secondary"}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </Button>
          </span>
        ))}
      </Row>

      {tab === "sheet" && <StudySheet />}
      {tab === "review" && (
        <ReviewKey
          revealed={revealed}
          setRevealed={setRevealed}
          theme={theme}
        />
      )}
      {tab === "quiz" && (
        <Stack gap={16}>
          <Callout tone="info">
            各問に答案を書いてから「採点する」。分類問題は Variable / Qualitative or Quantitative / subtype / Level の順で書くと満点形式に近いです。
          </Callout>
          <Row gap={16} style={{ flexWrap: "wrap" }}>
            <Stat value={`${answered}/${QUIZ.length}`} label="回答済み" />
            {checked && (
              <Stat
                value={`${correct}/${QUIZ.length}`}
                label="正解（自動採点）"
                tone={correct === QUIZ.length ? "success" : "warning"}
              />
            )}
          </Row>
          {QUIZ.map((q, i) => {
            const r = results[i];
            const pillTone = r.ok ? "success" : r.blank ? "neutral" : "warning";
            return (
              <div key={q.id}>
                <Card>
                  <CardHeader
                    trailing={
                      checked ? (
                        <Pill tone={pillTone}>
                          {r.ok ? "OK" : r.blank ? "未記入" : "要確認"}
                        </Pill>
                      ) : undefined
                    }
                  >
                    Q{i + 1}
                  </CardHeader>
                  <CardBody>
                    <Stack gap={10}>
                      <Text weight="semibold">{q.prompt}</Text>
                      {q.kind === "classify" && (
                        <Text tone="secondary" size="small">
                          書く順: (1) variable (2) Qual/Quant (3) nominal/ordinal/discrete/continuous (4) level
                        </Text>
                      )}
                      <textarea
                        value={answers[q.id] || ""}
                        onChange={(e: { target: { value: string } }) => {
                          setChecked(false);
                          setAnswers({ ...answers, [q.id]: e.target.value });
                        }}
                        rows={q.kind === "classify" ? 3 : 2}
                        placeholder="答案を入力…"
                        style={{
                          width: "100%",
                          resize: "vertical",
                          padding: 10,
                          borderRadius: 6,
                          border: `1px solid ${theme.stroke.secondary}`,
                          background: theme.bg.editor,
                          color: theme.text.primary,
                          fontFamily: "inherit",
                          fontSize: 13,
                        }}
                      />
                      {checked && (
                        <Stack gap={4}>
                          <Text size="small" weight="semibold">
                            模範解答
                          </Text>
                          <Text size="small">
                            {q.kind === "classify"
                              ? formatClass(q.answer)
                              : q.answer}
                          </Text>
                          {showTips && (
                            <Text size="small" tone="secondary">
                              {q.tip}
                            </Text>
                          )}
                        </Stack>
                      )}
                    </Stack>
                  </CardBody>
                </Card>
              </div>
            );
          })}
          <Row gap={8} style={{ flexWrap: "wrap" }}>
            <Button
              variant="primary"
              onClick={() => {
                setChecked(true);
                setShowTips(true);
              }}
            >
              採点する
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setAnswers({});
                setChecked(false);
                setShowTips(false);
              }}
            >
              リセット
            </Button>
          </Row>
          {checked && (
            <Callout tone={correct === QUIZ.length ? "success" : "warning"}>
              {correct === QUIZ.length
                ? "自動採点は全問OK。Review解答タブの記述パターンも暗記してください。"
                : `自動採点 ${correct}/${QUIZ.length}。用語のスペルが違うと不正解扱いになることがあります。模範解答と突き合わせてください。`}
            </Callout>
          )}
        </Stack>
      )}
      {tab === "answers" && <AnswerKey />}
    </Stack>
  );
}

function StudySheet() {
  return (
    <Stack gap={20}>
      <Callout tone="info">
        満点のコツ: 毎回同じ4ステップで書く。(1) Variable名 (2) Qualitative / Quantitative (3) nominal・ordinal・discrete・continuous のどれか (4) Level of measurement。記号は μ（母平均）と x̄（標本平均）を間違えない。
      </Callout>

      <Stack gap={8}>
        <H2>1. 変数分類の決定木</H2>
        <Text>
          数字でもラベルなら Qualitative（zip code, jersey number, ID）。本当に量なら Quantitative。
        </Text>
        <Table
          headers={["質問", "Yes", "No / 次へ"]}
          rows={[
            [
              "カテゴリ名・ラベル？",
              "Qualitative → 順序ある？ Ordinal : Nominal",
              "Quantitative へ",
            ],
            [
              "数えられる整数？",
              "Discrete（人数、台数）",
              "Continuous（時間・重さ・距離）",
            ],
            [
              "真のゼロがあり比が意味ある？",
              "Ratio（体重、時間、金額、人数）",
              "Interval（°C、時計時刻、西暦年）",
            ],
          ]}
        />
      </Stack>

      <Divider />

      <Stack gap={8}>
        <H2>2. Level of measurement（4つ）</H2>
        <GridLevels />
      </Stack>

      <Divider />

      <Stack gap={8}>
        <H2>3. Parameter vs Statistic</H2>
        <Table
          headers={["対象", "平均", "割合", "標準偏差", "どこから"]}
          rows={[
            ["Population（母集団）", "μ", "p", "σ", "通常は未知"],
            ["Sample（標本）", "x̄", "p̂", "s", "データから計算"],
          ]}
        />
        <Text tone="secondary">
          「true average / true mean」と書かれたらパラメータ μ。「from the 400 students」なら統計量 x̄。
        </Text>
      </Stack>

      <Divider />

      <Stack gap={8}>
        <H2>4. Sampling methods（明日出やすい）</H2>
        <Table
          headers={["方法", "やり方", "キーワード"]}
          rows={[
            [
              "Simple random",
              "全員に同じ確率で選ぶ",
              "random number / lottery",
            ],
            [
              "Stratified",
              "層に分け、各層から無作為",
              "by race / by major / from each group",
            ],
            [
              "Cluster",
              "クラスターを選び、その中を全部（または多く）調査",
              "random classrooms / cities then all",
            ],
            [
              "Systematic",
              "リストから k 番ごと",
              "every 10th",
            ],
            [
              "Convenience",
              "取りやすい人だけ",
              "volunteer / hallway — バイアス大",
            ],
          ]}
        />
        <Callout tone="warning">
          Review問題の UCSD は「ethnic groups に分けて各 race から random sample」→ Stratified random sampling。Cluster と混同しない。
        </Callout>
      </Stack>

      <Divider />

      <Stack gap={8}>
        <H2>5. 実験文の答え方テンプレ（Q2形式）</H2>
        <Text weight="semibold">A) Parameter</Text>
        <Text>
          μ = true mean [変数] for [母集団]. （「by race」なら各 race の μ、または全体の μ — 問題の「true average」に合わせて1つ明確に）
        </Text>
        <Text weight="semibold">B) Population</Text>
        <Text>All [具体的な集団]. （例: all UC San Diego students）</Text>
        <Text weight="semibold">C) Variable</Text>
        <Text>
          [何を測るか]. Quantitative / Continuous / Ratio （金額・時間はだいたいこれ）
        </Text>
        <Text weight="semibold">D) Sample + method</Text>
        <Text>
          n = ___ [誰]. Sampling method: Stratified / SRS / …
        </Text>
        <Text weight="semibold">E) Statistic</Text>
        <Text>
          x̄ = sample mean = (Σxi) / n
        </Text>
      </Stack>

      <Divider />

      <Stack gap={8}>
        <H2>6. PDF Review 解答例（短縮）</H2>
        <Text tone="secondary">
          詳細な英語答案・解説・配点は「Review解答」タブ。ここでは暗記用の一行まとめ。
        </Text>
        <Table
          headers={["Q", "模範解答（短縮）"]}
          rows={[
            ...REVIEW_CLASS.map((item) => [
              `1${item.letter}`,
              formatClass(item.answer),
            ]),
            ["2A", "μ = true mean textbook $ / semester (UCSD)"],
            ["2B", "All UC San Diego students"],
            ["2C", "textbook $ spent / semester · Quant · Cont · Ratio"],
            ["2D", "n=400 · stratified random (by race)"],
            ["2E", "x̄ = Σxi / 400"],
          ]}
        />
      </Stack>

      <Text tone="secondary" size="small">
        次は「Review解答」でPDF本番形式の模範解答を暗記 → 「確認テスト」で手を動かしてください。
      </Text>
    </Stack>
  );
}

function GridLevels() {
  const theme = useHostTheme();
  const items = [
    {
      name: "Nominal",
      def: "名前・ラベルのみ。順序なし。",
      ex: "blood type, zip code, race",
    },
    {
      name: "Ordinal",
      def: "順序あり。間隔は等しくない。",
      ex: "1–5 stars, letter grade, Likert",
    },
    {
      name: "Interval",
      def: "差は意味あり。真のゼロなし。",
      ex: "°C, military time, calendar year",
    },
    {
      name: "Ratio",
      def: "差も比も意味あり。真のゼロあり。",
      ex: "weight, money, time duration, count",
    },
  ];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 10,
      }}
    >
      {items.map((it) => (
        <div
          key={it.name}
          style={{
            padding: 12,
            borderRadius: 8,
            background: theme.fill.tertiary,
            border: `1px solid ${theme.stroke.tertiary}`,
          }}
        >
          <Text weight="semibold">{it.name}</Text>
          <Spacer />
          <Text size="small">{it.def}</Text>
          <Spacer />
          <Text size="small" tone="secondary">
            {it.ex}
          </Text>
        </div>
      ))}
    </div>
  );
}

function ReviewKey({
  revealed,
  setRevealed,
}: {
  revealed: Record<string, boolean>;
  setRevealed: (v: Record<string, boolean>) => void;
  theme: ReturnType<typeof useHostTheme>;
}) {
  return (
    <Stack gap={16}>
      <H2>PDF Review — 模範解答＋解説</H2>
      <Callout tone="info">
        出典: Math 54 / STAT C1000 Exam 1 Review 形式。答案は英語で書く想定。配点は PDF の点数割り（Q1 各7点、Q2 合計約24点）。
      </Callout>
      <Text tone="secondary">
        最初は隠して自分で書いてから開く。答案欄は「英語でそのまま書ける形」＋日本語解説。
      </Text>

      <H3>Question 1 — Variable classification（各 7 pts）</H3>
      <Text size="small" tone="secondary">
        配点: Variable name (1) + Qualitative/Quantitative (2) + nominal/ordinal/discrete/continuous (2) + level of measurement (2)
      </Text>
      {REVIEW_CLASS.map((item) => {
        const key = `r1${item.letter}`;
        const open = !!revealed[key];
        return (
          <div key={item.letter}>
            <Card>
              <CardHeader
                trailing={
                  <Button
                    variant="secondary"
                    onClick={() => setRevealed({ ...revealed, [key]: !open })}
                  >
                    {open ? "隠す" : "解答・解説"}
                  </Button>
                }
              >
                {item.letter}) {item.prompt}
              </CardHeader>
              {open && (
                <CardBody>
                  <Stack gap={8}>
                    <Text weight="semibold">答案例（英語・そのまま書ける）</Text>
                    <Text>{item.writeUp}</Text>
                    <Text weight="semibold">チェックリスト</Text>
                    <Text size="small">
                      (1) {item.answer.variable} · (2) {item.answer.kind} · (3){" "}
                      {item.answer.subtype} · (4) {item.answer.level}
                    </Text>
                    <Text weight="semibold">解説</Text>
                    <Text size="small">{item.why}</Text>
                    <Text size="small" tone="secondary">
                      ひっかけ: {item.trap}
                    </Text>
                  </Stack>
                </CardBody>
              )}
            </Card>
          </div>
        );
      })}

      <Divider />

      <H3>Question 2 — UCSD textbook spending</H3>
      <ScenarioAnswer
        id="r2"
        revealed={revealed}
        setRevealed={setRevealed}
        title="シナリオ全文（PDF原文に近い）"
        body={`UC San Diego wants the true average amount of money students spend on textbooks per semester by race. They break the student body into ethnic groups using student IDs and take a random sample from each race for a total of 400 students.`}
      />

      {REVIEW_Q2.map((item) => {
        const open = !!revealed[item.id];
        return (
          <div key={item.id}>
            <Card>
              <CardHeader
                trailing={
                  <Button
                    variant="secondary"
                    onClick={() =>
                      setRevealed({ ...revealed, [item.id]: !open })
                    }
                  >
                    {open ? "隠す" : "解答・解説"}
                  </Button>
                }
              >
                {item.title}
              </CardHeader>
              {open && (
                <CardBody>
                  <Stack gap={8}>
                    <Pill tone="info">{item.points}</Pill>
                    <Text weight="semibold">答案例（英語）</Text>
                    <Text>{item.writeUp}</Text>
                    <Text weight="semibold">解説</Text>
                    <Text size="small">{item.why}</Text>
                  </Stack>
                </CardBody>
              )}
            </Card>
          </div>
        );
      })}

      <Callout tone="success">
        直前暗記: military time → Interval / travel time・weight・$ → Ratio / stars → Ordinal / by race then random from each → Stratified / μ vs x̄。
      </Callout>
    </Stack>
  );
}

function ScenarioAnswer({
  id,
  title,
  body,
  revealed,
  setRevealed,
}: {
  id: string;
  title: string;
  body: string;
  revealed: Record<string, boolean>;
  setRevealed: (v: Record<string, boolean>) => void;
}) {
  const open = !!revealed[id];
  return (
    <Card>
      <CardHeader
        trailing={
          <Button
            variant="secondary"
            onClick={() => setRevealed({ ...revealed, [id]: !open })}
          >
            {open ? "隠す" : "表示"}
          </Button>
        }
      >
        {title}
      </CardHeader>
      {open && (
        <CardBody>
          <Text>{body}</Text>
        </CardBody>
      )}
    </Card>
  );
}

function AnswerKey() {
  return (
    <Stack gap={12}>
      <H2>確認テスト — 全解答</H2>
      <Text tone="secondary">
        確認テストタブで先に自分で解いてから見てください。
      </Text>
      <Table
        headers={["#", "模範解答", "ポイント"]}
        rows={QUIZ.map((q, i) => [
          `Q${i + 1}`,
          q.kind === "classify" ? formatClass(q.answer) : q.answer,
          q.tip,
        ])}
      />
      <Callout tone="success">
        明日の直前チェック: (1) zip code は Qualitative (2) °C / military time は Interval (3) money / weight / duration は Ratio (4) by race then random from each = Stratified (5) μ vs x̄。
      </Callout>
    </Stack>
  );
}
