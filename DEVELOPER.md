# Miku Fever Match-3 — Developer Notes

Internal reference for maintaining this project. For the player-facing description, see `README.md`. The code itself is heavily commented with *why* something works the way it does — this doc is the map, not a duplicate.

## File map

| File | Role |
|---|---|
| `index.html` | All markup. No inline `<script>`/`<style>` beyond the Google Fonts `<link>`. Every element JS touches has an `id`; every translatable string carries `data-i18n`. |
| `miku-style.css` | All styling. Organized in numbered sections (search `====` banners). Character theming flows through 3 CSS custom properties (`--theme-color`, `--theme-color-soft`, `--theme-color-glow`) set once per character in `selectCharacter()`, not hardcoded per-element. |
| `miku-logic.js` | All game logic, ~3500 lines, organized in numbered `====` sections (search for `1. AUDIO SYNTHESIS`, `2. GLOBAL GAME STATE`, etc. — jump to a section header to orient yourself). |
| `i18n.js` | English/Japanese dictionary + the `t()`/`applyTranslations()`/`setLanguage()` helpers. Must load before `miku-logic.js`. |
| `cert-assets.js` | Generated, not hand-edited. Base64 `data:` URIs of every certificate background/portrait, pre-resized — still ~5MB even resized, since it's 12 full images as base64 text. Regenerate from `v-j-rs/` source files if art changes (see that file's header comment for the exact recipe). **Not** a static `<script>` tag in index.html — see Performance below. |
| `Miku-cards/*.png` | Roster card + in-game sidebar portraits (1920×1440, alpha PNG). The `.xcf` GIMP project files behind them live outside this repo now (moved out — they were never read at runtime or referenced in code, just dead weight in every clone); ask the project owner if you need the editable source for a portrait update. |
| `v-j-rs/*-resultscreen.png` | Source art for certificate portraits — feeds `cert-assets.js`, not read at runtime directly. |
| `miku-icons-sets/`, `game-audio/`, `sfx/` | Board icons, music, and per-character sound effects. `game-audio/` is the small handful of sounds truly shared across every character; everything character-specific lives only in that character's own `sfx/*-sfx/` folder (some shared files are ALSO duplicated into each character folder purely for browsing convenience — see the comment on `SFX_FILES` in `miku-logic.js`). |
| `background/*.jpg` | Per-character ambient page background photos — see `bgImage` in `CHARACTER_THEMES` / the "AMBIENT PARTICLE FIELD & COLOR-CYCLING BACKGROUND" section below. Resized to a 1920px long edge, JPEG q80 (originals were 2-4.8MB each at up to 7000px; sourced from `Desktop/freepik-bg/`, not committed at full size). |

No build step, no bundler, no `node_modules` at runtime — this is plain `<script src>` tags meant to run straight from `file://` or any static host. `node`/`npm` only show up in this repo for **dev-time linting** (`html-validate`), never shipped.

## Performance: cert-assets.js is lazy-loaded

`cert-assets.js` is deliberately not one of index.html's static `<script>` tags. It's ~5MB — trivial over `file://` or localhost, which is exactly why this was easy to miss, but a real multi-second stall over an actual network, and since scripts before it in document order block on it, NOTHING was interactive (not roster select, not mode select, not gameplay) until it finished loading, even though `CERT_PORTRAIT_DATA`/`CERT_BACKGROUND_DATA` are only ever read once a run ends and a certificate actually needs building.

`loadCertAssets()` (in `miku-logic.js`, right before `buildCertificateCanvas()`) injects the `<script>` tag on demand instead, memoizing the in-flight promise so concurrent callers share one request — and un-memoizing it on failure so a later call gets a fresh retry rather than an instantly-rejected stale promise. Two call sites:
- `startGameWithMode()` fires it opportunistically (not awaited) the moment a run actually starts, so it's very likely already cached in the background by the time a results screen needs it.
- `buildCertificateCanvas()` awaits the same promise directly as a safety net, for whichever player reaches a results screen faster than that background fetch finished.

If cert-assets.js ever needs to go back to being a static tag (e.g. if this lazy-load approach ever causes more trouble than the load-time problem it solves), removing the two `loadCertAssets()` call sites and re-adding the `<script src="cert-assets.js">` tag is the whole revert — the format of `CERT_PORTRAIT_DATA`/`CERT_BACKGROUND_DATA` themselves didn't change.

## Core game loop

1. `generateBoard()` fills an 8×8 grid with no pre-existing matches and at least one legal move.
2. Player swaps two tiles (`executeSwap`) — adjacent only, unless a character special has temporarily lifted that rule.
3. `findMatches()` / `processMatchCycles()` resolve cascades: clear (each cleared tile spawns a themed particle burst, `spawnMatchParticles()`) → `collapseAndRefill()` (returns a per-cell fall-distance map) → `animateBoardDrop()` eases the refill into place using that map → re-check for chained matches → repeat, incrementing `comboChain` each pass.
4. Each cleared tile feeds three parallel resources: score, the Fever meter, and (if it's this run's `manaChargeType`) the mana bar.
5. `hasPossibleMoves()` runs after every settle; a dead board triggers `handleDeadlock()` → `reshuffleBoard()`.

### The three modes

- **Stage Clear** (`movesLeft`-gated): target score climbs every 10 levels (`stageClearGoalForLevel()`). Two victory tiers — see below.
- **Live Performance** (`timeLeft`-gated): 90s clock. Once `timeLeft` drops under `LIVE_PERFORMANCE_HARD_TIME_THRESHOLD` (22.5s = 25% of start), `triggerLivePerformanceHardMode()` fires once: spawns 4 extra obstacle tiles and widens the icon-spawn spread (`weightedRandomType()`'s hard-mode branch) so matches get statistically harder to stumble into — a deliberate "final stretch gets tense" ramp, not a bug. No fail state: reaching 0 — naturally or via a deadlock penalty draining the last few seconds — always ends the run as `'victory'`; only a manual End Session mid-clock stays `'normal'`. See `startPerformanceTimer()` / `handleDeadlock()`.
- **Leisure**: no moves, no clock, no game-over, no victory tiers. Same fever/mana systems, purely for relaxed play.

### Stage Clear's two-tier victory

`STAGE_CLEAR_VICTORY_LEVEL` (50) and `STAGE_CLEAR_FINAL_LEVEL` (100) split Stage Clear into two endings instead of one:

- Hitting level 50 for the first time this run (`checkLevelProgress()`, guarded by `hasEarnedVictory` so it only fires once) opens a choice overlay (`showStageVictoryChoice()`) instead of continuing play immediately — **Claim Certificate** ends the run now as `'victory'`; **Keep Climbing** just hides the overlay and resumes with score/level/movesLeft untouched. It blocks board input the same way every other overlay does: `processMatchCycles()` leaves `isProcessing` `true` before opening it, `confirmStageVictoryChoice()` clears it again.
- `hasEarnedVictory` is a run-scoped ratchet: once true, *every* later ending of that run — moves exhausted, a deadlock penalty, or a manual End Session — resolves to `'victory'` instead of `'normal'`, since the achievement isn't retroactively lost by a later loss condition.
- Reaching level 100 always resolves to `'legacyVictory'` regardless of `hasEarnedVictory`, bypassing the choice overlay entirely (nothing left to choose between).

`gameOverScreen(outcome)` takes `'normal' | 'victory' | 'legacyVictory'` (not a boolean) and threads it through `prepareCertificate()` → `buildCertificateCanvas()` → `finishCertificate()`, which picks the results-overlay copy and certificate suffix off that same string — see the Certificate pipeline section below.

### Gotcha: CSS animations beat inline transforms

An element with a running CSS `animation` that touches `transform` will keep overriding an inline `style.transform` set from JS on that element, every frame — the animation always wins the cascade while it's active, regardless of how recently the inline style was set. This has bitten tile transforms twice: Space Singer's free-move floating tiles (`freeMoveFloat` — fixed by dropping `transform` from `#match3Grid.free-move-active .grid-cell-item`'s own *transition* list, so the animation owns it exclusively) and the Live Performance icon-challenge glow (`challengeIconGlow` — fixed by dropping `transform: scale(...)` from the keyframes entirely, since that pulse didn't need to touch transform at all). If a future tile-state animation needs to coexist with `executeSwap()`/`animateBoardDrop()`, keep its keyframes off `transform` — drive the pulse through `box-shadow`/`filter`/`opacity` instead.

### Fever system

`feverMeter` fills per match (rate tuned in `processMatchCycles`, see the comment there for the history of that tuning number), caps at 100 → `feverLevel++`, meter resets, flat bonus awarded. Level 4, then every 10 after (4, 14, 24…), triggers a **bonus round**:
- Stage Clear: `startThemedTileChallenge()` — 6 obstacle tiles appear, 30s to clear them all, moves are free during the window (`feverBonusRoundActive` gate in `executeSwap`).
- Live Performance: `startIconMatchChallenge()` — one icon glows, match it ×4 within 60s; the main clock freezes for the duration.

### Character specials

One per character, unlocked at `manaEnergy === 100`, dispatched from `activateSpecial()`'s `specials` map (§7b in `miku-logic.js`):

| Character | Special | Mechanic |
|---|---|---|
| Classic | Harmony Wave | 25s ×2 Fever-gain buff, no board mutation |
| Sakura | Blossom Blast | Marks up to `BLOSSOM_BLAST_MAX_DETONATORS` (2) tiles, each kept a Chebyshev distance of ≥3 from every other so no two 3×3 clear zones touch; click any later to detonate it — see below |
| 25-ji | Void World | Clears every tile of the board's most common icon, random tie-break |
| Snow | Glacial Freeze | Instant resource refill, varies by mode |
| Racing | Turbo Blitz | Aim mode; clears a full row + column |
| Space | Cosmic Gravity | 25s of unrestricted tile placement — swaps persist even without a match (see `executeSwap`'s `freeMoveModeActive` branch) — with `cosmicGravityFailsafe()` reshuffling for free if that leaves the board dead once the window closes |

### Blossom Blast's mana lock

Sakura's is the one special that isn't fully resolved by the time `activateSpecial()` returns — placing the detonators is instant, but *using* them happens later, on whichever board clicks the player gets around to. `manaEnergy` deliberately does NOT reset to 0 when she activates (see the `currentCharacter !== 'sakura'` guard in `activateSpecial()`): it stays visually full until every detonator this activation placed is gone, and `updateManaHud()`'s `ready` check separately requires `countActiveDetonators() === 0` for Sakura specifically, so the button itself stays locked the whole time even though the bar reads 100%. That's what stops a second activation from stacking more detonators on top of an unfinished batch — confirmed by direct testing that a bypassed re-activation (calling `activateSpecial()` again while 2 are already down) is a no-op, since `specialBlossomBreeze()`'s own `slotsToFill` calculation is `BLOSSOM_BLAST_MAX_DETONATORS - existing.length`, already 0 in that case.

`updateBlossomBlastNotice()` is the single sync point — call it after *anything* that could change how many `.detonator` tiles remain, and it live-scans `boardState` (via `countActiveDetonators()`) rather than trusting a decremented counter, updates the portrait's speech bubble (`#portraitSpeechBubble`, shown/hidden via `showPortraitSpeechBubble()`/`hidePortraitSpeechBubble()`) with the remaining count, and releases the mana lock once that count hits 0. It's called from three places, and all three matter:
- `specialBlossomBreeze()`, right after placing the detonators (shows the bubble, re-locks the button).
- `detonateBlossomTile()`, right after its own direct 3x3 clear — **not** optional: that clear is a direct `boardState` mutation, not a normal match, so it never touches `processMatchCycles()`'s loop. An earlier version of this only hooked `processMatchCycles()` and the bubble/mana lock would silently never update on a blast that didn't chain into a follow-up match — the common case.
- Inside `processMatchCycles()`'s own loop, immediately after its `matches.forEach` clear block. A detonator tile still carries a normal `.type` underneath the flag, so a completely ordinary 3-in-a-row can sweep one up without the player ever clicking it — this is the fail-safe for that. Placed *inside* the loop (not after it, and not at the function's end) specifically because `checkLevelProgress()`/the moves-exhausted check further down both `return` early once the loop exits, which would skip a check placed after them.

(`reshuffleBoard()` already carried `.detonator` flags through a reshuffle correctly before any of this — that fix predates the mana lock — so it isn't a fourth call site.)

**Gotchas this already caused, twice**: `countActiveDetonators() === 0` is ambiguous — it's true both "nothing has been placed yet this run" and "everything placed has already been cleared", and `updateBlossomBlastNotice()` needs to tell those apart. Two real bugs came from this:

1. `specialBlossomBreeze()`'s placement loop could, in principle, come up with zero picks if the `>= 3` spacing rule couldn't be satisfied anywhere (an unusually obstacle-crowded board). The special would run, place nothing, and the zero-count read as "already done" instead of "never started." Fixed by dropping `BLOSSOM_BLAST_MAX_DETONATORS` from 4 to 2 (two mutually-`>=3`-apart cells are almost always findable even on a crowded board, four occasionally weren't) and by guaranteeing at least one placement — ignoring the spacing rule only for that single last-resort pick — whenever any open cell exists at all.
2. The bigger one: `updateBlossomBlastNotice()` runs on *every* cascade step for Sakura (it has to, to catch a detonator getting swept into a normal match — see below), and originally had no way to know whether a Blossom Blast activation was actually in progress. The very first time mana filled to 100 through completely ordinary matching — nothing to do with the special at all — the next cascade step would see "Sakura, 0 detonators" and immediately reset the freshly-filled mana bar back to 0, before the player ever got a chance to click Special. Looked exactly like the mana bar "behaving like the Fever bar" — filling and auto-draining on its own. Fixed with an explicit `blossomBlastActive` flag: `specialBlossomBreeze()` sets it true when it actually places detonators, `updateBlossomBlastNotice()` now no-ops entirely unless it's true, and only clears it (alongside the mana reset) once the live scan confirms the count that flag was tracking has hit 0. `updateManaHud()`'s `blossomPending` check reads this same flag now too, instead of its own separate `countActiveDetonators() > 0` call — one authoritative signal for "is a cycle in progress," not two that happen to usually agree.

## Ambient particle field & background photo

A fixed, page-level layer (`#particleField` + the two `#bgImageLayerA`/`#bgImageLayerB` divs, all `position: fixed`, sitting behind every screen) that's always running, not scoped to the roster/mode-select/game screens individually. Three pieces move together, all driven from `setAmbientTheme(key)`:
- **Color wash** — `--ambient-color`/`--ambient-color-soft` CSS custom properties, read by the background gradient and particle tinting.
- **Drifting icons** — `initParticleField()` creates `PARTICLE_COUNT` (22) `<img>` elements once at load, each with a randomized size/duration/delay; `setAmbientTheme()` just re-points their `src` at the new character's `boardIcons`, it never recreates them. They rise (`@keyframes particleDrift`, `translateY(-115vh)`), they don't fall.
- **Background photo** — each `CHARACTER_THEMES[key].bgImage` points at a `background/*.jpg` file. `setAmbientTheme()` crossfades to it using two stacked full-viewport layers instead of transitioning `background-image` directly (that CSS property doesn't animate — only things like `opacity` do): it loads the new photo into whichever layer isn't currently showing, adds `.active` (→ `opacity: 1`) to that one, and removes `.active` from the other, then flips `activeBgLayer` so the next call alternates again. `.bg-image-layer`'s own `filter: brightness(0.4) saturate(1.05)` dims/desaturates every photo the same amount — the game's UI text assumes the current dark, low-contrast `--dark-bg` wash behind it, and a bright photo at full brightness fought with that everywhere.
- Deliberately **no double-`requestAnimationFrame`** here, unlike `animateBoardDrop()`. That pattern exists because a freshly-*created* element needs its synthetic starting state actually painted before flipping the class that animates it away from that state, otherwise the browser coalesces both changes into one frame and there's nothing to transition from. The two background layers are the opposite case — static, already in the DOM, already resting at `opacity: 0` long before any `setAmbientTheme()` call — so a direct synchronous `classList` toggle already transitions correctly.

`startAmbientCycle()` rotates `setAmbientTheme()` through every character in `AMBIENT_ORDER` every 9s — roster screen only. `selectCharacter()` calls `stopAmbientCycle()` then `setAmbientTheme(key)` once, locking the color/icons/photo to that character for mode-select and gameplay too (this layer isn't screen-scoped, so without the lock it'd keep cycling behind the board). `backToMenu()` calls `startAmbientCycle()` again on the way out, resuming the rotation.

## Sound system

Three layers, all in miku-logic.js §1:
- **`AudioSynth`** — procedurally generated tones (Web Audio oscillators), the same for every character. Covers almost everything: tile select, swap, match/mega-match, no-match, Fever level-up, reshuffle, the Special button's own click, victory/loss stings.
- **`SFX`** — a handful of real audio files shared across every character (`SFX_FILES`): mega-match impact, Fever bonus round start, timed-challenge success, 25-ji's themed-tile clear. Preloaded once at startup, cloned per play so overlapping triggers don't cut each other off.
- **`CharacterSFX`** — real per-character audio files (`CHARACTER_SFX`). Five events are *defined* per character (swap/match/noMatch/specialReady/specialExecuted), but only **specialReady** and **specialExecuted** are actually called anywhere right now — swap/match/noMatch were deliberately reverted to synth-only (their data stays in `CHARACTER_SFX` rather than being deleted, in case downloaded sound for those is wanted again later; see the comment right after the object).

`specialExecuted`'s *trigger point* isn't the same for every character. For Classic/25-ji/Snow/Space, the Special button click fully resolves the special right there, so that click is its "executed" moment. Sakura and Racing are two-step (button arms it, a later board click resolves it) — see `activateSpecial()`'s `currentCharacter !== 'sakura' && currentCharacter !== 'racing'` guard, which skips `specialExecuted` on their button click specifically, and `detonateBlossomTile()`/`resolveTurboBlitz()`, which fire it instead once the effect actually lands.

`CharacterSFX.play()` calls `.play()` on a fresh `Audio()` *before* seeking to a sound's trim-start, not after — browsers can silently refuse to autoplay once too much async time has passed since the last real user gesture, and waiting on a freshly-constructed element's `loadedmetadata` event (needed to seek reliably) before ever calling `play()` risked crossing that window on a slow load. Seeking a few ms into playback instead of before it starts is the smaller downside.

## Certificate pipeline

`buildCertificateCanvas()` draws a 1200×630 canvas: cover-fit background → contain-fit portrait (never cropped, just shrunk) → 4 corner emoji (drawn *after* the portrait so they're never hidden behind hair/clothing) → a `drawCertTextPlaque()` backing card sized to the actual text content → per-character-themed text (`CERT_TYPOGRAPHY`). Both images load from `cert-assets.js`'s pre-embedded `data:` URIs specifically to dodge `file://` canvas-tainting — see that file's header comment before "fixing" the image loading to use `fetch()` again, that's the bug this works around. The border stroke reads `config.certBorderColor || config.baseColor` — only Sakura sets `certBorderColor` (a darker rose), since her pale pink `baseColor` blended into the certificate's own pink background otherwise; every other character just falls through to their normal theme color.

The mode-label line (`"{modeLabel} — {suffix}"`) picks its suffix off the same `outcome` string `gameOverScreen()` threads through: none for `'normal'`, `certificate.victorySuffix` for `'victory'`, `certificate.legacyVictorySuffix` for `'legacyVictory'` (both in `i18n.js`). That line's font size isn't fixed — `finishCertificate()` measures it at 28px and, only if it would overflow past the canvas edge (a wide portrait pushes the text column further right, leaving less room, and the legacy suffix is the longest string that line ever renders), shrinks it proportionally down to a 16px floor before drawing. Found the hard way: Space Singer's wide portrait plus the legacy suffix clipped off-canvas before this guard existed.

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
