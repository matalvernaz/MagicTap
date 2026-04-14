// Challenges Module - Special prestige runs with restrictions and permanent rewards
const ChallengesModule = (function() {
    // Challenge definitions
    const challenges = [
        {
            id: 'blind-tap',
            name: 'Blind Tap',
            description: 'Buildings produce nothing. Reach 10,000 Mana by clicking alone.',
            restriction: 'All building production is disabled.',
            reward: 'Permanent +50% Mana per click.',
            rewardDescription: '+50% MPC',
            goal: 10000,
            isCompleted: false,
            apply: function() {
                // Handled in recalculateMPS — check ChallengesModule.isRestrictionActive('no-buildings')
            },
            restrictionType: 'no-buildings',
            rewardEffect: { type: 'mpcMultiplier', value: 1.5 }
        },
        {
            id: 'lone-hand',
            name: 'Lone Hand',
            description: 'Only Wizard\'s Hands can be purchased. Reach 100,000 Mana.',
            restriction: 'Only Wizard\'s Hand buildings are available.',
            reward: 'Wizard\'s Hands permanently produce x3.',
            rewardDescription: 'Wizard\'s Hand x3',
            goal: 100000,
            isCompleted: false,
            restrictionType: 'single-building',
            restrictedBuildingId: 'wizards-hand',
            rewardEffect: { type: 'buildingMultiplier', buildingId: 'wizards-hand', value: 3 }
        },
        {
            id: 'drought',
            name: 'Drought',
            description: 'All production is halved. Reach 1,000,000 Mana.',
            restriction: 'All Mana per second is reduced by 50%.',
            reward: 'Permanent +25% MPS.',
            rewardDescription: '+25% MPS',
            goal: 1000000,
            isCompleted: false,
            restrictionType: 'half-production',
            rewardEffect: { type: 'mpsMultiplier', value: 1.25 }
        },
        {
            id: 'no-upgrades',
            name: 'Raw Power',
            description: 'Upgrades cannot be purchased. Reach 500,000 Mana.',
            restriction: 'No upgrades can be bought this run.',
            reward: 'All buildings permanently cost 5% less.',
            rewardDescription: '-5% building costs',
            goal: 500000,
            isCompleted: false,
            restrictionType: 'no-upgrades',
            rewardEffect: { type: 'buildingCostReduction', value: 0.95 }
        },
        {
            id: 'diminishing',
            name: 'Diminishing Returns',
            description: 'Building costs increase 50% faster. Reach 5,000,000 Mana.',
            restriction: 'Building cost scaling is 1.225x instead of 1.15x.',
            reward: 'Permanent +15% MPS.',
            rewardDescription: '+15% MPS',
            goal: 5000000,
            isCompleted: false,
            restrictionType: 'expensive-buildings',
            rewardEffect: { type: 'mpsMultiplier', value: 1.15 }
        },
        {
            id: 'speed-demon',
            name: 'Speed Demon',
            description: 'Reach 10,000,000 Mana in under 15 minutes of this run.',
            restriction: 'You have 15 minutes. Timer starts when the run begins.',
            reward: 'Permanent +20% MPS and +20% MPC.',
            rewardDescription: '+20% MPS & MPC',
            goal: 10000000,
            timeLimit: 900, // 15 minutes in seconds
            isCompleted: false,
            restrictionType: 'timed',
            rewardEffect: { type: 'both', mpsValue: 1.20, mpcValue: 1.20 }
        }
    ];

    // Active challenge state
    let activeChallenge = null;
    let challengeStartTime = 0;
    let challengeElapsed = 0;

    function getHTML() {
        return `
        <section id="challenges-panel" class="game-panel" hidden>
            <h2 id="challenges-heading" tabindex="-1">Ascension Challenges</h2>
            <div id="challenges-container" aria-labelledby="challenges-heading">
                <p class="challenges-info">Complete challenges during prestige runs for permanent bonuses. Select a challenge, then prestige to begin.</p>
                <div id="active-challenge-display" hidden>
                    <div class="active-challenge-banner" role="status">
                        <p><strong>Active Challenge:</strong> <span id="active-challenge-name"></span></p>
                        <p id="active-challenge-progress"></p>
                        <p id="active-challenge-timer" hidden></p>
                        <button id="abandon-challenge-button" aria-label="Abandon the current challenge without reward">Abandon Challenge</button>
                    </div>
                </div>
                <div id="challenges-list" role="list" aria-label="Available challenges"></div>
            </div>
        </section>`;
    }

    function init() {
        renderChallenges();

        const abandonBtn = document.getElementById('abandon-challenge-button');
        if (abandonBtn) {
            abandonBtn.addEventListener('click', abandonChallenge);
        }
    }

    function renderChallenges() {
        const container = document.getElementById('challenges-list');
        if (!container) return;

        container.innerHTML = '';

        challenges.forEach(challenge => {
            const div = document.createElement('div');
            div.className = 'challenge-item' + (challenge.isCompleted ? ' completed' : '');
            div.setAttribute('role', 'listitem');

            const isActive = activeChallenge && activeChallenge.id === challenge.id;
            const canStart = !activeChallenge && !challenge.isCompleted;

            div.innerHTML = `
                <div class="challenge-header">
                    <p class="challenge-name">${challenge.name}${challenge.isCompleted ? ' (Completed)' : ''}</p>
                    <p class="challenge-reward-badge">${challenge.rewardDescription}</p>
                </div>
                <p class="challenge-description">${challenge.description}</p>
                <p class="challenge-restriction">${challenge.restriction}</p>
                <p class="challenge-reward">Reward: ${challenge.reward}</p>
                ${isActive ? '<p class="challenge-active-label">Currently Active</p>' : ''}
                ${canStart ? `<button class="start-challenge-button" data-challenge-id="${challenge.id}" aria-label="Start ${challenge.name} challenge. ${challenge.description}">Start Challenge</button>` : ''}
            `;

            container.appendChild(div);
        });

        // Add event listeners for start buttons
        container.querySelectorAll('.start-challenge-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const challengeId = e.target.dataset.challengeId;
                startChallenge(challengeId);
            });
        });

        updateActiveDisplay();
    }

    function startChallenge(challengeId) {
        const challenge = challenges.find(c => c.id === challengeId);
        if (!challenge || challenge.isCompleted || activeChallenge) return;

        activeChallenge = challenge;
        challengeStartTime = Date.now();
        challengeElapsed = 0;

        // Announce to screen reader
        const notificationArea = document.getElementById('notification-area');
        if (notificationArea) {
            const announcement = document.createElement('span');
            announcement.className = 'sr-only';
            announcement.setAttribute('role', 'alert');
            announcement.textContent = `Challenge started: ${challenge.name}. ${challenge.restriction}`;
            notificationArea.appendChild(announcement);
            setTimeout(() => announcement.remove(), 3000);
        }

        // Apply restrictions
        if (typeof recalculateMPS === 'function') recalculateMPS();
        if (typeof renderBuildings === 'function') renderBuildings();

        renderChallenges();
        updateActiveDisplay();

        // Save immediately
        if (typeof SaveManager !== 'undefined') SaveManager.save();
    }

    function abandonChallenge() {
        if (!activeChallenge) return;

        const name = activeChallenge.name;
        activeChallenge = null;
        challengeStartTime = 0;
        challengeElapsed = 0;

        if (typeof recalculateMPS === 'function') recalculateMPS();
        if (typeof renderBuildings === 'function') renderBuildings();

        renderChallenges();
        updateActiveDisplay();

        // Announce
        const notificationArea = document.getElementById('notification-area');
        if (notificationArea) {
            const announcement = document.createElement('span');
            announcement.className = 'sr-only';
            announcement.setAttribute('role', 'alert');
            announcement.textContent = `Challenge abandoned: ${name}.`;
            notificationArea.appendChild(announcement);
            setTimeout(() => announcement.remove(), 3000);
        }
    }

    function completeChallenge() {
        if (!activeChallenge) return;

        activeChallenge.isCompleted = true;
        const name = activeChallenge.name;
        const reward = activeChallenge.reward;

        activeChallenge = null;
        challengeStartTime = 0;
        challengeElapsed = 0;

        if (typeof recalculateMPS === 'function') recalculateMPS();

        renderChallenges();
        updateActiveDisplay();

        // Show completion notification
        const notificationArea = document.getElementById('notification-area');
        if (notificationArea) {
            const announcement = document.createElement('span');
            announcement.className = 'sr-only';
            announcement.setAttribute('role', 'alert');
            announcement.textContent = `Challenge completed: ${name}! Reward: ${reward}`;
            notificationArea.appendChild(announcement);
            setTimeout(() => announcement.remove(), 3000);

            const notification = document.createElement('div');
            notification.className = 'notification challenge-complete-notification';
            notification.setAttribute('role', 'region');
            notification.setAttribute('aria-label', 'Challenge completed');

            const dismissBtn = document.createElement('button');
            dismissBtn.className = 'notification-dismiss';
            dismissBtn.setAttribute('aria-label', 'Dismiss');
            dismissBtn.textContent = 'X';
            dismissBtn.addEventListener('click', () => notification.remove());

            const title = document.createElement('p');
            title.className = 'notification-title';
            title.textContent = 'Challenge Completed!';

            const content = document.createElement('p');
            content.className = 'notification-content';
            content.textContent = `${name} — ${reward}`;

            notification.appendChild(dismissBtn);
            notification.appendChild(title);
            notification.appendChild(content);
            notificationArea.appendChild(notification);

            setTimeout(() => { if (notification.parentNode) notification.remove(); }, 20000);
        }

        // Save
        if (typeof SaveManager !== 'undefined') SaveManager.save();
    }

    function updateActiveDisplay() {
        const display = document.getElementById('active-challenge-display');
        if (!display) return;

        if (activeChallenge) {
            display.hidden = false;
            const nameEl = document.getElementById('active-challenge-name');
            if (nameEl) nameEl.textContent = activeChallenge.name;
        } else {
            display.hidden = true;
        }
    }

    // Called from game loop to check progress and update timer
    function update() {
        if (!activeChallenge) return;

        // Update timer for timed challenges
        if (activeChallenge.timeLimit) {
            challengeElapsed = (Date.now() - challengeStartTime) / 1000;
            const remaining = activeChallenge.timeLimit - challengeElapsed;
            const timerEl = document.getElementById('active-challenge-timer');
            if (timerEl) {
                timerEl.hidden = false;
                if (remaining <= 0) {
                    timerEl.textContent = 'Time expired!';
                    // Auto-abandon timed challenge on expiry
                    abandonChallenge();
                    return;
                }
                const min = Math.floor(remaining / 60);
                const sec = Math.floor(remaining % 60);
                timerEl.textContent = `Time remaining: ${min}m ${sec.toString().padStart(2, '0')}s`;
            }
        }

        // Check goal completion
        const progressEl = document.getElementById('active-challenge-progress');
        if (progressEl) {
            const currentMana = typeof StatisticsModule !== 'undefined' ? StatisticsModule.getStats().currentMana : 0;
            const pct = Math.min(100, (currentMana / activeChallenge.goal) * 100);
            progressEl.textContent = `Progress: ${OptionsModule.formatNumber(Math.floor(currentMana))} / ${OptionsModule.formatNumber(activeChallenge.goal)} Mana (${pct.toFixed(1)}%)`;

            if (currentMana >= activeChallenge.goal) {
                completeChallenge();
            }
        }
    }

    // --- Restriction checks (called by game systems) ---
    function isRestrictionActive(type) {
        return activeChallenge && activeChallenge.restrictionType === type;
    }

    function isBuildingRestricted(buildingId) {
        if (!activeChallenge) return false;
        if (activeChallenge.restrictionType === 'no-buildings') return true;
        if (activeChallenge.restrictionType === 'single-building') {
            return buildingId !== activeChallenge.restrictedBuildingId;
        }
        return false;
    }

    function isUpgradeRestricted() {
        return isRestrictionActive('no-upgrades');
    }

    function getProductionMultiplier() {
        if (!activeChallenge) return 1;
        if (activeChallenge.restrictionType === 'no-buildings') return 0;
        if (activeChallenge.restrictionType === 'half-production') return 0.5;
        return 1;
    }

    function getBuildingCostExponent() {
        if (isRestrictionActive('expensive-buildings')) return 1.225;
        return null; // Use default 1.15
    }

    // --- Permanent reward bonuses (always active, from completed challenges) ---
    function getMPCMultiplier() {
        let mult = 1;
        challenges.forEach(c => {
            if (!c.isCompleted) return;
            if (c.rewardEffect.type === 'mpcMultiplier') mult *= c.rewardEffect.value;
            if (c.rewardEffect.type === 'both') mult *= c.rewardEffect.mpcValue;
        });
        return mult;
    }

    function getMPSMultiplier() {
        let mult = 1;
        challenges.forEach(c => {
            if (!c.isCompleted) return;
            if (c.rewardEffect.type === 'mpsMultiplier') mult *= c.rewardEffect.value;
            if (c.rewardEffect.type === 'both') mult *= c.rewardEffect.mpsValue;
        });
        return mult;
    }

    function getBuildingCostMultiplier() {
        let mult = 1;
        challenges.forEach(c => {
            if (c.isCompleted && c.rewardEffect.type === 'buildingCostReduction') {
                mult *= c.rewardEffect.value;
            }
        });
        return mult;
    }

    function getBuildingProductionMultiplier(buildingId) {
        let mult = 1;
        challenges.forEach(c => {
            if (c.isCompleted && c.rewardEffect.type === 'buildingMultiplier' && c.rewardEffect.buildingId === buildingId) {
                mult *= c.rewardEffect.value;
            }
        });
        return mult;
    }

    function isActive() {
        return activeChallenge !== null;
    }

    function getActiveChallenge() {
        return activeChallenge;
    }

    // --- Save/Load ---
    function getSaveData() {
        return {
            completedChallenges: challenges.filter(c => c.isCompleted).map(c => c.id),
            activeChallenge: activeChallenge ? activeChallenge.id : null,
            challengeStartTime: challengeStartTime
        };
    }

    function loadSaveData(data) {
        if (!data) return;
        if (data.completedChallenges) {
            data.completedChallenges.forEach(id => {
                const c = challenges.find(ch => ch.id === id);
                if (c) c.isCompleted = true;
            });
        }
        if (data.activeChallenge) {
            const c = challenges.find(ch => ch.id === data.activeChallenge);
            if (c && !c.isCompleted) {
                activeChallenge = c;
                challengeStartTime = data.challengeStartTime || Date.now();
            }
        }
        renderChallenges();
        updateActiveDisplay();
    }

    // Reset on prestige (keep completed, clear active)
    function resetForPrestige() {
        activeChallenge = null;
        challengeStartTime = 0;
        challengeElapsed = 0;
        updateActiveDisplay();
    }

    function reset() {
        challenges.forEach(c => c.isCompleted = false);
        activeChallenge = null;
        challengeStartTime = 0;
        challengeElapsed = 0;
    }

    return {
        getHTML,
        init,
        update,
        renderChallenges,
        isRestrictionActive,
        isBuildingRestricted,
        isUpgradeRestricted,
        getProductionMultiplier,
        getBuildingCostExponent,
        getMPCMultiplier,
        getMPSMultiplier,
        getBuildingCostMultiplier,
        getBuildingProductionMultiplier,
        isActive,
        getActiveChallenge,
        getSaveData,
        loadSaveData,
        resetForPrestige,
        reset
    };
})();
