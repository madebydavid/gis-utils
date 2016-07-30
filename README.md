# GIS Util

Some GIS utility functions I have used in multiple projects.

## Installation

```sh
npm install gis-util --save
```

## Included functions

* `deg2rad(degrees)`
* `rad2deg(angle)`
* `haversineKm(fromLocation, toLocation)`
* `calculateRadiusFromMapBounds(bounds)`
* `getNESWBoundsFromRadiusAndCenter(radius, center)`
* `getNWSEBountsFromRadiusAndCenter(radius, center)`
* `computeDestinationPoint(lat, lon, distance, bearing, radius)`
* `isLatAndLngInRectBoundary(point, boundary)`
