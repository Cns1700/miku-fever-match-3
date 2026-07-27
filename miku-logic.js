/* ──────────────────────────────────────────────
   1. SYNTHESIZER + REAL SFX
   ────────────────────────────────────────────── */

const AudioSynth = {
    ctx: null,
    muted: false,

    init() {
        if (this.ctx) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Audio Context failed to initialize:', e);
        }
    },

    playTone(freq, type, duration, slideTo = null) {
        if (this.muted) return;
        try {
            this.init();
            if (!this.ctx) return;
            if (this.ctx.state === 'suspended') this.ctx.resume();

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            if (slideTo) {
                osc.frequency.exponentialRampToValueAtTime(slideTo, this.ctx.currentTime + duration);
            }

            gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            console.error('Synthesizer playback error', e);
        }
    },

    playTap() {
        this.playTone(320, 'sine', 0.08, 480);
    },
    playMatch() {
        this.playTone(440, 'triangle', 0.15, 880);
        setTimeout(() => this.playTone(659, 'sine', 0.1, 1318), 50);
    },
    playMegaMatch() {
        this.playTone(220, 'square', 0.35, 1200);
    },
    playFever() {
        this.playTone(150, 'sawtooth', 0.45, 600);
        setTimeout(() => this.playTone(523, 'sine', 0.5, 1600), 100);
    },
    playReshuffle() {
        this.playTone(587, 'triangle', 0.3, 196);
    },
    playError() {
        this.playTone(150, 'sawtooth', 0.2);
    },
    playFeverTick() {
        this.playTone(987, 'sine', 0.04);
    },
    playSpecial() {
        this.playTone(880, 'triangle', 0.12, 1760);
        setTimeout(() => this.playTone(660, 'sine', 0.18, 1320), 90);
        setTimeout(() => this.playTone(990, 'square', 0.25, 1980), 180);
    }
};

const SFX_FILES = {
    megaMatch: 'game-audio/mixkit-break-tech-impact-2952.wav',
    feverStart: 'game-audio/mixkit-fairy-arcade-sparkle-866.wav',
    challengeSuccess: 'game-audio/mixkit-fantasy-game-success-notification-270.wav',
    themedTileClear25ji: 'sfx/25-ji-sfx/mixkit-digital-glitch-break-2951.wav'
};

const SFX = {
    pools: {},

    init() {
        Object.entries(SFX_FILES).forEach(([name, src]) => {
            try {
                const audio = new Audio(src);
                audio.preload = 'auto';
                audio.volume = 0.55;
                this.pools[name] = audio;
            } catch (e) {
                console.warn('Could not preload SFX', name, e);
            }
        });
    },

    play(name) {
        const base = this.pools[name];
        if (!base) return;
        try {
            const instance = base.cloneNode(true);
            instance.volume = base.volume;
            instance.play().catch(() => {});
        } catch (e) {
            console.warn('SFX playback error', name, e);
        }
    }
};

const CHARACTER_SFX = {
    classic: {
        swap: { src: 'sfx/miku-sfx/mixkit-futuristic-machine-glitch-2684.wav', start: 2.2, end: 3.45 },
        match: { src: 'sfx/miku-sfx/mixkit-futuristic-zoom-move-2626.wav', end: 1.84 },
        noMatch: { src: 'sfx/miku-sfx/mixkit-glitch-roar-1033.wav', end: 0.5 },
        specialReady: { src: 'sfx/miku-sfx/mixkit-futuristic-doorbell-928.wav' },
        specialExecuted: { src: 'sfx/miku-sfx/mixkit-futuristic-cinematic-sweep-2635.wav' }
    },
    sakura: {
        swap: { src: 'sfx/sakura-sfx/benkirb-magic-ascend-1-259521.mp3', start: 2.2, end: 2.71 },
        match: { src: 'sfx/sakura-sfx/magiaz-hotel-bell-334109.mp3', end: 2.83 },
        noMatch: { src: 'sfx/sakura-sfx/mixkit-glitch-roar-1033.wav', end: 0.5 },
        specialReady: { src: 'sfx/sakura-sfx/magiaz-hotel-bell-334109.mp3', end: 2.83 },
        specialExecuted: { src: 'sfx/sakura-sfx/universfield-magic-spell-02-250240.mp3', end: 1.5 }
    },
    nightcord: {
        swap: { src: 'sfx/25-ji-sfx/mixkit-digital-glitch-break-2951.wav', end: 0.57 },
        match: { src: 'sfx/25-ji-sfx/mixkit-small-electric-glitch-2595.wav', end: 0.48 },
        noMatch: { src: 'sfx/25-ji-sfx/mixkit-glitch-roar-1033.wav', end: 0.5 },
        specialReady: { src: 'sfx/25-ji-sfx/mixkit-glitch-roar-1033.wav', end: 0.5 },
        specialExecuted: { src: 'sfx/25-ji-sfx/mixkit-cinematic-whoosh-fast-transition-1492.wav' }
    },
    snow: {
        swap: { src: 'sfx/snow-sfx/bryansantosbreton-christmas-vibes-windy-whoosh-magical-chimes-180863.mp3', start: 1.0, end: 2.0 },
        match: { src: 'sfx/snow-sfx/tanweraman-ice-freezing-445024.mp3' },
        noMatch: { src: 'sfx/snow-sfx/mixkit-glitch-roar-1033.wav', end: 0.5 },
        specialReady: { src: 'sfx/snow-sfx/spinopel-falling-into-icy-water-456373.mp3', start: 0.6 },
        specialExecuted: { src: 'sfx/snow-sfx/dragon-studio-christmas-sleigh-bells-jingling-451852.mp3', start: 0.75 }
    },
    racing: {
        swap: { src: 'sfx/racing-sfx/freesound_community-auto5-34441.mp3', end: 1.0 },
        match: { src: 'sfx/racing-sfx/u_dn8ylcpe3v-f1_radio_sound-293747.mp3', start: 0.6, end: 0.99 },
        noMatch: { src: 'sfx/racing-sfx/mightuser-sound-of-breaks-squeaking-of-vehicle-hd-267282.mp3', start: 2.25 },
        specialReady: { src: 'sfx/racing-sfx/freesound_community-backfiring-vehicle-81982.mp3', end: 1.0 },
        specialExecuted: { src: 'sfx/racing-sfx/mixkit-flying-fast-swoosh-1469.wav', end: 1.13 }
    },
    space: {
        swap: { src: 'sfx/space-sfx/mixkit-futuristic-radar-ping-1583.wav', end: 1.48 },
        match: { src: 'sfx/space-sfx/mixkit-break-tech-impact-2952.wav' },
        noMatch: { src: 'sfx/space-sfx/mixkit-falling-hit-757.wav', end: 0.76 },
        specialReady: { src: 'sfx/space-sfx/mixkit-futuristic-radar-ping-1583.wav', end: 1.48 },
        specialExecuted: { src: 'sfx/space-sfx/mixkit-futuristic-cinematic-sweep-2635.wav' }
    }
};

// swap/match/noMatch are defined above but not currently called anywhere
// (see executeSwap()/processMatchCycles()) — reverted to synth-only
// (AudioSynth.playTap/playMatch/playMegaMatch/playError) for those three
// events. Left in place rather than deleted so the tuned trim points aren't
// lost if downloaded swap/match/noMatch sound is ever wanted again — only
// specialReady/specialExecuted are live.

const CharacterSFX = {
    /** Plays one trimmed sound `{src, start, end}`, skipping leading dead air and stopping before trailing dead air. */
    play(sound) {
        if (!sound || AudioSynth.muted) return;
        try {
            const instance = new Audio(sound.src);
            instance.volume = 0.55;
            const start = sound.start || 0;
            // .play() fires immediately/synchronously here, in the same tick
            // as whatever click triggered this call — browsers can silently
            // refuse to autoplay audio once too much async time has passed
            // since the last real user gesture, and the previous version
            // waited for the fresh Audio()'s loadedmetadata event (needed to
            // seek reliably) BEFORE calling play(), which could cross that
            // window on a slow load and get quietly blocked by the .catch()
            // below with no visible error. Seeking to `start` a few ms after
            // playback has already begun (whichever of "now" or "metadata's
            // ready" comes first) is a much smaller downside than risking
            // the sound not playing at all.
            instance.play().catch(() => {});
            if (start > 0) {
                const seek = () => { try { instance.currentTime = start; } catch (e) { /* no-op */ } };
                if (instance.readyState >= 1) seek();
                else instance.addEventListener('loadedmetadata', seek, { once: true });
            }
            if (sound.end) {
                const playMs = Math.max(50, (sound.end - start) * 1000);
                setTimeout(() => { try { instance.pause(); } catch (e) { /* no-op */ } }, playMs);
            }
        } catch (e) {
            console.warn('Character SFX playback error', sound, e);
        }
    },
    /** Plays `eventName` ('swap' | 'match' | 'noMatch' | 'specialReady' | 'specialExecuted') for the current character. */
    playEvent(eventName) {
        const set = CHARACTER_SFX[currentCharacter];
        if (set && set[eventName]) this.play(set[eventName]);
    }
};

/**
 * Global audio volume/mute controller toggler
 */
function toggleMute() {
    AudioSynth.muted = !AudioSynth.muted;
    const soundIcon = document.getElementById('soundIcon');
    const statusText = document.getElementById('soundStatusText');
    if (AudioSynth.muted) {
        soundIcon.className = "fas fa-volume-mute icon-muted";
        statusText.textContent = t('header.soundMuted');
    } else {
        soundIcon.className = "fas fa-volume-up icon-active";
        statusText.textContent = t('header.soundActive');
        AudioSynth.playTone(440, 'sine', 0.1);
    }
}


/**
 * ============================================================================
 * 2. GLOBAL GAME STATE
 * ============================================================================
 * Everything about "what's happening right now" lives in these plain
 * variables rather than a class/store — simple, but it does mean any
 * function can read/write any of these directly.
 */
const GRID_SIZE = 8;
// Stage Clear has two victory tiers now instead of one flat ending — see
// checkLevelProgress(). Reaching STAGE_CLEAR_VICTORY_LEVEL opens a choice
// overlay (claim a normal Victory certificate now, or keep going); reaching
// STAGE_CLEAR_FINAL_LEVEL is the full climb, a separate "Legacy" victory
// tier with its own certificate/results copy (gameOverScreen('legacyVictory')).
// The score needed per level rises every 10 levels too — see
// stageClearGoalForLevel() — so the campaign gets gradually tougher on the
// way to 100 instead of a flat grind.
const STAGE_CLEAR_VICTORY_LEVEL = 50;
const STAGE_CLEAR_FINAL_LEVEL = 100;
// Live Performance's late-game difficulty ramp kicks in once timeLeft drops
// below this (25% of the 90s starting clock) — see triggerLivePerformanceHardMode().
const LIVE_PERFORMANCE_HARD_TIME_THRESHOLD = 22.5;
// Sakura's Blossom Blast: how many detonator tiles a single activation
// marks — see specialBlossomBreeze(). The mana bar stays locked full (see
// updateManaHud()'s blossomPending check) until every one of them clears,
// which is also what stops a second activation from stacking more on top.
const BLOSSOM_BLAST_MAX_DETONATORS = 2;

let currentCharacter = 'classic';
let currentMode = 'stageClear'; // 'stageClear' | 'livePerformance' | 'leisure'
let boardState = [];
let score = 0;
let level = 1;
let movesLeft = 35;
let timeLeft = 90;
let comboChain = 0;
let bestCombo = 0;
let feverMeter = 0;
let isFeverMode = false;
let feverLevel = 0;           // "leveling" counter — increments every time feverMeter fills to 100
let feverBonusRoundActive = false; // true only during the fever-level-4/14/24... Fever Mode + challenge window (Stage Clear: freezes move cost)
let obstacleTilesRemaining = 0;
let manaEnergy = 0;           // 0-100; fills the vertical mana bar, special fires at 100
let manaChargeType = 0;       // which regular icon (0-3) charges mana this run (picked per game)
let lastMatchedCell = null;   // most recently cleared cell — Sakura's special targets this
let isPaused = false;         // Live Performance only
let livePerformanceHardMode = false; // one-shot: true once timeLeft drops below LIVE_PERFORMANCE_HARD_TIME_THRESHOLD — see triggerLivePerformanceHardMode()
let placementModeActive = false; // true while aiming Racing's Turbo Blitz reticle
let selectedCell = null;
let isProcessing = false;
let performanceTimerId = null;
let ambientCycleId = null;
let ambientIndex = 0;
let dragStartRow = null;
let dragStartCol = null;
let touchStartX = 0;
let touchStartY = 0;

// Mode-specific timed challenge state (themed-tile challenge in Stage Clear,
// icon-match challenge in Live Performance) — see §7 further down.
let challengeType = null;     // 'themedTile' | 'iconChallenge' | null
let challengeTimerId = null;
let challengeTimeLeft = 0;
let challengeIconType = null;
let challengeIconProgress = 0;

// True only while a Blossom Blast activation is actually in progress — set
// by specialBlossomBreeze() the moment it places its detonators, cleared
// by updateBlossomBlastNotice() once the last one clears. NOT the same
// thing as "countActiveDetonators() > 0": that count is also 0 before
// Sakura has ever used the special at all this run, and updateBlossomBlastNotice()
// runs on every cascade step (it has to, to catch a detonator getting
// swept into a normal match) — without this flag it couldn't tell "mana
// just reached 100 from ordinary play, nothing to do" apart from "the
// last detonator from a real activation just cleared, release the lock",
// and would reset a perfectly normal, never-yet-claimed full mana bar
// back to 0 the instant it filled.
let blossomBlastActive = false;

// Cached certificate canvas, built as soon as the results screen opens so
// Download/Copy fire directly off the user's own click (see §8).
let certificateCanvas = null;

// Special-ability timed states (see §7b): Miku's Harmony Wave boosts fever
// gain for a window, Space Singer's Cosmic Gravity lifts the adjacency rule
// for a window — both just flags + a timeout, not a one-shot board mutation.
let mikuHarmonyBoostActive = false;
let mikuHarmonyTimeoutId = null;
let freeMoveModeActive = false;
let freeMoveTimeoutId = null;
let specialTimerIntervalId = null; // drives the on-board countdown badge (#specialTimerBadge) while either buff above is running
// Rising-edge tracker so the "special move is ready" SFX (see CHARACTER_SFX)
// fires once when the mana bar first reaches 100, not on every HUD refresh.
let specialWasReady = false;
// Stage Clear only: true once the player has passed STAGE_CLEAR_VICTORY_LEVEL
// this run (set the moment the choice overlay appears, whether they claim
// immediately or keep climbing) — see checkLevelProgress(). Once true, any
// later ending of the run (moves exhausted, deadlock, or the End button)
// counts as 'victory' instead of 'normal', since they already earned it.
let hasEarnedVictory = false;
// True only while the How-To-Play modal is the automatic one shown at the
// start of a run — see confirmHowToPlay(), which uses it to decide whether
// the Live Performance clock still needs to be started on dismissal.
let howToPlayIsInitialShow = false;
// True while a manual (mid-run, via the 📋 button) How-To-Play open has
// frozen an already-running Live Performance clock — see showHowToPlay()/
// confirmHowToPlay(), which use it to know whether to resume the clock.
let howToPlayPausedTimer = false;

/**
 * Converts a "#rrggbb" hex color into an "rgba(...)" string so themes can
 * drive glow/shadow colors purely from the single baseColor value already
 * defined per character.
 */
function hexToRgba(hex, alpha) {
    const clean = hex.replace('#', '');
    const bigint = parseInt(clean, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Turns an icon filename like "crossed-checkered-flags.png" into
 * "Crossed Checkered Flags" for use in accessible tile labels.
 */
function humanizeIconName(path) {
    const file = path.split('/').pop().replace('.png', '');
    return file.replace(/-/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase());
}

/**
 * ============================================================================
 * 3. CHARACTER THEMES & GAMEBOARD ART
 * ============================================================================
 * >>> EDIT HERE to rename a character, change their color, or point them at
 * different art. `baseColor` alone drives almost every themed color in the
 * CSS (board glow, card title/subtitle, mana bar, etc.) via the --theme-color
 * custom property, so changing just that hex value re-themes everything.
 *
 * Each character carries: 4 PNG board icons (tile types 0-3), the hand-drawn
 * "39" SVG (tile type 4, kept from the original design), a move-icon/time-icon
 * pair (tile type 5 — the "bonus icon"), and one HUD emoji used on the moves/
 * time/challenge labels and the certificate decorations.
 */
const CHARACTER_THEMES = {
    classic: {
        name: "Classic Miku",
        title: "Virtual Diva #01",
        baseColor: "#39C5BB",       // <- change this hex to re-theme Classic Miku everywhere
        accentColor: "#E23E57",
        obstacleName: "Static-Locked",
        // Ambient page background — see setAmbientTheme()/the .bg-image-layer
        // pair in index.html. Roster screen crossfades through every
        // character's; selectCharacter() locks it to this one for the rest
        // of the session (mode-select + game screens included).
        bgImage: "background/classic-bg.jpg",
        hudEmoji: "🎤",
        certEmoji: ["🎤", "🎤"],
        boardIcons: [
            "miku-icons-sets/miku-icons/negi.png",
            "miku-icons-sets/miku-icons/microphone.png",
            "miku-icons-sets/miku-icons/cat.png",
            "miku-icons-sets/miku-icons/wifi.png"
        ],
        // >>> EDIT HERE to reframe/rezoom this character's portrait — two
        // fully independent configs, one per surface (see the "PORTRAIT
        // FRAMING" section further down for how each is applied). x/y
        // follow CSS background-position rules; scale is a background-size
        // percentage (100% = fit the whole image, so >100% crops in/zooms).
        cardPortraitFrame: { x: "50%", y: "30%", scale: "280%" },       // roster screen card (main page)
        sidebarPortraitFrame: { x: "50%", y: "35%", scale: "200%" },    // in-game sidebar (game page)
        // >>> EDIT HERE to recrop this character's full-body results-certificate
        // art. Coordinates are in the 960x720 RESIZED space (CERT_PORTRAIT_DATA
        // in cert-assets.js is a 50%-scale copy of v-j-rs/*-resultscreen.png,
        // 1920x1440 originals) — halve any measurement you take from the
        // original file before putting it here. These are auto-detected: the
        // true non-transparent content bounding box of the resized art (alpha
        // > 20), plus a 14px safety margin — not a hand-eyeballed guess, so
        // the whole character (hands, held props, hair) is always included.
        // buildCertificateCanvas() only ever shrinks this box to fit, never
        // crops it further.
        certPortraitFrame: { sx: 205, sy: 1, sWidth: 559, sHeight: 719 },
        boardMoveIcon: "miku-icons-sets/miku-icons/miku-move-icon/music.png",
        boardTimeIcon: "miku-icons-sets/miku-icons/miku-time-icon/metronome.png",
        svg39: `<g>
            <rect x="18" y="18" width="64" height="64" rx="12" fill="rgba(57,197,187,0.1)" stroke="#39C5BB" stroke-width="1.5" />
            <text x="50" y="62" font-family="'Orbitron', sans-serif" font-weight="900" font-size="34" fill="#39C5BB" text-anchor="middle" filter="drop-shadow(0px 0px 4px #39C5BB)">39</text>
        </g>`
    },
    sakura: {
        name: "Sakura Miku",
        title: "Cherry Blossom Angel",
        baseColor: "#FFB7C5",
        accentColor: "#FFF0F5",
        // Certificate border only — baseColor's pale pink blended into the
        // pink cherry-blossom cert background, so this uses the same dark
        // rose already established for her cert TEXT (CERT_TYPOGRAPHY.sakura
        // .accent) instead. Every other character's cert border still just
        // uses baseColor (see the `config.certBorderColor || config.baseColor`
        // fallback in buildCertificateCanvas()/drawCertificateFallbackBase()).
        certBorderColor: "#9c1c48",
        obstacleName: "Wilted Petal",
        bgImage: "background/sakura-bg.jpg",
        hudEmoji: "🌸",
        certEmoji: ["🌸", "🌸"],
        boardIcons: [
            "miku-icons-sets/sakura-icons/sakura.png",
            "miku-icons-sets/sakura-icons/mochi.png",
            "miku-icons-sets/sakura-icons/cherry.png",
            "miku-icons-sets/sakura-icons/temperature.png"
        ],
        // >>> EDIT HERE to reframe/rezoom this character's portrait (card vs sidebar are independent).
        cardPortraitFrame: { x: "60%", y: "5%", scale: "280%" },
        sidebarPortraitFrame: { x: "56%", y: "5%", scale: "190%" },
        certPortraitFrame: { sx: 206, sy: 34, sWidth: 644, sHeight: 686 },
        boardMoveIcon: "miku-icons-sets/sakura-icons/sakura-move-icon/blossom.png",
        boardTimeIcon: "miku-icons-sets/sakura-icons/sakura-time-icon/sakura.png",
        svg39: `<g>
            <rect x="18" y="18" width="64" height="64" rx="20" fill="rgba(255,183,197,0.15)" stroke="#FFB7C5" stroke-width="2" />
            <text x="50" y="62" font-family="'Fredoka', sans-serif" font-weight="900" font-size="34" fill="#FF7A90" text-anchor="middle" filter="drop-shadow(0px 0px 3px #FFB7C5)">39</text>
        </g>`
    },
    nightcord: {
        name: "25-ji Miku",
        title: "Silent SEKAI Echo",
        baseColor: "#8D8BB2",
        accentColor: "#BA3C56",
        obstacleName: "Glitch",
        bgImage: "background/nightcord-bg.jpg",
        hudEmoji: "🌙",
        certEmoji: ["🌙", "🌙"],
        boardIcons: [
            "miku-icons-sets/25-ji-icons/ribbon.png",
            "miku-icons-sets/25-ji-icons/sand-clock.png",
            "miku-icons-sets/25-ji-icons/photo.png",
            "miku-icons-sets/25-ji-icons/settings.png"
        ],
        // >>> EDIT HERE to reframe/rezoom this character's portrait (card vs sidebar are independent).
        cardPortraitFrame: { x: "40%", y: "21%", scale: "220%" },
        sidebarPortraitFrame: { x: "48%", y: "7%", scale: "190%" },
        certPortraitFrame: { sx: 163, sy: 58, sWidth: 683, sHeight: 662 },
        boardMoveIcon: "miku-icons-sets/25-ji-icons/25ji-move-icon/moon.png",
        boardTimeIcon: "miku-icons-sets/25-ji-icons/25ji-time-icon/diamond.png",
        svg39: `<g>
            <rect x="18" y="18" width="64" height="64" rx="8" fill="rgba(141,139,178,0.1)" stroke="#8D8BB2" stroke-width="1.5" />
            <text x="52" y="64" font-family="'Share Tech Mono', monospace" font-size="34" fill="#BA3C56" text-anchor="middle">39</text>
            <text x="48" y="60" font-family="'Share Tech Mono', monospace" font-size="34" fill="#8D8BB2" text-anchor="middle" style="mix-blend-mode: screen">39</text>
        </g>`
    },
    snow: {
        name: "Snow Miku",
        title: "Crystal Winter Princess",
        baseColor: "#7DD3FC",
        accentColor: "#E0F2FE",
        obstacleName: "Ice",
        bgImage: "background/snow-bg.jpg",
        hudEmoji: "❄️",
        certEmoji: ["❄️", "❄️"],
        boardIcons: [
            "miku-icons-sets/snow-icons/snowflakes.png",
            "miku-icons-sets/snow-icons/gloves.png",
            "miku-icons-sets/snow-icons/rabbit.png",
            "miku-icons-sets/snow-icons/winter-red.png"
        ],
        // >>> EDIT HERE to reframe/rezoom this character's portrait (card vs sidebar are independent).
        cardPortraitFrame: { x: "55%", y: "23%", scale: "250%" },
        sidebarPortraitFrame: { x: "55%", y: "23%", scale: "160%" },
        certPortraitFrame: { sx: 133, sy: 25, sWidth: 710, sHeight: 695 },
        boardMoveIcon: "miku-icons-sets/snow-icons/snow-move-icon/snow.png",
        boardTimeIcon: "miku-icons-sets/snow-icons/snow-time-icon/snowflakes.png",
        svg39: `<g>
            <rect x="18" y="18" width="64" height="64" rx="14" fill="rgba(125,211,252,0.1)" stroke="#7DD3FC" stroke-width="2" />
            <text x="50" y="62" font-family="'Orbitron', sans-serif" font-weight="900" font-size="34" fill="#FFF" text-anchor="middle" filter="drop-shadow(0px 0px 5px #0ea5e9)">39</text>
        </g>`
    },
    racing: {
        name: "Racing Miku",
        title: "Vocaloid Speed Queen",
        baseColor: "#F97316",
        accentColor: "#10B981",
        obstacleName: "Oil-Slick",
        bgImage: "background/racing-bg.jpg",
        hudEmoji: "🏁",
        certEmoji: ["🏆", "🏆"],
        boardIcons: [
            "miku-icons-sets/racing-icons/crossed-checkered-flags.png",
            "miku-icons-sets/racing-icons/car.png",
            "miku-icons-sets/racing-icons/wheel.png",
            "miku-icons-sets/racing-icons/1st-prize.png"
        ],
        // >>> EDIT HERE to reframe/rezoom this character's portrait (card vs sidebar are independent).
        cardPortraitFrame: { x: "60%", y: "7%", scale: "280%" },
        sidebarPortraitFrame: { x: "54%", y: "3%", scale: "190%" },
        certPortraitFrame: { sx: 184, sy: 147, sWidth: 664, sHeight: 573 },
        boardMoveIcon: "miku-icons-sets/racing-icons/racing-move-icon/speed-meter.png",
        boardTimeIcon: "miku-icons-sets/racing-icons/racing-time-icon/race-track.png",
        svg39: `<g>
            <rect x="18" y="18" width="64" height="64" rx="10" fill="rgba(249,115,22,0.1)" stroke="#F97316" stroke-width="2" />
            <text x="50" y="62" font-family="'Orbitron', sans-serif" font-weight="900" font-size="34" fill="#F97316" text-anchor="middle" filter="drop-shadow(0px 0px 5px #EF4444)">39</text>
        </g>`
    },
    space: {
        name: "Space Singer",
        title: "Galactic Star Odyssey",
        baseColor: "#D946EF",
        accentColor: "#EAB308",
        obstacleName: "Asteroid",
        bgImage: "background/space-bg.jpg",
        hudEmoji: "☄️",
        certEmoji: ["☄️", "☄️"],
        boardIcons: [
            "miku-icons-sets/galactic-icons/astrophysics.png",
            "miku-icons-sets/galactic-icons/falling-star.png",
            "miku-icons-sets/galactic-icons/8.png",
            "miku-icons-sets/galactic-icons/13.png"
        ],
        // >>> EDIT HERE to reframe/rezoom this character's portrait (card vs sidebar are independent).
        cardPortraitFrame: { x: "45%", y: "18%", scale: "280%" },
        sidebarPortraitFrame: { x: "40%", y: "12%", scale: "178%" },
        certPortraitFrame: { sx: 39, sy: 0, sWidth: 921, sHeight: 720 },
        boardMoveIcon: "miku-icons-sets/galactic-icons/galactic-move-icon/galaxy.png",
        boardTimeIcon: "miku-icons-sets/galactic-icons/galactic-time-icon/music.png",
        svg39: `<g>
            <rect x="18" y="18" width="64" height="64" rx="20" fill="rgba(217,70,239,0.1)" stroke="#D946EF" stroke-width="2" />
            <text x="50" y="62" font-family="'Orbitron', sans-serif" font-weight="900" font-size="34" fill="#EAB308" text-anchor="middle" filter="drop-shadow(0px 0px 5px #D946EF)">39</text>
        </g>`
    }
};

/**
 * Portrait art shown on the card figures and the in-game sidebar.
 * >>> EDIT HERE if you rename/move a portrait file in Miku-cards/.
 */
const PORTRAIT_IMAGES = {
    classic: 'Miku-cards/Miku.png',
    sakura: 'Miku-cards/Sakura.png',
    nightcord: 'Miku-cards/25-ji.png',
    snow: 'Miku-cards/Winter.png',
    racing: 'Miku-cards/Racing-Miku.png',
    space: 'Miku-cards/G-Miku.png'
};

/**
 * SOURCE REFERENCE ONLY — not read at runtime. The certificate actually
 * draws from CERT_PORTRAIT_DATA (cert-assets.js), pre-encoded base64 copies
 * of these same files resized to 960x720. That's not a style choice: an
 * `<img src="v-j-rs/...">` loaded straight from disk taints the certificate
 * canvas for a lot of players (this game is normally run via file://, and
 * canvas-export-after-drawing-a-local-file is inconsistently blocked across
 * browsers), which silently produced a portrait-less, background-less
 * certificate. A `data:` URI has no such origin conflict, so embedding the
 * bytes directly sidesteps the whole failure class.
 * >>> TO SWAP AN IMAGE: replace the file in v-j-rs/, update the matching
 * entry here for reference, then re-run the resize+base64-encode step to
 * regenerate cert-assets.js (see that file's header comment). Editing this
 * map alone does nothing.
 */
const CERTIFICATE_PORTRAIT_IMAGES = {
    classic: 'v-j-rs/Miku-resultscreen.png',
    sakura: 'v-j-rs/Sakura-Miku-resultscreen.png',
    nightcord: 'v-j-rs/25-ji-Miku-resultscreen.png',
    snow: 'v-j-rs/Snow-Miku-resultscreen.png',
    racing: 'v-j-rs/R-Miku-resultscreen.png',
    space: 'v-j-rs/G-Miku-resultscreen.png'
};

// Per-mode How-To-Play bullets and per-character Special blurbs used to
// live here as HOW_TO_PLAY_TEXT/CHARACTER_SPECIAL_TEXT — both now live in
// i18n.js (I18N.<lang>.howToPlay.*) since they need a Japanese version too.
// >>> EDIT HERE (i18n.js) to change the wording, in either language.

/**
 * ============================================================================
 * 4. AMBIENT PARTICLE FIELD & COLOR-CYCLING BACKGROUND
 * ============================================================================
 * A fixed layer of small drifting icon particles, a color wash, and (as of
 * the background/ art) a crossfading photo, all behind the app. On the
 * roster screen it auto-cycles through every character's palette/icons/
 * photo; once a character is chosen it locks onto that character — photo
 * included — for the rest of the session (mode-select and gameplay too,
 * since this is a fixed page-level layer, not scoped to any one screen).
 */
const AMBIENT_ORDER = ['classic', 'sakura', 'nightcord', 'snow', 'racing', 'space'];
const PARTICLE_COUNT = 22;
// Which of the two crossfade layers (see .bg-image-layer in miku-style.css)
// currently holds the active/visible background — setAmbientTheme() flips
// this each call so the NEXT photo always loads into the currently-hidden
// layer before fading it in.
let activeBgLayer = 'A';

/** Creates the drifting particle `<img>` elements once at page load. */
function initParticleField() {
    const field = document.getElementById('particleField');
    if (!field) return;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const particle = document.createElement('img');
        particle.className = 'ambient-particle';
        particle.alt = '';

        const duration = 14 + Math.random() * 12;
        const delay = -Math.random() * duration;
        const size = 20 + Math.random() * 16;

        particle.style.left = `${Math.random() * 100}%`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;

        field.appendChild(particle);
    }

    setAmbientTheme(AMBIENT_ORDER[0]);
}

/** Re-points every particle at a character's icons, updates the ambient color wash, and crossfades in that character's background photo. */
function setAmbientTheme(key) {
    const config = CHARACTER_THEMES[key];
    if (!config) return;

    document.documentElement.style.setProperty('--ambient-color', config.baseColor);
    document.documentElement.style.setProperty('--ambient-color-soft', hexToRgba(config.baseColor, 0.18));

    if (config.bgImage) {
        const nextLayer = document.getElementById(activeBgLayer === 'A' ? 'bgImageLayerB' : 'bgImageLayerA');
        const currentLayer = document.getElementById(activeBgLayer === 'A' ? 'bgImageLayerA' : 'bgImageLayerB');
        if (nextLayer) {
            // No rAF needed here, unlike animateBoardDrop()'s double-rAF:
            // these two layers are static elements already resting at their
            // base opacity:0 well before this ever runs (not freshly
            // created mid-function the way renderBoard()'s cells are), so
            // there's no "just-set synthetic starting state" that needs a
            // frame to commit first — toggling .active directly triggers
            // the CSS transition already declared on the base rule.
            nextLayer.style.backgroundImage = `url('${config.bgImage}')`;
            nextLayer.classList.add('active');
            if (currentLayer) currentLayer.classList.remove('active');
            activeBgLayer = activeBgLayer === 'A' ? 'B' : 'A';
        }
    }

    const field = document.getElementById('particleField');
    if (!field) return;

    const icons = config.boardIcons;
    Array.from(field.children).forEach((particle, i) => {
        particle.src = icons[i % icons.length];
    });
}

/** Roster screen only: slowly rotates the ambient theme through every character. */
function startAmbientCycle() {
    stopAmbientCycle();
    ambientIndex = 0;
    ambientCycleId = setInterval(() => {
        ambientIndex = (ambientIndex + 1) % AMBIENT_ORDER.length;
        setAmbientTheme(AMBIENT_ORDER[ambientIndex]);
    }, 9000);
}

function stopAmbientCycle() {
    if (ambientCycleId) {
        clearInterval(ambientCycleId);
        ambientCycleId = null;
    }
}

/**
 * ============================================================================
 * 5. SYSTEM EVENT SETUP AND programmatic INITIALIZERS
 * ============================================================================
 */
window.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
    document.getElementById('langToggleBtn').textContent = LANGUAGE_LABELS[currentLanguage];
    initParticleField();
    startAmbientCycle();
    setupEventListeners();
    applyCardPortraitFraming();
    SFX.init();
});

/**
 * Roster/mode cards are `<div role="button" tabindex="0">` rather than a
 * real `<button>` — a native button's content model only allows phrasing
 * content, and these cards contain a heading, paragraphs, and a figure
 * (see index.html). That gets them mouse clicks for free but not a native
 * button's keyboard activation, so this wires up Enter/Space to fire the
 * same click handler already bound to the element.
 */
function makeKeyboardActivatable(el) {
    el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
            e.preventDefault();
            el.click();
        }
    });
}

/**
 * Re-renders whatever dynamic (non-[data-i18n]) text is currently on screen
 * after a language switch — static text is already handled by
 * applyTranslations() (called from setLanguage() in i18n.js). Scoped to the
 * screens/labels that stay visible for a while (sidebar, mode-select label,
 * mana tooltip, an open How-To-Play, the Pause button's current state);
 * transient toasts and the results screen just pick up the new language
 * the next time they naturally render, since chasing every in-flight toast
 * wasn't worth the complexity for something that's already fading out.
 */
function refreshDynamicTranslations() {
    const config = CHARACTER_THEMES[currentCharacter];
    if (!document.getElementById('gameScreen').classList.contains('hidden')) {
        document.getElementById('charTitleLabel').innerText = t(`character.${currentCharacter}.name`);
        document.getElementById('portraitCaption').innerText = t(`character.${currentCharacter}.name`);
        document.getElementById('mikuPortraitImg').setAttribute('aria-label', t(`character.${currentCharacter}.portraitAlt`));
        updateManaChargeHint(config);
        if (!document.getElementById('howToPlayOverlay').classList.contains('hidden')) {
            renderHowToPlayBody();
        }
        const pauseBtnLabel = document.getElementById('pauseBtnLabel');
        if (pauseBtnLabel) pauseBtnLabel.textContent = t(isPaused ? 'hud.resume' : 'hud.pause');
    }
    if (!document.getElementById('modeSelectScreen').classList.contains('hidden')) {
        document.getElementById('modeSelectCharLabel').innerText = t('modeSelect.playingAs', { name: t(`character.${currentCharacter}.name`) });
    }
}

/**
 * Programmatically binds all events to keep HTML fully pristine.
 */
function setupEventListeners() {
    // Volume Toggler
    document.getElementById('soundToggleBtn').addEventListener('click', toggleMute);

    // Language Toggler (English/Japanese — see i18n.js)
    document.getElementById('langToggleBtn').addEventListener('click', toggleLanguage);

    // Roster Cards Choice Binding (scoped to [data-char] so it never
    // matches the mode-select cards, which share the same base card class
    // for layout but use [data-mode] instead)
    document.querySelectorAll('.character-card[data-char]').forEach(card => {
        card.addEventListener('click', () => {
            selectCharacter(card.getAttribute('data-char'));
        });
        makeKeyboardActivatable(card);
    });

    // Mode Select Binding
    document.querySelectorAll('.mode-card').forEach(card => {
        card.addEventListener('click', () => {
            startGameWithMode(card.getAttribute('data-mode'));
        });
        makeKeyboardActivatable(card);
    });

    // Back Navigation
    document.getElementById('backToRosterFromModeBtn').addEventListener('click', backToMenu);
    document.getElementById('backToMenuBtn').addEventListener('click', backToMenu);

    // HUD buttons: return to mode select, pause (Live Performance only), end run early, how-to-play
    document.getElementById('modesBtn').addEventListener('click', backToModeSelect);
    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    document.getElementById('endSessionBtn').addEventListener('click', endSessionNow);
    document.getElementById('howToPlayBtn').addEventListener('click', () => showHowToPlay(false));
    document.getElementById('howToPlayCloseBtn').addEventListener('click', confirmHowToPlay);

    // Stage 50 choice overlay (see checkLevelProgress()/showStageVictoryChoice())
    document.getElementById('claimCertificateBtn').addEventListener('click', () => confirmStageVictoryChoice(true));
    document.getElementById('keepClimbingBtn').addEventListener('click', () => confirmStageVictoryChoice(false));

    // Overlays Actions
    document.getElementById('playAgainBtn').addEventListener('click', () => {
        resetGame();
        if (currentMode === 'livePerformance') startPerformanceTimer();
    });
    document.getElementById('overlayBackToRosterBtn').addEventListener('click', backToMenu);
    document.getElementById('downloadCertificateBtn').addEventListener('click', downloadCertificate);
    document.getElementById('copyCertificateBtn').addEventListener('click', copyCertificateToClipboard);

    // Mana bar special ability button
    document.getElementById('specialBtn').addEventListener('click', activateSpecial);

    // Racing's Turbo Blitz reticle: delegated onto the (static) grid
    // container so the listeners survive renderBoard() rebuilding cells.
    const grid = document.getElementById('match3Grid');
    grid.addEventListener('mousemove', handleReticleMove);
    grid.addEventListener('mouseleave', clearReticleHighlight);
    grid.addEventListener('click', handleGridPlacementClick);
}

/**
 * ============================================================================
 * 6. CORE MATCH-3 PLAY ENGINE & PHYSICS
 * ============================================================================
 */
function selectCharacter(key) {
    currentCharacter = key;
    AudioSynth.init();
    AudioSynth.playTone(523.25, 'sine', 0.25);

    const config = CHARACTER_THEMES[key];

    // Every themed color in the CSS (board glow, goal text, cell-selection
    // ring, mode-select accents, mana bar, etc.) reads from these three
    // custom properties, so switching character only requires updating
    // them here. >>> EDIT the hex values in CHARACTER_THEMES above, not here.
    document.documentElement.style.setProperty('--theme-color', config.baseColor);
    document.documentElement.style.setProperty('--theme-color-soft', hexToRgba(config.baseColor, 0.18));
    document.documentElement.style.setProperty('--theme-color-glow', hexToRgba(config.baseColor, 0.35));

    const titleLabel = document.getElementById('charTitleLabel');
    titleLabel.innerText = t(`character.${key}.name`);
    titleLabel.className = 'character-hud-badge';
    titleLabel.style.borderColor = config.baseColor;
    titleLabel.style.color = config.baseColor;
    titleLabel.style.borderWidth = '1px';

    const boardBorder = document.getElementById('boardBorder');
    boardBorder.className = 'board-container';

    document.getElementById('portraitThemeBlob1').style.color = config.baseColor;
    document.getElementById('portraitThemeBlob2').style.color = config.baseColor;
    document.getElementById('portraitAura').style.backgroundColor = config.baseColor;

    const portraitEl = document.getElementById('mikuPortraitImg');
    portraitEl.style.backgroundImage = `url('${PORTRAIT_IMAGES[key]}')`;
    portraitEl.setAttribute('aria-label', t(`character.${key}.portraitAlt`));
    applyPortraitFraming(portraitEl, config.sidebarPortraitFrame);
    document.getElementById('portraitCaption').innerText = t(`character.${key}.name`);

    // Re-theme the HUD icons (Moves/Time labels) with this character's emoji.
    document.querySelectorAll('.hud-icon').forEach(el => { el.textContent = config.hudEmoji; });

    stopAmbientCycle();
    setAmbientTheme(key);

    document.getElementById('modeSelectCharLabel').innerText = t('modeSelect.playingAs', { name: t(`character.${key}.name`) });

    document.getElementById('selectionScreen').classList.add('hidden');
    document.getElementById('modeSelectScreen').classList.remove('hidden');
}

/**
 * Locks in a chosen mode and drops the player onto the board.
 */
function startGameWithMode(mode) {
    currentMode = mode;
    document.getElementById('modeSelectScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    resetGame();
    showHowToPlay(true);
    // Opportunistic prefetch — see loadCertAssets()'s comment. Not awaited:
    // a run just started, so there's a whole playthrough's worth of time
    // for this to finish in the background before it's actually needed.
    // Errors here are silently swallowed on purpose — buildCertificateCanvas()
    // retries this same load (and has its own fallback) when it's actually needed.
    loadCertAssets().catch(() => {});
}

/**
 * Returns the player all the way back to the roster selection screen,
 * from either the mode-select screen or an active game.
 */
function backToMenu() {
    stopAllTimers();
    isFeverMode = false;
    feverBonusRoundActive = false;
    isProcessing = false;
    isPaused = false;
    placementModeActive = false;
    selectedCell = null;

    document.getElementById('boardBorder').classList.remove('fever-active-border');
    document.getElementById('resultsOverlay').classList.add('hidden');
    document.getElementById('stageVictoryChoiceOverlay').classList.add('hidden');
    document.getElementById('pauseOverlay').classList.add('hidden');
    hideHowToPlay();
    hidePortraitSpeechBubble();

    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('modeSelectScreen').classList.add('hidden');
    document.getElementById('selectionScreen').classList.remove('hidden');

    startAmbientCycle();
}

/**
 * Sends the player back to the mode-select screen (keeping the same
 * character) without returning all the way to the roster.
 */
function backToModeSelect() {
    stopAllTimers();
    isFeverMode = false;
    feverBonusRoundActive = false;
    isProcessing = false;
    isPaused = false;
    placementModeActive = false;
    selectedCell = null;

    document.getElementById('boardBorder').classList.remove('fever-active-border');
    document.getElementById('resultsOverlay').classList.add('hidden');
    document.getElementById('stageVictoryChoiceOverlay').classList.add('hidden');
    document.getElementById('pauseOverlay').classList.add('hidden');
    hideHowToPlay();
    hidePortraitSpeechBubble();

    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('modeSelectScreen').classList.remove('hidden');
}

/**
 * Clears every running interval/timeout, including both timed character
 * buffs (Harmony Wave / Cosmic Gravity) and their on-board countdown badge —
 * used whenever we leave the active board or a run ends, so nothing keeps
 * ticking in the background after that.
 */
function stopAllTimers() {
    stopPerformanceTimer();
    stopChallengeTimer();
    mikuHarmonyBoostActive = false;
    if (mikuHarmonyTimeoutId) { clearTimeout(mikuHarmonyTimeoutId); mikuHarmonyTimeoutId = null; }
    freeMoveModeActive = false;
    if (freeMoveTimeoutId) { clearTimeout(freeMoveTimeoutId); freeMoveTimeoutId = null; }
    document.getElementById('match3Grid').classList.remove('free-move-active');
    stopSpecialTimerBadge();
}

/**
 * Ends the current run immediately and shows the results screen early ("End"
 * button, any mode). Stage Clear respects hasEarnedVictory — quitting early
 * after already passing STAGE_CLEAR_VICTORY_LEVEL still counts as 'victory',
 * since that was already earned and quitting shouldn't take it away. Live
 * Performance stays 'normal' here regardless — only the clock actually
 * reaching 0 (naturally or via a deadlock penalty) counts as finishing a
 * performance; quitting early is still just quitting early. Leisure is
 * always 'normal' (no victory tier there at all).
 */
function endSessionNow() {
    if (isProcessing) return;
    gameOverScreen(currentMode === 'stageClear' && hasEarnedVictory ? 'victory' : 'normal');
}

/** Pause only makes sense in Live Performance (the only mode with a clock). */
function togglePause() {
    if (currentMode !== 'livePerformance') return;
    isPaused = !isPaused;

    const overlay = document.getElementById('pauseOverlay');
    const btn = document.getElementById('pauseBtn');
    if (isPaused) {
        stopPerformanceTimer();
        overlay.classList.remove('hidden');
        if (btn) btn.innerHTML = `<i class="fas fa-play" aria-hidden="true"></i> <span id="pauseBtnLabel" data-i18n="hud.resume">${t('hud.resume')}</span>`;
    } else {
        startPerformanceTimer();
        overlay.classList.add('hidden');
        if (btn) btn.innerHTML = `<i class="fas fa-pause" aria-hidden="true"></i> <span id="pauseBtnLabel" data-i18n="hud.pause">${t('hud.pause')}</span>`;
    }
}

/**
 * Shows the per-mode How-To-Play modal (auto-shown on start, reopenable via
 * the 📋 button). `isInitialShow` marks the automatic show at the very start
 * of a run — see confirmHowToPlay(), which uses it to know whether the Live
 * Performance clock still needs to be started once the player dismisses it.
 * Reopening it manually (isInitialShow false) mid-run freezes an already-
 * running Live Performance clock for as long as the modal stays open, same
 * idea as the Pause button — see howToPlayPausedTimer below.
 */
function showHowToPlay(isInitialShow = false) {
    howToPlayIsInitialShow = isInitialShow;
    howToPlayPausedTimer = false;

    if (!isInitialShow && currentMode === 'livePerformance' && performanceTimerId !== null) {
        stopPerformanceTimer();
        howToPlayPausedTimer = true;
    }

    renderHowToPlayBody();
    document.getElementById('howToPlayOverlay').classList.remove('hidden');
}

/**
 * Renders the How-To-Play modal's text for the current mode/character/
 * language, without touching visibility or the timer-freeze state. Split
 * out from showHowToPlay() so refreshDynamicTranslations() can re-render it
 * in place if the player switches language while it's already open.
 */
function renderHowToPlayBody() {
    const points = t(`howToPlay.${currentMode}`) || [];
    const bullets = Array.isArray(points) ? points.map(point => `<li>${point}</li>`).join('') : '';
    const specialName = t(`howToPlay.special.${currentCharacter}.name`);
    const specialDesc = t(`howToPlay.special.${currentCharacter}.desc`);
    const specialHtml = `<p class="how-to-play-special"><strong>${specialName}</strong> ${t('howToPlay.yourSpecial')}: ${specialDesc}</p>`;

    document.getElementById('howToPlayHeading').textContent = t('howToPlay.heading');
    document.getElementById('howToPlayBody').innerHTML = `<ul class="how-to-play-list">${bullets}</ul>${specialHtml}`;
    document.getElementById('howToPlayCloseBtn').textContent = t('howToPlay.gotIt');
}

function hideHowToPlay() {
    document.getElementById('howToPlayOverlay').classList.add('hidden');
}

/**
 * "Got it!" button handler. Resumes whatever showHowToPlay() froze: the
 * clock either wasn't running yet (initial show — see startGameWithMode())
 * or was frozen for the reopen itself (howToPlayPausedTimer). Guarded by
 * !isPaused so a manual Pause taken while How-To-Play happened to be open
 * doesn't get silently overridden — the player still has to hit Resume for
 * that.
 */
function confirmHowToPlay() {
    hideHowToPlay();
    if (currentMode === 'livePerformance' && !isPaused && (howToPlayIsInitialShow || howToPlayPausedTimer)) {
        startPerformanceTimer();
    }
    howToPlayIsInitialShow = false;
    howToPlayPausedTimer = false;
}

/**
 * Toggles HUD elements that are only meaningful for certain modes:
 * Stage Clear uses Moves/Goal/Level, Live Performance uses a countdown
 * Timer (+ Pause), Leisure Mode ('leisure' internally) uses neither.
 */
function applyModeVisibility() {
    const isStage = currentMode === 'stageClear';
    const isPerformance = currentMode === 'livePerformance';
    const isLeisure = currentMode === 'leisure';
    document.querySelectorAll('.hud-stage-only').forEach(el => el.classList.toggle('hidden', !isStage));
    document.querySelectorAll('.hud-performance-only').forEach(el => el.classList.toggle('hidden', !isPerformance));

    // Leisure swaps the two gameplay tips below the board for a single
    // centered "just relax" message — those tips don't really apply to a
    // no-stakes mode. See the matching CSS/HTML for board-footer-tips.
    document.getElementById('boardFooterTips').classList.toggle('leisure-centered', isLeisure);
    document.getElementById('footerTip1').classList.toggle('hidden', isLeisure);
    document.getElementById('footerTip2').classList.toggle('hidden', isLeisure);
    document.getElementById('footerTipLeisure').classList.toggle('hidden', !isLeisure);
}

/**
 * Fever-mode score multiplier: triple in Stage Clear/Leisure, double in
 * Live Performance (per that mode's own spec).
 */
function getFeverMultiplier() {
    if (!isFeverMode) return 1;
    return currentMode === 'livePerformance' ? 2 : 3;
}

/**
 * Cascade animation pacing: tiles drop faster during Live Performance fever.
 */
function cascadeDelay(ms) {
    return (currentMode === 'livePerformance' && isFeverMode) ? ms / 2 : ms;
}

/**
 * How many distinct tile types are in play. Stage Clear/Live Performance
 * add a 6th "bonus icon" type (see weightedRandomType); Leisure keeps the
 * original 5 since it has no moves/timer to grant.
 */
function getTileTypeCount() {
    return currentMode === 'leisure' ? 5 : 6;
}

/**
 * Spawn Weight System (rebalanced 7/18): bonus icon (the move-icon in Stage
 * Clear / time-icon in Live Performance) bumped up to 6% — now that it pays
 * a flat, modest +6 per match instead of a scaling jackpot, a bit more
 * frequency keeps the moves/time economy flowing steadily. The "39" tile
 * stays intentionally rarer than the 4 regular icons (12%) since it's a
 * purely cosmetic "lucky" tile with no functional payoff of its own. The 4
 * regular icons (one of which charges mana this run) split the remaining
 * 82% evenly, ~20.5% each.
 */
function weightedRandomType() {
    if (currentMode === 'leisure') {
        return Math.floor(Math.random() * 5);
    }
    if (currentMode === 'livePerformance' && livePerformanceHardMode) {
        // Late-game difficulty ramp (see triggerLivePerformanceHardMode()):
        // spread the 94% non-bonus roll evenly across all 5 non-bonus types
        // (0-4, including the "39" tile) instead of concentrating 82% into
        // just the 4 regular icons — no single type dominates the board, so
        // 3-in-a-rows are statistically harder to stumble into.
        const roll = Math.random();
        if (roll < 0.06) return 5;
        return Math.floor(Math.random() * 5);
    }
    const roll = Math.random();
    if (roll < 0.06) return 5;             // bonus move/time icon — 6%
    if (roll < 0.18) return 4;             // "39" lucky tile — 12%
    return Math.floor(Math.random() * 4);  // 4 regular icons share the remaining 82%
}

/**
 * Live Performance only, fires once per run: once the clock drops under
 * ~25% of its starting time (LIVE_PERFORMANCE_HARD_TIME_THRESHOLD), the
 * board gets harder — a one-time burst of extra obstacle tiles plus a
 * wider spawn spread for every refill from then on (see the hard-mode
 * branch in weightedRandomType()). obstacleTilesRemaining ticks up same as
 * Stage Clear's themed tiles, but since challengeType is never 'themedTile'
 * here, that count just rides along decoratively — matching these tiles
 * clears them normally, nothing else reads the counter in this mode.
 */
function triggerLivePerformanceHardMode() {
    livePerformanceHardMode = true;
    const config = CHARACTER_THEMES[currentCharacter];
    showBonusPopup(t('popup.hardModeFinalStretch'), config.baseColor);
    spawnObstacles(4);
    renderBoard();
}

/** Resets all run state and deals a fresh board — called on Play Again and whenever a mode starts. */
function resetGame() {
    score = 0;
    level = 1;
    movesLeft = 35;
    timeLeft = 90;
    comboChain = 0;
    bestCombo = 0;
    feverMeter = 0;
    isFeverMode = false;
    feverLevel = 0;
    feverBonusRoundActive = false;
    obstacleTilesRemaining = 0;
    manaEnergy = 0;
    isPaused = false;
    livePerformanceHardMode = false;
    placementModeActive = false;
    lastMatchedCell = null;
    selectedCell = null;
    isProcessing = false;
    challengeType = null;
    challengeIconType = null;
    challengeIconProgress = 0;
    specialWasReady = false;
    hasEarnedVictory = false;
    blossomBlastActive = false;

    stopAllTimers();

    const config = CHARACTER_THEMES[currentCharacter];
    // Randomize which regular icon charges the mana bar this run, and pick
    // which bonus icon (move vs. time) this mode should spawn on the board.
    manaChargeType = Math.floor(Math.random() * 4);
    config.runtimeBonusIcon = currentMode === 'livePerformance' ? config.boardTimeIcon : config.boardMoveIcon;
    updateManaChargeHint(config);

    document.getElementById('scoreDisplay').innerText = String(score).padStart(6, '0');
    document.getElementById('goalDisplay').innerText = stageClearGoalForLevel(level);
    document.getElementById('levelDisplay').innerText = level;
    document.getElementById('comboDisplay').innerText = 0;
    document.getElementById('movesDisplay').innerText = movesLeft;
    document.getElementById('timeDisplay').innerText = timeLeft;
    updateFeverHud();
    document.getElementById('resultsOverlay').classList.add('hidden');
    document.getElementById('pauseOverlay').classList.add('hidden');
    document.getElementById('boardBorder').classList.remove('fever-active-border');
    hidePortraitSpeechBubble();
    updateManaHud();
    updateChallengeHud();

    applyModeVisibility();
    updatePortrait('normal');

    generateBoard();
    renderBoard();

    // Live Performance's clock is NOT started here — callers start it
    // explicitly (see startGameWithMode()/confirmHowToPlay() and the
    // playAgainBtn handler) so it never ticks while How-To-Play is still
    // open on a fresh run.
}

/**
 * Flags `count` random board cells (regular icon types only, not "39" or
 * the bonus icon) as themed tiles for the Stage Clear timed challenge.
 */
function spawnObstacles(count) {
    const candidates = [];
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (boardState[r][c] && !boardState[r][c].obstacle && boardState[r][c].type <= 3) {
                candidates.push([r, c]);
            }
        }
    }

    for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = candidates[i];
        candidates[i] = candidates[j];
        candidates[j] = temp;
    }

    const picks = candidates.slice(0, Math.min(count, candidates.length));
    picks.forEach(([r, c]) => {
        boardState[r][c].obstacle = true;
    });

    obstacleTilesRemaining += picks.length;
}

/** Strips every obstacle flag from the board (used when a themed-tile challenge ends). */
function clearAllObstacles() {
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (boardState[r][c]) boardState[r][c].obstacle = false;
        }
    }
    obstacleTilesRemaining = 0;
    renderBoard();
}

/**
 * Fills the mana bar (caps at 100) and refreshes the Special button's
 * enabled/glowing state. It drains back to 0 all at once in activateSpecial().
 */
function chargeMana(amount) {
    manaEnergy = Math.min(100, manaEnergy + amount);
    updateManaHud();
}

/**
 * Syncs the mana bar's visual fill height + the Special button's enabled/
 * glow state to `manaEnergy`. Also plays the character's "special move is
 * ready" sound exactly once on the rising edge (manaEnergy first reaching
 * 100), tracked via `specialWasReady` so it doesn't replay on every HUD
 * refresh while sitting at full.
 *
 * For Sakura specifically, "ready" also requires no Blossom Blast
 * detonators still pending — the bar itself stays visually full the whole
 * time they're out (see updateBlossomBlastNotice()), but the button stays
 * locked so a second click can't stack more on top of the first batch.
 */
function updateManaHud() {
    const fill = document.getElementById('manaBarFill');
    const track = fill && fill.closest('.mana-bar-track');
    const btn = document.getElementById('specialBtn');
    if (fill) fill.style.height = `${manaEnergy}%`;
    if (track) track.setAttribute('aria-valuenow', Math.round(manaEnergy));
    if (btn) {
        const blossomPending = currentCharacter === 'sakura' && blossomBlastActive;
        const ready = manaEnergy >= 100 && !blossomPending;
        btn.disabled = !ready;
        btn.classList.toggle('special-ready', ready);
        if (ready && !specialWasReady) {
            CharacterSFX.playEvent('specialReady');
        }
        specialWasReady = ready;
    }
}

/** Updates the small "charges from" icon next to the mana bar to match this run's `manaChargeType`. */
function updateManaChargeHint(config) {
    const img = document.getElementById('manaChargeIcon');
    if (img) {
        img.src = config.boardIcons[manaChargeType];
        img.title = t('special.manaChargeHint', { icon: humanizeIconName(config.boardIcons[manaChargeType]) });
    }
}

/**
 * ============================================================================
 * 7. FEVER ECONOMY: LEVELING SYSTEM, MILESTONES & TIMED CHALLENGES
 * ============================================================================
 * The fever meter behaves like an XP bar: matching fills it, and hitting
 * 100% "levels up" — feverLevel++, the meter resets to 0, and the player
 * gets a flat bonus (levelUpFever(), which replaces the old
 * triggerFeverMode()). It no longer drains on its own while idle — progress
 * only ever moves forward from matching, never backward from sitting still.
 * The flashy buffed state (isFeverMode: score multiplier, glow, faster
 * cascades) is not tied to every level-up — it only turns on for the *bonus
 * round* that runs alongside the themed-tile/icon challenge at fever level
 * 4, then every 10 levels after that (4, 14, 24, 34...), and turns back off
 * the moment that challenge resolves (see
 * startFeverBonusRound() / endFeverBonusRound()). Every 10th level
 * additionally grants a milestone reward, boosted by how many bonus-icon
 * tiles are on the board right then. Runs in all 3 modes; Leisure/Leisure
 * Mode just gets a celebratory popup since it has no moves/timer to
 * actually reward (see levelUpFever()).
 */

/** Syncs the fever bar's fill % to the current feverMeter. */
function updateFeverHud() {
    const pct = document.getElementById('feverProgressPercent');
    const bar = document.getElementById('feverBar');
    if (pct) pct.innerText = `${Math.floor(feverMeter)}%`;
    if (bar) bar.style.width = `${feverMeter}%`;
}

/** Counts bonus-icon (move/time) tiles currently on the board — the every-10th-level milestone scales its reward off this. */
function countBonusIconsOnBoard() {
    let count = 0;
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (boardState[r][c] && boardState[r][c].type === 5) count++;
        }
    }
    return count;
}

/**
 * Called whenever the fever meter fills to 100 (from matching, or a Live
 * Performance 5x combo — see processMatchCycles). Levels up: resets the
 * meter, increments feverLevel, and (outside Leisure/Leisure Mode) grants a
 * flat bonus every time, a full Fever Mode bonus round at level 4 and then
 * every 10 levels after (4, 14, 24, 34...), and an icon-scaled milestone
 * every 10th level.
 */
function levelUpFever() {
    feverLevel++;
    feverMeter = 0;
    updateFeverHud();

    const config = CHARACTER_THEMES[currentCharacter];

    if (currentMode === 'leisure') {
        // Leisure Mode has no moves/timer to grant, so a level-up is purely
        // a celebratory flourish here — see the project notes for other
        // ideas on what Fever could do in this relaxed mode.
        showBonusPopup(t('popup.feverLevelUpSparkle', { level: feverLevel }), config.baseColor);
        playSpecialBurst(config.baseColor);
        return;
    }

    score += 100;
    document.getElementById('scoreDisplay').innerText = String(score).padStart(6, '0');
    showBonusPopup(t('popup.feverLevelUpPoints', { level: feverLevel }), config.baseColor);

    // Fever level 4, then every 10 after that (4, 14, 24, 34...): the
    // buffed Fever Mode state and the mode-specific timed challenge now
    // activate together, for a fixed 30s bonus round.
    if (feverLevel >= 4 && (feverLevel - 4) % 10 === 0 && !challengeType) {
        startFeverBonusRound();
    }

    // Every 10th level: milestone bonus, boosted by remaining bonus icons.
    if (feverLevel % 10 === 0) {
        awardFeverMilestone();
    }
}

/** Turns on the buffed Fever Mode state and starts the paired timed challenge — they now begin and end together (fever level 4, then every 10 after). */
function startFeverBonusRound() {
    isFeverMode = true;
    feverBonusRoundActive = true;
    AudioSynth.playFever();
    SFX.play('feverStart');
    updatePortrait('fever');
    document.getElementById('boardBorder').classList.add('fever-active-border');

    if (currentMode === 'stageClear') {
        startThemedTileChallenge();
    } else if (currentMode === 'livePerformance') {
        startIconMatchChallenge();
    }
}

/** Turns off the buffed Fever Mode state — called once the paired challenge resolves (success or timeout). */
function endFeverBonusRound() {
    isFeverMode = false;
    feverBonusRoundActive = false;
    document.getElementById('boardBorder').classList.remove('fever-active-border');
    updatePortrait('normal');
}

/**
 * Every-10th-level milestone: a flat bonus, plus +1 per remaining move-icon
 * on the board (Stage Clear) or +3 per remaining time-icon on the board
 * (Live Performance — "more seconds" per icon, since the base unit is
 * smaller than a whole move).
 */
function awardFeverMilestone() {
    const config = CHARACTER_THEMES[currentCharacter];
    const remainingIcons = countBonusIconsOnBoard();
    if (currentMode === 'stageClear') {
        // Pays out in points, not moves — moves are meant to be the scarce
        // resource that makes Stage Clear feel different from Leisure, so
        // this milestone shouldn't be refilling it. Same base+icon-scaling
        // shape as the old moves grant (15 -> 150, +1/icon -> +10/icon).
        const gain = 150 + remainingIcons * 10;
        score += gain;
        document.getElementById('scoreDisplay').innerText = String(score).padStart(6, '0');
        showBonusPopup(t('popup.feverMilestonePoints', { gain, level: feverLevel }), config.baseColor);
    } else if (currentMode === 'livePerformance') {
        const gain = 30 + remainingIcons * 3;
        timeLeft += gain;
        document.getElementById('timeDisplay').innerText = Math.ceil(timeLeft);
        showBonusPopup(t('popup.feverMilestoneSeconds', { gain, level: feverLevel }), config.baseColor);
    }
}

/** Stage Clear only: 6 themed tiles appear, 30s to clear them all (fires alongside startFeverBonusRound() at fever level 4, then every 10 after; moves don't cost while this is active — see executeSwap). */
function startThemedTileChallenge() {
    challengeType = 'themedTile';
    spawnObstacles(6);
    renderBoard();
    challengeTimeLeft = 30;
    updateChallengeHud();
    showBonusPopup(t('popup.themedTileChallengeStart'), CHARACTER_THEMES[currentCharacter].baseColor);

    challengeTimerId = setInterval(() => {
        if (isPaused) return;
        challengeTimeLeft -= 1;
        updateChallengeHud();
        if (challengeTimeLeft <= 0) {
            endThemedTileChallenge(false);
        }
    }, 1000);
}

/** Wraps up the Stage Clear themed-tile challenge — full reward on `success`, half reward on timeout — then ends the paired Fever Mode bonus round. */
function endThemedTileChallenge(success) {
    stopChallengeTimer();
    const config = CHARACTER_THEMES[currentCharacter];
    if (success) {
        score += 200;
        movesLeft += 10;
        showBonusPopup(t('popup.themedTileChallengeWin'), config.baseColor);
        SFX.play('challengeSuccess');
    } else {
        score += 100;
        movesLeft += 5;
        showBonusPopup(t('popup.challengeTimeUpHalf'), config.baseColor);
    }
    document.getElementById('scoreDisplay').innerText = String(score).padStart(6, '0');
    document.getElementById('movesDisplay').innerText = movesLeft;
    challengeType = null;
    clearAllObstacles();
    updateChallengeHud();
    endFeverBonusRound();
}

/**
 * Live Performance only: match one specific icon 4 times within 60s (fires
 * alongside startFeverBonusRound() at fever level 4, then every 10 after).
 * The main performance clock is frozen for this whole window (see
 * startPerformanceTimer()'s feverBonusRoundActive check) so the player isn't
 * fighting two clocks at once; the matching icon itself glows on the board
 * (see renderBoard()'s challenge-icon-tile class) and the challenge banner
 * grows larger (see updateChallengeHud()) so the objective is unmissable.
 */
function startIconMatchChallenge() {
    challengeType = 'iconChallenge';
    challengeIconType = Math.floor(Math.random() * 4);
    challengeIconProgress = 0;
    challengeTimeLeft = 60;
    updateChallengeHud();
    renderBoard();
    const config = CHARACTER_THEMES[currentCharacter];
    showBonusPopup(t('popup.iconChallengeStart', { icon: humanizeIconName(config.boardIcons[challengeIconType]) }), config.baseColor);

    challengeTimerId = setInterval(() => {
        if (isPaused) return;
        challengeTimeLeft -= 1;
        updateChallengeHud();
        if (challengeTimeLeft <= 0) {
            endIconChallenge(false);
        }
    }, 1000);
}

/** Wraps up the Live Performance icon-match challenge — full reward on `success`, half reward on timeout — then ends the paired Fever Mode bonus round. */
function endIconChallenge(success) {
    stopChallengeTimer();
    const config = CHARACTER_THEMES[currentCharacter];
    if (success) {
        score += 250;
        timeLeft += 25;
        showBonusPopup(t('popup.iconChallengeWin'), config.baseColor);
        SFX.play('challengeSuccess');
    } else {
        score += 125;
        timeLeft += 12;
        showBonusPopup(t('popup.challengeTimeUpHalf'), config.baseColor);
    }
    document.getElementById('scoreDisplay').innerText = String(score).padStart(6, '0');
    document.getElementById('timeDisplay').innerText = Math.ceil(timeLeft);
    challengeType = null;
    updateChallengeHud();
    renderBoard();
    endFeverBonusRound();
}

/** Stops whichever timed challenge (themed-tile or icon-match) is currently running, if any. */
function stopChallengeTimer() {
    if (challengeTimerId) {
        clearInterval(challengeTimerId);
        challengeTimerId = null;
    }
}

/**
 * Renders the compact challenge banner (hidden when no challenge is
 * active). The Live Performance icon challenge gets a distinct larger/
 * glowing look (.icon-challenge-active, see miku-style.css) so the
 * objective reads as unmissable, matching its matching tiles glowing on
 * the board (see renderBoard()).
 */
function updateChallengeHud() {
    const banner = document.getElementById('challengeBanner');
    if (!banner) return;
    if (!challengeType) {
        banner.classList.add('hidden');
        banner.classList.remove('icon-challenge-active');
        return;
    }
    banner.classList.remove('hidden');
    if (challengeType === 'themedTile') {
        banner.classList.remove('icon-challenge-active');
        banner.textContent = t('challenge.themedTileBanner', { remaining: obstacleTilesRemaining, seconds: challengeTimeLeft });
    } else if (challengeType === 'iconChallenge') {
        banner.classList.add('icon-challenge-active');
        const config = CHARACTER_THEMES[currentCharacter];
        banner.textContent = t('challenge.iconMatchBanner', { icon: humanizeIconName(config.boardIcons[challengeIconType]), progress: challengeIconProgress, seconds: challengeTimeLeft });
    }
}

/**
 * Live Performance's main countdown clock — ticks every second, ends the run
 * at 0 (via gameOverScreen). Frozen (not just paused — the challenge's own
 * timer keeps running) while feverBonusRoundActive, so the icon-match
 * challenge's own 60s window doesn't also cost the player their main clock.
 */
function startPerformanceTimer() {
    stopPerformanceTimer();
    performanceTimerId = setInterval(() => {
        if (isPaused || feverBonusRoundActive) return;
        timeLeft -= 1;

        if (!livePerformanceHardMode && timeLeft <= LIVE_PERFORMANCE_HARD_TIME_THRESHOLD) {
            triggerLivePerformanceHardMode();
        }

        if (timeLeft <= 0) {
            timeLeft = 0;
            document.getElementById('timeDisplay').innerText = 0;
            stopPerformanceTimer();

            // Live Performance has no fail state now — the clock reaching 0
            // naturally always means a completed performance, a win.
            const finishRun = () => gameOverScreen('victory');
            if (!isProcessing) {
                finishRun();
            } else {
                const waitId = setInterval(() => {
                    if (!isProcessing) {
                        clearInterval(waitId);
                        finishRun();
                    }
                }, 200);
            }
            return;
        }

        document.getElementById('timeDisplay').innerText = Math.ceil(timeLeft);
    }, 1000);
}

/** Stops the Live Performance countdown interval started by startPerformanceTimer(). */
function stopPerformanceTimer() {
    if (performanceTimerId) {
        clearInterval(performanceTimerId);
        performanceTimerId = null;
    }
}

/** Fills `boardState` with fresh random tiles for a new game, avoiding any accidental pre-made matches. */
function generateBoard() {
    boardState = [];
    for (let r = 0; r < GRID_SIZE; r++) {
        boardState[r] = [];
        for (let c = 0; c < GRID_SIZE; c++) {
            do {
                boardState[r][c] = {
                    type: weightedRandomType(),
                    id: Math.random().toString(36).substring(2, 9),
                    clearing: false
                };
            } while (
                (r >= 2 && boardState[r-1][c].type === boardState[r][c].type && boardState[r-2][c].type === boardState[r][c].type) ||
                (c >= 2 && boardState[r][c-1].type === boardState[r][c].type && boardState[r][c-2].type === boardState[r][c].type)
            );
        }
    }

    let possibleMoves = hasPossibleMoves();
    let safetyLimit = 0;
    while (!possibleMoves && safetyLimit < 15) {
        reshuffleBoard(false);
        possibleMoves = hasPossibleMoves();
        safetyLimit++;
    }
}

/** Draws every board cell fresh from `boardState` (called after any change to it). */
function renderBoard() {
    const gridContainer = document.getElementById('match3Grid');
    gridContainer.innerHTML = '';
    const config = CHARACTER_THEMES[currentCharacter];

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const item = boardState[r][c];
            const cell = document.createElement('button');

            cell.type = 'button';
            cell.setAttribute('data-row', r);
            cell.setAttribute('data-col', c);
            cell.setAttribute('role', 'gridcell');
            cell.className = 'grid-cell-item'
                + (item && item.obstacle ? ' obstacle-tile' : '')
                + (item && item.type === 5 ? ' bonus-icon-tile' : '')
                + (item && challengeType === 'iconChallenge' && item.type === challengeIconType ? ' challenge-icon-tile' : '')
                + (item && item.detonator ? ' detonator-tile' : '');
            cell.id = `cell-${r}-${c}`;

            // Programmatic listener bindings for grid cells
            cell.addEventListener('mousedown', handleDragStart);
            cell.addEventListener('mouseup', handleDragEnd);
            cell.addEventListener('touchstart', handleTouchStart, { passive: true });
            cell.addEventListener('touchend', handleTouchEnd, { passive: true });
            cell.addEventListener('click', handleCellSelect);

            if (item) {
                if (item.type === 4) {
                    const svgElem = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                    svgElem.setAttribute("viewBox", "0 0 100 100");
                    svgElem.setAttribute("class", "cell-icon");
                    svgElem.innerHTML = config.svg39;
                    cell.appendChild(svgElem);
                    cell.setAttribute('aria-label', 'Lucky 39 tile');
                } else if (item.type === 5) {
                    const img = document.createElement('img');
                    img.className = 'cell-icon';
                    img.src = config.runtimeBonusIcon || config.boardMoveIcon;
                    img.alt = '';
                    cell.appendChild(img);
                    cell.setAttribute('aria-label', currentMode === 'livePerformance' ? 'Bonus time icon tile' : 'Bonus move icon tile');
                } else {
                    const img = document.createElement('img');
                    img.className = 'cell-icon';
                    img.src = config.boardIcons[item.type];
                    img.alt = '';
                    cell.appendChild(img);
                    const baseLabel = humanizeIconName(config.boardIcons[item.type]);
                    cell.setAttribute('aria-label', item.obstacle ? `${config.obstacleName} obstacle tile` : `${baseLabel} tile`);
                }
                if (item.detonator) {
                    cell.setAttribute('aria-label', `${cell.getAttribute('aria-label')} — Blossom Blast detonator, click to clear a 3x3 area`);
                }
            }
            gridContainer.appendChild(cell);
        }
    }
}

/** Swaps the sidebar portrait's CSS "expression" class (happy/fever/sad/etc.) and its glow aura. */
function updatePortrait(expression) {
    const portraitEl = document.getElementById('mikuPortraitImg');
    if (portraitEl) {
        portraitEl.classList.remove('expr-happy', 'expr-combo', 'expr-fever', 'expr-worried', 'expr-sad', 'expr-normal');
        portraitEl.classList.add(`expr-${expression}`);
    }

    const aura = document.getElementById('portraitAura');
    if (expression === 'fever') {
        aura.style.transform = 'scale(1.22)';
        aura.style.opacity = '0.75';
    } else if (expression === 'happy' || expression === 'combo') {
        aura.style.transform = 'scale(1.08)';
        aura.style.opacity = '0.45';
    } else {
        aura.style.transform = 'scale(0.9)';
        aura.style.opacity = '0.25';
    }
}

/**
 * ============================================================================
 * PORTRAIT FRAMING (code-only — no in-game zoom/pan controls)
 * ============================================================================
 * Both the roster card portraits and the in-game sidebar portrait are
 * rendered as CSS backgrounds (not <img> elements), positioned/zoomed via
 * CSS background-position/background-size. Framing is intentionally NOT
 * exposed to the player — the previous version had −/Reset/+ buttons and
 * click-drag panning, but scaling a raster image up at runtime (especially
 * past ~1.5-2x) is exactly what caused the heavy pixelation/antialiasing
 * complaints. The fix (matching the technique already proven out in the
 * Vocaloid-Hub / Voicebank-Central projects) is to remove runtime scaling
 * entirely and hand-tune one fixed {x, y, scale} per character instead.
 *
 * The two surfaces are driven by two SEPARATE configs on each
 * CHARACTER_THEMES entry — tune one without touching the other:
 *   cardPortraitFrame    — the roster screen card (main page). Applied to
 *                          every card at once by applyCardPortraitFraming()
 *                          below, called once on DOMContentLoaded.
 *   sidebarPortraitFrame — the in-game sidebar portrait (game page).
 *                          Applied to #mikuPortraitImg by selectCharacter()
 *                          each time a character is chosen.
 * Both configs share the same shape:
 *   x, y     — background-position (CSS percentages, or "left"/"center"/
 *              "top" etc.) — which point of the source image sits at the
 *              matching point of the circular frame.
 *   scale    — background-size (a CSS percentage; 100% = the whole image
 *              fitted to the frame with no crop, so anything above 100%
 *              crops in/zooms). Keep this modest — these are already large
 *              1920x1440 source PNGs being downscaled, not upscaled.
 */

/** Sets one element's background-position/-size from a `{x, y, scale}` frame config. */
function applyPortraitFraming(el, frame) {
    if (!el || !frame) return;
    el.style.backgroundPosition = `${frame.x} ${frame.y}`;
    el.style.backgroundSize = frame.scale;
}

/**
 * Paints every roster card's portrait from that character's
 * `cardPortraitFrame` (image + themed gradient backdrop + position/size) —
 * called once on DOMContentLoaded, since the roster cards are static markup
 * and don't change at runtime the way the sidebar portrait does.
 */
function applyCardPortraitFraming() {
    Object.entries(CHARACTER_THEMES).forEach(([key, config]) => {
        const cardPortrait = document.querySelector(`.character-card[data-char="${key}"] .card-portrait`);
        if (!cardPortrait || !config.cardPortraitFrame) return;
        cardPortrait.style.backgroundImage =
            `url('${PORTRAIT_IMAGES[key]}'), radial-gradient(circle, var(--theme-color-soft) 0%, var(--theme-color) 100%)`;
        cardPortrait.style.backgroundPosition = `${config.cardPortraitFrame.x} ${config.cardPortraitFrame.y}, center`;
        cardPortrait.style.backgroundSize = `${config.cardPortraitFrame.scale}, cover`;
    });
}

/**
 * Cell interactions logic
 */
function handleCellSelect(e) {
    const target = e.currentTarget;
    const r = parseInt(target.getAttribute('data-row'));
    const c = parseInt(target.getAttribute('data-col'));

    // Sakura's Blossom Blast: a flashing detonator tile can be clicked any
    // time (even mid-selection, even while otherwise gated below) to
    // trigger its 3x3 clear instead of being picked up for a normal swap.
    if (boardState[r] && boardState[r][c] && boardState[r][c].detonator) {
        detonateBlossomTile(r, c);
        return;
    }

    if (isProcessing || isPaused || placementModeActive) return;

    AudioSynth.playTap();

    if (selectedCell === null) {
        selectedCell = { row: r, col: c };
        target.classList.add('cell-selected');
    } else {
        const prevCell = document.getElementById(`cell-${selectedCell.row}-${selectedCell.col}`);
        if (prevCell) {
            prevCell.classList.remove('cell-selected');
        }

        const isSameCell = selectedCell.row === r && selectedCell.col === c;
        // Space Singer's Cosmic Gravity temporarily lifts the adjacency
        // requirement so any two tiles on the board can be swapped.
        const isAdjacent = !isSameCell && (freeMoveModeActive ||
                           (Math.abs(selectedCell.row - r) === 1 && selectedCell.col === c) ||
                           (Math.abs(selectedCell.col - c) === 1 && selectedCell.row === r));

        if (isAdjacent) {
            executeSwap(selectedCell.row, selectedCell.col, r, c);
        } else {
            selectedCell = { row: r, col: c };
            target.classList.add('cell-selected');
        }
    }
}

/** Records the starting touch position/cell for a swipe-to-swap gesture. */
function handleTouchStart(e) {
    if (isProcessing || isPaused || placementModeActive) return;
    const target = e.currentTarget;
    const r = parseInt(target.getAttribute('data-row'));
    const c = parseInt(target.getAttribute('data-col'));

    // A swipe starting on a Blossom Blast detonator tile used to just try a
    // normal directional swap (the tile would move or the swipe would fail
    // silently) — same detonator short-circuit as handleCellSelect's click
    // path, so tapping vs. swiping a detonator both actually detonate it.
    if (boardState[r] && boardState[r][c] && boardState[r][c].detonator) {
        detonateBlossomTile(r, c);
        return;
    }

    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    dragStartRow = r;
    dragStartCol = c;
}

/** Resolves a swipe gesture into a direction and attempts the swap if it lands on an adjacent cell. */
function handleTouchEnd(e) {
    if (isProcessing || dragStartRow === null) return;
    const touch = e.changedTouches[0];
    const diffX = touch.clientX - touchStartX;
    const diffY = touch.clientY - touchStartY;
    const minSwipeDistance = 35;

    let targetRow = dragStartRow;
    let targetCol = dragStartCol;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > minSwipeDistance) {
            targetCol = dragStartCol + (diffX > 0 ? 1 : -1);
        }
    } else {
        if (Math.abs(diffY) > minSwipeDistance) {
            targetRow = dragStartRow + (diffY > 0 ? 1 : -1);
        }
    }

    if (targetRow >= 0 && targetRow < GRID_SIZE && targetCol >= 0 && targetCol < GRID_SIZE) {
        if (targetRow !== dragStartRow || targetCol !== dragStartCol) {
            executeSwap(dragStartRow, dragStartCol, targetRow, targetCol);
        }
    }

    dragStartRow = null;
    dragStartCol = null;
}

/** Records the starting cell for a mouse click-and-drag swap gesture (desktop equivalent of touch swipe). */
function handleDragStart(e) {
    if (isProcessing || isPaused || placementModeActive) return;
    const target = e.currentTarget;
    const r = parseInt(target.getAttribute('data-row'));
    const c = parseInt(target.getAttribute('data-col'));

    // Same detonator short-circuit as handleTouchStart/handleCellSelect —
    // dragging from a detonator tile used to just attempt a normal swap.
    if (boardState[r] && boardState[r][c] && boardState[r][c].detonator) {
        detonateBlossomTile(r, c);
        return;
    }

    dragStartRow = r;
    dragStartCol = c;
}

/** Resolves a mouse drag into a direction and attempts the swap if it lands on an adjacent cell. */
function handleDragEnd(e) {
    if (isProcessing || dragStartRow === null) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const diffX = e.clientX - (rect.left + rect.width / 2);
    const diffY = e.clientY - (rect.top + rect.height / 2);
    const threshold = rect.width / 2;

    let targetRow = dragStartRow;
    let targetCol = dragStartCol;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > threshold) {
            targetCol = dragStartCol + (diffX > 0 ? 1 : -1);
        }
    } else {
        if (Math.abs(diffY) > threshold) {
            targetRow = dragStartRow + (diffY > 0 ? 1 : -1);
        }
    }

    if (targetRow >= 0 && targetRow < GRID_SIZE && targetCol >= 0 && targetCol < GRID_SIZE) {
        if (targetRow !== dragStartRow || targetCol !== dragStartCol) {
            executeSwap(dragStartRow, dragStartCol, targetRow, targetCol);
        }
    }

    dragStartRow = null;
    dragStartCol = null;
}

/** Racing's Turbo Blitz targeting: highlights the hovered cell's full row+column. */
function handleReticleMove(e) {
    if (!placementModeActive) return;
    const cell = e.target.closest('.grid-cell-item');
    if (!cell) return;
    highlightReticle(parseInt(cell.getAttribute('data-row')), parseInt(cell.getAttribute('data-col')));
}

/** Adds the `.reticle-highlight` class to every cell in the given row+column (Turbo Blitz aiming). */
function highlightReticle(row, col) {
    clearReticleHighlight();
    for (let r = 0; r < GRID_SIZE; r++) {
        const cell = document.getElementById(`cell-${r}-${col}`);
        if (cell) cell.classList.add('reticle-highlight');
    }
    for (let c = 0; c < GRID_SIZE; c++) {
        const cell = document.getElementById(`cell-${row}-${c}`);
        if (cell) cell.classList.add('reticle-highlight');
    }
}

/** Removes the Turbo Blitz row/column highlight from every cell. */
function clearReticleHighlight() {
    document.querySelectorAll('.reticle-highlight').forEach(el => el.classList.remove('reticle-highlight'));
}

/** Confirms Racing's Turbo Blitz placement when the player clicks while aiming. */
function handleGridPlacementClick(e) {
    if (!placementModeActive) return;
    const cell = e.target.closest('.grid-cell-item');
    if (!cell) return;
    resolveTurboBlitz(parseInt(cell.getAttribute('data-row')), parseInt(cell.getAttribute('data-col')));
}

/** Animates and applies a tile swap; if it creates a match, spends a move (Stage Clear) and resolves the cascade — otherwise animates the swap back. */
async function executeSwap(r1, c1, r2, c2) {
    isProcessing = true;
    selectedCell = null;

    const cell1 = document.getElementById(`cell-${r1}-${c1}`);
    const cell2 = document.getElementById(`cell-${r2}-${c2}`);

    const dx = cell2.offsetLeft - cell1.offsetLeft;
    const dy = cell2.offsetTop - cell1.offsetTop;

    cell1.style.transform = `translate(${dx}px, ${dy}px)`;
    cell2.style.transform = `translate(${-dx}px, ${-dy}px)`;

    await new Promise(resolve => setTimeout(resolve, 250));

    cell1.style.transform = '';
    cell2.style.transform = '';

    const temp = boardState[r1][c1];
    boardState[r1][c1] = boardState[r2][c2];
    boardState[r2][c2] = temp;

    renderBoard();

    const matches = findMatches();
    if (matches.length > 0) {
        // Moves are free during the Stage Clear Fever Mode bonus round
        // (the themed-tile challenge window) — see feverBonusRoundActive.
        if (currentMode === 'stageClear' && !feverBonusRoundActive) {
            movesLeft--;
            document.getElementById('movesDisplay').innerText = movesLeft;
        }
        comboChain = 1;
        await processMatchCycles();
    } else if (freeMoveModeActive) {
        // Cosmic Gravity: this is a real "place it wherever" rearrangement,
        // not just an adjacency exemption — a non-matching swap is kept
        // instead of rolling back, and it's not treated as a mistake (no
        // error sound/portrait reaction). See cosmicGravityFailsafe() for
        // the safety net once the window closes and normal rules resume.
        isProcessing = false;
        comboChain = 0;
        document.getElementById('comboDisplay').innerText = comboChain;
        updatePortrait('normal');
    } else {
        AudioSynth.playError();

        const nextCell1 = document.getElementById(`cell-${r1}-${c1}`);
        const nextCell2 = document.getElementById(`cell-${r2}-${c2}`);
        nextCell1.style.transform = `translate(${dx}px, ${dy}px)`;
        nextCell2.style.transform = `translate(${-dx}px, ${-dy}px)`;

        await new Promise(resolve => setTimeout(resolve, 200));

        nextCell1.style.transform = '';
        nextCell2.style.transform = '';

        const rollback = boardState[r1][c1];
        boardState[r1][c1] = boardState[r2][c2];
        boardState[r2][c2] = rollback;
        renderBoard();

        isProcessing = false;
        comboChain = 0;
        document.getElementById('comboDisplay').innerText = comboChain;
        updatePortrait('normal');
    }
}

/**
 * Scans the board for every contiguous straight run (>=3) of matching tiles,
 * horizontal and vertical — classic Bejeweled matching, nothing shape-based.
 * Returns groups (not just a flat cell list) so callers can tell how big an
 * individual run was.
 */
function findMatchGroups() {
    const groups = [];

    // Horizontal runs
    for (let r = 0; r < GRID_SIZE; r++) {
        let runStart = 0;
        for (let c = 1; c <= GRID_SIZE; c++) {
            const sameAsPrev = c < GRID_SIZE && boardState[r][c] && boardState[r][c - 1] && boardState[r][c].type === boardState[r][c - 1].type;
            if (!sameAsPrev) {
                const runLength = c - runStart;
                if (runLength >= 3) {
                    const cells = [];
                    for (let i = runStart; i < c; i++) cells.push({ row: r, col: i });
                    groups.push({ type: boardState[r][runStart].type, cells });
                }
                runStart = c;
            }
        }
    }

    // Vertical runs (kept independent of the horizontal runs above, so a
    // normal cross-shaped swap creating a horizontal 3 and a vertical 3
    // that share one pivot cell still correctly produces two groups)
    for (let c = 0; c < GRID_SIZE; c++) {
        let runStart = 0;
        for (let r = 1; r <= GRID_SIZE; r++) {
            const sameAsPrev = r < GRID_SIZE && boardState[r][c] && boardState[r - 1][c] && boardState[r][c].type === boardState[r - 1][c].type;
            if (!sameAsPrev) {
                const runLength = r - runStart;
                if (runLength >= 3) {
                    const cells = [];
                    for (let i = runStart; i < r; i++) cells.push({ row: i, col: c });
                    groups.push({ type: boardState[runStart][c].type, cells });
                }
                runStart = r;
            }
        }
    }

    return groups;
}

/** Flattens+de-duplicates match groups into a plain cell list (what most callers actually need). */
function flattenGroups(groups) {
    const seen = new Set();
    const flat = [];
    groups.forEach(group => {
        group.cells.forEach(cell => {
            const key = `${cell.row}-${cell.col}`;
            if (!seen.has(key)) {
                seen.add(key);
                flat.push(cell);
            }
        });
    });
    return flat;
}

/** Horizontal & Vertical matches finder — flat cell list, for callers that don't need groups. */
function findMatches() {
    return flattenGroups(findMatchGroups());
}

/**
 * Shared column-collapse + weighted-refill physics, reused by cascades and
 * every special ability. Returns a `{"row-col": rowsFallen}` map so the
 * caller can play the actual falling motion afterward (see
 * animateBoardDrop()) — surviving tiles fall however many rows they
 * shifted down; brand new tiles are treated as dropping in from just above
 * the board (row -1), so a new tile landing near the top falls a shorter
 * distance than one landing near the bottom of the same column.
 */
function collapseAndRefill() {
    const fallDistances = {};

    for (let c = 0; c < GRID_SIZE; c++) {
        let emptySpaceIndex = GRID_SIZE - 1;
        for (let r = GRID_SIZE - 1; r >= 0; r--) {
            if (boardState[r][c] !== null) {
                if (emptySpaceIndex !== r) {
                    boardState[emptySpaceIndex][c] = boardState[r][c];
                    boardState[r][c] = null;
                    fallDistances[`${emptySpaceIndex}-${c}`] = emptySpaceIndex - r;
                }
                emptySpaceIndex--;
            }
        }
        for (let r = emptySpaceIndex; r >= 0; r--) {
            boardState[r][c] = {
                type: weightedRandomType(),
                id: Math.random().toString(36).substring(2, 9),
                clearing: false
            };
            fallDistances[`${r}-${c}`] = r + 1;
        }
    }

    return fallDistances;
}

/**
 * Plays the falling motion for collapseAndRefill()'s result — call right
 * after the renderBoard() that follows it. Each affected cell is pre-offset
 * upward by its fall distance (translateY in cell-heights via %, so it
 * doesn't matter these are freshly-created DOM nodes with no prior position
 * to animate from) with transitions disabled, then on the next frame gets
 * its transition re-enabled and the offset cleared — same "set the end
 * state, let CSS ease you there" approach executeSwap() uses, just
 * vertical-only and starting from a synthetic offset instead of a real one.
 * The double rAF is the standard way to guarantee the browser has actually
 * painted the "no transition" offset before we flip to the animated state;
 * one rAF alone isn't reliably ordered before paint in every browser.
 */
function animateBoardDrop(fallDistances) {
    const entries = Object.entries(fallDistances);
    if (entries.length === 0) return;

    const cells = [];
    for (const [key, distance] of entries) {
        const cell = document.getElementById(`cell-${key}`);
        if (!cell) continue;
        cell.style.transition = 'none';
        cell.style.transform = `translateY(${-distance * 100}%)`;
        cells.push({ cell, distance });
    }

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            cells.forEach(({ cell, distance }) => {
                const duration = cascadeDelay(Math.min(480, 200 + distance * 55));
                cell.style.transition = `transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`;
                cell.style.transform = '';
                setTimeout(() => { cell.style.transition = ''; }, duration + 30);
            });
        });
    });
}

/**
 * Cascading clear physical logic. Runs once per swap (and once per special
 * ability), looping for as long as clearing tiles keeps creating new matches.
 */
async function processMatchCycles() {
    let groups = findMatchGroups();
    let matches = flattenGroups(groups);
    let comboFeverTriggeredThisCascade = false;

    while (matches.length > 0) {
        // Live Performance: one Fever trigger per cascade when combo hits 5+
        if (currentMode === 'livePerformance' && !comboFeverTriggeredThisCascade && comboChain >= 5) {
            comboFeverTriggeredThisCascade = true;
            levelUpFever();
        }

        updatePortrait(comboChain > 1 ? 'combo' : 'happy');

        if (matches.length > 4) {
            AudioSynth.playMegaMatch();
            SFX.play('megaMatch');
        } else {
            AudioSynth.playMatch();
        }

        // Scoring
        const basePoints = matches.length * 50;
        const chainMultiplier = 1 + (comboChain - 1) * 0.5;
        const feverMultiplier = getFeverMultiplier();
        const cosmicMultiplier = freeMoveModeActive ? 1.5 : 1;
        const awardedPoints = Math.round(basePoints * chainMultiplier * feverMultiplier * cosmicMultiplier);

        score += awardedPoints;
        document.getElementById('scoreDisplay').innerText = String(score).padStart(6, '0');
        document.getElementById('comboDisplay').innerText = comboChain;
        bestCombo = Math.max(bestCombo, comboChain);

        // Fever meter (only when not already in Fever)
        if (!isFeverMode) {
            feverMeter += matches.length * 2.3 * (mikuHarmonyBoostActive ? 2 : 1);
            if (feverMeter >= 100) {
                feverMeter = 100;
                levelUpFever();
            } else {
                updateFeverHud();
            }
        }

        // Per-group bonuses (bonus icons, mana, icon-challenge)
        const config = CHARACTER_THEMES[currentCharacter];
        groups.forEach(group => {
            if (group.type === 5) {
                const gain = 6;
                if (currentMode === 'stageClear') {
                    movesLeft += gain;
                    document.getElementById('movesDisplay').innerText = movesLeft;
                    showBonusPopup(t('popup.bonusIconMoves', { gain }), config.baseColor);
                } else if (currentMode === 'livePerformance') {
                    timeLeft += gain;
                    document.getElementById('timeDisplay').innerText = Math.ceil(timeLeft);
                    showBonusPopup(t('popup.bonusIconSeconds', { gain }), config.baseColor);
                }
            } else if (group.type === manaChargeType) {
                chargeMana(group.cells.length * 8);
            }

            if (challengeType === 'iconChallenge' && group.type === challengeIconType) {
                challengeIconProgress++;
                updateChallengeHud();
                if (challengeIconProgress >= 4) endIconChallenge(true);
            }
        });

        // Clear matched cells + particles + obstacles
        let obstacleCleared = false;
        matches.forEach(m => {
            const cell = document.getElementById(`cell-${m.row}-${m.col}`);
            if (cell) cell.classList.add('cell-clearing');
            spawnMatchParticles(m.row, m.col, config.baseColor);

            if (boardState[m.row][m.col]?.obstacle) {
                obstacleTilesRemaining = Math.max(0, obstacleTilesRemaining - 1);
                obstacleCleared = true;
                chargeMana(10);
                if (currentCharacter === 'nightcord') SFX.play('themedTileClear25ji');
            }
            boardState[m.row][m.col] = null;
        });

        updateBlossomBlastNotice();

        if (matches.length > 0) {
            lastMatchedCell = matches[matches.length - 1];
        }

        if (obstacleCleared) {
            updateChallengeHud();
            if (obstacleTilesRemaining === 0 && challengeType === 'themedTile') {
                endThemedTileChallenge(true);
            }
        }

        // Wait for clear animation, then collapse + refill + drop animation
        await new Promise(resolve => setTimeout(resolve, cascadeDelay(400)));

        const fallDistances = collapseAndRefill();
        renderBoard();
        animateBoardDrop(fallDistances);

        await new Promise(resolve => setTimeout(resolve, cascadeDelay(350)));

        comboChain++;
        groups = findMatchGroups();
        matches = flattenGroups(groups);
    }

    // Cascade finished
    if (checkLevelProgress()) return;

    if (currentMode === 'stageClear' && movesLeft <= 0) {
        gameOverScreen(hasEarnedVictory ? 'victory' : 'normal');
        return;
    }

    isProcessing = false;
}

/**
 * Randomly reshuffles all tiles in place (used when no valid moves remain,
 * or via a manual trigger). `retryDepth` is internal — see the recursive
 * call at the bottom — callers should always omit it.
 */
function reshuffleBoard(playSound = true, retryDepth = 0) {
    if (playSound) {
        AudioSynth.playReshuffle();
    }

    // Shuffle type+obstacle+detonator together so obstacle tiles AND an
    // un-clicked Blossom Blast detonator relocate with the reshuffle
    // instead of being silently wiped out (a reshuffle rebuilds every cell
    // as a fresh object, so anything not explicitly carried over here is
    // lost — this used to drop `.detonator`, making the special's flashing
    // tile vanish with no explanation if an auto-reshuffle fired before the
    // player got to click it).
    let flatPieces = [];
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            flatPieces.push({
                type: boardState[r][c].type,
                obstacle: !!boardState[r][c].obstacle,
                detonator: !!boardState[r][c].detonator
            });
        }
    }

    for (let i = flatPieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = flatPieces[i];
        flatPieces[i] = flatPieces[j];
        flatPieces[j] = temp;
    }

    let flatIndex = 0;
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const piece = flatPieces[flatIndex++];
            boardState[r][c] = {
                type: piece.type,
                obstacle: piece.obstacle,
                detonator: piece.detonator,
                id: Math.random().toString(36).substring(2, 9),
                clearing: false
            };
        }
    }

    // Break up any accidental matches the shuffle created. IMPORTANT: this
    // must NOT shift every matched cell by the same fixed amount — a
    // straight run of identical tiles shifted by the same constant is
    // STILL identical afterward, so `(type + 1) % typeCount` here never
    // actually broke the match. On an unlucky shuffle this looped forever,
    // pegging a CPU core at 100% with no `await` to ever yield control back
    // (reported as a hard freeze during a Live Performance fever round, but
    // this isn't character- or mode-specific — any reshuffle, for anyone,
    // could hit it if the shuffle happened to land on a straight run).
    // Each matched cell instead gets its own independently random offset
    // (1..typeCount-1), which is guaranteed to change that cell's type in
    // one deterministic step — no per-cell reroll loop, so there's no
    // lingering unbounded-loop risk even here. Two cells in the same run
    // can still coincidentally land on the same new type by chance, which
    // is what the outer iteration cap below is for.
    const typeCount = getTileTypeCount();
    let safetyMatches = findMatches();
    let safetyIterations = 0;
    while (safetyMatches.length > 0 && safetyIterations < 50) {
        safetyMatches.forEach(m => {
            const tile = boardState[m.row][m.col];
            if (typeCount > 1) {
                const offset = 1 + Math.floor(Math.random() * (typeCount - 1));
                tile.type = (tile.type + offset) % typeCount;
            }
        });
        safetyMatches = findMatches();
        safetyIterations++;
    }

    // Same hard-cap guard on the "still no possible moves, reshuffle again"
    // retry below — this used to recurse with no limit at all, a second
    // unbounded loop risk in this same function.
    if (!hasPossibleMoves() && retryDepth < 10) {
        reshuffleBoard(false, retryDepth + 1);
    } else {
        renderBoard();
    }
}

/** True if any single adjacent swap anywhere on the board would create a match — used to trigger auto-reshuffle. */
function hasPossibleMoves() {
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (c < GRID_SIZE - 1) {
                if (simulateSwapAndCheck(r, c, r, c + 1)) return true;
            }
            if (r < GRID_SIZE - 1) {
                if (simulateSwapAndCheck(r, c, r + 1, c)) return true;
            }
        }
    }
    return false;
}

/** Temporarily swaps two cells' types to test for a resulting 3-in-a-row, then always swaps back before returning. */
function simulateSwapAndCheck(r1, c1, r2, c2) {
    let temp = boardState[r1][c1].type;
    boardState[r1][c1].type = boardState[r2][c2].type;
    boardState[r2][c2].type = temp;

    let matchesExist = false;

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE - 2; c++) {
            if (boardState[r][c] && boardState[r][c+1] && boardState[r][c+2]) {
                if (boardState[r][c].type === boardState[r][c+1].type && boardState[r][c].type === boardState[r][c+2].type) {
                    matchesExist = true;
                    break;
                }
            }
        }
        if (matchesExist) break;
    }

    if (!matchesExist) {
        for (let c = 0; c < GRID_SIZE; c++) {
            for (let r = 0; r < GRID_SIZE - 2; r++) {
                if (boardState[r][c] && boardState[r+1][c] && boardState[r+2][c]) {
                    if (boardState[r][c].type === boardState[r+1][c].type && boardState[r][c].type === boardState[r+2][c].type) {
                        matchesExist = true;
                        break;
                    }
                }
            }
            if (matchesExist) break;
        }
    }

    temp = boardState[r1][c1].type;
    boardState[r1][c1].type = boardState[r2][c2].type;
    boardState[r2][c2].type = temp;

    return matchesExist;
}

/**
 * Stage Clear only: score-driven level progression (moves are earned
 * elsewhere now — via the move-icon and the Fever milestones/challenges).
 */
/**
 * Cumulative score required to clear `level` and advance to `level + 1`.
 * Levels 1-10 cost a flat 1500 each (unchanged from the original balance);
 * every 10 levels after that the per-level cost steps up by 300, so the
 * campaign gets a bit tougher in stages on the way to
 * STAGE_CLEAR_FINAL_LEVEL rather than all at once or not at all. A plain
 * summing loop (at most 100 terms) is simpler and less error-prone here
 * than deriving a closed-form series, and it's only ever called from
 * checkLevelProgress() after a cascade resolves — nowhere near a hot path.
 */
function stageClearGoalForLevel(targetLevel) {
    let goal = 0;
    for (let i = 1; i <= targetLevel; i++) {
        const tier = Math.floor((i - 1) / 10);
        goal += 1500 + tier * 300;
    }
    return goal;
}

/**
 * Stage Clear only: advances `level` once `score` clears its goal. Returns
 * true whenever play should stop right here instead of processMatchCycles()
 * continuing on to its usual moves-exhausted/deadlock checks — that's true
 * for both of Stage Clear's two victory tiers:
 *   - level reaches STAGE_CLEAR_FINAL_LEVEL (100): the full climb, an
 *     immediate 'legacyVictory' ending, same as before.
 *   - level first reaches STAGE_CLEAR_VICTORY_LEVEL (50): NEW — instead of
 *     ending the run outright, this opens a choice overlay
 *     (showStageVictoryChoice()) and leaves isProcessing true for as long as
 *     it's showing, which is what actually blocks the board — see that
 *     function's comment. hasEarnedVictory guards this so it only fires
 *     once per run; every level-up after 50 (whether they claimed or kept
 *     climbing) falls through to the plain level-up branch below like normal.
 */
function checkLevelProgress() {
    if (currentMode !== 'stageClear') return false;

    const nextGoal = stageClearGoalForLevel(level);
    if (score >= nextGoal) {
        level++;
        document.getElementById('levelDisplay').innerText = level;
        if (level >= STAGE_CLEAR_FINAL_LEVEL) {
            document.getElementById('goalDisplay').innerText = 'MAX';
            gameOverScreen('legacyVictory');
            return true;
        }
        if (level >= STAGE_CLEAR_VICTORY_LEVEL && !hasEarnedVictory) {
            hasEarnedVictory = true;
            document.getElementById('goalDisplay').innerText = stageClearGoalForLevel(level);
            AudioSynth.playTone(523, 'sine', 0.5, 1046);
            showStageVictoryChoice();
            return true;
        }
        document.getElementById('goalDisplay').innerText = stageClearGoalForLevel(level);
        AudioSynth.playTone(523, 'sine', 0.5, 1046);
    }
    return false;
}

/**
 * Opens the Stage 50 choice overlay (see index.html's #stageVictoryChoiceOverlay).
 * Doesn't touch isProcessing itself — it's already true here (this runs
 * from inside processMatchCycles(), which only clears it at the very end,
 * the same line checkLevelProgress()'s `return true` short-circuits past).
 * Leaving it true is what blocks swaps/the Special button for as long as
 * this is open; confirmStageVictoryChoice() below is what clears it again.
 */
function showStageVictoryChoice() {
    document.getElementById('stageVictoryChoiceOverlay').classList.remove('hidden');
}

/**
 * Handles both choice-overlay buttons. `claim` picks between the two exits:
 * either end the run right now as a 'victory' (certificate + results screen,
 * same as any other ending), or hide the overlay and hand control straight
 * back to the board — score/movesLeft/level are untouched either way, this
 * function never modifies them.
 */
function confirmStageVictoryChoice(claim) {
    document.getElementById('stageVictoryChoiceOverlay').classList.add('hidden');
    if (claim) {
        gameOverScreen('victory');
    } else {
        isProcessing = false;
    }
}

/**
 * Ends the current run: stops all timers, shows the results overlay with
 * mode-specific text, and starts building the certificate. `outcome` is one
 * of:
 *   - 'legacyVictory' — Stage Clear reached STAGE_CLEAR_FINAL_LEVEL (100),
 *     the full climb. Only ever set by checkLevelProgress().
 *   - 'victory' — Stage Clear ended (moves exhausted, deadlock, or End
 *     Session) after already passing STAGE_CLEAR_VICTORY_LEVEL this run
 *     (hasEarnedVictory), OR the Stage 50 choice overlay's "Claim
 *     Certificate" button, OR Live Performance's clock reaching 0 —
 *     naturally via startPerformanceTimer(), or via handleDeadlock()'s
 *     penalty draining it there. Live Performance has no fail state now:
 *     finishing a performance (by any means) is always a win.
 *   - 'normal' (default) — every other ending: Stage Clear without ever
 *     reaching level 50, Live Performance ended early via End Session
 *     (before the clock hit 0), and Leisure always (no victory tier there).
 */
function gameOverScreen(outcome = 'normal') {
    stopAllTimers();
    isFeverMode = false;
    feverBonusRoundActive = false;
    document.getElementById('boardBorder').classList.remove('fever-active-border');

    const isWin = outcome === 'victory' || outcome === 'legacyVictory';
    if (isWin) {
        updatePortrait('happy');
        AudioSynth.playTone(523, 'sine', 0.3, 784);
        setTimeout(() => AudioSynth.playTone(659, 'sine', 0.3, 1046), 150);
        setTimeout(() => AudioSynth.playTone(784, 'sine', 0.5, 1568), 300);
    } else {
        updatePortrait('sad');
        AudioSynth.playTone(180, 'sawtooth', 0.8, 80);
    }

    document.getElementById('resultsOverlay').classList.remove('hidden');
    document.getElementById('resultsScore').innerText = String(score).padStart(6, '0');

    if (outcome === 'legacyVictory') {
        const charName = t(`character.${currentCharacter}.name`);
        document.getElementById('victoryBadge').innerText = t('results.stageClearLegacyVictory.badge', { charName });
        document.getElementById('resultsHeading').innerText = t('results.stageClearLegacyVictory.heading');
        document.getElementById('resultsDetail').innerText = t('results.stageClearLegacyVictory.detail', { finalLevel: STAGE_CLEAR_FINAL_LEVEL, score: String(score).padStart(6, '0'), charName });
    } else if (outcome === 'victory' && currentMode === 'livePerformance') {
        document.getElementById('victoryBadge').innerText = t('results.livePerformanceVictory.badge');
        document.getElementById('resultsHeading').innerText = t('results.livePerformanceVictory.heading');
        document.getElementById('resultsDetail').innerText = t('results.livePerformanceVictory.detail', { score: String(score).padStart(6, '0'), bestCombo });
    } else if (outcome === 'victory') {
        // Stage Clear only — Leisure never reaches 'victory' at all.
        document.getElementById('victoryBadge').innerText = t('results.stageClearVictory.badge');
        document.getElementById('resultsHeading').innerText = t('results.stageClearVictory.heading');
        document.getElementById('resultsDetail').innerText = t('results.stageClearVictory.detail', { level, score: String(score).padStart(6, '0') });
    } else if (currentMode === 'livePerformance') {
        document.getElementById('victoryBadge').innerText = t('results.livePerformanceOver.badge');
        document.getElementById('resultsHeading').innerText = t('results.livePerformanceOver.heading');
        document.getElementById('resultsDetail').innerText = t('results.livePerformanceOver.detail', { score: String(score).padStart(6, '0'), bestCombo });
    } else if (currentMode === 'leisure') {
        document.getElementById('victoryBadge').innerText = t('results.leisureEnded.badge');
        document.getElementById('resultsHeading').innerText = t('results.leisureEnded.heading');
        document.getElementById('resultsDetail').innerText = t('results.leisureEnded.detail', { score: String(score).padStart(6, '0') });
    } else {
        document.getElementById('victoryBadge').innerText = t('results.stageClearOver.badge');
        document.getElementById('resultsHeading').innerText = t('results.stageClearOver.heading');
        document.getElementById('resultsDetail').innerText = t('results.stageClearOver.detail', { level });
    }

    prepareCertificate(outcome);
}

/**
 * ============================================================================
 * 7b. MANA BAR SPECIAL ABILITIES
 * ============================================================================
 * One unique effect per character, unlocked once the mana bar (charged by
 * matching that run's `manaChargeType` icon, or clearing themed tiles)
 * hits 100. All of them mutate `boardState` then let the normal engine
 * (collapseAndRefill + processMatchCycles) resolve the result.
 */
async function activateSpecial() {
    if (manaEnergy < 100 || isProcessing || placementModeActive) return;

    const config = CHARACTER_THEMES[currentCharacter];
    AudioSynth.playSpecial();
    // Sakura and Racing are two-step specials — this button click only arms
    // them (marks detonator tiles / enters aim mode); the downloaded
    // "executed" sound plays later, at the actual board click that resolves
    // the effect (see detonateBlossomTile() / resolveTurboBlitz()). Every
    // other character resolves instantly right here, so this click IS their
    // "executed" moment.
    if (currentCharacter !== 'sakura' && currentCharacter !== 'racing') {
        CharacterSFX.playEvent('specialExecuted');
    }
    playSpecialBurst(config.baseColor);

    // Sakura's mana bar deliberately does NOT reset here — it stays full
    // until every Blossom Blast detonator this activation places has been
    // cleared (see updateBlossomBlastNotice(), called from
    // specialBlossomBreeze() right after it places them). Every other
    // character resolves fully in this same call, so resetting immediately
    // is correct for them.
    if (currentCharacter !== 'sakura') {
        manaEnergy = 0;
    }
    updateManaHud();

    const specials = {
        classic: specialHarmonyWave,
        sakura: specialBlossomBreeze,
        nightcord: specialVoidWorld,
        snow: specialGlacialFreeze,
        racing: specialTurboBlitz,
        space: specialCosmicGravity
    };

    const run = specials[currentCharacter];
    if (run) await run();
}

/**
 * Shared "direct clear" resolver for specials that null out board cells
 * themselves (Sakura's Blossom Blast, 25-ji's Void World, Racing's Turbo
 * Blitz) instead of going through a normal swap/match. A plain
 * `boardState[r][c] = null` bypasses processMatchCycles() entirely, so
 * without this, cells cleared this way granted their flat special-specific
 * score bonus but NONE of the usual per-tile rewards a real match would
 * give: no fever gauge progress, no mana charge for manaChargeType tiles,
 * no +6 move/time bonus for type-5 icons caught in the blast. Call this
 * BEFORE nulling the cells (it needs to read their `.type` while still
 * present), passing every in-bounds, non-empty {row, col} about to be
 * cleared.
 */
function applyDirectClearRewards(cells) {
    let chargeTilesCleared = 0;
    let clearedCount = 0;
    cells.forEach(({ row, col }) => {
        const tile = boardState[row] && boardState[row][col];
        if (!tile) return;
        clearedCount++;
        if (tile.type === manaChargeType) chargeTilesCleared++;
        if (tile.type === 5) {
            const gain = 6;
            if (currentMode === 'stageClear') {
                movesLeft += gain;
                document.getElementById('movesDisplay').innerText = movesLeft;
            } else if (currentMode === 'livePerformance') {
                timeLeft += gain;
                document.getElementById('timeDisplay').innerText = Math.ceil(timeLeft);
            }
        }
    });

    if (chargeTilesCleared > 0) chargeMana(chargeTilesCleared * 8);

    if (clearedCount > 0 && !isFeverMode) {
        feverMeter += clearedCount * 2.3 * (mikuHarmonyBoostActive ? 2 : 1);
        if (feverMeter >= 100) {
            feverMeter = 100;
            levelUpFever();
        } else {
            updateFeverHud();
        }
    }
}

/**
 * Drives the on-board countdown badge (#specialTimerBadge, right side of
 * the board) shared by both of the timed character buffs — Miku's Harmony
 * Wave and Space Singer's Cosmic Gravity. Only one of those can ever be
 * active at a time (only one character is playable per run), so a single
 * interval/badge pair is enough; a fresh call always restarts cleanly.
 * This is purely a visual readout — it doesn't drive the buff itself, which
 * still lives/times out on its own mikuHarmonyTimeoutId/freeMoveTimeoutId.
 */
function startSpecialTimerBadge(seconds, emoji) {
    const badge = document.getElementById('specialTimerBadge');
    const emojiEl = document.getElementById('specialTimerEmoji');
    const valueEl = document.getElementById('specialTimerValue');
    if (!badge || !emojiEl || !valueEl) return;

    if (specialTimerIntervalId) clearInterval(specialTimerIntervalId);
    let remaining = seconds;
    emojiEl.textContent = emoji;
    valueEl.textContent = remaining;
    badge.classList.remove('hidden');

    specialTimerIntervalId = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
            clearInterval(specialTimerIntervalId);
            specialTimerIntervalId = null;
            badge.classList.add('hidden');
        } else {
            valueEl.textContent = remaining;
        }
    }, 1000);
}

/** Hides the countdown badge and stops its interval — called anywhere a timed buff can end early (run reset, leaving the board). */
function stopSpecialTimerBadge() {
    if (specialTimerIntervalId) { clearInterval(specialTimerIntervalId); specialTimerIntervalId = null; }
    const badge = document.getElementById('specialTimerBadge');
    if (badge) badge.classList.add('hidden');
}

/**
 * Miku's Harmony Wave: no longer forces an instant match — instead boosts
 * how much fever the gauge earns per match for 25 seconds (see the
 * mikuHarmonyBoostActive multiplier in processMatchCycles' fever-fill step).
 * Purely a timed buff, so there's no board mutation/cascade to resolve here.
 */
function specialHarmonyWave() {
    mikuHarmonyBoostActive = true;
    showBonusPopup(t('popup.harmonyWave'), CHARACTER_THEMES.classic.baseColor);
    startSpecialTimerBadge(25, CHARACTER_THEMES.classic.hudEmoji);
    if (mikuHarmonyTimeoutId) clearTimeout(mikuHarmonyTimeoutId);
    mikuHarmonyTimeoutId = setTimeout(() => {
        mikuHarmonyBoostActive = false;
        mikuHarmonyTimeoutId = null;
    }, 25000);
}

/**
 * Sakura's Blossom Blast: flags up to BLOSSOM_BLAST_MAX_DETONATORS random
 * board tiles as hot-pink flashing "detonators" instead of clearing
 * anything immediately. The player can click any of them at any later
 * point (see handleCellSelect() / detonateBlossomTile() below) to clear a
 * 3x3 radius around it.
 *
 * Every pick is kept a Chebyshev distance of >= 3 from every OTHER pick
 * (this activation's and, defensively, any already on the board) so no two
 * 3x3 blast radii ever touch or overlap. In normal play there shouldn't be
 * any pre-existing detonators when this runs — the mana bar stays locked
 * full (see updateManaHud()) until the last one from an activation clears,
 * which is what stops a second activation from stacking more on top — but
 * the existing-detonator check costs nothing and means this can't
 * over-place if that guard is ever bypassed.
 *
 * Greedy placement depends on shuffle order — one unlucky shuffle could
 * leave a slot unfilled even though a valid arrangement exists elsewhere
 * on the board, so this tries a handful of shuffles and keeps whichever
 * placed the most, stopping the instant one fills every slot.
 */
function specialBlossomBreeze() {
    const existing = [];
    const openCells = [];
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (!boardState[r][c]) continue;
            if (boardState[r][c].detonator) existing.push([r, c]);
            else openCells.push([r, c]);
        }
    }

    const farEnough = (cand, chosen) => chosen.every(([r, c]) =>
        Math.max(Math.abs(cand[0] - r), Math.abs(cand[1] - c)) >= 3
    );
    const slotsToFill = Math.max(0, BLOSSOM_BLAST_MAX_DETONATORS - existing.length);

    let best = [];
    for (let attempt = 0; attempt < 8 && best.length < slotsToFill; attempt++) {
        const shuffled = openCells.slice();
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = shuffled[i];
            shuffled[i] = shuffled[j];
            shuffled[j] = temp;
        }
        const picked = [];
        for (const cand of shuffled) {
            if (picked.length >= slotsToFill) break;
            if (farEnough(cand, existing.concat(picked))) picked.push(cand);
        }
        if (picked.length > best.length) best = picked;
    }

    // The >= 3 spacing rule can, in principle, leave zero valid spots (an
    // unusually obstacle-crowded board). Silently placing nothing here
    // would be worse than a placement that's merely closer together than
    // ideal: updateBlossomBlastNotice() (called below) can't tell "nothing
    // was ever placed" apart from "everything placed has already been
    // cleared" — it would immediately release the mana lock with no
    // detonator ever having appeared on the board, exactly as if the
    // special had done nothing at all. Guaranteeing at least one, ignoring
    // the spacing rule only for this single last-resort pick, closes that
    // off — the player always sees at least one flashing tile and the mana
    // bar only ever unlocks after they've actually cleared it.
    if (best.length === 0 && openCells.length > 0) {
        best = [openCells[Math.floor(Math.random() * openCells.length)]];
    }

    best.forEach(([r, c]) => { boardState[r][c].detonator = true; });
    // Marks a real activation as in progress — see this flag's own comment
    // for why updateBlossomBlastNotice() needs it and can't just infer
    // "in progress" from the detonator count alone.
    blossomBlastActive = true;
    renderBoard();
    showBonusPopup(t('popup.blossomBlast'), CHARACTER_THEMES.sakura.baseColor);
    updateBlossomBlastNotice();
}

/**
 * Live count of Sakura's Blossom Blast detonator tiles currently on the
 * board. Called from updateManaHud(), which itself runs mid-resetGame() —
 * before that run's generateBoard() call — so `boardState[r]` may not be
 * populated yet (freshly `[]` on the very first game this page load) or
 * may still hold the previous run's board momentarily; skipping unpopulated
 * rows instead of assuming GRID_SIZE rows always exist avoids crashing on
 * either case. (manaEnergy is already reset to 0 by that point regardless,
 * so a stale leftover count from the previous run can't actually affect
 * the Special button's ready-state — see updateManaHud()'s `ready` check.)
 */
function countActiveDetonators() {
    let count = 0;
    for (let r = 0; r < GRID_SIZE; r++) {
        if (!boardState[r]) continue;
        for (let c = 0; c < GRID_SIZE; c++) {
            if (boardState[r][c] && boardState[r][c].detonator) count++;
        }
    }
    return count;
}

/**
 * Keeps Sakura's Blossom Blast state in sync with the live board — call
 * this after anything that could have changed how many `.detonator` tiles
 * remain (placing them, the player detonating one, or a normal match
 * cascade sweeping one up same as any other icon). No-ops unless
 * `blossomBlastActive` is true — this runs on every cascade step (it has
 * to, to catch a detonator getting swept into a normal match — see the
 * call site inside processMatchCycles()), and most of those steps have
 * nothing to do with Blossom Blast at all. Without that guard, this would
 * see "0 detonators" for perfectly ordinary reasons — mana simply hasn't
 * been spent yet this run — and immediately reset a freshly-filled,
 * never-yet-claimed mana bar straight back to 0, which is exactly what
 * "fills then drops back down without the icons ever appearing" was.
 *
 * The live scan (countActiveDetonators()) is still what actually decides
 * *when* to clear the flag — it can't drift out of sync the way a
 * manually incremented/decremented counter could if some future
 * tile-clearing path forgot to update it.
 */
function updateBlossomBlastNotice() {
    if (currentCharacter !== 'sakura' || !blossomBlastActive) return;
    const remaining = countActiveDetonators();
    if (remaining > 0) {
        showPortraitSpeechBubble(t('portraitNotice.blossomBlastPending', { count: remaining }));
        // Re-syncs the Special button's disabled state (see updateManaHud()'s
        // blossomPending check) — needed right when detonators are freshly
        // placed, since activateSpecial() already refreshed the HUD once
        // *before* specialBlossomBreeze() ran, back when the count was
        // still 0.
        updateManaHud();
        return;
    }
    blossomBlastActive = false;
    hidePortraitSpeechBubble();
    if (manaEnergy >= 100) {
        // Held full since activation specifically so a second click
        // couldn't stack more detonators on top — now that the last one
        // is gone, let it actually reset so the normal recharge cycle (and
        // specialReady's rising-edge SFX) starts fresh next time it fills.
        manaEnergy = 0;
    }
    updateManaHud();
}

/** Shows the persistent notice bubble anchored above the portrait — see #portraitSpeechBubble in index.html. */
function showPortraitSpeechBubble(text) {
    const bubble = document.getElementById('portraitSpeechBubble');
    const textEl = document.getElementById('portraitSpeechBubbleText');
    if (!bubble || !textEl) return;
    textEl.textContent = text;
    bubble.classList.remove('hidden');
}

/** Hides the persistent notice bubble anchored above the portrait. */
function hidePortraitSpeechBubble() {
    const bubble = document.getElementById('portraitSpeechBubble');
    if (bubble) bubble.classList.add('hidden');
}

/**
 * Detonates one of Blossom Blast's flagged tiles: clears every tile in a 3x3
 * radius around it. Triggered from handleCellSelect() whenever the clicked
 * cell has a `.detonator` flag, so it can fire independent of the normal
 * swap-selection flow (and even while otherwise gated by isProcessing/
 * isPaused/placementModeActive — those are checked here instead). The 3x3
 * clear counts toward the fever gauge (and mana/bonus-icon rewards) just
 * like a real match would — see applyDirectClearRewards().
 */
async function detonateBlossomTile(row, col) {
    if (isProcessing || isPaused || placementModeActive) return;
    isProcessing = true;

    if (selectedCell) {
        const prevCell = document.getElementById(`cell-${selectedCell.row}-${selectedCell.col}`);
        if (prevCell) prevCell.classList.remove('cell-selected');
        selectedCell = null;
    }

    const blastCells = [];
    for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
            if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
                blastCells.push({ row: r, col: c });
            }
        }
    }
    applyDirectClearRewards(blastCells);
    blastCells.forEach(({ row: r, col: c }) => { boardState[r][c] = null; });
    // This 3x3 clear is a direct boardState mutation, not a normal match —
    // it never touches processMatchCycles()'s matches.forEach loop (that
    // only runs for whatever CASCADE this blast might trigger afterward),
    // so its own updateBlossomBlastNotice() hook there never sees this
    // clear happen. Called explicitly here so the notice/mana-lock updates
    // even when the blast doesn't chain into any follow-up match at all —
    // the common case, and the one the earlier version of this function
    // silently got wrong (bubble stuck on the original count, mana never
    // released, even after every detonator was gone).
    updateBlossomBlastNotice();

    score += 150;
    document.getElementById('scoreDisplay').innerText = String(score).padStart(6, '0');
    CharacterSFX.playEvent('specialExecuted');
    const fallDistances = collapseAndRefill();
    renderBoard();
    animateBoardDrop(fallDistances);
    await new Promise(resolve => setTimeout(resolve, 300));
    comboChain = 1;
    await processMatchCycles();
}

/**
 * 25-ji's Void World: target-removes every tile of whichever single regular
 * icon type (0-3) currently populates the board the most (by count). If two
 * or more types are tied for the lead (e.g. 7 ribbons and 7 hourglasses),
 * one of the tied types is picked at random rather than always favoring the
 * lowest type ID. Counts toward the fever gauge, mana (if the cleared type
 * is this run's manaChargeType), and bonus-icon rewards just like a real
 * match would — see applyDirectClearRewards().
 */
async function specialVoidWorld() {
    isProcessing = true;
    const counts = [0, 0, 0, 0];
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const t = boardState[r][c] && boardState[r][c].type;
            if (t >= 0 && t <= 3) counts[t]++;
        }
    }
    const maxCount = Math.max(...counts);
    const tiedTypes = counts
        .map((count, type) => ({ type, count }))
        .filter(entry => entry.count === maxCount)
        .map(entry => entry.type);
    const topTypes = [tiedTypes[Math.floor(Math.random() * tiedTypes.length)]];

    const voidCells = [];
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (boardState[r][c] && topTypes.includes(boardState[r][c].type)) {
                voidCells.push({ row: r, col: c });
            }
        }
    }
    applyDirectClearRewards(voidCells);
    voidCells.forEach(({ row: r, col: c }) => { boardState[r][c] = null; });

    const fallDistances = collapseAndRefill();
    renderBoard();
    animateBoardDrop(fallDistances);
    await new Promise(resolve => setTimeout(resolve, 300));
    comboChain = 1;
    await processMatchCycles();
}

/** Snow's Glacial Freeze: +8s in Live Performance, +4 moves in Stage Clear (Leisure Mode keeps a flat score bonus since neither resource applies there). */
async function specialGlacialFreeze() {
    const snowColor = CHARACTER_THEMES.snow.baseColor;
    if (currentMode === 'livePerformance') {
        timeLeft += 8;
        document.getElementById('timeDisplay').innerText = Math.ceil(timeLeft);
        showBonusPopup(t('popup.glacialFreezeSeconds'), snowColor);
    } else if (currentMode === 'stageClear') {
        movesLeft += 4;
        document.getElementById('movesDisplay').innerText = movesLeft;
        showBonusPopup(t('popup.glacialFreezeMoves'), snowColor);
    } else {
        score += 200;
        document.getElementById('scoreDisplay').innerText = String(score).padStart(6, '0');
        showBonusPopup(t('popup.glacialFreezeScore'), snowColor);
    }
}

/** Racing's Turbo Blitz: enters targeting mode; resolveTurboBlitz() runs once the player clicks a cell. */
function specialTurboBlitz() {
    placementModeActive = true;
    document.getElementById('match3Grid').classList.add('placement-mode');
}

/** Clears the targeted row + column. Counts toward fever/mana/bonus-icon rewards like a real match — see applyDirectClearRewards(). */
async function resolveTurboBlitz(row, col) {
    placementModeActive = false;
    document.getElementById('match3Grid').classList.remove('placement-mode');
    clearReticleHighlight();

    isProcessing = true;
    const blitzCells = [];
    for (let c = 0; c < GRID_SIZE; c++) blitzCells.push({ row: row, col: c });
    for (let r = 0; r < GRID_SIZE; r++) if (r !== row) blitzCells.push({ row: r, col: col });
    applyDirectClearRewards(blitzCells);
    blitzCells.forEach(({ row: r, col: c }) => { boardState[r][c] = null; });

    score += 200;
    document.getElementById('scoreDisplay').innerText = String(score).padStart(6, '0');
    CharacterSFX.playEvent('specialExecuted');
    const fallDistances = collapseAndRefill();
    renderBoard();
    animateBoardDrop(fallDistances);
    await new Promise(resolve => setTimeout(resolve, 300));
    comboChain = 1;
    await processMatchCycles();
}

/**
 * Space Singer's Cosmic Gravity: for 25 seconds, lifts the normal adjacency
 * rule so the player can swap any two tiles anywhere on the board (see the
 * freeMoveModeActive check in handleCellSelect()), with tiles given a
 * floating look (.free-move-active, see miku-style.css) as the visual
 * indicator. A swap that doesn't produce a match is no longer rolled back
 * while this is active — it's a real "place it wherever you want" free
 * rearrangement, not just an adjacency exemption (see executeSwap()).
 * Matches made during the window score extra (see the cosmicMultiplier in
 * processMatchCycles). Duration matches Harmony Wave's 25s (see
 * startSpecialTimerBadge()) so the two timed character buffs feel
 * consistent.
 */
function specialCosmicGravity() {
    freeMoveModeActive = true;
    document.getElementById('match3Grid').classList.add('free-move-active');
    showBonusPopup(t('popup.cosmicGravity'), CHARACTER_THEMES.space.baseColor);
    startSpecialTimerBadge(25, CHARACTER_THEMES.space.hudEmoji);
    if (freeMoveTimeoutId) clearTimeout(freeMoveTimeoutId);
    freeMoveTimeoutId = setTimeout(() => {
        freeMoveModeActive = false;
        document.getElementById('match3Grid').classList.remove('free-move-active');
        freeMoveTimeoutId = null;
        cosmicGravityFailsafe();
    }, 25000);
}

/**
 * Fail-safe for Cosmic Gravity: 25 seconds of freely rearranging tiles with
 * no match requirement can easily leave the board with no possible moves
 * once normal adjacency-only rules resume the instant the window closes.
 * Reshuffles for free (no move/time penalty — this isn't a player mistake,
 * it's a direct consequence of the special) the moment nothing else is
 * mid-flight. Polls instead of running immediately in case the window
 * happens to close mid-swap/mid-cascade — reshuffling out from under an
 * in-flight executeSwap()/processMatchCycles() would corrupt whatever cells
 * that call is still holding a reference to.
 */
function cosmicGravityFailsafe() {
    if (isProcessing) {
        setTimeout(cosmicGravityFailsafe, 200);
        return;
    }
    if (!hasPossibleMoves()) {
        reshuffleBoard(true);
    }
}

/** Full-board themed flash played whenever any special ability activates. */
function playSpecialBurst(color) {
    const board = document.getElementById('boardBorder');
    if (!board) return;
    const flash = document.createElement('div');
    flash.className = 'special-burst';
    flash.style.setProperty('--burst-color', color);
    board.appendChild(flash);
    setTimeout(() => flash.remove(), 700);
}

// Tracks how many bonus popups are currently on-screen so showBonusPopup()
// can stack new ones above the rest instead of overlapping dead-center
// (multiple can legitimately fire close together — e.g. two separate
// move-icon groups clearing in the same cascade).
let activeBonusPopupCount = 0;

/**
 * Fast pop-in / fade-out toast over the board (used for move/time bonus-icon
 * rewards, Fever milestones, and challenge results), with a small icon-
 * particle burst.
 */
function showBonusPopup(text, color) {
    const board = document.getElementById('boardBorder');
    if (!board) return;

    const toast = document.createElement('div');
    toast.className = 'bonus-popup';
    toast.textContent = text;
    toast.style.color = color;
    toast.style.borderColor = color;
    toast.style.setProperty('--popup-y-offset', `${activeBonusPopupCount * -46}px`);
    activeBonusPopupCount++;
    board.appendChild(toast);
    setTimeout(() => {
        toast.remove();
        activeBonusPopupCount = Math.max(0, activeBonusPopupCount - 1);
    }, 1100);

    const config = CHARACTER_THEMES[currentCharacter];
    for (let i = 0; i < 6; i++) {
        const spark = document.createElement('img');
        spark.className = 'bonus-popup-spark';
        spark.src = config.boardIcons[i % config.boardIcons.length];
        spark.alt = '';
        const angle = (Math.PI * 2 * i) / 6;
        spark.style.setProperty('--spark-x', `${Math.cos(angle) * 60}px`);
        spark.style.setProperty('--spark-y', `${Math.sin(angle) * 60}px`);
        board.appendChild(spark);
        setTimeout(() => spark.remove(), 900);
    }
}

/**
 * Small burst of theme-colored particles flown out from a matched cell's
 * position — called once per cleared cell from processMatchCycles(). Same
 * outward-translate technique as showBonusPopup()'s icon sparks above, just
 * positioned per-cell via getBoundingClientRect() instead of pinned to
 * board-center, and plain colored dots rather than icon sprites since a big
 * cascade can call this a dozen+ times in a single pass — cheap DOM nodes
 * animated on transform/opacity only, nothing to decode or lay out.
 */
function spawnMatchParticles(row, col, color) {
    const board = document.getElementById('boardBorder');
    const cell = document.getElementById(`cell-${row}-${col}`);
    if (!board || !cell) return;

    const boardRect = board.getBoundingClientRect();
    const cellRect = cell.getBoundingClientRect();
    const originX = cellRect.left - boardRect.left + cellRect.width / 2;
    const originY = cellRect.top - boardRect.top + cellRect.height / 2;

    const particleCount = 6;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('span');
        particle.className = 'match-particle';
        particle.style.left = `${originX}px`;
        particle.style.top = `${originY}px`;
        particle.style.background = color;
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() * 0.6 - 0.3);
        const dist = 24 + Math.random() * 16;
        particle.style.setProperty('--particle-x', `${Math.cos(angle) * dist}px`);
        particle.style.setProperty('--particle-y', `${Math.sin(angle) * dist}px`);
        board.appendChild(particle);
        setTimeout(() => particle.remove(), 520);
    }
}

/**
 * ============================================================================
 * 8. SHAREABLE RESULTS CERTIFICATE
 * ============================================================================
 * Renders a 1200x630 canvas (portrait + score + mode + themed emoji), then
 * offers a Download or Copy-to-clipboard button. Entirely client-side.
 *
 * IMPORTANT: the canvas is built as soon as the results screen opens
 * (`prepareCertificate()`, called from `gameOverScreen()`), and cached in
 * `certificateCanvas`. Download/Copy then act on that cached canvas
 * synchronously from the button's own click — no async image-loading in
 * between. Doing the async work *inside* the click handler (the previous
 * bug) put too many async hops between the user's actual click and the
 * browser's download/clipboard call, so both silently no-op'd: browsers
 * only allow `<a download>` auto-clicks and `navigator.clipboard.write()`
 * when they're still within a direct user-gesture chain.
 */
/**
 * ---- CERTIFICATE BACKGROUND PHOTOS ------------------------------------
 * SOURCE REFERENCE ONLY — not read at runtime; see CERT_BACKGROUND_DATA
 * (cert-assets.js) and the comment on CERTIFICATE_PORTRAIT_IMAGES above for
 * why. Drawn "cover"-fit (fills the whole canvas, cropping whichever
 * dimension overflows — see drawCoverImage()) at full brightness, no
 * darkening overlay — legibility comes from CERT_TYPOGRAPHY's per-character
 * colors + text shadow instead (see finishCertificate()).
 */
const CERT_BACKGROUND_IMAGES = {
    classic: 'v-j-rs/9260185_4127298.jpg',
    sakura: 'v-j-rs/12157944_Cherry_Blossom_45_B.jpg',
    nightcord: 'v-j-rs/adhitya-sibikumar-Qy8Y8RBWovk-unsplash(edit).jpg',
    snow: 'v-j-rs/3849.jpg',
    racing: 'v-j-rs/sanjeevan-satheeskumar-iZp4h1gXiEQ-unsplash(edit).jpg',
    space: 'v-j-rs/majed-swan-fKEywuUJNCQ-unsplash.jpg'
};

/**
 * Wraps an already-embedded `data:` URI (CERT_PORTRAIT_DATA / CERT_BACKGROUND_DATA
 * in cert-assets.js) in a loaded <img>. No fetch/network step at all — the
 * bytes are already inline in the JS — which is the point: a data: URI never
 * taints a canvas, on file:// or otherwise, regardless of what a given
 * browser does or doesn't allow for fetch()/XHR against local files.
 */
function loadImageFromDataUri(dataUri) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to decode an embedded certificate image'));
        img.src = dataUri;
    });
}

/** Draws `img` "cover"-fit across the full width/height (fills every pixel, cropping whichever dimension overflows) — same idea as CSS background-size: cover. */
function drawCoverImage(ctx, img, width, height) {
    const scale = Math.max(width / img.width, height / img.height);
    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;
    ctx.drawImage(img, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
}

/**
 * Per-character certificate typography — a distinct font + color set for
 * each board, chosen against that character's own background photo (not
 * just their in-game baseColor, which for Sakura/Snow is a light pastel
 * that would vanish against their equally-light backgrounds). >>> EDIT HERE
 * to retune a character's certificate look.
 *   font    — full ctx.font family stack (already-loaded Google Fonts, see
 *             index.html's <link>, plus Arial as universal fallback)
 *   weight  — used for the name/score (the "loud" text); labels go one step
 *             lighter automatically where the font supports it
 *   primary — the name text color
 *   accent  — mode label + score number (the "pop" color)
 *   label   — muted color for "FINAL SCORE"
 *   footer  — most muted, for the credit line
 *   shadow  — drop-shadow color behind every text draw, standing in for the
 *             old full-canvas darkening scrim — dark shadow for light text,
 *             light glow for dark text (Sakura/Snow) — so legibility holds
 *             up over a busy/bright photo without dimming the whole photo.
 */
const CERT_TYPOGRAPHY = {
    classic: {
        font: "'Orbitron', sans-serif", weight: 800,
        primary: '#eafffb', accent: '#5eead4', label: '#8fd8d0', footer: '#aee0dc',
        shadow: 'rgba(0, 0, 0, 0.65)', panel: 'dark'
    },
    sakura: {
        font: "'Fredoka', sans-serif", weight: 600,
        primary: '#5c1230', accent: '#9c1c48', label: '#7a3349', footer: '#8a5063',
        shadow: 'rgba(255, 255, 255, 0.65)', panel: 'light'
    },
    nightcord: {
        font: "'Share Tech Mono', monospace", weight: 400,
        // Warm gold for the name specifically (not pale lavender/white) —
        // this background's bright silver gear teeth sit right behind it,
        // and a light, cool color reads too close to that gear's own tone.
        // Gold has enough hue contrast to stay legible over both the dark
        // and bright-silver parts of the photo.
        primary: '#f5c94d', accent: '#c4b5fd', label: '#a49fc9', footer: '#c3bce8',
        shadow: 'rgba(0, 0, 0, 0.7)', panel: 'dark'
    },
    snow: {
        font: "'Quicksand', sans-serif", weight: 600,
        primary: '#0b3a5c', accent: '#0e6ba8', label: '#3d6a8a', footer: '#5c86a3',
        shadow: 'rgba(255, 255, 255, 0.7)', panel: 'light'
    },
    racing: {
        font: "'Rajdhani', sans-serif", weight: 700,
        primary: '#fff4ea', accent: '#ff7a1a', label: '#e0a679', footer: '#f5c9a0',
        shadow: 'rgba(0, 0, 0, 0.7)', panel: 'dark'
    },
    space: {
        font: "'Audiowide', sans-serif", weight: 400,
        // Gold for the name specifically (not near-white) — this
        // background's grey moon sits right behind it, and white-on-grey
        // doesn't separate enough. Gold is a big hue jump from both the
        // grey moon and the dark starfield, so it stays legible over either.
        primary: '#facc15', accent: '#e879f9', label: '#c9a3d6', footer: '#8f6f9c',
        shadow: 'rgba(0, 0, 0, 0.7)', panel: 'dark'
    }
};

/**
 * Rounded, drop-shadowed backing plaque behind the whole text block —
 * added because per-glyph text shadows alone weren't enough over the
 * busiest photos (25-ji's gear teeth, Snow's bright bokeh, Racing's light
 * streaks all vary too much *within* the text zone for any single flat
 * text color to stay reliably legible against). Applied to all 6 characters
 * for a consistent look, not just the ones that needed it. This is
 * intentionally different from the old full-canvas darkening scrim: it's a
 * small, bounded card behind just the text — reads as a label plate, not a
 * filter over the photo — tinted per character (dark plaque for light text,
 * light plaque for dark text) with a thin accent-colored border.
 */
function drawCertTextPlaque(ctx, x, y, width, height, type) {
    const radius = 20;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();

    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 26;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = type.panel === 'light' ? 'rgba(255, 251, 253, 0.7)' : 'rgba(6, 8, 13, 0.62)';
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = hexToRgba(type.accent, 0.4);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
}

/**
 * Draws this character's single certEmoji at all 4 corners (upper-left,
 * upper-right, lower-left, lower-right — same emoji every time, not one
 * per corner). Called from buildCertificateCanvas() AFTER the portrait, so
 * all 4 are always fully visible on every character regardless of portrait
 * geometry — some characters' hair/clothing reaches all the way to the
 * lower-left corner and fully hid the emoji there when this used to draw
 * underneath the portrait. Drawn with a shadow so it still pops against
 * whatever art (or bright background) ends up behind it.
 */
function drawCertCornerEmoji(ctx, canvas, config) {
    const mark = (config.certEmoji && config.certEmoji[0]) || '✨';
    ctx.font = '44px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
    ctx.fillText(mark, 60, 65);
    ctx.fillText(mark, canvas.width - 60, 65);
    ctx.fillText(mark, 60, canvas.height - 35);
    ctx.fillText(mark, canvas.width - 60, canvas.height - 35);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
}

/** Plain-gradient fallback background (no photo) — used only if the background/portrait photos fail to load entirely (see buildCertificateCanvas's catch). */
function drawCertificateFallbackBase(config, canvas, ctx) {
    const gradient = ctx.createRadialGradient(600, 200, 50, 600, 315, 700);
    gradient.addColorStop(0, hexToRgba(config.baseColor, 0.55));
    gradient.addColorStop(1, '#0d1117');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = config.certBorderColor || config.baseColor;
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
}

/**
 * Draws the corner emoji, name/mode/score text (everything that doesn't
 * depend on the portrait/background images), and finishes up. Emoji/text
 * are drawn last so they always sit on top rather than being covered.
 * `textX` is wherever the portrait actually left off (computed in
 * buildCertificateCanvas from that character's real rendered width) rather
 * than a fixed column, so text never overlaps a wide portrait. Each text
 * draw gets a soft drop-shadow (CERT_TYPOGRAPHY.shadow) in place of the old
 * full-canvas darkening scrim, so it stays legible over a busy/bright photo
 * without dimming the photo itself.
 */
function finishCertificate(canvas, ctx, callback, outcome = 'normal', textX = 480) {
    const config = CHARACTER_THEMES[currentCharacter];
    const type = CERT_TYPOGRAPHY[currentCharacter] || CERT_TYPOGRAPHY.classic;

    // Certificate text follows the current UI language (see i18n.js) — note
    // the per-character display fonts (Orbitron/Audiowide/Rajdhani/etc.)
    // only cover Latin glyphs, so Japanese text on the certificate falls
    // back to the browser's generic sans-serif for the CJK characters
    // specifically (still fully legible, just not the stylized face).
    const charName = t(`character.${currentCharacter}.name`);
    const victorySuffix = outcome === 'legacyVictory' ? t('certificate.legacyVictorySuffix')
        : outcome === 'victory' ? t('certificate.victorySuffix')
        : '';
    const modeLabelText = t(`certificate.modeLabels.${currentMode}`) + victorySuffix;
    const scoreText = String(score).padStart(6, '0');
    const footerText = t('certificate.footer');

    // Plaque width hugs the actual widest line of text instead of
    // stretching all the way to the canvas edge (which left a big dead gap
    // on the right — text is left-aligned, so a full-width box was mostly
    // empty past whatever the longest line's real pixel width was). Measure
    // each line in its own font/size and take the max.
    ctx.font = `${type.weight} 48px ${type.font}`;
    const nameWidth = ctx.measureText(charName).width;

    // The mode label can run long — "Live Performance Mode — Perfect
    // Harmony!" is a lot of text — and combined with a wide portrait
    // pushing textX inward (Space Singer especially), a fixed 28px size
    // could overflow past the canvas edge entirely. Shrink it to fit
    // whatever width is actually available instead of letting it run off.
    const availableWidth = canvas.width - 24 - textX;
    let modeFontSize = 28;
    ctx.font = `700 ${modeFontSize}px ${type.font}`;
    let modeWidth = ctx.measureText(modeLabelText).width;
    if (modeWidth > availableWidth) {
        modeFontSize = Math.max(16, Math.floor(modeFontSize * (availableWidth / modeWidth)));
        ctx.font = `700 ${modeFontSize}px ${type.font}`;
        modeWidth = ctx.measureText(modeLabelText).width;
    }

    ctx.font = `${type.weight} 92px ${type.font}`;
    const scoreWidth = ctx.measureText(scoreText).width;
    ctx.font = `600 18px ${type.font}`;
    const footerWidth = ctx.measureText(footerText).width;
    const contentWidth = Math.max(nameWidth, modeWidth, scoreWidth, footerWidth);
    const boxWidth = Math.min(canvas.width - 24 - (textX - 26), contentWidth + 55);

    // Shifted up from an earlier pass (was 150/210/250/320/405/505) so the
    // plaque clears the bottom corner emoji with real margin instead of
    // just barely not touching it.
    drawCertTextPlaque(ctx, textX - 26, 135, boxWidth, 385, type);

    ctx.shadowColor = type.shadow;
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    ctx.textAlign = 'left';
    ctx.fillStyle = type.primary;
    ctx.font = `${type.weight} 48px ${type.font}`;
    ctx.fillText(charName, textX, 195);

    ctx.fillStyle = type.accent;
    ctx.font = `700 ${modeFontSize}px ${type.font}`;
    ctx.fillText(modeLabelText, textX, 235);

    ctx.fillStyle = type.label;
    ctx.font = `600 22px ${type.font}`;
    ctx.fillText(t('certificate.finalScore'), textX, 305);

    ctx.fillStyle = type.accent;
    ctx.font = `${type.weight} 92px ${type.font}`;
    ctx.fillText(scoreText, textX, 390);

    ctx.fillStyle = type.footer;
    ctx.font = `600 18px ${type.font}`;
    ctx.fillText(footerText, textX, 490);

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    callback(canvas);
}

// Resolves once cert-assets.js (CERT_PORTRAIT_DATA/CERT_BACKGROUND_DATA) has
// loaded — memoized so concurrent callers share one <script> injection
// instead of racing to add it twice. See loadCertAssets() below.
let certAssetsLoadPromise = null;

/**
 * Lazily loads cert-assets.js — see that file's own header comment for why
 * it's ~5MB of pre-embedded data: URIs. Deliberately NOT one of index.html's
 * static <script> tags: it's only ever needed once a run ends and the
 * results screen builds a certificate, so loading it unconditionally at
 * page load meant nothing was interactive — not character select, not mode
 * select, not actual gameplay — until 5MB had finished downloading. That's
 * instant on localhost (which is why this was easy to miss) but a real,
 * visible stall over an actual network. Called opportunistically once a run
 * actually starts (see startGameWithMode()) so it's very likely already
 * cached by the time a results screen needs it; buildCertificateCanvas()
 * also awaits this same promise directly as a safety net for a player who
 * finishes faster than that background fetch.
 */
function loadCertAssets() {
    if (!certAssetsLoadPromise) {
        certAssetsLoadPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'cert-assets.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('cert-assets.js failed to load'));
            document.body.appendChild(script);
        }).catch(err => {
            // Don't memoize a failure — a transient network blip during the
            // opportunistic prefetch shouldn't permanently poison the promise
            // buildCertificateCanvas() later awaits as its own safety net;
            // reset so a later call gets a fresh <script> tag to retry with.
            certAssetsLoadPromise = null;
            throw err;
        });
    }
    return certAssetsLoadPromise;
}

/**
 * Builds the certificate canvas: background photo (cover-fit) + full-body
 * character portrait (contain-fit — shrunk to fit, NEVER cropped) + border,
 * then hands off to finishCertificate() for the text/emoji layer. No
 * darkening scrim over the photo (see CERT_TYPOGRAPHY's per-character
 * shadow instead) — the photo shows through at full brightness everywhere.
 *
 * Both images come from the pre-embedded CERT_BACKGROUND_DATA/CERT_PORTRAIT_DATA
 * (cert-assets.js) via loadImageFromDataUri() rather than loading the v-j-rs/
 * files directly — see that function's comment for why. If either somehow
 * still fails to decode, this falls back to a text-only gradient certificate
 * rather than getting stuck forever on "Preparing Certificate…".
 */
async function buildCertificateCanvas(callback, outcome = 'normal') {
    const config = CHARACTER_THEMES[currentCharacter];
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');

    try {
        // Safety net for whichever player reaches the results screen before
        // startGameWithMode()'s opportunistic prefetch has finished — see
        // loadCertAssets()'s own comment. A no-op await if it's already
        // resolved.
        await loadCertAssets();

        // Explicitly load this character's certificate font alongside the
        // images: an @font-face rule only actually fetches the font file
        // once something on the page needs it, and canvas text drawing
        // doesn't count as "needing it" the way DOM text does — without this,
        // a font that's never been used anywhere else (Quicksand/Rajdhani/
        // Audiowide, unlike Orbitron/Share Tech Mono which are already used
        // elsewhere) could still be mid-fetch the first time its certificate
        // is built, and canvas text — unlike DOM text — doesn't repaint
        // itself once the swap finishes, so it'd draw in a fallback font
        // and just stay that way.
        const type = CERT_TYPOGRAPHY[currentCharacter] || CERT_TYPOGRAPHY.classic;
        const [background, portrait] = await Promise.all([
            loadImageFromDataUri(CERT_BACKGROUND_DATA[currentCharacter]),
            loadImageFromDataUri(CERT_PORTRAIT_DATA[currentCharacter]),
            document.fonts.load(`${type.weight} 92px ${type.font}`),
            document.fonts.load(`700 28px ${type.font}`),
            document.fonts.load(`600 22px ${type.font}`)
        ]);

        drawCoverImage(ctx, background, canvas.width, canvas.height);

        // ---- Certificate portrait geometry --------------------------------
        // `certPortraitFrame` (CHARACTER_THEMES) is the character's real,
        // auto-detected content bounding box — not a tight/guessed crop, so
        // nothing of them is ever cut off. It's scaled down (aspect
        // preserved) to fit inside a MAX_W x MAX_H box, bottom-anchored so
        // every character stands on the same baseline. Text then starts
        // wherever THIS character's portrait actually ends (+ a gap) instead
        // of a fixed column, so a wider portrait automatically pushes the
        // text further right rather than overlapping it.
        const frame = config.certPortraitFrame;
        const MAX_W = 580;
        const MAX_H = 610;
        const cropAspect = frame.sWidth / frame.sHeight;
        let destWidth = MAX_W;
        let destHeight = destWidth / cropAspect;
        if (destHeight > MAX_H) {
            destHeight = MAX_H;
            destWidth = destHeight * cropAspect;
        }
        const destX = 20;
        const destY = canvas.height - destHeight - 8;
        ctx.drawImage(
            portrait,
            frame.sx, frame.sy, frame.sWidth, frame.sHeight,
            destX, destY, destWidth, destHeight
        );
        const textX = destX + destWidth + 30;
        // ---------------------------------------------------------------

        drawCertCornerEmoji(ctx, canvas, config);

        ctx.strokeStyle = config.certBorderColor || config.baseColor;
        ctx.lineWidth = 8;
        ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

        finishCertificate(canvas, ctx, callback, outcome, textX);
    } catch (e) {
        console.warn('Certificate background/portrait failed to load — generating a text-only fallback certificate.', e);
        drawCertificateFallbackBase(config, canvas, ctx);
        finishCertificate(canvas, ctx, callback, outcome);
    }
}

/** Kicks off certificate generation as soon as the results screen appears (see the big comment above). `outcome` (from gameOverScreen()) flows through to finishCertificate()'s mode-label line. */
function prepareCertificate(outcome = 'normal') {
    certificateCanvas = null;
    const downloadBtn = document.getElementById('downloadCertificateBtn');
    const copyBtn = document.getElementById('copyCertificateBtn');
    if (downloadBtn) { downloadBtn.textContent = t('results.certPreparing'); downloadBtn.disabled = true; }
    if (copyBtn) { copyBtn.textContent = t('results.copyToClipboard'); copyBtn.disabled = true; }

    buildCertificateCanvas(canvas => {
        certificateCanvas = canvas;
        if (downloadBtn) { downloadBtn.textContent = t('results.downloadCertificate'); downloadBtn.disabled = false; }
        if (copyBtn) copyBtn.disabled = false;
    }, outcome);
}

function downloadCertificate() {
    if (!certificateCanvas) return;
    const btn = document.getElementById('downloadCertificateBtn');
    try {
        const link = document.createElement('a');
        link.download = `miku-fever-certificate-${currentCharacter}.png`;
        link.href = certificateCanvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (e) {
        // Shouldn't happen — buildCertificateCanvas() already rebuilds
        // without the portrait if drawing it would taint the canvas — but
        // fail visibly instead of silently if something else goes wrong.
        console.error('Certificate download failed', e);
        if (btn) {
            btn.textContent = t('results.certDownloadFailed');
            setTimeout(() => { btn.textContent = t('results.downloadCertificate'); }, 2200);
        }
    }
}

function copyCertificateToClipboard() {
    if (!certificateCanvas) return;
    const btn = document.getElementById('copyCertificateBtn');
    const resetLabel = () => { if (btn) setTimeout(() => { btn.textContent = t('results.copyToClipboard'); }, 1800); };

    try {
        certificateCanvas.toBlob(blob => {
            if (!blob || !navigator.clipboard || !window.ClipboardItem) {
                if (btn) btn.textContent = t('results.certCopyUnsupported');
                resetLabel();
                return;
            }
            navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
                .then(() => { if (btn) btn.textContent = t('results.certCopied'); resetLabel(); })
                .catch(e => { console.error('Clipboard write failed', e); if (btn) btn.textContent = t('results.certCopyFailed'); resetLabel(); });
        }, 'image/png');
    } catch (e) {
        console.error('Certificate copy failed', e);
        if (btn) btn.textContent = t('results.certCopyFailed');
        resetLabel();
    }
}
