#!/usr/bin/env node
/**
 * Hacked from the good work in alex
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module mapbox
 * @fileoverview CLI for mapbox.
 */

'use strict';

/* eslint-env node */
/* eslint-disable no-console */

/*
 * Dependencies.
 */

var retext = require('retext');
var fs = require('fs');
var bail = require('bail');
var meow = require('meow');
var globby = require('globby');
var hasMagic = require('glob').hasMagic;
var minimatch = require('minimatch');
var getStdin = require('get-stdin');
var findDown = require('vfile-find-down');
var findUp = require('vfile-find-up');
var format = require('vfile-reporter');
var toFile = require('to-vfile');
var mapboxStandard = require('./');
var equality = require('retext-equality');
var pack = require('./package');

/*
 * Methods.
 */

var readFile = fs.readFileSync;
var stat = fs.statSync;

/*
 * Constants.
 */

var expextPipeIn = !process.stdin.isTTY;
var IGNORE = '.mapboxignore';
var ENCODING = 'utf-8';
var BACKSLASH = '\\';
var SLASH = '/';
var CD = './';
var HASH = '#';
var EMPTY = '';

var defaultIgnore = [
    'node_modules/',
    'bower_components/'
];

var extensions = [
    'txt',
    'text',
    'md',
    'markdown',
    'mkd',
    'mkdn',
    'mkdown',
    'ron'
];

/*
 * Set-up meow.
 */

var cli = meow({
    'help': [
        'Usage:  retext-mapbox-standard [<file> | <dir> ...] [-w, --why] [-t, --text]',
        '',
        'Options:',
        '',
        '  -t, --text   treat input as plain-text (not markdown)',
        '',
        'When no input files are given, searches for markdown and text',
        'files in the current directory, `doc`, and `docs`.',
        '',
        'Examples',
        '  $ echo "His network looks good" | retext-mapbox-standard',
        '  $ retext-mapbox-standard *.md !example.md',
        '  $ retext-mapbox-standard'
    ]
});

/*
 * Set-up.
 */

var exit = 0;
var result = [];
var fn = Boolean(cli.flags.t || cli.flags.text) ? 'text' : 'markdown'
var globs = cli.input.length ? cli.input : [
    '{docs/**/,doc/**/,}*.{' + extensions.join(',') + '}'
];

/*
 * Exit.
 */

process.on('exit', function () {
    console.log(format(result, {
        'verbose': true
    }));

    process.exit(exit);
});

/**
 * Log a virtual file processed by alex.
 *
 * @param {VFile} file - Virtual file.
 */
function log(file) {
    result.push(file);

    if (!exit && file.messages.length) {
        exit = 1;
    }
}

/*
 * Handle stdin(4).
 */

if (!cli.input.length && expextPipeIn) {
    getStdin().then(function (value) {
        var file = toFile('<stdin>');

        file.contents = value;

        retext().use(mapboxStandard).use(equality).process(doc, function (err, file) {
            result = file.messages;
        });

        log(file);
    }, bail);

    return;
}

/**
 * Check if `file` matches `pattern`.
 *
 * @example
 *   match('baz.md', '*.md'); // true
 *
 * @param {string} filePath - File location.
 * @param {string} pattern - Glob pattern.
 * @return {boolean}
 */
function match(filePath, pattern) {
    return minimatch(filePath, pattern) ||
        minimatch(filePath, pattern + '/**');
}

/**
 * Check if `filePath` is matched included in `patterns`.
 *
 * @example
 *   shouldIgnore(['node_modules/'], 'node_modules/foo'); // true
 *
 * @param {Array.<string>} patterns - Glob patterns.
 * @param {string} filePath - File location.
 * @return {boolean}
 */
function shouldIgnore(patterns, filePath) {
    var normalized = filePath.replace(BACKSLASH, SLASH).replace(CD, EMPTY);

    return patterns.reduce(function (isIgnored, pattern) {
        var isNegated = pattern.charAt(0) === '!';

        if (isNegated) {
            pattern = pattern.slice(1);
        }

        if (pattern.indexOf(CD) === 0) {
            pattern = pattern.slice(CD.length);
        }

        return match(normalized, pattern) ? !isNegated : isIgnored;
    }, false);
}

/**
 * Load an ignore file.
 *
 * @param {string} ignore - File location.
 * @return {Array.<string>} - Patterns.
 */
function loadIgnore(ignore) {
    return readFile(ignore, ENCODING).split(/\r?\n/).filter(function (value) {
        var line = value.trim();

        return line.length && line.charAt(0) !== HASH;
    });
}

/**
 * Factory to create a file filter based on bound ignore
 * patterns.
 *
 * @param {Array.<string>} ignore - Ignore patterns.
 * @param {Array.<string>} given - List of given file paths.
 * @return {Function} - Filter.
 */
function filterFactory(ignore, given) {
    /**
     * Check whether a virtual file is applicable.
     *
     * @param {VFile} file - Virtual file.
     */
    return function (file) {
        var filePath = file.filePath();
        var extension = file.extension;

        if (given.indexOf(filePath) !== -1 || shouldIgnore(ignore, filePath)) {
            return findDown.SKIP;
        }

        return extension && extensions.indexOf(extension) !== -1;
    }
}

/**
 * Factory to create a file filter based on bound ignore
 * patterns.
 *
 * @param {Array.<VFile>} given - List of given files.
 * @return {Function} - Process callback.
 */
function processFactory(given) {
    /**
     * Process all found files (and failed ones too).
     *
     * @param {Error} [err] - Finding error (not used by
     *   vfile-find-down).
     * @param {Array.<VFile>} [files] - Virtual files.
     */
    return function (err, files) {
        given.concat(files || []).forEach(function (file) {
            file.quiet = true;

            try {
                file.contents = readFile(file.filePath(), ENCODING);
            } catch (err) {
                file.fail(err);
            }

            retext().use(mapboxStandard).use(equality).process(file, function (err, file) {
                log(file);
            });
        })
    }
}

/*
 * Handle patterns.
 */

globby(globs).then(function (filePaths) {
    var files = [];
    var given = [];

    /*
     * Check whether files are given directly that either
     * do not exist or which might not match the default
     * search patterns (based on extensions).
     */

    globs.forEach(function (glob) {
        if (hasMagic(glob)) {
            return;
        }

        files.push(toFile(glob));
        given.push(glob);

        try {
            if (!stat(glob).isFile()) {
                files.pop();
                given.pop();
            }
        } catch (err) { /* Empty. */ }
    });

    /*
     * Search for an ignore file.
     */

    findUp.one(IGNORE, function (err, file) {
        var ignore = [];

        try {
            ignore = file && loadIgnore(file.filePath());
        } catch (err) { /* Empty. */ }

        ignore = defaultIgnore.concat(ignore || []);

        findDown.all(filterFactory(ignore, given), filePaths, processFactory(files));
    });
}, bail);
