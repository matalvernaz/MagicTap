// Tutorial Module - Guided narrative intro for new players
const TutorialModule = (function() {
    let currentStep = 0;
    let isComplete = false;
    let tutorialElement = null;

    const steps = [
        {
            text: 'You awaken in a dim chamber, surrounded by ancient stone walls. Faint light pulses from cracks in the ceiling \u2014 not sunlight, but something else. Something alive. You reach out, and the air hums at your touch. This is Mana, the raw stuff of magic. And you can feel it.',
            buttonText: 'Reach out...',
            buttonLabel: 'Continue the story',
            trigger: null // Shows immediately
        },
        {
            text: 'Your fingers tingle as Mana flows through you for the first time. You are no wizard \u2014 not yet. But even the greatest archmages began with a single spark. Try gathering Mana. Focus your will and tap into the flow around you.',
            buttonText: 'I understand',
            buttonLabel: 'Dismiss and try gathering Mana',
            trigger: null,
            highlight: 'gather-mana-button'
        },
        {
            text: 'You can feel it now \u2014 a trickle of power, small but real. The Mana responds to your intent. With enough of it, you could summon spectral hands to gather for you, even while you rest. Look to the buildings below.',
            buttonText: 'Show me',
            buttonLabel: 'Dismiss and explore buildings',
            trigger: 'firstClick' // After first mana gather
        },
        {
            text: 'Excellent. Your first Wizard\'s Hand works tirelessly, pulling Mana from the aether. But raw gathering is inefficient. Study the arcane arts \u2014 upgrades will amplify everything you do. Each one is a step on your path to mastery.',
            buttonText: 'I will study',
            buttonLabel: 'Dismiss and explore upgrades',
            trigger: 'firstBuilding' // After buying first building
        },
        {
            text: 'You are learning quickly. The path of a wizard is long: you will discover new schools of magic, construct ley lines that draw power from the earth itself, and eventually learn to crystallize Mana into permanent form. Some say the truly powerful can even transcend their mortal limits through a ritual called Prestige \u2014 sacrificing everything to be reborn stronger. But that is a tale for another day. For now, gather. Build. Learn. Your journey has only just begun.',
            buttonText: 'Begin my journey',
            buttonLabel: 'Complete the tutorial and begin playing',
            trigger: 'firstUpgrade' // After buying first upgrade
        }
    ];

    function init() {
        // Don't show tutorial if there's existing save data
        if (localStorage.getItem('magictap_save')) {
            isComplete = true;
            return;
        }
        if (localStorage.getItem('magictap_tutorial_complete')) {
            isComplete = true;
            return;
        }

        showStep(0);
    }

    function showStep(stepIndex) {
        if (stepIndex >= steps.length) {
            completeTutorial();
            return;
        }

        currentStep = stepIndex;
        const step = steps[stepIndex];

        // Remove previous tutorial element
        if (tutorialElement && tutorialElement.parentNode) {
            tutorialElement.remove();
        }

        tutorialElement = document.createElement('div');
        tutorialElement.className = 'tutorial-overlay';
        tutorialElement.setAttribute('role', 'dialog');
        tutorialElement.setAttribute('aria-label', 'Tutorial');
        tutorialElement.setAttribute('aria-modal', 'true');

        const box = document.createElement('div');
        box.className = 'tutorial-box';

        const text = document.createElement('p');
        text.className = 'tutorial-text';
        text.textContent = step.text;

        const btn = document.createElement('button');
        btn.className = 'tutorial-button';
        btn.textContent = step.buttonText;
        btn.setAttribute('aria-label', step.buttonLabel);
        btn.addEventListener('click', () => {
            tutorialElement.remove();
            tutorialElement = null;

            // Highlight an element if specified
            if (step.highlight) {
                const el = document.getElementById(step.highlight);
                if (el) {
                    el.classList.add('tutorial-highlight');
                    setTimeout(() => el.classList.remove('tutorial-highlight'), 5000);
                    el.focus();
                }
            }

            // Queue the next step if it has no trigger (show immediately)
            // or wait for the trigger
            const nextStep = steps[currentStep + 1];
            if (nextStep && !nextStep.trigger) {
                // Small delay so the player can see the highlighted element
                setTimeout(() => showStep(currentStep + 1), step.highlight ? 2000 : 500);
            }
            // Steps with triggers are shown by checkTriggers()
        });

        box.appendChild(text);
        box.appendChild(btn);
        tutorialElement.appendChild(box);
        document.body.appendChild(tutorialElement);

        // Focus the button for accessibility
        setTimeout(() => btn.focus(), 100);
    }

    function checkTriggers(triggerName) {
        if (isComplete) return;
        if (tutorialElement) return; // Already showing a step

        for (let i = currentStep + 1; i < steps.length; i++) {
            if (steps[i].trigger === triggerName) {
                setTimeout(() => showStep(i), 500);
                return;
            }
        }
    }

    function completeTutorial() {
        isComplete = true;
        localStorage.setItem('magictap_tutorial_complete', 'true');

        if (tutorialElement && tutorialElement.parentNode) {
            tutorialElement.remove();
            tutorialElement = null;
        }
    }

    function isActive() {
        return !isComplete;
    }

    function reset() {
        isComplete = false;
        currentStep = 0;
        localStorage.removeItem('magictap_tutorial_complete');
    }

    return {
        init,
        checkTriggers,
        isActive,
        completeTutorial,
        reset
    };
})();
