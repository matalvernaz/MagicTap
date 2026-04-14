// Wishing Well Module
const WishingWellModule = (function() {
    // Wishing Well state
    let coins = 0;
    let maxCoins = 15;
    let level = 1;
    let isUnlocked = false;
    let effectTriggerCount = 0;

    // Active effect state
    let activeEffect = null;
    let effectTimeRemaining = 0;
    let effectTimerId = null;
    let mpsMultiplier = 1;
    let mpcMultiplier = 1;

    // Backfire chance (15% chance of getting negative effect)
    const BACKFIRE_CHANCE = 0.15;

    // Effects definition
    const effects = [
        {
            id: 'magical-flourish',
            name: 'Magical Flourish',
            description: 'Mana per second doubled for 30 seconds.',
            cost: 10,
            duration: 30,
            multiplier: 2,
            isPositive: true,
            backfireId: 'mana-leak'
        },
        {
            id: 'mana-leak',
            name: 'Mana Leak',
            description: 'Mana per second halved for 30 seconds.',
            cost: 0,
            duration: 30,
            multiplier: 0.5,
            isPositive: false,
            isBackfire: true
        },
        {
            id: 'coin-shower',
            name: 'Coin Shower',
            description: 'Instantly gain 6 Wishing Well coins.',
            cost: 3,
            duration: 0,
            isPositive: true,
            isInstant: true,
            backfireId: 'coin-tax',
            apply: function() {
                coins = Math.min(coins + 6, maxCoins);
            }
        },
        {
            id: 'coin-tax',
            name: 'Coin Tax',
            description: 'Lose 3 Wishing Well coins.',
            cost: 0,
            duration: 0,
            isPositive: false,
            isBackfire: true,
            isInstant: true,
            apply: function() {
                coins = Math.max(0, coins - 3);
            }
        },
        {
            id: 'mana-vortex',
            name: 'Mana Vortex',
            description: 'Gain 60 seconds of production instantly.',
            cost: 12,
            duration: 0,
            isPositive: true,
            isInstant: true,
            backfireId: 'mana-drain',
            apply: function() {
                const grant = (typeof getEffectiveMPS === 'function' ? getEffectiveMPS() : manaPerSecond) * 60;
                mana += grant;
                if (typeof StatisticsModule !== 'undefined') {
                    StatisticsModule.addManaByBuildings(grant);
                }
            }
        },
        {
            id: 'mana-drain',
            name: 'Mana Drain',
            description: 'Lose 10% of current Mana.',
            cost: 0,
            duration: 0,
            isPositive: false,
            isBackfire: true,
            isInstant: true,
            apply: function() {
                mana *= 0.9;
            }
        },
        {
            id: 'click-frenzy',
            name: 'Click Frenzy',
            description: 'Mana per click x10 for 15 seconds.',
            cost: 7,
            duration: 15,
            multiplier: 1, // MPS multiplier stays at 1
            mpcMultiplier: 10,
            isPositive: true,
            backfireId: 'clumsy-wish'
        },
        {
            id: 'clumsy-wish',
            name: 'Clumsy Wish',
            description: 'Mana per click reduced to 1 for 15 seconds.',
            cost: 0,
            duration: 15,
            multiplier: 1,
            mpcMultiplier: 0,
            isPositive: false,
            isBackfire: true
        },
        {
            id: 'arcane-blessing',
            name: 'Arcane Blessing',
            description: 'Mana per second tripled for 20 seconds.',
            cost: 14,
            duration: 20,
            multiplier: 3,
            isPositive: true,
            backfireId: 'arcane-curse',
            minLevel: 2
        },
        {
            id: 'arcane-curse',
            name: 'Arcane Curse',
            description: 'Mana per second reduced to 25% for 20 seconds.',
            cost: 0,
            duration: 20,
            multiplier: 0.25,
            isPositive: false,
            isBackfire: true
        }
    ];

    // Coin generation rate (coins per second)
    function getCoinGenerationRate() {
        // Base rate so coins always trickle in, plus snowball effect
        const baseRate = 0.02; // ~1 coin per 50 seconds
        return baseRate + (coins / 150);
    }

    function addCoins(amount) {
        coins = Math.min(coins + amount, maxCoins);
    }

    function spendCoins(amount) {
        if (coins >= amount) {
            coins -= amount;
            return true;
        }
        return false;
    }

    function getHTML() {
        return `
        <section id="wishing-well-panel" class="game-panel" hidden>
            <h2 id="wishing-well-heading" tabindex="-1">Wishing Well</h2>
            <div id="wishing-well-container" aria-labelledby="wishing-well-heading">
                <p class="wishing-well-description">Coins accumulate slowly over time. The more coins you have, the faster new ones appear. Spend them on effects below — but beware, there is a 15% chance the well backfires.</p>
                <div class="wishing-well-status">
                    <p>Coins: <span id="wishing-well-coins">0</span> / <span id="wishing-well-max-coins">15</span></p>
                    <p>Well Level: <span id="wishing-well-level">1</span></p>
                    <p>Effects Triggered: <span id="wishing-well-trigger-count">0</span></p>
                </div>
                <div id="wishing-well-active-effect" class="wishing-well-active" hidden>
                    <p><strong>Active Effect:</strong> <span id="active-effect-name"></span></p>
                    <p>Time Remaining: <span id="active-effect-time">0</span>s</p>
                </div>
                <div class="wishing-well-effects">
                    <h3>Available Effects</h3>
                    <div id="wishing-well-effects-list"></div>
                </div>
            </div>
        </section>`;
    }

    // Well level upgrade costs
    function getLevelUpCost() {
        return [0, 5, 15, 30][level] || Infinity; // Total effects triggered needed for level 2, 3, 4
    }

    function canLevelUp() {
        return level < 4 && effectTriggerCount >= getLevelUpCost();
    }

    function levelUp() {
        if (!canLevelUp()) return;
        level++;
        maxCoins += 5; // +5 max coins per level
        updateDisplay();
        renderEffects();
    }

    function renderEffects() {
        const container = document.getElementById('wishing-well-effects-list');
        if (!container) return;

        container.innerHTML = '';

        // Show level up button if available
        if (canLevelUp()) {
            const levelUpDiv = document.createElement('div');
            levelUpDiv.className = 'wishing-well-effect-item';
            const levelUpBtn = document.createElement('button');
            levelUpBtn.className = 'effect-button';
            levelUpBtn.setAttribute('aria-label', `Level up Wishing Well to level ${level + 1}. Requires ${getLevelUpCost()} total effects triggered.`);
            levelUpBtn.innerHTML = `
                <span class="effect-name">Level Up Well</span>
                <span class="effect-cost">Level ${level + 1}</span>
            `;
            levelUpBtn.addEventListener('click', levelUp);
            const levelDesc = document.createElement('p');
            levelDesc.className = 'effect-description';
            levelDesc.textContent = `Increase max coins to ${maxCoins + 5} and unlock new effects. Requires ${getLevelUpCost()} total effects triggered.`;
            levelUpDiv.appendChild(levelUpBtn);
            levelUpDiv.appendChild(levelDesc);
            container.appendChild(levelUpDiv);
        }

        // Only show purchasable effects (not backfire effects) that meet level requirement
        const purchasableEffects = effects.filter(e => !e.isBackfire && (!e.minLevel || level >= e.minLevel));

        purchasableEffects.forEach(effect => {
            const effectDiv = document.createElement('div');
            effectDiv.className = 'wishing-well-effect-item';

            const button = document.createElement('button');
            button.className = 'effect-button';
            button.disabled = coins < effect.cost || activeEffect !== null;
            button.setAttribute('aria-label', `${effect.name}, costs ${effect.cost} coins. ${effect.description}`);
            button.innerHTML = `
                <span class="effect-name">${effect.name}</span>
                <span class="effect-cost">${effect.cost} coins</span>
            `;
            button.addEventListener('click', () => triggerEffect(effect.id));

            const descP = document.createElement('p');
            descP.className = 'effect-description';
            descP.textContent = effect.description;

            effectDiv.appendChild(button);
            effectDiv.appendChild(descP);
            container.appendChild(effectDiv);
        });
    }

    function triggerEffect(effectId) {
        const effect = effects.find(e => e.id === effectId);
        if (!effect || effect.isBackfire) return;

        if (coins < effect.cost) {
            if (typeof showGameNotification === 'function') {
                showGameNotification('Not enough coins!', 'warning');
            }
            return;
        }

        if (activeEffect !== null) {
            if (typeof showGameNotification === 'function') {
                showGameNotification('An effect is already active!', 'warning');
            }
            return;
        }

        // Spend the coins
        spendCoins(effect.cost);

        // Check for backfire
        let finalEffect = effect;
        if (effect.backfireId && Math.random() < BACKFIRE_CHANCE) {
            finalEffect = effects.find(e => e.id === effect.backfireId);
            if (typeof showGameNotification === 'function') {
                showGameNotification('The well backfires! ' + finalEffect.name + ' activated.', 'warning');
            }
        } else {
            if (typeof showGameNotification === 'function') {
                showGameNotification(finalEffect.name + ' activated!', 'success');
            }
        }

        // Handle instant effects
        if (finalEffect.isInstant && finalEffect.apply) {
            finalEffect.apply();
            effectTriggerCount++;
            updateDisplay();
            renderEffects();
            return;
        }

        // Activate timed effect
        activateEffect(finalEffect);
    }

    function activateEffect(effect) {
        activeEffect = effect;
        effectTimeRemaining = effect.duration;
        mpsMultiplier = effect.multiplier || 1;
        mpcMultiplier = effect.mpcMultiplier !== undefined ? effect.mpcMultiplier : 1;
        effectTriggerCount++;

        // Recalculate MPS with new multiplier
        if (typeof recalculateMPS === 'function') {
            recalculateMPS();
        }

        updateActiveEffectDisplay();
        renderEffects(); // Update button states

        // Start countdown timer
        if (effectTimerId) {
            clearInterval(effectTimerId);
        }
        effectTimerId = setInterval(() => {
            effectTimeRemaining--;
            updateActiveEffectDisplay();

            if (effectTimeRemaining <= 0) {
                deactivateEffect();
            }
        }, 1000);
    }

    function deactivateEffect() {
        if (effectTimerId) {
            clearInterval(effectTimerId);
            effectTimerId = null;
        }

        const wasNegative = activeEffect && !activeEffect.isPositive;
        activeEffect = null;
        effectTimeRemaining = 0;
        mpsMultiplier = 1;
        mpcMultiplier = 1;

        // Recalculate MPS without effect
        if (typeof recalculateMPS === 'function') {
            recalculateMPS();
        }

        updateActiveEffectDisplay();
        renderEffects(); // Update button states

        if (typeof showGameNotification === 'function') {
            showGameNotification('Wishing Well effect has ended.', wasNegative ? 'success' : 'info');
        }
    }

    function updateActiveEffectDisplay() {
        const container = document.getElementById('wishing-well-active-effect');
        const nameEl = document.getElementById('active-effect-name');
        const timeEl = document.getElementById('active-effect-time');

        if (!container) return;

        if (activeEffect) {
            container.hidden = false;
            if (nameEl) nameEl.textContent = activeEffect.name;
            if (timeEl) timeEl.textContent = effectTimeRemaining;
        } else {
            container.hidden = true;
        }
    }

    function updateDisplay() {
        const coinsEl = document.getElementById('wishing-well-coins');
        const maxCoinsEl = document.getElementById('wishing-well-max-coins');
        const levelEl = document.getElementById('wishing-well-level');
        const triggerCountEl = document.getElementById('wishing-well-trigger-count');

        if (coinsEl) coinsEl.textContent = Math.floor(coins);
        if (maxCoinsEl) maxCoinsEl.textContent = maxCoins;
        if (levelEl) levelEl.textContent = level;
        if (triggerCountEl) triggerCountEl.textContent = effectTriggerCount;

        // Update effect button states without full re-render (prevents click stealing)
        const effectButtons = document.querySelectorAll('#wishing-well-effects-list .effect-button');
        effectButtons.forEach(btn => {
            // Find the effect by matching the button's text content
            const costSpan = btn.querySelector('.effect-cost');
            if (costSpan) {
                const costText = costSpan.textContent;
                const costMatch = costText.match(/(\d+)/);
                if (costMatch) {
                    const cost = parseInt(costMatch[1]);
                    btn.disabled = coins < cost || activeEffect !== null;
                }
            }
        });
    }

    function getMPSMultiplier() {
        return mpsMultiplier;
    }

    function getMPCMultiplier() {
        return mpcMultiplier;
    }

    function getEffectTriggerCount() {
        return effectTriggerCount;
    }

    function unlock() {
        isUnlocked = true;
    }

    function isWellUnlocked() {
        return isUnlocked;
    }

    function getCoins() {
        return coins;
    }

    function getMaxCoins() {
        return maxCoins;
    }

    function getLevel() {
        return level;
    }

    function loadState(savedState) {
        if (savedState) {
            coins = savedState.coins || 0;
            maxCoins = savedState.maxCoins || 15;
            level = savedState.level || 1;
            isUnlocked = savedState.isUnlocked || false;
            effectTriggerCount = savedState.effectTriggerCount || 0;
            // Note: Active effects are not saved - they reset on page load
        }
    }

    function getState() {
        return {
            coins: coins,
            maxCoins: maxCoins,
            level: level,
            isUnlocked: isUnlocked,
            effectTriggerCount: effectTriggerCount
        };
    }

    function reset() {
        coins = 0;
        maxCoins = 15;
        level = 1;
        isUnlocked = false;
        effectTriggerCount = 0;
        deactivateEffect();
    }

    return {
        getHTML,
        updateDisplay,
        renderEffects,
        unlock,
        isWellUnlocked,
        getCoins,
        getMaxCoins,
        getLevel,
        getMPSMultiplier,
        getMPCMultiplier,
        getEffectTriggerCount,
        addCoins,
        getCoinGenerationRate,
        loadState,
        getState,
        reset
    };
})();
