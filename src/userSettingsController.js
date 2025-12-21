export class UserSettingsController {

    #storageKey = 'deterministicPasswordGeneratorSettings';
    #htmlElements = [];
    #savedSettings = {};
    #saveToggle = false;

    /**
     * 
     * @param {Array<HTMLElement>} htmlElements - List of HTML elements to manage
     * @param {HTMLElement} saveToggleElement - Checkbox to toggle saving settings
     * @param {HTMLElement} deleteSettingsElement - Button to delete saved settings
     */
    constructor(htmlElements, saveToggleElement, deleteSettingsElement) {
        this.#htmlElements = htmlElements;

        this.#savedSettings = JSON.parse(localStorage.getItem(this.#storageKey)) ?? {};

        // HTML Element bindings
        for (const element of this.#htmlElements) {
            if (!element.id) {
                console.warn('Element is missing id attribute, skipping:', element);
                continue;
            }

            const key = element.id;

            if (key in this.#savedSettings) {
                this.#applyValueToElement(element, this.#savedSettings[key]);
            } else {
                this.#savedSettings[key] = this.#getElementValue(element);
            }

            element.addEventListener('change', () => {
                this.#savedSettings[key] = this.#getElementValue(element);
                this.#saveSettings();
            });
        }

        // Save toggle handling
        if ('saveToggle' in this.#savedSettings) {
            this.#saveToggle = Boolean(this.#savedSettings['saveToggle']);
        } else {
            this.#savedSettings['saveToggle'] = this.#saveToggle;
        }
        saveToggleElement.checked = this.#saveToggle;

        saveToggleElement.addEventListener('change', (e) => {
            this.#saveToggle = e.target.checked;
            this.#savedSettings['saveToggle'] = this.#saveToggle;
            this.#saveSettings(true);
        });

        // Delete settings handling
        deleteSettingsElement.addEventListener('click', () => {
            localStorage.removeItem(this.#storageKey);
            this.#saveToggle = false;
            this.#applyValueToElement(saveToggleElement, false);
            alert('User preferences deleted.');
        });
    }

    #saveSettings(forceSave = false) {
        if (this.#saveToggle || forceSave) {
            localStorage.setItem(this.#storageKey, JSON.stringify(this.#savedSettings));
        }
    }

    #getElementValue(element) {
        if (element.type === 'checkbox') {
            return element.checked;
        }
        return element.value;
    }

    #applyValueToElement(element, value) {
        if (element.type === 'checkbox') {
            element.checked = Boolean(value);
        } else {
            element.value = value;
        }
    }
}
