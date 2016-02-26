# retext-mapbox-standard

[![Circle CI](https://circleci.com/gh/mapbox/retext-mapbox-standard.svg?style=svg)](https://circleci.com/gh/mapbox/retext-mapbox-standard)

Enforce Mapbox rules about language: this is a testing tool that automatically
runs on English-language content produced by the Mapbox team to guard against
common grammar, sensitivity, and simplicity errors.

## Enforcement

<!--mapbox ignore geojson OpenStreetMap-->
* Acronym & term styling, like GeoJSON rather than geoJSON
* Brand styling, like Mapbox instead of MapBox
* Simple language - includes [retext-simplify](https://github.com/wooorm/retext-simplify) to recommend
  plain language words
* Sensitive language - includes [retext-equality](https://github.com/wooorm/retext-equality)

## Installation

Install globally:

    npm install -g retext-mapbox-standard

More typically, this will be included as a devDependency and invoked through
the `test` script.

## Configuration

Per-file exceptions can be enabled with [comments, using syntax from
remark-message-control](https://github.com/wooorm/remark-message-control/).

For instance, in the list above where we needed to mention the word
`geoJSON`, the list is preceded by the following comment so that it doesn't
trigger a validation error in CI:

```html
<!--mapbox ignore geojson OpenStreetMap-->
```

## Example

```sh
$ retext-mapbox-standard bad.md
bad.md
  1:19-1:22  warning  OSM is jargon, use OpenStreetMap instead
  1:40-1:46  warning  Mapbox is styled Mapbox
  2:40-2:47  warning  geoJSON should be styled GeoJSON
  4:50-4:55  warning  `crazy` may be insensitive, use `rude`, `mean`, `disgusting`, `vile`, `person with symptoms of mental illness`, `person with mental illness`, `person with symptoms of a mental disorder`, `person with a mental disorder` instead
Source: http://ncdj.org/style-guide/

⚠ 4 warnings
```

## Architecture

_Implementation details for the interested, optional reading_

This code is built on [wooorm/remark](https://github.com/wooorm/remark) the Markdown parser and [wooorm/retext](https://github.com/wooorm/retext) the natural language toolkit. These libraries avoid false-positives related to **code syntax**: we should never flag a spelling error in a URL, for instance. Since Mapbox's documentation also uses [Liquid templating](http://liquidmarkup.org/) tags, this tool also includes a step that removes them before validation.

[retext-simplify](https://github.com/wooorm/retext-simplify) and [retext-equality](https://github.com/wooorm/retext-equality) (the core of [wooorm/alex](https://github.com/wooorm/alex)) are used unmodified but with a bunch of loosened restrictions. `lib/standard` adds Mapbox-specific rules about styling and casing brands and technical jargon.
