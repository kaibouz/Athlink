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
  Stack,
  Table,
  Text,
  useCanvasState,
} from "cursor/canvas";

type Tab = "bridge" | "gis" | "stat" | "write";

const TABS: { id: Tab; label: string }[] = [
  { id: "bridge", label: "1. 同じ語・違う仕事" },
  { id: "gis", label: "2. GIS Module 2" },
  { id: "stat", label: "3. STAT との接続" },
  { id: "write", label: "4. 投稿の組み立て" },
];

export default function DiscreteContinuousBridgeLecture() {
  const [tab, setTab] = useCanvasState<Tab>("tab", "bridge");

  return (
    <Stack gap={18} style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <Stack gap={6}>
        <H1>講義 · Discrete / Continuous を2科目でつなぐ</H1>
        <Text tone="secondary">
          GIS 20 Discussion 2（Discrete Objects vs Continuous Surfaces）× STAT
          C1000 Exam 1（変数の discrete / continuous）。出典: M2-2 Study Guide +
          Discussion 指示文。
        </Text>
        <Row gap={8} style={{ flexWrap: "wrap" }}>
          <Pill tone="info">Reply 期限: 今夜 11:59</Pill>
          <Pill>採点は reasoning</Pill>
          <Pill>正解は一つではない</Pill>
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

      {tab === "bridge" && <Bridge />}
      {tab === "gis" && <GisModule />}
      {tab === "stat" && <StatLink />}
      {tab === "write" && <WriteGuide />}
    </Stack>
  );
}

function Bridge() {
  return (
    <Stack gap={16}>
      <Callout tone="warning">
        いちばん大事な注意: 同じ英語（discrete / continuous）でも、STAT と GIS
        では「何について言っているか」が違います。混同すると両方で点が落ちます。
      </Callout>

      <H2>一言でいうと</H2>
      <Table
        headers={["科目", "discrete / continuous が指すもの", "質問の核"]}
        rows={[
          [
            "STAT C1000",
            "1つの変数の値の取り方",
            "数えられる整数？それとも測れる量？",
          ],
          [
            "GIS 20",
            "現象が空間にどう存在するかをどう見るか",
            "境界のある物体？それとも場所どこでも値が続く面？",
          ],
        ]}
      />

      <H3>共通している直感</H3>
      <Text>
        どちらも「切れ切れに分かれているか / 滑らかに続くか」という感覚は近いです。でも
        STAT は表の1列（attribute）、GIS は地図上の存在のしかた（spatial phenomenon）です。
      </Text>

      <Card>
        <CardHeader>同じ現象を両方のレンズで見る</CardHeader>
        <CardBody>
          <Stack gap={8}>
            <Text weight="semibold">例: 気温</Text>
            <Text size="small">
              STAT: temperature は Quantitative · Continuous · Interval（°C）または
              Ratio（Kelvin）。「1つの測定値の性質」。
            </Text>
            <Text size="small">
              GIS: temperature は continuous spatial phenomenon（観測点の間にも値が存在し、面として変わる）。表現はだいたい
              Raster（または補間した surface）。「空間での存在のしかた」。
            </Text>
            <Divider />
            <Text weight="semibold">例: 靴の足数（STAT Review Q1A）</Text>
            <Text size="small">
              STAT: Discrete · Ratio。「何足持っているか」は整数で数える。
            </Text>
            <Text size="small">
              GIS: 靴そのものは discrete objects（1足・1足）。地図にするなら点やポリゴンの
              Vector。STAT の discrete と GIS の discrete がきれいに重なる例。
            </Text>
          </Stack>
        </CardBody>
      </Card>

      <Callout tone="info">
        Discussion で書くのは GIS 側のレンズです。ただし attribute（属性テーブルの列）を書くとき、STAT
        の Qualitative / Quantitative / level of measurement がそのまま効きます。
      </Callout>
    </Stack>
  );
}

function GisModule() {
  return (
    <Stack gap={16}>
      <H2>Module 2 の骨（M2-2 Study Guide）</H2>

      <H3>1. Geospatial data model = 現実の簡略化</H3>
      <Text>
        コンピュータは現実を全部は持てない。だから「どこにあるか（object / geometry）」と「それは何か（attribute）」に分けて保存する。
      </Text>
      <Table
        headers={["部品", "意味", "STAT で言うと"]}
        rows={[
          ["Object / geometry", "点・線・面の形と位置", "場所（空間の枠）"],
          [
            "Attribute",
            "名前・人数・温度などの説明データ（表の列）",
            "variable（質的/量的・尺度）",
          ],
        ]}
      />

      <H3>2. Spatial phenomena（Discussion Part A の本体）</H3>
      <Table
        headers={["種類", "定義（モジュール）", "例"]}
        rows={[
          [
            "Discrete",
            "区別できる実体。境界がはっきり。観測のあいだの空間には「そのもの」は存在しない",
            "roads, streams, parcels, buildings",
          ],
          [
            "Continuous",
            "観測のあいだにも値が存在し、個々の物体として切り出せない。面としてなめらかに変わる",
            "elevation, temperature, atmospheric pressure",
          ],
        ]}
      />
      <Callout tone="info">
        Discussion は「either（目的次第でどちらも）」も認めています。例:
        人口は個人（discrete）としても、密度の面（continuous）としてもモデル化できる。
      </Callout>

      <H3>3. 3つの data model（Discussion Part B）</H3>
      <Table
        headers={["Model", "向いているもの", "失いやすいもの"]}
        rows={[
          [
            "Vector (point / line / polygon)",
            "Discrete objects。境界・接続が大事なとき",
            "面全体の滑らかな変化（温度のグラデなど）",
          ],
          [
            "Raster (grid cells)",
            "Continuous surfaces。解像度で細かさが決まる",
            "細かい境界の正確さ（aggregation / cell size）",
          ],
          [
            "TIN",
            "3D continuous surface（特に elevation）。測定点を正確に残せる",
            "単純な地図表現では重く見えやすい／用途が限定的",
          ],
        ]}
      />

      <Text size="small" tone="secondary">
        Vector: points（0D）· lines/arcs（nodes + vertices）· polygons。Topology
        は接続・隣接の関係を明示（gap / overshoot / sliver を減らす）。Raster:
        cell value · spatial resolution · aggregation。TIN: points + edges +
        faces（三角形）。
      </Text>
    </Stack>
  );
}

function StatLink() {
  return (
    <Stack gap={16}>
      <H2>STAT Exam 1 の4ステップ（復習）</H2>
      <Text>
        Quantitative のときだけ、ステップ3で discrete / continuous を使います。
      </Text>
      <Table
        headers={["#", "書くこと", "選択肢"]}
        rows={[
          ["1", "Variable of interest", "何を測っているか"],
          ["2", "Qualitative or Quantitative", "カテゴリ vs 数値"],
          [
            "3",
            "Subtype",
            "Qual → nominal/ordinal · Quant → discrete/continuous",
          ],
          ["4", "Level of measurement", "Nominal / Ordinal / Interval / Ratio"],
        ]}
      />

      <H3>STAT discrete vs continuous（再確認）</H3>
      <Table
        headers={["", "Discrete", "Continuous"]}
        rows={[
          ["意味", "数えられる（だいたい整数）", "測れる（小数があり得る）"],
          ["例", "靴の足数、人数", "体重、所要時間、金額"],
          ["罠", "zip code は数に見えて Qualitative", "military time は Interval"],
        ]}
      />

      <H3>GIS attribute に STAT を当てはめる</H3>
      <Text>
        川を Vector line にしたあと、属性テーブルに列を足すと STAT
        の世界に入ります。
      </Text>
      <Table
        headers={["Attribute 例", "STAT 分類", "GIS メモ"]}
        rows={[
          [
            "stream name",
            "Qual · Nominal · Nominal",
            "ラベル。境界は geometry 側",
          ],
          [
            "order / class (1–5)",
            "Qual · Ordinal · Ordinal",
            "順序カテゴリ",
          ],
          [
            "number of gauges on reach",
            "Quant · Discrete · Ratio",
            "数え上げ",
          ],
          [
            "mean summer temperature (°C)",
            "Quant · Continuous · Interval",
            "面の値を線に集約した例も可",
          ],
          [
            "discharge (cfs)",
            "Quant · Continuous · Ratio",
            "測れる量・真のゼロあり",
          ],
        ]}
      />

      <Callout tone="success">
        試験対策の言い方: GIS の discrete object ≠ STAT の discrete
        variable。でも「切れ切れ」という感覚は共有。答案では科目ごとの定義を使う。
      </Callout>
    </Stack>
  );
}

function WriteGuide() {
  return (
    <Stack gap={16}>
      <H2>Discussion 指示 → 答案の型</H2>
      <Callout tone="warning">
        自分の言葉で書いてください（指示文: AI-generated / copied は期待に合わない）。ここは骨格と用語の置き場です。全文の代筆ではありません。
      </Callout>

      <H3>Part A — Discrete vs Continuous（概念）</H3>
      <Text size="small">
        現象を1つ選ぶ → discrete / continuous / either を宣言 → module
        語（boundaries, exists between observations, surfaces vs objects）で正当化。
      </Text>
      <Callout tone="neutral">
        型: “I chose ___. I treat it as ___ because [boundary /
        between-observations]. For my purpose (___) that matters because ___.”
      </Callout>

      <H3>Part B — Data model（Vector / Raster / TIN）</H3>
      <Text size="small">必須3点: なぜその model · 何が失われる · 別 model
        が向く場面。</Text>
      <Table
        headers={["書く項目", "使う語彙"]}
        rows={[
          ["Why this model", "object, surface, resolution, geometry"],
          ["What is lost", "aggregation, simplification, detail, boundary precision"],
          ["When another model", "different purpose / scale / question"],
        ]}
      />

      <H3>Part C — Challenge question（1つ）</H3>
      <Text size="small">
        Yes/No 禁止。モジュール内容で答えられる比較・条件・トレードオフ。例の型:
        “Under what conditions might ___ be better as raster than vector?” /
        “How would changing resolution change interpretation of ___?”
      </Text>

      <H3>Reply（今夜まで・100–150語）</H3>
      <Text size="small">
        相手の challenge に直接答える → 別 data model / limitation /
        別GIS用途を1つ足す。相手の要約の繰り返しは避ける。
      </Text>

      <Divider />

      <H3>投稿前チェック（両科目）</H3>
      <Table
        headers={["チェック", "OKの目安"]}
        rows={[
          [
            "GIS Part A",
            "spatial phenomenon の話（境界・面）になっている",
          ],
          [
            "GIS Part B",
            "Vector/Raster/TIN + loss + alternative がある",
          ],
          [
            "STAT 混同なし",
            "「discrete = 整数で数える」だけを GIS の理由にしていない",
          ],
          [
            "Attribute を触るなら",
            "Qual/Quant · level が STAT の定義と一致",
          ],
        ]}
      />

      <Callout tone="info">
        締切: Initial は日曜済み想定 / Response は今夜 11:59 PT。成績ではまだ
        Discrete Objects Discussion は `- / 10`（未提出）。
      </Callout>
    </Stack>
  );
}
