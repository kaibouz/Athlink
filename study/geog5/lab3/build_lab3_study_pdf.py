#!/usr/bin/env python3
"""Build GEOG 5 Lab 3 Japanese study / 模倣例 PDF (not Quiz 3 answers)."""

from __future__ import annotations

from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

FONT = "ArialUnicode"
FONT_PATH = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"
pdfmetrics.registerFont(TTFont(FONT, FONT_PATH))

PAGE_W, PAGE_H = letter
MARGIN_L = 0.65 * inch
MARGIN_R = 0.65 * inch
MARGIN_T = 0.55 * inch
MARGIN_B = 0.55 * inch
CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R

INK = HexColor("#1a2332")
ACCENT = HexColor("#0b5f4b")
MUTED = HexColor("#4a5568")
BANNER = HexColor("#e8f5e6")
WARN_BG = HexColor("#fff4e5")
WARN_BORDER = HexColor("#c47a1a")
BOX_BG = HexColor("#f3f7f5")
BOX_BORDER = HexColor("#0b5f4b")
RULE = HexColor("#d0d7de")

OUT = Path(__file__).resolve().parent / "GEOG5_Lab3_Temperature_AirPressure_Study_模倣例.pdf"


def wrap_text(c: canvas.Canvas, text: str, font: str, size: float, max_w: float) -> list[str]:
    words = text.split(" ")
    # Japanese often has few spaces — also split on punctuation-ish long runs
    if len(words) == 1 and len(text) > 40:
        # character-based wrap for JP
        lines: list[str] = []
        buf = ""
        for ch in text:
            trial = buf + ch
            if c.stringWidth(trial, font, size) <= max_w:
                buf = trial
            else:
                if buf:
                    lines.append(buf)
                buf = ch
        if buf:
            lines.append(buf)
        return lines

    lines = []
    buf = ""
    for w in words:
        trial = w if not buf else f"{buf} {w}"
        if c.stringWidth(trial, font, size) <= max_w:
            buf = trial
        else:
            if buf:
                lines.append(buf)
            # if single word too long, force char wrap
            if c.stringWidth(w, font, size) > max_w:
                chunk = ""
                for ch in w:
                    t2 = chunk + ch
                    if c.stringWidth(t2, font, size) <= max_w:
                        chunk = t2
                    else:
                        lines.append(chunk)
                        chunk = ch
                buf = chunk
            else:
                buf = w
    if buf:
        lines.append(buf)
    return lines


class Doc:
    def __init__(self, path: Path):
        self.path = path
        self.c = canvas.Canvas(str(path), pagesize=letter)
        self.page = 1
        self.y = PAGE_H - MARGIN_T
        self._footer()

    def _footer(self):
        self.c.setFont(FONT, 8)
        self.c.setFillColor(MUTED)
        self.c.drawString(
            MARGIN_L,
            0.35 * inch,
            "GEOG 5 · Lab 3 study / 模倣例 · Fritschle · SMC Fall 2026 · NOT Quiz 3 answers",
        )
        self.c.drawRightString(PAGE_W - MARGIN_R, 0.35 * inch, f"{self.page}")

    def new_page(self):
        self.c.showPage()
        self.page += 1
        self.y = PAGE_H - MARGIN_T
        self._footer()

    def need(self, h: float):
        if self.y - h < MARGIN_B + 0.15 * inch:
            self.new_page()

    def rule(self):
        self.need(10)
        self.c.setStrokeColor(RULE)
        self.c.setLineWidth(0.6)
        self.c.line(MARGIN_L, self.y, PAGE_W - MARGIN_R, self.y)
        self.y -= 10

    def spacer(self, h: float = 8):
        self.y -= h

    def text(
        self,
        text: str,
        size: float = 10,
        color=INK,
        leading: float | None = None,
        indent: float = 0,
        bold_prefix: str | None = None,
    ):
        leading = leading or size + 3
        max_w = CONTENT_W - indent
        lines = wrap_text(self.c, text, FONT, size, max_w)
        for i, line in enumerate(lines):
            self.need(leading)
            self.c.setFillColor(color)
            self.c.setFont(FONT, size)
            x = MARGIN_L + indent
            if i == 0 and bold_prefix:
                self.c.setFillColor(ACCENT)
                self.c.drawString(x, self.y, bold_prefix)
                x += self.c.stringWidth(bold_prefix, FONT, size)
                self.c.setFillColor(color)
                self.c.drawString(x, self.y, line)
            else:
                self.c.drawString(x, self.y, line)
            self.y -= leading

    def heading(self, text: str, size: float = 14):
        self.need(size + 14)
        self.c.setFillColor(ACCENT)
        self.c.setFont(FONT, size)
        self.c.drawString(MARGIN_L, self.y, text)
        self.y -= size + 6

    def subhead(self, text: str):
        self.need(18)
        self.c.setFillColor(INK)
        self.c.setFont(FONT, 11)
        self.c.drawString(MARGIN_L, self.y, text)
        self.y -= 14

    def banner(self, lines: list[str], bg=BANNER, border=ACCENT):
        size = 9
        leading = 12
        pad = 8
        wrapped: list[str] = []
        for ln in lines:
            wrapped.extend(wrap_text(self.c, ln, FONT, size, CONTENT_W - 2 * pad))
        h = pad * 2 + leading * len(wrapped)
        self.need(h + 6)
        self.c.setFillColor(bg)
        self.c.setStrokeColor(border)
        self.c.setLineWidth(1)
        self.c.roundRect(MARGIN_L, self.y - h + 4, CONTENT_W, h, 4, fill=1, stroke=1)
        yy = self.y - pad + 2
        self.c.setFillColor(INK)
        self.c.setFont(FONT, size)
        for ln in wrapped:
            self.c.drawString(MARGIN_L + pad, yy - 2, ln)
            yy -= leading
        self.y -= h + 8

    def box(self, title: str, body_lines: list[str]):
        size = 9.5
        leading = 12.5
        pad = 8
        title_h = 14
        wrapped: list[str] = []
        for ln in body_lines:
            wrapped.extend(wrap_text(self.c, ln, FONT, size, CONTENT_W - 2 * pad))
        h = pad + title_h + leading * len(wrapped) + pad
        self.need(h + 6)
        self.c.setFillColor(BOX_BG)
        self.c.setStrokeColor(BOX_BORDER)
        self.c.setLineWidth(1.2)
        self.c.roundRect(MARGIN_L, self.y - h + 4, CONTENT_W, h, 5, fill=1, stroke=1)
        yy = self.y - pad
        self.c.setFillColor(ACCENT)
        self.c.setFont(FONT, 10)
        self.c.drawString(MARGIN_L + pad, yy - 2, title)
        yy -= title_h
        self.c.setFillColor(INK)
        self.c.setFont(FONT, size)
        for ln in wrapped:
            self.c.drawString(MARGIN_L + pad, yy - 2, ln)
            yy -= leading
        self.y -= h + 8

    def bullets(self, items: list[str], size: float = 9.5):
        for item in items:
            leading = size + 3
            prefix = "・"
            max_w = CONTENT_W - 14
            lines = wrap_text(self.c, item, FONT, size, max_w)
            for i, line in enumerate(lines):
                self.need(leading)
                self.c.setFillColor(INK)
                self.c.setFont(FONT, size)
                if i == 0:
                    self.c.drawString(MARGIN_L, self.y, prefix)
                    self.c.drawString(MARGIN_L + 12, self.y, line)
                else:
                    self.c.drawString(MARGIN_L + 12, self.y, line)
                self.y -= leading

    def save(self):
        self.c.save()


def build():
    d = Doc(OUT)

    # Title
    d.c.setFillColor(ACCENT)
    d.c.setFont(FONT, 16)
    d.c.drawString(MARGIN_L, d.y, "GEOG 5 · Lab 3 日本語スタディシート（模倣例）")
    d.y -= 20
    d.c.setFillColor(INK)
    d.c.setFont(FONT, 11)
    d.c.drawString(MARGIN_L, d.y, "Temperature and Air Pressure Patterns")
    d.y -= 14
    d.c.setFillColor(MUTED)
    d.c.setFont(FONT, 9)
    d.c.drawString(
        MARGIN_L,
        d.y,
        "Instructor: Joy Fritschle · Santa Monica College · Fall 2026",
    )
    d.y -= 12
    d.c.drawString(
        MARGIN_L,
        d.y,
        "Due with Quiz 3: Mon Sep 28, 12:45 PM · Canvas assignment ~2313643",
    )
    d.y -= 14
    d.rule()

    d.banner(
        [
            "【重要】これは Quiz 3 の提出用解答ではない。Lab の地図読み・推論スキルを練習する「模倣例（model worked examples）」です。",
            "Quiz は AI 禁止。この PDF をクイズにコピペしないこと。",
            "Canvas 上の正式 Lab 3 ワークシート（図・点数・文言）と照合して使うこと。本シートは Module 3 核心＋公開されている Lab 3 構成（旧タイトル: Reading Isoline Maps and Temperature-Air Pressure Patterns）に基づく。",
        ],
        bg=WARN_BG,
        border=WARN_BORDER,
    )

    d.heading("0. Lab の全体像（3 Parts）", 12)
    d.bullets(
        [
            "Part 1 — Isoline maps: isotherm（等温線）と isobar（等圧線）の読み方（Lab 2 の続き）",
            "Part 2 — Living Atlas（ArcGIS Online）: 空間データの探索",
            "Part 3 — 自分で選んだ地点の気温・気圧パターンを Jan / July 図から調べる",
        ]
    )
    d.spacer(4)
    d.text(
        "用語メモ: isoline=等値線 / isotherm=等温線 / isobar=等圧線 / gradient=傾度 / continentality=大陸度 / lapse rate=気温減率 / ITCZ=熱帯収束帯 / albedo=アルベド",
        size=8.5,
        color=MUTED,
    )
    d.spacer(6)

    d.heading("1. Lab 2 からの再利用ルール（必ず先に）", 12)
    d.bullets(
        [
            "同じ場の isoline 同士は交差しない",
            "間隔が狭い = 傾度が急（短距離で値が大きく変わる）",
            "値の変化は isoline に直角方向に読む（内挿＝interpolation）",
            "等温線が密 → 気温が急変 / 等圧線が密 → 気圧傾度が急 → 風が強い候補",
        ]
    )
    d.spacer(4)

    d.box(
        "模倣例 A — 間隔の読み方（方法）",
        [
            "地図上で地点 P と Q の間に isotherm が 3 本ある（間隔狭い）→ 「気温勾配が大きい」と書く。",
            "同じ緯度帯でも海岸付近で isobar が疎 → 「気圧傾度が緩い → 相対的に弱い風」と推論。",
            "提出文の型: 「○○が密／疎だから △△勾配が急／緩い。したがって…」",
        ],
    )

    d.heading("2. Part 1 模倣例 — Interpreting Isoline Maps", 12)
    d.subhead("2-1. 等高線プロファイル照合（contour → profile）")
    d.text(
        "Lab よくある導入: 平面の等高線セットを断面図（topographic profile）と対応させる。",
        size=9.5,
    )
    d.bullets(
        [
            "密な等高線 → 急斜面 / 疎 → なだらか",
            "閉じた輪＋内側が高い数値 → 丘・山 / 内側が低い → 盆地・窪地",
            "模倣推論: 「線間隔が最も狭い区間 = 断面の最も急な斜面」を先にマッチする",
        ]
    )
    d.spacer(4)

    d.subhead("2-2. 全球の平均気圧図（January / July）")
    d.text(
        "典型タスク: 図上の最高気圧・最低気圧の「場所（緯度・経度の目安）」と「値（mb）」を読む。",
        size=9.5,
    )
    d.box(
        "模倣例 B — 気圧の H/L を探す手順（Canvas の図で自分で数値を読む）",
        [
            "① 地図の凡例・ラベル付きの最大/最小値（または閉じた isobar の中心）を探す。",
            "② 「H」や高い mb の中心 = 高気圧、低い mb の中心 = 低気圧。",
            "③ 位置は「約 ○○°N/S, ○○°E/W」と書く（例: Santa Monica 形式 34°N, 118°W）。",
            "④ 季節ヒント: 北半球冬（Jan）は大陸が冷え → 大陸上に強い高気圧が出やすい。",
            "⑤ 夏（July）は大陸が熱くなり低圧化しやすい／海洋側の高圧が目立つことがある。",
            "※ 具体的な mb 数値は Canvas の Lab 図のラベルを優先。ここには提出用の確定値を書かない。",
        ],
    )

    d.subhead("2-3. 等温線と気温コントロール")
    d.text("気温図を見たら必ず「どの control が効いているか」を一文で言えるようにする。", size=9.5)
    d.bullets(
        [
            "latitude（緯度）: 低緯度ほど年平均 insolation 大 → 温暖",
            "land–water / continentality: 内陸は年較差・日較差が大きい／海岸は温和",
            "elevation + environmental lapse rate ≈ 6.5°C / 1000 m（高いほど寒い）",
            "ocean currents（暖流・寒流）: 同緯度でも海岸気温がずれる",
            "clouds / albedo: 高アルベド（雪・雲）は反射多 → 地表加熱が抑えられやすい",
        ]
    )
    d.box(
        "模倣例 C — Jan vs July 等温線の「曲がり」",
        [
            "観察: 北半球では isotherm が季節で南北に大きく振れ、南半球では比較的緯度に平行。",
            "理由: 北半球は陸地が多い → 大陸は温まりやすく冷えやすい（大陸度が高い）。",
            "冬: 大陸が海洋より寒い → 等温線が大陸上で赤道側へ寄る、などの記述ができる。",
            "夏: 大陸が海洋より暑い → 等温線が大陸上で極側へ寄る、など。",
            "最大年較差が出やすい地域の型: 高緯度の大陸内陸（例: 北東ユーラシア内陸）＝大陸度。",
        ],
    )

    d.heading("3. Module 3 核心チート（Lab 言語に直結）", 12)
    d.subhead("気温・エネルギー")
    d.bullets(
        [
            "Temperature ≠ heat（温度＝平均運動エネルギー／熱＝温度差によるエネルギーの移動）",
            "伝達: radiation / conduction / convection / advection（移流＝水平輸送）",
            "tropics 余剰・poles 不足 → 大気・海洋が熱を極向きに運ぶ（気圧・風へ橋渡し）",
        ]
    )
    d.subhead("気圧・風")
    d.bullets(
        [
            "風は常に high → low（pressure gradient force）。Coriolis は曲げるだけ（風を作らない）",
            "NH 右へ、SH 左へ。赤道では Coriolis ≈ 0",
            "地表 friction → 風が弱まり、isobar を横切る成分（低圧へ収束しやすい）",
            "ITCZ = 赤道付近の収束・上昇・低圧。亜熱帯高圧帯 ≈30° = 下降・乾燥",
            "三細胞: Hadley / Ferrel / Polar → trades / westerlies / polar easterlies",
        ]
    )
    d.box(
        "模倣例 D — 等圧線 → 風のストーリー（1問完結の型）",
        [
            "① 密な isobar 区間を指す → 「気圧傾度が急」。",
            "② 「気圧傾度力は高→低」。矢印の向きを先に決める。",
            "③ そのあと Coriolis（NH なら右へ）で曲がる、と書く。",
            "④ 地表なら friction でさらに isobar を横切ると一言添えると強い。",
        ],
    )

    d.heading("4. Part 2 模倣例 — Living Atlas（AGOL）", 12)
    d.text(
        "典型タスク: ArcGIS Online の Living Atlas を開き、気候・環境レイヤを見て「何が学べるか」を書く。",
        size=9.5,
    )
    d.box(
        "模倣例 E — 観察メモの型（提出の骨子）",
        [
            "開いたレイヤ例: 気温・降水量・標高・植生・人口など（実際に画面で確認した名前を書く）。",
            "学べること: 同じ現象を全球〜地域スケールで比較できる／時系列やテーマ別レイヤがある。",
            "地理学習への意味: 地図は「パターンを見つける道具」。仮説→レイヤで検証、の練習になる。",
            "注意: スクリーンショットやレイヤ名は自分のセッションで確認してから書く。",
        ],
    )

    d.heading("5. Part 3 模倣例 — 自分の地点（Santa Monica モデル）", 12)
    d.text(
        "課題の型: 好きな地点を選び、Part 1 の Jan/July 気温・気圧図を使ってその地点を読み解く。",
        size=9.5,
    )
    d.banner(
        [
            "以下は「書き方の見本」です。自分の提出では自分の地点・自分の観察に置き換えること。",
            "座標フォーマット例（講義指定）: Santa Monica is 34°N, 118°W",
        ]
    )
    d.box(
        "模倣例 F — Santa Monica（34°N, 118°W）",
        [
            "場所: Santa Monica, California · 約 34°N, 118°W（中緯度 midlatitudes）。",
            "地理: 北太平洋に面した西海岸。大陸西岸・海洋性（continentality が低い）で内陸より温和。",
            "気温の読み方: Jan 図で同緯度の内陸より温暖寄り／July でも極端な高温帯（砂漠内陸）より抑えめ、など図から比較。",
            "気圧・風: 亜熱帯高圧や沿岸の気圧配置を図で確認 → 風向は高→低＋Coriolis（NH）の手順で推測。",
            "結び: 「海洋の比熱が大きい → 気温の振れが小さい」＋「西海岸・寒流の影響も考えうる」と Module 3 語彙で締める。",
        ],
    )
    d.box(
        "対照模倣例 G — 内陸地点（例: ネバダ内陸や中央アジア内陸を想定）",
        [
            "同じ midlatitude でも continentality 高 → Jan はかなり低温、July は高温 → 年較差が大きい。",
            "等温線が季節で大きく南北シフトする理由を「陸は温まりやすく冷えやすい」で説明。",
            "海岸モデルと並べて書くと、採点者に「control を理解している」と伝わる。",
        ],
    )

    d.heading("6. 提出前チェックリスト", 12)
    d.bullets(
        [
            "Canvas の Lab 3 PDF/ページで図・問い番号・配点を確認した",
            "isotherm / isobar の語を混同していない",
            "気圧の答えに「場所 + 値（mb）」がセットである",
            "Part 3 の座標が 34°N, 118°W 形式",
            "「密＝急勾配」「高→低＋Coriolis」の一文が入っている",
            "Quiz 3 は別物（Temperature, Air Pressure, and Wind）— この模倣例をクイズに使わない",
        ]
    )
    d.spacer(8)
    d.rule()
    d.text("参考: Module 3 lecture cores（Desktop GEOG5-Study / study/geog5/lecture-site）· Lab 2 isoline 習慣", size=8, color=MUTED)
    d.text("生成: study/geog5/lab3 · 正式ワークシート未ダウンロード時は構成を公開ソース＋講義核心で再構成", size=8, color=MUTED)

    d.save()
    print(f"Wrote {OUT}")
    return OUT


if __name__ == "__main__":
    build()
