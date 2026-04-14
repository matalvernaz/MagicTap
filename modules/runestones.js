// Runestones Module - Golden/Wrath Cookie equivalent
const RunestonesModule = (function() {
    // Runestone colors
    const positiveColors = ['green', 'blue', 'white', 'pink', 'gold', 'silver', 'purple'];
    const negativeColors = ['red', 'black', 'orange', 'brown', 'yellow', 'grey'];

    // Default effect duration in seconds
    const DEFAULT_EFFECT_DURATION = 30;
    // Runestone linger time in seconds
    const LINGER_TIME = 15;
    // Fade warning time (seconds before disappearing)
    const FADE_WARNING_TIME = 5;
    // Spawn interval range (in milliseconds) - 2 to 5 minutes
    const MIN_SPAWN_INTERVAL = 120000;
    const MAX_SPAWN_INTERVAL = 300000;

    // Special effect chances
    const SILENCED_CHANCE = 0.01; // 1% chance for Silenced

    // State
    let activeRunestone = null;
    let runestoneElement = null;
    let spawnTimerId = null;
    let lingerTimerId = null;
    let fadeWarningTimerId = null;
    let activeEffect = null;
    let effectTimerId = null;
    let effectTimeRemaining = 0;

    // Temporary effect modifiers
    let tempMPSBonus = 0;
    let tempMPCBonus = 0;
    let tempMPSMultiplier = 1;
    let tempBuildingProductionMultiplier = 1;
    let tempBuildingCostMultiplier = 1;
    let tempUpgradeCostMultiplier = 1;
    let tempSpecificBuildingMultipliers = {}; // { buildingId: multiplier }
    let isSilenced = false;

    // Effects definition
    const effects = [
        // === POSITIVE EFFECTS ===
        {
            id: 'gushing-ley-lines',
            name: 'Gushing Ley Lines',
            description: 'MPS increased based on Ley Lines owned.',
            isPositive: true,
            duration: 30,
            apply: () => {
                const leyLines = buildings.find(b => b.id === 'ley-line');
                const bonus = (leyLines?.owned || 0) * 100;
                tempMPSBonus = bonus;
                recalculateMPS();
                return `+${OptionsModule.formatNumber(bonus)} MPS for 30 seconds!`;
            }
        },
        {
            id: 'jazz-hands',
            name: 'Jazz Hands',
            description: 'MPS increased based on Wizard\'s Hands owned.',
            isPositive: true,
            duration: 30,
            apply: () => {
                const wizardsHands = buildings.find(b => b.id === 'wizards-hand');
                const bonus = (wizardsHands?.owned || 0) * 100;
                tempMPSBonus = bonus;
                recalculateMPS();
                return `+${OptionsModule.formatNumber(bonus)} MPS for 30 seconds!`;
            }
        },
        {
            id: 'magictap-storm',
            name: 'MagicTap Storm',
            description: 'Mana per click increased.',
            isPositive: true,
            duration: 30,
            apply: () => {
                tempMPCBonus = 1000;
                return `+1000 Mana per click for 30 seconds!`;
            }
        },
        {
            id: 'mana-surge',
            name: 'Mana Surge',
            description: 'Mana per second tripled.',
            isPositive: true,
            duration: 30,
            apply: () => {
                tempMPSMultiplier = 3;
                recalculateMPS();
                return `3x MPS for 30 seconds!`;
            }
        },
        {
            id: 'arcane-overflow',
            name: 'Arcane Overflow',
            description: 'All buildings produce double.',
            isPositive: true,
            duration: 15,
            apply: () => {
                tempBuildingProductionMultiplier = 2;
                recalculateMPS();
                return `All buildings produce 2x for 15 seconds!`;
            }
        },
        {
            id: 'earth-elemental-assistance',
            name: 'Earth Elemental Assistance',
            description: 'Buildings cost less.',
            isPositive: true,
            duration: 60,
            apply: () => {
                tempBuildingCostMultiplier = 0.95;
                return `Buildings cost 5% less for 60 seconds!`;
            }
        },
        {
            id: 'true-sight',
            name: 'True Sight',
            description: 'Wizard\'s Eye production tripled.',
            isPositive: true,
            duration: 30,
            apply: () => {
                tempSpecificBuildingMultipliers['wizards-eye'] = 3;
                recalculateMPS();
                return `Wizard's Eye production 3x for 30 seconds!`;
            }
        },
        {
            id: 'crystal-clear',
            name: 'Crystal Clear',
            description: 'Mana Crystal production increased dramatically.',
            isPositive: true,
            duration: 30,
            apply: () => {
                tempSpecificBuildingMultipliers['mana-crystal'] = 7;
                recalculateMPS();
                return `Mana Crystal production 7x for 30 seconds!`;
            }
        },
        {
            id: 'arcane-inspiration',
            name: 'Arcane Inspiration',
            description: 'Upgrades cost less.',
            isPositive: true,
            duration: 45,
            apply: () => {
                tempUpgradeCostMultiplier = 0.98;
                return `Upgrades cost 2% less for 45 seconds!`;
            }
        },
        {
            id: 'mana-rain',
            name: 'Mana Rain',
            description: 'Instant Mana grant based on current production.',
            isPositive: true,
            duration: 0, // Instant effect
            isInstant: true,
            apply: () => {
                const grant = manaPerSecond * 30; // 30 seconds of production
                mana += grant;
                if (typeof StatisticsModule !== 'undefined') {
                    StatisticsModule.addManaByBuildings(grant);
                }
                return `+${OptionsModule.formatNumber(grant)} Mana instantly!`;
            }
        },
        {
            id: 'time-warp',
            name: 'Time Warp',
            description: 'Gain production time instantly.',
            isPositive: true,
            duration: 0, // Instant effect
            isInstant: true,
            apply: () => {
                const seconds = 60;
                const grant = manaPerSecond * seconds;
                mana += grant;
                if (typeof StatisticsModule !== 'undefined') {
                    StatisticsModule.addManaByBuildings(grant);
                }
                return `+${seconds} seconds of production! (+${OptionsModule.formatNumber(grant)} Mana)`;
            }
        },
        {
            id: 'flooded-ley-lines',
            name: 'Flooded Ley Lines',
            description: 'Ley Line production dramatically increased.',
            isPositive: true,
            duration: 30,
            apply: () => {
                tempSpecificBuildingMultipliers['ley-line'] = 5;
                recalculateMPS();
                return `Ley Line production 5x for 30 seconds!`;
            }
        },
        // === NEGATIVE EFFECTS ===
        {
            id: 'mana-drought',
            name: 'Mana Drought',
            description: 'MPS reduced based on buildings owned.',
            isPositive: false,
            duration: 30,
            apply: () => {
                let totalBuildings = 0;
                buildings.forEach(b => totalBuildings += b.owned);
                const penalty = totalBuildings * 50;
                tempMPSBonus = -penalty;
                recalculateMPS();
                return `-${OptionsModule.formatNumber(penalty)} MPS for 30 seconds!`;
            }
        },
        {
            id: 'clumsy-fingers',
            name: 'Clumsy Fingers',
            description: 'Mana per click reduced.',
            isPositive: false,
            duration: 30,
            apply: () => {
                tempMPCBonus = -500;
                return `-500 Mana per click for 30 seconds!`;
            }
        },
        {
            id: 'magical-interference',
            name: 'Magical Interference',
            description: 'All production slightly reduced.',
            isPositive: false,
            duration: 30,
            apply: () => {
                const penalty = Math.floor(manaPerSecond * 0.1);
                tempMPSBonus = -penalty;
                recalculateMPS();
                return `-10% MPS for 30 seconds!`;
            }
        },
        {
            id: 'mana-void',
            name: 'Mana Void',
            description: 'Massive reduction to Mana production.',
            isPositive: false,
            duration: 10,
            apply: () => {
                tempMPSMultiplier = 0.1; // 90% reduction
                recalculateMPS();
                return `-90% MPS for 10 seconds!`;
            }
        },
        {
            id: 'earth-elemental-hindrance',
            name: 'Earth Elemental Hindrance',
            description: 'Buildings cost more.',
            isPositive: false,
            duration: 30,
            apply: () => {
                tempBuildingCostMultiplier = 1.10;
                return `Buildings cost 10% more for 30 seconds!`;
            }
        },
        {
            id: 'muddled-mind',
            name: 'Muddled Mind',
            description: 'Upgrades cost more.',
            isPositive: false,
            duration: 90,
            apply: () => {
                tempUpgradeCostMultiplier = 1.04;
                return `Upgrades cost 4% more for 90 seconds!`;
            }
        },
        // === SPECIAL EFFECTS ===
        {
            id: 'silenced',
            name: 'Silenced',
            description: 'All Mana production stops.',
            isPositive: false,
            isSpecial: true,
            onlyColor: 'black',
            duration: 5,
            apply: () => {
                isSilenced = true;
                recalculateMPS();
                return `All Mana production STOPPED for 5 seconds!`;
            }
        }
    ];

    function getRandomSpawnInterval() {
        let interval = Math.floor(Math.random() * (MAX_SPAWN_INTERVAL - MIN_SPAWN_INTERVAL)) + MIN_SPAWN_INTERVAL;
        // Runestone Affinity prestige upgrade: 30% faster spawns
        if (typeof PrestigeModule !== 'undefined' && PrestigeModule.hasRunestoneBoost && PrestigeModule.hasRunestoneBoost()) {
            interval = Math.floor(interval * 0.7);
        }
        return interval;
    }

    function init() {
        // Runestone container is now in index.html between title and notification area

        // Create effect display area if it doesn't exist
        if (!document.getElementById('runestone-effect-display')) {
            const effectDisplay = document.createElement('div');
            effectDisplay.id = 'runestone-effect-display';
            effectDisplay.hidden = true;
            // Insert after the runestone container
            const container = document.getElementById('runestone-container');
            if (container && container.parentNode) {
                container.parentNode.insertBefore(effectDisplay, container.nextSibling);
            } else {
                document.body.appendChild(effectDisplay);
            }
        }

        scheduleNextRunestone();
    }

    function scheduleNextRunestone() {
        if (spawnTimerId) {
            clearTimeout(spawnTimerId);
        }
        const interval = getRandomSpawnInterval();
        spawnTimerId = setTimeout(spawnRunestone, interval);
    }

    function spawnRunestone() {
        // Don't spawn if one is already active
        if (activeRunestone) {
            scheduleNextRunestone();
            return;
        }

        // Check for 1% Silenced chance first
        if (Math.random() < SILENCED_CHANCE) {
            const silencedEffect = effects.find(e => e.id === 'silenced');
            activeRunestone = {
                color: 'black',
                isPositive: false,
                effect: silencedEffect
            };
        } else {
            // Normal spawn: 70% positive, 30% negative
            const isPositive = Math.random() < 0.7;
            const colors = isPositive ? positiveColors : negativeColors;
            const color = colors[Math.floor(Math.random() * colors.length)];

            // Select a random effect of matching type (exclude special effects from normal pool)
            const availableEffects = effects.filter(e => e.isPositive === isPositive && !e.isSpecial);
            const effect = availableEffects[Math.floor(Math.random() * availableEffects.length)];

            activeRunestone = {
                color: color,
                isPositive: isPositive,
                effect: effect
            };
        }

        // Create and display the runestone
        createRunestoneElement(activeRunestone.color, activeRunestone.isPositive);

        // Announce to screen reader
        announceToScreenReader('A Runestone has appeared.');

        // Set up fade warning
        fadeWarningTimerId = setTimeout(() => {
            announceToScreenReader('A Runestone is fading...');
        }, (LINGER_TIME - FADE_WARNING_TIME) * 1000);

        // Set up auto-dismiss
        lingerTimerId = setTimeout(() => {
            dismissRunestone();
        }, LINGER_TIME * 1000);

        // Schedule next runestone
        scheduleNextRunestone();
    }

    function createRunestoneElement(color, isPositive) {
        const container = document.getElementById('runestone-container');
        if (!container) return;

        runestoneElement = document.createElement('button');
        runestoneElement.className = `runestone runestone-${color} ${isPositive ? 'positive' : 'negative'}`;
        runestoneElement.setAttribute('aria-label', `${color.charAt(0).toUpperCase() + color.slice(1)} Runestone. Click to activate.`);
        runestoneElement.innerHTML = `<span class="runestone-glyph">&#x25C6;</span>`;

        runestoneElement.addEventListener('click', clickRunestone);

        container.appendChild(runestoneElement);

        // Trigger animation (capture local ref in case module var is cleared)
        const el = runestoneElement;
        requestAnimationFrame(() => {
            if (el) {
                el.classList.add('visible');
            }
        });
    }

    function clickRunestone() {
        if (!activeRunestone) return;

        const effect = activeRunestone.effect;
        const resultMessage = effect.apply();

        // Show notification
        if (typeof NotificationModule !== 'undefined') {
            const type = activeRunestone.isPositive ? 'success' : 'warning';
            NotificationModule.show(`${effect.name}: ${resultMessage}`, type);
        }

        // Start effect timer only for non-instant effects
        if (!effect.isInstant && effect.duration > 0) {
            startEffectTimer(effect, effect.duration);
        }

        // Dismiss the runestone
        dismissRunestone();
    }

    function startEffectTimer(effect, duration) {
        activeEffect = effect;
        effectTimeRemaining = duration;

        updateEffectDisplay();

        if (effectTimerId) {
            clearInterval(effectTimerId);
        }

        effectTimerId = setInterval(() => {
            effectTimeRemaining--;
            updateEffectDisplay();

            if (effectTimeRemaining <= 0) {
                endEffect();
            }
        }, 1000);
    }

    function endEffect() {
        if (effectTimerId) {
            clearInterval(effectTimerId);
            effectTimerId = null;
        }

        const wasNegative = activeEffect && !activeEffect.isPositive;
        activeEffect = null;

        // Reset all temporary modifiers
        tempMPSBonus = 0;
        tempMPCBonus = 0;
        tempMPSMultiplier = 1;
        tempBuildingProductionMultiplier = 1;
        tempBuildingCostMultiplier = 1;
        tempUpgradeCostMultiplier = 1;
        tempSpecificBuildingMultipliers = {};
        isSilenced = false;

        // Recalculate MPS without bonuses
        if (typeof recalculateMPS === 'function') {
            recalculateMPS();
        }

        updateEffectDisplay();

        if (typeof NotificationModule !== 'undefined') {
            NotificationModule.show('Runestone effect has ended.', wasNegative ? 'success' : 'info');
        }
    }

    function updateEffectDisplay() {
        const display = document.getElementById('runestone-effect-display');
        if (!display) return;

        if (activeEffect && effectTimeRemaining > 0) {
            display.hidden = false;
            display.className = activeEffect.isPositive ? 'effect-positive' : 'effect-negative';
            display.innerHTML = `
                <strong>${activeEffect.name}</strong>
                <span>${effectTimeRemaining}s remaining</span>
            `;
        } else {
            display.hidden = true;
        }
    }

    function dismissRunestone() {
        if (fadeWarningTimerId) {
            clearTimeout(fadeWarningTimerId);
            fadeWarningTimerId = null;
        }
        if (lingerTimerId) {
            clearTimeout(lingerTimerId);
            lingerTimerId = null;
        }

        if (runestoneElement) {
            runestoneElement.classList.remove('visible');
            runestoneElement.classList.add('fading');
            setTimeout(() => {
                if (runestoneElement && runestoneElement.parentNode) {
                    runestoneElement.parentNode.removeChild(runestoneElement);
                }
                runestoneElement = null;
            }, 500);
        }

        activeRunestone = null;
    }

    function announceToScreenReader(message) {
        const container = document.getElementById('runestone-container');
        if (!container) return;

        // Create a temporary announcement element
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'assertive');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;

        container.appendChild(announcement);

        // Remove after announcement
        setTimeout(() => {
            if (announcement.parentNode) {
                announcement.parentNode.removeChild(announcement);
            }
        }, 1000);
    }

    // Getter functions for modifiers
    function getTempMPSBonus() {
        return tempMPSBonus;
    }

    function getTempMPCBonus() {
        return tempMPCBonus;
    }

    function getTempMPSMultiplier() {
        return tempMPSMultiplier;
    }

    function getTempBuildingProductionMultiplier() {
        return tempBuildingProductionMultiplier;
    }

    function getTempBuildingCostMultiplier() {
        return tempBuildingCostMultiplier;
    }

    function getTempUpgradeCostMultiplier() {
        return tempUpgradeCostMultiplier;
    }

    function getSpecificBuildingMultiplier(buildingId) {
        return tempSpecificBuildingMultipliers[buildingId] || 1;
    }

    function isMagicSilenced() {
        return isSilenced;
    }

    function addEffect(effect) {
        effects.push(effect);
    }

    function getEffects() {
        return effects;
    }

    function reset() {
        dismissRunestone();
        if (activeEffect) {
            endEffect();
        }
        tempMPSBonus = 0;
        tempMPCBonus = 0;
        tempMPSMultiplier = 1;
        tempBuildingProductionMultiplier = 1;
        tempBuildingCostMultiplier = 1;
        tempUpgradeCostMultiplier = 1;
        tempSpecificBuildingMultipliers = {};
        isSilenced = false;
    }

    return {
        init,
        spawnRunestone,
        getTempMPSBonus,
        getTempMPCBonus,
        getTempMPSMultiplier,
        getTempBuildingProductionMultiplier,
        getTempBuildingCostMultiplier,
        getTempUpgradeCostMultiplier,
        getSpecificBuildingMultiplier,
        isMagicSilenced,
        addEffect,
        getEffects,
        reset
    };
})();
