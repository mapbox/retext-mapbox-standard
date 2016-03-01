var retext = require('retext');
var simplify = require('retext-simplify');
var remark2retext = require('remark-retext');
var control = require('remark-message-control');
var equality = require('retext-equality');
var parser = require('retext-english');
var remark = require('remark');
var sort = require('vfile-sort');
var mapboxStandard = require('./');
var stripLiquid = require('./strip_liquid');

var equalityConfig = {
    ignore: [
        'disabled', // technical
        'masterpiece', // not offensive enough
        'host' // technical
    ]
};

var simplifyConfig = {
    ignore: [
        'address', // geocoder
        'request', // technical
        'interface', // technical
        'render', // technical
        'forward', // technical
        'maximum', // technical
        'minimum', // technical
        'type', // technical
        'initial', // technical
        'selection', // technical
        'contains', // technical
        'implement', // technical
        'parameters', // technical
        'function', // technical
        'option', // technical
        'effect', // technical
        'submit', // technical
        'additional', // sales
        'might', // may does not have identical connotation
        'multiple', // many is not equivalent
        'equivalent', // equal does not have identical connotation
        'combined', // no good alternative
        'provide', // i don't think this is really that complicated a word
        'delete', // this is what the UI says
        'it is', // no good alternative
        'there are' // no good alternative
    ]
};

var markdown = remark();
var english = retext()
    .use(parser)
    .use(mapboxStandard)
    .use(equality, equalityConfig)
    .use(simplify, simplifyConfig);

function standard(value) {
    var result;
    if (typeof value === 'string') {
        value = stripLiquid(value);
    } else {
        value.contents = stripLiquid(value.contents);
    }
    remark()
        .use(remark2retext, english)
        .use(control, {
            'name': 'mapbox'
        })
        .process(value, function (err, file, doc) {
            sort(file);
            result = file;
        });
    return result;
}

module.exports = standard;
