// Prestige Module
const PrestigeModule = (function() {
    // Prestige state
    let manaCrystals = 0;  // Current spendable Mana Crystals
    let totalManaCrystalsEarned = 0;  // Total ever earned (for prestige level)
    let bonusPrestigeLevels = 0;  // Bonus levels from upgrades (shown as pending)
    let timesPrestiged = 0;
    let isInPrestigeStore = false;
    let crystalsSpentThisSession = 0; // Track crystals spent for refund
    let prestigePotentialUnlocked = 0; // Percentage of prestige power unlocked THIS RUN (0-100)
    let highestPotentialTierPurchased = 0; // Highest tier ever purchased (1-10), persists across runs

    // Constants (Cookie Clicker formula)
    const PRESTIGE_BASE = 1e12;  // 1 trillion mana for first Mana Crystal
    const PRESTIGE_UNLOCK_THRESHOLD = 1e9;  // 1 billion mana to see prestige button (first run)

    // Prestige Upgrades (permanent upgrades bought with Mana Crystals)
    // Ordered by cost for progressive unlocking
    const prestigeUpgrades = [
        // 1-cost upgrades (visible from start)
        {
            id: 'mana-crystal-upgrade',
            name: 'Mana Crystal',
            description: 'Unlocks the Ancient Spell Staff and Spell Core upgrades.',
            flavorText: 'A crystallized fragment of pure mana, pulsing with arcane potential.',
            cost: 1,
            isPurchased: false,
            unlockCost: 0
        },
        // 3-cost upgrades (requires Mana Crystal)
        {
            id: 'ancient-spell-staff-unlock',
            name: 'Ancient Spell Staff Unlock',
            description: 'Unlocks the Ancient Spell Staff upgrade.',
            flavorText: 'A relic from ages past, imbued with the power of countless forgotten spells.',
            cost: 3,
            isPurchased: false,
            unlockCost: 0,
            requiresUpgrade: 'mana-crystal-upgrade'
        },
        // 5-cost upgrades
        {
            id: '20-20-vision',
            name: '20/20 Vision',
            description: 'Wizard\'s Eyes are twice as effective.',
            flavorText: 'Perfect magical sight grants perfect magical insight.',
            cost: 5,
            buildingBoost: { buildingId: 'wizards-eye', multiplier: 2 },
            isPurchased: false,
            unlockCost: 0
        },
        // 10-cost upgrades (requires Mana Crystal)
        {
            id: 'spell-core',
            name: 'Spell Core',
            description: 'Boosts MPS by 5%.',
            flavorText: 'A wizard must always be aware of their inner self, and their connection to the arcane and metaphysical.',
            cost: 10,
            mpsBonus: 0.05,
            isPurchased: false,
            unlockCost: 0,
            requiresUpgrade: 'mana-crystal-upgrade'
        },
        {
            id: 'arcane-auto-gather',
            name: 'Arcane Auto-Gather',
            description: 'Automatically gathers Mana once per second (as if clicking).',
            flavorText: 'Why click when magic can do it for you?',
            cost: 15,
            isAutoClicker: true,
            isPurchased: false,
            unlockCost: 0,
            requiresUpgrade: 'spell-core'
        },
        {
            id: 'head-start',
            name: 'Head Start',
            description: 'Start each run with 1,000 Mana.',
            flavorText: 'A small gift from your past self.',
            cost: 5,
            startingMana: 1000,
            isPurchased: false,
            unlockCost: 0
        },
        {
            id: 'greater-head-start',
            name: 'Greater Head Start',
            description: 'Start each run with 100,000 Mana.',
            flavorText: 'A generous gift from your much wiser past self.',
            cost: 20,
            startingMana: 100000,
            isPurchased: false,
            unlockCost: 0,
            requiresUpgrade: 'head-start'
        },
        {
            id: 'runestone-affinity',
            name: 'Runestone Affinity',
            description: 'Runestones appear 30% more frequently.',
            flavorText: 'The stones sense your presence and are drawn to you.',
            cost: 8,
            isRunestoneBoost: true,
            isPurchased: false,
            unlockCost: 0
        },
        {
            id: 'spell-power-reservoir',
            name: 'Spell Power Reservoir',
            description: 'Spell Power regenerates 50% faster.',
            flavorText: 'A deeper well of arcane energy to draw from.',
            cost: 12,
            isSpellRegenBoost: true,
            isPurchased: false,
            unlockCost: 0,
            requiresUpgrade: 'mana-crystal-upgrade'
        },
        {
            id: 'crystal-multiplication',
            name: 'Crystal Multiplication',
            description: 'Boosts MPS by 10%.',
            flavorText: 'Your crystals resonate with accumulated power.',
            cost: 25,
            mpsBonus: 0.10,
            isPurchased: false,
            unlockCost: 0,
            requiresUpgrade: 'spell-core'
        },
        {
            id: 'hand-of-the-ancients',
            name: 'Hand of the Ancients',
            description: 'Start each run with 5 Wizard\'s Hands.',
            flavorText: 'Spectral hands from past lives join your cause.',
            cost: 10,
            startingBuilding: { id: 'wizards-hand', count: 5 },
            isPurchased: false,
            unlockCost: 0
        },
        {
            id: 'well-keeper',
            name: 'Well Keeper',
            description: 'Wishing Well coin generation doubled.',
            flavorText: 'The well remembers your generosity.',
            cost: 15,
            isWellBoost: true,
            isPurchased: false,
            unlockCost: 0
        }
    ];

    // Calculate Mana Crystals from total mana using Cookie Clicker formula
    function calculateManaCrystals(totalMana) {
        if (totalMana < PRESTIGE_BASE) return 0;
        return Math.floor(Math.pow(totalMana / PRESTIGE_BASE, 1/3));
    }

    // Calculate mana needed to reach a specific Mana Crystal count
    function manaForCrystals(crystals) {
        return Math.pow(crystals, 3) * PRESTIGE_BASE;
    }

    // Get the prestige multiplier
    // Only applies the unlocked percentage of prestige power
    function getPrestigeMultiplier() {
        // Calculate raw prestige bonus from crystals
        const rawPrestigeBonus = totalManaCrystalsEarned / 100;
        // Apply only the unlocked percentage of this bonus
        const unlockedBonus = rawPrestigeBonus * (prestigePotentialUnlocked / 100);

        let multiplier = 1 + unlockedBonus;
        prestigeUpgrades.forEach(upgrade => {
            if (upgrade.isPurchased && upgrade.mpsBonus) {
                multiplier += upgrade.mpsBonus;
            }
        });
        return multiplier;
    }

    // Add to prestige potential (called by potential-unlocking upgrades)
    // Also updates highest tier if this is a new record
    function addPrestigePotential(amount, tier) {
        prestigePotentialUnlocked = Math.min(100, prestigePotentialUnlocked + amount);
        if (tier && tier > highestPotentialTierPurchased) {
            highestPotentialTierPurchased = tier;
        }
    }

    // Get current prestige potential percentage (for this run)
    function getPrestigePotential() {
        return prestigePotentialUnlocked;
    }

    // Get highest tier ever purchased (for unlock visibility)
    function getHighestPotentialTier() {
        return highestPotentialTierPurchased;
    }

    // Get total bonus percentage for display (shows unlocked amount)
    function getTotalBonusPercent() {
        // Only show the unlocked portion of prestige bonus
        let bonus = totalManaCrystalsEarned * (prestigePotentialUnlocked / 100);
        prestigeUpgrades.forEach(upgrade => {
            if (upgrade.isPurchased && upgrade.mpsBonus) {
                bonus += upgrade.mpsBonus * 100;
            }
        });
        return bonus;
    }

    // Get raw prestige bonus (before potential unlock, for display purposes)
    function getRawPrestigeBonus() {
        return totalManaCrystalsEarned;
    }

    // Format large numbers for display
    function formatNumber(num) {
        if (typeof OptionsModule !== 'undefined' && OptionsModule.formatNumber) {
            return OptionsModule.formatNumber(num);
        }
        if (num >= 1e15) return (num / 1e15).toFixed(2) + ' quadrillion';
        if (num >= 1e12) return (num / 1e12).toFixed(2) + ' trillion';
        if (num >= 1e9) return (num / 1e9).toFixed(2) + ' billion';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + ' million';
        if (num >= 1e3) return (num / 1e3).toFixed(2) + ' thousand';
        return num.toFixed(0);
    }

    // Format time for countdown
    function formatTime(seconds) {
        if (!isFinite(seconds) || seconds <= 0) return 'never (no production)';
        if (seconds > 365 * 24 * 3600) return 'a very long time';

        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }

    function getHTML() {
        return `
        <section id="prestige-panel" class="game-panel" hidden>
            <h2 id="prestige-heading" tabindex="-1">Prestige</h2>
            <div id="prestige-container" aria-labelledby="prestige-heading">
                <div id="prestige-confirmation">
                    <p id="prestige-warning">Are you sure you would like to Prestige? This will reset your current Mana, upgrades, and buildings. You will gain Mana Crystals, which are used to purchase powerful upgrades to take into your next run.</p>
                    <p id="prestige-gain-info">You will gain: <strong><span id="prestige-pending-crystals">0</span> Mana Crystal(s)</strong></p>
                    <p>Time until next Mana Crystal: <span id="prestige-next-countdown">calculating...</span></p>
                    <p>Current Mana Crystals: <span id="prestige-current-crystals">0</span></p>
                    <p>Production Bonus: <span id="prestige-bonus">+0%</span></p>
                    <p>Times Ascended: <span id="times-prestiged">0</span></p>
                    <button id="prestige-action-button" class="prestige-button">Prestige</button>
                </div>
            </div>
        </section>
        <section id="prestige-store-panel" class="game-panel" style="display: none;">
            <h2 id="prestige-store-heading" tabindex="-1">Prestige Store</h2>
            <div id="prestige-store-container">
                <p>Mana Crystals: <span id="prestige-store-crystals">0</span></p>
                <p>New Production Bonus: <span id="prestige-store-bonus">+0%</span></p>
                <div id="prestige-upgrades-container"></div>
                <div id="prestige-store-actions">
                    <button id="refund-crystals-button" class="prestige-button">Refund All Purchases</button>
                    <button id="reset-prestige-button" class="prestige-button">Reset (Start New Run)</button>
                </div>
            </div>
        </section>
        <div id="prestige-reset-confirm" class="modal" style="display: none;">
            <div class="modal-content">
                <h3>Ready to Restart?</h3>
                <p>Your Mana, buildings, and upgrades will be reset.</p>
                <p>Your Mana Crystals and prestige upgrades will be kept.</p>
                <div class="modal-buttons">
                    <button id="reset-confirm-yes" class="prestige-button">Yes</button>
                    <button id="reset-confirm-no" class="prestige-button">No</button>
                </div>
            </div>
        </div>`;
    }

    function init() {
        const prestigeButton = document.getElementById('prestige-action-button');
        if (prestigeButton) {
            prestigeButton.addEventListener('click', performPrestige);
        }

        const refundButton = document.getElementById('refund-crystals-button');
        if (refundButton) {
            refundButton.addEventListener('click', refundAllPurchases);
        }

        const resetButton = document.getElementById('reset-prestige-button');
        if (resetButton) {
            resetButton.addEventListener('click', showResetConfirmation);
        }

        const resetYes = document.getElementById('reset-confirm-yes');
        if (resetYes) {
            resetYes.addEventListener('click', finishPrestige);
        }

        const resetNo = document.getElementById('reset-confirm-no');
        if (resetNo) {
            resetNo.addEventListener('click', hideResetConfirmation);
        }
    }

    function getVisibleUpgrades() {
        // Show upgrades based on total crystals earned and required upgrades
        return prestigeUpgrades.filter(upgrade => {
            // Check crystal threshold
            if (totalManaCrystalsEarned < upgrade.unlockCost) return false;
            // Check if requires another upgrade to be purchased
            if (upgrade.requiresUpgrade) {
                const requiredUpgrade = prestigeUpgrades.find(u => u.id === upgrade.requiresUpgrade);
                if (!requiredUpgrade || !requiredUpgrade.isPurchased) return false;
            }
            return true;
        });
    }

    function renderPrestigeUpgrades() {
        const container = document.getElementById('prestige-upgrades-container');
        if (!container) return;

        container.innerHTML = '';

        const visibleUpgrades = getVisibleUpgrades();

        if (visibleUpgrades.length === 0) {
            container.innerHTML = '<p>Earn more Mana Crystals to unlock upgrades!</p>';
            return;
        }

        visibleUpgrades.forEach(upgrade => {
            const upgradeDiv = document.createElement('div');
            upgradeDiv.className = 'prestige-upgrade-item';
            upgradeDiv.id = `prestige-upgrade-${upgrade.id}`;

            if (upgrade.isPurchased) {
                upgradeDiv.classList.add('purchased');
                upgradeDiv.innerHTML = `
                    <p class="prestige-upgrade-name">${upgrade.name} (Owned)</p>
                    <p class="prestige-upgrade-description">${upgrade.description}</p>
                    <p class="prestige-upgrade-flavor">${upgrade.flavorText}</p>
                `;
            } else {
                const canAfford = manaCrystals >= upgrade.cost;
                upgradeDiv.innerHTML = `
                    <p class="prestige-upgrade-name">${upgrade.name}</p>
                    <p class="prestige-upgrade-description">${upgrade.description}</p>
                    <p class="prestige-upgrade-flavor">${upgrade.flavorText}</p>
                    <p class="prestige-upgrade-cost">Cost: <span>${upgrade.cost}</span> Mana Crystal(s)</p>
                    <button class="prestige-upgrade-button ${canAfford ? 'can-afford' : 'cannot-afford'}"
                            data-upgrade-id="${upgrade.id}"
                            ${canAfford ? '' : 'disabled'}>
                        ${canAfford ? 'Purchase' : 'Not Enough Crystals'}
                    </button>
                `;

                const buyButton = upgradeDiv.querySelector('.prestige-upgrade-button');
                if (buyButton && canAfford) {
                    buyButton.addEventListener('click', () => purchasePrestigeUpgrade(upgrade.id));
                }
            }

            container.appendChild(upgradeDiv);
        });

        updateRefundButtonState();
    }

    function updateRefundButtonState() {
        const refundButton = document.getElementById('refund-crystals-button');
        if (refundButton) {
            const hasPurchases = prestigeUpgrades.some(u => u.isPurchased);
            refundButton.disabled = !hasPurchases;
            refundButton.textContent = hasPurchases ? 'Refund All Purchases' : 'No Purchases to Refund';
        }
    }

    function purchasePrestigeUpgrade(upgradeId) {
        const upgrade = prestigeUpgrades.find(u => u.id === upgradeId);
        if (!upgrade || upgrade.isPurchased) return;

        if (manaCrystals >= upgrade.cost) {
            manaCrystals -= upgrade.cost;
            crystalsSpentThisSession += upgrade.cost;
            upgrade.isPurchased = true;

            // Re-render the store
            renderPrestigeUpgrades();
            updateStoreDisplay();

            // Play sound if available
            if (typeof SoundModule !== 'undefined') {
                SoundModule.play('prestigeUpgrade');
            }

            // Announce purchase for screen readers (clear previous to prevent spam)
            const notificationArea = document.getElementById('notification-area');
            if (notificationArea) {
                const existing = notificationArea.querySelectorAll('.sr-only-announcement');
                existing.forEach(el => el.remove());
                const announcement = document.createElement('span');
                announcement.className = 'sr-only sr-only-announcement';
                announcement.textContent = 'Purchased';
                notificationArea.appendChild(announcement);
                setTimeout(() => announcement.remove(), 1000);
            }
        }
    }

    function refundAllPurchases() {
        let totalRefund = 0;

        prestigeUpgrades.forEach(upgrade => {
            if (upgrade.isPurchased) {
                totalRefund += upgrade.cost;
                upgrade.isPurchased = false;
            }
        });

        if (totalRefund > 0) {
            manaCrystals += totalRefund;
            crystalsSpentThisSession = 0;

            renderPrestigeUpgrades();
            updateStoreDisplay();
        }
    }

    function applyBuildingBoost(boost) {
        if (typeof buildings !== 'undefined') {
            const building = buildings.find(b => b.id === boost.buildingId);
            if (building) {
                building.productionPerSecond *= boost.multiplier;
                if (typeof recalculateMPS === 'function') {
                    recalculateMPS();
                }
            }
        }
    }

    function applyAllPrestigeBuildingBoosts() {
        prestigeUpgrades.forEach(upgrade => {
            if (upgrade.isPurchased && upgrade.buildingBoost) {
                applyBuildingBoost(upgrade.buildingBoost);
            }
        });
    }

    function getStartingMana() {
        let startingMana = 0;
        prestigeUpgrades.forEach(upgrade => {
            if (upgrade.isPurchased && upgrade.startingMana) {
                startingMana += upgrade.startingMana;
            }
        });
        return startingMana;
    }

    function getStartingBuildings() {
        const startingBuildings = {};
        prestigeUpgrades.forEach(upgrade => {
            if (upgrade.isPurchased && upgrade.startingBuilding) {
                const id = upgrade.startingBuilding.id;
                const count = upgrade.startingBuilding.count;
                startingBuildings[id] = (startingBuildings[id] || 0) + count;
            }
        });
        return startingBuildings;
    }

    function shouldShowPrestige() {
        const stats = StatisticsModule.getStats();
        return timesPrestiged > 0 || stats.manaTotal >= PRESTIGE_UNLOCK_THRESHOLD;
    }

    function updateDisplay() {
        const stats = StatisticsModule.getStats();
        const totalMana = stats.manaTotal;
        const effectiveMPS = typeof getEffectiveMPS === 'function' ? getEffectiveMPS() : 0;

        // Calculate pending crystals
        const totalCrystalsFromMana = calculateManaCrystals(totalMana);
        const pendingCrystals = Math.max(0, totalCrystalsFromMana - totalManaCrystalsEarned);

        // Get elements
        const pendingEl = document.getElementById('prestige-pending-crystals');
        const nextCountdownEl = document.getElementById('prestige-next-countdown');
        const currentCrystalsEl = document.getElementById('prestige-current-crystals');
        const bonusEl = document.getElementById('prestige-bonus');
        const timesEl = document.getElementById('times-prestiged');
        const prestigeButton = document.getElementById('prestige-action-button');

        // Update pending crystals
        if (pendingEl) {
            pendingEl.textContent = pendingCrystals;
        }

        // Calculate time until next crystal
        const nextCrystalCount = totalCrystalsFromMana + 1;
        const manaForNextCrystal = manaForCrystals(nextCrystalCount);
        const manaNeededForNext = manaForNextCrystal - totalMana;

        if (nextCountdownEl) {
            if (effectiveMPS > 0) {
                const secondsUntil = manaNeededForNext / effectiveMPS;
                nextCountdownEl.textContent = formatTime(secondsUntil);
            } else {
                nextCountdownEl.textContent = 'never (no production)';
            }
        }

        // Update current crystals and bonus
        if (currentCrystalsEl) {
            currentCrystalsEl.textContent = manaCrystals;
        }

        if (bonusEl) {
            bonusEl.textContent = '+' + getTotalBonusPercent().toFixed(1) + '%';
        }

        if (timesEl) {
            timesEl.textContent = timesPrestiged;
        }

        // Update prestige button state
        if (prestigeButton) {
            if (pendingCrystals > 0) {
                prestigeButton.disabled = false;
                prestigeButton.textContent = `Prestige (Gain ${pendingCrystals} Crystal${pendingCrystals > 1 ? 's' : ''})`;
            } else {
                prestigeButton.disabled = true;
                prestigeButton.textContent = 'Prestige (No crystals to gain)';
            }
        }
    }

    function updateStoreDisplay() {
        const storeCrystalsEl = document.getElementById('prestige-store-crystals');
        const storeBonusEl = document.getElementById('prestige-store-bonus');

        if (storeCrystalsEl) {
            storeCrystalsEl.textContent = manaCrystals;
        }

        if (storeBonusEl) {
            storeBonusEl.textContent = '+' + getTotalBonusPercent().toFixed(1) + '%';
        }
    }

    function performPrestige() {
        const stats = StatisticsModule.getStats();
        const totalMana = stats.manaTotal;
        const totalCrystalsFromMana = calculateManaCrystals(totalMana);
        const pendingCrystals = Math.max(0, totalCrystalsFromMana - totalManaCrystalsEarned);

        if (pendingCrystals <= 0) {
            return;
        }

        // Award the crystals
        manaCrystals += pendingCrystals;
        totalManaCrystalsEarned += pendingCrystals;
        crystalsSpentThisSession = 0;

        // Enter prestige store
        isInPrestigeStore = true;

        // Play sound if available
        if (typeof SoundModule !== 'undefined') {
            SoundModule.play('enterPrestige');
        }

        // Hide game elements
        hideGameElements();

        // Hide prestige panel, show store
        const prestigePanel = document.getElementById('prestige-panel');
        if (prestigePanel) {
            prestigePanel.hidden = true;
        }

        const storePanel = document.getElementById('prestige-store-panel');
        if (storePanel) {
            storePanel.style.display = 'block';
            const storeHeading = document.getElementById('prestige-store-heading');
            if (storeHeading) {
                storeHeading.focus();
            }
        }

        // Render prestige upgrades and update display
        renderPrestigeUpgrades();
        updateStoreDisplay();
    }

    function hideGameElements() {
        const elementsToHide = [
            '.game-stats',
            '.game-actions',
            '#events-heading',
            '#events-log',
            '#upgrades-heading',
            '#upgrades-container',
            '#buildings-heading',
            '#buildings-container',
            '#purchased-upgrades-panel'
        ];

        elementsToHide.forEach(selector => {
            const el = document.querySelector(selector);
            if (el) {
                el.dataset.prestigeHidden = 'true';
                el.style.display = 'none';
            }
        });
    }

    function showGameElements() {
        const elementsToShow = document.querySelectorAll('[data-prestige-hidden="true"]');
        elementsToShow.forEach(el => {
            el.style.display = '';
            delete el.dataset.prestigeHidden;
        });
    }

    function showResetConfirmation() {
        const modal = document.getElementById('prestige-reset-confirm');
        if (modal) {
            modal.style.display = 'flex';
            const yesButton = document.getElementById('reset-confirm-yes');
            if (yesButton) {
                yesButton.focus();
            }
        }
    }

    function hideResetConfirmation() {
        const modal = document.getElementById('prestige-reset-confirm');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    function finishPrestige() {
        hideResetConfirmation();

        if (!isInPrestigeStore) return;

        // Increment prestige count
        timesPrestiged++;

        // Exit prestige store
        isInPrestigeStore = false;
        crystalsSpentThisSession = 0;

        // Play sound if available
        if (typeof SoundModule !== 'undefined') {
            SoundModule.play('exitPrestige');
        }

        // Hide prestige store
        const storePanel = document.getElementById('prestige-store-panel');
        if (storePanel) {
            storePanel.style.display = 'none';
        }

        // Show game elements
        showGameElements();

        // Reset game state (keeping prestige data)
        // resetForPrestige() already applies prestige building boosts
        if (typeof resetForPrestige === 'function') {
            resetForPrestige();
        }

        updateDisplay();
    }

    function applyAllPrestigeBonuses() {
        // Apply building boosts
        applyAllPrestigeBuildingBoosts();

        // Future: Apply starting buildings here when implemented

        if (typeof recalculateMPS === 'function') {
            recalculateMPS();
        }
        if (typeof renderBuildings === 'function') {
            renderBuildings();
        }
    }

    function getPrestigeLevel() {
        return totalManaCrystalsEarned + bonusPrestigeLevels;
    }

    function addBonusPrestigeLevel(amount) {
        bonusPrestigeLevels += amount;
        updateDisplay();
    }

    function getBonusPrestigeLevels() {
        return bonusPrestigeLevels;
    }

    function getManaCrystals() {
        return manaCrystals;
    }

    function spendManaCrystals(amount) {
        if (manaCrystals >= amount) {
            manaCrystals -= amount;
            updateDisplay();
            return true;
        }
        return false;
    }

    function getTimesPrestiged() {
        return timesPrestiged;
    }

    function isPrestigeMode() {
        return isInPrestigeStore;
    }

    // For save/load
    function getPrestigeData() {
        return {
            manaCrystals,
            totalManaCrystalsEarned,
            bonusPrestigeLevels,
            timesPrestiged,
            isInPrestigeStore,
            prestigePotentialUnlocked,
            highestPotentialTierPurchased,
            prestigeUpgrades: prestigeUpgrades.map(u => ({
                id: u.id,
                isPurchased: u.isPurchased
            }))
        };
    }

    function loadPrestigeData(data) {
        if (data) {
            manaCrystals = data.manaCrystals || 0;
            totalManaCrystalsEarned = data.totalManaCrystalsEarned || 0;
            bonusPrestigeLevels = data.bonusPrestigeLevels || 0;
            timesPrestiged = data.timesPrestiged || 0;
            isInPrestigeStore = data.isInPrestigeStore || false;
            prestigePotentialUnlocked = data.prestigePotentialUnlocked || 0;
            highestPotentialTierPurchased = data.highestPotentialTierPurchased || 0;

            // Load prestige upgrade states
            if (data.prestigeUpgrades) {
                data.prestigeUpgrades.forEach(savedUpgrade => {
                    const upgrade = prestigeUpgrades.find(u => u.id === savedUpgrade.id);
                    if (upgrade) {
                        upgrade.isPurchased = savedUpgrade.isPurchased || false;
                    }
                });
            }

            // If loading into prestige store, restore that state
            if (isInPrestigeStore) {
                hideGameElements();
                const storePanel = document.getElementById('prestige-store-panel');
                if (storePanel) storePanel.style.display = 'block';
                renderPrestigeUpgrades();
                updateStoreDisplay();
            }
        }
    }

    // Reset potential for a new run (called on prestige)
    function resetPotentialForRun() {
        prestigePotentialUnlocked = 0;
    }

    function reset() {
        manaCrystals = 0;
        totalManaCrystalsEarned = 0;
        bonusPrestigeLevels = 0;
        timesPrestiged = 0;
        isInPrestigeStore = false;
        crystalsSpentThisSession = 0;
        prestigePotentialUnlocked = 0;
        highestPotentialTierPurchased = 0;
        prestigeUpgrades.forEach(u => u.isPurchased = false);
    }

    function hasAutoClicker() {
        const upgrade = prestigeUpgrades.find(u => u.id === 'arcane-auto-gather');
        return upgrade && upgrade.isPurchased;
    }

    function hasRunestoneBoost() {
        const upgrade = prestigeUpgrades.find(u => u.id === 'runestone-affinity');
        return upgrade && upgrade.isPurchased;
    }

    function hasSpellRegenBoost() {
        const upgrade = prestigeUpgrades.find(u => u.id === 'spell-power-reservoir');
        return upgrade && upgrade.isPurchased;
    }

    function hasWellBoost() {
        const upgrade = prestigeUpgrades.find(u => u.id === 'well-keeper');
        return upgrade && upgrade.isPurchased;
    }

    function getPrestigeUpgrades() {
        return prestigeUpgrades;
    }

    return {
        getHTML,
        init,
        updateDisplay,
        getPrestigeLevel,
        addBonusPrestigeLevel,
        getBonusPrestigeLevels,
        getManaCrystals,
        spendManaCrystals,
        getTimesPrestiged,
        getPrestigeMultiplier,
        getPrestigeData,
        loadPrestigeData,
        calculateManaCrystals,
        manaForCrystals,
        isPrestigeMode,
        shouldShowPrestige,
        renderPrestigeUpgrades,
        applyAllPrestigeBuildingBoosts,
        applyAllPrestigeBonuses,
        getPrestigeUpgrades,
        getStartingMana,
        getStartingBuildings,
        hasAutoClicker,
        hasRunestoneBoost,
        hasSpellRegenBoost,
        hasWellBoost,
        addPrestigePotential,
        getPrestigePotential,
        getHighestPotentialTier,
        getRawPrestigeBonus,
        resetPotentialForRun,
        reset
    };
})();
