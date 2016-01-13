'use strict';

/* eslint-env node */
/* jscs:disable maximumLineLength */

/*
 * Dependencies.
 */

var tap = require('tap');
var retext = require('retext');
var mapbox = require('./standard');

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
        process('This is `json`'),
        [],
        'avoid code'
    );

    t.same(
        process('This endpoint returns geoJSON'),
        ['1:23-1:30: geoJSON should be styled GeoJSON'],
        'OSM'
    );

    t.end();
});
