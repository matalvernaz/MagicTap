// Achievements Module
const AchievementsModule = (function() {
    const achievements = [
        {
        id: 'drop-in-the-bucket',
        name: 'Drop In The Bucket',
        description: 'Gather 1 mana',
        condition: (stats) => stats.currentMana >= 1,
        isEarned: false
    },
        {
        id: 'mana-to-spare',
        name: 'Mana To Spare',
        description: 'Have 100 current Mana.',
        condition: (stats) => stats.currentMana >= 100,
        isEarned: false
    },
        {
        id: 'three-hands',
        name: 'Three Hands',
        description: 'Purchase 1 Wizard\'s Hand.',
        condition: (stats) => buildings.find(b => b.id === 'wizards-hand').owned >= 1,
        isEarned: false
    },
        {
        id: 'magic-sight',
        name: 'Magic Sight',
        description: 'Purchase 1 Wizard\'s Eye.',
        condition: (stats) => buildings.find(b => b.id === 'wizards-eye').owned >= 1,
        isEarned: false
    },
        {
        id: 'start-your-studies',
        name: 'Start Your Studies!',
        description: 'Purchase Magic Theory.',
        condition: (stats) => upgrades.find(u => u.id === 'magic-theory').isPurchased,
        isEarned: false
    },
    {
        id: 'many-hands',
        name: 'Many Hands Make Light Work',
        description: 'Purchase 25 Wizard\'s Hands.',
        condition: (stats) => buildings.find(b => b.id === 'wizards-hand').owned >= 25,
        isEarned: false
    },
    {
        id: 'thats-handy',
        name: 'That\'s Handy',
        description: 'Purchase 50 Wizard\'s Hands.',
        condition: (stats) => buildings.find(b => b.id === 'wizards-hand').owned >= 50,
        isEarned: false
    },
    {
        id: 'hundred-handed',
        name: 'Hundred-Handed',
        description: 'Purchase 100 Wizard\'s Hands.',
        condition: (stats) => buildings.find(b => b.id === 'wizards-hand').owned >= 100,
        isEarned: false
    },
    {
        id: 'whos-hand-is-that',
        name: 'Who\'s Hand Is That?',
        description: 'Purchase 200 Wizard\'s Hands.',
        condition: (stats) => buildings.find(b => b.id === 'wizards-hand').owned >= 200,
        isEarned: false
    },
    {
        id: 'out-of-hand',
        name: 'Out Of Hand',
        description: 'Purchase 500 Wizard\'s Hands.',
        condition: (stats) => buildings.find(b => b.id === 'wizards-hand').owned >= 500,
        isEarned: false
    },
    {
        id: 'see-no-evil',
        name: 'See No Evil',
        description: 'Purchase 25 Wizard\'s Eyes.',
        condition: (stats) => buildings.find(b => b.id === 'wizards-eye').owned >= 25,
        isEarned: false
    },
    {
        id: 'spectral-sight',
        name: 'Spectral Sight',
        description: 'Purchase 50 Wizard\'s Eyes.',
        condition: (stats) => buildings.find(b => b.id === 'wizards-eye').owned >= 50,
        isEarned: false
    },
    {
        id: 'perfect-point-of-view',
        name: 'Perfect Point Of View',
        description: 'Purchase 100 Wizard\'s Eyes.',
        condition: (stats) => buildings.find(b => b.id === 'wizards-eye').owned >= 100,
        isEarned: false
    },
    {
        id: 'disturbing-amount-of-eyes',
        name: 'Disturbing Amount of Eyes',
        description: 'Purchase 200 Wizard\'s Eyes.',
        condition: (stats) => buildings.find(b => b.id === 'wizards-eye').owned >= 200,
        isEarned: false
    },
    {
        id: 'all-seeing',
        name: 'All-Seeing',
        description: 'Purchase 500 Wizard\'s Eyes.',
        condition: (stats) => buildings.find(b => b.id === 'wizards-eye').owned >= 500,
        isEarned: false
    },
    {
        id: 'new-hire',
        name: 'New Hire',
        description: 'Purchase 1 Magus.',
        condition: (stats) => buildings.find(b => b.id === 'magus').owned >= 1,
        isEarned: false
    },
    {
        id: 'hiring-spree',
        name: 'Hiring Spree',
        description: 'Purchase 25 Magi.',
        condition: (stats) => buildings.find(b => b.id === 'magus').owned >= 25,
        isEarned: false
    },
    {
        id: 'magic-community',
        name: 'Magic Community',
        description: 'Purchase 50 Magi.',
        condition: (stats) => buildings.find(b => b.id === 'magus').owned >= 50,
        isEarned: false
    },
    {
        id: 'it-takes-a-village',
        name: 'It Takes A Village',
        description: 'Purchase 100 Magi.',
        condition: (stats) => buildings.find(b => b.id === 'magus').owned >= 100,
        isEarned: false
    },
    {
        id: 'small-town-of-magic',
        name: 'Small Town of Magic',
        description: 'Purchase 200 Magi.',
        condition: (stats) => buildings.find(b => b.id === 'magus').owned >= 200,
        isEarned: false
    },
    {
        id: 'conclave-of-the-magi',
        name: 'Conclave of the Magi',
        description: 'Purchase 500 Magi.',
        condition: (stats) => buildings.find(b => b.id === 'magus').owned >= 500,
        isEarned: false
    },
    {
        id: 'glowing-with-power',
        name: 'Glowing With Power',
        description: 'Have 1,000 current Mana.',
        condition: (stats) => stats.currentMana >= 1000,
        isEarned: false
    },
    {
        id: 'ask-the-magic-8-ball',
        name: 'Ask The Magic 8-Ball',
        description: 'Have 7,777 current Mana.',
        condition: (stats) => stats.currentMana >= 7777,
        isEarned: false
    },
    {
        id: 'flooding-the-ley-lines',
        name: 'Flooding the Ley Lines',
        description: 'Have 10,000 current Mana.',
        condition: (stats) => stats.currentMana >= 10000,
        isEarned: false
    },
    {
        id: 'magic-adept',
        name: 'Magic Adept',
        description: 'Have 100,000 current Mana.',
        condition: (stats) => stats.currentMana >= 100000,
        isEarned: false
    },
    {
        id: 'mr-million-mana',
        name: 'Mr. Million Mana',
        description: 'Have 1,000,000 current Mana.',
        condition: (stats) => stats.currentMana >= 1000000,
        isEarned: false
    },
    {
        id: 'mana-powered-universe',
        name: 'Mana-Powered Universe',
        description: 'Have 10,000,000 current Mana.',
        condition: (stats) => stats.currentMana >= 10000000,
        isEarned: false
    },
    {
        id: 'overruled-by-magic',
        name: 'Overruled By Magic',
        description: 'Have 100,000,000 current Mana.',
        condition: (stats) => stats.currentMana >= 100000000,
        isEarned: false
    },
    {
        id: 'arcana-through-the-ages',
        name: 'Arcana Through The Ages',
        description: 'Have 1,000,000,000 current Mana.',
        condition: (stats) => stats.currentMana >= 1000000000,
        isEarned: false
    },
    {
        id: 'arcane-and-in-charge',
        name: 'Arcane And In Charge',
        description: 'Have 10,000,000,000 current Mana.',
        condition: (stats) => stats.currentMana >= 10000000000,
        isEarned: false
    },
    {
        id: 'channel-the-weave',
        name: 'Channel The Weave...',
        description: 'Have 100,000,000,000 current Mana.',
        condition: (stats) => stats.currentMana >= 100000000000,
        isEarned: false
    },
    {
        id: 'become-the-weave',
        name: 'Become The Weave...',
        description: 'Have 1,000,000,000,000 current Mana.',
        condition: (stats) => stats.currentMana >= 1000000000000,
        isEarned: false
    },
    {
        id: 'worship-the-weave-mana',
        name: 'Worship The Weave...',
        description: 'Have 10,000,000,000,000 current Mana.',
        condition: (stats) => stats.currentMana >= 10000000000000,
        isEarned: false
    },
    {
        id: 'and-you-get-mana',
        name: 'And You Get Some Mana!',
        description: 'Have 100,000,000,000,000 current Mana.',
        condition: (stats) => stats.currentMana >= 100000000000000,
        isEarned: false
    },
    {
        id: 'and-you-get-more-mana',
        name: 'And You Get Some More Mana!',
        description: 'Have 1,000,000,000,000,000 current Mana.',
        condition: (stats) => stats.currentMana >= 1000000000000000,
        isEarned: false
    },
    {
        id: 'tap-to-gather',
        name: 'Tap To Gather',
        description: 'Gather 1 Mana by clicking.',
        condition: (stats) => stats.manaByClick >= 1,
        isEarned: false
    },
    {
        id: 'we-all-click',
        name: 'We All Click',
        description: 'Gather 100 Mana by clicking.',
        condition: (stats) => stats.manaByClick >= 100,
        isEarned: false
    },
    {
        id: 'magic-hands',
        name: 'Magic Hands',
        description: 'Gather 1,000 Mana by clicking.',
        condition: (stats) => stats.manaByClick >= 1000,
        isEarned: false
    },
    {
        id: 'are-you-actually-clicking-this-much',
        name: 'Are You Actually Clicking This Much?',
        description: 'Gather 10,000 Mana by clicking.',
        condition: (stats) => stats.manaByClick >= 10000,
        isEarned: false
    },
    {
        id: 'tap-to-continue-gathering',
        name: 'Tap To Continue Gathering',
        description: 'Gather 100,000 Mana by clicking.',
        condition: (stats) => stats.manaByClick >= 100000,
        isEarned: false
    },
    {
        id: 'mind-numbing-mana-activity',
        name: 'Mind-Numbing Mana Activity',
        description: 'Gather 1,000,000 Mana by clicking.',
        condition: (stats) => stats.manaByClick >= 1000000,
        isEarned: false
    },
    {
        id: 'autoclicker',
        name: 'Autoclicker',
        description: 'Gather 10,000,000 Mana by clicking.',
        condition: (stats) => stats.manaByClick >= 10000000,
        isEarned: false
    },
    {
        id: 'gatherer',
        name: 'Gatherer',
        description: 'Gather 100,000,000 Mana by clicking.',
        condition: (stats) => stats.manaByClick >= 100000000,
        isEarned: false
    },
    {
        id: 'mana-collector',
        name: 'Mana Collector',
        description: 'Gather 1,000,000,000 Mana by clicking.',
        condition: (stats) => stats.manaByClick >= 1000000000,
        isEarned: false
    },
    {
        id: 'mana-hoarder',
        name: 'Mana Hoarder',
        description: 'Gather 10,000,000,000 Mana by clicking.',
        condition: (stats) => stats.manaByClick >= 10000000000,
        isEarned: false
    },
    {
        id: 'what-do-you-even-need-this-much-for',
        name: 'What Do You Even Need This Much For?',
        description: 'Gather 100,000,000,000 Mana by clicking.',
        condition: (stats) => stats.manaByClick >= 100000000000,
        isEarned: false
    },
    {
        id: 'magictapped-a-lot-of-mana',
        name: 'MagicTapped A Lot Of Mana',
        description: 'Gather 1,000,000,000,000 Mana by clicking.',
        condition: (stats) => stats.manaByClick >= 1000000000000,
        isEarned: false
    },
    {
        id: 'is-this-enough-fireball',
        name: 'Is This Enough To Cast A Fireball?',
        description: 'Gather 10,000,000,000,000 Mana by clicking.',
        condition: (stats) => stats.manaByClick >= 10000000000000,
        isEarned: false
    },
    {
        id: 'just-keep-clicking',
        name: 'You\'re Just Going To Keep Clicking...',
        description: 'Gather 100,000,000,000,000 Mana by clicking.',
        condition: (stats) => stats.manaByClick >= 100000000000000,
        isEarned: false
    },
    {
        id: 'schools-in-session',
        name: 'School\'s In Session',
        description: 'Purchase the Magic Schools upgrade.',
        condition: (stats) => upgrades.find(u => u.id === 'magic-schools').isPurchased,
        isEarned: false
    },
    {
        id: 'you-finished-the-tutorial',
        name: 'You Finished The Tutorial!',
        description: 'Purchase all magic school upgrades.',
        condition: (stats) => upgrades.find(u => u.id === 'magic-schools').isPurchased &&
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
        isEarned: false
    },
    {
        id: 'take-a-sip',
        name: 'Take A Sip',
        description: 'Purchase 1 Ley Line.',
        condition: (stats) => buildings.find(b => b.id === 'ley-line').owned >= 1,
        isEarned: false
    },
    {
        id: 'just-a-little-taste',
        name: 'Just A Little Taste',
        description: 'Purchase 25 Ley Lines.',
        condition: (stats) => buildings.find(b => b.id === 'ley-line').owned >= 25,
        isEarned: false
    },
    {
        id: 'drink-your-fill',
        name: 'Drink Your Fill',
        description: 'Purchase 50 Ley Lines.',
        condition: (stats) => buildings.find(b => b.id === 'ley-line').owned >= 50,
        isEarned: false
    },
    {
        id: 'quench-your-thirst',
        name: 'Quench Your Thirst',
        description: 'Purchase 100 Ley Lines.',
        condition: (stats) => buildings.find(b => b.id === 'ley-line').owned >= 100,
        isEarned: false
    },
    {
        id: 'vampiric-magic',
        name: 'Vampiric Magic',
        description: 'Purchase 200 Ley Lines.',
        condition: (stats) => buildings.find(b => b.id === 'ley-line').owned >= 200,
        isEarned: false
    },
    {
        id: 'drain-the-planet-dry',
        name: 'Drain The Planet Dry',
        description: 'Purchase 500 Ley Lines.',
        condition: (stats) => buildings.find(b => b.id === 'ley-line').owned >= 500,
        isEarned: false
    },
    {
        id: 'handicraft',
        name: 'Handicraft',
        description: 'Purchase 1,000 Wizard\'s Hands.',
        condition: (stats) => buildings.find(b => b.id === 'wizards-hand').owned >= 1000,
        isEarned: false
    },
    {
        id: 'arcane-visionary',
        name: 'Arcane Visionary',
        description: 'Purchase 1,000 Wizard\'s Eyes.',
        condition: (stats) => buildings.find(b => b.id === 'wizards-eye').owned >= 1000,
        isEarned: false
    },
    {
        id: 'mage-of-many-talents',
        name: 'Mage Of Many Talents',
        description: 'Purchase 1,000 Magi.',
        condition: (stats) => buildings.find(b => b.id === 'magus').owned >= 1000,
        isEarned: false
    },
    {
        id: 'mana-desert',
        name: 'Mana Desert',
        description: 'Purchase 1,000 Ley Lines.',
        condition: (stats) => buildings.find(b => b.id === 'ley-line').owned >= 1000,
        isEarned: false
    },
    {
        id: 'refined',
        name: 'Refined',
        description: 'Purchase 1 Mana Crystal.',
        condition: (stats) => buildings.find(b => b.id === 'mana-crystal').owned >= 1,
        isEarned: false
    },
    {
        id: 'crystallize',
        name: 'Crystallize',
        description: 'Purchase 25 Mana Crystals.',
        condition: (stats) => buildings.find(b => b.id === 'mana-crystal').owned >= 25,
        isEarned: false
    },
    {
        id: 'tangible',
        name: 'Tangible',
        description: 'Purchase 50 Mana Crystals.',
        condition: (stats) => buildings.find(b => b.id === 'mana-crystal').owned >= 50,
        isEarned: false
    },
    {
        id: 'arcane-forger',
        name: 'Arcane Forger',
        description: 'Purchase 100 Mana Crystals.',
        condition: (stats) => buildings.find(b => b.id === 'mana-crystal').owned >= 100,
        isEarned: false
    },
    {
        id: 'you-cant-prestige-with-these',
        name: 'You Can\'t Prestige With These',
        description: 'Purchase 200 Mana Crystals.',
        condition: (stats) => buildings.find(b => b.id === 'mana-crystal').owned >= 200,
        isEarned: false
    },
    {
        id: 'wrong-currency',
        name: 'Wrong Currency',
        description: 'Purchase 500 Mana Crystals.',
        condition: (stats) => buildings.find(b => b.id === 'mana-crystal').owned >= 500,
        isEarned: false
    },
    {
        id: 'glittering-arcana',
        name: 'Glittering Arcana',
        description: 'Purchase 1,000 Mana Crystals.',
        condition: (stats) => buildings.find(b => b.id === 'mana-crystal').owned >= 1000,
        isEarned: false
    },
    {
        id: 'suit-and-tie',
        name: 'Suit And Tie',
        description: 'Purchase all Apparel upgrades.',
        condition: (stats) =>
            upgrades.find(u => u.id === 'wizards-cape').isPurchased &&
            upgrades.find(u => u.id === 'wizards-staff').isPurchased &&
            upgrades.find(u => u.id === 'witchs-broom').isPurchased &&
            upgrades.find(u => u.id === 'wizards-hat').isPurchased &&
            upgrades.find(u => u.id === 'wizards-mantle').isPurchased &&
            upgrades.find(u => u.id === 'enchanted-amulet').isPurchased &&
            upgrades.find(u => u.id === 'warding-ring').isPurchased &&
            upgrades.find(u => u.id === 'magic-wand').isPurchased &&
            upgrades.find(u => u.id === 'ancient-scroll').isPurchased &&
            upgrades.find(u => u.id === 'magic-monocle').isPurchased &&
            upgrades.find(u => u.id === 'crystal-ball').isPurchased,
        isEarned: false
    },
    // === INSERT NEW ACHIEVEMENTS HERE ===
    // Wishing Well Achievements
    {
        id: 'toss-a-coin',
        name: 'Toss A Coin',
        description: 'Trigger 10 effects from the Wishing Well.',
        condition: (stats) => typeof WishingWellModule !== 'undefined' && WishingWellModule.getEffectTriggerCount() >= 10,
        isEarned: false
    },
    {
        id: 'penny-for-your-mana',
        name: 'Penny For Your Mana?',
        description: 'Trigger 50 effects from the Wishing Well.',
        condition: (stats) => typeof WishingWellModule !== 'undefined' && WishingWellModule.getEffectTriggerCount() >= 50,
        isEarned: false
    },
    {
        id: '100-copper-coins',
        name: '100 Copper Coins equals',
        description: 'Trigger 100 effects from the Wishing Well.',
        condition: (stats) => typeof WishingWellModule !== 'undefined' && WishingWellModule.getEffectTriggerCount() >= 100,
        isEarned: false
    },
    // Mana Manipulator Achievements
    {
        id: 'mana-manipulation-ach',
        name: 'Mana Manipulation',
        description: 'Purchase 1 Mana Manipulator.',
        condition: (stats) => buildings.find(b => b.id === 'mana-manipulator')?.owned >= 1,
        isEarned: false
    },
    {
        id: 'advanced-mana-manipulation-ach',
        name: 'Advanced Mana Manipulation',
        description: 'Purchase 25 Mana Manipulators.',
        condition: (stats) => buildings.find(b => b.id === 'mana-manipulator')?.owned >= 25,
        isEarned: false
    },
    {
        id: 'practice-behind-theory',
        name: 'Practice Behind The Theory',
        description: 'Purchase 50 Mana Manipulators.',
        condition: (stats) => buildings.find(b => b.id === 'mana-manipulator')?.owned >= 50,
        isEarned: false
    },
    {
        id: 'new-theories',
        name: 'New Theories',
        description: 'Purchase 100 Mana Manipulators.',
        condition: (stats) => buildings.find(b => b.id === 'mana-manipulator')?.owned >= 100,
        isEarned: false
    },
    {
        id: 'preach-practice',
        name: 'Preach What You Practice',
        description: 'Purchase 200 Mana Manipulators.',
        condition: (stats) => buildings.find(b => b.id === 'mana-manipulator')?.owned >= 200,
        isEarned: false
    },
    {
        id: 'true-mental-stimulation',
        name: 'True Mental Stimulation',
        description: 'Purchase 500 Mana Manipulators.',
        condition: (stats) => buildings.find(b => b.id === 'mana-manipulator')?.owned >= 500,
        isEarned: false
    },
    {
        id: 'mental-enrichment',
        name: 'Mental Enrichment',
        description: 'Purchase 1000 Mana Manipulators.',
        condition: (stats) => buildings.find(b => b.id === 'mana-manipulator')?.owned >= 1000,
        isEarned: false
    },
    // Mana Shard Achievements
    {
        id: 'gleam-glitter',
        name: 'Gleam and Glitter',
        description: 'Purchase 1 Mana Shard.',
        condition: (stats) => buildings.find(b => b.id === 'mana-shard')?.owned >= 1,
        isEarned: false
    },
    {
        id: 'sparkle-shine',
        name: 'Sparkle and Shine',
        description: 'Purchase 25 Mana Shards.',
        condition: (stats) => buildings.find(b => b.id === 'mana-shard')?.owned >= 25,
        isEarned: false
    },
    {
        id: 'razzle-dazzle',
        name: 'Razzle-Dazzle',
        description: 'Purchase 50 Mana Shards.',
        condition: (stats) => buildings.find(b => b.id === 'mana-shard')?.owned >= 50,
        isEarned: false
    },
    {
        id: 'blinded-by-magic',
        name: 'Blinded By Magic',
        description: 'Purchase 100 Mana Shards.',
        condition: (stats) => buildings.find(b => b.id === 'mana-shard')?.owned >= 100,
        isEarned: false
    },
    {
        id: 'shards-to-clusters',
        name: 'Shards to Clusters',
        description: 'Purchase 200 Mana Shards.',
        condition: (stats) => buildings.find(b => b.id === 'mana-shard')?.owned >= 200,
        isEarned: false
    },
    {
        id: 'pieces-mystic-puzzle',
        name: 'Pieces of the Mystic Puzzle',
        description: 'Purchase 500 Mana Shards.',
        condition: (stats) => buildings.find(b => b.id === 'mana-shard')?.owned >= 500,
        isEarned: false
    },
    {
        id: 'shattered-from-weave',
        name: 'Shattered From The Weave',
        description: 'Purchase 1000 Mana Shards.',
        condition: (stats) => buildings.find(b => b.id === 'mana-shard')?.owned >= 1000,
        isEarned: false
    },
    // Mana Fountain Achievements
    {
        id: 'magic-not-radioactive',
        name: 'Magic, Not Radioactive',
        description: 'Purchase 1 Mana Fountain.',
        condition: (stats) => buildings.find(b => b.id === 'mana-fountain')?.owned >= 1,
        isEarned: false
    },
    {
        id: 'magic-bath',
        name: 'Magic Bath',
        description: 'Purchase 25 Mana Fountains.',
        condition: (stats) => buildings.find(b => b.id === 'mana-fountain')?.owned >= 25,
        isEarned: false
    },
    {
        id: 'submerged-in-mana',
        name: 'Submerged In Mana',
        description: 'Purchase 50 Mana Fountains.',
        condition: (stats) => buildings.find(b => b.id === 'mana-fountain')?.owned >= 50,
        isEarned: false
    },
    {
        id: 'fountain-of-magic',
        name: 'Fountain of Magic',
        description: 'Purchase 100 Mana Fountains.',
        condition: (stats) => buildings.find(b => b.id === 'mana-fountain')?.owned >= 100,
        isEarned: false
    },
    {
        id: 'fountain-of-youth',
        name: 'Fountain Of Youth?',
        description: 'Purchase 200 Mana Fountains.',
        condition: (stats) => buildings.find(b => b.id === 'mana-fountain')?.owned >= 200,
        isEarned: false
    },
    {
        id: 'channeled-to-ley-lines',
        name: 'Channeled To The Ley Lines',
        description: 'Purchase 500 Mana Fountains.',
        condition: (stats) => buildings.find(b => b.id === 'mana-fountain')?.owned >= 500,
        isEarned: false
    },
    {
        id: 'weavers-lifeblood',
        name: 'Weaver\'s Lifeblood',
        description: 'Purchase 1000 Mana Fountains.',
        condition: (stats) => buildings.find(b => b.id === 'mana-fountain')?.owned >= 1000,
        isEarned: false
    },
    // Church of Mana Achievements
    {
        id: 'worship-the-weave-ach',
        name: 'Worship The Weave',
        description: 'Purchase 1 Church of Mana.',
        condition: (stats) => buildings.find(b => b.id === 'church-of-mana')?.owned >= 1,
        isEarned: false
    },
    {
        id: 'mana-beckons',
        name: 'Mana Beckons',
        description: 'Purchase 25 Church of Mana.',
        condition: (stats) => buildings.find(b => b.id === 'church-of-mana')?.owned >= 25,
        isEarned: false
    },
    {
        id: 'doctrine-arcane',
        name: 'Doctrine of the Arcane',
        description: 'Purchase 50 Church of Mana.',
        condition: (stats) => buildings.find(b => b.id === 'church-of-mana')?.owned >= 50,
        isEarned: false
    },
    {
        id: 'rule-of-weave',
        name: 'Rule of the Weave',
        description: 'Purchase 100 Church of Mana.',
        condition: (stats) => buildings.find(b => b.id === 'church-of-mana')?.owned >= 100,
        isEarned: false
    },
    {
        id: 'magic-fanatics',
        name: 'Magic Fanatics',
        description: 'Purchase 200 Church of Mana.',
        condition: (stats) => buildings.find(b => b.id === 'church-of-mana')?.owned >= 200,
        isEarned: false
    },
    {
        id: 'cult-of-weave',
        name: 'Cult of the Weave',
        description: 'Purchase 500 Church of Mana.',
        condition: (stats) => buildings.find(b => b.id === 'church-of-mana')?.owned >= 500,
        isEarned: false
    },
    {
        id: 'whos-zealot',
        name: 'Who\'s The Zealot Here?',
        description: 'Purchase 666 Church of Mana.',
        condition: (stats) => buildings.find(b => b.id === 'church-of-mana')?.owned >= 666,
        isEarned: false
    },
    {
        id: 'church-to-cathedral',
        name: 'Church to Cathedral',
        description: 'Purchase 1000 Church of Mana.',
        condition: (stats) => buildings.find(b => b.id === 'church-of-mana')?.owned >= 1000,
        isEarned: false
    },
    // Mages' Guild Achievements
    {
        id: 'one-mage-army',
        name: 'One-Mage Army',
        description: 'Purchase 1 Mages\' Guild.',
        condition: (stats) => buildings.find(b => b.id === 'mages-guild')?.owned >= 1,
        isEarned: false
    },
    {
        id: 'new-locations',
        name: 'New Locations',
        description: 'Purchase 25 Mages\' Guild buildings.',
        condition: (stats) => buildings.find(b => b.id === 'mages-guild')?.owned >= 25,
        isEarned: false
    },
    {
        id: 'home-of-the-arcane',
        name: 'Home of the Arcane',
        description: 'Purchase 50 Mages\' Guild.',
        condition: (stats) => buildings.find(b => b.id === 'mages-guild')?.owned >= 50,
        isEarned: false
    },
    {
        id: 'renovations',
        name: 'Renovations',
        description: 'Purchase 100 Mages\' Guild.',
        condition: (stats) => buildings.find(b => b.id === 'mages-guild')?.owned >= 100,
        isEarned: false
    },
    {
        id: 'second-floors',
        name: 'Second Floors',
        description: 'Purchase 200 Mages\' Guild.',
        condition: (stats) => buildings.find(b => b.id === 'mages-guild')?.owned >= 200,
        isEarned: false
    },
    {
        id: 'third-floors',
        name: 'Third Floors',
        description: 'Purchase 500 Mages\' Guild.',
        condition: (stats) => buildings.find(b => b.id === 'mages-guild')?.owned >= 500,
        isEarned: false
    },
    {
        id: 'guild-penthouse',
        name: 'Guild Penthouse',
        description: 'Purchase 1000 Mages\' Guild.',
        condition: (stats) => buildings.find(b => b.id === 'mages-guild')?.owned >= 1000,
        isEarned: false
    },
    // Magic Library Achievements
    {
        id: 'the-magic-library',
        name: 'The Magic Library',
        description: 'Purchase 1 Magic Library.',
        condition: (stats) => buildings.find(b => b.id === 'magic-library')?.owned >= 1,
        isEarned: false
    },
    {
        id: 'spell-stacks',
        name: 'Spell Stacks',
        description: 'Purchase 25 Magic Library.',
        condition: (stats) => buildings.find(b => b.id === 'magic-library')?.owned >= 25,
        isEarned: false
    },
    {
        id: 'arcane-tomes',
        name: 'Arcane Tomes',
        description: 'Purchase 50 Magic Library.',
        condition: (stats) => buildings.find(b => b.id === 'magic-library')?.owned >= 50,
        isEarned: false
    },
    {
        id: 'grimoires',
        name: 'Grimoires',
        description: 'Purchase 100 Magic Library.',
        condition: (stats) => buildings.find(b => b.id === 'magic-library')?.owned >= 100,
        isEarned: false
    },
    {
        id: 'section-elemental-magics',
        name: 'Section for Elemental Magics',
        description: 'Purchase 200 Magic Library.',
        condition: (stats) => buildings.find(b => b.id === 'magic-library')?.owned >= 200,
        isEarned: false
    },
    {
        id: 'divine-scrolls',
        name: 'Divine Scrolls',
        description: 'Purchase 500 Magic Library.',
        condition: (stats) => buildings.find(b => b.id === 'magic-library')?.owned >= 500,
        isEarned: false
    },
    {
        id: 'forbidden-tomes',
        name: 'The Forbidden Tomes',
        description: 'Purchase 1000 Magic Library.',
        condition: (stats) => buildings.find(b => b.id === 'magic-library')?.owned >= 1000,
        isEarned: false
    },
    // Magic Spire Achievements
    {
        id: 'going-up',
        name: 'Going Up',
        description: 'Purchase 1 Magic Spire.',
        condition: (stats) => buildings.find(b => b.id === 'magic-spire')?.owned >= 1,
        isEarned: false
    },
    {
        id: 'whats-the-point',
        name: 'What\'s The Point?',
        description: 'Purchase 25 Magic Spire.',
        condition: (stats) => buildings.find(b => b.id === 'magic-spire')?.owned >= 25,
        isEarned: false
    },
    {
        id: 'from-the-earth',
        name: 'From The Earth',
        description: 'Purchase 50 Magic Spire.',
        condition: (stats) => buildings.find(b => b.id === 'magic-spire')?.owned >= 50,
        isEarned: false
    },
    {
        id: 'to-the-heavens',
        name: 'To the Heavens',
        description: 'Purchase 100 Magic Spire.',
        condition: (stats) => buildings.find(b => b.id === 'magic-spire')?.owned >= 100,
        isEarned: false
    },
    {
        id: 'and-beyond',
        name: 'And Beyond',
        description: 'Purchase 200 Magic Spire.',
        condition: (stats) => buildings.find(b => b.id === 'magic-spire')?.owned >= 200,
        isEarned: false
    },
    {
        id: 'spires-not-slain',
        name: 'Spires Not Slain',
        description: 'Purchase 500 Magic Spire.',
        condition: (stats) => buildings.find(b => b.id === 'magic-spire')?.owned >= 500,
        isEarned: false
    },
    {
        id: 'mystical-revolution',
        name: 'Mystical Revolution',
        description: 'Purchase 1000 Magic Spire.',
        condition: (stats) => buildings.find(b => b.id === 'magic-spire')?.owned >= 1000,
        isEarned: false
    },
    // === HIGHER MANA MILESTONES ===
    { id: 'mana-10q', name: 'Swimming In Mana', description: 'Have 10 quadrillion current Mana.', condition: (stats) => stats.currentMana >= 1e16, isEarned: false },
    { id: 'mana-100q', name: 'Mana Ocean', description: 'Have 100 quadrillion current Mana.', condition: (stats) => stats.currentMana >= 1e17, isEarned: false },
    { id: 'mana-1qi', name: 'Quintillion Dreams', description: 'Have 1 quintillion current Mana.', condition: (stats) => stats.currentMana >= 1e18, isEarned: false },
    { id: 'mana-1sx', name: 'Sextillion Sorcery', description: 'Have 1 sextillion current Mana.', condition: (stats) => stats.currentMana >= 1e21, isEarned: false },
    { id: 'mana-1sp', name: 'Septillion Sage', description: 'Have 1 septillion current Mana.', condition: (stats) => stats.currentMana >= 1e24, isEarned: false },
    // === MPS MILESTONES ===
    { id: 'mps-100', name: 'Trickle', description: 'Reach 100 Mana per second.', condition: () => manaPerSecond >= 100, isEarned: false },
    { id: 'mps-1k', name: 'Stream', description: 'Reach 1,000 Mana per second.', condition: () => manaPerSecond >= 1000, isEarned: false },
    { id: 'mps-10k', name: 'River', description: 'Reach 10,000 Mana per second.', condition: () => manaPerSecond >= 10000, isEarned: false },
    { id: 'mps-100k', name: 'Torrent', description: 'Reach 100,000 Mana per second.', condition: () => manaPerSecond >= 100000, isEarned: false },
    { id: 'mps-1m', name: 'Flood', description: 'Reach 1 million Mana per second.', condition: () => manaPerSecond >= 1e6, isEarned: false },
    { id: 'mps-10m', name: 'Deluge', description: 'Reach 10 million Mana per second.', condition: () => manaPerSecond >= 1e7, isEarned: false },
    { id: 'mps-100m', name: 'Tsunami', description: 'Reach 100 million Mana per second.', condition: () => manaPerSecond >= 1e8, isEarned: false },
    { id: 'mps-1b', name: 'Cataclysm', description: 'Reach 1 billion Mana per second.', condition: () => manaPerSecond >= 1e9, isEarned: false },
    { id: 'mps-10b', name: 'Apocalypse', description: 'Reach 10 billion Mana per second.', condition: () => manaPerSecond >= 1e10, isEarned: false },
    { id: 'mps-100b', name: 'Armageddon', description: 'Reach 100 billion Mana per second.', condition: () => manaPerSecond >= 1e11, isEarned: false },
    { id: 'mps-1t', name: 'Singularity', description: 'Reach 1 trillion Mana per second.', condition: () => manaPerSecond >= 1e12, isEarned: false },
    // === COLLECTION MILESTONES ===
    { id: 'one-of-each', name: 'Diversified Portfolio', description: 'Own at least 1 of every building type.', condition: () => buildings.every(b => b.owned >= 1), isEarned: false },
    { id: 'ten-of-each', name: 'Well-Rounded Wizard', description: 'Own at least 10 of every building type.', condition: () => buildings.every(b => b.owned >= 10), isEarned: false },
    { id: 'twenty-five-of-each', name: 'Master Builder', description: 'Own at least 25 of every building type.', condition: () => buildings.every(b => b.owned >= 25), isEarned: false },
    { id: 'fifty-of-each', name: 'Arcane Architect', description: 'Own at least 50 of every building type.', condition: () => buildings.every(b => b.owned >= 50), isEarned: false },
    { id: 'hundred-of-each', name: 'Empire of Magic', description: 'Own at least 100 of every building type.', condition: () => buildings.every(b => b.owned >= 100), isEarned: false },
    // === SPELL SCHOOL MILESTONES ===
    { id: 'all-schools', name: 'Arcane Scholar', description: 'Purchase all 10 spell school upgrades.', condition: () => ['abjuration','conjuration','divination','evocation','enchantment','illusion','necromancy','summoning','transmutation','prestidigitation'].every(id => upgrades.find(u => u.id === id)?.isPurchased), isEarned: false },
    { id: 'blood-ritualist', name: 'Blood Ritualist', description: 'Purchase both Blood Magic and Ritualist.', condition: () => upgrades.find(u => u.id === 'blood-magic')?.isPurchased && upgrades.find(u => u.id === 'ritualist')?.isPurchased, isEarned: false },
    // === RANK MILESTONES ===
    { id: 'rank-wizard', name: 'Officially A Wizard', description: 'Reach the rank of Wizard.', condition: () => typeof WizardRankModule !== 'undefined' && AchievementsModule.getEarnedCount() >= 54, isEarned: false },
    { id: 'rank-magus', name: 'Magus Rank', description: 'Reach the rank of Magus.', condition: () => typeof WizardRankModule !== 'undefined' && AchievementsModule.getEarnedCount() >= 135, isEarned: false },
    { id: 'rank-archmage', name: 'Archmage Rank', description: 'Reach the rank of Archmage.', condition: () => typeof WizardRankModule !== 'undefined' && AchievementsModule.getEarnedCount() >= 180, isEarned: false },
    // === BUILDING AT 10 (later buildings that are harder to get) ===
    { id: 'fountain-10', name: 'Oasis', description: 'Own 10 Mana Fountains.', condition: () => buildings.find(b => b.id === 'mana-fountain')?.owned >= 10, isEarned: false },
    { id: 'church-10', name: 'Diocese', description: 'Own 10 Churches of Mana.', condition: () => buildings.find(b => b.id === 'church-of-mana')?.owned >= 10, isEarned: false },
    { id: 'guild-10', name: 'Guild Network', description: 'Own 10 Mages\' Guilds.', condition: () => buildings.find(b => b.id === 'mages-guild')?.owned >= 10, isEarned: false },
    { id: 'library-10', name: 'Library System', description: 'Own 10 Magic Libraries.', condition: () => buildings.find(b => b.id === 'magic-library')?.owned >= 10, isEarned: false },
    { id: 'spire-10', name: 'Spire Network', description: 'Own 10 Magic Spires.', condition: () => buildings.find(b => b.id === 'magic-spire')?.owned >= 10, isEarned: false },
    // === APPAREL MILESTONES ===
    { id: 'fully-dressed', name: 'Fully Dressed', description: 'Purchase the Cape, Hat, Mantle, Staff, Broom, and Amulet.', condition: () => ['wizards-cape','wizards-hat','wizards-mantle','wizards-staff','witchs-broom','enchanted-amulet'].every(id => upgrades.find(u => u.id === id)?.isPurchased), isEarned: false },
    // === WISHING WELL LEVEL MILESTONES ===
    { id: 'well-level-2', name: 'Deeper Well', description: 'Reach Wishing Well level 2.', condition: () => typeof WishingWellModule !== 'undefined' && WishingWellModule.getLevel() >= 2, isEarned: false },
    { id: 'well-level-3', name: 'Bottomless Well', description: 'Reach Wishing Well level 3.', condition: () => typeof WishingWellModule !== 'undefined' && WishingWellModule.getLevel() >= 3, isEarned: false },
    { id: 'well-level-4', name: 'Abyssal Well', description: 'Reach Wishing Well level 4.', condition: () => typeof WishingWellModule !== 'undefined' && WishingWellModule.getLevel() >= 4, isEarned: false },
    // === FUN / QUIRKY ===
    { id: 'patience', name: 'Patience', description: 'Have over 1 billion Mana without ever prestiging.', condition: (stats) => stats.currentMana >= 1e9 && (typeof PrestigeModule !== 'undefined' && PrestigeModule.getTimesPrestiged() === 0), isEarned: false },
    { id: 'speed-start', name: 'Speed Start', description: 'Own 10 buildings within your first 100 clicks.', condition: (stats) => stats.totalBuildingsOwned >= 10 && stats.manaByClick < 100000, isEarned: false },
    { id: 'all-challenges', name: 'Challenge Master', description: 'Complete all 6 Ascension Challenges.', condition: () => typeof ChallengesModule !== 'undefined' && ChallengesModule.getSaveData().completedChallenges.length >= 6, isEarned: false },
    // === UPGRADE MILESTONES ===
    { id: 'upgrades-10', name: 'Student', description: 'Purchase 10 upgrades.', condition: (stats) => stats.upgradesPurchased >= 10, isEarned: false },
    { id: 'upgrades-25', name: 'Scholar', description: 'Purchase 25 upgrades.', condition: (stats) => stats.upgradesPurchased >= 25, isEarned: false },
    { id: 'upgrades-50', name: 'Professor', description: 'Purchase 50 upgrades.', condition: (stats) => stats.upgradesPurchased >= 50, isEarned: false },
    { id: 'upgrades-75', name: 'Dean', description: 'Purchase 75 upgrades.', condition: (stats) => stats.upgradesPurchased >= 75, isEarned: false },
    { id: 'upgrades-100', name: 'Chancellor', description: 'Purchase 100 upgrades.', condition: (stats) => stats.upgradesPurchased >= 100, isEarned: false },
    // === TOTAL BUILDINGS MILESTONES ===
    { id: 'buildings-50', name: 'Small Village', description: 'Own 50 total buildings.', condition: (stats) => stats.totalBuildingsOwned >= 50, isEarned: false },
    { id: 'buildings-100', name: 'Town', description: 'Own 100 total buildings.', condition: (stats) => stats.totalBuildingsOwned >= 100, isEarned: false },
    { id: 'buildings-250', name: 'City', description: 'Own 250 total buildings.', condition: (stats) => stats.totalBuildingsOwned >= 250, isEarned: false },
    { id: 'buildings-500', name: 'Metropolis', description: 'Own 500 total buildings.', condition: (stats) => stats.totalBuildingsOwned >= 500, isEarned: false },
    { id: 'buildings-1000', name: 'Empire', description: 'Own 1000 total buildings.', condition: (stats) => stats.totalBuildingsOwned >= 1000, isEarned: false },
    { id: 'buildings-2500', name: 'Dominion', description: 'Own 2500 total buildings.', condition: (stats) => stats.totalBuildingsOwned >= 2500, isEarned: false },
    // === PRESTIGE MILESTONES ===
    { id: 'prestige-1', name: 'First Ascension', description: 'Prestige for the first time.', condition: () => typeof PrestigeModule !== 'undefined' && PrestigeModule.getTimesPrestiged() >= 1, isEarned: false },
    { id: 'prestige-3', name: 'Getting The Hang Of It', description: 'Prestige 3 times.', condition: () => typeof PrestigeModule !== 'undefined' && PrestigeModule.getTimesPrestiged() >= 3, isEarned: false },
    { id: 'prestige-5', name: 'Seasoned Ascender', description: 'Prestige 5 times.', condition: () => typeof PrestigeModule !== 'undefined' && PrestigeModule.getTimesPrestiged() >= 5, isEarned: false },
    { id: 'prestige-10', name: 'Veteran Ascender', description: 'Prestige 10 times.', condition: () => typeof PrestigeModule !== 'undefined' && PrestigeModule.getTimesPrestiged() >= 10, isEarned: false },
    { id: 'prestige-25', name: 'Eternal Ascender', description: 'Prestige 25 times.', condition: () => typeof PrestigeModule !== 'undefined' && PrestigeModule.getTimesPrestiged() >= 25, isEarned: false },
    { id: 'prestige-50', name: 'Ascension Addict', description: 'Prestige 50 times.', condition: () => typeof PrestigeModule !== 'undefined' && PrestigeModule.getTimesPrestiged() >= 50, isEarned: false },
    // === CRYSTAL MILESTONES ===
    { id: 'crystals-5', name: 'Crystal Collector', description: 'Earn 5 total Mana Crystals.', condition: () => typeof PrestigeModule !== 'undefined' && PrestigeModule.getPrestigeData().totalManaCrystalsEarned >= 5, isEarned: false },
    { id: 'crystals-10', name: 'Crystal Hoarder', description: 'Earn 10 total Mana Crystals.', condition: () => typeof PrestigeModule !== 'undefined' && PrestigeModule.getPrestigeData().totalManaCrystalsEarned >= 10, isEarned: false },
    { id: 'crystals-25', name: 'Crystal Baron', description: 'Earn 25 total Mana Crystals.', condition: () => typeof PrestigeModule !== 'undefined' && PrestigeModule.getPrestigeData().totalManaCrystalsEarned >= 25, isEarned: false },
    { id: 'crystals-50', name: 'Crystal Tycoon', description: 'Earn 50 total Mana Crystals.', condition: () => typeof PrestigeModule !== 'undefined' && PrestigeModule.getPrestigeData().totalManaCrystalsEarned >= 50, isEarned: false },
    { id: 'crystals-100', name: 'Crystal Emperor', description: 'Earn 100 total Mana Crystals.', condition: () => typeof PrestigeModule !== 'undefined' && PrestigeModule.getPrestigeData().totalManaCrystalsEarned >= 100, isEarned: false },
    // === SPELL MILESTONES ===
    { id: 'spells-1', name: 'First Incantation', description: 'Cast a spell.', condition: (stats) => stats.spellsCastTotal >= 1, isEarned: false },
    { id: 'spells-10', name: 'Spellslinger', description: 'Cast 10 spells.', condition: (stats) => stats.spellsCastTotal >= 10, isEarned: false },
    { id: 'spells-50', name: 'Frequent Caster', description: 'Cast 50 spells.', condition: (stats) => stats.spellsCastTotal >= 50, isEarned: false },
    { id: 'spells-100', name: 'Spell Weaver', description: 'Cast 100 spells.', condition: (stats) => stats.spellsCastTotal >= 100, isEarned: false },
    { id: 'spells-500', name: 'Spell Savant', description: 'Cast 500 spells.', condition: (stats) => stats.spellsCastTotal >= 500, isEarned: false },
    // === WISHING WELL MILESTONES ===
    { id: 'wishes-1', name: 'First Wish', description: 'Trigger a Wishing Well effect.', condition: () => typeof WishingWellModule !== 'undefined' && WishingWellModule.getEffectTriggerCount() >= 1, isEarned: false },
    { id: 'wishes-10', name: 'Wishful Thinking', description: 'Trigger 10 Wishing Well effects.', condition: () => typeof WishingWellModule !== 'undefined' && WishingWellModule.getEffectTriggerCount() >= 10, isEarned: false },
    { id: 'wishes-25', name: 'Lucky Star', description: 'Trigger 25 Wishing Well effects.', condition: () => typeof WishingWellModule !== 'undefined' && WishingWellModule.getEffectTriggerCount() >= 25, isEarned: false },
    { id: 'wishes-50', name: 'Fortune Favors The Bold', description: 'Trigger 50 Wishing Well effects.', condition: () => typeof WishingWellModule !== 'undefined' && WishingWellModule.getEffectTriggerCount() >= 50, isEarned: false },
    // === CHALLENGE MILESTONES ===
    { id: 'challenge-1', name: 'Challenger', description: 'Complete 1 Ascension Challenge.', condition: () => typeof ChallengesModule !== 'undefined' && ChallengesModule.getSaveData().completedChallenges.length >= 1, isEarned: false },
    { id: 'challenge-3', name: 'Proven', description: 'Complete 3 Ascension Challenges.', condition: () => typeof ChallengesModule !== 'undefined' && ChallengesModule.getSaveData().completedChallenges.length >= 3, isEarned: false },
    { id: 'challenge-6', name: 'Unstoppable', description: 'Complete all 6 Ascension Challenges.', condition: () => typeof ChallengesModule !== 'undefined' && ChallengesModule.getSaveData().completedChallenges.length >= 6, isEarned: false },
    // === TRANSCENDENCE MILESTONES ===
    { id: 'transcend-1', name: 'Beyond', description: 'Transcend for the first time.', condition: () => typeof TranscendenceModule !== 'undefined' && TranscendenceModule.getSaveData().timesTranscended >= 1, isEarned: false },
    { id: 'transcend-3', name: 'Ascended Being', description: 'Transcend 3 times.', condition: () => typeof TranscendenceModule !== 'undefined' && TranscendenceModule.getSaveData().timesTranscended >= 3, isEarned: false },
    { id: 'transcend-5', name: 'Eternal', description: 'Transcend 5 times.', condition: () => typeof TranscendenceModule !== 'undefined' && TranscendenceModule.getSaveData().timesTranscended >= 5, isEarned: false },
    // === SYNERGY MILESTONES ===
    { id: 'synergy-10', name: 'Cooperative', description: 'Have a building synergy bonus reach +10%.', condition: () => buildings.some(b => getSynergyMultiplier(b.id) >= 1.10), isEarned: false },
    { id: 'synergy-50', name: 'Symbiotic', description: 'Have a building synergy bonus reach +50%.', condition: () => buildings.some(b => getSynergyMultiplier(b.id) >= 1.50), isEarned: false },
    { id: 'synergy-100', name: 'Perfectly Balanced', description: 'Have a building synergy bonus reach +100%.', condition: () => buildings.some(b => getSynergyMultiplier(b.id) >= 2.0), isEarned: false },
    // === PROFICIENCY MILESTONES ===
    { id: 'prof-50', name: 'Getting Somewhere', description: 'Reach 50% Magic Proficiency.', condition: () => typeof WizardRankModule !== 'undefined' && WizardRankModule.getMagicProficiency() >= 50, isEarned: false },
    { id: 'prof-100', name: 'Competent', description: 'Reach 100% Magic Proficiency.', condition: () => typeof WizardRankModule !== 'undefined' && WizardRankModule.getMagicProficiency() >= 100, isEarned: false },
    { id: 'prof-200', name: 'Masterful', description: 'Reach 200% Magic Proficiency.', condition: () => typeof WizardRankModule !== 'undefined' && WizardRankModule.getMagicProficiency() >= 200, isEarned: false },
    { id: 'prof-500', name: 'Transcendent Knowledge', description: 'Reach 500% Magic Proficiency.', condition: () => typeof WizardRankModule !== 'undefined' && WizardRankModule.getMagicProficiency() >= 500, isEarned: false },
    { id: 'prof-1000', name: 'Omniscient', description: 'Reach 1000% Magic Proficiency.', condition: () => typeof WizardRankModule !== 'undefined' && WizardRankModule.getMagicProficiency() >= 1000, isEarned: false },
    // === TOTAL MANA EARNED (persists across prestiges) ===
    { id: 'total-1t', name: 'Trillionaire', description: 'Earn 1 trillion total Mana across all runs.', condition: (stats) => stats.manaTotal >= 1e12, isEarned: false },
    { id: 'total-100t', name: 'Hundred Trillionaire', description: 'Earn 100 trillion total Mana.', condition: (stats) => stats.manaTotal >= 1e14, isEarned: false },
    { id: 'total-1q', name: 'Quadrillionaire', description: 'Earn 1 quadrillion total Mana.', condition: (stats) => stats.manaTotal >= 1e15, isEarned: false },
    { id: 'total-1qi', name: 'Quintillionaire', description: 'Earn 1 quintillion total Mana.', condition: (stats) => stats.manaTotal >= 1e18, isEarned: false },
    { id: 'total-1sx', name: 'Sextillionaire', description: 'Earn 1 sextillion total Mana.', condition: (stats) => stats.manaTotal >= 1e21, isEarned: false },
    // === MANA PER CLICK MILESTONES ===
    { id: 'mpc-100', name: 'Heavy Hitter', description: 'Reach 100 Mana per click.', condition: () => manaPerClick >= 100, isEarned: false },
    { id: 'mpc-1k', name: 'Power Tap', description: 'Reach 1,000 Mana per click.', condition: () => manaPerClick >= 1000, isEarned: false },
    { id: 'mpc-10k', name: 'Mighty Tap', description: 'Reach 10,000 Mana per click.', condition: () => manaPerClick >= 10000, isEarned: false },
    { id: 'mpc-100k', name: 'Devastating Tap', description: 'Reach 100,000 Mana per click.', condition: () => manaPerClick >= 100000, isEarned: false },
    { id: 'mpc-1m', name: 'World-Shaking Tap', description: 'Reach 1 million Mana per click.', condition: () => manaPerClick >= 1e6, isEarned: false },
    ];


    let earnedCount = 0;

    function updateDismissAllButton() {
        const notificationArea = document.getElementById('notification-area');
        if (!notificationArea) return;

        const notifications = notificationArea.querySelectorAll('.notification');
        let dismissAllBtn = document.getElementById('dismiss-all-notifications');

        if (notifications.length >= 3) {
            if (!dismissAllBtn) {
                dismissAllBtn = document.createElement('button');
                dismissAllBtn.id = 'dismiss-all-notifications';
                dismissAllBtn.className = 'dismiss-all-button';
                dismissAllBtn.setAttribute('aria-label', 'Dismiss all notifications');
                dismissAllBtn.textContent = 'Dismiss All';
                dismissAllBtn.addEventListener('click', () => {
                    const allNotifications = notificationArea.querySelectorAll('.notification');
                    allNotifications.forEach(n => n.remove());
                    dismissAllBtn.remove();
                });
                notificationArea.prepend(dismissAllBtn);
            }
        } else if (dismissAllBtn) {
            dismissAllBtn.remove();
        }
    }

    function showNotification(achievementName, achievementDescription) {
        const notificationArea = document.getElementById('notification-area');
        if (!notificationArea) return;

        // Visible notification (notification-area has aria-live="assertive"
        // so content changes are automatically announced — no separate
        // role="alert" needed, which would cause double-announcement)
        const notification = document.createElement('div');
        notification.className = 'notification';

        const dismissBtn = document.createElement('button');
        dismissBtn.className = 'notification-dismiss';
        dismissBtn.setAttribute('aria-label', 'Dismiss notification');
        dismissBtn.textContent = 'X';
        dismissBtn.addEventListener('click', () => {
            notification.remove();
            updateDismissAllButton();
        });

        const title = document.createElement('p');
        title.className = 'notification-title';
        title.textContent = 'New Achievement!';

        const content = document.createElement('p');
        content.className = 'notification-content';
        content.textContent = `${achievementName} — ${achievementDescription}`;

        notification.appendChild(dismissBtn);
        notification.appendChild(title);
        notification.appendChild(content);

        notificationArea.prepend(notification);
        updateDismissAllButton();
    }

    function getHTML() {
        return `
        <section id="achievements-panel" class="game-panel" hidden>
            <h2 id="achievements-heading" tabindex="-1">Achievements</h2>
            <div id="wizard-rank-display" class="wizard-rank-section">
                <p><strong>Wizard Rank:</strong> <span id="wizard-rank-name">Mana-Blind</span></p>
                <p><strong>Magic Proficiency:</strong> <span id="magic-proficiency">0%</span></p>
                <p id="rank-progress">25 achievements until Initiate</p>
            </div>
            <p id="achievements-count">Achievements Earned: <span>0</span></p>
            <div id="achievements-container" aria-labelledby="achievements-heading">
                <ul id="achievements-list" class="achievements-list"></ul>
            </div>
        </section>`;
    }

    function renderAchievements() {
        const list = document.getElementById('achievements-list');
        if (!list) return;

        list.innerHTML = '';
        achievements.forEach(achievement => {
            if (achievement.isEarned) {
                const li = document.createElement('li');
                li.className = 'achievement-item earned';
                li.innerHTML = `
                    <span class="achievement-name">${achievement.name}</span>
                    <span class="achievement-description">${achievement.description}</span>
                `;
                list.appendChild(li);
            }
        });

        document.querySelector('#achievements-count span').textContent = earnedCount;

        // Update wizard rank display
        if (typeof WizardRankModule !== 'undefined') {
            WizardRankModule.updateDisplay();
        }
    }

    function checkAchievements(stats) {
        let newAchievements = false;
        achievements.forEach(achievement => {
            if (!achievement.isEarned && achievement.condition(stats)) {
                achievement.isEarned = true;
                earnedCount++;
                newAchievements = true;
                StatisticsModule.addAchievementEarned();
                showNotification(achievement.name, achievement.description);

                // Play achievement sound
                if (typeof SoundModule !== 'undefined') {
                    SoundModule.play('achievement');
                }
            }
        });

        if (newAchievements) {
            renderAchievements();
        }
    }

    function getEarnedCount() {
        return earnedCount;
    }

    function getAchievements() {
        return achievements;
    }

    function loadAchievements(savedAchievements) {
        if (savedAchievements) {
            earnedCount = 0;
            savedAchievements.forEach(savedAch => {
                const achievement = achievements.find(a => a.id === savedAch.id);
                if (achievement) {
                    achievement.isEarned = savedAch.isEarned || false;
                    if (achievement.isEarned) {
                        earnedCount++;
                    }
                }
            });
        }
    }

    function reset() {
        earnedCount = 0;
        achievements.forEach(achievement => {
            achievement.isEarned = false;
        });
    }

    return {
        getHTML,
        renderAchievements,
        checkAchievements,
        getEarnedCount,
        getAchievements,
        loadAchievements,
        reset
    };
})();
