# retext-mapbox-standard

Enforce Mapbox rules about language.

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

Enforces:

* Acronym & term styling, like GeoJSON rather than geoJSON
* Brand styling, like Mapbox instead of MapBox
* Sensitive language - includes [retext-equality](https://github.com/wooorm/retext-equality)

    npm install -g retext-mapbox-standard
