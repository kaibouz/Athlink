/**
 * Shared vocabularies for coach profiles and search filters. Ids are stored;
 * labels are looked up per locale.
 */
type Label = { en: string; ja: string; es: string };

export const POSITIONS: { id: string; label: Label }[] = [
  { id: "pitcher", label: { en: "Pitcher", ja: "投手", es: "Lanzador" } },
  { id: "catcher", label: { en: "Catcher", ja: "捕手", es: "Receptor" } },
  { id: "infield", label: { en: "Infield", ja: "内野手", es: "Cuadro interior" } },
  { id: "outfield", label: { en: "Outfield", ja: "外野手", es: "Jardines" } },
  { id: "hitting", label: { en: "Hitter (all positions)", ja: "打者（全ポジション）", es: "Bateo (todas)" } },
];

export const LEVELS: { id: string; label: Label }[] = [
  { id: "8u", label: { en: "8U", ja: "8歳以下", es: "8U" } },
  { id: "10u", label: { en: "10U", ja: "10歳以下", es: "10U" } },
  { id: "12u", label: { en: "12U", ja: "12歳以下", es: "12U" } },
  { id: "14u", label: { en: "14U", ja: "14歳以下", es: "14U" } },
  { id: "high_school", label: { en: "High school", ja: "高校生", es: "Preparatoria" } },
  { id: "college", label: { en: "College", ja: "大学生", es: "Universidad" } },
  { id: "adult", label: { en: "Adult", ja: "大人", es: "Adultos" } },
];

export function labelFor(list: { id: string; label: Label }[], id: string, locale: string): string {
  const item = list.find((x) => x.id === id);
  if (!item) return id;
  return item.label[(locale as keyof Label) in item.label ? (locale as keyof Label) : "en"];
}

/** Lesson time blocks a coach can open in the weekly availability editor. */
export const AVAILABILITY_BLOCKS: [string, string][] = [
  ["07:00", "08:00"], ["08:00", "09:00"], ["09:00", "10:00"], ["10:00", "11:00"],
  ["11:00", "12:00"], ["12:00", "13:00"], ["13:00", "14:00"], ["14:00", "15:00"],
  ["15:00", "16:00"], ["16:00", "17:00"], ["17:00", "18:00"], ["18:00", "19:00"],
  ["19:00", "20:00"], ["20:00", "21:00"],
];

export const ONLINE_LOCATION = "online";
