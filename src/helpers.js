export function normalizeArabic(text, aggressiveReplace = true){
    //remove special characters
    const diacritics = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g;
    text = text.replace(diacritics, '');

    //normalize Arabic
    text = text.replace(/(لْ)/g, 'ل');
    text = text.replace(/(ئ|ؤ)/g, 'ء')

    if(aggressiveReplace){
        text = text.replace(/(ٱ|آ|إ|أ)/g, 'ا');
        text = text.replace(/(ة)/g, 'ه');
        text = text.replace(/(ى)/g, 'ي');
    }
    return text;
}

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

export function truncate(str, n= 30){
    return (str.length > n) ? str.slice(0, n-1) + '...' : str;
};
