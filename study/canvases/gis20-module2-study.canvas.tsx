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

type Tab = "map" | "phenomena" | "models" | "choose" | "lab" | "drill";

const TABS: { id: Tab; label: string }[] = [
  { id: "map", label: "モジュール地図" },
  { id: "phenomena", label: "現象の見方" },
  { id: "models", label: "Vector / Raster / TIN" },
  { id: "choose", label: "選び方" },
  { id: "lab", label: "Lab 2 接続" },
  { id: "drill", label: "確認ドリル" },
];

export default function Gis20Module2Study() {
  const [tab, setTab] = useCanvasState<Tab>("tab", "map");

  return (
    <Stack gap={18} style={{ maxWidth: 920, margin: "0 auto", padding: 20 }}>
      <Stack gap={6}>
        <H1>GIS 20 · Module 2 学習シート</H1>
        <Text tone="secondary">
          Week 2–3 Spatial Data Fundamentals（Liu）。核は Spatial Data Models —
          現実をどう簡略化してコンピュータに載せるか。出典: M2-2 Study Guide /
          Discussion 指示 / Lab 2 / OER Essentials of GIS（Campbell & Shin Ch.4）。
        </Text>
        <Row gap={8} style={{ flexWrap: "wrap" }}>
          <Pill tone="info">Discrete vs Continuous</Pill>
          <Pill>Vector · Raster · TIN</Pill>
          <Pill>Quiz / Lab / Discussion 共通語彙</Pill>
        </Row>
      </Stack>

      <Callout tone="warning">
        STAT の discrete/continuous（数えられる／測れる）と混ぜない。ここは{" "}
        <Text as="span" weight="semibold">
          空間の現象の見方
        </Text>
        （物体か面か）と、その表現モデルの話。
      </Callout>

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

      {tab === "map" && <ModuleMap />}
      {tab === "phenomena" && <Phenomena />}
      {tab === "models" && <Models />}
      {tab === "choose" && <Choose />}
      {tab === "lab" && <LabLink />}
      {tab === "drill" && <Drill />}
    </Stack>
  );
}

function ModuleMap() {
  return (
    <Stack gap={16}>
      <H2>Module 2 に何があるか</H2>
      <Table
        headers={["項目", "役割", "あなたがやるべきこと"]}
        rows={[
          [
            "M2-1 Reading",
            "OER / 指定読書",
            "data model・現象の用語を本文で確認",
          ],
          [
            "M2-2 Study Guide",
            "要点の公式まとめ",
            "object/attribute、discrete/continuous、3モデル",
          ],
          [
            "Discussion 2",
            "応用＋reasoning",
            "現象1つ → 見方 → モデル → challenge → reply",
          ],
          [
            "Reading Quiz 2",
            "用語チェック",
            "resolution / aggregation / topology を区別",
          ],
          [
            "Lab 2 (malaria)",
            "実践",
            "raster（感染リスク面）× vector（行政界）＋ join / zonal",
          ],
        ]}
      />

      <H3>Module の一文</H3>
      <Text>
        GIS は現実そのものを保存できない。だから{" "}
        <Text as="span" weight="semibold">
          geospatial data model
        </Text>
        ＝「どこにあるか（geometry / object）」と「それは何か（attribute）」に分けた簡略化ルールを使う。
      </Text>

      <Card>
        <CardHeader>覚える2部品</CardHeader>
        <CardBody>
          <Table
            headers={["部品", "意味", "例"]}
            rows={[
              [
                "Object / geometry",
                "位置と形",
                "point / line / polygon、または grid cell",
              ],
              [
                "Attribute",
                "その場所の説明（表の列）",
                "name, case rate, elevation value",
              ],
            ]}
          />
        </CardBody>
      </Card>
    </Stack>
  );
}

function Phenomena() {
  return (
    <Stack gap={16}>
      <H2>Spatial phenomena（見方）</H2>
      <Text>
        先に「何をどう見るか」を決める。あとから Vector / Raster を選ぶ。
      </Text>

      <Table
        headers={["見方", "定義（モジュール）", "例"]}
        rows={[
          [
            "Discrete objects",
            "区別できる実体。境界がはっきり。観測のあいだに「そのもの」はない",
            "roads, streams, parcels, buildings, pumps",
          ],
          [
            "Continuous surfaces",
            "観測のあいだにも値が存在し、面としてなめらかに変わる",
            "elevation, temperature, pressure, drought intensity",
          ],
          [
            "Either（目的次第）",
            "同じ現象でも問いで切り方が変わる",
            "population（個人= discrete / 密度面= continuous）",
          ],
        ]}
      />

      <Callout tone="info">
        Discussion / Quiz のキーワード: boundaries · exists between observations ·
        surfaces vs objects · purpose matters。
      </Callout>

      <H3>あなたの水プロジェクトで言うと</H3>
      <Table
        headers={["レイヤ", "見方", "なぜ"]}
        rows={[
          [
            "Aqueduct / canal / plant",
            "Discrete",
            "境界のあるインフラ。空いている空間に「導水路」は埋まっていない",
          ],
          [
            "Snowpack / rainfall / drought",
            "Continuous",
            "観測点のあいだにも値が続く面",
          ],
          [
            "Neighborhood access",
            "Either",
            "区画ポリゴン（discrete）でも、アクセス指標の面でも可",
          ],
        ]}
      />
    </Stack>
  );
}

function Models() {
  return (
    <Stack gap={16}>
      <H2>3つの data model</H2>

      <H3>Vector</H3>
      <Text>
        座標で discrete objects を表す。属性は別テーブル（IDでリンク）。
      </Text>
      <Table
        headers={["型", "次元", "使うとき"]}
        rows={[
          ["Point", "0D", "井戸、施設、サンプル地点"],
          ["Line / arc", "1D", "道路、水路、境界線（nodes + vertices）"],
          ["Polygon", "2D", "区画、湖、行政界"],
        ]}
      />
      <Text size="small" tone="secondary">
        Topology = 接続・隣接の関係を明示。gap / overshoot / sliver
        を減らし、ネットワーク解析や境界の整合に効く。
      </Text>

      <Divider />

      <H3>Raster</H3>
      <Text>
        空間を格子セルに分け、各セルに1つの値。continuous surfaces
        に強い（土地被覆の discrete クラスでも使える）。
      </Text>
      <Table
        headers={["語", "意味"]}
        rows={[
          ["Cell value", "そのマスの属性（標高・気温・リスクなど）"],
          ["Spatial resolution", "セルの大きさ。細かいほど詳細、重い"],
          [
            "Aggregation",
            "粗いセルにまとめると局所差が消える（詳細の損失）",
          ],
        ]}
      />

      <Divider />

      <H3>TIN（Triangulated Irregular Network）</H3>
      <Text>
        不規則な測定点を三角形でつないだ surface（特に elevation / DEM）。測定点を残しやすく、急な起伏に強い。Raster
        DEM より構造は複雑だが、地形の細部を保ちやすい。
      </Text>
      <Text size="small" tone="secondary">
        構成: points + edges + faces（三角形）。平坦な広域の単純表示だけなら raster
        の方が扱いやすいことも多い。
      </Text>
    </Stack>
  );
}

function Choose() {
  return (
    <Stack gap={16}>
      <H2>どう選ぶか（クイズ・Discussion用）</H2>
      <Table
        headers={["目的", "向きやすいモデル", "失いやすいもの"]}
        rows={[
          [
            "境界・接続・正確な位置が大事",
            "Vector",
            "面全体の滑らかな変化",
          ],
          [
            "どこでも続く場の値を見たい",
            "Raster",
            "細い境界の正確さ（cell size）",
          ],
          [
            "標高を測定点優先で表面化",
            "TIN",
            "単純さ・軽い表示",
          ],
          [
            "コミュニティ比較（集計）",
            "Vector polygon + attributes",
            "ポリゴン内部の差（aggregation）",
          ],
          [
            "推定リスク面",
            "Raster",
            "実測点の「確定」との混同リスク",
          ],
        ]}
      />

      <Callout tone="success">
        答案の型: “I choose ___ because [phenomenon view]. This model fits because
        ___. It loses ___. Another model would be better when ___.”
      </Callout>

      <H3>よくあるひっかけ</H3>
      <Table
        headers={["言い方", "正しい読み"]}
        rows={[
          [
            "道路は continuous？",
            "通常は discrete object（線）。路面温度なら continuous もあり得る",
          ],
          [
            "気温を vector point で",
            "測候所だけ見るならOK。場全体なら raster surface",
          ],
          [
            "細かい raster = いつも正解",
            "解像度↑で重い。元データが粗ければ細部は増えない",
          ],
        ]}
      />
    </Stack>
  );
}

function LabLink() {
  return (
    <Stack gap={16}>
      <H2>Lab 2 · Malaria と Module 2 の接続</H2>
      <Text>
        Lab は「理論のクリック版」。疫病監視で discrete と continuous
        を同じマップに載せる。
      </Text>
      <Table
        headers={["Lab の部品", "Module 2 語彙"]}
        rows={[
          [
            "UN SALB 行政界",
            "Discrete objects → Vector polygons",
          ],
          [
            "Pf malaria raster imagery",
            "Continuous（または格子化されたリスク）→ Raster",
          ],
          [
            "Zonal Statistics",
            "continuous raster を discrete polygon に要約（bridge）",
          ],
          [
            "Join Features",
            "object（geometry）と attribute（表）を key で結ぶ",
          ],
          [
            "Public web map + reflection",
            "simplification of reality + 何が失われたかを言語化",
          ],
        ]}
      />
      <Callout tone="info">
        Reflection で書くなら: zonal stats は「面の値を領域に要約する」ので、内部の細かい変化は
        aggregation で落ちる — Module の trade-off そのもの。
      </Callout>
    </Stack>
  );
}

function Drill() {
  return (
    <Stack gap={16}>
      <H2>確認ドリル（答えは下）</H2>
      <Text weight="semibold">Q1.</Text>
      <Text>
        川を「水路そのもの」として地図にするとき、現象の見方とモデルは？
      </Text>
      <Text weight="semibold">Q2.</Text>
      <Text>
        流域全体の降水量を見たいとき、なぜ raster が向き、何が失われる？
      </Text>
      <Text weight="semibold">Q3.</Text>
      <Text>
        Topology は Vector の何を助ける？1語でなく関係で説明。
      </Text>
      <Text weight="semibold">Q4.</Text>
      <Text>
        人口を either と言うとき、discrete 側と continuous 側の例を1つずつ。
      </Text>

      <Divider />
      <H3>解答</H3>
      <Text size="small">
        Q1: Discrete object → Vector line（必要なら polygon）。観測のあいだに「川」は埋まっていない。
      </Text>
      <Text size="small">
        Q2: Continuous surface。Raster はセルごとに値を持てる。粗い resolution / aggregation で局所差が消える。
      </Text>
      <Text size="small">
        Q3: 接続・隣接などの空間関係を明示し、境界の食い違い（gap 等）を減らす。
      </Text>
      <Text size="small">
        Q4: Discrete = 個人や住所点 / Continuous = 人口密度の面。
      </Text>

      <Callout tone="neutral">
        次の一歩: Discussion 投稿を Module 語で見直す / Quiz 2
        で resolution・aggregation・TIN の選択肢を意識する / Lab 2 reflection
        に zonal = bridge を1文入れる。
      </Callout>
    </Stack>
  );
}
