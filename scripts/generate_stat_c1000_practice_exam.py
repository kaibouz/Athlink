#!/usr/bin/env python3
"""Generate STAT C1000 Exam 1 practice + answer-key PDFs (Math 54 style)."""

from pathlib import Path

from reportlab.lib.pagesizes import letter as LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    HRFlowable,
    KeepTogether,
)

# Unicode font for Greek symbols + Japanese notes on the answer key
pdfmetrics.registerFont(
    TTFont("ArialUnicode", "/System/Library/Fonts/Supplemental/Arial Unicode.ttf")
)

OUT_PRACTICE = Path("/Users/kainozawa/Desktop/STAT_C1000_Exam1_Practice.pdf")
OUT_ANSWERS = Path("/Users/kainozawa/Desktop/STAT_C1000_Exam1_Practice_Answers.pdf")
MIRROR_DIR = Path("/Users/kainozawa/athlink")


def styles():
    base = getSampleStyleSheet()
    return {
        "header": ParagraphStyle(
            "ExamHeader",
            parent=base["Normal"],
            fontName="Times-Roman",
            fontSize=11,
            leading=14,
        ),
        "body": ParagraphStyle(
            "ExamBody",
            parent=base["Normal"],
            fontName="Times-Roman",
            fontSize=10.5,
            leading=14,
            spaceAfter=4,
        ),
        "item": ParagraphStyle(
            "ExamItem",
            parent=base["Normal"],
            fontName="Times-Roman",
            fontSize=10.5,
            leading=14,
            leftIndent=12,
            spaceBefore=8,
            spaceAfter=2,
        ),
        "blank": ParagraphStyle(
            "ExamBlank",
            parent=base["Normal"],
            fontName="Times-Roman",
            fontSize=10,
            leading=16,
            leftIndent=18,
            textColor="#333333",
        ),
        "title": ParagraphStyle(
            "ExamTitle",
            parent=base["Normal"],
            fontName="Times-Bold",
            fontSize=12,
            leading=15,
            spaceAfter=6,
        ),
        "ans": ParagraphStyle(
            "AnsBody",
            parent=base["Normal"],
            fontName="ArialUnicode",
            fontSize=10.5,
            leading=14,
            spaceAfter=3,
        ),
        "ans_item": ParagraphStyle(
            "AnsItem",
            parent=base["Normal"],
            fontName="ArialUnicode",
            fontSize=10.5,
            leading=14,
            leftIndent=10,
            spaceBefore=6,
        ),
        "ja": ParagraphStyle(
            "JaNote",
            parent=base["Normal"],
            fontName="ArialUnicode",
            fontSize=9,
            leading=12,
            leftIndent=14,
            textColor="#222222",
            spaceAfter=4,
        ),
        "ans_title": ParagraphStyle(
            "AnsTitle",
            parent=base["Normal"],
            fontName="ArialUnicode",
            fontSize=12,
            leading=15,
            spaceAfter=6,
        ),
        "ans_header": ParagraphStyle(
            "AnsHeader",
            parent=base["Normal"],
            fontName="ArialUnicode",
            fontSize=11,
            leading=14,
        ),
    }


def blank_lines(n=3):
    s = styles()["blank"]
    return [Paragraph("_" * 78, s) for _ in range(n)]


def build_practice(path: Path):
    s = styles()
    doc = SimpleDocTemplate(
        str(path),
        pagesize=LETTER,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.6 * inch,
        bottomMargin=0.6 * inch,
        title="STAT C1000 Exam 1 Practice",
        author="Practice Exam",
    )
    story = []

    story.append(
        Paragraph(
            "Mr. Martinez&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
            "Exam 1&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
            "Name: _______________________________",
            s["header"],
        )
    )
    story.append(Paragraph("STAT C1000 / Math 54&nbsp;&nbsp;Fall 2026 (Practice)", s["header"]))
    story.append(Paragraph("Version P1", s["header"]))
    story.append(Spacer(1, 8))
    story.append(
        Paragraph(
            "This is a closed book with no notes allowed exam. "
            "<b>PLEASE PRINT ALL ANSWERS.</b> Any answer that cannot be read will "
            "receive 0 points. Good Luck.",
            s["body"],
        )
    )
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=0.5, color="#000000"))
    story.append(Spacer(1, 10))

    story.append(
        Paragraph(
            "<b>1)</b> Answer each of the following (below) clearly and concisely. "
            "First identify the <b>variable of interest</b> (1 point), next state "
            "whether it is a <b>Qualitative</b> (categorical/attribute) variable or a "
            "<b>Quantitative</b> (numerical) variable (2 points), state whether it is "
            "<b>nominal, ordinal, discrete,</b> or <b>continuous</b> (2 points), "
            "lastly the <b>level of measurement</b> (2 points). "
            "<b>(7 points total each)</b>",
            s["body"],
        )
    )

    q1_items = [
        ("A", "The number of streaming apps you currently subscribe to."),
        ("B", "The time of day your first class begins, recorded in military (24-hour) time."),
        ("C", "How much your laptop weighs (in pounds)."),
        ("D", "Customer satisfaction ratings from one star to five stars."),
        ("E", "The time it takes you to walk from the parking lot to your classroom."),
    ]
    for letter, prompt in q1_items:
        block = [
            Paragraph(f"<b>{letter})</b> {prompt}", s["item"]),
            *blank_lines(3),
            Spacer(1, 4),
        ]
        story.append(KeepTogether(block))

    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=0.5, color="#000000"))
    story.append(Spacer(1, 10))

    story.append(
        Paragraph(
            "<b>2)</b> The following is a statistical experiment. Please read carefully, "
            "and then identify the parts indicated in parts A–E below.",
            s["body"],
        )
    )
    story.append(Spacer(1, 4))
    story.append(
        Paragraph(
            "Santa Monica College wants to know the true average number of hours "
            "their students spend working at a paid job per week <b>by major</b>. "
            "They break up the student body into majors using registration records "
            "and take a random sample from each major for a total of 300 students.",
            s["body"],
        )
    )
    story.append(Spacer(1, 8))

    q2 = [
        (
            "A",
            "What is the population parameter (proper symbol and description) of interest "
            "the college wants to estimate? (2 points each, 4 points total).",
            3,
        ),
        ("B", "Describe the targeted population. Be specific. (2 points)", 2),
        (
            "C",
            "Describe the variable of interest involved (4 points). What type of variable "
            "and level of measurement is it? (4 points).",
            4,
        ),
        ("D", "Describe the sample and which sampling method was utilized. (3 points)", 3),
        (
            "E",
            "What is the statistic including the proper symbol (4 points) and how would you "
            "calculate the statistic? (3 points)",
            4,
        ),
    ]
    for letter, prompt, blanks in q2:
        block = [
            Paragraph(f"<b>{letter})</b> {prompt}", s["item"]),
            *blank_lines(blanks),
            Spacer(1, 6),
        ]
        story.append(KeepTogether(block))

    story.append(Spacer(1, 16))
    story.append(
        Paragraph(
            "<i>End of Exam — Total: 59 points (Q1: 35 + Q2: 24)</i>",
            s["body"],
        )
    )

    doc.build(story)


def build_answers(path: Path):
    s = styles()
    doc = SimpleDocTemplate(
        str(path),
        pagesize=LETTER,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.6 * inch,
        bottomMargin=0.6 * inch,
        title="STAT C1000 Exam 1 Practice — Answer Key",
        author="Practice Exam Answers",
    )
    story = []

    story.append(Paragraph("STAT C1000 — Exam 1 Practice Answer Key", s["ans_title"]))
    story.append(
        Paragraph(
            "Version P1 · Model answers (English) + brief notes (日本語 OK)",
            s["ans_header"],
        )
    )
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=0.5, color="#000000"))
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>Question 1 — Variable classification (7 pts each)</b>", s["ans"]))
    story.append(
        Paragraph(
            "Write-up format: (1) variable · (2) Qual/Quant · (3) subtype · (4) level",
            s["ans"],
        )
    )
    story.append(Spacer(1, 4))

    answers_q1 = [
        (
            "A",
            "number of streaming-app subscriptions",
            "Quantitative · Discrete · Ratio",
            "数えられる個数。0は「契約なし」の真のゼロ → discrete + ratio。",
        ),
        (
            "B",
            "time of day first class begins (military / 24-hour clock)",
            "Quantitative · Continuous · Interval",
            "時刻。差は意味あるが「0:00」は「時間がない」ではない → interval（military time の罠）。",
        ),
        (
            "C",
            "laptop weight (pounds)",
            "Quantitative · Continuous · Ratio",
            "測れる量で真のゼロあり（0 lb = 重さなし）→ continuous + ratio。",
        ),
        (
            "D",
            "customer satisfaction star rating (1–5)",
            "Qualitative · Ordinal · Ordinal",
            "星は順序ラベル。数値に見えるがカテゴリ → qualitative + ordinal。",
        ),
        (
            "E",
            "walking time from parking lot to classroom",
            "Quantitative · Continuous · Ratio",
            "所要時間（duration）。0は本当のゼロ、比も意味あり → continuous + ratio。",
        ),
    ]
    for letter, var, cls, note in answers_q1:
        story.append(
            Paragraph(
                f"<b>{letter})</b> Variable: <i>{var}</i><br/>"
                f"&nbsp;&nbsp;&nbsp;&nbsp;{cls}",
                s["ans_item"],
            )
        )
        story.append(Paragraph(f"注: {note}", s["ja"]))

    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=0.5, color="#000000"))
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>Question 2 — SMC paid work hours by major (24 pts)</b>", s["ans"]))
    story.append(Spacer(1, 4))

    story.append(
        Paragraph(
            "<b>A)</b> Parameter: <b>μ</b> = the true mean number of hours SMC students "
            "spend working at a paid job per week. "
            "(Symbol 2 pts + description 2 pts)",
            s["ans_item"],
        )
    )
    story.append(
        Paragraph(
            "注: 「true average / true mean」なら母平均 μ。標本平均は x̄ なので混同しない。",
            s["ja"],
        )
    )

    story.append(
        Paragraph(
            "<b>B)</b> All Santa Monica College students "
            "(or: the entire SMC student body). (2 pts)",
            s["ans_item"],
        )
    )
    story.append(
        Paragraph("注: 対象母集団は「SMCの全学生」。標本の300人ではない。", s["ja"])
    )

    story.append(
        Paragraph(
            "<b>C)</b> Variable: number of hours spent working at a paid job per week. "
            "Quantitative, continuous, <b>ratio</b> level of measurement. "
            "(Description 4 pts + type/level 4 pts)",
            s["ans_item"],
        )
    )
    story.append(
        Paragraph(
            "注: 時間は測れる連続量。0時間は本当のゼロ → ratio。"
            "（major は層分けの軸であり、関心変数ではない）",
            s["ja"],
        )
    )

    story.append(
        Paragraph(
            "<b>D)</b> Sample: 300 students. Sampling method: "
            "<b>stratified random sampling</b> (strata = major; random sample from "
            "<i>each</i> major). (3 pts)",
            s["ans_item"],
        )
    )
    story.append(
        Paragraph(
            "注: majorで分けて各層からrandom = stratified。"
            "clusterなら「いくつかのmajorを選び、その中の全員」になる。",
            s["ja"],
        )
    )

    story.append(
        Paragraph(
            "<b>E)</b> Statistic: <b>x̄</b> (sample mean hours worked per week). "
            "Calculate: x̄ = (sum of the 300 students’ weekly paid-work hours) / 300. "
            "(Symbol 4 pts + calculation 3 pts)",
            s["ans_item"],
        )
    )
    story.append(
        Paragraph("注: 統計量は標本から計算。平均なら合計÷n。", s["ja"])
    )

    story.append(Spacer(1, 14))
    story.append(HRFlowable(width="100%", thickness=0.5, color="#000000"))
    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>Quick traps checklist</b>", s["ans"]))
    story.append(
        Paragraph(
            "• military / 24-hour clock time → Interval (not ratio)<br/>"
            "• star / Likert ratings → Qualitative + Ordinal<br/>"
            "• counts of things → Discrete + Ratio<br/>"
            "• weight / duration / money / hours worked → Continuous + Ratio<br/>"
            "• break into groups, sample from <b>each</b> → Stratified (not cluster)",
            s["ans"],
        )
    )

    doc.build(story)


def main():
    OUT_PRACTICE.parent.mkdir(parents=True, exist_ok=True)
    build_practice(OUT_PRACTICE)
    build_answers(OUT_ANSWERS)

    # Mirror into repo for convenience
    mirror_p = MIRROR_DIR / "STAT_C1000_Exam1_Practice.pdf"
    mirror_a = MIRROR_DIR / "STAT_C1000_Exam1_Practice_Answers.pdf"
    mirror_p.write_bytes(OUT_PRACTICE.read_bytes())
    mirror_a.write_bytes(OUT_ANSWERS.read_bytes())

    for p in (OUT_PRACTICE, OUT_ANSWERS, mirror_p, mirror_a):
        size = p.stat().st_size
        assert size > 1000, f"PDF too small: {p} ({size} bytes)"
        print(f"OK {p} ({size} bytes)")


if __name__ == "__main__":
    main()
