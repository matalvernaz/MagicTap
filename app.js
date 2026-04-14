const VERSION = '0.8';

let mana = 0;
let manaPerClick = 1;
let manaPerSecond = 0;

const manaDisplay = document.getElementById('mana-display');
const mpsDisplay = document.getElementById('mps-display');
const mpcDisplay = document.getElementById('mpc-display');
const gatherManaButton = document.getElementById('gather-mana-button');
const buildingsContainer = document.getElementById('buildings-container');
const upgradesContainer = document.getElementById('upgrades-container'); // Get upgrades container
const eventsLog = document.getElementById('events-log');
const purchasedUpgradesContainer = document.getElementById('purchased-upgrades-container');
const purchasedUpgradesPanel = document.getElementById('purchased-upgrades-panel');
const purchasedUpgradesHeading = document.getElementById('purchased-upgrades-heading');
const panelsContainer = document.getElementById('panels-container');

// Track mana per click bonus from upgrades (base is 1)
let baseManaPerClick = 1;
let manaPerClickFromUpgrades = 0;
let mpsFromUpgrades = 0;
let mpsUpgradeMultiplier = 1; // Multiplier from upgrades that boost all MPS
let proficiencyUpgradeCount = 0; // Count of kitten-style upgrades that scale with Magic Proficiency
let bulkBuyAmount = 1; // 1, 10, 100, or -1 for max

// --- Initialize Panels ---
function initializePanels() {
    // Insert panel HTML into the panels container
    panelsContainer.innerHTML =
        StatisticsModule.getHTML() +
        AchievementsModule.getHTML() +
        RankingUpgradesModule.getHTML() +
        ProductionModule.getHTML() +
        PrestigeModule.getHTML() +
        WishingWellModule.getHTML() +
        ChangelogModule.getHTML() +
        OptionsModule.getHTML();

    // Initialize modules that need it
    OptionsModule.init();
    PrestigeModule.init();
    RankingUpgradesModule.init();
    ChangelogModule.renderChangelog();
    AchievementsModule.renderAchievements();
}

// Navigation buttons - will be populated after panels are initialized
let navButtons = {};

// --- Game Data Structures ---
const buildings = [
    {
        id: 'wizards-hand',
        name: 'Wizard\'s Hand',
        description: 'Generates 0.1 Mana per second.',
        flavorText: 'A spectral hand that gathers ambient mana from the air.',
        baseCost: 10,
        baseProduction: 0.1,
        productionPerSecond: 0.1,
        owned: 0,
        unlockCondition: () => true,
        isUnlocked: true,
        element: null
    },
    {
        id: 'wizards-eye',
        name: 'Wizard\'s Eye',
        description: 'Generates 0.5 Mana per second.',
        flavorText: 'One must see power, to be able to grasp it.',
        baseCost: 50,
        baseProduction: 0.5,
        productionPerSecond: 0.5,
        owned: 0,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-sight').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'magus',
        name: 'Magus',
        description: 'Casts spells to generate Mana.',
        flavorText: 'Practitioners of the arcane who go by far too many names.',
        baseCost: 550,
        baseProduction: 2,
        productionPerSecond: 2,
        owned: 0,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-schools').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'ley-line',
        name: 'Ley Line',
        description: 'Draw upon the planet to gain Mana.',
        flavorText: 'Draws raw Mana from within the planet.',
        baseCost: 1550,
        baseProduction: 15,
        productionPerSecond: 15,
        owned: 0,
        unlockCondition: () => upgrades.find(u => u.id === 'ley-lines').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'mana-crystal',
        name: 'Mana Crystal',
        description: 'Crystallize raw Mana into a refined form for 38 Mana per second.',
        flavorText: 'Mana, refined into a tangible form.',
        baseCost: 21750,
        baseProduction: 38,
        productionPerSecond: 38,
        owned: 0,
        unlockCondition: () => mana >= 17500,
        isUnlocked: false,
        element: null
    },
    {
        id: 'mana-manipulator',
        name: 'Mana Manipulator',
        description: 'Utilize lost Mana manipulation techniques to bring Mana into this world.',
        flavorText: 'These devices were used to manipulate Mana. Why they were lost, and considered forbidden is still a mystery to you.',
        baseCost: 134000,
        baseProduction: 98,
        productionPerSecond: 98,
        owned: 0,
        unlockCondition: () => upgrades.find(u => u.id === 'advanced-mana-manipulation-techniques')?.isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'mana-shard',
        name: 'Mana Shard',
        description: 'Light reflects from these shards, becoming raw magic.',
        flavorText: 'Shards of pure magic.',
        baseCost: 490000,
        baseProduction: 200,
        productionPerSecond: 200,
        owned: 0,
        unlockCondition: () => mana >= 350000,
        isUnlocked: false,
        element: null
    },
    {
        id: 'mana-fountain',
        name: 'Mana Fountain',
        description: 'Discover Mana flowing within the planet.',
        flavorText: 'Natural wellsprings of pure magical energy.',
        baseCost: 20000000,
        baseProduction: 2900,
        productionPerSecond: 2900,
        owned: 0,
        unlockCondition: () => mana >= 13000000,
        isUnlocked: false,
        element: null
    },
    {
        id: 'church-of-mana',
        name: 'Church of Mana',
        description: 'Worship the weave for boons from the weave.',
        flavorText: 'The weave is the foremost on magic, so you must learn from it what your mortal mind can.',
        baseCost: 70000000,
        baseProduction: 12500,
        productionPerSecond: 12500,
        owned: 0,
        unlockCondition: () => mana >= 55000000,
        isUnlocked: false,
        element: null
    },
    {
        id: 'mages-guild',
        name: 'Mages\' Guild',
        description: 'Magi come together to share mystical knowledge.',
        flavorText: 'A grand structure dedicated to learning magic from others.',
        baseCost: 450000000,
        baseProduction: 125000,
        productionPerSecond: 125000,
        owned: 0,
        unlockCondition: () => mana >= 100000000,
        isUnlocked: false,
        element: null
    },
    {
        id: 'magic-library',
        name: 'Magic Library',
        description: 'Ancient tomes give you knowledge of ways to secure more Mana.',
        flavorText: 'A home for all tomes magical, including forbidden texts.',
        baseCost: 1400000000,
        baseProduction: 5500000,
        productionPerSecond: 5500000,
        owned: 0,
        unlockCondition: () => mana >= 950000000,
        isUnlocked: false,
        element: null
    },
    {
        id: 'magic-spire',
        name: 'Magic Spire',
        description: 'A towering structure that pierces the veil between realms, drawing Mana from other planes.',
        flavorText: 'The spire hums with energy, its peak lost in clouds of pure magic.',
        baseCost: 17500000000,
        baseProduction: 36575000,
        productionPerSecond: 36575000,
        owned: 0,
        unlockCondition: () => mana >= 7500000000,
        isUnlocked: false,
        element: null
    },
    // === INSERT NEW BUILDINGS HERE ===
];

const upgrades = [
    {
        id: 'magic-theory',
        name: 'Magic Theory',
        description: 'Increases mana per click by 1.',
        flavorText: 'Understanding the fundamentals amplifies your natural talent.',
        cost: 30,
        effect: () => { manaPerClick += 1; },
        isPurchased: false,
        unlockCondition: () => true, // Always visible
        isUnlocked: true,
        element: null
    },
    {
        id: 'magic-sight',
        name: 'Magic Sight',
        description: 'Unlocks the Wizard\'s Eye building.',
        flavorText: 'To peer into the unknown is to accept the unknown exists.',
        cost: 30,
        effect: () => { const b = buildings.find(b => b.id === 'wizards-eye'); if(b) b.isUnlocked = true; },
        isPurchased: false,
        unlockCondition: () => true,
        isUnlocked: true,
        element: null
    },
    {
        id: 'glowing-fingers',
        name: 'Glowing Fingers',
        description: 'Wizard\'s Hands are twice as effective.',
        flavorText: 'Push for just a little more flair with glowing fingers.',
        cost: 500,
        effect: () => { const wh = buildings.find(b => b.id === 'wizards-hand'); if(wh) wh.productionPerSecond *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'wizards-hand').owned >= 10,
        isUnlocked: false,
        element: null
    },
    {
        id: 'tunnel-vision',
        name: 'Tunnel Vision',
        description: 'Wizard\'s Eyes are twice as effective.',
        flavorText: 'Narrow your magic sight to focus on Mana, and only Mana. All for more Mana.',
        cost: 1500,
        effect: () => { const we = buildings.find(b => b.id === 'wizards-eye'); if(we) we.productionPerSecond *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'wizards-eye').owned >= 10,
        isUnlocked: false,
        element: null
    },
    {
        id: 'optical-illusion',
        name: 'Optical Illusion',
        description: 'Wizard\'s Eyes are twice as effective.',
        flavorText: 'Appear more effective. In the world of the metaphysical, that actually does work.',
        cost: 12500,
        effect: () => { const we = buildings.find(b => b.id === 'wizards-eye'); if(we) we.productionPerSecond *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'wizards-eye').owned >= 25,
        isUnlocked: false,
        element: null
    },
    {
        id: 'hand-eye-coordination',
        name: 'Hand-Eye Coordination',
        description: 'Train the hands and eyes to collaborate.',
        flavorText: 'A simple training manual, nothing arcane about it, other than its application to the metaphysical.',
        cost: 1250,
        effect: () => { manaPerClick *= 2; const sb = buildings.find(b => b.id === 'wizards-eye'); if(sb) sb.productionPerSecond *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'wizards-hand').owned >= 25 && buildings.find(b => b.id === 'wizards-eye').owned >= 25,
        isUnlocked: false,
        element: null
    },
    {
        id: 'arcane-tap',
        name: 'Arcane Tap',
        description: 'Increase Mana per click.',
        flavorText: 'Learn how to improve the gathering of mana, gaining more with less effort.',
        cost: 25,
        effect: () => { manaPerClick *= 2; },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-theory').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'magic-schools',
        name: 'Magic Schools',
        description: 'Increases Mana per second.',
        flavorText: 'Theory gives way to practice.',
        cost: 500,
        effect: () => { mpsUpgradeMultiplier *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => true,
        isUnlocked: true,
        element: null
    },
    {
        id: 'arcane-focus',
        name: 'Arcane Focus',
        description: 'Doubles Magus production.',
        flavorText: 'One of a mages\' first tools.',
        cost: 5000,
        effect: () => { const m = buildings.find(b => b.id === 'magus'); if(m) m.productionPerSecond *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'magus').owned >= 1,
        isUnlocked: false,
        element: null
    },
    {
        id: 'components-pouch',
        name: 'Components\' Pouch',
        description: 'Doubles Mana per click.',
        flavorText: 'One of a mages\' first tools.',
        cost: 5000,
        effect: () => { manaPerClick *= 2; },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'magus').owned >= 1,
        isUnlocked: false,
        element: null
    },
    {
        id: 'magic-fingers-1',
        name: 'Magic Fingers LV. 1',
        description: 'Boosts Wizard\'s Hand production by 1% and doubles Mana per click.',
        flavorText: 'Train your Wizard\'s Hands by focusing power into each individual finger.',
        cost: 1000,
        effect: () => { const wh = buildings.find(b => b.id === 'wizards-hand'); if(wh) wh.productionPerSecond *= 1.01; manaPerClick *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'wizards-hand').owned >= 25,
        isUnlocked: false,
        element: null
    },
    {
        id: 'magic-fingers-2',
        name: 'Magic Fingers LV. 2',
        description: 'Boosts Wizard\'s Hand production by 1% and doubles Mana per click.',
        flavorText: 'Train your Wizard\'s Hands by focusing power into each individual finger.',
        cost: 10000,
        effect: () => { const wh = buildings.find(b => b.id === 'wizards-hand'); if(wh) wh.productionPerSecond *= 1.01; manaPerClick *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-fingers-1').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'magic-fingers-3',
        name: 'Magic Fingers LV. 3',
        description: 'Boosts Wizard\'s Hand production by 1% and doubles Mana per click.',
        flavorText: 'Train your Wizard\'s Hands by focusing power into each individual finger.',
        cost: 100000,
        effect: () => { const wh = buildings.find(b => b.id === 'wizards-hand'); if(wh) wh.productionPerSecond *= 1.01; manaPerClick *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-fingers-2').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'magic-fingers-4',
        name: 'Magic Fingers LV. 4',
        description: 'Boosts Wizard\'s Hand production by 1% and doubles Mana per click.',
        flavorText: 'Train your Wizard\'s Hands by focusing power into each individual finger.',
        cost: 1000000,
        effect: () => { const wh = buildings.find(b => b.id === 'wizards-hand'); if(wh) wh.productionPerSecond *= 1.01; manaPerClick *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-fingers-3').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'magic-fingers-5',
        name: 'Magic Fingers LV. 5',
        description: 'Boosts Wizard\'s Hand production by 1% and doubles Mana per click.',
        flavorText: 'Train your Wizard\'s Hands by focusing power into each individual finger.',
        cost: 10000000,
        effect: () => { const wh = buildings.find(b => b.id === 'wizards-hand'); if(wh) wh.productionPerSecond *= 1.01; manaPerClick *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-fingers-4').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'magic-fingers-6',
        name: 'Magic Fingers LV. 6',
        description: 'Boosts Wizard\'s Hand production by 1% and doubles Mana per click.',
        flavorText: 'Train your Wizard\'s Hands by focusing power into each individual finger.',
        cost: 100000000,
        effect: () => { const wh = buildings.find(b => b.id === 'wizards-hand'); if(wh) wh.productionPerSecond *= 1.01; manaPerClick *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-fingers-5').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'magic-fingers-7',
        name: 'Magic Fingers LV. 7',
        description: 'Boosts Wizard\'s Hand production by 1% and doubles Mana per click.',
        flavorText: 'Train your Wizard\'s Hands by focusing power into each individual finger.',
        cost: 1000000000,
        effect: () => { const wh = buildings.find(b => b.id === 'wizards-hand'); if(wh) wh.productionPerSecond *= 1.01; manaPerClick *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-fingers-6').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'magic-fingers-8',
        name: 'Magic Fingers LV. 8',
        description: 'Boosts Wizard\'s Hand production by 1% and doubles Mana per click.',
        flavorText: 'Train your Wizard\'s Hands by focusing power into each individual finger.',
        cost: 10000000000,
        effect: () => { const wh = buildings.find(b => b.id === 'wizards-hand'); if(wh) wh.productionPerSecond *= 1.01; manaPerClick *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-fingers-7').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'magic-fingers-9',
        name: 'Magic Fingers LV. 9',
        description: 'Boosts Wizard\'s Hand production by 1% and doubles Mana per click.',
        flavorText: 'Train your Wizard\'s Hands by focusing power into each individual finger.',
        cost: 100000000000,
        effect: () => { const wh = buildings.find(b => b.id === 'wizards-hand'); if(wh) wh.productionPerSecond *= 1.01; manaPerClick *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-fingers-8').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'magic-fingers-10',
        name: 'Magic Fingers LV. 10',
        description: 'Boosts Wizard\'s Hand production by 1% and doubles Mana per click.',
        flavorText: 'Train your Wizard\'s Hands by focusing power into each individual finger.',
        cost: 1000000000000,
        effect: () => { const wh = buildings.find(b => b.id === 'wizards-hand'); if(wh) wh.productionPerSecond *= 1.01; manaPerClick *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-fingers-9').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'abjuration',
        name: 'Abjuration',
        description: 'Increases Mana per second by 1%.',
        flavorText: '',
        cost: 15000,
        effect: () => { mpsUpgradeMultiplier *= 1.01; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-schools').isPurchased && buildings.find(b => b.id === 'magus').owned >= 10,
        isUnlocked: false,
        element: null
    },
    {
        id: 'conjuration',
        name: 'Conjuration',
        description: 'Increases Mana per second by 1%.',
        flavorText: '',
        cost: 19999,
        effect: () => { mpsUpgradeMultiplier *= 1.01; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-schools').isPurchased && buildings.find(b => b.id === 'magus').owned >= 10,
        isUnlocked: false,
        element: null
    },
    {
        id: 'divination',
        name: 'Divination',
        description: 'Increases Mana per second by 1%.',
        flavorText: '',
        cost: 49999,
        effect: () => { mpsUpgradeMultiplier *= 1.01; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-schools').isPurchased && buildings.find(b => b.id === 'magus').owned >= 10,
        isUnlocked: false,
        element: null
    },
    {
        id: 'evocation',
        name: 'Evocation',
        description: 'Increases Mana per second by 2%.',
        flavorText: '',
        cost: 499999,
        effect: () => { mpsUpgradeMultiplier *= 1.02; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-schools').isPurchased && buildings.find(b => b.id === 'magus').owned >= 10,
        isUnlocked: false,
        element: null
    },
    {
        id: 'enchantment',
        name: 'Enchantment',
        description: 'Increases Mana per second by 1%.',
        flavorText: '',
        cost: 49999,
        effect: () => { mpsUpgradeMultiplier *= 1.01; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-schools').isPurchased && buildings.find(b => b.id === 'magus').owned >= 10,
        isUnlocked: false,
        element: null
    },
    {
        id: 'illusion',
        name: 'Illusion',
        description: 'Increases Mana per second by 2%.',
        flavorText: '',
        cost: 49999,
        effect: () => { mpsUpgradeMultiplier *= 1.02; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-schools').isPurchased && buildings.find(b => b.id === 'magus').owned >= 10,
        isUnlocked: false,
        element: null
    },
    {
        id: 'necromancy',
        name: 'Necromancy',
        description: 'Increases Mana per second by 2%.',
        flavorText: '',
        cost: 99999,
        effect: () => { mpsUpgradeMultiplier *= 1.02; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-schools').isPurchased && buildings.find(b => b.id === 'magus').owned >= 10,
        isUnlocked: false,
        element: null
    },
    {
        id: 'summoning',
        name: 'Summoning',
        description: 'Increases Mana per second by 2%.',
        flavorText: '',
        cost: 199999,
        effect: () => { mpsUpgradeMultiplier *= 1.02; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-schools').isPurchased && buildings.find(b => b.id === 'magus').owned >= 10,
        isUnlocked: false,
        element: null
    },
    {
        id: 'transmutation',
        name: 'Transmutation',
        description: 'Increases Mana per second by 2%.',
        flavorText: '',
        cost: 49999,
        effect: () => { mpsUpgradeMultiplier *= 1.02; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-schools').isPurchased && buildings.find(b => b.id === 'magus').owned >= 10,
        isUnlocked: false,
        element: null
    },
    {
        id: 'prestidigitation',
        name: 'Prestidigitation',
        description: 'Increases Mana per second by 1%.',
        flavorText: 'A wizard\'s first spell, and an all-purpose magic tool.',
        cost: 9999,
        effect: () => { mpsUpgradeMultiplier *= 1.01; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-schools').isPurchased && buildings.find(b => b.id === 'magus').owned >= 10,
        isUnlocked: false,
        element: null
    },
    {
        id: 'mana-manipulation-techniques',
        name: 'Mana Manipulation Techniques',
        description: 'Doubles Mana per click.',
        flavorText: 'Advanced methods for channeling and shaping raw mana.',
        cost: 1111,
        effect: () => { manaPerClick *= 2; },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-theory').isPurchased && upgrades.find(u => u.id === 'magic-sight').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'ley-lines',
        name: 'Ley Lines',
        description: 'Unlocks the Ley Line building.',
        flavorText: 'Tap into the ancient rivers of magic that flow beneath the earth.',
        cost: 500,
        effect: () => { const b = buildings.find(b => b.id === 'ley-line'); if(b) b.isUnlocked = true; },
        isPurchased: false,
        unlockCondition: () => true,
        isUnlocked: true,
        element: null
    },
    {
        id: 'invocation',
        name: 'Invocation',
        description: 'Doubles Magus production.',
        flavorText: 'Call upon greater powers to amplify your magical workings.',
        cost: 25000,
        effect: () => { const m = buildings.find(b => b.id === 'magus'); if(m) m.productionPerSecond *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'prestidigitation').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'blood-magic',
        name: 'Blood Magic',
        description: 'Doubles Magus production.',
        flavorText: 'A forbidden art that draws power from life force itself.',
        cost: 1000000,
        effect: () => { const m = buildings.find(b => b.id === 'magus'); if(m) m.productionPerSecond *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-schools').isPurchased &&
            upgrades.find(u => u.id === 'abjuration').isPurchased &&
            upgrades.find(u => u.id === 'conjuration').isPurchased &&
            upgrades.find(u => u.id === 'divination').isPurchased &&
            upgrades.find(u => u.id === 'evocation').isPurchased &&
            upgrades.find(u => u.id === 'enchantment').isPurchased &&
            upgrades.find(u => u.id === 'illusion').isPurchased &&
            upgrades.find(u => u.id === 'necromancy').isPurchased &&
            upgrades.find(u => u.id === 'summoning').isPurchased &&
            upgrades.find(u => u.id === 'transmutation').isPurchased &&
            upgrades.find(u => u.id === 'prestidigitation').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'ritualist',
        name: 'Ritualist',
        description: 'Increases Mana per second by 1%.',
        flavorText: 'With understanding of all spell schools, you now turn to a more advanced topic, Rituals.',
        cost: 999999,
        effect: () => { mpsUpgradeMultiplier *= 1.01; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-schools').isPurchased &&
            upgrades.find(u => u.id === 'abjuration').isPurchased &&
            upgrades.find(u => u.id === 'conjuration').isPurchased &&
            upgrades.find(u => u.id === 'divination').isPurchased &&
            upgrades.find(u => u.id === 'evocation').isPurchased &&
            upgrades.find(u => u.id === 'enchantment').isPurchased &&
            upgrades.find(u => u.id === 'illusion').isPurchased &&
            upgrades.find(u => u.id === 'necromancy').isPurchased &&
            upgrades.find(u => u.id === 'summoning').isPurchased &&
            upgrades.find(u => u.id === 'transmutation').isPurchased &&
            upgrades.find(u => u.id === 'prestidigitation').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'mana-touched',
        name: 'Mana-Touched',
        description: 'Gain +1 bonus prestige level and +2% Mana per second.',
        flavorText: 'The mana has begun to seep into your very being.',
        cost: 1000000000000000,
        effect: () => { PrestigeModule.addBonusPrestigeLevel(1); mpsUpgradeMultiplier *= 1.02; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => mana >= 1000000000000,
        isUnlocked: false,
        element: null
    },
    {
        id: 'mana-drenched',
        name: 'Mana-Drenched',
        description: 'Gain +1 bonus prestige level and +2% Mana per second.',
        flavorText: 'You are drenched with arcane energy.',
        cost: 1000000000000000,
        effect: () => { PrestigeModule.addBonusPrestigeLevel(1); mpsUpgradeMultiplier *= 1.02; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'mana-touched').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'mana-saturated',
        name: 'Mana-Saturated',
        description: 'Gain +1 bonus prestige level and +2% Mana per second.',
        flavorText: 'You are saturated with arcane energy.',
        cost: 1000000000000000,
        effect: () => { PrestigeModule.addBonusPrestigeLevel(1); mpsUpgradeMultiplier *= 1.02; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'mana-drenched').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'mana-gorged',
        name: 'Mana-Gorged',
        description: 'Gain +1 bonus prestige level and +2% Mana per second.',
        flavorText: 'You have consumed more mana than any mortal should.',
        cost: 1000000000000000,
        effect: () => { PrestigeModule.addBonusPrestigeLevel(1); mpsUpgradeMultiplier *= 1.02; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'mana-saturated').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'mana-warped',
        name: 'Mana-Warped',
        description: 'Gain +1 bonus prestige level and +2% Mana per second.',
        flavorText: 'The mana has changed you, reshaping your essence.',
        cost: 1000000000000000,
        effect: () => { PrestigeModule.addBonusPrestigeLevel(1); mpsUpgradeMultiplier *= 1.02; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'mana-gorged').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'mana-empowered',
        name: 'Mana-Empowered',
        description: 'Gain +1 bonus prestige level and +2% Mana per second.',
        flavorText: 'Raw magical power courses through your veins.',
        cost: 1000000000000000,
        effect: () => { PrestigeModule.addBonusPrestigeLevel(1); mpsUpgradeMultiplier *= 1.02; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'mana-warped').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'one-with-the-weave',
        name: 'One With The Weave',
        description: 'Gain +1 bonus prestige level and +2% Mana per second.',
        flavorText: 'You have become one with the fabric of magic itself.',
        cost: 1000000000000000,
        effect: () => { PrestigeModule.addBonusPrestigeLevel(1); mpsUpgradeMultiplier *= 1.02; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'mana-empowered').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'reinforced-ley-lines',
        name: 'Reinforced Ley Lines',
        description: 'Ley Lines are twice as effective.',
        flavorText: 'Withdraw more Mana with these reinforcements to your Ley Lines.',
        cost: 11550,
        effect: () => { const ll = buildings.find(b => b.id === 'ley-line'); if(ll) ll.productionPerSecond *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'ley-line').owned >= 1,
        isUnlocked: false,
        element: null
    },
    {
        id: 'refinement-process',
        name: 'Refinement Process',
        description: 'Mana Crystals are twice as effective.',
        flavorText: 'Enhance your refinement techniques to make more Mana Crystals.',
        cost: 45000,
        effect: () => { const mc = buildings.find(b => b.id === 'mana-crystal'); if(mc) mc.productionPerSecond *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'mana-crystal').owned >= 1,
        isUnlocked: false,
        element: null
    },
    {
        id: 'wishing-well',
        name: 'Wishing Well',
        description: 'Unlock the Wishing Well, an upgradeable fortune-mechanic.',
        flavorText: 'Toss a coin, for a chance at...',
        cost: 25000,
        effect: () => { WishingWellModule.unlock(); },
        isPurchased: false,
        unlockCondition: () => mana >= 50000,
        isUnlocked: false,
        element: null
    },
    {
        id: 'spellcasting',
        name: 'Spellcasting',
        description: 'Unlock the Spellcasting panel, allowing you to cast powerful spells.',
        flavorText: 'Channel your accumulated mana into arcane incantations.',
        cost: 75000,
        effect: () => { },
        isPurchased: false,
        unlockCondition: () => mana >= 50000,
        isUnlocked: false,
        element: null
    },
    // === APPAREL UPGRADES (Unlocks at Rank 2 - 25 achievements) ===
    {
        id: 'wizards-cape',
        name: 'Wizard\'s Cape',
        description: 'Increases Mana per second by 1%.',
        flavorText: '',
        cost: 9500,
        effect: () => { mpsUpgradeMultiplier *= 1.01; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => AchievementsModule.getEarnedCount() >= 25,
        isUnlocked: false,
        element: null
    },
    {
        id: 'wizards-staff',
        name: 'Wizard\'s Staff',
        description: 'Increases Mana per click by 10.',
        flavorText: '',
        cost: 9500,
        effect: () => { manaPerClick += 10; },
        isPurchased: false,
        unlockCondition: () => AchievementsModule.getEarnedCount() >= 25,
        isUnlocked: false,
        element: null
    },
    {
        id: 'witchs-broom',
        name: 'Witch\'s Broom',
        description: 'Increases Mana per second by 2%.',
        flavorText: '',
        cost: 11500,
        effect: () => { mpsUpgradeMultiplier *= 1.02; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => AchievementsModule.getEarnedCount() >= 25,
        isUnlocked: false,
        element: null
    },
    {
        id: 'ancient-spell-staff',
        name: 'Ancient Spell Staff',
        description: 'Triples Mana per click.',
        flavorText: '',
        cost: 19000,
        effect: () => { manaPerClick *= 3; },
        isPurchased: false,
        unlockCondition: () => PrestigeModule.getPrestigeUpgrades && PrestigeModule.getPrestigeUpgrades().find(u => u.id === 'ancient-spell-staff-unlock' && u.isPurchased),
        isUnlocked: false,
        element: null
    },
    {
        id: 'wizards-hat',
        name: 'Wizard\'s Hat',
        description: 'Increases Mana per second by 3%.',
        flavorText: '',
        cost: 29999,
        effect: () => { mpsUpgradeMultiplier *= 1.03; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'wizards-cape').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'wizards-mantle',
        name: 'Wizard\'s Mantle',
        description: 'Increases Mana per second by 3%.',
        flavorText: '',
        cost: 49000,
        effect: () => { mpsUpgradeMultiplier *= 1.03; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'wizards-hat').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'enchanted-amulet',
        name: 'Enchanted Amulet',
        description: 'Increases Mana per second by 3%.',
        flavorText: '',
        cost: 90000,
        effect: () => { mpsUpgradeMultiplier *= 1.03; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'wizards-mantle').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'warding-ring',
        name: 'Warding Ring',
        description: 'Increases MPS based on your Magic Proficiency.',
        flavorText: '',
        cost: 190000,
        effect: () => { proficiencyUpgradeCount++; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'enchanted-amulet').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'magic-wand',
        name: 'Magic Wand',
        description: 'Doubles Mana per click and increases MPS based on your Magic Proficiency.',
        flavorText: '',
        cost: 900000,
        effect: () => { manaPerClick *= 2; proficiencyUpgradeCount++; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'warding-ring').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'ancient-scroll',
        name: 'Ancient Scroll',
        description: 'Increases MPS based on your Magic Proficiency.',
        flavorText: '',
        cost: 1500000,
        effect: () => { proficiencyUpgradeCount++; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-wand').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'magic-monocle',
        name: 'Magic Monocle',
        description: 'Increases MPS based on your Magic Proficiency.',
        flavorText: '',
        cost: 9000000,
        effect: () => { proficiencyUpgradeCount++; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'ancient-scroll').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'crystal-ball',
        name: 'Crystal Ball',
        description: 'Increases MPS based on your Magic Proficiency.',
        flavorText: '',
        cost: 90000000,
        effect: () => { proficiencyUpgradeCount++; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-monocle').isPurchased,
        isUnlocked: false,
        element: null
    },
    // === WIZARD'S HAND UPGRADES ===
    {
        id: 'double-tap',
        name: 'Double Tap',
        description: 'Wizard\'s Hands are twice as effective.',
        flavorText: 'Two taps are better than one.',
        cost: 60,
        effect: () => { const b = buildings.find(b => b.id === 'wizards-hand'); if(b) b.productionPerSecond *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'wizards-hand').owned >= 2,
        isUnlocked: false,
        element: null
    },
    {
        id: 'triple-tap',
        name: 'Triple Tap',
        description: 'Wizard\'s Hands are three times as effective.',
        flavorText: 'Three taps make a charm.',
        cost: 300,
        effect: () => { const b = buildings.find(b => b.id === 'wizards-hand'); if(b) b.productionPerSecond *= 3; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'wizards-hand').owned >= 3,
        isUnlocked: false,
        element: null
    },
    {
        id: 'button-booping',
        name: 'Button Booping',
        description: 'Wizard\'s Hands are twice as effective.',
        flavorText: 'Boop the Gather Mana button, and train your Wizard\'s Hands to do the same.',
        cost: 30000,
        effect: () => { const b = buildings.find(b => b.id === 'wizards-hand'); if(b) b.productionPerSecond *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'wizards-hand').owned >= 25,
        isUnlocked: false,
        element: null
    },
    {
        id: 'spectral-hands',
        name: 'Spectral Hands',
        description: 'Wizard\'s Hands are twice as effective.',
        flavorText: 'Hands made of pure magical energy.',
        cost: 1248016,
        effect: () => { const b = buildings.find(b => b.id === 'wizards-hand'); if(b) b.productionPerSecond *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'wizards-hand').owned >= 50,
        isUnlocked: false,
        element: null
    },
    {
        id: 'delegation-by-hand',
        name: 'Delegation By Hand',
        description: 'Wizard\'s Hands get +1% MPS for each non-Wizard\'s Hand building owned.',
        flavorText: 'Delegate the work to capable hands.',
        cost: 10000000,
        effect: () => { /* Handled dynamically in recalculateMPS */ },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'wizards-hand').owned >= 100,
        isUnlocked: false,
        element: null
    },
    // === WIZARD'S EYE UPGRADES ===
    {
        id: 'focused-vision',
        name: 'Focused Vision',
        description: 'Wizard\'s Eyes are twice as effective.',
        flavorText: 'Focus your magical sight.',
        cost: 1550,
        effect: () => { const b = buildings.find(b => b.id === 'wizards-eye'); if(b) b.productionPerSecond *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'wizards-eye').owned >= 10,
        isUnlocked: false,
        element: null
    },
    {
        id: 'mystic-viewpoint',
        name: 'Mystic Viewpoint',
        description: 'Wizard\'s Eyes are twice as effective.',
        flavorText: 'See the world from a mystic perspective.',
        cost: 25000,
        effect: () => { const b = buildings.find(b => b.id === 'wizards-eye'); if(b) b.productionPerSecond *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'wizards-eye').owned >= 25,
        isUnlocked: false,
        element: null
    },
    {
        id: 'beholders-eyes',
        name: 'Beholders\' Eyes',
        description: 'Wizard\'s Eyes are twice as effective.',
        flavorText: 'Eyes that see all, miss nothing.',
        cost: 1500000,
        effect: () => { const b = buildings.find(b => b.id === 'wizards-eye'); if(b) b.productionPerSecond *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'wizards-eye').owned >= 50,
        isUnlocked: false,
        element: null
    },
    {
        id: 'overseer',
        name: 'Overseer',
        description: 'Wizard\'s Eyes get +1% MPS for each non-Wizard\'s Eye building owned.',
        flavorText: 'Oversee all magical operations.',
        cost: 35000000,
        effect: () => { /* Handled dynamically in recalculateMPS */ },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'wizards-eye').owned >= 100,
        isUnlocked: false,
        element: null
    },
    // === MAGUS UPGRADES ===
    {
        id: 'mages-apprentice',
        name: 'Mage\'s Apprentice',
        description: 'Magus buildings are twice as effective.',
        flavorText: 'Every master was once an apprentice.',
        cost: 333000,
        effect: () => { const b = buildings.find(b => b.id === 'magus'); if(b) b.productionPerSecond *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'magus').owned >= 25,
        isUnlocked: false,
        element: null
    },
    {
        id: 'archmage-upgrade',
        name: 'Archmage',
        description: 'Magus buildings are three times as effective.',
        flavorText: 'The pinnacle of magical mastery.',
        cost: 90000000,
        effect: () => { const b = buildings.find(b => b.id === 'magus'); if(b) b.productionPerSecond *= 3; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'magus').owned >= 100,
        isUnlocked: false,
        element: null
    },
    // === LEY LINE UPGRADES ===
    {
        id: 'eco-friendly-ley-lines',
        name: 'Eco-Friendly Ley Lines',
        description: 'Ley Lines are twice as effective.',
        flavorText: 'Learn to be nicer to the planet with your Ley Line withdrawal.',
        cost: 55500,
        effect: () => { const b = buildings.find(b => b.id === 'ley-line'); if(b) b.productionPerSecond *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'ley-line').owned >= 10,
        isUnlocked: false,
        element: null
    },
    {
        id: 'mana-spouts',
        name: 'Mana Spouts',
        description: 'Ley Lines are twice as effective.',
        flavorText: 'Install spouts to improve Ley Line yields.',
        cost: 715000,
        effect: () => { const b = buildings.find(b => b.id === 'ley-line'); if(b) b.productionPerSecond *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'ley-line').owned >= 25,
        isUnlocked: false,
        element: null
    },
    {
        id: 'bathed-in-mana',
        name: 'Bathed In Mana',
        description: 'Ley Lines are twice as effective.',
        flavorText: 'Immerse yourself in the flow of Mana.',
        cost: 5151515,
        effect: () => { const b = buildings.find(b => b.id === 'ley-line'); if(b) b.productionPerSecond *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'ley-line').owned >= 50,
        isUnlocked: false,
        element: null
    },
    // === MANA CRYSTAL UPGRADES ===
    {
        id: 'mana-jewel',
        name: 'Mana Jewel',
        description: 'Mana Crystals are twice as effective.',
        flavorText: 'Further refinement turns simple crystals of Mana into pure jewels.',
        cost: 125000,
        effect: () => { const b = buildings.find(b => b.id === 'mana-crystal'); if(b) b.productionPerSecond *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'mana-crystal').owned >= 10,
        isUnlocked: false,
        element: null
    },
    {
        id: 'spell-circles',
        name: 'Spell Circles',
        description: 'Mana Crystals are twice as effective.',
        flavorText: 'With a supply of Mana Crystals, you enhance your magical prowess by channeling power into one of the most potent of rituals, Magic Circles.',
        cost: 515000,
        effect: () => { const b = buildings.find(b => b.id === 'mana-crystal'); if(b) b.productionPerSecond *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'mana-crystal').owned >= 25,
        isUnlocked: false,
        element: null
    },
    {
        id: 'mana-geodes',
        name: 'Mana Geodes',
        description: 'Mana Crystals are twice as effective.',
        flavorText: 'Geodes filled with crystallized Mana.',
        cost: 2250000,
        effect: () => { const b = buildings.find(b => b.id === 'mana-crystal'); if(b) b.productionPerSecond *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'mana-crystal').owned >= 50,
        isUnlocked: false,
        element: null
    },
    // === MANA SHARD UPGRADES ===
    {
        id: 'mana-prism',
        name: 'Mana Prism',
        description: 'Mana Shards are twice as effective.',
        flavorText: 'Prisms that refract magical light.',
        cost: 980000,
        effect: () => { const b = buildings.find(b => b.id === 'mana-shard'); if(b) b.productionPerSecond *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'mana-shard').owned >= 10,
        isUnlocked: false,
        element: null
    },
    {
        id: 'magic-dust',
        name: 'Magic Dust',
        description: 'Mana Shards are twice as effective.',
        flavorText: 'Fine particles of pure magic.',
        cost: 985000,
        effect: () => { const b = buildings.find(b => b.id === 'mana-shard'); if(b) b.productionPerSecond *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'mana-shard').owned >= 10,
        isUnlocked: false,
        element: null
    },
    {
        id: 'mana-cluster',
        name: 'Mana Cluster',
        description: 'Mana Shards are twice as effective.',
        flavorText: 'Clusters of shimmering Mana shards.',
        cost: 3300000,
        effect: () => { const b = buildings.find(b => b.id === 'mana-shard'); if(b) b.productionPerSecond *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'mana-shard').owned >= 25,
        isUnlocked: false,
        element: null
    },
    // === MANA FOUNTAIN UPGRADES ===
    {
        id: 'pool-of-mana',
        name: 'Pool of Mana',
        description: 'Mana Fountains are twice as effective.',
        flavorText: 'Deep pools where Mana collects and concentrates.',
        cost: 200000000,
        effect: () => { const b = buildings.find(b => b.id === 'mana-fountain'); if(b) b.productionPerSecond *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'mana-fountain').owned >= 1,
        isUnlocked: false,
        element: null
    },
    // === MANA MANIPULATION UPGRADES ===
    {
        id: 'advanced-mana-manipulation-techniques',
        name: 'Advanced Mana Manipulation Techniques',
        description: 'Double Mana per click, and unlock the Mana Manipulator building.',
        flavorText: 'Expand upon techniques lost to time... except you have forbidden tomes also thought to be lost that detail these techniques.',
        cost: 111111,
        effect: () => { manaPerClick *= 2; },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'mana-manipulation-techniques')?.isPurchased,
        isUnlocked: false,
        element: null
    },
    // === AMBIENT MANA ===
    {
        id: 'ambient-mana',
        name: 'Ambient Mana',
        description: 'Increase Mana per second by 1%, and increase Mana per click by 5.',
        flavorText: 'Mana is all around us, however, not everyone can see it.',
        cost: 35000,
        effect: () => { mpsUpgradeMultiplier *= 1.01; manaPerClick += 5; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-theory')?.isPurchased && upgrades.find(u => u.id === 'magic-sight')?.isPurchased,
        isUnlocked: false,
        element: null
    },
    // === PRESTIGE POTENTIAL UPGRADES ===
    // These unlock the power from prestige levels
    // Must be purchased each run to apply the bonus
    // Each tier becomes visible when the previous tier is purchased (this run or any previous run)
    {
        id: 'magic-core',
        name: 'Magic Core',
        description: 'Unlock 10% of the potential of your prestige level.',
        flavorText: 'A core of pure magic, the foundation of true power.',
        cost: 10001,
        effect: () => { PrestigeModule.addPrestigePotential(10, 1); },
        isPurchased: false,
        unlockCondition: () => PrestigeModule.getTimesPrestiged() >= 1,
        isUnlocked: false,
        element: null
    },
    {
        id: 'arcane-key',
        name: 'Arcane Key',
        description: 'Unlock 10% of the potential of your prestige level.',
        flavorText: 'A key to unlock deeper mysteries of the arcane.',
        cost: 111111,
        effect: () => { PrestigeModule.addPrestigePotential(10, 2); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-core')?.isPurchased || PrestigeModule.getHighestPotentialTier() >= 1,
        isUnlocked: false,
        element: null
    },
    {
        id: 'pure-mana-construct',
        name: 'Pure Mana Construct',
        description: 'Unlock 10% of the potential of your prestige level.',
        flavorText: 'A construct made of solidified mana, humming with power.',
        cost: 11111111,
        effect: () => { PrestigeModule.addPrestigePotential(10, 3); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'arcane-key')?.isPurchased || PrestigeModule.getHighestPotentialTier() >= 2,
        isUnlocked: false,
        element: null
    },
    {
        id: 'arcane-crystal',
        name: 'Arcane Crystal',
        description: 'Unlock 10% of the potential of your prestige level.',
        flavorText: 'A crystal that resonates with the deepest arcane frequencies.',
        cost: 5999999999,
        effect: () => { PrestigeModule.addPrestigePotential(10, 4); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'pure-mana-construct')?.isPurchased || PrestigeModule.getHighestPotentialTier() >= 3,
        isUnlocked: false,
        element: null
    },
    {
        id: 'legion-of-the-weave',
        name: 'Legion of the Weave',
        description: 'Unlock 10% of the potential of your prestige level.',
        flavorText: 'Command a legion of magical entities woven from the fabric of reality.',
        cost: 999999999999,
        effect: () => { PrestigeModule.addPrestigePotential(10, 5); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'arcane-crystal')?.isPurchased || PrestigeModule.getHighestPotentialTier() >= 4,
        isUnlocked: false,
        element: null
    },
    {
        id: 'nexus-of-the-arcane',
        name: 'Nexus of the Arcane',
        description: 'Unlock 10% of the potential of your prestige level.',
        flavorText: 'A convergence point where all magical energies meet.',
        cost: 9999999999999,
        effect: () => { PrestigeModule.addPrestigePotential(10, 6); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'legion-of-the-weave')?.isPurchased || PrestigeModule.getHighestPotentialTier() >= 5,
        isUnlocked: false,
        element: null
    },
    {
        id: 'essence-of-infinity',
        name: 'Essence of Infinity',
        description: 'Unlock 10% of the potential of your prestige level.',
        flavorText: 'A drop of infinity itself, contained within mortal grasp.',
        cost: 99999999999999,
        effect: () => { PrestigeModule.addPrestigePotential(10, 7); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'nexus-of-the-arcane')?.isPurchased || PrestigeModule.getHighestPotentialTier() >= 6,
        isUnlocked: false,
        element: null
    },
    {
        id: 'cosmic-mana-font',
        name: 'Cosmic Mana Font',
        description: 'Unlock 10% of the potential of your prestige level.',
        flavorText: 'A fountain that draws mana from the cosmos itself.',
        cost: 999999999999999,
        effect: () => { PrestigeModule.addPrestigePotential(10, 8); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'essence-of-infinity')?.isPurchased || PrestigeModule.getHighestPotentialTier() >= 7,
        isUnlocked: false,
        element: null
    },
    {
        id: 'universal-weave',
        name: 'Universal Weave',
        description: 'Unlock 10% of the potential of your prestige level.',
        flavorText: 'The very fabric of the universe becomes your plaything.',
        cost: 9999999999999999,
        effect: () => { PrestigeModule.addPrestigePotential(10, 9); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'cosmic-mana-font')?.isPurchased || PrestigeModule.getHighestPotentialTier() >= 8,
        isUnlocked: false,
        element: null
    },
    {
        id: 'apotheosis',
        name: 'Apotheosis',
        description: 'Unlock 10% of the potential of your prestige level. You have achieved full mastery.',
        flavorText: 'Transcend mortality. Become one with all magic that ever was and ever will be.',
        cost: 99999999999999999,
        effect: () => { PrestigeModule.addPrestigePotential(10, 10); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'universal-weave')?.isPurchased || PrestigeModule.getHighestPotentialTier() >= 9,
        isUnlocked: false,
        element: null
    },
    // === INSERT NEW UPGRADES HERE ===
];

// --- Helper Functions ---
function getBuildingCurrentCost(building) {
    // Exponential cost increase: baseCost * 1.15^owned
    let cost = building.baseCost * Math.pow(1.15, building.owned);
    // Apply runestone building cost modifier
    if (typeof RunestonesModule !== 'undefined') {
        cost *= RunestonesModule.getTempBuildingCostMultiplier();
    }
    // Apply spellcasting building cost modifier
    if (typeof SpellcastingModule !== 'undefined') {
        cost *= SpellcastingModule.getBuildingCostMultiplier();
    }
    return cost;
}

function getUpgradeCurrentCost(upgrade) {
    let cost = upgrade.cost;
    // Apply runestone upgrade cost modifier
    if (typeof RunestonesModule !== 'undefined') {
        cost *= RunestonesModule.getTempUpgradeCostMultiplier();
    }
    // Apply spellcasting upgrade cost modifier
    if (typeof SpellcastingModule !== 'undefined') {
        cost *= SpellcastingModule.getUpgradeCostMultiplier();
    }
    return cost;
}

// Recalculate total MPS from all buildings (call after upgrades modify production rates)
function recalculateMPS() {
    // Check if silenced by runestone
    if (typeof RunestonesModule !== 'undefined' && RunestonesModule.isMagicSilenced()) {
        manaPerSecond = 0;
        // Update Production panel
        if (typeof ProductionModule !== 'undefined') {
            ProductionModule.setMPSFromUpgrades(0);
            ProductionModule.setMPSMultiplier(0);
        }
        return;
    }

    // Get runestone building production multiplier (Arcane Overflow)
    let runestoneProductionMult = 1;
    if (typeof RunestonesModule !== 'undefined') {
        runestoneProductionMult = RunestonesModule.getTempBuildingProductionMultiplier();
    }

    // Calculate total non-building-type buildings for special upgrades
    let totalNonHandBuildings = 0;
    let totalNonEyeBuildings = 0;
    buildings.forEach(b => {
        if (b.id !== 'wizards-hand') totalNonHandBuildings += b.owned;
        if (b.id !== 'wizards-eye') totalNonEyeBuildings += b.owned;
    });

    let baseMPS = 0;
    buildings.forEach(building => {
        // Get specific building multiplier from runestones (True Sight, Crystal Clear)
        let specificMult = 1;
        if (typeof RunestonesModule !== 'undefined') {
            specificMult = RunestonesModule.getSpecificBuildingMultiplier(building.id);
        }

        // Apply Delegation By Hand bonus (Wizard's Hands get +1% per non-Hand building)
        let delegationMult = 1;
        if (building.id === 'wizards-hand' && upgrades.find(u => u.id === 'delegation-by-hand')?.isPurchased) {
            delegationMult = 1 + (totalNonHandBuildings * 0.01);
        }

        // Apply Overseer bonus (Wizard's Eyes get +1% per non-Eye building)
        let overseerMult = 1;
        if (building.id === 'wizards-eye' && upgrades.find(u => u.id === 'overseer')?.isPurchased) {
            overseerMult = 1 + (totalNonEyeBuildings * 0.01);
        }

        baseMPS += building.productionPerSecond * building.owned * runestoneProductionMult * specificMult * delegationMult * overseerMult;
    });

    // Calculate proficiency multiplier (kitten-style: each upgrade multiplies by 1 + proficiency * factor)
    let proficiencyMultiplier = 1;
    if (proficiencyUpgradeCount > 0 && typeof WizardRankModule !== 'undefined') {
        const proficiency = WizardRankModule.getMagicProficiency() / 100; // Convert percentage to decimal
        const factor = 0.05; // 5% factor per upgrade
        for (let i = 0; i < proficiencyUpgradeCount; i++) {
            proficiencyMultiplier *= (1 + proficiency * factor);
        }
    }

    // Get Wishing Well multiplier (temporary effect)
    let wishingWellMultiplier = 1;
    if (typeof WishingWellModule !== 'undefined') {
        wishingWellMultiplier = WishingWellModule.getMPSMultiplier();
    }

    // Get Runestone MPS multiplier (Mana Surge, Mana Void)
    let runestoneMPSMultiplier = 1;
    if (typeof RunestonesModule !== 'undefined') {
        runestoneMPSMultiplier = RunestonesModule.getTempMPSMultiplier();
    }

    manaPerSecond = baseMPS * mpsUpgradeMultiplier * proficiencyMultiplier * wishingWellMultiplier * runestoneMPSMultiplier;

    // Add Runestone temporary MPS bonus (flat bonus from Jazz Hands, Gushing Ley Lines, etc.)
    if (typeof RunestonesModule !== 'undefined') {
        manaPerSecond += RunestonesModule.getTempMPSBonus();
    }

    // Ensure MPS doesn't go below 0
    if (manaPerSecond < 0) manaPerSecond = 0;

    // Update Production panel with MPS bonus and multiplier (if module is loaded)
    if (typeof ProductionModule !== 'undefined') {
        const totalMultiplier = mpsUpgradeMultiplier * proficiencyMultiplier * wishingWellMultiplier * runestoneMPSMultiplier;
        const mpsBonus = baseMPS * (totalMultiplier - 1);
        ProductionModule.setMPSFromUpgrades(mpsBonus);
        ProductionModule.setMPSMultiplier(totalMultiplier);
    }
}

function formatTime(seconds) {
    if (seconds <= 0 || !isFinite(seconds)) return '';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}h ${minutes.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs.toString().padStart(2, '0')}s`;
    } else {
        return `${secs}s`;
    }
}

function getTimeUntilAffordable(cost) {
    if (mana >= cost) return 0;
    const effectiveMPS = typeof getEffectiveMPS === 'function' ? getEffectiveMPS() : manaPerSecond;
    if (effectiveMPS <= 0) return Infinity;
    return (cost - mana) / effectiveMPS;
}

// Function to update the display elements
function updateDisplay() {
    // Show effective MPS with prestige bonus
    const effectiveMPS = typeof getEffectiveMPS === 'function' ? getEffectiveMPS() : manaPerSecond;
    const prestigeBonus = typeof PrestigeModule !== 'undefined' ? PrestigeModule.getPrestigeLevel() : 0;

    manaDisplay.textContent = `${OptionsModule.formatNumber(Math.floor(mana))} Mana`;
    if (prestigeBonus > 0) {
        mpsDisplay.textContent = `${OptionsModule.formatNumber(effectiveMPS)} MPS (+${prestigeBonus}%)`;
    } else {
        mpsDisplay.textContent = `${OptionsModule.formatNumber(effectiveMPS)} MPS`;
    }
    mpcDisplay.textContent = `${OptionsModule.formatNumber(Math.floor(manaPerClick))} per click`;
    checkAffordability(); // Check affordability for both buildings and upgrades
}

// Function to show floating click number
function showFloatingNumber(amount) {
    const button = document.getElementById('gather-mana-button');
    if (!button) return;

    const floater = document.createElement('span');
    floater.className = 'floating-click-number';
    floater.setAttribute('aria-hidden', 'true'); // Decorative only
    floater.textContent = '+' + OptionsModule.formatNumber(Math.floor(amount));

    // Random horizontal offset for variety
    const offsetX = (Math.random() - 0.5) * 60;
    floater.style.left = `calc(50% + ${offsetX}px)`;

    button.parentElement.style.position = 'relative';
    button.parentElement.appendChild(floater);

    // Remove after animation completes
    floater.addEventListener('animationend', () => floater.remove());
}

// Function to gather mana when the button is clicked
function gatherMana() {
    // Check if silenced - no mana from clicking
    if (typeof RunestonesModule !== 'undefined' && RunestonesModule.isMagicSilenced()) {
        // Still update display but don't gain mana
        updateDisplay();
        return;
    }

    // Calculate effective mana per click with runestone bonus
    let effectiveMPC = manaPerClick;
    if (typeof RunestonesModule !== 'undefined') {
        effectiveMPC += RunestonesModule.getTempMPCBonus();
    }
    // Apply spellcasting MPC multiplier
    if (typeof SpellcastingModule !== 'undefined') {
        effectiveMPC *= SpellcastingModule.getMPCMultiplier();
    }
    // Apply Wishing Well MPC multiplier (Click Frenzy)
    if (typeof WishingWellModule !== 'undefined') {
        effectiveMPC *= WishingWellModule.getMPCMultiplier();
    }
    // Ensure MPC doesn't go below 1
    if (effectiveMPC < 1) effectiveMPC = 1;

    mana += effectiveMPC;
    StatisticsModule.addManaByClick(effectiveMPC);
    showFloatingNumber(effectiveMPC);
    updateDisplay();
}

// --- Bulk Buy Logic ---
// Calculate total cost to buy N of a building (geometric series with 1.15 ratio)
function getBulkBuildingCost(building, count) {
    let totalCost = 0;
    let costMultiplier = 1;
    if (typeof RunestonesModule !== 'undefined') {
        costMultiplier *= RunestonesModule.getTempBuildingCostMultiplier();
    }
    if (typeof SpellcastingModule !== 'undefined') {
        costMultiplier *= SpellcastingModule.getBuildingCostMultiplier();
    }
    for (let i = 0; i < count; i++) {
        totalCost += building.baseCost * Math.pow(1.15, building.owned + i) * costMultiplier;
    }
    return totalCost;
}

// Calculate how many buildings can be bought with current mana
function getMaxBuyable(building) {
    let count = 0;
    let totalCost = 0;
    let costMultiplier = 1;
    if (typeof RunestonesModule !== 'undefined') {
        costMultiplier *= RunestonesModule.getTempBuildingCostMultiplier();
    }
    if (typeof SpellcastingModule !== 'undefined') {
        costMultiplier *= SpellcastingModule.getBuildingCostMultiplier();
    }
    while (true) {
        const nextCost = building.baseCost * Math.pow(1.15, building.owned + count) * costMultiplier;
        if (totalCost + nextCost > mana) break;
        totalCost += nextCost;
        count++;
        if (count > 10000) break; // Safety cap
    }
    return { count, totalCost };
}

function getEffectiveBulkAmount(building) {
    if (bulkBuyAmount === -1) {
        return getMaxBuyable(building).count;
    }
    return bulkBuyAmount;
}

function getEffectiveBulkCost(building) {
    if (bulkBuyAmount === -1) {
        return getMaxBuyable(building).totalCost;
    }
    return getBulkBuildingCost(building, bulkBuyAmount);
}

// --- Building Logic ---
function buyBuilding(buildingId) {
    const building = buildings.find(b => b.id === buildingId);
    if (!building) {
        console.error('Building not found:', buildingId);
        return;
    }

    const amount = bulkBuyAmount === -1 ? getMaxBuyable(building).count : bulkBuyAmount;
    if (amount <= 0) return;

    const totalCost = bulkBuyAmount === -1 ? getMaxBuyable(building).totalCost : getBulkBuildingCost(building, amount);

    if (mana >= totalCost) {
        mana -= totalCost;
        building.owned += amount;
        recalculateMPS();
        for (let i = 0; i < amount; i++) StatisticsModule.addBuildingOwned();
        updateBuildingDisplay(building);
        updateDisplay();

        // Play building purchase sound
        if (typeof SoundModule !== 'undefined') {
            SoundModule.play('buildingPurchase');
        }

        // Announce purchase for screen readers
        const msg = amount > 1 ? `Purchased ${amount}` : 'Purchased';
        announceToScreenReader(msg);
    }
}

function createBuildingElement(building) {
    const buildingDiv = document.createElement('div');
    buildingDiv.id = `building-${building.id}`;
    buildingDiv.className = 'building-item';
    buildingDiv.setAttribute('role', 'region');
    buildingDiv.setAttribute('aria-labelledby', `building-name-${building.id}`);

    buildingDiv.innerHTML = `
        <p id="building-name-${building.id}" class="building-name">${building.name}</p>
        <p class="building-description">${building.description}</p>
        <p class="building-flavor">${building.flavorText}</p>
        <p class="building-owned">Owned: <span>${building.owned}</span></p>
        <p class="building-cost">Cost: <span class="cost-value">${OptionsModule.formatNumber(Math.floor(getBuildingCurrentCost(building)))}</span> Mana</p>
        <button id="buy-${building.id}-button" class="buy-building-button">${building.name}, Can Buy</button>
    `;

    const buyButton = buildingDiv.querySelector(`#buy-${building.id}-button`);
    buyButton.addEventListener('click', () => buyBuilding(building.id));

    building.element = buildingDiv;
    return buildingDiv;
}

function updateBuildingDisplay(building) {
    if (!building.element) return;

    building.element.querySelector('.building-owned span').textContent = building.owned;
    const amount = getEffectiveBulkAmount(building);
    const cost = amount > 0 ? getEffectiveBulkCost(building) : getBuildingCurrentCost(building);
    building.element.querySelector('.building-cost .cost-value').textContent = OptionsModule.formatNumber(Math.floor(cost));
}

function renderBuildings() {
    buildingsContainer.innerHTML = '';
    buildings.forEach(building => {
        if (building.isUnlocked) {
            buildingsContainer.appendChild(createBuildingElement(building));
        }
    });
}

function checkUnlocks() {
    let newUnlocks = false;

    buildings.forEach(building => {
        if (!building.isUnlocked && building.unlockCondition()) {
            building.isUnlocked = true;
            newUnlocks = true;
        }
    });

    upgrades.forEach(upgrade => {
        if (!upgrade.isUnlocked && !upgrade.isPurchased && upgrade.unlockCondition()) {
            upgrade.isUnlocked = true;
            newUnlocks = true;
        }
    });

    if (newUnlocks) {
        renderBuildings();
        renderUpgrades();
    }

    // Check Wishing Well button visibility
    updateWishingWellButton();
}

// --- Upgrade Logic ---
function buyUpgrade(upgradeId) {
    const upgrade = upgrades.find(u => u.id === upgradeId);
    if (!upgrade || upgrade.isPurchased) {
        console.error('Upgrade not found or already purchased:', upgradeId);
        return;
    }

    const effectiveCost = getUpgradeCurrentCost(upgrade);
    if (mana >= effectiveCost) {
        mana -= effectiveCost;
        upgrade.effect(); // Apply the upgrade's effect
        upgrade.isPurchased = true;
        StatisticsModule.addUpgradePurchased();
        // Recalculate MPS in case upgrade modified building production
        recalculateMPS();
        // Track mana per click from upgrades
        manaPerClickFromUpgrades = manaPerClick - baseManaPerClick;
        ProductionModule.setManaPerClickFromUpgrades(manaPerClickFromUpgrades);
        updateUpgradeDisplay(upgrade);
        renderBuildings(); // Re-render buildings in case upgrade unlocked one
        updateDisplay(); // Update main displays and affordability

        // Play upgrade purchase sound
        if (typeof SoundModule !== 'undefined') {
            SoundModule.play('upgradePurchase');
        }

        // Announce purchase for screen readers
        announceToScreenReader('Purchased');
    } else {
        // Do nothing if cannot afford
    }
}

function createUpgradeElement(upgrade) {
    const upgradeDiv = document.createElement('div');
    upgradeDiv.id = `upgrade-${upgrade.id}`;
    upgradeDiv.className = 'upgrade-item';
    upgradeDiv.setAttribute('role', 'region');
    upgradeDiv.setAttribute('aria-labelledby', `upgrade-name-${upgrade.id}`);

    upgradeDiv.innerHTML = `
        <p id="upgrade-name-${upgrade.id}" class="upgrade-name">${upgrade.name}</p>
        <p class="upgrade-description">${upgrade.description}</p>
        <p class="upgrade-flavor">${upgrade.flavorText}</p>
        <p class="upgrade-cost">Cost: <span class="cost-value">${OptionsModule.formatNumber(Math.floor(getUpgradeCurrentCost(upgrade)))}</span> Mana</p>
        <button id="buy-${upgrade.id}-button" class="buy-upgrade-button">${upgrade.name}, Can Buy</button>
    `;

    const buyButton = upgradeDiv.querySelector(`#buy-${upgrade.id}-button`);
    buyButton.addEventListener('click', () => buyUpgrade(upgrade.id));

    upgrade.element = upgradeDiv;
    return upgradeDiv;
}

function updateUpgradeDisplay(upgrade) {
    if (!upgrade.element) return;

    const buyButton = upgrade.element.querySelector('.buy-upgrade-button');
    if (upgrade.isPurchased) {
        buyButton.remove();
        upgrade.element.querySelector('.upgrade-cost').remove();
        purchasedUpgradesContainer.appendChild(upgrade.element);
        upgrade.element.classList.remove('upgrade-item');
        upgrade.element.classList.add('purchased-upgrade-item');
    } else {
        // Affordability handled by checkAffordability
        const effectiveCost = getUpgradeCurrentCost(upgrade);
        upgrade.element.querySelector('.upgrade-cost .cost-value').textContent = OptionsModule.formatNumber(Math.floor(effectiveCost));
    }
}

function renderUpgrades() {
    upgradesContainer.innerHTML = '';
    upgrades.forEach(upgrade => {
        if (upgrade.isUnlocked && !upgrade.isPurchased) {
            upgradesContainer.appendChild(createUpgradeElement(upgrade));
        }
    });
}

// --- Affordability Check (for both buildings and upgrades) ---
function checkAffordability() {
    buildings.forEach(building => {
        if (building.element) {
            const buyButton = building.element.querySelector('.buy-building-button');
            const amount = getEffectiveBulkAmount(building);
            const cost = amount > 0 ? getEffectiveBulkCost(building) : Infinity;
            const bulkLabel = bulkBuyAmount === -1 ? (amount > 0 ? ` x${amount}` : '') : (bulkBuyAmount > 1 ? ` x${bulkBuyAmount}` : '');

            // Update displayed cost
            const costEl = building.element.querySelector('.building-cost .cost-value');
            if (costEl) costEl.textContent = OptionsModule.formatNumber(Math.floor(cost));

            if (amount > 0 && mana >= cost) {
                buyButton.disabled = false;
                buyButton.textContent = `Buy${bulkLabel} ${building.name}`;
                buyButton.setAttribute('aria-label', `Buy${bulkLabel} ${building.name}, costs ${OptionsModule.formatNumber(Math.floor(cost))} Mana`);
                buyButton.classList.add('can-buy');
                buyButton.classList.remove('cannot-buy');
            } else {
                buyButton.disabled = true;
                const timeUntil = getTimeUntilAffordable(cost);
                const timeStr = formatTime(timeUntil);
                const timerDisplay = timeStr ? `, ${timeStr}` : '';
                buyButton.textContent = `Buy${bulkLabel} ${building.name}, Not Affordable${timerDisplay}`;
                buyButton.setAttribute('aria-label', `Buy${bulkLabel} ${building.name}, Not Affordable${timerDisplay}`);
                buyButton.classList.add('cannot-buy');
                buyButton.classList.remove('can-buy');
            }
        }
    });

    upgrades.forEach(upgrade => {
        if (upgrade.element && !upgrade.isPurchased) {
            const buyButton = upgrade.element.querySelector('.buy-upgrade-button');
            const effectiveCost = getUpgradeCurrentCost(upgrade);
            // Update displayed cost in case runestone modifier changed
            const costEl = upgrade.element.querySelector('.upgrade-cost .cost-value');
            if (costEl) costEl.textContent = OptionsModule.formatNumber(Math.floor(effectiveCost));
            if (mana >= effectiveCost) {
                buyButton.disabled = false;
                buyButton.textContent = `${upgrade.name}, Can Buy`;
                buyButton.setAttribute('aria-label', `${upgrade.name}, Can Buy`);
                buyButton.classList.add('can-buy');
                buyButton.classList.remove('cannot-buy');
            } else {
                buyButton.disabled = true;
                const timeUntil = getTimeUntilAffordable(effectiveCost);
                const timeStr = formatTime(timeUntil);
                const timerDisplay = timeStr ? `, ${timeStr}` : '';
                buyButton.textContent = `${upgrade.name}, Not Affordable${timerDisplay}`;
                buyButton.setAttribute('aria-label', `${upgrade.name}, Not Affordable${timerDisplay}`);
                buyButton.classList.add('cannot-buy');
                buyButton.classList.remove('can-buy');
            }
        }
    });
}

// --- Navigation ---
let currentOpenPanel = null;

function togglePanel(panel, heading) {
    if (!panel) return;

    // Panels that don't play menu sounds (have their own sounds)
    const excludedPanels = ['wishing-well-panel', 'prestige-panel', 'prestige-store-panel'];
    const panelId = panel.id || '';
    const playMenuSound = !excludedPanels.includes(panelId);

    // If clicking the same panel, close it
    if (currentOpenPanel === panel) {
        panel.hidden = true;
        currentOpenPanel = null;

        // Play close sound
        if (playMenuSound && typeof SoundModule !== 'undefined') {
            SoundModule.play('menuClose');
        }
        return;
    }

    // Close any currently open panel
    if (currentOpenPanel) {
        currentOpenPanel.hidden = true;
    }

    // Open the new panel
    panel.hidden = false;
    currentOpenPanel = panel;

    // Play open sound
    if (playMenuSound && typeof SoundModule !== 'undefined') {
        SoundModule.play('menuOpen');
    }

    // Scroll to and focus the heading
    if (heading) {
        heading.scrollIntoView({ behavior: 'smooth' });
        heading.focus();
    }
}

function setupNavigation() {
    // Map buttons to their panels
    navButtons = {
        'statistics-button': document.getElementById('statistics-panel'),
        'achievements-button': document.getElementById('achievements-panel'),
        'upgrades-button': purchasedUpgradesPanel,
        'ranking-upgrades-button': document.getElementById('ranking-upgrades-panel'),
        'production-button': document.getElementById('production-panel'),
        'prestige-button': document.getElementById('prestige-panel'),
        'wishing-well-button': document.getElementById('wishing-well-panel'),
        'spellcasting-button': document.getElementById('spellcasting-panel'),
        'changelog-button': document.getElementById('changelog-panel'),
        'options-button': document.getElementById('options-panel')
    };

    // Set up navigation button listeners
    Object.keys(navButtons).forEach(buttonId => {
        const button = document.getElementById(buttonId);
        const panel = navButtons[buttonId];

        if (button && panel) {
            button.addEventListener('click', () => {
                const heading = panel.querySelector('h2[tabindex="-1"]');
                togglePanel(panel, heading);

                // Update panel contents when opened
                if (panel.id === 'statistics-panel') {
                    StatisticsModule.updateDisplay();
                } else if (panel.id === 'production-panel') {
                    ProductionModule.updateDisplay(buildings);
                } else if (panel.id === 'ranking-upgrades-panel') {
                    RankingUpgradesModule.renderUpgrades();
                } else if (panel.id === 'wishing-well-panel') {
                    WishingWellModule.updateDisplay();
                    WishingWellModule.renderEffects();
                }
            });
        }
    });
}

// Check if Wishing Well button should be visible
function updateWishingWellButton() {
    const wishingWellUpgrade = upgrades.find(u => u.id === 'wishing-well');
    const wishingWellButton = document.getElementById('wishing-well-button');
    if (wishingWellButton && wishingWellUpgrade && wishingWellUpgrade.isPurchased) {
        wishingWellButton.style.display = '';
    }
}

// Check if Spellcasting button should be visible
function updateSpellcastingButton() {
    const spellcastingUpgrade = upgrades.find(u => u.id === 'spellcasting');
    const spellcastingButton = document.getElementById('spellcasting-button');
    if (spellcastingButton && spellcastingUpgrade && spellcastingUpgrade.isPurchased) {
        spellcastingButton.style.display = '';
    }
}

// Check if Ranking Upgrades button should be visible
function updateRankingUpgradesButton() {
    const rankingButton = document.getElementById('ranking-upgrades-button');
    if (rankingButton && typeof RankingUpgradesModule !== 'undefined') {
        // Show button if any category is unlocked (Wizardries unlocks first at rank 2)
        if (RankingUpgradesModule.isCategoryUnlocked('wizardries')) {
            rankingButton.style.display = '';
        }
    }
}

// --- Game Loop and Initialization ---
// Basic click handler for mana gathering
gatherManaButton.addEventListener('click', gatherMana);

// Setup gather button sounds (called after SoundModule.init)
function setupGatherButtonSounds() {
    let isGathering = false;
    let gatherInterval = null;

    const startGathering = (e) => {
        if (isGathering) return;
        isGathering = true;

        // Play initial gather sound
        if (typeof SoundModule !== 'undefined') {
            SoundModule.onGatherStart();
        }

        // Start continuous gathering after short delay (for hold)
        gatherInterval = setInterval(() => {
            gatherMana();
        }, 100);
    };

    const stopGathering = () => {
        if (!isGathering) return;
        isGathering = false;

        if (gatherInterval) {
            clearInterval(gatherInterval);
            gatherInterval = null;
        }

        if (typeof SoundModule !== 'undefined') {
            SoundModule.onGatherEnd();
        }
    };

    // Mouse events
    gatherManaButton.addEventListener('mousedown', startGathering);
    gatherManaButton.addEventListener('mouseup', stopGathering);
    gatherManaButton.addEventListener('mouseleave', stopGathering);

    // Touch events (for mobile)
    gatherManaButton.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent double-firing with click
        startGathering(e);
    }, { passive: false });
    gatherManaButton.addEventListener('touchend', stopGathering);
    gatherManaButton.addEventListener('touchcancel', stopGathering);

    // Keyboard support (Enter/Space when focused)
    gatherManaButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            if (!e.repeat) {
                startGathering(e);
            }
        }
    });
    gatherManaButton.addEventListener('keyup', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            stopGathering();
        }
    });
}

// Calculate effective MPS with prestige bonus and spell effects
function getEffectiveMPS() {
    let effectiveMPS = manaPerSecond * PrestigeModule.getPrestigeMultiplier();
    // Apply spellcasting MPS multiplier
    if (typeof SpellcastingModule !== 'undefined') {
        effectiveMPS *= SpellcastingModule.getMPSMultiplier();
    }
    return effectiveMPS;
}

// Auto-clicker tick counter (clicks once per second = every 10 game ticks)
let autoClickerTick = 0;

function gameLoop() {
    // Skip production if in prestige mode
    if (PrestigeModule.isPrestigeMode()) {
        return;
    }

    // Apply prestige multiplier to production
    const effectiveMPS = getEffectiveMPS();
    const manaFromBuildings = effectiveMPS / 10;
    mana += manaFromBuildings;
    if (manaFromBuildings > 0) {
        StatisticsModule.addManaByBuildings(manaFromBuildings);
    }
    StatisticsModule.setCurrentMana(mana);

    // Auto-clicker from prestige upgrade (1 click per second)
    if (PrestigeModule.hasAutoClicker && PrestigeModule.hasAutoClicker()) {
        autoClickerTick++;
        if (autoClickerTick >= 10) {
            autoClickerTick = 0;
            // Simulate a click without visual feedback
            let autoMPC = manaPerClick;
            if (typeof RunestonesModule !== 'undefined') autoMPC += RunestonesModule.getTempMPCBonus();
            if (typeof SpellcastingModule !== 'undefined') autoMPC *= SpellcastingModule.getMPCMultiplier();
            if (typeof WishingWellModule !== 'undefined') autoMPC *= WishingWellModule.getMPCMultiplier();
            if (autoMPC < 1) autoMPC = 1;
            mana += autoMPC;
            StatisticsModule.addManaByClick(autoMPC);
        }
    }

    // Check achievements and unlocks
    AchievementsModule.checkAchievements(StatisticsModule.getStats());
    checkUnlocks();

    // Update ranking upgrades button visibility (based on achievement count)
    updateRankingUpgradesButton();

    // Update spellcasting button visibility (based on achievement count)
    updateSpellcastingButton();

    // Update prestige display (for countdown timers)
    PrestigeModule.updateDisplay();

    // Update Wishing Well (coin generation)
    if (typeof WishingWellModule !== 'undefined' && WishingWellModule.isWellUnlocked()) {
        let coinRate = WishingWellModule.getCoinGenerationRate();
        // Apply Golden Eye spell multiplier
        if (typeof SpellcastingModule !== 'undefined') {
            coinRate *= SpellcastingModule.getWishingWellMultiplier();
        }
        // Apply Well Keeper prestige upgrade
        if (PrestigeModule.hasWellBoost && PrestigeModule.hasWellBoost()) {
            coinRate *= 2;
        }
        WishingWellModule.addCoins(coinRate / 10); // Divide by 10 since loop runs 10x per second
        WishingWellModule.updateDisplay();
    }

    // Update Spellcasting (spell power regen, active spell timers)
    if (typeof SpellcastingModule !== 'undefined') {
        SpellcastingModule.update(0.1); // 0.1 seconds per tick
        SpellcastingModule.updateDisplay();
    }

    updateDisplay();
}

// Reset game for prestige ascension (keeps prestige data and total mana stat)
function resetForPrestige() {
    // Reset game state
    mana = 0;
    manaPerClick = 1;
    manaPerSecond = 0;
    baseManaPerClick = 1;
    manaPerClickFromUpgrades = 0;
    mpsFromUpgrades = 0;
    mpsUpgradeMultiplier = 1;
    proficiencyUpgradeCount = 0;

    // Reset buildings
    buildings.forEach(building => {
        building.owned = 0;
        building.productionPerSecond = building.baseProduction;
        building.isUnlocked = false;
        building.element = null;
    });
    // Ensure first building is unlocked
    const firstBuilding = buildings.find(b => b.id === 'wizards-hand');
    if (firstBuilding) firstBuilding.isUnlocked = true;

    // Apply prestige building boosts and recalculate
    PrestigeModule.applyAllPrestigeBuildingBoosts();

    // Apply starting mana from prestige upgrades
    const startingMana = PrestigeModule.getStartingMana();
    if (startingMana > 0) mana = startingMana;

    // Apply starting buildings from prestige upgrades
    const startingBuildings = PrestigeModule.getStartingBuildings();
    Object.entries(startingBuildings).forEach(([id, count]) => {
        const building = buildings.find(b => b.id === id);
        if (building) {
            building.owned += count;
            building.isUnlocked = true;
        }
    });

    recalculateMPS();

    // Reset upgrades (all upgrades reset each run)
    upgrades.forEach(upgrade => {
        upgrade.isPurchased = false;
        upgrade.isUnlocked = false;
        upgrade.element = null;
    });
    // Ensure starting upgrades are unlocked
    const startingUpgrades = ['magic-theory', 'magic-sight', 'magic-schools', 'ley-lines'];
    startingUpgrades.forEach(id => {
        const upgrade = upgrades.find(u => u.id === id);
        if (upgrade) upgrade.isUnlocked = true;
    });

    // Clear purchased upgrades container
    purchasedUpgradesContainer.innerHTML = '';

    // Reset statistics but keep total mana
    StatisticsModule.resetForPrestige();

    // Reset ranking upgrades
    RankingUpgradesModule.resetForPrestige();

    // Reset Wishing Well
    if (typeof WishingWellModule !== 'undefined') {
        WishingWellModule.reset();
    }

    // Reset Runestones
    if (typeof RunestonesModule !== 'undefined') {
        RunestonesModule.reset();
    }

    // Reset Spellcasting (clear active spells, keep spell power)
    if (typeof SpellcastingModule !== 'undefined') {
        SpellcastingModule.reset();
    }

    // Reset prestige potential for this run (must buy upgrades again)
    PrestigeModule.resetPotentialForRun();

    // Re-render UI
    renderBuildings();
    renderUpgrades();
    updateDisplay();

    // Save the game
    SaveManager.saveGame();
}

setInterval(gameLoop, 100);

// --- Bulk Buy UI ---
function createBulkBuyControls() {
    const buildingsHeading = document.getElementById('buildings-heading');
    if (!buildingsHeading) return;

    const controls = document.createElement('div');
    controls.className = 'bulk-buy-controls';
    controls.setAttribute('role', 'radiogroup');
    controls.setAttribute('aria-label', 'Bulk buy amount');

    const label = document.createElement('span');
    label.textContent = 'Buy:';
    label.id = 'bulk-buy-label';
    controls.appendChild(label);

    const amounts = [
        { value: 1, text: 'x1' },
        { value: 10, text: 'x10' },
        { value: 100, text: 'x100' },
        { value: -1, text: 'Max' }
    ];

    amounts.forEach(({ value, text }) => {
        const btn = document.createElement('button');
        btn.className = 'bulk-buy-btn';
        btn.textContent = text;
        btn.setAttribute('role', 'radio');
        btn.setAttribute('aria-checked', value === bulkBuyAmount ? 'true' : 'false');
        btn.setAttribute('aria-label', `Buy ${text === 'Max' ? 'maximum' : text} buildings at once`);
        if (value === bulkBuyAmount) btn.setAttribute('aria-pressed', 'true');

        btn.addEventListener('click', () => {
            bulkBuyAmount = value;
            // Update all button states
            controls.querySelectorAll('.bulk-buy-btn').forEach(b => {
                b.setAttribute('aria-checked', 'false');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.setAttribute('aria-checked', 'true');
            btn.setAttribute('aria-pressed', 'true');
            // Refresh building displays with new bulk costs
            buildings.forEach(b => updateBuildingDisplay(b));
            checkAffordability();
        });

        controls.appendChild(btn);
    });

    buildingsHeading.insertAdjacentElement('afterend', controls);
}

// Initial setup
initializePanels();
setupNavigation();
createBulkBuyControls();
updateDisplay();
renderBuildings();
renderUpgrades();
FlavorEventsModule.init();
RunestonesModule.init();
SpellcastingModule.init();
SoundModule.init();
SaveManager.init();

// Set up gather button sound handling (click and hold)
setupGatherButtonSounds();

// Display version in title
document.getElementById('game-title').textContent = 'MagicTap, V.' + VERSION;
document.title = 'MagicTap, V.' + VERSION;

// Simple announcement helper for screen readers
// Clears previous announcements so rapid actions only announce once
function announceToScreenReader(message) {
    const notificationArea = document.getElementById('notification-area');
    if (!notificationArea) return;

    // Clear any pending sr-only announcements to prevent spam
    const existingAnnouncements = notificationArea.querySelectorAll('.sr-only-announcement');
    existingAnnouncements.forEach(el => el.remove());

    const announcement = document.createElement('span');
    announcement.className = 'sr-only sr-only-announcement';
    announcement.textContent = message;
    notificationArea.appendChild(announcement);

    // Remove after announcement is read
    setTimeout(() => announcement.remove(), 1000);
}
