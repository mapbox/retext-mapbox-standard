module.exports = function(value) {
    return value
        .replace(/\{\%\s*highlight\s*\w*\s*\%\}[^}]*\{\%\s*endhighlight\s*\%\}/,
        function (match) {
            return match.replace(/[^\n]/g, '.');
        });
};
