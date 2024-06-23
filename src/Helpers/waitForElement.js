/**
 * waitForElement is a function that waits for an element to be present in the DOM.
 * It uses the MutationObserver Web API to watch for changes in the DOM and resolve a promise when the specified element is found.
 *
 * @param {string} selector - The id of the DOM element to wait for.
 * @returns {Promise} - A promise that resolves with the DOM element when it is found.
 *
 * @example
 * waitForElement('myElement').then(element => {
 *   // Do something with the element
 * });
 */
export function waitForElement(selector) {
    return new Promise(resolve => {
        if (document.getElementById(selector)) {
            return resolve(document.getElementById(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.getElementById(selector)) {
                observer.disconnect();
                resolve(document.getElementById(selector));
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}
