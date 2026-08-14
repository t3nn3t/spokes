import "server-only";

import type {
  LineString,
  ProvisionalRoute,
  RoutePlanningRequest,
} from "@/lib/route-planning";

const DEFAULT_BROUTER_URL = "http://127.0.0.1:17777";
const BROUTER_PROFILE = "spokes-mtb";

type BrouterFeatureCollection = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: { "track-length": string | number };
    geometry: {
      type: "LineString";
      coordinates: number[][];
    };
  }>;
};

export class RoutingServiceUnavailableError extends Error {}

function asBrouterRoute(value: unknown): BrouterFeatureCollection | null {
  if (typeof value !== "object" || value === null) return null;

  const collection = value as Partial<BrouterFeatureCollection>;
  const feature = collection.features?.[0];
  const distance = Number(feature?.properties?.["track-length"]);
  const coordinates = feature?.geometry?.coordinates;

  if (
    collection.type !== "FeatureCollection" ||
    feature?.type !== "Feature" ||
    feature.geometry?.type !== "LineString" ||
    !Array.isArray(coordinates) ||
    coordinates.length < 2 ||
    !coordinates.every(
      (position) =>
        Array.isArray(position) &&
        position.length >= 2 &&
        Number.isFinite(position[0]) &&
        Number.isFinite(position[1]),
    ) ||
    !Number.isFinite(distance) ||
    distance <= 0
  ) {
    return null;
  }

  return collection as BrouterFeatureCollection;
}

function routeUrl(request: RoutePlanningRequest) {
  const baseUrl = process.env.BROUTER_URL ?? DEFAULT_BROUTER_URL;
  const url = new URL("/brouter", baseUrl);
  const points = [request.start, request.destination]
    .map(({ longitude, latitude }) => `${longitude},${latitude}`)
    .join("|");

  url.searchParams.set("lonlats", points);
  url.searchParams.set("profile", BROUTER_PROFILE);
  url.searchParams.set("alternativeidx", "0");
  url.searchParams.set("format", "geojson");
  url.searchParams.set("trackname", "spokes-fixed-journey");

  return url;
}

export async function requestProvisionalRoute(
  request: RoutePlanningRequest,
): Promise<ProvisionalRoute> {
  let response: Response;

  try {
    response = await fetch(routeUrl(request), {
      headers: { accept: "application/vnd.geo+json" },
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
  } catch {
    throw new RoutingServiceUnavailableError();
  }

  if (!response.ok) {
    throw new RoutingServiceUnavailableError();
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new RoutingServiceUnavailableError();
  }

  const route = asBrouterRoute(body);
  if (!route) {
    throw new RoutingServiceUnavailableError();
  }

  const feature = route.features[0];
  const geometry: LineString = {
    type: "LineString",
    coordinates: feature.geometry.coordinates.map((position) => [
      position[0],
      position[1],
    ]),
  };

  return {
    role: "provisional",
    geometry,
    totalDistanceMeters: Number(feature.properties["track-length"]),
  };
}
