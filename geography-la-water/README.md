# Where Does L.A.’s Water Come From? / LA Water Security Atlas

Independent public geography project (not a course assignment).  
日本語と英語は別ファイルです。

## Faculty prospectus (Atlas)

| File | Contents |
|---|---|
| `05-water-security-atlas-prospectus-en.md` | Full Atlas prospectus (English) |
| `05-water-security-atlas-prospectus-ja.md` | アトラス事業計画・研究提案（日本語） |
| `LA-Water-Security-Atlas-Faculty-Prospectus-EN.pptx` / `.pdf` | English faculty deck |
| `LA-Water-Security-Atlas-Faculty-Prospectus-JA.pptx` / `.pdf` | Japanese faculty deck |
| `generate-atlas-prospectus.js` | Regenerates both language decks |

```bash
node geography-la-water/generate-atlas-prospectus.js
```

## Public site

### Atlas platform (v2 research map)
```bash
cd geography-la-water
python3 -m http.server 4174
```
Then visit:
- **http://127.0.0.1:4174/platform/** — Atlas research platform
- **http://127.0.0.1:4174/site/** — map essay (v1)

Serve from the `geography-la-water/` folder (not `platform/` alone) so both links work.

| File | Contents |
|---|---|
| `platform/` | LA Water Security Atlas research platform (v2) |
| `site/` | Public map essay (v1) |
| `01-storymap-outline-en.md` / `01-storymap-outline-ja.md` | StoryMap outlines |
| `02-project-prospectus-en.md` / `03-project-prospectus-ja.md` | Earlier water-story prospectus |
| `04-one-page-brief-en.md` | One-page brief |
| `generate-prospectus-deck.js` | Regenerates earlier plan decks |
