/**
 * ============================================================================
 * LANGUAGE / TRANSLATION SYSTEM (English / Japanese)
 * ============================================================================
 * Plain dictionary + a toggle button — no build step, works fine loaded via
 * a plain <script> tag under file://. Must load BEFORE miku-logic.js (see
 * index.html), which calls t()/applyTranslations() throughout.
 *
 * >>> EDIT HERE to change wording in either language, or to add a new
 * language: copy the `en` block, translate every value, and add the language
 * code to LANGUAGE_ORDER below so the toggle button cycles through it too.
 *
 * HOW IT WORKS
 * - Static HTML text: elements carry a `data-i18n="dotted.key.path"`
 *   attribute (see index.html). applyTranslations() walks every one of
 *   those on page load and whenever the language changes, and sets its
 *   textContent from the dictionary. `data-i18n-attr="title"` (or
 *   "aria-label", "placeholder", etc.) on the same element translates that
 *   attribute instead of textContent — see e.g. #specialBtn's tooltip.
 * - Dynamic JS-generated text (bonus popups, results screen, certificates):
 *   call t('dotted.key.path', { placeholder: value }) directly wherever
 *   that string is built — see miku-logic.js.
 * - {placeholders} inside a string are replaced from the second argument to
 *   t(). Missing keys fall back to the English string (logged to console
 *   once) so a translation gap never shows a blank UI.
 *
 * SCOPE NOTE: individual credit-list attributions (real people's names/
 * sites in the footer) are intentionally left untranslated, since they're
 * proper nouns, not UI copy. Filename-derived board-icon names used inside
 * a few popups/tooltips (see humanizeIconName() in miku-logic.js) are also
 * left in English — translating those would need a full per-icon-file
 * translation table, which wasn't worth the added complexity for text that
 * only appears briefly inside a toast.
 */

const LANGUAGE_ORDER = ['en', 'ja'];
const LANGUAGE_LABELS = { en: 'EN', ja: '日本語' };

const I18N = {
    en: {
        header: {
            soundToggleLabel: "Toggle Synthesizer Sound",
            soundActive: "Synth Audio Active",
            soundMuted: "Synth Audio Muted",
            langToggleLabel: "Switch language"
        },
        nav: {
            roster: "Roster"
        },
        roster: {
            badge: "Vocaloid Match-3 Project",
            titleLine1: "MIKU",
            titleLine2: "FEVER",
            tagline: "A free non-commercial fanmade match-3 puzzle game featuring Hatsune Miku and her alternate outfits. Choose your favorite Miku variant and play through themed stages with unique aesthetics and challenges!"
        },
        character: {
            classic: {
                name: "Classic Miku",
                title: "Virtual Diva #01",
                desc: "Futuristic vibes with cyan aesthetics. Match negi leeks, microphones, curious cats, and wifi signals — plus the lucky number 39.",
                cta: "Play Classic →",
                portraitAlt: "Classic Miku portrait"
            },
            sakura: {
                name: "Sakura Miku",
                title: "Springtime Blossom",
                desc: "Sweet pastel-pink board dressed in cherry blossoms. Match sakura blooms, sweet mochi, fresh cherries, and cozy temperature charms.",
                cta: "Play Sakura →",
                portraitAlt: "Sakura Miku portrait"
            },
            nightcord: {
                name: "25-ji Miku",
                title: "Void World",
                desc: "A void theme born from silent echoes. Match delicate ribbons, hourglasses, memory photos, and glitching gear icons.",
                cta: "Play 25-ji →",
                portraitAlt: "25-ji Miku portrait"
            },
            snow: {
                name: "Snow Miku",
                title: "Winter Wonderland",
                desc: "A frosty, shimmering aesthetic of blue and silver ice. Match sparkling snowflakes, cozy mittens, winter rabbits, and crimson winter charms.",
                cta: "Play Snow →",
                portraitAlt: "Snow Miku portrait"
            },
            racing: {
                name: "Racing Miku",
                title: "Mechanic Enthusiast",
                desc: "High-octane neon orange and emerald green. Match checkered flags, speedy cars, racing wheels, and first-place trophies!",
                cta: "Play Racing →",
                portraitAlt: "Racing Miku portrait"
            },
            space: {
                name: "Space Singer",
                title: "Galactic Odyssey",
                desc: "Deep galaxy purples and sparkling solar flares. Match astrophysics charts, falling stars, planet, and mysterious cosmic numerals.",
                cta: "Play Space →",
                portraitAlt: "Space Singer portrait"
            }
        },
        modeSelect: {
            heading1: "CHOOSE YOUR",
            heading2: "MODE",
            playingAs: "Playing as {name}"
        },
        mode: {
            stageClear: {
                name: "Stage Clear Mode",
                subtitle: "The Progression Mode",
                desc: "Reach the target score and clear themed obstacle tiles before you run out of moves. Chain matches during Fever Mode to earn bonus moves.",
                cta: "Play Stage Clear →"
            },
            livePerformance: {
                name: "Live Performance Mode",
                subtitle: "High-Energy Time Attack",
                desc: "Race a shrinking 90-second timer. Matches add time back; a 5x combo triggers Fever Mode for double points and faster-falling tiles.",
                cta: "Play Live Performance →"
            },
            leisure: {
                name: "Leisure Mode",
                subtitle: "Casual & Endless",
                desc: "No move limits, no timers, no game-overs. A relaxed sandbox to match at your own pace and watch the cascades.",
                cta: "Play Leisure Mode →"
            }
        },
        hud: {
            movesLeft: "Moves Left:",
            timeLeft: "Time Left:",
            secondsSuffix: "s",
            howToPlay: "How To Play",
            modes: "Modes",
            pause: "Pause",
            resume: "Resume",
            end: "End",
            totalScore: "Total Score",
            targetGoal: "Target goal",
            feverProgress: "FEVER PROGRESS",
            stageLevel: "Stage Level",
            currentCombo: "Current Combo",
            instructionTip: "“Click or swipe two neighboring items to align 3 of a kind!”",
            footerTip1: "Fever milestones & timed challenges grant bonus moves/time!",
            footerTip2: "No moves? We'll auto-reshuffle!"
        },
        special: {
            buttonLabel: "Special",
            buttonTitle: "Charge the mana bar to unlock your special move",
            manaChargeHint: "Mana charges from matching: {icon}"
        },
        howToPlay: {
            heading: "How To Play",
            gotIt: "Got it!",
            special: {
                classic: { name: "Harmony Wave", desc: "doubles your Fever gain for 25 seconds." },
                sakura: { name: "Blossom Blast", desc: "marks 2 tiles — click either one anytime to blow up a 3x3 area around it." },
                nightcord: { name: "Void World", desc: "instantly clears every tile of whichever icon covers the most of the board." },
                snow: { name: "Glacial Freeze", desc: "an instant refill: +8s in Live Performance, +4 moves in Stage Clear, or +200 score in Leisure." },
                racing: { name: "Turbo Blitz", desc: "aim anywhere and clear that entire row and column at once." },
                space: { name: "Cosmic Gravity", desc: "25 seconds of moving any tile anywhere on the board, match or not, with bonus points on matches you make during it." }
            },
            yourSpecial: "(your Special)",
            stageClear: [
                "Reach the target score before your moves run out. Clear all 100 stages to win!",
                "The target score climbs a little every 10 stages.",
                "Fill the Fever bar for bonus points. Every few levels it triggers a 30s bonus round with free moves.",
                "Every 10th level grants a big score bonus.",
                "Stuck with no moves left? The board auto-reshuffles, but it costs you a move."
            ],
            livePerformance: [
                "Score as much as you can before your 90-second clock hits 0.",
                "5x combos (or a full Fever bar) level up Fever. Every few levels it triggers a bonus round that freezes your clock.",
                "Every 10th level adds +30 seconds.",
                "Running low on time makes the board noticeably harder — watch the final stretch!",
                "Stuck with no moves left? The board auto-reshuffles, but it costs you 5 seconds."
            ],
            leisure: [
                "No moves, no timer, no game-overs — just relax and match at your own pace.",
                "Filling the Fever bar triggers a fun celebration burst.",
                "Match icons to fill your mana bar, then unleash your Special whenever you like."
            ]
        },
        pause: {
            paused: "PAUSED"
        },
        results: {
            finalScoreLabel: "Final Score",
            playAgain: "Play Again",
            backToRoster: "Back to Roster",
            downloadCertificate: "Download Certificate",
            copyToClipboard: "Copy to Clipboard",
            certPreparing: "Preparing Certificate…",
            certDownloadFailed: "Download failed — see console",
            certCopyUnsupported: "Copy unsupported here",
            certCopied: "Copied!",
            certCopyFailed: "Copy failed",
            stageClearVictory: {
                badge: "🏆 Stage Master!",
                heading: "VICTORY!",
                detail: "You conquered all {finalLevel} stages with a final score of {score}! A true Stage Clear champion."
            },
            livePerformanceOver: {
                badge: "Time's Up!",
                heading: "PERFORMANCE OVER",
                detail: "You rocked the stage for a final score of {score} with a longest chain of {bestCombo}! Try to beat your record."
            },
            leisureEnded: {
                badge: "Session Ended",
                heading: "THANKS FOR PLAYING",
                detail: "You matched casually for a total of {score} points. Come back anytime to relax!"
            },
            stageClearOver: {
                badge: "Roster run completed!",
                heading: "STAGE OVER",
                detail: "Your matching run was successful, reaching Stage Level {level}! Try playing another variation to enjoy a brand-new style!"
            }
        },
        popup: {
            hardModeFinalStretch: "Final Stretch! Board Getting Harder",
            feverLevelUpSparkle: "✨ Fever Level {level}! ✨",
            feverLevelUpPoints: "Fever Level {level}! +100",
            feverMilestonePoints: "+{gain} Points! (Fever Milestone Lv.{level})",
            feverMilestoneSeconds: "+{gain}s! (Fever Milestone Lv.{level})",
            themedTileChallengeStart: "Fever Bonus Round! Clear Themed Tiles — 30s",
            themedTileChallengeWin: "Themed Tiles Cleared! +10 Moves",
            challengeTimeUpHalf: "Time's Up — Half Reward",
            iconChallengeStart: "Fever Bonus Round! Match {icon} x4! 60s",
            iconChallengeWin: "Challenge Complete! +25s",
            bonusIconMoves: "+{gain} Moves",
            bonusIconSeconds: "+{gain}s",
            deadlockMove: "-1 Move (Board Reshuffled)",
            deadlockSeconds: "-5s (Board Reshuffled)",
            harmonyWave: "Harmony Wave! Fever Gain x2 — 25s",
            blossomBlast: "Blossom Blast! Click a flashing tile to detonate",
            glacialFreezeSeconds: "+8s",
            glacialFreezeMoves: "+4 Moves",
            glacialFreezeScore: "+200",
            cosmicGravity: "Cosmic Gravity! Move Any Tile — 25s"
        },
        challenge: {
            themedTileBanner: "🧊 Themed Tiles: {remaining} left — {seconds}s",
            iconMatchBanner: "🎯 Match {icon}: {progress}/4 — {seconds}s"
        },
        footer: {
            copyright: "© 2026 Miku Fever Match-3. Free Non-Commercial Fanmade Project.",
            aestheticInspirations: "Aesthetic Inspirations",
            webAudioSynth: "Web Audio API Synthesizer",
            assetCredits: "Asset Credits",
            iconCredits: "Move & Time Icon Credits",
            audioCredits: "Audio Credits",
            backgroundCredits: "Certificate Background Credits"
        },
        certificate: {
            modeLabels: {
                stageClear: "Stage Clear Mode",
                livePerformance: "Live Performance Mode",
                leisure: "Leisure Mode"
            },
            victorySuffix: " — Victory!",
            finalScore: "FINAL SCORE",
            footer: "Miku Fever Match-3 — a free fanmade project"
        }
    },

    ja: {
        header: {
            soundToggleLabel: "シンセサイザー音声の切り替え",
            soundActive: "シンセ音声：オン",
            soundMuted: "シンセ音声：ミュート",
            langToggleLabel: "言語を切り替える"
        },
        nav: {
            roster: "ロスター"
        },
        roster: {
            badge: "ボーカロイド・マッチ3プロジェクト",
            titleLine1: "ミク",
            titleLine2: "フィーバー",
            tagline: "初音ミクと着せ替え衣装が登場する、非営利のファンメイド・マッチ3パズルゲームです。お気に入りのミクを選んで、個性豊かなステージに挑戦しよう！"
        },
        character: {
            classic: {
                name: "クラシック・ミク",
                title: "バーチャル・ディーヴァ #01",
                desc: "シアンを基調としたフューチャリスティックな世界観。ネギ、マイク、猫、Wi-Fi信号をマッチさせよう — ラッキーナンバー「39」も登場。",
                cta: "クラシックで遊ぶ →",
                portraitAlt: "クラシック・ミクのポートレート"
            },
            sakura: {
                name: "さくら・ミク",
                title: "春の訪れ",
                desc: "桜で彩られた、パステルピンクの優しい世界観。桜の花、お餅、さくらんぼ、あたたかな温度チャームをマッチさせよう。",
                cta: "さくらで遊ぶ →",
                portraitAlt: "さくら・ミクのポートレート"
            },
            nightcord: {
                name: "25時・ミク",
                title: "ヴォイドワールド",
                desc: "静寂の残響から生まれたヴォイドの世界観。リボン、砂時計、記憶の写真、明滅する歯車アイコンをマッチさせよう。",
                cta: "25時で遊ぶ →",
                portraitAlt: "25時・ミクのポートレート"
            },
            snow: {
                name: "雪ミク",
                title: "冬のワンダーランド",
                desc: "青と銀の氷がきらめく、霜降る世界観。雪の結晶、あたたかいミトン、冬のうさぎ、深紅の冬チャームをマッチさせよう。",
                cta: "雪ミクで遊ぶ →",
                portraitAlt: "雪ミクのポートレート"
            },
            racing: {
                name: "レーシング・ミク",
                title: "メカニック好き",
                desc: "ネオンオレンジとエメラルドグリーンが弾ける、ハイオクタンな世界観。チェッカーフラッグ、疾走する車、レーシングホイール、優勝トロフィーをマッチさせよう！",
                cta: "レーシングで遊ぶ →",
                portraitAlt: "レーシング・ミクのポートレート"
            },
            space: {
                name: "スペースシンガー",
                title: "銀河のオデッセイ",
                desc: "深い銀河の紫と、きらめく太陽フレアの世界観。天体図、流れ星、惑星、謎めいた宇宙の数字をマッチさせよう。",
                cta: "スペースで遊ぶ →",
                portraitAlt: "スペースシンガーのポートレート"
            }
        },
        modeSelect: {
            heading1: "モードを",
            heading2: "選択",
            playingAs: "プレイ中のキャラクター：{name}"
        },
        mode: {
            stageClear: {
                name: "ステージクリアモード",
                subtitle: "王道の進行モード",
                desc: "手数が尽きる前に目標スコアを達成し、テーマ付き妨害タイルをクリアしよう。フィーバーモード中にマッチを連鎖させるとボーナス手数がもらえる。",
                cta: "ステージクリアで遊ぶ →"
            },
            livePerformance: {
                name: "ライブパフォーマンスモード",
                subtitle: "ハイテンション・タイムアタック",
                desc: "90秒のタイマーとの勝負。マッチで時間が回復し、5連コンボでフィーバーモード発動 — スコア2倍＆タイルが速く落下する。",
                cta: "ライブパフォーマンスで遊ぶ →"
            },
            leisure: {
                name: "リラックスモード",
                subtitle: "カジュアル＆エンドレス",
                desc: "手数制限なし、タイマーなし、ゲームオーバーなし。自分のペースでマッチを楽しみ、連鎖を眺められるリラックス空間。",
                cta: "リラックスモードで遊ぶ →"
            }
        },
        hud: {
            movesLeft: "残り手数：",
            timeLeft: "残り時間：",
            secondsSuffix: "秒",
            howToPlay: "遊び方",
            modes: "モード",
            pause: "一時停止",
            resume: "再開",
            end: "終了",
            totalScore: "合計スコア",
            targetGoal: "目標スコア",
            feverProgress: "フィーバー進行度",
            stageLevel: "ステージレベル",
            currentCombo: "現在のコンボ",
            instructionTip: "「隣り合う2つのアイテムをクリックまたはスワイプして、3つ揃えよう！」",
            footerTip1: "フィーバーの節目やタイムチャレンジでボーナス手数・時間がもらえる！",
            footerTip2: "手数がなくなったら自動でシャッフルします！"
        },
        special: {
            buttonLabel: "スペシャル",
            buttonTitle: "マナバーを満タンにするとスペシャル技が解放されます",
            manaChargeHint: "マナが溜まるマッチ対象：{icon}"
        },
        howToPlay: {
            heading: "遊び方",
            gotIt: "わかった！",
            special: {
                classic: { name: "ハーモニーウェーブ", desc: "25秒間、フィーバー獲得量が2倍になる。" },
                sakura: { name: "ブロッサムブラスト", desc: "タイルを2つマークする — いつでもどちらかをクリックすると、その周囲3x3マスが爆発する。" },
                nightcord: { name: "ヴォイドワールド", desc: "盤面で最も多いアイコンのタイルを、種類ごと即座にすべて消す。" },
                snow: { name: "グレイシャルフリーズ", desc: "即座に補給：ライブパフォーマンスなら+8秒、ステージクリアなら+4手、リラックスなら+200点。" },
                racing: { name: "ターボブリッツ", desc: "盤面上のどこでも狙いを定め、その行と列をまるごと消す。" },
                space: { name: "コズミックグラビティ", desc: "25秒間、盤面上のどのタイルでも（揃うかどうかに関わらず）自由に動かせる。その間に成立したマッチにはボーナス点が入る。" }
            },
            yourSpecial: "（あなたのスペシャル）",
            stageClear: [
                "手数が尽きる前に目標スコアを達成しよう。全100ステージをクリアすれば勝利！",
                "目標スコアは10ステージごとに少しずつ上がる。",
                "フィーバーバーを満タンにするとボーナス点がもらえる。数レベルごとに、手数無制限の30秒ボーナスラウンドが発生。",
                "10レベルごとに大きなスコアボーナスがもらえる。",
                "手数がなくなった？盤面は自動でシャッフルされるが、手数を1つ消費する。"
            ],
            livePerformance: [
                "90秒のタイマーが0になる前に、できるだけ高いスコアを稼ごう。",
                "5連コンボ（またはフィーバーバー満タン）でフィーバーレベルアップ。数レベルごとに、タイマーが止まるボーナスラウンドが発生。",
                "10レベルごとに+30秒。",
                "残り時間が少なくなると盤面が明らかに難しくなる — 終盤は要注意！",
                "手数がなくなった？盤面は自動でシャッフルされるが、5秒を消費する。"
            ],
            leisure: [
                "手数制限もタイマーもゲームオーバーもなし — 自分のペースでゆったりマッチしよう。",
                "フィーバーバーを満タンにすると、楽しいお祝い演出が発生。",
                "アイコンをマッチさせてマナバーを満タンにし、好きなタイミングでスペシャルを発動しよう。"
            ]
        },
        pause: {
            paused: "一時停止中"
        },
        results: {
            finalScoreLabel: "最終スコア",
            playAgain: "もう一度プレイ",
            backToRoster: "ロスターに戻る",
            downloadCertificate: "証明書をダウンロード",
            copyToClipboard: "クリップボードにコピー",
            certPreparing: "証明書を準備中…",
            certDownloadFailed: "ダウンロードに失敗しました — コンソールを確認してください",
            certCopyUnsupported: "この環境ではコピーに対応していません",
            certCopied: "コピーしました！",
            certCopyFailed: "コピーに失敗しました",
            stageClearVictory: {
                badge: "🏆 ステージマスター！",
                heading: "勝利！",
                detail: "全{finalLevel}ステージを最終スコア{score}でクリア！真のステージクリアチャンピオンだ。"
            },
            livePerformanceOver: {
                badge: "タイムアップ！",
                heading: "パフォーマンス終了",
                detail: "最終スコア{score}、最長コンボ{bestCombo}でステージを盛り上げた！記録更新を目指そう。"
            },
            leisureEnded: {
                badge: "セッション終了",
                heading: "プレイありがとうございました",
                detail: "合計{score}点、のんびりマッチを楽しんだ。いつでもまた遊びに来てね！"
            },
            stageClearOver: {
                badge: "ロスター走破完了！",
                heading: "ステージ終了",
                detail: "ステージレベル{level}まで到達、マッチングは成功だ！別のバリエーションで新しいスタイルも楽しんでみよう！"
            }
        },
        popup: {
            hardModeFinalStretch: "終盤突入！盤面の難易度アップ",
            feverLevelUpSparkle: "✨ フィーバーレベル{level}！ ✨",
            feverLevelUpPoints: "フィーバーレベル{level}！+100",
            feverMilestonePoints: "+{gain}点！（フィーバー節目 Lv.{level}）",
            feverMilestoneSeconds: "+{gain}秒！（フィーバー節目 Lv.{level}）",
            themedTileChallengeStart: "フィーバーボーナスラウンド！テーマタイルを一掃せよ — 30秒",
            themedTileChallengeWin: "テーマタイル一掃！+10手",
            challengeTimeUpHalf: "タイムアップ — 報酬半分",
            iconChallengeStart: "フィーバーボーナスラウンド！{icon}を4回マッチ！60秒",
            iconChallengeWin: "チャレンジ達成！+25秒",
            bonusIconMoves: "+{gain}手",
            bonusIconSeconds: "+{gain}秒",
            deadlockMove: "-1手（盤面をシャッフルしました）",
            deadlockSeconds: "-5秒（盤面をシャッフルしました）",
            harmonyWave: "ハーモニーウェーブ！フィーバー獲得量2倍 — 25秒",
            blossomBlast: "ブロッサムブラスト！点滅するタイルをクリックして起爆",
            glacialFreezeSeconds: "+8秒",
            glacialFreezeMoves: "+4手",
            glacialFreezeScore: "+200",
            cosmicGravity: "コズミックグラビティ！どのタイルでも移動可能 — 25秒"
        },
        challenge: {
            themedTileBanner: "🧊 テーマタイル残り：{remaining} — {seconds}秒",
            iconMatchBanner: "🎯 {icon}をマッチ：{progress}/4 — {seconds}秒"
        },
        footer: {
            copyright: "© 2026 Miku Fever Match-3. 非営利のファンメイド作品です。",
            aestheticInspirations: "デザインの参考元",
            webAudioSynth: "Web Audio API シンセサイザー",
            assetCredits: "アセット・クレジット",
            iconCredits: "手数／時間アイコン・クレジット",
            audioCredits: "音声クレジット",
            backgroundCredits: "証明書背景クレジット"
        },
        certificate: {
            modeLabels: {
                stageClear: "ステージクリアモード",
                livePerformance: "ライブパフォーマンスモード",
                leisure: "リラックスモード"
            },
            victorySuffix: " — 勝利！",
            finalScore: "最終スコア",
            footer: "Miku Fever Match-3 — 無料のファンメイド作品"
        }
    }
};

let currentLanguage = (() => {
    try {
        const saved = localStorage.getItem('mikuFeverLang');
        if (saved && LANGUAGE_ORDER.includes(saved)) return saved;
    } catch (e) { /* localStorage unavailable (e.g. some file:// contexts) — default to English */ }
    return 'en';
})();

const _missingKeyWarned = new Set();

/**
 * Looks up `path` (dot-separated, e.g. "results.playAgain") in the current
 * language, falling back to English if missing so a translation gap never
 * shows a blank UI. `vars` fills in any {placeholder} tokens in the string.
 */
function t(path, vars) {
    const lookup = (lang) => {
        const parts = path.split('.');
        let node = I18N[lang];
        for (const part of parts) {
            if (node == null) return undefined;
            node = node[part];
        }
        return node;
    };

    let value = lookup(currentLanguage);
    if (value === undefined) {
        if (!_missingKeyWarned.has(path)) {
            console.warn(`[i18n] Missing "${path}" for language "${currentLanguage}", falling back to English.`);
            _missingKeyWarned.add(path);
        }
        value = lookup('en');
    }
    if (value === undefined) {
        console.warn(`[i18n] Missing "${path}" in English too — check the key path.`);
        return path;
    }
    if (typeof value !== 'string') return value;

    if (vars) {
        return value.replace(/\{(\w+)\}/g, (match, key) => (key in vars ? vars[key] : match));
    }
    return value;
}

/** Walks every [data-i18n] element and sets its text (or a chosen attribute) from the current language. */
function applyTranslations() {
    document.documentElement.lang = currentLanguage;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const attr = el.getAttribute('data-i18n-attr');
        const value = t(key);
        if (attr) {
            el.setAttribute(attr, value);
        } else {
            el.textContent = value;
        }
    });
}

/** Switches the active language, persists it, re-renders static text, and refreshes whatever dynamic text is currently on screen. */
function setLanguage(lang) {
    if (!LANGUAGE_ORDER.includes(lang)) return;
    currentLanguage = lang;
    try { localStorage.setItem('mikuFeverLang', lang); } catch (e) { /* ignore */ }

    applyTranslations();
    refreshDynamicTranslations();

    const btn = document.getElementById('langToggleBtn');
    if (btn) btn.textContent = LANGUAGE_LABELS[lang];
}

/** Cycles to the next language in LANGUAGE_ORDER (only en/ja today, so this is a simple toggle). */
function toggleLanguage() {
    const nextIndex = (LANGUAGE_ORDER.indexOf(currentLanguage) + 1) % LANGUAGE_ORDER.length;
    setLanguage(LANGUAGE_ORDER[nextIndex]);
}
