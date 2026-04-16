// Wizard Rank Module - Magic Proficiency System
const WizardRankModule = (function() {
    // Rank thresholds (scaled to ~200 total achievements)
    const ranks = [
        { name: 'Mana-Blind', minAchievements: 0 },
        { name: 'Initiate', minAchievements: 3 },
        { name: 'Novice', minAchievements: 7 },
        { name: 'Apprentice', minAchievements: 12 },
        { name: 'Journeyman', minAchievements: 18 },
        { name: 'Adept', minAchievements: 24 },
        { name: 'Sorcerer', minAchievements: 30 },
        { name: 'Witch', minAchievements: 36 },
        { name: 'Warlock', minAchievements: 42 },
        { name: 'Enchanter', minAchievements: 48 },
        { name: 'Wizard', minAchievements: 54 },
        { name: 'Magician', minAchievements: 60 },
        { name: 'Dark Magician', minAchievements: 66 },
        { name: 'White Magician', minAchievements: 72 },
        { name: 'Conjurer', minAchievements: 78 },
        { name: 'Diviner', minAchievements: 84 },
        { name: 'Ritualist', minAchievements: 90 },
        { name: 'Enchantress', minAchievements: 95 },
        { name: 'Abjurer', minAchievements: 100 },
        { name: 'Illusionist', minAchievements: 105 },
        { name: 'Transmuter', minAchievements: 110 },
        { name: 'Alchemist', minAchievements: 115 },
        { name: 'Summoner', minAchievements: 120 },
        { name: 'Necromancer', minAchievements: 125 },
        { name: 'Evoker', minAchievements: 130 },
        { name: 'Magus', minAchievements: 135 },
        { name: 'Fire Magus', minAchievements: 139 },
        { name: 'Water Magus', minAchievements: 143 },
        { name: 'Air Magus', minAchievements: 147 },
        { name: 'Earth Magus', minAchievements: 151 },
        { name: 'Ice Magus', minAchievements: 155 },
        { name: 'Stone Magus', minAchievements: 159 },
        { name: 'Lightning Magus', minAchievements: 163 },
        { name: 'Arch Magus', minAchievements: 168 },
        { name: 'Grand Magus', minAchievements: 173 },
        { name: 'Void Magus', minAchievements: 178 },
        { name: 'Archmage', minAchievements: 190 },
        { name: 'Arcane Weaver', minAchievements: 197 },
        { name: 'Eldritch', minAchievements: 204 },
        { name: 'Deity', minAchievements: 210 },
        { name: 'Living Spell', minAchievements: 215 }
    ];

    // Calculate Magic Proficiency (4% per achievement)
    function getMagicProficiency() {
        const achievementCount = AchievementsModule.getEarnedCount();
        return achievementCount * 4;
    }

    // Get current rank based on achievements earned
    function getCurrentRank() {
        const achievementCount = AchievementsModule.getEarnedCount();
        let currentRank = ranks[0];

        for (let i = ranks.length - 1; i >= 0; i--) {
            if (achievementCount >= ranks[i].minAchievements) {
                currentRank = ranks[i];
                break;
            }
        }

        return currentRank;
    }

    // Get next rank (for progress display)
    function getNextRank() {
        const achievementCount = AchievementsModule.getEarnedCount();

        for (let i = 0; i < ranks.length; i++) {
            if (achievementCount < ranks[i].minAchievements) {
                return ranks[i];
            }
        }

        return null; // Max rank reached
    }

    // Get progress to next rank
    function getProgressToNextRank() {
        const achievementCount = AchievementsModule.getEarnedCount();
        const currentRank = getCurrentRank();
        const nextRank = getNextRank();

        if (!nextRank) {
            return { current: achievementCount, needed: achievementCount, percent: 100 };
        }

        const currentMin = currentRank.minAchievements;
        const nextMin = nextRank.minAchievements;
        const progress = achievementCount - currentMin;
        const total = nextMin - currentMin;
        const percent = Math.floor((progress / total) * 100);

        return {
            current: achievementCount,
            needed: nextMin,
            remaining: nextMin - achievementCount,
            percent: percent
        };
    }

    // Update the rank display
    function updateDisplay() {
        const rankNameEl = document.getElementById('wizard-rank-name');
        const proficiencyEl = document.getElementById('magic-proficiency');
        const progressEl = document.getElementById('rank-progress');

        const currentRank = getCurrentRank();
        const proficiency = getMagicProficiency();
        const progress = getProgressToNextRank();
        const nextRank = getNextRank();

        if (rankNameEl) {
            rankNameEl.textContent = currentRank.name;
        }

        if (proficiencyEl) {
            proficiencyEl.textContent = proficiency + '%';
        }

        if (progressEl) {
            if (nextRank) {
                progressEl.textContent = progress.remaining + ' achievements until ' + nextRank.name;
            } else {
                progressEl.textContent = 'Maximum rank achieved!';
            }
        }
    }

    // Get all ranks (for display purposes)
    function getAllRanks() {
        return ranks;
    }

    // Look up the rank name that corresponds to an arbitrary achievement count.
    // Used by the Ranking Upgrades panel to show "Requires [RankName] rank".
    function getRankNameForCount(count) {
        let name = ranks[0].name;
        for (let i = ranks.length - 1; i >= 0; i--) {
            if (count <= ranks[i].minAchievements) {
                name = ranks[i].name;
            }
        }
        return name;
    }

    return {
        getMagicProficiency,
        getCurrentRank,
        getNextRank,
        getProgressToNextRank,
        updateDisplay,
        getAllRanks,
        getRankNameForCount
    };
})();
