// Options Module
const OptionsModule = (function() {
    const options = {
        soundEnabled: true,
        notificationsEnabled: true,
        autoSaveEnabled: true,
        autoSaveInterval: 30,
        truncateLargeNumbers: false,
        numberFormat: 'basic', // 'basic' or 'scientific'
        autoGatherEnabled: true,      // overrides Arcane Auto-Gather prestige upgrade
        autoBuyEnabled: true,         // overrides Arcane Automation prestige upgrade
        autocastSpellsEnabled: true,  // overrides Eternal Cantrip transcendence
        autoWellEnabled: true         // overrides Prolific Wish transcendence
    };

    function getHTML() {
        return `
        <section id="options-panel" class="game-panel" hidden>
            <h2 id="options-heading" tabindex="-1">Options</h2>
            <div id="options-container" aria-labelledby="options-heading">
                <div class="option-group">
                    <h3>Save</h3>
                    <button id="save-game-button">Save Game</button>
                    <button id="load-game-button">Load Game</button>
                    <button id="export-save-button">Export Save</button>
                    <button id="import-save-button">Import Save</button>
                </div>
                <div class="option-group">
                    <h3>Settings</h3>
                    <label class="option-item">
                        <input type="checkbox" id="option-sound" checked>
                        Enable Sound
                    </label>
                    <label class="option-item volume-slider">
                        <span>Volume:</span>
                        <input type="range" id="option-volume" min="0" max="100" value="50">
                        <span id="volume-display">50%</span>
                    </label>
                    <label class="option-item">
                        <input type="checkbox" id="option-notifications" checked>
                        Enable Notifications
                    </label>
                    <label class="option-item">
                        <input type="checkbox" id="option-autosave" checked>
                        Enable Auto-Save
                    </label>
                </div>
                <div class="option-group">
                    <h3>Automation</h3>
                    <p class="option-help">These toggles override your purchased automation upgrades. Turn them off if you want to manage buildings, rankings, spells, or the Wishing Well yourself this run.</p>
                    <label class="option-item">
                        <input type="checkbox" id="option-auto-gather" checked>
                        Enable Arcane Auto-Gather (auto-click once per second)
                    </label>
                    <label class="option-item">
                        <input type="checkbox" id="option-auto-buy" checked>
                        Enable Arcane Automation (auto-buy cheapest upgrade &amp; building every 3 seconds)
                    </label>
                    <label class="option-item">
                        <input type="checkbox" id="option-autocast-spells" checked>
                        Enable Eternal Cantrip (autocast spells at near-full Spell Power)
                    </label>
                    <label class="option-item">
                        <input type="checkbox" id="option-auto-well" checked>
                        Enable Prolific Wish (auto-trigger Wishing Well at max coins)
                    </label>
                </div>
                <div class="option-group">
                    <h3>Number Display</h3>
                    <label class="option-item">
                        <input type="checkbox" id="option-truncate">
                        Truncate Large Numbers
                    </label>
                    <label class="option-item">
                        <span id="number-format-label">Number Format:</span>
                        <select id="option-number-format" aria-labelledby="number-format-label">
                            <option value="basic">Basic Numbers</option>
                            <option value="scientific">Scientific Notation</option>
                        </select>
                    </label>
                </div>
                <div class="option-group">
                    <button id="save-options-button">Save Changes</button>
                </div>
                <div class="option-group">
                    <h3>Keyboard Shortcuts</h3>
                    <ul class="shortcuts-list" aria-label="Keyboard shortcuts">
                        <li><kbd>G</kbd> Gather Mana</li>
                        <li><kbd>S</kbd> Statistics</li>
                        <li><kbd>A</kbd> Achievements</li>
                        <li><kbd>U</kbd> Purchased Upgrades</li>
                        <li><kbd>D</kbd> Production</li>
                        <li><kbd>P</kbd> Prestige</li>
                        <li><kbd>C</kbd> Challenges</li>
                        <li><kbd>W</kbd> Wishing Well</li>
                        <li><kbd>L</kbd> Spellcasting</li>
                        <li><kbd>O</kbd> Options</li>
                    </ul>
                </div>
                <div class="option-group danger-zone">
                    <h3>Danger Zone</h3>
                    <button id="reset-game-button" class="danger-button">Reset Game</button>
                </div>
            </div>
        </section>`;
    }

    function init() {
        // Set up event listeners for options
        const soundCheckbox = document.getElementById('option-sound');
        const notificationsCheckbox = document.getElementById('option-notifications');
        const autosaveCheckbox = document.getElementById('option-autosave');

        if (soundCheckbox) {
            soundCheckbox.addEventListener('change', (e) => {
                options.soundEnabled = e.target.checked;
                // Sync with SoundModule
                if (typeof SoundModule !== 'undefined') {
                    SoundModule.setEnabled(e.target.checked);
                }
            });
        }

        // Volume slider
        const volumeSlider = document.getElementById('option-volume');
        const volumeDisplay = document.getElementById('volume-display');

        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                const volume = parseInt(e.target.value) / 100;
                if (volumeDisplay) {
                    volumeDisplay.textContent = e.target.value + '%';
                }
                // Sync with SoundModule
                if (typeof SoundModule !== 'undefined') {
                    SoundModule.setMasterVolume(volume);
                }
            });
        }

        if (notificationsCheckbox) {
            notificationsCheckbox.addEventListener('change', (e) => {
                options.notificationsEnabled = e.target.checked;
            });
        }

        if (autosaveCheckbox) {
            autosaveCheckbox.addEventListener('change', (e) => {
                options.autoSaveEnabled = e.target.checked;
            });
        }

        // Automation toggles
        const autoGatherCheckbox = document.getElementById('option-auto-gather');
        const autoBuyCheckbox = document.getElementById('option-auto-buy');
        const autocastSpellsCheckbox = document.getElementById('option-autocast-spells');
        const autoWellCheckbox = document.getElementById('option-auto-well');

        if (autoGatherCheckbox) {
            autoGatherCheckbox.addEventListener('change', (e) => {
                options.autoGatherEnabled = e.target.checked;
            });
        }

        if (autoBuyCheckbox) {
            autoBuyCheckbox.addEventListener('change', (e) => {
                options.autoBuyEnabled = e.target.checked;
            });
        }

        if (autocastSpellsCheckbox) {
            autocastSpellsCheckbox.addEventListener('change', (e) => {
                options.autocastSpellsEnabled = e.target.checked;
            });
        }

        if (autoWellCheckbox) {
            autoWellCheckbox.addEventListener('change', (e) => {
                options.autoWellEnabled = e.target.checked;
            });
        }

        // Number display options
        const truncateCheckbox = document.getElementById('option-truncate');
        const numberFormatSelect = document.getElementById('option-number-format');
        const saveOptionsButton = document.getElementById('save-options-button');

        if (truncateCheckbox) {
            truncateCheckbox.addEventListener('change', (e) => {
                options.truncateLargeNumbers = e.target.checked;
            });
        }

        if (numberFormatSelect) {
            numberFormatSelect.addEventListener('change', (e) => {
                options.numberFormat = e.target.value;
            });
        }

        if (saveOptionsButton) {
            saveOptionsButton.addEventListener('click', () => {
                if (SaveManager.save()) {
                    // Close the options panel
                    const optionsPanel = document.getElementById('options-panel');
                    if (optionsPanel) {
                        optionsPanel.hidden = true;
                    }
                    // Return focus to options button
                    const optionsButton = document.getElementById('options-button');
                    if (optionsButton) {
                        optionsButton.focus();
                    }
                }
            });
        }

        // Save/Load buttons
        const saveButton = document.getElementById('save-game-button');
        const loadButton = document.getElementById('load-game-button');
        const exportButton = document.getElementById('export-save-button');
        const importButton = document.getElementById('import-save-button');
        const resetButton = document.getElementById('reset-game-button');

        if (saveButton) {
            saveButton.addEventListener('click', () => {
                if (SaveManager.save()) {
                    alert('Game saved!');
                } else {
                    alert('Error saving game.');
                }
            });
        }

        if (loadButton) {
            loadButton.addEventListener('click', () => {
                if (confirm('Load saved game? Any unsaved progress will be lost.')) {
                    if (SaveManager.load()) {
                        alert('Game loaded!');
                    } else {
                        alert('No save data found or error loading.');
                    }
                }
            });
        }

        if (exportButton) {
            exportButton.addEventListener('click', () => {
                const saveString = SaveManager.exportSave();
                if (saveString) {
                    // Create a text area with the save string for copying
                    const textarea = document.createElement('textarea');
                    textarea.value = saveString;
                    textarea.style.position = 'fixed';
                    textarea.style.left = '-9999px';
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                    alert('Save data copied to clipboard!');
                } else {
                    alert('Error exporting save.');
                }
            });
        }

        if (importButton) {
            importButton.addEventListener('click', () => {
                const saveString = prompt('Paste your save data:');
                if (saveString && saveString.trim()) {
                    if (confirm('Import this save? Your current progress will be replaced.')) {
                        if (SaveManager.importSave(saveString.trim())) {
                            alert('Save imported successfully!');
                        } else {
                            alert('Invalid save data.');
                        }
                    }
                }
            });
        }

        if (resetButton) {
            resetButton.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset the game? ALL progress will be lost!')) {
                    if (confirm('This cannot be undone. Reset game?')) {
                        SaveManager.resetGame();
                    }
                }
            });
        }
    }

    function loadOptions(savedOptions) {
        if (savedOptions) {
            options.soundEnabled = savedOptions.soundEnabled !== undefined ? savedOptions.soundEnabled : true;
            options.notificationsEnabled = savedOptions.notificationsEnabled !== undefined ? savedOptions.notificationsEnabled : true;
            options.autoSaveEnabled = savedOptions.autoSaveEnabled !== undefined ? savedOptions.autoSaveEnabled : true;
            options.autoSaveInterval = savedOptions.autoSaveInterval || 30;
            options.truncateLargeNumbers = savedOptions.truncateLargeNumbers !== undefined ? savedOptions.truncateLargeNumbers : false;
            options.numberFormat = savedOptions.numberFormat || 'basic';
            options.autoGatherEnabled = savedOptions.autoGatherEnabled !== undefined ? savedOptions.autoGatherEnabled : true;
            options.autoBuyEnabled = savedOptions.autoBuyEnabled !== undefined ? savedOptions.autoBuyEnabled : true;
            options.autocastSpellsEnabled = savedOptions.autocastSpellsEnabled !== undefined ? savedOptions.autocastSpellsEnabled : true;
            options.autoWellEnabled = savedOptions.autoWellEnabled !== undefined ? savedOptions.autoWellEnabled : true;

            // Update checkboxes to match loaded options
            const soundCheckbox = document.getElementById('option-sound');
            const notificationsCheckbox = document.getElementById('option-notifications');
            const autosaveCheckbox = document.getElementById('option-autosave');
            const truncateCheckbox = document.getElementById('option-truncate');
            const numberFormatSelect = document.getElementById('option-number-format');
            const autoGatherCheckbox = document.getElementById('option-auto-gather');
            const autoBuyCheckbox = document.getElementById('option-auto-buy');
            const autocastSpellsCheckbox = document.getElementById('option-autocast-spells');
            const autoWellCheckbox = document.getElementById('option-auto-well');

            if (soundCheckbox) soundCheckbox.checked = options.soundEnabled;
            if (notificationsCheckbox) notificationsCheckbox.checked = options.notificationsEnabled;
            if (autosaveCheckbox) autosaveCheckbox.checked = options.autoSaveEnabled;
            if (truncateCheckbox) truncateCheckbox.checked = options.truncateLargeNumbers;
            if (numberFormatSelect) numberFormatSelect.value = options.numberFormat;
            if (autoGatherCheckbox) autoGatherCheckbox.checked = options.autoGatherEnabled;
            if (autoBuyCheckbox) autoBuyCheckbox.checked = options.autoBuyEnabled;
            if (autocastSpellsCheckbox) autocastSpellsCheckbox.checked = options.autocastSpellsEnabled;
            if (autoWellCheckbox) autoWellCheckbox.checked = options.autoWellEnabled;

            // Sync SoundModule with loaded options
            if (typeof SoundModule !== 'undefined') {
                SoundModule.setEnabled(options.soundEnabled);
            }

            // Update volume slider from SoundModule (volume is saved separately in SoundModule)
            const volumeSlider = document.getElementById('option-volume');
            const volumeDisplay = document.getElementById('volume-display');
            if (volumeSlider && typeof SoundModule !== 'undefined') {
                const volume = Math.round(SoundModule.getMasterVolume() * 100);
                volumeSlider.value = volume;
                if (volumeDisplay) {
                    volumeDisplay.textContent = volume + '%';
                }
            }
        }
    }

    // Format a number based on current options
    function formatNumber(num) {
        if (options.numberFormat === 'scientific' && Math.abs(num) >= 1000000) {
            return num.toExponential(2);
        }

        if (options.truncateLargeNumbers && Math.abs(num) >= 1000) {
            const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
            let tier = Math.floor(Math.log10(Math.abs(num)) / 3);
            if (tier > suffixes.length - 1) tier = suffixes.length - 1;
            const suffix = suffixes[tier];
            const scale = Math.pow(10, tier * 3);
            const scaled = num / scale;
            return scaled.toFixed(2) + suffix;
        }

        // Basic format with commas
        if (Number.isInteger(num)) {
            return num.toLocaleString();
        }
        return num.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    }

    function getOptions() {
        return options;
    }

    return {
        getHTML,
        init,
        getOptions,
        loadOptions,
        formatNumber
    };
})();
