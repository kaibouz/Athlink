# AthLink

アスリートと指導経験のあるコーチをマッチングする個人レッスン Web アプリ（事業概要 PPTX の Layer 1 MVP）。

## 起動

### フロントのみ（デモモード）

```bash
npm install
npm run dev
```

開く URL: **http://localhost:3000/**

### 本番向け（DB + API あり）

```bash
docker compose up -d
cp .env.example .env.local
npm run db:push
npm run db:seed
npm run dev
```

詳細は [docs/BACKEND.md](docs/BACKEND.md) を参照。

**デモログイン（シード後）**

- コーチ: `tanaka@athlink.app` / `Athlink2026!`
- 選手: `ethan.park@athlink.app` / `Athlink2026!`

## 画面

| パス | 内容 |
|------|------|
| `/` | ランディング |
| `/search` | 指導者検索 |
| `/coaches/[id]` | プロフィール＆予約 |
| `/bookings` | 予約一覧 |
| `/messages` | メッセージ |
| `/login` `/signup` | デモ認証 |
| `/coach/register` | 指導者登録 |
| `/coach/dashboard` | 指導者ダッシュボード |

進行計画（機能の正本）: [docs/PRODUCT-ROADMAP-MATCHING.md](docs/PRODUCT-ROADMAP-MATCHING.md) / 実装指示: [docs/AGENT-INSTRUCTIONS-MATCHING.md](docs/AGENT-INSTRUCTIONS-MATCHING.md)
