import {
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
  Stack,
  Table,
  Text,
  useHostTheme,
} from "cursor/canvas";

type Gloss = { en: string; ja: string; note: string };

type Line = { en: string; ja: string };

type SubQ = {
  letter: string;
  pts: string;
  prompt: Line;
};

/** STAT C1000 Exam 1 Review PDF — Japanese gloss only. No model answers. */
const HEADER: Line[] = [
  {
    en: "This is a closed book with no notes allowed exam. PLEASE PRINT ALL ANSWERS. Any answer that cannot be read will receive 0 points. Good Luck.",
    ja: "これは閉書試験で、ノート持ち込み不可です。答えはすべてはっきり書いてください。読めない答えは0点です。がんばって。",
  },
];

const Q1_INTRO: Line = {
  en: "Answer each of the following (below) clearly and concisely: first identify the variable of interest (1 point), next state whether it is a Qualitative (categorical/attribute) variable or a Quantitative (numerical) variable (2 points), state whether it is nominal, ordinal, discrete, or continuous (2 points), lastly the level of measurement (2 points). (7 points total)",
  ja: "以下の各問に、はっきり短く答えてください。まず variable of interest（関心の対象）を特定（1点）。次に Qualitative（categorical/attribute＝質的・カテゴリ）か Quantitative（numerical＝量的・数値）かを述べ（2点）。さらに nominal / ordinal / discrete / continuous のどれか（2点）。最後に level of measurement（測定尺度）（2点）。（各問合計7点）",
};

const Q1_ITEMS: SubQ[] = [
  {
    letter: "A",
    pts: "7",
    prompt: {
      en: "The number of pairs of shoes you own.",
      ja: "あなたが持っている靴の足数（ペア数）。",
    },
  },
  {
    letter: "B",
    pts: "7",
    prompt: {
      en: "The time of day measured in military time.",
      ja: "軍用時（24時間表示）で測った時刻。",
    },
  },
  {
    letter: "C",
    pts: "7",
    prompt: {
      en: "How much your car weighs?",
      ja: "あなたの車の重さはどれくらいか？",
    },
  },
  {
    letter: "D",
    pts: "7",
    prompt: {
      en: "Restaurant ratings from one star to five stars.",
      ja: "1つ星から5つ星までのレストラン評価。",
    },
  },
  {
    letter: "E",
    pts: "7",
    prompt: {
      en: "The time it takes you to get from your house to the nearest beach.",
      ja: "家からいちばん近いビーチまでかかる時間。",
    },
  },
];

const Q2_INTRO: Line = {
  en: "The following is a statistical experiment. Please read carefully, and then identify the parts indicated in parts A–E below.",
  ja: "次は統計的な実験（調査）の記述です。よく読んでから、下の A–E で指示された部分を特定してください。",
};

const Q2_SCENARIO: Line = {
  en: "UC San Diego wants to know the true average amount of money their students spend on textbooks per semester by race. They break up the student body into ethnic groups using their student IDs and take a random sample from each race for a total of 400 students.",
  ja: "UC San Diego は、学生が学期ごとに教科書に使う金額の真の平均を、人種（race）別に知りたい。学生証IDを使って学生全体を民族グループに分け、各人種から無作為標本を取り、合計400人にする。",
};

const Q2_ITEMS: SubQ[] = [
  {
    letter: "A",
    pts: "4",
    prompt: {
      en: "What is the population parameter (proper symbol and description) of interest the admissions office wants to estimate? (2 points each, 4 points total).",
      ja: "入学事務局が推定したい母集団パラメータ（適切な記号＋説明）は何か？（各2点、合計4点）",
    },
  },
  {
    letter: "B",
    pts: "2",
    prompt: {
      en: "Describe the targeted population. Be specific. (2 points)",
      ja: "対象とする母集団（targeted population）を具体的に述べよ。（2点）",
    },
  },
  {
    letter: "C",
    pts: "8",
    prompt: {
      en: "Describe the variable of interest involved (4 points). What type of variable and level of measurement is it? (4 points).",
      ja: "関心のある変数（variable of interest）を述べよ（4点）。それはどんな種類の変数で、測定尺度は何か？（4点）",
    },
  },
  {
    letter: "D",
    pts: "3",
    prompt: {
      en: "Describe the sample and which sampling method was utilized. (3 points)",
      ja: "標本（sample）と、使われた標本抽出法（sampling method）を述べよ。（3点）",
    },
  },
  {
    letter: "E",
    pts: "7",
    prompt: {
      en: "What is the statistic including the proper symbol (4 points) and how would you calculate the statistic? (3 points)",
      ja: "適切な記号を含む統計量（statistic）は何か（4点）。その統計量はどう計算するか？（3点）",
    },
  },
];

const VOCAB: Gloss[] = [
  {
    en: "closed book",
    ja: "閉書",
    note: "ノート・教科書持ち込み不可の試験",
  },
  {
    en: "variable of interest",
    ja: "関心のある変数",
    note: "その研究／問題で測っているもの",
  },
  {
    en: "Qualitative / categorical / attribute",
    ja: "質的・カテゴリ変数",
    note: "名前・ラベル。計算の「量」ではない",
  },
  {
    en: "Quantitative / numerical",
    ja: "量的・数値変数",
    note: "数えたり測ったりする数",
  },
  {
    en: "nominal",
    ja: "名義尺度",
    note: "名前だけ。順序なし（blood type, zip code）",
  },
  {
    en: "ordinal",
    ja: "順序尺度",
    note: "順序あり。間隔は等しくない（星評価）",
  },
  {
    en: "discrete",
    ja: "離散",
    note: "数えられる整数（人数、足数）",
  },
  {
    en: "continuous",
    ja: "連続",
    note: "測れる量（重さ、時間、金額）",
  },
  {
    en: "level of measurement",
    ja: "測定尺度",
    note: "Nominal / Ordinal / Interval / Ratio",
  },
  {
    en: "military time",
    ja: "軍用時・24時間表示",
    note: "時刻（clock time）。所要時間とは別",
  },
  {
    en: "population parameter",
    ja: "母集団パラメータ",
    note: "母集団の真の値。平均なら μ",
  },
  {
    en: "true average / true mean",
    ja: "真の平均",
    note: "母平均 μ を指す言い方",
  },
  {
    en: "targeted population",
    ja: "対象母集団",
    note: "知りたい全体（例: all UCSD students）",
  },
  {
    en: "sample",
    ja: "標本",
    note: "実際に調べた一部（例: 400人）",
  },
  {
    en: "sampling method",
    ja: "標本抽出法",
    note: "どう選んだか（stratified など）",
  },
  {
    en: "random sample",
    ja: "無作為標本",
    note: "各人が選ばれる確率が設計どおり",
  },
  {
    en: "statistic",
    ja: "統計量",
    note: "標本から計算。平均なら x̄",
  },
  {
    en: "estimate",
    ja: "推定する",
    note: "標本で母集団の値を推測する",
  },
  {
    en: "student body",
    ja: "学生全体",
    note: "その大学の在学生すべて",
  },
  {
    en: "ethnic groups / by race",
    ja: "民族グループ／人種別",
    note: "層（strata）分けの軸になりやすい",
  },
  {
    en: "textbooks per semester",
    ja: "学期ごとの教科書費",
    note: "金額 → だいたい Quantitative continuous ratio",
  },
];

function GlossLine({ line }: { line: Line }) {
  return (
    <Stack gap={4}>
      <Text weight="semibold">{line.ja}</Text>
      <Text size="small" tone="secondary">
        EN: {line.en}
      </Text>
    </Stack>
  );
}

export default function StatC1000Exam1ReviewJa() {
  const theme = useHostTheme();

  return (
    <Stack gap={18} style={{ maxWidth: 860, margin: "0 auto", padding: 20 }}>
      <Stack gap={6}>
        <H1>STAT C1000 · Exam 1 Review（日本語訳）</H1>
        <Text tone="secondary">
          出典 PDF（Math 54 Exam 1 形式）の問題文対訳のみ。正答・模範解答は付けていません。答案は学習シート
          canvas で練習してください。
        </Text>
        <Row gap={8} style={{ flexWrap: "wrap" }}>
          <Pill tone="info">翻訳のみ</Pill>
          <Pill>正答なし</Pill>
          <Pill>語彙解説あり</Pill>
          <Pill>closed book 想定</Pill>
        </Row>
      </Stack>

      <Callout tone="info">
        Mr. Martinez · Exam 1 · Math 54 Spring 2022 Version 3（PDF表記）。Name
        欄は本番用。ここでは訳と語彙だけ。
      </Callout>

      <H2>英語語彙解説</H2>
      <Text size="small" tone="secondary">
        問題文に出てくる語。答案も英語で書く想定なので、左の英語をそのまま使える形で覚えます。
      </Text>
      <Table
        headers={["English", "日本語", "解説"]}
        rows={VOCAB.map((v) => [v.en, v.ja, v.note])}
      />

      <Divider />

      <H2>試験注意書き</H2>
      {HEADER.map((h, i) => (
        <Card key={i}>
          <CardBody>
            <GlossLine line={h} />
          </CardBody>
        </Card>
      ))}

      <Divider />

      <H2>Question 1 — Variable classification</H2>
      <Card>
        <CardHeader trailing={<Pill>各問 7 pts</Pill>}>指示文</CardHeader>
        <CardBody>
          <GlossLine line={Q1_INTRO} />
        </CardBody>
      </Card>

      {Q1_ITEMS.map((item) => (
        <Card key={item.letter}>
          <CardHeader trailing={<Pill>{item.pts} pts</Pill>}>
            {item.letter})
          </CardHeader>
          <CardBody>
            <Stack gap={10}>
              <GlossLine line={item.prompt} />
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: theme.fill.tertiary,
                  border: `1px solid ${theme.stroke.tertiary}`,
                }}
              >
                <Text size="small" tone="secondary">
                  書く順（英語）: (1) variable of interest (2) Qualitative /
                  Quantitative (3) nominal · ordinal · discrete · continuous (4)
                  level of measurement
                </Text>
              </div>
            </Stack>
          </CardBody>
        </Card>
      ))}

      <Divider />

      <H2>Question 2 — Statistical experiment</H2>
      <Card>
        <CardHeader>導入</CardHeader>
        <CardBody>
          <GlossLine line={Q2_INTRO} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader trailing={<Pill tone="info">シナリオ</Pill>}>
          UC San Diego textbooks
        </CardHeader>
        <CardBody>
          <GlossLine line={Q2_SCENARIO} />
        </CardBody>
      </Card>

      {Q2_ITEMS.map((item) => (
        <Card key={item.letter}>
          <CardHeader trailing={<Pill>{item.pts} pts</Pill>}>
            {item.letter})
          </CardHeader>
          <CardBody>
            <GlossLine line={item.prompt} />
          </CardBody>
        </Card>
      ))}

      <Divider />

      <H3>記号ミニ表（語彙の続き）</H3>
      <Table
        headers={["Symbol", "English", "日本語"]}
        rows={[
          ["μ", "population mean (parameter)", "母平均（パラメータ）"],
          ["x̄", "sample mean (statistic)", "標本平均（統計量）"],
          ["p", "population proportion", "母比率"],
          ["p̂", "sample proportion", "標本比率"],
          ["σ", "population SD", "母標準偏差"],
          ["s", "sample SD", "標本標準偏差"],
        ]}
      />

      <Callout tone="warning">
        この画面は訳だけです。解答例は「STAT C1000 Exam 1 学習シート」の Review解答タブを使ってください。
      </Callout>
    </Stack>
  );
}
