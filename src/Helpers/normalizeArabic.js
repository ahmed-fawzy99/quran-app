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
