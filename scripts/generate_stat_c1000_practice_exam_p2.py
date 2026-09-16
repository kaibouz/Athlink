#!/usr/bin/env python3
"""Generate STAT C1000 Exam 1 Practice Version P2 + answer key (new items)."""

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

pdfmetrics.registerFont(
    TTFont("ArialUnicode", "/System/Library/Fonts/Supplemental/Arial Unicode.ttf")
)

OUT_PRACTICE = Path("/Users/kainozawa/Desktop/STAT_C1000_Exam1_Practice_P2.pdf")
OUT_ANSWERS = Path("/Users/kainozawa/Desktop/STAT_C1000_Exam1_Practice_P2_Answers.pdf")
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
        title="STAT C1000 Exam 1 Practice P2",
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
    story.append(
        Paragraph("STAT C1000 / Math 54&nbsp;&nbsp;Fall 2026 (Practice)", s["header"])
    )
    story.append(Paragraph("Version P2", s["header"]))
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
        ("A", "The number of college courses you are enrolled in this semester."),
        (
            "B",
            "The time of day you usually wake up on weekdays, recorded in military "
            "(24-hour) time.",
        ),
        ("C", "The distance from your home to campus, measured in miles."),
        (
            "D",
            "Agreement with the statement “I feel prepared for exams,” rated on a "
            "scale from 1 (strongly disagree) to 5 (strongly agree).",
        ),
        (
            "E",
            "The time it takes you to finish a typical STAT homework assignment.",
        ),
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
            "California State University, Long Beach wants to know the true average "
            "amount of money their students spend on coffee and cafe drinks per week "
            "<b>by class standing</b> (freshman, sophomore, junior, senior). "
            "They break up the student body into class-standing groups using "
            "enrollment records and take a random sample from each class standing "
            "for a total of 250 students.",
            s["body"],
        )
    )
    story.append(Spacer(1, 8))

    q2 = [
        (
            "A",
            "What is the population parameter (proper symbol and description) of interest "
            "the university wants to estimate? (2 points each, 4 points total).",
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
        title="STAT C1000 Exam 1 Practice P2 — Answer Key",
        author="Practice Exam Answers",
    )
    story = []

    story.append(
        Paragraph("STAT C1000 — Exam 1 Practice Answer Key (Version P2)", s["ans_title"])
    )
    story.append(
        Paragraph(
            "Version P2 · Model answers (English) + brief notes (日本語 OK)",
            s["ans_header"],
        )
    )
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=0.5, color="#000000"))
    story.append(Spacer(1, 10))

    story.append(
        Paragraph("<b>Question 1 — Variable classification (7 pts each)</b>", s["ans"])
    )
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
            "number of college courses enrolled in this semester",
            "Quantitative · Discrete · Ratio",
            "科目数は数えられる整数。0科目は真のゼロ → discrete + ratio。",
        ),
        (
            "B",
            "usual weekday wake-up time (military / 24-hour clock)",
            "Quantitative · Continuous · Interval",
            "時刻（clock time）。差は意味あるが 0000 は「時間がない」ではない → interval。",
        ),
        (
            "C",
            "distance from home to campus (miles)",
            "Quantitative · Continuous · Ratio",
            "距離は測れる連続量。0マイルは真のゼロ、比も意味あり → continuous + ratio。",
        ),
        (
            "D",
            "Likert agreement rating (1–5) about feeling prepared for exams",
            "Qualitative · Ordinal · Ordinal",
            "リッカート尺度。順序はあるが間隔が等しいとは限らない → qualitative + ordinal。",
        ),
        (
            "E",
            "time to finish a typical STAT homework assignment",
            "Quantitative · Continuous · Ratio",
            "所要時間（duration）。0は本当のゼロ → continuous + ratio。"
            "Bの「起床時刻」と混同しない。",
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

    story.append(
        Paragraph(
            "<b>Question 2 — CSULB coffee spending by class standing (24 pts)</b>",
            s["ans"],
        )
    )
    story.append(Spacer(1, 4))

    story.append(
        Paragraph(
            "<b>A)</b> Parameter: <b>μ</b> = the true mean amount of money CSULB students "
            "spend on coffee and cafe drinks per week. "
            "(Symbol 2 pts + description 2 pts)",
            s["ans_item"],
        )
    )
    story.append(
        Paragraph(
            "注: 「true average」＝母平均 μ。by class standing なら各学年の μ でも可。"
            "x̄ と書かない。",
            s["ja"],
        )
    )

    story.append(
        Paragraph(
            "<b>B)</b> All California State University, Long Beach students "
            "(the entire CSULB student body). (2 pts)",
            s["ans_item"],
        )
    )
    story.append(
        Paragraph("注: 母集団は CSULB の全学生。標本の250人ではない。", s["ja"])
    )

    story.append(
        Paragraph(
            "<b>C)</b> Variable: amount of money spent on coffee/cafe drinks per week. "
            "Quantitative, continuous, <b>ratio</b> level of measurement. "
            "(Description 4 pts + type/level 4 pts)",
            s["ans_item"],
        )
    )
    story.append(
        Paragraph(
            "注: 金額は連続量で真のゼロあり → ratio。"
            "class standing は層分けの軸であり、関心変数ではない。",
            s["ja"],
        )
    )

    story.append(
        Paragraph(
            "<b>D)</b> Sample: 250 students. Sampling method: "
            "<b>stratified random sampling</b> (strata = class standing; random sample "
            "from <i>each</i> freshman/sophomore/junior/senior group). (3 pts)",
            s["ans_item"],
        )
    )
    story.append(
        Paragraph(
            "注: 学年で分けて各層からrandom = stratified。"
            "clusterなら「いくつかの学年を選んでその中を全部」になる。",
            s["ja"],
        )
    )

    story.append(
        Paragraph(
            "<b>E)</b> Statistic: <b>x̄</b> (sample mean weekly coffee/cafe spending). "
            "Calculate: x̄ = (sum of the 250 students’ weekly spending amounts) / 250. "
            "(Symbol 4 pts + calculation 3 pts)",
            s["ans_item"],
        )
    )
    story.append(
        Paragraph(
            "注: 統計量は標本から。学年別に出すなら各層内で x̄ を計算。",
            s["ja"],
        )
    )

    story.append(Spacer(1, 14))
    story.append(HRFlowable(width="100%", thickness=0.5, color="#000000"))
    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>Quick traps checklist</b>", s["ans"]))
    story.append(
        Paragraph(
            "• military / 24-hour clock time → Interval (not ratio)<br/>"
            "• Likert / agreement scales → Qualitative + Ordinal<br/>"
            "• counts of courses → Discrete + Ratio<br/>"
            "• distance / money / homework duration → Continuous + Ratio<br/>"
            "• break into groups, sample from <b>each</b> → Stratified (not cluster)",
            s["ans"],
        )
    )

    doc.build(story)


def main():
    OUT_PRACTICE.parent.mkdir(parents=True, exist_ok=True)
    build_practice(OUT_PRACTICE)
    build_answers(OUT_ANSWERS)

    mirror_p = MIRROR_DIR / "STAT_C1000_Exam1_Practice_P2.pdf"
    mirror_a = MIRROR_DIR / "STAT_C1000_Exam1_Practice_P2_Answers.pdf"
    mirror_p.write_bytes(OUT_PRACTICE.read_bytes())
    mirror_a.write_bytes(OUT_ANSWERS.read_bytes())

    for p in (OUT_PRACTICE, OUT_ANSWERS, mirror_p, mirror_a):
        size = p.stat().st_size
        assert size > 1000, f"PDF too small: {p} ({size} bytes)"
        print(f"OK {p} ({size} bytes)")


if __name__ == "__main__":
    main()
