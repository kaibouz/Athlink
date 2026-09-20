import {
  Button,
  Callout,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Divider,
  H1,
  H2,
  Link,
  Pill,
  Row,
  Stack,
  Stat,
  Text,
  useCanvasState,
  useHostTheme,
} from "cursor/canvas";

type Item = {
  id: string;
  course: string;
  name: string;
  type: string;
  dueLabel: string;
  days: number;
  bucket: "overdue" | "today" | "week" | "later";
  points: number | null;
  html_url: string;
  submitted: boolean;
  local: string;
};

const FETCHED = "2026-09-13 11:05 PM PDT";

const ITEMS: Item[] = [
  {
    "id": "a-85298-2303898",
    "course": "ARTH C1200",
    "name": "Share A Work Of Art That You Enjoy",
    "type": "discussion",
    "dueLabel": "Fri Sep 4 \u00b7 11:59 PM",
    "days": -9.0,
    "bucket": "overdue",
    "points": 25,
    "html_url": "https://online.smc.edu/courses/85298/assignments/2303898",
    "submitted": false,
    "local": ""
  },
  {
    "id": "a-85298-2303923",
    "course": "ARTH C1200",
    "name": "What Makes an Object Art?: Teapot Comparison",
    "type": "assignment",
    "dueLabel": "Mon Sep 7 \u00b7 11:59 PM",
    "days": -6.0,
    "bucket": "overdue",
    "points": 30,
    "html_url": "https://online.smc.edu/courses/85298/assignments/2303923",
    "submitted": false,
    "local": ""
  },
  {
    "id": "a-85298-2303910",
    "course": "ARTH C1200",
    "name": "Comparison Essay, The Madonna Enthroned: Giotto vs. Cimabue",
    "type": "assignment",
    "dueLabel": "Fri Sep 11 \u00b7 11:59 PM",
    "days": -2.0,
    "bucket": "overdue",
    "points": 30,
    "html_url": "https://online.smc.edu/courses/85298/assignments/2303910",
    "submitted": false,
    "local": ""
  },
  {
    "id": "a-85298-2303896",
    "course": "ARTH C1200",
    "name": "Discussion Thread: Find and Describe a Work of Late Medieval Art",
    "type": "discussion",
    "dueLabel": "Fri Sep 11 \u00b7 11:59 PM",
    "days": -2.0,
    "bucket": "overdue",
    "points": 25,
    "html_url": "https://online.smc.edu/courses/85298/assignments/2303896",
    "submitted": false,
    "local": ""
  },
  {
    "id": "a-85288-2313323",
    "course": "GEOG 20",
    "name": "Module Reading Quiz 2: Spatial Data Models",
    "type": "quiz",
    "dueLabel": "Sun Sep 13 \u00b7 11:59 PM",
    "days": 0.0,
    "bucket": "today",
    "points": 20,
    "html_url": "https://online.smc.edu/courses/85288/assignments/2313323",
    "submitted": false,
    "local": ""
  },
  {
    "id": "todo-2313328",
    "course": "GEOG 20",
    "name": "Discussion 2: Seeing the World in GIS: Discrete Objects vs. Continuous Surfaces (initial / part A)",
    "type": "discussion",
    "dueLabel": "Sun Sep 13 \u00b7 11:59 PM",
    "days": 0.0,
    "bucket": "today",
    "points": null,
    "html_url": "https://online.smc.edu/courses/85288/assignments/2313328",
    "submitted": false,
    "local": "/Users/kainozawa/athlink/gis20-discussion2-draft.md"
  },
  {
    "id": "a-86105-2313641",
    "course": "GEOG 5",
    "name": "Lab 1: Geographic Grid and AGOL",
    "type": "assignment",
    "dueLabel": "Mon Sep 14 \u00b7 12:45 PM",
    "days": 0.6,
    "bucket": "today",
    "points": 35,
    "html_url": "https://online.smc.edu/courses/86105/assignments/2313641",
    "submitted": false,
    "local": ""
  },
  {
    "id": "a-86105-2313654",
    "course": "GEOG 5",
    "name": "Quiz 1: Intro to Physical Geography",
    "type": "assignment",
    "dueLabel": "Mon Sep 14 \u00b7 12:45 PM",
    "days": 0.6,
    "bucket": "today",
    "points": 15,
    "html_url": "https://online.smc.edu/courses/86105/assignments/2313654",
    "submitted": true,
    "local": "/Users/kainozawa/.cursor/projects/Users-kainozawa-athlink/canvases/geog5-quiz1-ja.canvas.tsx"
  },
  {
    "id": "a-85298-2303899",
    "course": "ARTH C1200",
    "name": "Comparison Essay, The Lamentation: Giotto vs. Anonymous Fresco Painter",
    "type": "assignment",
    "dueLabel": "Mon Sep 14 \u00b7 11:59 PM",
    "days": 1.0,
    "bucket": "week",
    "points": 30,
    "html_url": "https://online.smc.edu/courses/85298/assignments/2303899",
    "submitted": false,
    "local": ""
  },
  {
    "id": "todo-2313329",
    "course": "GEOG 20",
    "name": "Discussion 2: Seeing the World in GIS: Discrete Objects vs. Continuous Surfaces (reply / part B)",
    "type": "discussion",
    "dueLabel": "Tue Sep 15 \u00b7 11:59 PM",
    "days": 2.0,
    "bucket": "week",
    "points": null,
    "html_url": "https://online.smc.edu/courses/85288/assignments/2313329",
    "submitted": false,
    "local": "/Users/kainozawa/athlink/gis20-discussion2-draft.md"
  },
  {
    "id": "a-85288-2332149",
    "course": "GEOG 20",
    "name": "Lab 2 Monitor malaria epidemics (Spatial Data Models)",
    "type": "assignment",
    "dueLabel": "Wed Sep 16 \u00b7 11:59 PM",
    "days": 3.0,
    "bucket": "week",
    "points": 20,
    "html_url": "https://online.smc.edu/courses/85288/assignments/2332149",
    "submitted": false,
    "local": ""
  },
  {
    "id": "a-85298-2303900",
    "course": "ARTH C1200",
    "name": "Assignment: Renaissance Vocabulary Worksheet",
    "type": "assignment",
    "dueLabel": "Fri Sep 18 \u00b7 11:59 PM",
    "days": 5.0,
    "bucket": "week",
    "points": 20,
    "html_url": "https://online.smc.edu/courses/85298/assignments/2303900",
    "submitted": false,
    "local": ""
  },
  {
    "id": "a-85298-2303913",
    "course": "ARTH C1200",
    "name": "Comparison Essay: Brunelleschi vs. Ghiberti",
    "type": "assignment",
    "dueLabel": "Fri Sep 18 \u00b7 11:59 PM",
    "days": 5.0,
    "bucket": "week",
    "points": 30,
    "html_url": "https://online.smc.edu/courses/85298/assignments/2303913",
    "submitted": false,
    "local": ""
  },
  {
    "id": "a-86105-2313642",
    "course": "GEOG 5",
    "name": "Lab 2: Isoline Maps and Earth-Sun Relations",
    "type": "assignment",
    "dueLabel": "Mon Sep 21 \u00b7 12:45 PM",
    "days": 7.6,
    "bucket": "later",
    "points": 35,
    "html_url": "https://online.smc.edu/courses/86105/assignments/2313642",
    "submitted": false,
    "local": ""
  },
  {
    "id": "a-86105-2313655",
    "course": "GEOG 5",
    "name": "Quiz 2: Earth-Sun Relations and Atmosphere",
    "type": "assignment",
    "dueLabel": "Mon Sep 21 \u00b7 12:45 PM",
    "days": 7.6,
    "bucket": "later",
    "points": 15,
    "html_url": "https://online.smc.edu/courses/86105/assignments/2313655",
    "submitted": false,
    "local": ""
  },
  {
    "id": "a-85298-2303914",
    "course": "ARTH C1200",
    "name": "Comparison Essay: Fra Angelico vs. The Merode Altarpiece",
    "type": "assignment",
    "dueLabel": "Fri Sep 25 \u00b7 11:59 PM",
    "days": 12.0,
    "bucket": "later",
    "points": 30,
    "html_url": "https://online.smc.edu/courses/85298/assignments/2303914",
    "submitted": false,
    "local": ""
  },
  {
    "id": "a-86105-2313643",
    "course": "GEOG 5",
    "name": "Lab 3: Temperature and Air Pressure Patterns",
    "type": "assignment",
    "dueLabel": "Mon Sep 28 \u00b7 12:45 PM",
    "days": 14.6,
    "bucket": "later",
    "points": 35,
    "html_url": "https://online.smc.edu/courses/86105/assignments/2313643",
    "submitted": false,
    "local": ""
  },
  {
    "id": "a-86105-2313656",
    "course": "GEOG 5",
    "name": "Quiz 3: Temperature, Air Pressure, and Wind",
    "type": "assignment",
    "dueLabel": "Mon Sep 28 \u00b7 12:45 PM",
    "days": 14.6,
    "bucket": "later",
    "points": 15,
    "html_url": "https://online.smc.edu/courses/86105/assignments/2313656",
    "submitted": false,
    "local": ""
  },
  {
    "id": "a-85298-2303919",
    "course": "ARTH C1200",
    "name": "Thesis Essay Assignment #1: Is Genius Worth It?",
    "type": "assignment",
    "dueLabel": "Mon Sep 28 \u00b7 11:59 PM",
    "days": 15.0,
    "bucket": "later",
    "points": 40,
    "html_url": "https://online.smc.edu/courses/85298/assignments/2303919",
    "submitted": false,
    "local": ""
  },
  {
    "id": "a-86105-2313644",
    "course": "GEOG 5",
    "name": "Lab 4: Weather Data",
    "type": "assignment",
    "dueLabel": "Mon Oct 5 \u00b7 12:45 PM",
    "days": 21.6,
    "bucket": "later",
    "points": 35,
    "html_url": "https://online.smc.edu/courses/86105/assignments/2313644",
    "submitted": false,
    "local": ""
  },
  {
    "id": "a-86105-2313657",
    "course": "GEOG 5",
    "name": "Quiz 4: Atmospheric Moisture and Weather Systems",
    "type": "assignment",
    "dueLabel": "Mon Oct 5 \u00b7 12:45 PM",
    "days": 21.6,
    "bucket": "later",
    "points": 15,
    "html_url": "https://online.smc.edu/courses/86105/assignments/2313657",
    "submitted": false,
    "local": ""
  },
  {
    "id": "a-85298-2303908",
    "course": "ARTH C1200",
    "name": "Comparison Essay, The Holy Family: Raphael vs. Michelangelo",
    "type": "assignment",
    "dueLabel": "Fri Oct 9 \u00b7 11:59 PM",
    "days": 26.0,
    "bucket": "later",
    "points": 30,
    "html_url": "https://online.smc.edu/courses/85298/assignments/2303908",
    "submitted": false,
    "local": ""
  },
  {
    "id": "a-85298-2303894",
    "course": "ARTH C1200",
    "name": "Discussion Thread: The Original Selfies",
    "type": "discussion",
    "dueLabel": "Mon Oct 12 \u00b7 11:59 PM",
    "days": 29.0,
    "bucket": "later",
    "points": 20,
    "html_url": "https://online.smc.edu/courses/85298/assignments/2303894",
    "submitted": false,
    "local": ""
  },
  {
    "id": "a-85298-2303909",
    "course": "ARTH C1200",
    "name": "Comparison Essay, The Madonna Child: Lippi vs. Parmigianino",
    "type": "assignment",
    "dueLabel": "Fri Oct 16 \u00b7 11:59 PM",
    "days": 33.0,
    "bucket": "later",
    "points": 30,
    "html_url": "https://online.smc.edu/courses/85298/assignments/2303909",
    "submitted": false,
    "local": ""
  },
  {
    "id": "a-86105-2313645",
    "course": "GEOG 5",
    "name": "Lab 5: Climographs and Climate Mapping",
    "type": "assignment",
    "dueLabel": "Mon Oct 19 \u00b7 12:45 PM",
    "days": 35.6,
    "bucket": "later",
    "points": 35,
    "html_url": "https://online.smc.edu/courses/86105/assignments/2313645",
    "submitted": false,
    "local": ""
  },
  {
    "id": "a-86105-2313658",
    "course": "GEOG 5",
    "name": "Quiz 5: Climate and Climate Change",
    "type": "assignment",
    "dueLabel": "Mon Oct 19 \u00b7 12:45 PM",
    "days": 35.6,
    "bucket": "later",
    "points": 15,
    "html_url": "https://online.smc.edu/courses/86105/assignments/2313658",
    "submitted": false,
    "local": ""
  },
  {
    "id": "a-85298-2303904",
    "course": "ARTH C1200",
    "name": "Comparison Essay, Judith Slaying Holofernes: Artemisia Gentileschi vs. Caravaggio",
    "type": "assignment",
    "dueLabel": "Mon Oct 19 \u00b7 11:59 PM",
    "days": 36.0,
    "bucket": "later",
    "points": 30,
    "html_url": "https://online.smc.edu/courses/85298/assignments/2303904",
    "submitted": false,
    "local": ""
  },
  {
    "id": "a-85298-2303893",
    "course": "ARTH C1200",
    "name": "Discussion Thread: Who Would You Invite To Your Dinner Party?",
    "type": "discussion",
    "dueLabel": "Fri Oct 23 \u00b7 11:59 PM",
    "days": 40.0,
    "bucket": "later",
    "points": 40,
    "html_url": "https://online.smc.edu/courses/85298/assignments/2303893",
    "submitted": false,
    "local": ""
  },
  {
    "id": "a-86105-2313646",
    "course": "GEOG 5",
    "name": "Lab 6: Evaluating the Hydrosphere",
    "type": "assignment",
    "dueLabel": "Mon Oct 26 \u00b7 12:45 PM",
    "days": 42.6,
    "bucket": "later",
    "points": 35,
    "html_url": "https://online.smc.edu/courses/86105/assignments/2313646",
    "submitted": false,
    "local": ""
  },
  {
    "id": "a-86105-2313659",
    "course": "GEOG 5",
    "name": "Quiz 6: Intro to the Hydrosphere",
    "type": "assignment",
    "dueLabel": "Mon Oct 26 \u00b7 12:45 PM",
    "days": 42.6,
    "bucket": "later",
    "points": 15,
    "html_url": "https://online.smc.edu/courses/86105/assignments/2313659",
    "submitted": false,
    "local": ""
  },
  {
    "id": "a-85298-2303920",
    "course": "ARTH C1200",
    "name": "Thesis Essay Assignment #2: Women Artists Then and Now",
    "type": "assignment",
    "dueLabel": "Mon Oct 26 \u00b7 11:59 PM",
    "days": 43.0,
    "bucket": "later",
    "points": 100,
    "html_url": "https://online.smc.edu/courses/85298/assignments/2303920",
    "submitted": false,
    "local": ""
  }
];

const COURSE_HUBS: { course: string; href: string }[] = [
  { course: "GEOG 5", href: "https://online.smc.edu/courses/86105/assignments" },
  { course: "GEOG 20", href: "https://online.smc.edu/courses/85288/assignments" },
  { course: "ARTH C1200", href: "https://online.smc.edu/courses/85298/assignments" },
  { course: "STAT C1000", href: "https://online.smc.edu/courses/84818/assignments" },
  { course: "SOCIOL 1", href: "https://online.smc.edu/courses/85116/assignments" },
];

const LOCAL_TOOLS: { label: string; href: string; note: string }[] = [
  {
    label: "STAT C1000 Exam 1 学習シート",
    href: "/Users/kainozawa/.cursor/projects/Users-kainozawa-athlink/canvases/stat-c1000-exam1-study.canvas.tsx",
    note: "Canvas上に個別dueなし — 明日の小テスト想定",
  },
  {
    label: "STAT 暗記用 Markdown",
    href: "/Users/kainozawa/Desktop/STAT_C1000_Exam1_Study.md",
    note: "Desktop",
  },
  {
    label: "GEOG 5 Quiz 1 日本語訳",
    href: "/Users/kainozawa/.cursor/projects/Users-kainozawa-athlink/canvases/geog5-quiz1-ja.canvas.tsx",
    note: "提出済でも復習用",
  },
  {
    label: "GIS 20 Discussion 2 下書き",
    href: "/Users/kainozawa/athlink/gis20-discussion2-draft.md",
    note: "Beyond Making Maps / Discrete vs Continuous",
  },
];

const BUCKET_LABEL: Record<Item["bucket"], string> = {
  overdue: "期限切れ（未提出）",
  today: "今日まで",
  week: "今週（7日以内）",
  later: "その先（〜45日）",
};

function defaultChecked(): Record<string, boolean> {
  const o: Record<string, boolean> = {};
  for (const it of ITEMS) {
    if (it.submitted) o[it.id] = true;
  }
  return o;
}

export default function SmcCanvasChecklist() {
  const theme = useHostTheme();
  const [checked, setChecked] = useCanvasState<Record<string, boolean>>(
    "done",
    defaultChecked(),
  );
  const [hideDone, setHideDone] = useCanvasState<boolean>("hideDone", false);
  const [filter, setFilter] = useCanvasState<string>("filter", "all");

  const isDone = (id: string) => !!checked[id];
  const toggle = (id: string, v: boolean) =>
    setChecked({ ...checked, [id]: v });

  const visible = ITEMS.filter((it) => {
    if (hideDone && isDone(it.id)) return false;
    if (filter !== "all" && it.course !== filter) return false;
    return true;
  });

  const openCount = ITEMS.filter((it) => !isDone(it.id)).length;
  const doneCount = ITEMS.filter((it) => isDone(it.id)).length;
  const overdueOpen = ITEMS.filter(
    (it) => it.bucket === "overdue" && !isDone(it.id),
  ).length;
  const todayOpen = ITEMS.filter(
    (it) => it.bucket === "today" && !isDone(it.id),
  ).length;

  const buckets: Item["bucket"][] = ["overdue", "today", "week", "later"];

  return (
    <Stack gap={18} style={{ maxWidth: 960, margin: "0 auto", padding: 20 }}>
      <Stack gap={6}>
        <H1>SMC Canvas · 締切チェックリスト</H1>
        <Text tone="secondary">
          5コース横断・期限が近い順。チェックはローカルに保存されます（再起動後も維持）。
          取得: {FETCHED} · 時刻は PT 表示
        </Text>
      </Stack>

      <Row gap={12} style={{ flexWrap: "wrap" }}>
        <Stat value={String(openCount)} label="未完了" tone="warning" />
        <Stat value={String(doneCount)} label="チェック済" tone="success" />
        <Stat value={String(overdueOpen)} label="期限切れ 未完了" />
        <Stat value={String(todayOpen)} label="今日まで 未完了" tone="danger" />
      </Row>

      {todayOpen > 0 && (
        <Callout tone="danger">
          今日まで未完了が {todayOpen} 件あります。とくに GEOG 20 Reading Quiz 2 /
          Discussion（Discrete vs Continuous）と GEOG 5 Lab 1 を優先してください。
        </Callout>
      )}

      {overdueOpen > 0 && (
        <Callout tone="warning">
          ARTH の期限切れが {overdueOpen} 件。教授に遅延提出可否を確認するのが安全です。
        </Callout>
      )}

      <Stack gap={8}>
        <H2>コース一覧（Canvas）</H2>
        <Row gap={10} style={{ flexWrap: "wrap" }}>
          {COURSE_HUBS.map((c) => (
            <span key={c.course}>
              <Link href={c.href}>{c.course} Assignments</Link>
            </span>
          ))}
        </Row>
      </Stack>

      <Stack gap={8}>
        <H2>ローカル学習リンク</H2>
        {LOCAL_TOOLS.map((t) => (
          <Row key={t.href} gap={10} style={{ flexWrap: "wrap", alignItems: "baseline" }}>
            <Link href={t.href}>{t.label}</Link>
            <Text size="small" tone="secondary">
              {t.note}
            </Text>
          </Row>
        ))}
        <Text size="small" tone="secondary">
          注: STAT / SOCIOL は Canvas API 上、近日の個別 due_at がほぼ未設定でした（発表・授業内評価の可能性）。
        </Text>
      </Stack>

      <Divider />

      <Row gap={8} style={{ flexWrap: "wrap", alignItems: "center" }}>
        <Text weight="semibold" size="small">
          フィルタ
        </Text>
        {["all", "GEOG 5", "GEOG 20", "ARTH C1200"].map((f) => (
          <span key={f}>
            <Button
              variant={filter === f ? "primary" : "secondary"}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "すべて" : f}
            </Button>
          </span>
        ))}
        <Checkbox
          checked={hideDone}
          onChange={setHideDone}
          label="完了を隠す"
        />
        <Button
          variant="secondary"
          onClick={() => setChecked(defaultChecked())}
        >
          Canvas提出状態にリセット
        </Button>
      </Row>

      {buckets.map((bucket) => {
        const group = visible.filter((it) => it.bucket === bucket);
        if (!group.length) return null;
        return (
          <Stack key={bucket} gap={10}>
            <H2>
              {BUCKET_LABEL[bucket]}{" "}
              <Text as="span" tone="secondary" size="small">
                ({group.length})
              </Text>
            </H2>
            {group.map((it) => {
              const done = isDone(it.id);
              return (
                <div key={it.id}>
                  <Card>
                    <CardHeader
                      trailing={
                        <Pill
                          tone={
                            done
                              ? "success"
                              : bucket === "overdue"
                                ? "warning"
                                : bucket === "today"
                                  ? "info"
                                  : "neutral"
                          }
                        >
                          {it.course}
                        </Pill>
                      }
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                        <Checkbox
                          checked={done}
                          onChange={(v) => toggle(it.id, v)}
                        />
                        <span
                          style={{
                            textDecoration: done ? "line-through" : "none",
                            opacity: done ? 0.65 : 1,
                          }}
                        >
                          {it.name}
                        </span>
                      </span>
                    </CardHeader>
                    <CardBody>
                      <Stack gap={8}>
                        <Row gap={10} style={{ flexWrap: "wrap" }}>
                          <Text size="small" weight="semibold">
                            Due {it.dueLabel} PT
                          </Text>
                          <Text size="small" tone="secondary">
                            {it.days < 0
                              ? `${Math.abs(it.days).toFixed(0)} 日超過`
                              : it.days < 1
                                ? "まもなく"
                                : `${it.days.toFixed(0)} 日後`}
                          </Text>
                          <Text size="small" tone="secondary">
                            {it.type}
                            {it.points != null ? ` · ${it.points} pts` : ""}
                            {it.submitted ? " · Canvas提出済" : ""}
                          </Text>
                        </Row>
                        <Row gap={12} style={{ flexWrap: "wrap" }}>
                          <Link href={it.html_url}>Canvas で開く</Link>
                          {it.local ? (
                            <Link href={it.local}>ローカル教材</Link>
                          ) : null}
                        </Row>
                      </Stack>
                    </CardBody>
                  </Card>
                </div>
              );
            })}
          </Stack>
        );
      })}

      <Divider />
      <Text size="small" tone="secondary">
        Source: SMC Canvas API (assignments + todo) · Kai Nozawa Fall 2026 ·
        再取得が必要ならチャットで「チェックリスト更新」と送ってください。
      </Text>
    </Stack>
  );
}
