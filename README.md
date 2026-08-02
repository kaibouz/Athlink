# AthLink

アスリートと指導経験のあるコーチをマッチングする個人レッスン Web アプリ（事業概要 PPTX の Layer 1 MVP）。

## 起動

```bash
export PATH="$HOME/.tools/node/bin:$PATH"
cd ~/athlink
npm run dev -- -H 127.0.0.1 -p 3000
```

開く URL: **http://127.0.0.1:3000/**

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
