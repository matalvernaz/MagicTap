// Ranking Upgrades Module - Familiars, Enchantments, Wizardries
const RankingUpgradesModule = (function() {
    // Achievement thresholds for category unlocks
    const RANK_THRESHOLDS = {
        WIZARDRIES: 3,     // Rank 2 (Initiate)
        FAMILIARS: 7,      // Rank 3 (Novice)
        ENCHANTMENTS: 18   // Rank 5 (Journeyman)
    };

    // Familiars - MPS boost, sorted by cost
    // Unlock: Previous familiar purchased + Rank 3 threshold for first
    // Some elementals have special requirements (requires field)
    const familiars = [
        { id: 'familiar-sprite', name: 'Sprite', cost: 4500, mpsBoost: 0.01 },
        { id: 'familiar-imp', name: 'Imp', cost: 4500, mpsBoost: 0.01 },
        { id: 'familiar-golem', name: 'Golem', cost: 5000, mpsBoost: 0.01 },
        { id: 'familiar-rabbit', name: 'Rabbit', cost: 9000, mpsBoost: 0.01 },
        { id: 'familiar-pixie', name: 'Pixie', cost: 45000, mpsBoost: 0.01 },
        { id: 'familiar-enchanted-sheep', name: 'Enchanted Sheep', cost: 50000, mpsBoost: 0.01 },
        { id: 'familiar-enchanted-vine', name: 'Enchanted Vine', cost: 50000, mpsBoost: 0.01 },
        { id: 'familiar-air-elemental', name: 'Air Elemental', cost: 55000, mpsBoost: 0.01 },
        { id: 'familiar-mouse', name: 'Mouse', cost: 90000, mpsBoost: 0.01 },
        { id: 'familiar-animated-broomstick', name: 'Animated Broomstick', cost: 100000, mpsBoost: 0.01 },
        { id: 'familiar-cat', name: 'Cat', cost: 150000, mpsBoost: 0.02 },
        { id: 'familiar-owl', name: 'Owl', cost: 250000, mpsBoost: 0.02 },
        { id: 'familiar-wolf', name: 'Wolf', cost: 400000, mpsBoost: 0.01 },
        { id: 'familiar-wisp', name: 'Wisp', cost: 450000, mpsBoost: 0.02 },
        { id: 'familiar-animated-hat', name: 'Animated Hat', cost: 750000, mpsBoost: 0.01 },
        { id: 'familiar-rat', name: 'Rat', cost: 900000, mpsBoost: 0.01 },
        { id: 'familiar-animated-kettle', name: 'Animated Kettle', cost: 900000, mpsBoost: 0.01 },
        { id: 'familiar-raven', name: 'Raven', cost: 1000000, mpsBoost: 0.01 },
        { id: 'familiar-toad', name: 'Toad', cost: 2500000, mpsBoost: 0.02 },
        { id: 'familiar-falcon', name: 'Falcon', cost: 3000000, mpsBoost: 0.01 },
        { id: 'familiar-sphinx', name: 'Sphinx', cost: 3000000, mpsBoost: 0.01 },
        { id: 'familiar-water-elemental', name: 'Water Elemental', cost: 7500000, mpsBoost: 0.01 },
        { id: 'familiar-serpent', name: 'Serpent', cost: 9000000, mpsBoost: 0.02 },
        { id: 'familiar-animated-desk', name: 'Animated Desk', cost: 9000000, mpsBoost: 0.01 },
        { id: 'familiar-animated-book', name: 'Animated Book', cost: 55000000, mpsBoost: 0.01 },
        { id: 'familiar-abyssal', name: 'Abyssal', cost: 90000000, mpsBoost: 0.03 },
        { id: 'familiar-celestial', name: 'Celestial', cost: 90000000, mpsBoost: 0.03 },
        { id: 'familiar-hydra', name: 'Hydra', cost: 90000000, mpsBoost: 0.02 },
        { id: 'familiar-drake', name: 'Drake', cost: 450000000, mpsBoost: 0.02 },
        { id: 'familiar-animated-bookcase', name: 'Animated Bookcase', cost: 555555555, mpsBoost: 0.05 },
        { id: 'familiar-griffin', name: 'Griffin', cost: 900000000, mpsBoost: 0.01 },
        { id: 'familiar-ice-elemental', name: 'Ice Elemental', cost: 1000000000, mpsBoost: 0.02, requires: ['familiar-air-elemental', 'familiar-water-elemental'] },
        { id: 'familiar-pegasus', name: 'Pegasus', cost: 4500000000, mpsBoost: 0.01 },
        { id: 'familiar-earth-elemental', name: 'Earth Elemental', cost: 9000000000, mpsBoost: 0.01 },
        { id: 'familiar-hellhound', name: 'Hellhound', cost: 9000000000, mpsBoost: 0.03 },
        { id: 'familiar-stone-elemental', name: 'Stone Elemental', cost: 10000000000, mpsBoost: 0.01, requires: ['familiar-earth-elemental'] },
        { id: 'familiar-unicorn', name: 'Unicorn', cost: 45000000000, mpsBoost: 0.02 },
        { id: 'familiar-nature-elemental', name: 'Nature Elemental', cost: 50000000000, mpsBoost: 0.02 },
        { id: 'familiar-cerberus', name: 'Cerberus', cost: 90000000000, mpsBoost: 0.05 },
        { id: 'familiar-metal-elemental', name: 'Metal Elemental', cost: 100000000000, mpsBoost: 0.02 },
        { id: 'familiar-lava-elemental', name: 'Lava Elemental', cost: 100000000000, mpsBoost: 0.04, requires: ['familiar-earth-elemental', 'familiar-fire-elemental'] },
        { id: 'familiar-manticore', name: 'Manticore', cost: 450000000000, mpsBoost: 0.03 },
        { id: 'familiar-lightning-elemental', name: 'Lightning Elemental', cost: 500000000000, mpsBoost: 0.02 },
        { id: 'familiar-animated-armor', name: 'Animated Armor', cost: 999999999999, mpsBoost: 0.03 },
        { id: 'familiar-chimera', name: 'Chimera', cost: 9000000000000, mpsBoost: 0.02 },
        { id: 'familiar-fire-elemental', name: 'Fire Elemental', cost: 45000000000, mpsBoost: 0.01 },
        { id: 'familiar-light-elemental', name: 'Light Elemental', cost: 90000000000000, mpsBoost: 0.02 },
        { id: 'familiar-dark-elemental', name: 'Dark Elemental', cost: 90000000000000, mpsBoost: 0.02 },
        { id: 'familiar-lunar-elemental', name: 'Lunar Elemental', cost: 900000000000000, mpsBoost: 0.03 },
        { id: 'familiar-solar-elemental', name: 'Solar Elemental', cost: 900000000000000, mpsBoost: 0.03 },
        { id: 'familiar-astral-elemental', name: 'Astral Elemental', cost: 900000000000000, mpsBoost: 0.03 },
        { id: 'familiar-phoenix', name: 'Phoenix', cost: 9000000000000000, mpsBoost: 0.05 },
        { id: 'familiar-dragon', name: 'Dragon', cost: 90000000000000000, mpsBoost: 0.05 }
    ];

    // Enchantments - MPS boost (all 1%), sorted by cost
    // Unlock: Previous enchantment purchased + Rank 5 threshold for first
    const enchantments = [
        { id: 'enchant-infuse-magic', name: 'Infuse Magic', cost: 15000, mpsBoost: 0.01 },
        { id: 'enchant-basic', name: 'Basic Enchantment', cost: 55000, mpsBoost: 0.01 },
        { id: 'enchant-lesser', name: 'Lesser Enchantment', cost: 150000, mpsBoost: 0.01 },
        { id: 'enchant-novice', name: 'Novice Enchantment', cost: 500000, mpsBoost: 0.01 },
        { id: 'enchant-minor', name: 'Minor Enchantment', cost: 1000000, mpsBoost: 0.01 },
        { id: 'enchant-bless', name: 'Bless', cost: 5000000, mpsBoost: 0.01 },
        { id: 'enchant-middling', name: 'Middling Enchantment', cost: 15000000, mpsBoost: 0.01 },
        { id: 'enchant-greater', name: 'Greater Enchantment', cost: 999000000, mpsBoost: 0.01 },
        { id: 'enchant-dark-blessing', name: 'Dark Blessing', cost: 55000000000, mpsBoost: 0.01 },
        { id: 'enchant-major', name: 'Major Enchantment', cost: 99000000000, mpsBoost: 0.01 },
        { id: 'enchant-power-word', name: 'Power Word: Arcana', cost: 750000000000, mpsBoost: 0.01 },
        { id: 'enchant-superior', name: 'Superior Enchantment', cost: 9000000000000, mpsBoost: 0.01 },
        { id: 'enchant-supreme', name: 'Supreme Enchantment', cost: 99000000000000, mpsBoost: 0.01 },
        { id: 'enchant-grand', name: 'Grand Enchantment', cost: 9000000000000000, mpsBoost: 0.01 },
        { id: 'enchant-godly', name: 'Godly Enchantment', cost: 999000000000000000, mpsBoost: 0.01, requiresDeity: true }
    ];

    // Wizardries - MPS boost (all 2%), sorted by cost
    // Unlock: Achievement thresholds + Rank 2 for first
    const wizardries = [
        { id: 'wizardry-warlock', name: 'Warlock', cost: 95000, mpsBoost: 0.02 },
        { id: 'wizardry-witch', name: 'Witch', cost: 950000, mpsBoost: 0.02 },
        { id: 'wizardry-enchanter', name: 'Enchanter', cost: 9500000, mpsBoost: 0.02 },
        { id: 'wizardry-enchantress', name: 'Enchantress', cost: 9500000, mpsBoost: 0.02 },
        { id: 'wizardry-wizard', name: 'Wizard', cost: 95000000, mpsBoost: 0.02 },
        { id: 'wizardry-sorcerer', name: 'Sorcerer', cost: 95000000, mpsBoost: 0.02 },
        { id: 'wizardry-magician', name: 'Magician', cost: 9500000000, mpsBoost: 0.02 },
        { id: 'wizardry-deity', name: 'Deity', cost: 9500000000000, mpsBoost: 0.02 }
    ];

    // Track purchased states
    let purchasedFamiliars = {};
    let purchasedEnchantments = {};
    let purchasedWizardries = {};

    function getAchievementCount() {
        if (typeof AchievementsModule !== 'undefined') {
            return AchievementsModule.getEarnedCount();
        }
        return 0;
    }

    function isCategoryUnlocked(category) {
        const count = getAchievementCount();
        switch(category) {
            case 'familiars': return count >= RANK_THRESHOLDS.FAMILIARS;
            case 'enchantments': return count >= RANK_THRESHOLDS.ENCHANTMENTS;
            case 'wizardries': return count >= RANK_THRESHOLDS.WIZARDRIES;
            default: return false;
        }
    }

    function isUpgradeUnlocked(category, index) {
        if (!isCategoryUnlocked(category)) return false;
        if (index === 0) return true;

        // Check if previous upgrade in the category is purchased
        let purchased;
        switch(category) {
            case 'familiars':
                purchased = purchasedFamiliars;
                const familiar = familiars[index];
                // Check special requirements first (e.g., Ice Elemental requires Air + Water)
                if (familiar.requires) {
                    const allRequirementsMet = familiar.requires.every(reqId => purchased[reqId] === true);
                    if (!allRequirementsMet) return false;
                    return true; // Requirements met, unlock available
                }
                // Standard sequential unlock
                return purchased[familiars[index - 1].id] === true;
            case 'enchantments':
                purchased = purchasedEnchantments;
                // Godly Enchantment requires Deity wizardry
                if (enchantments[index].requiresDeity && !purchasedWizardries['wizardry-deity']) {
                    return false;
                }
                return purchased[enchantments[index - 1].id] === true;
            case 'wizardries':
                purchased = purchasedWizardries;
                return purchased[wizardries[index - 1].id] === true;
            default:
                return false;
        }
    }

    function isPurchased(category, id) {
        switch(category) {
            case 'familiars': return purchasedFamiliars[id] === true;
            case 'enchantments': return purchasedEnchantments[id] === true;
            case 'wizardries': return purchasedWizardries[id] === true;
            default: return false;
        }
    }

    function purchase(category, id) {
        let upgrade, purchased;
        switch(category) {
            case 'familiars':
                upgrade = familiars.find(f => f.id === id);
                purchased = purchasedFamiliars;
                break;
            case 'enchantments':
                upgrade = enchantments.find(e => e.id === id);
                purchased = purchasedEnchantments;
                break;
            case 'wizardries':
                upgrade = wizardries.find(w => w.id === id);
                purchased = purchasedWizardries;
                break;
            default:
                return false;
        }

        if (!upgrade || purchased[id]) return false;
        if (mana < upgrade.cost) return false;

        mana -= upgrade.cost;
        purchased[id] = true;

        // Apply MPS boost
        mpsUpgradeMultiplier *= (1 + upgrade.mpsBoost);
        recalculateMPS();

        // Update statistics
        if (typeof StatisticsModule !== 'undefined') {
            StatisticsModule.addUpgradePurchased();
        }

        return true;
    }

    function getHTML() {
        return `
        <section id="ranking-upgrades-panel" class="game-panel" hidden>
            <h2 id="ranking-upgrades-heading" tabindex="-1">Ranking Upgrades</h2>
            <div id="ranking-upgrades-container" aria-labelledby="ranking-upgrades-heading">
                <p class="ranking-info">Unlock new upgrade categories by earning achievements!</p>

                <div class="ranking-category" id="wizardries-section">
                    <h3>Wizardries <span class="unlock-info">(Unlocks at Rank 2 - Initiate)</span></h3>
                    <div id="wizardries-list" class="ranking-upgrades-list"></div>
                </div>

                <div class="ranking-category" id="familiars-section">
                    <h3>Familiars <span class="unlock-info">(Unlocks at Rank 3 - Novice)</span></h3>
                    <div id="familiars-list" class="ranking-upgrades-list"></div>
                </div>

                <div class="ranking-category" id="enchantments-section">
                    <h3>Enchantments <span class="unlock-info">(Unlocks at Rank 5 - Journeyman)</span></h3>
                    <div id="enchantments-list" class="ranking-upgrades-list"></div>
                </div>
            </div>
        </section>`;
    }

    function renderUpgrades() {
        renderCategory('familiars', familiars, purchasedFamiliars, 'familiars-list');
        renderCategory('enchantments', enchantments, purchasedEnchantments, 'enchantments-list');
        renderCategory('wizardries', wizardries, purchasedWizardries, 'wizardries-list');
    }

    function renderCategory(category, items, purchased, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const categoryUnlocked = isCategoryUnlocked(category);

        if (!categoryUnlocked) {
            const threshold = RANK_THRESHOLDS[category.toUpperCase()];
            const current = getAchievementCount();
            container.innerHTML = `<p class="locked-message">Locked. Earn ${threshold - current} more achievements to unlock.</p>`;
            return;
        }

        container.innerHTML = '';

        items.forEach((item, index) => {
            const isUnlocked = isUpgradeUnlocked(category, index);
            const isPurch = purchased[item.id] === true;

            if (!isUnlocked && !isPurch) return; // Don't show locked upgrades

            const div = document.createElement('div');
            div.className = 'ranking-upgrade-item' + (isPurch ? ' purchased' : '');
            div.id = `ranking-${item.id}`;

            const boostPercent = (item.mpsBoost * 100).toFixed(0);
            const canAfford = mana >= item.cost;

            if (isPurch) {
                div.innerHTML = `
                    <span class="upgrade-name">${item.name}</span>
                    <span class="upgrade-effect">+${boostPercent}% MPS</span>
                    <span class="purchased-label">Purchased</span>
                `;
            } else {
                div.innerHTML = `
                    <span class="upgrade-name">${item.name}</span>
                    <span class="upgrade-effect">+${boostPercent}% MPS</span>
                    <span class="upgrade-cost">${OptionsModule.formatNumber(item.cost)} Mana</span>
                    <button class="buy-ranking-upgrade-btn" ${!canAfford ? 'disabled' : ''}
                        data-category="${category}" data-id="${item.id}"
                        aria-label="Buy ${item.name} for ${OptionsModule.formatNumber(item.cost)} Mana">
                        Buy
                    </button>
                `;
            }

            container.appendChild(div);
        });

        // Check if all are purchased
        const allPurchased = items.every(item => purchased[item.id] === true);
        if (allPurchased) {
            const completeMsg = document.createElement('p');
            completeMsg.className = 'category-complete';
            completeMsg.textContent = 'All ' + category + ' purchased!';
            container.appendChild(completeMsg);
        }
    }

    function init() {
        // Add click handlers for buy buttons
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('buy-ranking-upgrade-btn')) {
                const category = e.target.dataset.category;
                const id = e.target.dataset.id;
                if (purchase(category, id)) {
                    renderUpgrades();
                    if (typeof updateDisplay === 'function') {
                        updateDisplay();
                    }

                    // Play upgrade purchase sound
                    if (typeof SoundModule !== 'undefined') {
                        SoundModule.play('upgradePurchase');
                    }

                    // Announce purchase for screen readers
                    if (typeof announceToScreenReader === 'function') {
                        announceToScreenReader('Purchased');
                    }
                }
            }
        });
    }

    function getSaveData() {
        return {
            familiars: purchasedFamiliars,
            enchantments: purchasedEnchantments,
            wizardries: purchasedWizardries
        };
    }

    function loadSaveData(data) {
        if (!data) return;

        // Only restore purchased states - do NOT reapply boosts
        // The boosts are already saved in mpsUpgradeMultiplier
        purchasedFamiliars = data.familiars || {};
        purchasedEnchantments = data.enchantments || {};
        purchasedWizardries = data.wizardries || {};
    }

    function resetForPrestige() {
        purchasedFamiliars = {};
        purchasedEnchantments = {};
        purchasedWizardries = {};
    }

    function getPurchasedCount(category) {
        let purchased;
        switch(category) {
            case 'familiars': purchased = purchasedFamiliars; break;
            case 'enchantments': purchased = purchasedEnchantments; break;
            case 'wizardries': purchased = purchasedWizardries; break;
            default: return 0;
        }
        return Object.values(purchased).filter(v => v === true).length;
    }

    function getTotalPurchasedCount() {
        return getPurchasedCount('familiars') +
               getPurchasedCount('enchantments') +
               getPurchasedCount('wizardries');
    }

    function isDeityPurchased() {
        return purchasedWizardries['wizardry-deity'] === true;
    }

    return {
        getHTML,
        init,
        renderUpgrades,
        getSaveData,
        loadSaveData,
        resetForPrestige,
        isCategoryUnlocked,
        getPurchasedCount,
        getTotalPurchasedCount,
        isDeityPurchased,
        RANK_THRESHOLDS
    };
})();
