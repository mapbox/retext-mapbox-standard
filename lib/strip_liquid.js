'use strict';

module.exports = function(value) {
    var openingTags = [], closingTags = [], match;
    var openRE = /\{\%\s*highlight\s*\w*\s*\%\}/g;
    var closeRE = /\{\%\s*endhighlight\s*\%\}/g;

    while ((match = openRE.exec(value))) {
        openingTags.push(match);
    }

    while ((match = closeRE.exec(value))) {
        closingTags.push(match);
    }

    for (var i = 0; i < openingTags.length; i++) {
        if (closingTags[i]) {
            var section = value.substring(
                openingTags[i].index,
                closingTags[i].index + closingTags[i][0].length);
            value = value.replace(section, section.replace(/[^\n]/g, '.'));
        }
    }

    return value;
};
