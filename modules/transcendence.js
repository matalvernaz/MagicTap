// Transcendence Module - Second prestige layer for endgame
const TranscendenceModule = (function() {
    let arcaneEssence = 0;
    let totalArcaneEssenceEarned = 0;
    let timesTranscended = 0;

    const TRANSCENDENCE_THRESHOLD = 100; // Minimum total crystals earned to transcend

    const transcendenceUpgrades = [
        {
            id: 'eternal-flow',
            name: 'Eternal Flow',
            description: 'All MPS permanently increased by 25%.',
            flavorText: 'The Mana flows through you even between lifetimes now.',
            cost: 1,
            isPurchased: false,
            effect: { type: 'mpsMultiplier', value: 1.25 }
        },
        {
            id: 'immortal-hands',
            name: 'Immortal Hands',
            description: 'Start every prestige run with 10 Wizard\'s Hands.',
            flavorText: 'Your spectral servants remember you across ascensions.',
            cost: 2,
            isPurchased: false,
            effect: { type: 'startingBuilding', buildingId: 'wizards-hand', count: 10 }
        },
        {
            id: 'essence-of-clicking',
            name: 'Essence of Clicking',
            description: 'Mana per click permanently doubled.',
            flavorText: 'Each tap resonates with the memory of a trillion clicks.',
            cost: 2,
            isPurchased: false,
            effect: { type: 'mpcMultiplier', value: 2 }
        },
        {
            id: 'crystal-memory',
            name: 'Crystal Memory',
            description: 'Start every prestige with 50,000 Mana.',
            flavorText: 'The crystals remember abundance.',
            cost: 3,
            isPurchased: false,
            effect: { type: 'startingMana', value: 50000 }
        },
        {
            id: 'timeless-knowledge',
            name: 'Timeless Knowledge',
            description: 'Prestige crystals earned increased by 50%.',
            flavorText: 'You have transcended time. Each ascension yields more than the last.',
            cost: 4,
            isPurchased: false,
            effect: { type: 'crystalBonus', value: 1.5 }
        },
        {
            id: 'weavers-touch',
            name: 'Weaver\'s Touch',
            description: 'All building costs permanently reduced by 10%.',
            flavorText: 'The Weave bends to your will. Commerce is merely suggestion.',
            cost: 3,
            isPurchased: false,
            effect: { type: 'buildingCostReduction', value: 0.90 }
        },
        {
            id: 'arcane-omniscience',
            name: 'Arcane Omniscience',
            description: 'All MPS permanently increased by 50%.',
            flavorText: 'You see every thread of the Weave simultaneously. Knowledge is power.',
            cost: 5,
            isPurchased: false,
            requiresUpgrade: 'eternal-flow',
            effect: { type: 'mpsMultiplier', value: 1.5 }
        },
        {
            id: 'beyond-mortality',
            name: 'Beyond Mortality',
            description: 'Offline Mana earning rate increased to 75%.',
            flavorText: 'Your power grows even in the spaces between existence.',
            cost: 4,
            isPurchased: false,
            effect: { type: 'offlineBonus', value: 0.75 }
        },
        {
            id: 'infinite-recursion',
            name: 'Infinite Recursion',
            description: 'Prestige bonus multiplied by 2.',
            flavorText: 'Each life feeds into the next in an infinite spiral of power.',
            cost: 6,
            isPurchased: false,
            requiresUpgrade: 'timeless-knowledge',
            effect: { type: 'prestigeMultiplier', value: 2 }
        },
        {
            id: 'the-source',
            name: 'The Source',
            description: 'All MPS permanently increased by 100%. You have touched the source of all magic.',
            flavorText: 'There is nothing beyond this. You are the beginning and the end.',
            cost: 10,
            isPurchased: false,
            requiresUpgrade: 'arcane-omniscience',
            effect: { type: 'mpsMultiplier', value: 2.0 }
        }
    ];

    function calculateArcaneEssence(totalCrystals) {
        if (totalCrystals < TRANSCENDENCE_THRESHOLD) return 0;
        return Math.floor(Math.sqrt(totalCrystals / TRANSCENDENCE_THRESHOLD));
    }

    function canTranscend() {
        if (typeof PrestigeModule === 'undefined') return false;
        const data = PrestigeModule.getPrestigeData();
        const totalCrystals = data.totalManaCrystalsEarned || 0;
        return totalCrystals >= TRANSCENDENCE_THRESHOLD;
    }

    function getPendingEssence() {
        if (typeof PrestigeModule === 'undefined') return 0;
        const data = PrestigeModule.getPrestigeData();
        const totalCrystals = data.totalManaCrystalsEarned || 0;
        return Math.max(0, calculateArcaneEssence(totalCrystals) - totalArcaneEssenceEarned);
    }

    // --- Permanent bonus getters ---
    function getMPSMultiplier() {
        let mult = 1;
        transcendenceUpgrades.forEach(u => {
            if (u.isPurchased && u.effect.type === 'mpsMultiplier') mult *= u.effect.value;
        });
        return mult;
    }

    function getMPCMultiplier() {
        let mult = 1;
        transcendenceUpgrades.forEach(u => {
            if (u.isPurchased && u.effect.type === 'mpcMultiplier') mult *= u.effect.value;
        });
        return mult;
    }

    function getBuildingCostMultiplier() {
        let mult = 1;
        transcendenceUpgrades.forEach(u => {
            if (u.isPurchased && u.effect.type === 'buildingCostReduction') mult *= u.effect.value;
        });
        return mult;
    }

    function getStartingMana() {
        let total = 0;
        transcendenceUpgrades.forEach(u => {
            if (u.isPurchased && u.effect.type === 'startingMana') total += u.effect.value;
        });
        return total;
    }

    function getStartingBuildings() {
        const result = {};
        transcendenceUpgrades.forEach(u => {
            if (u.isPurchased && u.effect.type === 'startingBuilding') {
                result[u.effect.buildingId] = (result[u.effect.buildingId] || 0) + u.effect.count;
            }
        });
        return result;
    }

    function getCrystalBonusMultiplier() {
        let mult = 1;
        transcendenceUpgrades.forEach(u => {
            if (u.isPurchased && u.effect.type === 'crystalBonus') mult *= u.effect.value;
        });
        return mult;
    }

    function getOfflineRate() {
        const upgrade = transcendenceUpgrades.find(u => u.id === 'beyond-mortality');
        return (upgrade && upgrade.isPurchased) ? upgrade.effect.value : null;
    }

    function getPrestigeMultiplier() {
        let mult = 1;
        transcendenceUpgrades.forEach(u => {
            if (u.isPurchased && u.effect.type === 'prestigeMultiplier') mult *= u.effect.value;
        });
        return mult;
    }

    // --- UI ---
    function getHTML() {
        return `
        <section id="transcendence-panel" class="game-panel" hidden>
            <h2 id="transcendence-heading" tabindex="-1">Transcendence</h2>
            <div id="transcendence-container" aria-labelledby="transcendence-heading">
                <p class="transcendence-description">Beyond prestige lies Transcendence. Sacrifice your prestige-earned Mana Crystals (the currency, not the building) and prestige upgrades to earn Arcane Essence \u2014 a currency of pure, distilled power that persists forever.</p>
                <div class="transcendence-status">
                    <p>Arcane Essence: <span id="transcendence-essence">${arcaneEssence}</span></p>
                    <p>Times Transcended: <span id="transcendence-count">${timesTranscended}</span></p>
                    <p>Pending Essence: <span id="transcendence-pending">0</span></p>
                </div>
                <button id="transcend-button" class="transcend-button" disabled>Transcend</button>
                <div id="transcendence-upgrades-container"></div>
            </div>
        </section>`;
    }

    function init() {
        const transcendBtn = document.getElementById('transcend-button');
        if (transcendBtn) {
            transcendBtn.addEventListener('click', performTranscendence);
        }
        renderUpgrades();
        updateDisplay();
    }

    function renderUpgrades() {
        const container = document.getElementById('transcendence-upgrades-container');
        if (!container) return;
        container.innerHTML = '';

        const visible = transcendenceUpgrades.filter(u => {
            if (u.requiresUpgrade) {
                const req = transcendenceUpgrades.find(r => r.id === u.requiresUpgrade);
                if (!req || !req.isPurchased) return false;
            }
            return true;
        });

        if (visible.length === 0) {
            container.innerHTML = '<p>Transcend to unlock upgrades.</p>';
            return;
        }

        visible.forEach(upgrade => {
            const div = document.createElement('div');
            div.className = 'transcendence-upgrade-item' + (upgrade.isPurchased ? ' purchased' : '');

            if (upgrade.isPurchased) {
                div.innerHTML = `
                    <p class="transcendence-upgrade-name">${upgrade.name} (Owned)</p>
                    <p class="transcendence-upgrade-desc">${upgrade.description}</p>
                    <p class="transcendence-upgrade-flavor">${upgrade.flavorText}</p>
                `;
            } else {
                const canAfford = arcaneEssence >= upgrade.cost;
                div.innerHTML = `
                    <p class="transcendence-upgrade-name">${upgrade.name}</p>
                    <p class="transcendence-upgrade-desc">${upgrade.description}</p>
                    <p class="transcendence-upgrade-flavor">${upgrade.flavorText}</p>
                    <p class="transcendence-upgrade-cost">Cost: ${upgrade.cost} Arcane Essence</p>
                    <button class="transcendence-buy-btn ${canAfford ? 'can-afford' : 'cannot-afford'}"
                            data-upgrade-id="${upgrade.id}" ${canAfford ? '' : 'disabled'}
                            aria-label="Purchase ${upgrade.name} for ${upgrade.cost} Arcane Essence. ${upgrade.description}">
                        ${canAfford ? 'Purchase' : 'Not Enough Essence'}
                    </button>
                `;

                const btn = div.querySelector('.transcendence-buy-btn');
                if (btn && canAfford) {
                    btn.addEventListener('click', () => purchaseUpgrade(upgrade.id));
                }
            }

            container.appendChild(div);
        });
    }

    function purchaseUpgrade(upgradeId) {
        const upgrade = transcendenceUpgrades.find(u => u.id === upgradeId);
        if (!upgrade || upgrade.isPurchased || arcaneEssence < upgrade.cost) return;

        arcaneEssence -= upgrade.cost;
        upgrade.isPurchased = true;

        if (typeof SoundModule !== 'undefined') SoundModule.play('prestigeUpgrade');

        renderUpgrades();
        updateDisplay();

        if (typeof SaveManager !== 'undefined') SaveManager.save();
    }

    function performTranscendence() {
        const pending = getPendingEssence();
        if (pending <= 0) return;

        arcaneEssence += pending;
        totalArcaneEssenceEarned += pending;
        timesTranscended++;

        // Reset prestige state (crystals, prestige upgrades)
        if (typeof PrestigeModule !== 'undefined') {
            PrestigeModule.reset();
        }

        // Reset the full game via prestige reset
        if (typeof resetForPrestige === 'function') {
            resetForPrestige();
        }

        if (typeof SoundModule !== 'undefined') SoundModule.play('enterPrestige');
        if (typeof showGameNotification === 'function') {
            showGameNotification(`Transcendence complete! Gained ${pending} Arcane Essence.`, 'success');
        }

        renderUpgrades();
        updateDisplay();

        if (typeof SaveManager !== 'undefined') SaveManager.save();
    }

    function updateDisplay() {
        const essenceEl = document.getElementById('transcendence-essence');
        const countEl = document.getElementById('transcendence-count');
        const pendingEl = document.getElementById('transcendence-pending');
        const transcendBtn = document.getElementById('transcend-button');

        if (essenceEl) essenceEl.textContent = arcaneEssence;
        if (countEl) countEl.textContent = timesTranscended;

        const pending = getPendingEssence();
        if (pendingEl) pendingEl.textContent = pending;

        if (transcendBtn) {
            if (pending > 0) {
                transcendBtn.disabled = false;
                transcendBtn.textContent = `Transcend (Gain ${pending} Arcane Essence)`;
            } else {
                transcendBtn.disabled = true;
                transcendBtn.textContent = canTranscend() ? 'Transcend (No new essence to gain)' : `Transcend (Requires ${TRANSCENDENCE_THRESHOLD} total crystals)`;
            }
        }
    }

    function shouldShow() {
        return timesTranscended > 0 || canTranscend();
    }

    // --- Save/Load ---
    function getSaveData() {
        return {
            arcaneEssence,
            totalArcaneEssenceEarned,
            timesTranscended,
            upgrades: transcendenceUpgrades.filter(u => u.isPurchased).map(u => u.id)
        };
    }

    function loadSaveData(data) {
        if (!data) return;
        arcaneEssence = data.arcaneEssence || 0;
        totalArcaneEssenceEarned = data.totalArcaneEssenceEarned || 0;
        timesTranscended = data.timesTranscended || 0;
        if (data.upgrades) {
            data.upgrades.forEach(id => {
                const u = transcendenceUpgrades.find(up => up.id === id);
                if (u) u.isPurchased = true;
            });
        }
        renderUpgrades();
        updateDisplay();
    }

    function reset() {
        arcaneEssence = 0;
        totalArcaneEssenceEarned = 0;
        timesTranscended = 0;
        transcendenceUpgrades.forEach(u => u.isPurchased = false);
    }

    return {
        getHTML,
        init,
        updateDisplay,
        renderUpgrades,
        shouldShow,
        canTranscend,
        getPendingEssence,
        getMPSMultiplier,
        getMPCMultiplier,
        getBuildingCostMultiplier,
        getStartingMana,
        getStartingBuildings,
        getCrystalBonusMultiplier,
        getOfflineRate,
        getPrestigeMultiplier,
        getSaveData,
        loadSaveData,
        reset
    };
})();
