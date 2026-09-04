# Athlink 情報設計（整理版）

調査ベース: Airbnb / ClassPass 系マーケットプレイス — **先に在庫を見せ、必要になったら登録**。

## 3層に分離

| 層 | 役割 | 主な URL |
|----|------|----------|
| **本部（Marketing HQ）** | ブランド説明・導線 | `/` |
| **役割 LP** | 選手/コーチ向け説明 → 登録 | `/for-athletes`, `/for-coaches`, `/get-started` |
| **プラットフォーム（App）** | 検索・予約・ダッシュボード | `/search`, `/bookings`, `/coach/*`, `/messages`, `/sns` |

## 推奨フロー

```
訪客
  └─ / （本部 = コンセプト + How Athlink works）
       ├─ How it works → /#how-it-works   ← 別ページにしない
       ├─ Find coaches → /search          ← 未ログイン可
       ├─ Get started  → /get-started     ← 役割選択
       │                  ├─ /join/athlete → 登録完了 → /home
       │                  └─ /join/coach   → 登録完了 → /coach/dashboard
       └─ Log in → /sign-in → /app → 役割ホーム

ログイン後
  ├─ 選手 → /home（プラットフォーム）
  └─ コーチ → /coach/dashboard
```

## やらないこと

- `/` を役割ゲートだけにしない（コンセプトが伝わらない）
- ログイン後にまたゲートウェイへ戻さない（`/app` 経由でアプリへ）
- 登録前に検索を隠さない

## 残課題

- Clerk 登録と `/join/*` ローカル signup の一本化
- `/coach/register` と `/join/coach` の統合
- 本番 `.env` の `CLERK_*_FALLBACK_REDIRECT_URL=/app`
