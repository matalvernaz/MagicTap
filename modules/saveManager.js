// Save Manager Module
const SaveManager = (function() {
    const SAVE_KEY = 'magictap_save';
    const SAVE_VERSION = 1;
    let autoSaveInterval = null;

    function getSaveData() {
        return {
            version: SAVE_VERSION,
            timestamp: Date.now(),
            game: {
                mana: mana,
                manaPerClick: manaPerClick,
                manaPerSecond: manaPerSecond,
                baseManaPerClick: baseManaPerClick,
                manaPerClickFromUpgrades: manaPerClickFromUpgrades,
                mpsFromUpgrades: mpsFromUpgrades,
                mpsUpgradeMultiplier: mpsUpgradeMultiplier,
                proficiencyUpgradeCount: proficiencyUpgradeCount
            },
            buildings: buildings.map(b => ({
                id: b.id,
                owned: b.owned,
                isUnlocked: b.isUnlocked,
                productionPerSecond: b.productionPerSecond
            })),
            upgrades: upgrades.map(u => ({
                id: u.id,
                isPurchased: u.isPurchased,
                isUnlocked: u.isUnlocked
            })),
            statistics: StatisticsModule.getStats(),
            achievements: AchievementsModule.getAchievements().map(a => ({
                id: a.id,
                isEarned: a.isEarned
            })),
            prestige: PrestigeModule.getPrestigeData(),
            options: OptionsModule.getOptions(),
            wishingWell: WishingWellModule.getState(),
            rankingUpgrades: RankingUpgradesModule.getSaveData(),
            spellcasting: typeof SpellcastingModule !== 'undefined' ? SpellcastingModule.getSaveData() : null,
            sound: typeof SoundModule !== 'undefined' ? SoundModule.getSaveData() : null
        };
    }

    function applySaveData(data) {
        if (!data) return false;

        try {
            // Restore game state
            if (data.game) {
                mana = data.game.mana || 0;
                manaPerClick = data.game.manaPerClick || 1;
                manaPerSecond = data.game.manaPerSecond || 0;
                baseManaPerClick = data.game.baseManaPerClick || 1;
                manaPerClickFromUpgrades = data.game.manaPerClickFromUpgrades || 0;
                mpsFromUpgrades = data.game.mpsFromUpgrades || 0;
                mpsUpgradeMultiplier = data.game.mpsUpgradeMultiplier || 1;
                proficiencyUpgradeCount = data.game.proficiencyUpgradeCount || 0;
            }

            // Restore buildings
            if (data.buildings) {
                data.buildings.forEach(savedBuilding => {
                    const building = buildings.find(b => b.id === savedBuilding.id);
                    if (building) {
                        building.owned = savedBuilding.owned || 0;
                        building.isUnlocked = savedBuilding.isUnlocked || false;
                        // Restore productionPerSecond if saved, otherwise use baseProduction
                        if (savedBuilding.productionPerSecond !== undefined) {
                            building.productionPerSecond = savedBuilding.productionPerSecond;
                        }
                    }
                });
            }

            // Restore upgrades
            if (data.upgrades) {
                data.upgrades.forEach(savedUpgrade => {
                    const upgrade = upgrades.find(u => u.id === savedUpgrade.id);
                    if (upgrade) {
                        upgrade.isPurchased = savedUpgrade.isPurchased || false;
                        upgrade.isUnlocked = savedUpgrade.isUnlocked || false;
                    }
                });
            }

            // Restore statistics
            if (data.statistics) {
                StatisticsModule.loadStats(data.statistics);
            }

            // Restore achievements
            if (data.achievements) {
                AchievementsModule.loadAchievements(data.achievements);
            }

            // Restore prestige
            if (data.prestige) {
                PrestigeModule.loadPrestigeData(data.prestige);
            }

            // Restore options
            if (data.options) {
                OptionsModule.loadOptions(data.options);
            }

            // Restore Wishing Well
            if (data.wishingWell) {
                WishingWellModule.loadState(data.wishingWell);
            }

            // Restore Ranking Upgrades
            if (data.rankingUpgrades) {
                RankingUpgradesModule.loadSaveData(data.rankingUpgrades);
            }

            // Restore Spellcasting
            if (data.spellcasting && typeof SpellcastingModule !== 'undefined') {
                SpellcastingModule.loadSaveData(data.spellcasting);
            }

            // Restore Sound settings
            if (data.sound && typeof SoundModule !== 'undefined') {
                SoundModule.loadSaveData(data.sound);
            }

            return true;
        } catch (e) {
            console.error('Error applying save data:', e);
            return false;
        }
    }

    function save() {
        try {
            const saveData = getSaveData();
            localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
            console.log('Game saved successfully');
            return true;
        } catch (e) {
            console.error('Error saving game:', e);
            return false;
        }
    }

    function calculateOfflineProgress(saveData) {
        if (!saveData || !saveData.timestamp) return null;

        const now = Date.now();
        const elapsed = (now - saveData.timestamp) / 1000; // seconds
        const MIN_OFFLINE_SECONDS = 60; // At least 1 minute away
        const MAX_OFFLINE_SECONDS = 8 * 60 * 60; // Cap at 8 hours

        if (elapsed < MIN_OFFLINE_SECONDS) return null;

        const cappedElapsed = Math.min(elapsed, MAX_OFFLINE_SECONDS);
        const savedMPS = saveData.game ? saveData.game.manaPerSecond : 0;

        if (savedMPS <= 0) return null;

        // Apply prestige multiplier if available
        let prestigeMultiplier = 1;
        if (saveData.prestige && saveData.prestige.totalManaCrystalsEarned > 0) {
            const rawBonus = saveData.prestige.totalManaCrystalsEarned / 100;
            const potential = saveData.prestige.prestigePotentialUnlocked || 0;
            prestigeMultiplier = 1 + (rawBonus * (potential / 100));
        }

        // Offline earns 50% of active rate (standard idle game convention)
        const offlineRate = 0.5;
        const earned = savedMPS * prestigeMultiplier * cappedElapsed * offlineRate;

        return {
            earned: earned,
            elapsed: cappedElapsed,
            wasCapped: elapsed > MAX_OFFLINE_SECONDS
        };
    }

    function showOfflineProgressNotification(progress) {
        const notificationArea = document.getElementById('notification-area');
        if (!notificationArea) return;

        // Screen reader announcement
        const liveAnnouncement = document.createElement('span');
        liveAnnouncement.className = 'sr-only';
        liveAnnouncement.setAttribute('role', 'alert');
        const formattedMana = typeof OptionsModule !== 'undefined' ? OptionsModule.formatNumber(Math.floor(progress.earned)) : Math.floor(progress.earned).toString();
        liveAnnouncement.textContent = `Welcome back! You earned ${formattedMana} Mana while away.`;
        notificationArea.appendChild(liveAnnouncement);
        setTimeout(() => liveAnnouncement.remove(), 3000);

        // Format elapsed time
        const hours = Math.floor(progress.elapsed / 3600);
        const minutes = Math.floor((progress.elapsed % 3600) / 60);
        let timeStr = '';
        if (hours > 0) timeStr += hours + 'h ';
        if (minutes > 0) timeStr += minutes + 'm';
        if (!timeStr) timeStr = 'a short while';

        // Visible notification
        const notification = document.createElement('div');
        notification.className = 'notification offline-progress-notification';
        notification.setAttribute('role', 'region');
        notification.setAttribute('aria-label', 'Offline progress report');

        const dismissBtn = document.createElement('button');
        dismissBtn.className = 'notification-dismiss';
        dismissBtn.setAttribute('aria-label', 'Dismiss offline progress notification');
        dismissBtn.textContent = 'X';
        dismissBtn.addEventListener('click', () => notification.remove());

        const title = document.createElement('p');
        title.className = 'notification-title';
        title.textContent = 'Welcome Back!';

        const content = document.createElement('p');
        content.className = 'notification-content';
        content.textContent = `You were away for ${timeStr.trim()}. Your wizards earned ${formattedMana} Mana while you were gone!`;
        if (progress.wasCapped) {
            const note = document.createElement('p');
            note.className = 'notification-content';
            note.style.fontSize = '0.9em';
            note.style.marginTop = '5px';
            note.textContent = '(Offline earnings capped at 8 hours)';
            notification.appendChild(note);
        }

        notification.appendChild(dismissBtn);
        notification.appendChild(title);
        notification.appendChild(content);
        notificationArea.appendChild(notification);

        // Auto-dismiss after 15 seconds
        setTimeout(() => {
            if (notification.parentNode) notification.remove();
        }, 15000);
    }

    function load() {
        try {
            const saveString = localStorage.getItem(SAVE_KEY);
            if (!saveString) {
                console.log('No save data found');
                return false;
            }

            const saveData = JSON.parse(saveString);

            // Calculate offline progress before applying save
            const offlineProgress = calculateOfflineProgress(saveData);

            if (applySaveData(saveData)) {
                // productionPerSecond is now saved with all boosts, no need to re-apply
                // Recalculate MPS with loaded multiplier and building data
                recalculateMPS();
                // Re-render everything after loading
                renderBuildings();
                renderUpgrades();
                // Re-apply purchased upgrade effects
                upgrades.forEach(upgrade => {
                    if (upgrade.isPurchased) {
                        // Move to purchased panel
                        if (upgrade.element) {
                            const buyButton = upgrade.element.querySelector('.buy-upgrade-button');
                            if (buyButton) buyButton.remove();
                            const costEl = upgrade.element.querySelector('.upgrade-cost');
                            if (costEl) costEl.remove();
                            purchasedUpgradesContainer.appendChild(upgrade.element);
                            upgrade.element.classList.remove('upgrade-item');
                            upgrade.element.classList.add('purchased-upgrade-item');
                        }
                    }
                });
                AchievementsModule.renderAchievements();
                updateDisplay();
                updateWishingWellButton();
                updateRankingUpgradesButton();

                // Apply offline progress
                if (offlineProgress && offlineProgress.earned > 0) {
                    mana += offlineProgress.earned;
                    if (typeof StatisticsModule !== 'undefined') {
                        StatisticsModule.addManaByBuildings(offlineProgress.earned);
                    }
                    updateDisplay();
                    // Show notification after a brief delay to let the UI settle
                    setTimeout(() => showOfflineProgressNotification(offlineProgress), 500);
                }

                console.log('Game loaded successfully');
                return true;
            }
            return false;
        } catch (e) {
            console.error('Error loading game:', e);
            return false;
        }
    }

    function exportSave() {
        try {
            const saveData = getSaveData();
            const saveString = JSON.stringify(saveData);
            const encoded = btoa(saveString);
            return encoded;
        } catch (e) {
            console.error('Error exporting save:', e);
            return null;
        }
    }

    function importSave(encoded) {
        try {
            const saveString = atob(encoded);
            const saveData = JSON.parse(saveString);
            if (applySaveData(saveData)) {
                // productionPerSecond is now saved with all boosts, no need to re-apply
                recalculateMPS();
                renderBuildings();
                renderUpgrades();
                upgrades.forEach(upgrade => {
                    if (upgrade.isPurchased && upgrade.element) {
                        const buyButton = upgrade.element.querySelector('.buy-upgrade-button');
                        if (buyButton) buyButton.remove();
                        const costEl = upgrade.element.querySelector('.upgrade-cost');
                        if (costEl) costEl.remove();
                        purchasedUpgradesContainer.appendChild(upgrade.element);
                        upgrade.element.classList.remove('upgrade-item');
                        upgrade.element.classList.add('purchased-upgrade-item');
                    }
                });
                AchievementsModule.renderAchievements();
                updateDisplay();
                updateWishingWellButton();
                updateRankingUpgradesButton();
                save(); // Save the imported data to localStorage
                console.log('Save imported successfully');
                return true;
            }
            return false;
        } catch (e) {
            console.error('Error importing save:', e);
            return false;
        }
    }

    function resetGame() {
        // Stop auto-save to prevent saving during reset
        stopAutoSave();

        // Clear the save data from localStorage
        localStorage.removeItem(SAVE_KEY);

        // Force reload the page to ensure clean state
        window.location.href = window.location.href;
    }

    function startAutoSave(intervalSeconds) {
        stopAutoSave();
        autoSaveInterval = setInterval(() => {
            if (OptionsModule.getOptions().autoSaveEnabled) {
                save();
            }
        }, intervalSeconds * 1000);
    }

    function stopAutoSave() {
        if (autoSaveInterval) {
            clearInterval(autoSaveInterval);
            autoSaveInterval = null;
        }
    }

    function init() {
        // Try to load existing save
        load();
        // Start auto-save (every 30 seconds)
        startAutoSave(30);
    }

    return {
        save,
        saveGame: save,  // Alias for save
        load,
        exportSave,
        importSave,
        resetGame,
        startAutoSave,
        stopAutoSave,
        init
    };
})();
