'use strict';

/* eslint-env node */
/* jscs:disable maximumLineLength */

/*
 * Dependencies.
 */

var tap = require('tap');
var retext = require('retext');
var mapbox = require('../lib/standard');
var stripLiquid = require('../lib/strip_liquid');

/*
 * Helpers.
 */

/**
 * Helper to get warnings from `equality` in `doc`.
 *
 * @param {string} doc - Document to process.
 * @return {Array.<VFileMessage>} - Virtual messages.
 */
function process(doc) {
    return mapbox(doc).messages.map(String);
}

/*
 * Tests.
 */

tap.test('retext-mapbox', function (t) {
    var doc;

    t.same(
        process('We used OSM'),
        ['1:9-1:12: OSM is jargon, use OpenStreetMap instead'],
        'OSM'
    );

    t.same(
        process('This is basically how to do it'),
        ['1:9-1:18: basically is forbidden.'],
        'forbidden'
    );

    t.same(
        process('We work at MapBox'),
        ['1:12-1:18: Mapbox is styled Mapbox'],
        'OSM'
    );

    t.same(
        process('Upload a TIF'),
        ["1:10-1:13: Always write TIFF, not TIF"],
        'TIFF not TIF'
    );

    t.same(
        process('This is `json` and\n some `png`'),
        [],
        'avoid code'
    );

    t.same(
        process('This is a length of text'),
        [],
        'no length bug'
    );

    t.same(
        process('This endpoint returns geoJSON'),
        ['1:23-1:30: geoJSON should be styled GeoJSON'],
        'OSM'
    );

    t.same(
        process('{% highlight json %}OSM{% endhighlight %} other text'),
        [],
        'bad text in a liquid tag'
    );

    t.same(
        stripLiquid('{% highlight json %}\nfoo\n{% endhighlight %} other text'),
        '....................\n...\n.................. other text',
        'strip liquid tag'
    );

    t.same(
        stripLiquid('{% highlight json %}foo{% endhighlight %}\n{% highlight json %}foo{% endhighlight %}'),
        '.........................................\n.........................................',
        'strip liquid tag'
    );

    t.end();
});
