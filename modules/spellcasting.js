// Spellcasting Module
const SpellcastingModule = (function() {
    // Spell Power state
    let spellPower = 0;
    const MAX_SPELL_POWER = 25;
    const SPELL_POWER_REGEN_RATE = 0.1; // Per second

    // Active spell effects
    let activeSpells = [];

    // Spell definitions
    const spells = [
        {
            id: 'haste',
            name: 'Haste',
            description: 'Mana per click increased by 5x for 60 seconds.',
            cost: 5,
            duration: 60,
            effect: {
                type: 'mpcMultiplier',
                value: 5
            }
        },
        {
            id: 'dexterity',
            name: 'Dexterity',
            description: 'Mana per click doubled for 45 seconds.',
            cost: 3,
            duration: 45,
            effect: {
                type: 'mpcMultiplier',
                value: 2
            }
        },
        {
            id: 'stone-shape',
            name: 'Stone Shape',
            description: 'Buildings cost 4% less for 60 seconds.',
            cost: 4,
            duration: 60,
            effect: {
                type: 'buildingCostReduction',
                value: 0.04
            }
        },
        {
            id: 'mana-surge',
            name: 'Mana Surge',
            description: 'Mana per second doubled for 60 seconds.',
            cost: 6,
            duration: 60,
            effect: {
                type: 'mpsMultiplier',
                value: 2
            }
        },
        {
            id: 'click-sacrifices',
            name: 'Click Sacrifices',
            description: 'MPS increased by 7x, but MPC halved for 90 seconds.',
            cost: 8,
            duration: 90,
            effect: {
                type: 'clickSacrifices',
                mpsMultiplier: 7,
                mpcMultiplier: 0.5
            }
        },
        {
            id: 'golden-eye',
            name: 'Golden Eye',
            description: 'Wishing Well coins gain doubled for 30 seconds.',
            cost: 4,
            duration: 30,
            effect: {
                type: 'wishingWellBonus',
                value: 2
            }
        },
        {
            id: 'rune-cast',
            name: 'Rune Cast',
            description: 'Summon a Runestone of a random color.',
            cost: 10,
            duration: 0, // Instant
            effect: {
                type: 'summonRunestone'
            }
        },
        {
            id: 'arcane-legibility',
            name: 'Arcane Legibility',
            description: 'Upgrades cost 2% less for 45 seconds.',
            cost: 3,
            duration: 45,
            effect: {
                type: 'upgradeCostReduction',
                value: 0.02
            }
        }
    ];

    // Get current MPC multiplier from active spells
    function getMPCMultiplier() {
        let multiplier = 1;
        activeSpells.forEach(active => {
            const spell = spells.find(s => s.id === active.spellId);
            if (spell) {
                if (spell.effect.type === 'mpcMultiplier') {
                    multiplier *= spell.effect.value;
                } else if (spell.effect.type === 'clickSacrifices') {
                    multiplier *= spell.effect.mpcMultiplier;
                }
            }
        });
        return multiplier;
    }

    // Get current MPS multiplier from active spells
    function getMPSMultiplier() {
        let multiplier = 1;
        activeSpells.forEach(active => {
            const spell = spells.find(s => s.id === active.spellId);
            if (spell) {
                if (spell.effect.type === 'mpsMultiplier') {
                    multiplier *= spell.effect.value;
                } else if (spell.effect.type === 'clickSacrifices') {
                    multiplier *= spell.effect.mpsMultiplier;
                }
            }
        });
        return multiplier;
    }

    // Get building cost multiplier from active spells
    function getBuildingCostMultiplier() {
        let multiplier = 1;
        activeSpells.forEach(active => {
            const spell = spells.find(s => s.id === active.spellId);
            if (spell && spell.effect.type === 'buildingCostReduction') {
                multiplier *= (1 - spell.effect.value);
            }
        });
        return multiplier;
    }

    // Get upgrade cost multiplier from active spells
    function getUpgradeCostMultiplier() {
        let multiplier = 1;
        activeSpells.forEach(active => {
            const spell = spells.find(s => s.id === active.spellId);
            if (spell && spell.effect.type === 'upgradeCostReduction') {
                multiplier *= (1 - spell.effect.value);
            }
        });
        return multiplier;
    }

    // Get Wishing Well bonus multiplier from active spells
    function getWishingWellMultiplier() {
        let multiplier = 1;
        activeSpells.forEach(active => {
            const spell = spells.find(s => s.id === active.spellId);
            if (spell && spell.effect.type === 'wishingWellBonus') {
                multiplier *= spell.effect.value;
            }
        });
        return multiplier;
    }

    // Cast a spell
    function castSpell(spellId) {
        const spell = spells.find(s => s.id === spellId);
        if (!spell) return false;

        if (spellPower < spell.cost) {
            return false;
        }

        // Deduct spell power
        spellPower -= spell.cost;

        // Handle instant spells
        if (spell.effect.type === 'summonRunestone') {
            if (typeof RunestonesModule !== 'undefined') {
                RunestonesModule.spawnRunestone();
            }
            updateDisplay();
            return true;
        }

        // Check if this spell type is already active
        const existingIndex = activeSpells.findIndex(a => a.spellId === spellId);
        if (existingIndex >= 0) {
            // Refresh duration
            activeSpells[existingIndex].remainingTime = spell.duration;
        } else {
            // Add new active spell
            activeSpells.push({
                spellId: spellId,
                remainingTime: spell.duration
            });
        }

        // Recalculate game values
        if (typeof recalculateMPS === 'function') {
            recalculateMPS();
        }

        updateDisplay();
        renderActiveSpells();
        return true;
    }

    // Update spell timers (called every 100ms from game loop)
    function update(deltaSeconds) {
        // Regenerate spell power (with optional prestige boost)
        if (spellPower < MAX_SPELL_POWER) {
            let regenRate = SPELL_POWER_REGEN_RATE;
            if (typeof PrestigeModule !== 'undefined' && PrestigeModule.hasSpellRegenBoost && PrestigeModule.hasSpellRegenBoost()) {
                regenRate *= 1.5;
            }
            spellPower = Math.min(MAX_SPELL_POWER, spellPower + regenRate * deltaSeconds);
        }

        // Update active spell durations
        let spellExpired = false;
        activeSpells = activeSpells.filter(active => {
            active.remainingTime -= deltaSeconds;
            if (active.remainingTime <= 0) {
                spellExpired = true;
                return false;
            }
            return true;
        });

        // Recalculate if a spell expired
        if (spellExpired) {
            if (typeof recalculateMPS === 'function') {
                recalculateMPS();
            }
            renderActiveSpells();
        }
    }

    // Update the spell power display
    function updateDisplay() {
        const powerDisplay = document.getElementById('spell-power-display');
        if (powerDisplay) {
            powerDisplay.textContent = `${Math.floor(spellPower)} / ${MAX_SPELL_POWER}`;
        }

        const powerBar = document.getElementById('spell-power-bar');
        if (powerBar) {
            powerBar.style.width = `${(spellPower / MAX_SPELL_POWER) * 100}%`;
        }

        // Update spell button states
        spells.forEach(spell => {
            const btn = document.getElementById(`cast-${spell.id}`);
            if (btn) {
                btn.disabled = spellPower < spell.cost;
            }
        });
    }

    // Render active spell effects
    function renderActiveSpells() {
        const container = document.getElementById('active-spells-container');
        if (!container) return;

        if (activeSpells.length === 0) {
            container.innerHTML = '<p class="no-active-spells">No active spells</p>';
            return;
        }

        container.innerHTML = activeSpells.map(active => {
            const spell = spells.find(s => s.id === active.spellId);
            if (!spell) return '';
            return `
                <div class="active-spell">
                    <span class="active-spell-name">${spell.name}</span>
                    <span class="active-spell-time">${Math.ceil(active.remainingTime)}s</span>
                </div>
            `;
        }).join('');
    }

    // Render the spells list
    function renderSpells() {
        const container = document.getElementById('spells-list-container');
        if (!container) return;

        container.innerHTML = spells.map(spell => `
            <div class="spell-item" id="spell-${spell.id}">
                <div class="spell-info">
                    <p class="spell-name">${spell.name}</p>
                    <p class="spell-description">${spell.description}</p>
                    <p class="spell-cost">Cost: ${spell.cost} Spell Power</p>
                </div>
                <button id="cast-${spell.id}" class="cast-spell-button" ${spellPower < spell.cost ? 'disabled' : ''}>
                    Cast
                </button>
            </div>
        `).join('');

        // Add event listeners
        spells.forEach(spell => {
            const btn = document.getElementById(`cast-${spell.id}`);
            if (btn) {
                btn.addEventListener('click', () => castSpell(spell.id));
            }
        });
    }

    function getHTML() {
        return `
        <section id="spellcasting-panel" class="game-panel" hidden>
            <h2 id="spellcasting-heading" tabindex="-1">Spellcasting</h2>
            <div id="spellcasting-container" aria-labelledby="spellcasting-heading">
                <div class="spell-power-section">
                    <p class="spell-power-label">Spell Power: <span id="spell-power-display">0 / 25</span></p>
                    <div class="spell-power-bar-container">
                        <div id="spell-power-bar" class="spell-power-bar"></div>
                    </div>
                </div>
                <div class="active-spells-section">
                    <h3>Active Spells</h3>
                    <div id="active-spells-container">
                        <p class="no-active-spells">No active spells</p>
                    </div>
                </div>
                <div class="spells-list-section">
                    <h3>Available Spells</h3>
                    <div id="spells-list-container"></div>
                </div>
            </div>
        </section>`;
    }

    function init() {
        // Add panel HTML
        const panelsContainer = document.getElementById('panels-container');
        if (panelsContainer) {
            panelsContainer.insertAdjacentHTML('beforeend', getHTML());
        }

        renderSpells();
        updateDisplay();
        renderActiveSpells();
    }

    // Save data
    function getSaveData() {
        return {
            spellPower: spellPower,
            activeSpells: activeSpells
        };
    }

    // Load data
    function loadSaveData(data) {
        if (!data) return;
        if (typeof data.spellPower === 'number') {
            spellPower = data.spellPower;
        }
        if (Array.isArray(data.activeSpells)) {
            activeSpells = data.activeSpells;
        }
        updateDisplay();
        renderActiveSpells();
    }

    // Reset for prestige
    function reset() {
        activeSpells = [];
        // Don't reset spell power - it persists
        updateDisplay();
        renderActiveSpells();
    }

    return {
        init,
        update,
        updateDisplay,
        castSpell,
        getMPCMultiplier,
        getMPSMultiplier,
        getBuildingCostMultiplier,
        getUpgradeCostMultiplier,
        getWishingWellMultiplier,
        getSaveData,
        loadSaveData,
        reset,
        getHTML
    };
})();
