import englandBoundary from "@/lib/data/england-boundary.json";
import type { Coordinate } from "@/lib/route-planning";

type Position = [longitude: number, latitude: number];
type LinearRing = Position[];
type Polygon = LinearRing[];

// ONS Countries (December 2022) UK ultra-generalised clipped boundary,
// reduced to the England MultiPolygon and rounded to five decimal places.
// Source: https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services/Countries_December_2022_UK_BUC/FeatureServer
const ENGLAND_POLYGONS = englandBoundary as Polygon[];

function isOnSegment(
  longitude: number,
  latitude: number,
  [startLongitude, startLatitude]: Position,
  [endLongitude, endLatitude]: Position,
) {
  const crossProduct =
    (latitude - startLatitude) * (endLongitude - startLongitude) -
    (longitude - startLongitude) * (endLatitude - startLatitude);

  if (Math.abs(crossProduct) > Number.EPSILON) return false;

  return (
    longitude >= Math.min(startLongitude, endLongitude) &&
    longitude <= Math.max(startLongitude, endLongitude) &&
    latitude >= Math.min(startLatitude, endLatitude) &&
    latitude <= Math.max(startLatitude, endLatitude)
  );
}

function isInRing(longitude: number, latitude: number, ring: LinearRing) {
  let inside = false;

  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index++) {
    const current = ring[index];
    const prior = ring[previous];

    if (isOnSegment(longitude, latitude, prior, current)) return true;

    const [currentLongitude, currentLatitude] = current;
    const [previousLongitude, previousLatitude] = prior;
    const crossesLatitude = currentLatitude > latitude !== previousLatitude > latitude;
    const boundaryLongitude =
      ((previousLongitude - currentLongitude) * (latitude - currentLatitude)) /
        (previousLatitude - currentLatitude) +
      currentLongitude;

    if (crossesLatitude && longitude < boundaryLongitude) inside = !inside;
  }

  return inside;
}

function isInPolygon(longitude: number, latitude: number, [outerRing, ...holes]: Polygon) {
  return (
    isInRing(longitude, latitude, outerRing) &&
    !holes.some((hole) => isInRing(longitude, latitude, hole))
  );
}

export function isInEngland({ latitude, longitude }: Coordinate) {
  return ENGLAND_POLYGONS.some((polygon) => isInPolygon(longitude, latitude, polygon));
}
