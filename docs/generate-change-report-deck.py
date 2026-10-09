#!/usr/bin/env python3
"""Build the AthlinkPro change-report deck (16:9 PDF), JA + EN.

Palette and type mirror the mobile-concept design tokens so the deck reads as
part of the product rather than a generic report.

    python3 docs/generate-change-report-deck.py          # both languages
    python3 docs/generate-change-report-deck.py ja       # one language
"""

import sys

from reportlab.lib.colors import HexColor
from reportlab.lib.utils import simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont
from reportlab.pdfgen import canvas

W, H = 960.0, 540.0
MARGIN = 64.0

# --- design tokens (src/styles/mobile-concept.css) ---
BG = HexColor("#05070c")
PANEL = HexColor("#0b0f1a")
PANEL2 = HexColor("#10162a")
TEXT = HexColor("#f5f7fa")
DIM = HexColor("#9aa3b2")
DIMMER = HexColor("#7b8494")
BLUE = HexColor("#3b6ef6")
CYAN = HexColor("#22c7e0")
GREEN = HexColor("#3ddc97")
AMBER = HexColor("#f5a623")
RED = HexColor("#ff5f6d")
LINE = HexColor("#1b2233")

JP = "HeiseiKakuGo-W5"
EN = "Helvetica"
ENB = "Helvetica-Bold"


COPY = {
    "ja": {
        "out": "docs/AthlinkPro-Change-Report-JA.pdf",
        "doc_title": "AthlinkPro — 改善レポート",
        "footer": "AthlinkPro · 改善レポート",
        "date": "2026年9月",
        "cover_title": "プラットフォーム改善レポート",
        "cover_sub": "アプリ仕様への統一と、致命的な導線バグの解消",
        "cover_chips": ["認証・導線", "サイト構造", "デザイン統一", "機能差分の解消"],
        "s_summary": ("SUMMARY", "今回の成果"),
        "summary_lead": (
            "アプリのコンセプト仕様（全12画面）とWeb版を突き合わせ、仕様差分と実害のあるバグを解消しました。"
            "特に「登録できたのにログインできない」という致命的な導線破綻を根本から修正しています。"
        ),
        "summary_cards": [
            ("認証導線の破綻を解消", "登録とログインが別システムに繋がっていた構造を Clerk に一本化"),
            ("サイト構造を1つに統合", "4段階だった登録導線を2段階に短縮"),
            ("配色をアプリ仕様に統一", "黄色の除去・青系テキストの階調整理・コントラスト改善"),
            ("機能差分の解消", "ナビ構成・ポジション判定・地図表示・集計軸・多言語化"),
        ],
        "s_problem": ("PROBLEM 01", "登録とログインが別々の認証に繋がっていた"),
        "p_left_label": "登録の導線",
        "p_left_a": "/join/athlete のウィザード",
        "p_left_b": "→ 独自パスワード認証で users に保存",
        "p_left_chip": "clerk_id = NULL",
        "p_right_label": "ログインの導線",
        "p_right_a": "ヘッダー「Log in」→ /sign-in",
        "p_right_b": "→ Clerk が認証を担当",
        "p_right_chip": "該当アカウントが存在しない",
        "p_result": "結果",
        "p_result_body": (
            "正しいメールアドレスとパスワードを入力しても必ずログインを拒否される。"
            "Clerk 側で登録した場合は逆に users テーブルへ一切保存されない。"
        ),
        "p_evidence": "ローカルDBで再現し、clerk_id が NULL であることを確認済み",
        "s_fix_auth": ("FIX 01", "Clerk に一本化し、旧認証を撤去"),
        "th": ("対象", "変更前", "変更後"),
        "fix_rows": [
            ("登録ウィザード", "自前のメール/パスワード入力", "Clerk へ受け渡し、完了後ウィザードに復帰"),
            ("認証ページ", "redirect_url を無視し常に /app へ", "戻り先を尊重（オープンリダイレクト対策付き）"),
            ("旧エンドポイント", "/api/auth/login・signup が稼働", "削除。影響する実ユーザーが無いことをDBで確認"),
            ("セッション優先度", "古い cookie が Clerk を30日間隠す", "cookie 優先は管理者のみに限定"),
            ("失敗時の挙動", "503時に他人のデモアカウントで成立", "偽ユーザー生成を削除し、正直にエラーを返す"),
        ],
        "s_site": ("FIX 02", "メインサイトを1つに統合"),
        "before_label": "変更前 — 4段階",
        "after_label": "変更後 — 2段階",
        "steps_before": ["/ (HQ)", "/get-started", "役割別LP", "ウィザード"],
        "steps_after": ["/ で役割選択", "Clerk サインアップ → プロフィール作成"],
        "site_also": "あわせて実施",
        "site_also_lines": [
            "・/get-started・/join・/for-athletes・/for-coaches を / へリダイレクト統合（リンク切れ防止）",
            "・到達不能になったLPコンポーネント群を削除 — 約3,800行",
            "・アプリ紹介スライドをメインサイト下部へ移設し、ウィザードのツアー工程を廃止",
        ],
        "s_design": ("FIX 03", "配色をアプリのトークンに統一"),
        "design_bullets": [
            (
                "黄色の出どころ",
                "アプリでは --clay-1/-2 が青→シアンなのに対し、Web側が同じ変数を金色 (#e0a458 / #f2c94c) で上書きしていました。"
                "アプリ準拠に戻し、付随する金色の影・グロー・管理画面のグラデーションも一掃。",
            ),
            (
                "何種類もある青いテキスト",
                "ダークテーマで --brand-600 と --brand-700 が両方シアン、--brand-500 が青。本文（118箇所）がシアンで表示されていました。"
                "brand-600 が「本文色」と「主要ボタン背景」を兼ねており両立できないため、背景用途84箇所を専用の accent トークンへ分離。",
            ),
            (
                "コントラスト改善",
                "--mx-dimmer にライトモード用の値が入っており、暗背景で 3.0:1（WCAG AA 未達）。デッキのダーク値に修正し 4.6:1 へ。",
            ),
        ],
        "s_ui": ("FIX 04", "UI刷新とサブスク訴求"),
        "ui_cols": [
            ("3Dボタン", "ベベルではなく光と物理で奥行きを表現。上端の鏡面、面を横切る光沢、ブランド色の2段影、押下時は内側の陰影に切り替えて沈み込ませる。"),
            ("ページ遷移演出", "ルート変更時に淡いアクセント光が画面を流れる。強すぎたため不透明度を 1.0 → 0.38、ぼかしを 18px → 34px に調整。"),
            ("サブスク訴求", "How AthlinkPro Works の各ステップに Pro 解放行を追加し、Free→Pro の対比バンドを新設。内容は platform-plans.ts から読むため実装と乖離しない。"),
        ],
        "ui_a11y": "アクセシビリティ",
        "ui_a11y_body": "prefers-reduced-motion 設定時はボタンの動き・光沢・遷移フラッシュをすべて無効化。キーボード操作向けの focus リングも追加。",
        "s_bug": ("BUG FIX", "サイドバーが画面に固定されていなかった"),
        "bug_lead": (
            "ページ遷移アニメーションが animation-fill-mode: both で終了後も transform / filter を保持していました。"
            "transform を持つ要素は position: fixed の包含ブロックになるため、サイドバーの基準がビューポートから外れていました。"
        ),
        "bug_before_note": "文書全体の高さに伸び、背景が途中で途切れて継ぎ目が発生。スクロールでも固定されない。",
        "bug_after_note": "ビューポート高さと一致。スクロールしても正しく固定される。",
        "bug_fix_label": "対応",
        "bug_fix_body": (
            "アニメーションを2層に分離。ページ全体は opacity のみとし、スライドの動きは fixed 配置の子孫を持たない "
            ".app-canvas 側へ移動。見た目の動きは変えずにレイアウトだけを正した。"
        ),
        "s_gaps": ("FIX 05", "アプリ仕様との機能差分を解消"),
        "gaps": [
            ("コーチのナビ構成", "3番目が Scout だったのをデッキ通り Athletes（担当選手）へ。コーチの中核が主導線から外れていた。"),
            ("ポジション判定のバグ", "includes(\"P\") を先頭で判定していたため「Shortstop」で投手の目標が返っていた。チップ選択化し完全一致を優先。"),
            ("コーチ一覧の地図表示", "地域別のコーチ件数チップ付き地図ビューを追加。リストと同じ行コンポーネントを再利用。"),
            ("集計軸の統一", "コーチTodayを「今週の収益 / 未読」へ、Homeの2枚目を「月間セッション消化数」へ。"),
            ("強化ポイントの選択", "「今、何に取り組んでいますか？」を追加。既存の SPECIALTIES を使いコーチ検索と同じ語彙に。"),
            ("オンボーディング統合", "5ステップ → 4ステップ（Clerk経由なら実質3）。デッキの1画面構成に合わせて統合。"),
            ("多言語化", "アプリ画面に英語のハードコードが46箇所。英・日・西の3言語で整備。"),
        ],
        "s_quality": ("QUALITY", "品質と検証"),
        "stats": [
            ("ビルド", "成功", "本番ビルド通過"),
            ("型チェック", "エラー 0", "tsc --noEmit"),
            ("Lint", "増加 0", "既存29件から増やさず"),
            ("対応言語", "3", "英語・日本語・スペイン語"),
        ],
        "q_method": "検証方法",
        "q_method_body": (
            "実際のローカル環境（PostgreSQL + Clerk）でブラウザから画面を操作して確認。"
            "認証バグはDBの行を直接照会して再現・修正を確認しました。なお実アカウントの新規作成は行っていないため、"
            "登録からログインまでの通しテストはご確認をお願いします。"
        ),
        "s_next": ("NEXT", "残課題と次のステップ"),
        "next_items": [
            ("本番DBのマイグレーション", "athlete_profiles に focus_areas (jsonb, nullable) を追加済み。本番へは npm run db:push が必要。", "amber"),
            ("登録〜ログインの通しテスト", "実アカウント作成は未実施。/ から登録 → ログアウト → 再ログインの確認をお願いします。", "amber"),
            ("最新コンセプトの反映", "最新版HTMLは macOS の保護により読み取れず、旧版を基準にしています。差分があれば再調整します。", "dim"),
            ("コミット", "全変更は未コミット。区切りが良ければブランチにまとめます。", "dim"),
        ],
    },
    "en": {
        "out": "docs/AthlinkPro-Change-Report-EN.pdf",
        "doc_title": "AthlinkPro — Change Report",
        "footer": "AthlinkPro · Change Report",
        "date": "September 2026",
        "cover_title": "Platform Change Report",
        "cover_sub": "Aligning the web to the app spec, and fixing a broken signup path",
        "cover_chips": ["Auth & funnel", "Site structure", "Design parity", "Feature gaps"],
        "s_summary": ("SUMMARY", "What shipped"),
        "summary_lead": (
            "We audited the web build against all 12 screens of the app concept and closed both the spec gaps "
            "and the bugs doing real damage — above all a signup path where members could register and then "
            "never log in."
        ),
        "summary_cards": [
            ("Fixed the broken signup path", "Sign-up and sign-in ran on two different auth systems; now unified on Clerk"),
            ("Collapsed to one main site", "The registration funnel went from four steps to two"),
            ("Matched the app's palette", "Removed the gold, untangled the blue text ramp, fixed contrast"),
            ("Closed feature gaps", "Navigation, position matching, map view, metric framing, localization"),
        ],
        "s_problem": ("PROBLEM 01", "Sign-up and sign-in ran on different auth systems"),
        "p_left_label": "Registration path",
        "p_left_a": "The /join/athlete wizard",
        "p_left_b": "→ wrote to users via the legacy password auth",
        "p_left_chip": "clerk_id = NULL",
        "p_right_label": "Sign-in path",
        "p_right_a": "Header \"Log in\" → /sign-in",
        "p_right_b": "→ Clerk handles authentication",
        "p_right_chip": "No such account exists",
        "p_result": "Result",
        "p_result_body": (
            "Correct credentials were rejected every time. Register through Clerk instead and nothing was "
            "written to the users table at all."
        ),
        "p_evidence": "Reproduced against the local database; confirmed clerk_id was NULL",
        "s_fix_auth": ("FIX 01", "Unified on Clerk, retired the legacy path"),
        "th": ("Area", "Before", "After"),
        "fix_rows": [
            ("Registration wizard", "Its own email / password form", "Hands off to Clerk, then resumes the wizard"),
            ("Auth pages", "Ignored redirect_url, always went to /app", "Honors the return path, with open-redirect guarding"),
            ("Legacy endpoints", "/api/auth/login and signup were live", "Removed — verified in the DB that no real user relied on them"),
            ("Session precedence", "A stale cookie shadowed Clerk for 30 days", "Cookie now wins for executives only"),
            ("Failure behavior", "A 503 signed you in as a seeded demo account", "Fabricated users removed; errors surface honestly"),
        ],
        "s_site": ("FIX 02", "One main site"),
        "before_label": "Before — four steps",
        "after_label": "After — two steps",
        "steps_before": ["/ (HQ)", "/get-started", "Role landing page", "Wizard"],
        "steps_after": ["Pick a side on /", "Clerk sign-up → profile setup"],
        "site_also": "Also done",
        "site_also_lines": [
            "· /get-started, /join, /for-athletes and /for-coaches now redirect to / so no link breaks",
            "· Removed the landing components that became unreachable — about 3,800 lines",
            "· Moved the app walkthrough into the main site and dropped the wizard's tour step",
        ],
        "s_design": ("FIX 03", "Palette matched to the app tokens"),
        "design_bullets": [
            (
                "Where the gold came from",
                "In the app, --clay-1/-2 is blue → cyan. The web overrode the same variables with gold "
                "(#e0a458 / #f2c94c). Restored to the app values and cleared the gold shadows, glows and admin gradients that followed from it.",
            ),
            (
                "Too many different blues in text",
                "In dark mode --brand-600 and --brand-700 were both cyan and --brand-500 was blue, so body copy (118 sites) rendered cyan. "
                "brand-600 served as both body color and primary button background, which cannot both hold, so the 84 background uses moved to a dedicated accent token.",
            ),
            (
                "Contrast",
                "--mx-dimmer held the light-mode value, giving 3.0:1 on dark panels — below WCAG AA. Corrected to the deck's dark value at 4.6:1.",
            ),
        ],
        "s_ui": ("FIX 04", "UI refresh and subscription story"),
        "ui_cols": [
            ("Dimensional buttons", "Depth from light and physics rather than bevels: a lit top edge, a sheen crossing the face, two-stage brand shadows, and a press that sinks into its own shadow."),
            ("Route transition", "A soft accent sweep on navigation. It read too strong, so peak opacity went 1.0 → 0.38 and blur 18px → 34px."),
            ("Subscription story", "Each step of How AthlinkPro Works now carries a Pro unlock line, with a Free → Pro band below. It reads from platform-plans.ts so copy cannot drift from the product."),
        ],
        "ui_a11y": "Accessibility",
        "ui_a11y_body": "Under prefers-reduced-motion the button travel, sheen and transition flash are all disabled. Focus rings added for keyboard use.",
        "s_bug": ("BUG FIX", "The sidebar was not pinned to the viewport"),
        "bug_lead": (
            "The route transition used animation-fill-mode: both, so transform and filter stayed applied after it finished. "
            "An element with a transform becomes the containing block for position: fixed, which detached the sidebar from the viewport."
        ),
        "bug_before_note": "Stretched to document height, leaving a visible seam where the background ran out — and it did not stay put when scrolling.",
        "bug_after_note": "Matches the viewport height and stays pinned while scrolling.",
        "bug_fix_label": "The fix",
        "bug_fix_body": (
            "Split the animation in two. The page wrapper animates opacity only; the travel moved to .app-canvas, "
            "which holds no fixed-position descendants. The motion looks the same — only the layout is now correct."
        ),
        "s_gaps": ("FIX 05", "Closed the gaps against the app spec"),
        "gaps": [
            ("Coach navigation", "The third tab was Scout; the deck has Athletes. A coach's roster had been pushed out of the primary rail."),
            ("Position matching bug", "includes(\"P\") ran first, so typing \"Shortstop\" returned pitcher goals. Now chip-selected with exact matching."),
            ("Map view for coaches", "Added a map with per-region coach counts, reusing the same row component as the list."),
            ("Metric framing", "Coach Today now shows this week's earnings and unread; Home's second tile is sessions completed this month."),
            ("Focus areas", "Added \"What are you working on?\", using the existing SPECIALTIES so it shares vocabulary with coach search."),
            ("Onboarding", "Five steps → four (three in practice via Clerk), matching the deck's single profile screen."),
            ("Localization", "46 hardcoded English strings in the app screens, now covered in English, Japanese and Spanish."),
        ],
        "s_quality": ("QUALITY", "Verification"),
        "stats": [
            ("Build", "Passing", "Production build"),
            ("Type check", "0 errors", "tsc --noEmit"),
            ("Lint", "+0", "No increase over the existing 29"),
            ("Languages", "3", "English, Japanese, Spanish"),
        ],
        "q_method": "How it was verified",
        "q_method_body": (
            "Driven through a browser against the real local environment (PostgreSQL + Clerk). The auth bug was "
            "reproduced and the fix confirmed by querying the database directly. No real account was created, so "
            "the end-to-end register → sign-in run is left for you to confirm."
        ),
        "s_next": ("NEXT", "Open items"),
        "next_items": [
            ("Production migration", "focus_areas (jsonb, nullable) was added to athlete_profiles. Production needs npm run db:push.", "amber"),
            ("End-to-end auth test", "No real account was created. Please register from /, sign out, and sign back in.", "amber"),
            ("Latest concept file", "The newest HTML could not be read (macOS protects ~/Library/Messages), so the older copy was the reference.", "dim"),
            ("Commit", "Nothing is committed yet. Happy to gather it onto a branch.", "dim"),
        ],
    },
}

COLOR_BY_NAME = {"amber": AMBER, "dim": DIM}


def has_jp(s: str) -> bool:
    return any(
        "぀" <= ch <= "ヿ" or "一" <= ch <= "鿿" or "＀" <= ch <= "￯"
        for ch in s
    )


def font_for(s: str, bold: bool = False) -> str:
    if has_jp(s):
        return JP
    return ENB if bold else EN


class Deck:
    def __init__(self, path: str, copy: dict):
        pdfmetrics.registerFont(UnicodeCIDFont(JP))
        self.c = canvas.Canvas(path, pagesize=(W, H))
        self.c.setTitle(copy["doc_title"])
        self.c.setAuthor("AthlinkPro")
        self.c.setSubject("Platform change report")
        self.copy = copy
        self.page_no = 0

    def text(self, x, y, s, size=14, color=TEXT, bold=False, font=None):
        self.c.setFillColor(color)
        self.c.setFont(font or font_for(s, bold), size)
        self.c.drawString(x, y, s)

    def wrapped(self, x, y, s, size=13, color=DIM, width=W - 2 * MARGIN, leading=None, bold=False):
        f = font_for(s, bold)
        leading = leading or size * 1.65
        self.c.setFillColor(color)
        self.c.setFont(f, size)
        for line in simpleSplit(s, f, size, width):
            self.c.drawString(x, y, line)
            y -= leading
        return y

    def panel(self, x, y, w, h, fill=PANEL, radius=14, stroke=LINE):
        self.c.setFillColor(fill)
        self.c.setStrokeColor(stroke)
        self.c.setLineWidth(1)
        self.c.roundRect(x, y, w, h, radius, stroke=1, fill=1)

    def accent_rule(self, x, y, w=120, h=3):
        steps = 48
        for i in range(steps):
            t = i / (steps - 1)
            self.c.setFillColorRGB(
                (0x3B + (0x22 - 0x3B) * t) / 255,
                (0x6E + (0xC7 - 0x6E) * t) / 255,
                (0xF6 + (0xE0 - 0xF6) * t) / 255,
            )
            self.c.rect(x + w * i / steps, y, w / steps + 0.6, h, stroke=0, fill=1)

    def chip(self, x, y, label, color=CYAN, pad=9, size=9.5):
        f = font_for(label, True)
        tw = pdfmetrics.stringWidth(label, f, size)
        self.c.setFillColor(PANEL2)
        self.c.setStrokeColor(color)
        self.c.setLineWidth(0.8)
        self.c.roundRect(x, y - 4, tw + pad * 2, 20, 10, stroke=1, fill=1)
        self.c.setFillColor(color)
        self.c.setFont(f, size)
        self.c.drawString(x + pad, y + 2, label)
        return x + tw + pad * 2 + 8

    def start(self, label=None, title=None, cover=False):
        self.page_no += 1
        self.c.setFillColor(BG)
        self.c.rect(0, 0, W, H, stroke=0, fill=1)
        if cover:
            return H - 200
        y = H - 78
        if label:
            self.text(MARGIN, y, label, size=10.5, color=CYAN, bold=True, font=ENB)
            self.accent_rule(MARGIN, y - 12)
            y -= 42
        if title:
            self.text(MARGIN, y, title, size=27, color=TEXT, bold=True)
            y -= 34
        return y

    def end(self, footer=None):
        self.c.setStrokeColor(LINE)
        self.c.setLineWidth(1)
        self.c.line(MARGIN, 44, W - MARGIN, 44)
        if footer != "":
            self.text(MARGIN, 28, footer or self.copy["footer"], size=8.5, color=DIMMER)
        self.c.setFont(EN, 8.5)
        self.c.setFillColor(DIMMER)
        self.c.drawRightString(W - MARGIN, 28, str(self.page_no))
        self.c.showPage()

    def save(self):
        self.c.save()


def bullet(d: Deck, x, y, head, body, color=CYAN, width=790):
    d.c.setFillColor(color)
    d.c.circle(x + 3, y + 4, 3, stroke=0, fill=1)
    d.text(x + 16, y, head, size=13.5, color=TEXT, bold=True)
    y -= 19
    y = d.wrapped(x + 16, y, body, size=11, color=DIM, width=width)
    return y - 8


# ---------------------------------------------------------------- slides


def cover(d: Deck):
    C = d.copy
    d.start(cover=True)
    for i in range(26):
        t = i / 25
        d.c.setFillColorRGB(0x22 / 255, 0xC7 / 255, 0xE0 / 255, alpha=0.020 * (1 - t))
        d.c.circle(W - 150, H - 90, 60 + i * 13, stroke=0, fill=1)

    d.text(MARGIN, H - 150, "ATHLINKPRO", size=13, color=CYAN, bold=True, font=ENB)
    d.accent_rule(MARGIN, H - 166, w=160, h=4)
    d.text(MARGIN, H - 236, C["cover_title"], size=38, color=TEXT, bold=True)
    d.wrapped(MARGIN, H - 278, C["cover_sub"], size=15, color=DIM, width=680)

    x = MARGIN
    for label in C["cover_chips"]:
        x = d.chip(x, H - 348, label)
    d.text(W - MARGIN - 200, 92, C["date"], size=11, color=DIMMER)
    d.end(footer="")


def summary(d: Deck):
    C = d.copy
    y = d.start(*C["s_summary"])
    d.wrapped(MARGIN, y, C["summary_lead"], size=12.5, color=DIM, width=W - 2 * MARGIN)

    cols = [BLUE, CYAN, GREEN, AMBER]
    cw = (W - 2 * MARGIN - 3 * 18) / 4
    cy = 140
    for i, (title, body) in enumerate(C["summary_cards"]):
        x = MARGIN + i * (cw + 18)
        d.panel(x, cy, cw, 210)
        d.c.setFillColor(cols[i])
        d.c.roundRect(x + 18, cy + 182, 34, 4, 2, stroke=0, fill=1)
        ty = d.wrapped(x + 18, cy + 156, title, size=13, color=TEXT, width=cw - 36, bold=True)
        d.wrapped(x + 18, ty - 6, body, size=10, color=DIM, width=cw - 36)
    d.end()


def problem_auth(d: Deck):
    C = d.copy
    d.start(*C["s_problem"])

    d.panel(MARGIN, 250, 390, 150)
    d.text(MARGIN + 20, 372, C["p_left_label"], size=12, color=DIMMER, bold=True)
    d.wrapped(MARGIN + 20, 348, C["p_left_a"], size=12.5, color=TEXT, width=350)
    d.wrapped(MARGIN + 20, 322, C["p_left_b"], size=11, color=DIM, width=350)
    d.chip(MARGIN + 20, 270, C["p_left_chip"], color=RED)

    d.text(MARGIN + 410, 320, "=/=", size=22, color=RED, bold=True, font=ENB)

    d.panel(MARGIN + 462, 250, 390, 150)
    d.text(MARGIN + 482, 372, C["p_right_label"], size=12, color=DIMMER, bold=True)
    d.wrapped(MARGIN + 482, 348, C["p_right_a"], size=12.5, color=TEXT, width=350)
    d.wrapped(MARGIN + 482, 322, C["p_right_b"], size=11, color=DIM, width=350)
    d.chip(MARGIN + 482, 270, C["p_right_chip"], color=RED)

    d.panel(MARGIN, 112, W - 2 * MARGIN, 112, fill=PANEL2)
    d.text(MARGIN + 22, 192, C["p_result"], size=11, color=AMBER, bold=True)
    d.wrapped(MARGIN + 22, 168, C["p_result_body"], size=12, color=TEXT, width=W - 2 * MARGIN - 44)
    d.text(MARGIN + 22, 128, C["p_evidence"], size=10, color=DIMMER)
    d.end()


def fix_auth(d: Deck):
    C = d.copy
    d.start(*C["s_fix_auth"])
    y = 380
    d.text(MARGIN + 16, y + 26, C["th"][0], size=10, color=DIMMER, bold=True)
    d.text(MARGIN + 190, y + 26, C["th"][1], size=10, color=DIMMER, bold=True)
    d.text(MARGIN + 505, y + 26, C["th"][2], size=10, color=DIMMER, bold=True)
    for i, (k, before, after) in enumerate(C["fix_rows"]):
        ry = y - i * 58
        d.panel(MARGIN, ry - 30, W - 2 * MARGIN, 50, fill=PANEL if i % 2 == 0 else PANEL2, radius=10)
        d.wrapped(MARGIN + 16, ry + 2, k, size=11, color=TEXT, width=165, bold=True)
        d.wrapped(MARGIN + 190, ry + 2, before, size=10, color=DIM, width=300)
        d.wrapped(MARGIN + 505, ry + 2, after, size=10, color=GREEN, width=335)
    d.end()


def site_structure(d: Deck):
    C = d.copy
    y = d.start(*C["s_site"])

    d.text(MARGIN, y - 4, C["before_label"], size=12, color=DIMMER, bold=True)
    x = MARGIN
    for i, s in enumerate(C["steps_before"]):
        d.panel(x, y - 80, 172, 56, radius=10)
        d.wrapped(x + 14, y - 46, s, size=11, color=TEXT, width=148)
        if i < len(C["steps_before"]) - 1:
            d.text(x + 180, y - 56, "->", size=13, color=DIMMER, font=EN)
        x += 200

    y2 = y - 142
    d.text(MARGIN, y2, C["after_label"], size=12, color=CYAN, bold=True)
    x = MARGIN
    for i, s in enumerate(C["steps_after"]):
        wpx = 230 if i == 0 else 400
        d.panel(x, y2 - 80, wpx, 56, fill=PANEL2, radius=10, stroke=CYAN)
        d.wrapped(x + 14, y2 - 46, s, size=11, color=TEXT, width=wpx - 28)
        if i == 0:
            d.text(x + wpx + 8, y2 - 56, "->", size=13, color=CYAN, font=EN)
        x += wpx + 34

    d.panel(MARGIN, 88, W - 2 * MARGIN, 124, fill=PANEL)
    d.text(MARGIN + 22, 182, C["site_also"], size=11, color=CYAN, bold=True)
    yy = 158
    for line in C["site_also_lines"]:
        yy = d.wrapped(MARGIN + 22, yy, line, size=11, color=DIM, width=W - 2 * MARGIN - 44)
    d.end()


def design_unify(d: Deck):
    C = d.copy
    y = d.start(*C["s_design"])
    cols = [CYAN, BLUE, GREEN]
    for i, (head, body) in enumerate(C["design_bullets"]):
        y = bullet(d, MARGIN, y - 6, head, body, color=cols[i])

    sw = [("#05070c", "bg"), ("#0b0f1a", "panel"), ("#f5f7fa", "text"),
          ("#9aa3b2", "dim"), ("#3b6ef6", "accent"), ("#22c7e0", "accent-2")]
    x = MARGIN
    for hexv, name in sw:
        d.c.setFillColor(HexColor(hexv))
        d.c.setStrokeColor(LINE)
        d.c.roundRect(x, 92, 118, 44, 8, stroke=1, fill=1)
        d.text(x, 76, name, size=8.5, color=DIMMER, font=EN)
        d.text(x + 46, 76, hexv, size=8.5, color=DIMMER, font=EN)
        x += 132
    d.end()


def ui_refresh(d: Deck):
    C = d.copy
    d.start(*C["s_ui"])
    cols = [CYAN, BLUE, GREEN]
    cw = (W - 2 * MARGIN - 2 * 20) / 3
    for i, (title, body) in enumerate(C["ui_cols"]):
        x = MARGIN + i * (cw + 20)
        d.panel(x, 178, cw, 206)
        d.c.setFillColor(cols[i])
        d.c.roundRect(x + 18, 356, 34, 4, 2, stroke=0, fill=1)
        d.text(x + 18, 330, title, size=13.5, color=TEXT, bold=True)
        d.wrapped(x + 18, 306, body, size=10, color=DIM, width=cw - 36)

    d.panel(MARGIN, 88, W - 2 * MARGIN, 74, fill=PANEL2)
    d.text(MARGIN + 22, 132, C["ui_a11y"], size=10.5, color=CYAN, bold=True)
    d.wrapped(MARGIN + 22, 110, C["ui_a11y_body"], size=11, color=DIM, width=W - 2 * MARGIN - 44)
    d.end()


def bug_sidebar(d: Deck):
    C = d.copy
    y = d.start(*C["s_bug"])
    d.wrapped(MARGIN, y - 4, C["bug_lead"], size=12.5, color=DIM, width=W - 2 * MARGIN)

    d.panel(MARGIN, 228, 400, 140)
    d.text(MARGIN + 20, 344, C["th"][1], size=11, color=RED, bold=True)
    d.text(MARGIN + 20, 306, "5,099 px", size=30, color=RED, bold=True, font=ENB)
    d.wrapped(MARGIN + 20, 282, C["bug_before_note"], size=10.5, color=DIM, width=360)

    d.panel(MARGIN + 452, 228, 400, 140, fill=PANEL2, stroke=GREEN)
    d.text(MARGIN + 472, 344, C["th"][2], size=11, color=GREEN, bold=True)
    d.text(MARGIN + 472, 306, "837 px", size=30, color=GREEN, bold=True, font=ENB)
    d.wrapped(MARGIN + 472, 282, C["bug_after_note"], size=10.5, color=DIM, width=360)

    d.panel(MARGIN, 96, W - 2 * MARGIN, 108, fill=PANEL)
    d.text(MARGIN + 22, 176, C["bug_fix_label"], size=10.5, color=CYAN, bold=True)
    d.wrapped(MARGIN + 22, 152, C["bug_fix_body"], size=11.5, color=DIM, width=W - 2 * MARGIN - 44)
    d.end()


def spec_gaps(d: Deck):
    C = d.copy
    y = d.start(*C["s_gaps"])
    yy = y - 10
    for i, (k, v) in enumerate(C["gaps"]):
        d.c.setFillColor(CYAN if i % 2 == 0 else BLUE)
        d.c.circle(MARGIN + 3, yy + 4, 2.6, stroke=0, fill=1)
        d.text(MARGIN + 16, yy, k, size=11.5, color=TEXT, bold=True)
        d.wrapped(MARGIN + 16, yy - 17, v, size=10, color=DIM, width=W - 2 * MARGIN - 32)
        yy -= 46
    d.end()


def quality(d: Deck):
    C = d.copy
    d.start(*C["s_quality"])
    cols = [GREEN, GREEN, CYAN, BLUE]
    cw = (W - 2 * MARGIN - 3 * 18) / 4
    for i, (label, value, note) in enumerate(C["stats"]):
        x = MARGIN + i * (cw + 18)
        d.panel(x, 244, cw, 136)
        d.text(x + 18, 350, label, size=10.5, color=DIMMER, bold=True)
        d.text(x + 18, 306, value, size=25, color=cols[i], bold=True)
        d.wrapped(x + 18, 284, note, size=9.5, color=DIM, width=cw - 36)

    d.panel(MARGIN, 96, W - 2 * MARGIN, 124, fill=PANEL2)
    d.text(MARGIN + 22, 196, C["q_method"], size=10.5, color=CYAN, bold=True)
    d.wrapped(MARGIN + 22, 172, C["q_method_body"], size=11.5, color=DIM, width=W - 2 * MARGIN - 44)
    d.end()


def next_steps(d: Deck):
    C = d.copy
    y = d.start(*C["s_next"])
    yy = y - 8
    for k, v, colname in C["next_items"]:
        d.panel(MARGIN, yy - 58, W - 2 * MARGIN, 70)
        d.c.setFillColor(COLOR_BY_NAME[colname])
        d.c.roundRect(MARGIN, yy - 58, 4, 70, 2, stroke=0, fill=1)
        d.text(MARGIN + 22, yy - 14, k, size=13, color=TEXT, bold=True)
        d.wrapped(MARGIN + 22, yy - 34, v, size=10.5, color=DIM, width=W - 2 * MARGIN - 44)
        yy -= 88
    d.end()


def build(lang: str):
    C = COPY[lang]
    d = Deck(C["out"], C)
    for fn in (cover, summary, problem_auth, fix_auth, site_structure,
               design_unify, ui_refresh, bug_sidebar, spec_gaps, quality, next_steps):
        fn(d)
    d.save()
    print(f"wrote {C['out']} ({d.page_no} slides)")


if __name__ == "__main__":
    langs = sys.argv[1:] or ["ja", "en"]
    for lang in langs:
        build(lang)
