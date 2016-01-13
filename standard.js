var retext = require('retext');
var equality = require('retext-equality');
var parser = require('retext-english');
var bridge = require('mdast-util-to-nlcst');
var mdast = require('remark');
var sort = require('vfile-sort');
var mapboxStandard = require('./');

var markdown = mdast();
var english = retext()
    .use(parser)
    .use(mapboxStandard)
    .use(equality);

function standard(value) {
    var result;
    /*
     * All callbacks are in fact completely sync.
     */
    markdown.process(value, function (err, file) {
        var tree;
        tree = bridge(file, english.Parser);
        english.run(tree, file);
        sort(file);
        result = file;
    });
    return result;
}

module.exports = standard;
