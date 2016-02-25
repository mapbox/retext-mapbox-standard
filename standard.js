var retext = require('retext');
var simplify = require('retext-simplify');
var remark2retext = require('remark-retext');
var control = require('remark-message-control');
var equality = require('retext-equality');
var parser = require('retext-english');
var remark = require('remark');
var sort = require('vfile-sort');
var mapboxStandard = require('./');

var simplifyConfig = {
    ignore: [
        'address', // geocoder
        'request', // technical
        'interface', // technical
        'render' // technical
    ]
};

var markdown = remark();
var english = retext()
    .use(parser)
    .use(mapboxStandard)
    .use(equality)
    .use(simplify, simplifyConfig);

function standard(value) {
    var result;
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
