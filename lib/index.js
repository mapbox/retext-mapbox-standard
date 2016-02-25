var nlcstToString = require('nlcst-to-string');
var visit = require('unist-util-visit');
var isLiteral = require('nlcst-is-literal');
var brands = require('../data/brands');
var forbidden = require('../data/forbidden');
var acronyms = require('../data/acronyms');

function toSet(list) {
    var s = {};
    list.forEach(function(item) {
        s[item] = true;
    });
    return s;
}

var forbiddenSet = toSet(forbidden);
var acronymsSet = toSet(acronyms);
var acronymsLowercase = acronyms.reduce(function(set, a) {
    set[a.toLowerCase()] = a;
    return set;
}, {});

/**
 * Get a string value from a node.
 *
 * @param {NLCSTNode} node - NLCST node.
 * @return {string} - Normalized and stringified `node`.
 */
function toString(node) {
    return nlcstToString(node).replace(/['’-]/g, '');
}

/**
 * Get the value of multiple nodes
 *
 * @param {Array.<NLCSTNode>} node - NLCST nodes.
 * @return {string} - Value of `node`.
 */
function valueOf(node) {
    return nlcstToString({
        'children': node
    });
}

/**
 * Factory to create a visitor which warns on `file`.
 *
 * @param {File} file - Virtual file.
 * @return {Function} - Paragraph visitor.
 */
function factory(file) {
    /**
     * Search `node` for violations.
     *
     * @param {NLCSTParagraphNode} node - Paragraph.
     */
    return function (node) {
        var matches = {};
        var id;
        var pattern;

        /*
         * Find offending words.
         */

        visit(node, 'WordNode', function (child, position, parent) {
            var length;
            var result;

            if (isLiteral(parent, position)) {
                return;
            }

            var stringValue = toString(child)
            var value = toString(child).toLowerCase();
            var index = -1;
            var msg;
            if (forbiddenSet.hasOwnProperty(value)) {
              msg = file.warn(value + ' is forbidden.', child);
              msg.ruleId = value;
              msg.source = 'mapbox';
            }
            if (brands.hasOwnProperty(stringValue)) {
              msg = file.warn(brands[stringValue], child);
              msg.ruleId = stringValue;
              msg.source = 'mapbox';
            }
            if (acronymsLowercase.hasOwnProperty(value) &&
               !acronymsSet.hasOwnProperty(stringValue)) {
              msg = file.warn(stringValue + ' should be styled ' + acronymsLowercase[value], child);
              msg.ruleId = stringValue;
              msg.source = 'mapbox';
            }
        });
    };
}
/**
 * Transformer.
 *
 * @param {NLCSTNode} cst - Syntax tree.
 * @param {VFile} file - Virtual file.
 */
function transformer(cst, file) {
    visit(cst, 'ParagraphNode', factory(file));
}

/**
 * Attacher.
 *
 * @return {Function} - `transformer`.
 */
function attacher() { return transformer; }

/*
 * Expose.
 */

module.exports = attacher;
