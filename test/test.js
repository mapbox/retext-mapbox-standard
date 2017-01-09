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
        process('We used OSM, Open Street Map, and Open Street Maps'),
        ['1:9-1:12: Replace “OSM” with “OpenStreetMap”',
        '1:14-1:29: Replace “Open Street Map” with “OpenStreetMap”',
        '1:35-1:51: Replace “Open Street Maps” with “OpenStreetMap”'],
        'OSM'
    );

    t.same(
        process('This is basically how to do it'),
        ['1:9-1:18: Remove “basically”'],
        'forbidden'
    );

    t.same(
        process('We work at MapBox'),
        ['1:12-1:18: Replace “MapBox” with “Mapbox”'],
        'Mapbox (wrong)'
    );

    t.same(
        process('We work at Mapbox'),
        [],
        'Mapbox (correct)'
    );

    t.same(
        process('The Mapbox GL Style Specification'),
        ['1:5-1:20: Replace “Mapbox GL Style” with “Mapbox Style”'],
        'No "GL" in Style Specification'
    );

    t.same(
        process('Upload a TIF'),
        ["1:10-1:13: Replace “TIF” with “TIFF”"],
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
        ['1:23-1:30: Replace “geoJSON” with “GeoJSON”'],
        'OSM'
    );

    t.same(
        process('\nThis endpoint returns geoJSON'),
        ['2:23-2:30: Replace “geoJSON” with “GeoJSON”'],
        'geoJSON'
    );

    t.same(
        process('This endpoint returns `geojson`'),
        [],
        'geojson in code'
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
