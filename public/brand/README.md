# Brand Assets — sinhon.life (V3.1)

## Files

- `wordmark.svg` — full-color horizontal wordmark (coral mark + ink text). Primary lockup.
- `wordmark-mono.svg` — single-color variant using `currentColor`. Use on colored / dark backgrounds.
- `mark.svg` — square mark-only, 64×64. Favicon / avatar / compact contexts.
- `og-default.svg` — 1200×630 default Open Graph card.
- `og-policy.svg` — 1200×630 policy detail variant.

## Colors (RFP §8.1)

| Token | Hex | Use |
|---|---|---|
| Hearth Coral | `#F97066` | Primary brand, CTA |
| Morning Mint | `#5EC9A8` | Success / wellbeing |
| Honey Butter | `#FBD38D` | Highlight / featured |
| Ink Navy | `#1E2A3A` | Primary text, footer |
| Rice Paper | `#FDF8F1` | Surface, OG background |

## Fonts

- **Fraunces** (serif) — display / headline. Loaded via `next/font` in `app/layout.tsx`.
- **JetBrains Mono** — eyebrow labels, mono numerals.
- **Pretendard** — Korean body text.

When rendering wordmark outside Next.js (social previews, press kits), install Fraunces or let the SVG fall back to `Noto Serif KR` / `Apple SD Gothic Neo`.

## Converting OG SVG → PNG

Social platforms (Facebook, Naver, Kakao) prefer PNG for OG cards. Convert with:

```bash
# Using sharp-cli (already in devDeps)
npx sharp-cli -i public/brand/og-default.svg -o public/brand/og-default.png -f png --width 1200 --height 630

# Or headless Chrome
npx puppeteer-cli svg2png public/brand/og-default.svg public/brand/og-default.png --width 1200 --height 630
```

## Usage in code

```tsx
// Wordmark in header
<Image src="/brand/wordmark.svg" alt="신혼생활" width={140} height={32} priority />

// OG tag
<meta property="og:image" content="https://sinhon.life/brand/og-default.png" />
```
