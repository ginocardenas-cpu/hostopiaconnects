# Video assets in Hostopia Connects

**Model:** one catalog card per video (like HTML decks). Language lives in the **player**, not as five separate library rows.

## Preview vs download

| Field | Purpose |
|-------|---------|
| `previewUrl` | Multi-language hosted player (e.g. SundaySky). Used by **Preview** modal. |
| `fileUrl` | Downloadable file (usually English MP4 under `public/videos/`). Fulfilled via My Resources after the lead form. |

Brand Studio / Customize design does **not** apply to Video.

## Adding a video

1. Add the MP4 under **`public/videos/`** (tracked; do **not** put large MP4s in `public/assets/` — those are gitignored).
2. Append a row to **`lib/assets.videos.json`** (merged into the catalog after inventory import, so Excel sync won’t wipe it).
3. Set `contentType` to `"Video"`, `previewUrl` to the SundaySky (or similar) program URL, and `fileUrl` to `/videos/your-file.mp4`.
4. Deploy (include the MP4 in the deployment).

### Hosting example (shipped)

- **Slug:** `/assets/hosting-white-label-video`
- **Preview:** SundaySky program `312fc18e-26e4-462a-951b-c3bbf48912b4`
- **Download:** `/videos/white-label-web-hosting-en.mp4`

## UX notes

- Preview opens the external player in the existing modal (language toggle is in-player).
- My Resources download serves the MP4 (English today). Additional language files can be added later with a language picker, same pattern as HTML `deckLang`.
