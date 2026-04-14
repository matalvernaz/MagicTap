// Flavor Events Module
const FlavorEventsModule = (function() {
    // Events can be strings (always visible) or objects with text and unlockCondition
    const flavorTexts = [
        'The air shimmers with magical potential.',
        'A faint hum of arcane energy fills the room.',
        'Motes of light dance at the edge of your vision.',
        'You sense a surge in the ley lines.',
        'The mana flows strongly today.',
        'Ancient whispers echo through the aether.',
        'A cool breeze carries the scent of magic.',
        'The crystals pulse with inner light.',
        'Somewhere, a spell is being cast.',
        'The veil between worlds grows thin.',
        'You feel your power growing.',
        'The stars align in your favor.',
        'A distant tower glows on the horizon.',
        'The familiar hum of magic comforts you.',
        'Runes flicker briefly in the shadows.',
        // === INSERT NEW EVENTS HERE ===
        // Ley Line events (unlocked after purchasing 1 Ley Line)
        { text: 'Light from the Ley Lines illuminate a distant city.', unlockCondition: () => buildings.find(b => b.id === 'ley-line').owned >= 1 },
        { text: 'The Ley Lines appear to mesmerize both people and animals.', unlockCondition: () => buildings.find(b => b.id === 'ley-line').owned >= 1 },
        // Mana Crystal events (unlocked after purchasing 1 Mana Crystal)
        { text: 'Crystals sit upon pedestals situated in a circle.', unlockCondition: () => buildings.find(b => b.id === 'mana-crystal').owned >= 1 },
        { text: 'Crystals begin to crack, overflowing with power.', unlockCondition: () => buildings.find(b => b.id === 'mana-crystal').owned >= 1 },
        // Mana Shard events
        { text: 'Shards of pure magic reflect rainbows across the walls.', unlockCondition: () => buildings.find(b => b.id === 'mana-shard')?.owned >= 1 },
        { text: 'The shards hum with a frequency only mages can hear.', unlockCondition: () => buildings.find(b => b.id === 'mana-shard')?.owned >= 1 },
        // Mana Fountain events (unlocked after purchasing 1 Mana Fountain)
        { text: 'Mana bubbles eerily like water.', unlockCondition: () => buildings.find(b => b.id === 'mana-fountain')?.owned >= 1 },
        { text: 'Mana laps at the edges of the constructed fountains.', unlockCondition: () => buildings.find(b => b.id === 'mana-fountain')?.owned >= 1 },
        { text: 'You discover another pocket of Mana within a cave.', unlockCondition: () => buildings.find(b => b.id === 'mana-fountain')?.owned >= 1 },
        { text: 'Natural Mana Fountains burble softly.', unlockCondition: () => buildings.find(b => b.id === 'mana-fountain')?.owned >= 1 },
        { text: 'Somebody mistakes the glow of Mana for something else... how silly of them.', unlockCondition: () => buildings.find(b => b.id === 'mana-fountain')?.owned >= 1 },
        // Church of Mana events
        { text: 'Worshippers chant in unison, their voices echoing with power.', unlockCondition: () => buildings.find(b => b.id === 'church-of-mana')?.owned >= 1 },
        { text: 'The stained glass windows depict scenes of the Weave.', unlockCondition: () => buildings.find(b => b.id === 'church-of-mana')?.owned >= 1 },
        // Mages\' Guild events
        { text: 'Apprentices practice their cantrips in the courtyard.', unlockCondition: () => buildings.find(b => b.id === 'mages-guild')?.owned >= 1 },
        { text: 'A heated debate about spell theory echoes from the guild hall.', unlockCondition: () => buildings.find(b => b.id === 'mages-guild')?.owned >= 1 },
        // Magic Library events
        { text: 'Ancient tomes whisper secrets to those who listen.', unlockCondition: () => buildings.find(b => b.id === 'magic-library')?.owned >= 1 },
        { text: 'A forbidden text glows ominously on a distant shelf.', unlockCondition: () => buildings.find(b => b.id === 'magic-library')?.owned >= 1 },
        // Magic Spire events
        { text: 'The spire\'s peak is lost in clouds of pure magical energy.', unlockCondition: () => buildings.find(b => b.id === 'magic-spire')?.owned >= 1 },
        { text: 'Lightning arcs between the spires, dancing with arcane purpose.', unlockCondition: () => buildings.find(b => b.id === 'magic-spire')?.owned >= 1 },
    ];

    // Interactive events - these offer a choice with risk/reward
    const interactiveEvents = [
        {
            id: 'wandering-merchant',
            text: 'A wandering merchant offers to trade...',
            buttonText: 'Trade',
            buttonLabel: 'Trade with the wandering merchant for a chance at bonus Mana',
            unlockCondition: () => mana >= 100,
            action: () => {
                const cost = manaPerSecond * 10; // 10 seconds of production
                if (mana >= cost && cost > 0) {
                    mana -= cost;
                    const reward = cost * (1.5 + Math.random() * 2); // 1.5x to 3.5x return
                    mana += reward;
                    return `The merchant's wares prove valuable! Gained ${formatInteractiveNumber(reward - cost)} Mana.`;
                }
                return 'You have nothing the merchant wants.';
            }
        },
        {
            id: 'mana-surge-event',
            text: 'A wild surge of Mana erupts nearby!',
            buttonText: 'Channel It',
            buttonLabel: 'Attempt to channel the wild Mana surge',
            unlockCondition: () => manaPerSecond > 0,
            action: () => {
                if (Math.random() < 0.7) {
                    const bonus = manaPerSecond * 30;
                    mana += bonus;
                    if (typeof StatisticsModule !== 'undefined') StatisticsModule.addManaByBuildings(bonus);
                    return `You successfully channel the surge! +${formatInteractiveNumber(bonus)} Mana.`;
                } else {
                    return 'The surge was too powerful and dissipates before you can harness it.';
                }
            }
        },
        {
            id: 'ancient-tome',
            text: 'You discover a dusty tome hidden behind a bookshelf...',
            buttonText: 'Read It',
            buttonLabel: 'Read the ancient tome for a temporary boost',
            unlockCondition: () => (typeof StatisticsModule !== 'undefined' && StatisticsModule.getStats().upgradesPurchased >= 5),
            action: () => {
                // Temporary MPS boost via a quick runestone-like effect
                if (typeof RunestonesModule !== 'undefined') {
                    RunestonesModule.spawnRunestone();
                    return 'The tome\'s knowledge summons a Runestone!';
                }
                return 'The pages crumble to dust as you read them.';
            }
        },
        {
            id: 'mysterious-stranger',
            text: 'A cloaked figure approaches and gestures toward your buildings...',
            buttonText: 'Accept Help',
            buttonLabel: 'Accept the mysterious stranger\'s help for a production boost',
            unlockCondition: () => buildings.some(b => b.owned >= 10),
            action: () => {
                if (Math.random() < 0.6) {
                    const bonus = manaPerSecond * 60; // 60 seconds of production
                    mana += bonus;
                    if (typeof StatisticsModule !== 'undefined') StatisticsModule.addManaByBuildings(bonus);
                    return `The stranger enchants your buildings! +${formatInteractiveNumber(bonus)} Mana.`;
                } else {
                    const loss = mana * 0.05;
                    mana -= loss;
                    return `The stranger was a trickster! Lost ${formatInteractiveNumber(loss)} Mana.`;
                }
            }
        },
        {
            id: 'crystal-formation',
            text: 'A rare crystal formation begins growing in your domain...',
            buttonText: 'Harvest',
            buttonLabel: 'Harvest the crystal formation for Mana',
            unlockCondition: () => mana >= 10000,
            action: () => {
                const bonus = manaPerSecond * 45;
                mana += bonus;
                if (typeof StatisticsModule !== 'undefined') StatisticsModule.addManaByBuildings(bonus);
                return `Beautiful crystals! +${formatInteractiveNumber(bonus)} Mana harvested.`;
            }
        },
        {
            id: 'spell-echo',
            text: 'An echo of a powerful spell reverberates through the aether...',
            buttonText: 'Absorb',
            buttonLabel: 'Absorb the spell echo for Spell Power',
            unlockCondition: () => (typeof SpellcastingModule !== 'undefined' && upgrades.find(u => u.id === 'spellcasting')?.isPurchased),
            action: () => {
                // This grants instant spell power, but we can't directly set it
                // Instead, summon a positive runestone
                if (typeof RunestonesModule !== 'undefined') {
                    RunestonesModule.spawnRunestone();
                    return 'The echo manifests as a Runestone!';
                }
                return 'The echo fades away.';
            }
        }
    ];

    // Story milestones - one-time narrative events at key progression points
    const storyMilestones = [
        { id: 'story-100', condition: () => mana >= 100, text: 'The Mana feels less foreign now. Your hands remember the motions, your mind the patterns. You are no longer fumbling in the dark \u2014 you are learning.' },
        { id: 'story-first-eye', condition: () => buildings.find(b => b.id === 'wizards-eye')?.owned >= 1, text: 'Your first Wizard\'s Eye opens, and the world shifts. You can see the currents of Mana flowing through everything \u2014 the walls, the floor, the air itself. How did you ever live without this sight?' },
        { id: 'story-1000', condition: () => mana >= 1000, text: 'A thousand Mana. A week ago, you could not have imagined this much power. Other wizards are beginning to take notice of you.' },
        { id: 'story-first-magus', condition: () => buildings.find(b => b.id === 'magus')?.owned >= 1, text: 'Your first Magus arrives \u2014 a fellow practitioner drawn by the growing concentration of Mana around your domain. "Impressive work for a novice," they say. You decide to take it as a compliment.' },
        { id: 'story-10000', condition: () => mana >= 10000, text: 'Word of your abilities has spread beyond the local villages. Travelers come seeking enchantments, merchants offer rare components. You are becoming someone of consequence.' },
        { id: 'story-ley-line', condition: () => buildings.find(b => b.id === 'ley-line')?.owned >= 1, text: 'You tap your first Ley Line and gasp. The raw power flowing beneath the earth dwarfs anything you have gathered by hand. The planet itself is a wellspring of magic, and you have learned to drink from it.' },
        { id: 'story-100000', condition: () => mana >= 100000, text: 'Your tower rises above the treeline now, visible for miles. At night, it glows faintly purple. Apprentices have begun arriving uninvited. You suppose you should teach them something.' },
        { id: 'story-million', condition: () => mana >= 1000000, text: 'A million Mana. The Council of Wizards has sent an emissary. They wish to know your intentions. You tell them you are merely a student of the arcane. They do not look convinced.' },
        { id: 'story-church', condition: () => buildings.find(b => b.id === 'church-of-mana')?.owned >= 1, text: 'The Church of Mana opens its doors. Worshippers come to pay tribute to the Weave itself \u2014 and, perhaps, to you. It is an uncomfortable thought. You are no god. Not yet, at least.' },
        { id: 'story-10million', condition: () => mana >= 10000000, text: 'The landscape around your domain has changed. Trees grow taller, flowers bloom in impossible colors, and animals speak in hushed tones. Your Mana has seeped into the world itself.' },
        { id: 'story-guild', condition: () => buildings.find(b => b.id === 'mages-guild')?.owned >= 1, text: 'The Mages\' Guild you founded is now the foremost center of arcane learning in the realm. Scholars travel from distant lands to study here. The irony is not lost on you \u2014 you were self-taught.' },
        { id: 'story-100million', condition: () => mana >= 100000000, text: 'Kings and queens seek your counsel. Wars are avoided with a word from you. The power you wield is no longer just magical \u2014 it is political. You must be careful.' },
        { id: 'story-billion', condition: () => mana >= 1000000000, text: 'A billion Mana. You can feel the Weave itself bending toward you, as if drawn by gravity. You stand at the threshold of something ancient and vast. The prestige of Ascension calls to you.' },
        { id: 'story-first-prestige', condition: () => (typeof PrestigeModule !== 'undefined' && PrestigeModule.getTimesPrestiged() >= 1), text: 'You have ascended and been reborn. The memories of your past life linger like a dream \u2014 the tower, the guild, the worshippers. All gone. But the crystals remain, and with them, the knowledge of what you can become. This time, you will go further.' },
        { id: 'story-spire', condition: () => buildings.find(b => b.id === 'magic-spire')?.owned >= 1, text: 'The Magic Spire pierces the veil between realms. Through its peak, you glimpse other worlds \u2014 worlds made entirely of Mana, worlds where magic is as natural as breathing. One day, you will walk among them.' },
        { id: 'story-trillion', condition: () => mana >= 1000000000000, text: 'A trillion Mana. You are no longer a wizard. The word is too small. You are a force of nature, a living conduit between the mundane and the infinite. What comes next, no one alive can tell you. You must discover it yourself.' }
    ];
    const triggeredMilestones = new Set();

    function checkStoryMilestones() {
        if (!eventsLog) return;
        storyMilestones.forEach(milestone => {
            if (triggeredMilestones.has(milestone.id)) return;
            try {
                if (milestone.condition()) {
                    triggeredMilestones.add(milestone.id);
                    showStoryMilestone(milestone.text);
                }
            } catch (e) { /* ignore */ }
        });
    }

    function showStoryMilestone(text) {
        const eventElement = document.createElement('div');
        eventElement.className = 'flavor-event story-milestone';
        eventElement.setAttribute('role', 'status');
        eventElement.setAttribute('aria-live', 'polite');
        eventElement.textContent = text;

        eventsLog.prepend(eventElement);

        // Remove oldest if over max
        while (eventsLog.children.length > MAX_MESSAGES) {
            eventsLog.removeChild(eventsLog.lastChild);
        }

        // Play a sound
        if (typeof SoundModule !== 'undefined') {
            SoundModule.play('achievement');
        }
    }

    function loadTriggeredMilestones(ids) {
        if (Array.isArray(ids)) {
            ids.forEach(id => triggeredMilestones.add(id));
        }
    }

    function getTriggeredMilestones() {
        return Array.from(triggeredMilestones);
    }

    function formatInteractiveNumber(num) {
        if (typeof OptionsModule !== 'undefined' && OptionsModule.formatNumber) {
            return OptionsModule.formatNumber(Math.floor(num));
        }
        return Math.floor(num).toString();
    }

    let eventsLog = null;
    let timeoutId = null;
    const MAX_MESSAGES = 5;

    function init() {
        eventsLog = document.getElementById('events-log');
        scheduleNextEvent();
        // Check milestones every 2 seconds
        setInterval(checkStoryMilestones, 2000);
    }

    function getRandomInterval() {
        // Random number between 45 and 300 seconds
        return (Math.floor(Math.random() * 256) + 45) * 1000;
    }

    function getAvailableEvents() {
        // Filter to only events that are unlocked
        return flavorTexts.filter(event => {
            if (typeof event === 'string') {
                return true; // Simple strings are always available
            }
            // Object with unlockCondition
            if (event.unlockCondition) {
                try {
                    return event.unlockCondition();
                } catch (e) {
                    return false;
                }
            }
            return true;
        });
    }

    function getEventText(event) {
        if (typeof event === 'string') {
            return event;
        }
        return event.text;
    }

    function getRandomFlavorText() {
        const available = getAvailableEvents();
        if (available.length === 0) return null;
        const event = available[Math.floor(Math.random() * available.length)];
        return getEventText(event);
    }

    function getAvailableInteractiveEvents() {
        return interactiveEvents.filter(event => {
            if (event.unlockCondition) {
                try { return event.unlockCondition(); } catch (e) { return false; }
            }
            return true;
        });
    }

    function showFlavorEvent() {
        if (!eventsLog) return;

        // 25% chance of interactive event (if any are available)
        const availableInteractive = getAvailableInteractiveEvents();
        if (availableInteractive.length > 0 && Math.random() < 0.25) {
            showInteractiveEvent(availableInteractive);
            scheduleNextEvent();
            return;
        }

        const message = getRandomFlavorText();
        if (!message) {
            scheduleNextEvent();
            return;
        }

        const eventElement = document.createElement('p');
        eventElement.textContent = message;
        eventElement.className = 'flavor-event';
        eventElement.setAttribute('role', 'status');
        eventElement.setAttribute('aria-live', 'polite');
        eventElement.setAttribute('aria-atomic', 'true');

        // Insert at the top
        eventsLog.prepend(eventElement);

        // Remove aria-live after announcement to prevent re-reading
        setTimeout(() => {
            eventElement.removeAttribute('aria-live');
            eventElement.removeAttribute('role');
        }, 1000);

        // Remove oldest if over max
        while (eventsLog.children.length > MAX_MESSAGES) {
            eventsLog.removeChild(eventsLog.lastChild);
        }

        // Schedule next event
        scheduleNextEvent();
    }

    function showInteractiveEvent(available) {
        if (!eventsLog) return;

        // Play sound to alert the player
        if (typeof SoundModule !== 'undefined') {
            SoundModule.play('menuOpen');
        }

        // Screen reader announcement
        const srAlert = document.createElement('span');
        srAlert.className = 'sr-only';
        srAlert.setAttribute('role', 'alert');
        srAlert.textContent = 'An interactive event has appeared in the events log.';
        eventsLog.appendChild(srAlert);
        setTimeout(() => srAlert.remove(), 2000);

        const event = available[Math.floor(Math.random() * available.length)];

        const eventElement = document.createElement('div');
        eventElement.className = 'flavor-event interactive-event';
        eventElement.setAttribute('role', 'region');
        eventElement.setAttribute('aria-label', 'Interactive event: ' + event.text);

        const textSpan = document.createElement('span');
        textSpan.className = 'interactive-event-text';
        textSpan.textContent = event.text;

        const actionBtn = document.createElement('button');
        actionBtn.className = 'interactive-event-button';
        actionBtn.textContent = event.buttonText;
        actionBtn.setAttribute('aria-label', event.buttonLabel);

        actionBtn.addEventListener('click', () => {
            const result = event.action();
            // Replace the event with the result
            eventElement.innerHTML = '';
            eventElement.className = 'flavor-event interactive-event-result';
            const resultText = document.createElement('span');
            resultText.textContent = result;
            resultText.setAttribute('role', 'status');
            resultText.setAttribute('aria-live', 'polite');
            eventElement.appendChild(resultText);

            // Fade out after 8 seconds
            setTimeout(() => {
                eventElement.style.opacity = '0';
                eventElement.style.transition = 'opacity 0.5s';
                setTimeout(() => {
                    if (eventElement.parentNode) eventElement.remove();
                }, 500);
            }, 8000);
        });

        eventElement.appendChild(textSpan);
        eventElement.appendChild(actionBtn);

        // Insert at the top
        eventsLog.prepend(eventElement);

        // Auto-expire if not clicked after 30 seconds
        setTimeout(() => {
            if (eventElement.querySelector('.interactive-event-button')) {
                eventElement.style.opacity = '0';
                eventElement.style.transition = 'opacity 0.5s';
                setTimeout(() => {
                    if (eventElement.parentNode) eventElement.remove();
                }, 500);
            }
        }, 30000);

        // Remove oldest if over max
        while (eventsLog.children.length > MAX_MESSAGES) {
            eventsLog.removeChild(eventsLog.lastChild);
        }
    }

    function scheduleNextEvent() {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(showFlavorEvent, getRandomInterval());
    }

    function addFlavorText(text) {
        flavorTexts.push(text);
    }

    function getFlavorTexts() {
        return flavorTexts;
    }

    return {
        init,
        addFlavorText,
        getFlavorTexts,
        loadTriggeredMilestones,
        getTriggeredMilestones
    };
})();
