// Changelog Module
const ChangelogModule = (function() {
    const changelog = [
        {
            version: '2.0',
            date: '04-20-26',
            summary: `Reshaping the game closer to the original vision.
Ranking Upgrades have moved out of their own panel and into a new "Ranking Upgrades" line within the main upgrade store. They are now gated behind a new prestige upgrade, Initiate's Insight (8 Mana Crystals, requires Spell Core).
Prestige is no longer unlocked by a raw mana threshold. Instead, a new three-step "Path to Ascension" upgrade chain appears in the main store — Whisper of Ascension, Path of the Ascendant, and Break the Veil — and purchasing the final one unlocks the Prestige panel. Existing saves that had already prestiged keep access immediately.`
        },
        {
            version: '1.9',
            date: '04-20-26',
            summary: `Added Options toggles for the two Transcendence automations: Eternal Cantrip (autocast spells) and Prolific Wish (auto-trigger the Wishing Well). Turn them off per run if you want to manage spells or the well by hand without refunding the Essence.`
        },
        {
            version: '1.8',
            date: '04-20-26',
            summary: `Prestige Store is no longer a trap — you can open it without pending crystals (to spend existing ones), and a new "Return to Run" button lets you leave the store without resetting your run. The prestige panel text now accurately explains the flow.
"Bonus Prestige Level" upgrades (Mana-Touched through One With The Weave) now actually do something: each Prestige Level grants a flat +1% MPS on top of the upgrade's own +2%, and the MPS display now shows the real effective prestige bonus instead of a misleading raw level count.
Added Automation toggles in the Options panel — you can now disable Arcane Auto-Gather and Arcane Automation without refunding the prestige upgrades, handy if you want to hand-pick your ranking upgrade order for a run.`
        },
        {
            version: '1.7',
            date: '04-16-26',
            summary: `Achievements panel now has a "Show locked achievements (spoilers)" toggle that lists all unearned achievements with their descriptions, so you can see exactly what you're missing.
Two new Transcendence upgrades for hands-free late-game play:
- Eternal Cantrip (5 Essence): spells cast themselves when Spell Power is near full, picking the most expensive affordable spell first.
- Prolific Wish (4 Essence): Wishing Well effects trigger themselves when coins are at max, picking the most valuable affordable effect first.`
        },
        {
            version: '1.6',
            date: '04-16-26',
            summary: `Fixed Spells Cast statistic stuck at 0 — the counter was never incremented when casting spells.
Screen reader users now hear the full spell description and cost when focused on Cast buttons (matches the Wishing Well pattern).
Pressing G to gather mana now plays the gather sound (previously silent, only mouse clicks played sound).
Runestones play an activation sound when clicked.
Wishing Well effects play a sound when triggered, and a close sound when they expire.
Spells play a close sound when they expire.
Fixed alt-tabbed tabs accruing little production: browsers throttle background tabs so heavily that the 5s delta cap was eating most of the elapsed time. Visibility-change now applies offline-style catch-up (same cap and rate as reload-time offline progress) when the tab returns.
Prestige Store now shows prerequisite-gated upgrades as locked teasers so you can see what's coming in the chain, instead of hiding them until you buy the prereq.`
        },
        {
            version: '1.5',
            date: '04-16-26',
            summary: `Fixed challenges activating without prestige — challenges now require at least one prestige before they can be started. Existing saves with exploited challenges are cleaned up on load.
Fixed ranking upgrades not refreshing when new achievements are earned while the panel is open — new items now appear immediately.
Fixed notification suppression not working for screen reader announcements — all aria-live writes (achievements, runestones, purchases, challenges) now respect the Enable Notifications toggle.
Fixed background tab losing production — game loop now uses delta-time so mana accrual is accurate even when the browser throttles background tabs. Also guards against system clock adjustments.
Improved save reliability — saves now use a staging key so a tab close mid-write can't corrupt the save file.`
        },
        {
            version: '1.4',
            date: '04-15-26',
            summary: `Ranking Upgrades rebalanced across wizard ranks: familiars gated in 13 tiers, enchantments and wizardries individually gated. 32 of 40 ranks now unlock new items (was 5). Rank-locked teasers show what's coming and how many achievements you need.
16 new achievements (231 total) for ranking upgrade milestones: familiars, enchantments, wizardries, and combined totals.`
        },
        {
            version: '1.3',
            date: '04-15-26',
            summary: `Fixed building bulk-buy charging more than single-buy when Challenge or Transcendence cost discounts were active; all paths now share one cost formula.
Fixed tutorial re-appearing on every page load — the final step never wrote its completion flag.
Fixed Options "Enable Notifications" toggle being ignored by achievement, game, offline-progress, and challenge-complete notifications.
Fixed Ranking Upgrades Buy buttons staying disabled until the panel was closed and reopened; affordability now refreshes live.
Fixed screen-reader users not hearing the time-until-affordable countdown on buildings; aria-label now matches the visible text.
Replaced stale hard-coded production numbers in building descriptions with thematic text (the live "Each: X MPS" display below already shows real production).`
        },
        {
            version: '1.1',
            date: '04-14-26',
            summary: `79 new achievements (201 total) covering MPS, clicks, prestiges, challenges, spells, synergies, and more.
Wizard ranks rescaled from 0-1500 to 0-201 — all 58 ranks are now reachable.
5 MPS-scaling click upgrades (Mana Tap through Godhand) — clicking stays relevant all game.
35 new building upgrades at milestone 50 and 100 for all buildings.
Eternal Slumber transcendence upgrade increases offline cap from 8 to 24 hours.
Achievement notifications now show the description of what you earned.
Balance: Magic Library/Spire production fixed, Click Sacrifices rebalanced, spells buffed, prestige bonus doubled, Mana-Touched chain has escalating costs, transcendence threshold lowered.
Fixed: Wishing Well buttons unclickable, Coin Shower exploit, Fire Elemental cost blocking Lava Elemental, runestone timer stuck at 1s.`
        },
        {
            version: '1.0',
            date: '04-13-26',
            summary: `Transcendence - second prestige layer with Arcane Essence currency and 10 endgame upgrades.
Narrative Tutorial - guided story intro for new players.
16 Story Milestones narrating the wizard's rise to power.
All empty upgrade flavor text filled in with thematic descriptions.
Keyboard Shortcuts documented in Options panel.
Wizard Proficiency and rank shown on the main screen.
Effective production per building shown on each card with all multipliers.
Buy All Affordable upgrades button.
Arcane Automation prestige upgrade for true idle play.
Mana shown in tab title when backgrounded.
Save on tab close. Fixed runestone/wishing well notifications.
Fixed wishing well softlock. Fixed synergy cross-update bug.`
        },
        {
            version: '0.9',
            date: '04-13-26',
            summary: `Building Synergies - buildings boost each other based on ownership, creating strategic depth.
Ascension Challenges - 6 challenge runs with restrictions and permanent rewards.
Progressive Disclosure - UI sections hidden until relevant, reducing new-player clutter.
Interactive events now play a sound and announce to screen readers.
Synergy display is fully accessible with live bonus percentages.
Fixed Spellcasting panel not opening (init order bug).
Fixed bulk buy button highlighting.`
        },
        {
            version: '0.8',
            date: '04-13-26',
            summary: `Offline Progress - earn Mana while away (50% rate, capped at 8 hours).
Floating click numbers - visual "+X" feedback when gathering Mana.
Bulk Buy - toggle between x1, x10, x100, or Max for buildings.
Expanded Wishing Well - 4 new effects and well leveling system.
Expanded Prestige Store - 8 new upgrades including Auto-Gather, Head Start, and more.
Interactive Events - occasional choices with risk/reward in the events log.
Accessibility maintained across all new features.`
        },
        {
            version: '0.7',
            date: '02-05-26',
            summary: `MagicTap now has sound! Sounds contributed by Pitermach.
Added complete Spellcasting system with 8 spells and Spell Power regeneration.
Added Prestige Potential upgrades - unlock the power of your prestige level (10 tiers, 10% each).
Added Mana-Saturated upgrade chain continuation.
Fixed Runestone positioning and made them accessible buttons.
Improved screen reader announcements (reduced spam, clearer notifications).
Default volume now starts at 50%.
Various bug fixes and accessibility improvements.`
        },
        {
            version: '0.6',
            date: '02-01-26',
            summary: `Added 20+ achievements.
Added new flavor events.
Added new upgrades.
Added new buildings.
Added new possibilities for the Wishing Well.
Runestones can now appear to give potential buffs/debuffs. Pay attention to their color.
Added new Prestige upgrades, including plans for challenge modes.`
        },
        {
            version: '0.5',
            date: '01-31-26',
            summary: `Addressed MPS issue.
Added achievement-related upgrades, and fleshed out the achievement boost system.
Added more achievements, upgrades, and buildings.
Now you can get familiars, and we'll have a selector to display your favorite, as you unlock them.
Worked more on the Wishing Well.`
        },
        {
            version: '0.4',
            date: '01-30-26',
            summary: `Did a major overhaul including,
Tons of achievements
New upgrades
Slightly altered save system (you can save your option changes)
Added number formatting, and truncation for you monsters who don't want to hear long numbers.
2 new buildings
Setup for Magic Proficiency (boost to MPS based on achievements), including upgrades to further increase the mana production.
Improved accessibility.
Dismiss all notifications button.
Wishing Well setup. (Along with thoughts for future "mini-games.")
Bonus prestige upgrades.`
        },
        {
            version: '0.3',
            date: '01-29-26',
            summary: `Added prestige system.
Added new upgrades, and a new building.
Populated the Prestige Store with a single upgrade.`
        },
        {
            version: '0.1/0.2',
            date: '01-24-26/01-25-26',
            summary: `Initial release, and setup.
Made MagicTap with ClaudeCode.
Included the first buildings, and upgrades. Made achievements, and Game Navigation section.
Also includes save system.`
        }
    ];

    function getHTML() {
        return `
        <section id="changelog-panel" class="game-panel" hidden>
            <h2 id="changelog-heading" tabindex="-1">Changelog</h2>
            <div id="changelog-container" aria-labelledby="changelog-heading">
                <p>Current Version: <span id="current-version">${VERSION}</span></p>
                <div id="changelog-list"></div>
            </div>
        </section>`;
    }

    function renderChangelog() {
        const container = document.getElementById('changelog-list');
        if (!container) return;

        container.innerHTML = '';
        changelog.forEach(entry => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'changelog-entry';
            const summaryHtml = entry.summary.split('\n').map(line => `<p>• ${line}</p>`).join('');
            entryDiv.innerHTML = `
                <h3>V.${entry.version} <span class="changelog-date">${entry.date}</span></h3>
                ${summaryHtml}
            `;
            container.appendChild(entryDiv);
        });
    }

    function getChangelog() {
        return changelog;
    }

    return {
        getHTML,
        renderChangelog,
        getChangelog
    };
})();
