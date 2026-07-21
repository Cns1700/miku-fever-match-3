# Miku Fever Match-3 — Developer Notes

Internal reference for maintaining this project. For the player-facing description, see `README.md`. The code itself is heavily commented with *why* something works the way it does — this doc is the map, not a duplicate.

## File map

| File | Role |
|---|---|
| `index.html` | All markup. No inline `<script>`/`<style>` beyond the Google Fonts `<link>`. Every element JS touches has an `id`; every translatable string carries `data-i18n`. |
| `miku-style.css` | All styling. Organized in numbered sections (search `====` banners). Character theming flows through 3 CSS custom properties (`--theme-color`, `--theme-color-soft`, `--theme-color-glow`) set once per character in `selectCharacter()`, not hardcoded per-element. |
| `miku-logic.js` | All game logic, ~3300 lines, organized in numbered `====` sections (search for `1. AUDIO SYNTHESIS`, `2. GLOBAL GAME STATE`, etc. — jump to a section header to orient yourself). |
| `i18n.js` | English/Japanese dictionary + the `t()`/`applyTranslations()`/`setLanguage()` helpers. Must load before `miku-logic.js`. |
| `cert-assets.js` | Generated, not hand-edited. Base64 `data:` URIs of every certificate background/portrait, pre-resized. Regenerate from `v-j-rs/` source files if art changes (see that file's header comment for the exact recipe). |
| `Miku-cards/*.png` | Roster card + in-game sidebar portraits (1920×1440, alpha PNG). |
| `v-j-rs/*-resultscreen.png` | Source art for certificate portraits — feeds `cert-assets.js`, not read at runtime directly. |
| `miku-icons-sets/`, `game-audio/`, `sfx/` | Board icons, music, and per-character sound effects. |

No build step, no bundler, no `node_modules` at runtime — this is plain `<script src>` tags meant to run straight from `file://` or any static host. `node`/`npm` only show up in this repo for **dev-time linting** (`html-validate`), never shipped.

## Core game loop

1. `generateBoard()` fills an 8×8 grid with no pre-existing matches and at least one legal move.
2. Player swaps two tiles (`executeSwap`) — adjacent only, unless a character special has temporarily lifted that rule.
3. `findMatches()` / `processMatchCycles()` resolve cascades: clear → `collapseAndRefill()` → re-check for chained matches → repeat, incrementing `comboChain` each pass.
4. Each cleared tile feeds three parallel resources: score, the Fever meter, and (if it's this run's `manaChargeType`) the mana bar.
5. `hasPossibleMoves()` runs after every settle; a dead board triggers `handleDeadlock()` → `reshuffleBoard()`.

### The three modes

- **Stage Clear** (`movesLeft`-gated): target score climbs every 10 levels (`stageClearGoalForLevel()`). No clock.
- **Live Performance** (`timeLeft`-gated): 90s clock, ends the run at 0. Once `timeLeft` drops under `LIVE_PERFORMANCE_HARD_TIME_THRESHOLD` (22.5s = 25% of start), `triggerLivePerformanceHardMode()` fires once: spawns 4 extra obstacle tiles and widens the icon-spawn spread (`weightedRandomType()`'s hard-mode branch) so matches get statistically harder to stumble into — a deliberate "final stretch gets tense" ramp, not a bug.
- **Leisure**: no moves, no clock, no game-over. Same fever/mana systems, purely for relaxed play.

### Fever system

`feverMeter` fills per match (rate tuned in `processMatchCycles`, see the comment there for the history of that tuning number), caps at 100 → `feverLevel++`, meter resets, flat bonus awarded. Level 4, then every 10 after (4, 14, 24…), triggers a **bonus round**:
- Stage Clear: `startThemedTileChallenge()` — 6 obstacle tiles appear, 30s to clear them all, moves are free during the window (`feverBonusRoundActive` gate in `executeSwap`).
- Live Performance: `startIconMatchChallenge()` — one icon glows, match it ×4 within 60s; the main clock freezes for the duration.

### Character specials

One per character, unlocked at `manaEnergy === 100`, dispatched from `activateSpecial()`'s `specials` map (§7b in `miku-logic.js`):

| Character | Special | Mechanic |
|---|---|---|
| Classic | Harmony Wave | 25s ×2 Fever-gain buff, no board mutation |
| Sakura | Blossom Blast | Marks 2 tiles; click either later to clear a 3×3 |
| 25-ji | Void World | Clears every tile of the board's most common icon, random tie-break |
| Snow | Glacial Freeze | Instant resource refill, varies by mode |
| Racing | Turbo Blitz | Aim mode; clears a full row + column |
| Space | Cosmic Gravity | 25s of unrestricted tile placement — swaps persist even without a match (see `executeSwap`'s `freeMoveModeActive` branch) — with `cosmicGravityFailsafe()` reshuffling for free if that leaves the board dead once the window closes |

## Certificate pipeline

`buildCertificateCanvas()` draws a 1200×630 canvas: cover-fit background → contain-fit portrait (never cropped, just shrunk) → 4 corner emoji (drawn *after* the portrait so they're never hidden behind hair/clothing) → a `drawCertTextPlaque()` backing card sized to the actual text content → per-character-themed text (`CERT_TYPOGRAPHY`). Both images load from `cert-assets.js`'s pre-embedded `data:` URIs specifically to dodge `file://` canvas-tainting — see that file's header comment before "fixing" the image loading to use `fetch()` again, that's the bug this works around.

Text on the certificate reads from `t()` same as everything else, so it renders in whichever language is active — note the per-character display fonts (Orbitron/Audiowide/Rajdhani/Fredoka/Quicksand/Share Tech Mono) only cover Latin glyphs, so Japanese certificate text falls back to the browser's generic sans-serif for the CJK characters specifically. Still fully legible, just not the stylized face.

## i18n system

Plain dictionary in `i18n.js`, no framework. Two ways text gets translated:
- **Static HTML**: `data-i18n="dotted.key"` on an element → `applyTranslations()` sets its `textContent` (or, with `data-i18n-attr="title"` etc., that attribute instead) on load and on every `setLanguage()` call.
- **Dynamic/JS-generated text**: call `t('dotted.key', { placeholder: value })` directly at the point the string is built (bonus popups, results screen, certificate).

`refreshDynamicTranslations()` (called from `setLanguage()`) re-renders the handful of *persistent* dynamic labels — sidebar name/portrait, mana tooltip, an open How-To-Play, the Pause button's current state — when the player switches language mid-session. It deliberately does **not** chase transient bonus-popup toasts or the results overlay's detail text; those just pick up the new language the next time they naturally render. If that ever feels wrong in practice, the fix is to store the last-rendered results-branch + its values in module state so `refreshDynamicTranslations()` can rebuild it.

**Known translation gaps** (scoped out deliberately, not oversights):
- Individual credit-list attributions in the footer (real people's names/site names — not UI copy).
- `humanizeIconName()`-derived text (board-icon names auto-generated from filenames, shown in a few popups/tooltips) stays in English in both languages — a full per-icon-file translation table wasn't worth it for text that only appears briefly inside a toast.

To add a third language: copy the `en` block in `I18N`, translate every value, add the language code to `LANGUAGE_ORDER` and a label to `LANGUAGE_LABELS`.

## Asset regeneration

**Portraits look noisy/aliased again after an art update?** The fix used project-wide (see `PORTRAIT-SMOOTHING.md`) is a downsample→upsample pass with `HighQualityBicubic` interpolation — it's not a one-time fix, re-run it any time a new noisy source image comes in.

**Certificate images**: edit the source in `v-j-rs/`, then regenerate `cert-assets.js`'s `CERT_PORTRAIT_DATA`/`CERT_BACKGROUND_DATA` (portraits: 50% resize, alpha-preserving PNG; backgrounds: fit to 1400×1000, JPEG q80). There's no committed script for this pipeline — it's been run ad hoc via PowerShell + `System.Drawing` each time; if you script it permanently, keep the `Format32bppArgb` pixel format for portraits (alpha) and load source bytes via a `MemoryStream` rather than `Image.FromFile` directly if you ever save back to the *same* path (GDI+ locks the file handle otherwise — throws "A generic error occurred in GDI+").

## Local testing

```
python -m http.server 8000
```
then open `http://localhost:8000`. Opening `index.html` straight via `file://` also works (that's the deployed target — see the cert-tainting note above), but if you're actively editing files, prefer a local server: some browsers cache `file://` pages more aggressively than expected, and a couple of past bugs were mis-diagnosed as code issues before realizing the browser was just serving a stale file.

`node --check miku-logic.js` / `node --check i18n.js` catch syntax errors without a browser. `npx html-validate index.html` runs the HTML linter (`.htmlvalidate.json` turns off `prefer-native-element`, which otherwise flags the roster/mode cards — see the comment on `makeKeyboardActivatable()` in `miku-logic.js` for why those are `role="button"` divs instead of native buttons).
