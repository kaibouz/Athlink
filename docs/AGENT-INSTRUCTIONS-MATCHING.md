# AthlinkPro マッチング — 今後の実装指示文

実装エージェントおよび人間の実装者は、機能追加のたびにこの文書を読む。  
正本の優先度とフェーズは [PRODUCT-ROADMAP-MATCHING.md](./PRODUCT-ROADMAP-MATCHING.md)。見た目は [ROADMAP-UI-PREMIUM.md](./ROADMAP-UI-PREMIUM.md)、導線は [IA.md](./IA.md)。

---

## 製品の一文

カリフォルニアの野球選手と個人コーチを、**未ログイン検索 → プロフィール → 予約** でつなぐ市場である。大学リクルート会社でも、全競技レッスンのアグリゲータでも、動画解析 SaaS でもない。

---

## 着手前チェック（毎回）

新しい機能を書く前に、PR 説明または実装メモの冒頭に次を書く。書けなければ実装しない。

1. **出典:** どの競合のどの要素か（例: CoachUp の 48 時間返信）。内部要望なら「内部」と書く
2. **載せ先:** [src/db/schema.ts](../src/db/schema.ts) のどのテーブル・列か。無い場合は「未配線テーブルを先に使い切ったか」
3. **フェーズ:** Foundation / Trust and Fit / Retention / Family and Money / Differentiate のどれか。前のフェーズが未完なら、明示的な例外理由が要る
4. **判定:** 採用 / 延期 / 拒否のどれか（計画書 §3）

---

## 必ず守ること

- `/search` とコーチ在庫をログイン壁の後ろに置かない（[IA.md](./IA.md)）
- デモ用 localStorage / 静的 [src/lib/data.ts](../src/lib/data.ts) への永続化を増やさない。API + Postgres に載せる
- コピーは EN / JA / ES を同時に [src/lib/i18n/messages.ts](../src/lib/i18n/messages.ts) へ入れる。片方だけの UI 文字列を足さない
- 危険な面は [src/lib/feature-flags.ts](../src/lib/feature-flags.ts) の `useFeatureFlag` を **ページで実際に読んで** 切る。admin トグルだけのフラグを増やさない
- 新テーブルは、Foundation の未配線（`athlete_profiles`, `messages`, `reviews`, `student_athletes`, `coach_feedback`, `time_slots`, `coach_applications`）を使い切ってから
- `matches` テーブルや推薦エンジンは、検索ランキング（`filterCoaches`）で足りなくなったあとに限る
- 予約の即 `confirmed` を前提にした新フローを増やさない。Trust and Fit 以降は `pending` がデフォルト

---

## 明示依頼が無い限り実装しない

計画書の **延期** と **拒否**。短く再掲する。

延期:

- Stripe、実返金、保険、バックグラウンドチェック業者
- `matches` エンティティ、本格レコメンド
- 大学コーチ DB、スカウト閲覧トラッキング
- AI スイング解析、モデレーション本番
- 野球以外の競技、カリフォルニア以外の州

拒否:

- ClassPass 型クレジットでコーチをコモディティ化
- Superprof 型のメッセージ課金、検索の閉鎖
- NCSA 型の有料リクルート伴走を本業にする
- ログイン必須で在庫を隠す

ユーザーが延期・拒否項目を明示的に頼んだときだけ着手し、計画書 §3 を先に更新する。

---

## 現行コードへの載せ方（迷ったらここ）

| やりたいこと | 触る場所 | 触らない場所 |
|--------------|----------|--------------|
| 検索・推薦 | [src/lib/search.ts](../src/lib/search.ts)、`/api/coaches` | 新規 `matches` テーブル |
| 予約状態 | [src/lib/server/data.ts](../src/lib/server/data.ts) の `createBooking`、`bookings.status` | 決済 webhook |
| 信頼 | `coach_profiles.verified`、`coach_applications`、`/admin` | 外部身元確認 API（延期） |
| チャット | `/api/messages` 新設、`message_threads` / `messages` | スレッドの localStorage |
| レビュー | `reviews` 投稿 API、予約 `completed` 後 | 未完了予約への投稿 |
| 選手プロフィール | `athlete_profiles`、`looking_for_coach` | SNS だけにプロフィールを閉じる |
| CRM | `student_athletes`、`coach_feedback` | [src/lib/coach-students.ts](../src/lib/coach-students.ts) への行追加 |
| スロット | `time_slots`、`/coach/calendar` | 登録時の 14 日自動生成だけに依存 |
| 親 | `users.role = parent`、子との関連を最小追加 | Stripe と同時に作り始めない |
| 認証 | Clerk ID を `users` にブリッジ | 第三の認証方式 |

---

## 競合を持ち込まれたときの返答ルール

「CoachUp のように」「Hudl のように」と言われたら、計画書 §2 のカテゴリで分解する。

- レッスン市場の信頼・予約・レビュー → 採用候補。既存列に落とす
- リクルートの大学マッチ → 拒否または Differentiate。本業にしない
- チーム映像オペの解析パイプライン → 延期。メモ＋1本の動画なら CRM に載せる
- クレジットサブスク → 拒否
- 体験レッスンのコピー → 決済前でも採用可。実返金は延期

---

## 完了定義（機能 PR）

- 計画書の該当フェーズ完了条件を満たす
- デモモード（`DATABASE_URL` なし）を壊さない。フォールバックは読んでよいが、新機能の正本にしない
- feature flag がある面は、off で旧画面または非表示になる
- スキーマ変更時は [DATABASE.md](./DATABASE.md) と [docs/schema.sql](./schema.sql) を同じ PR で更新する
