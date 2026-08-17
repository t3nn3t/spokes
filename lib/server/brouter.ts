import "server-only";

import type {
  AuditedRouteSegment,
  LineString,
  ProvisionalRoute,
  RoutePlanningRequest,
} from "@/lib/route-planning";
import {
  approximatePassageDurationSeconds,
  auditPassage,
} from "@/lib/server/passage-audit";
import { auditMotorTraffic } from "@/lib/server/motor-traffic-audit";

const DEFAULT_BROUTER_URL = "http://127.0.0.1:17777";
const BROUTER_PROFILE = "spokes-mtb";
const EARTH_RADIUS_METERS = 6_371_000;
const MAXIMUM_SNAP_DISTANCE_METERS = 100;
const MAXIMUM_ROUTE_DISTANCE_METERS = 100_000;

type BrouterFeatureCollection = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: {
      "track-length": string | number;
      "total-time": string | number;
      messages: unknown;
    };
    geometry: {
      type: "LineString";
      coordinates: number[][];
    };
  }>;
};

export class RoutingServiceUnavailableError extends Error {}
export class EndpointSnapExceededError extends Error {}
export class NoRouteError extends Error {}
export class NoEligibleRouteError extends Error {}
export class RouteTooLongError extends Error {}

function distanceBetween(first: RoutePlanningRequest["start"], second: RoutePlanningRequest["start"]) {
  const radians = Math.PI / 180;
  const latitudeDelta = (second.latitude - first.latitude) * radians;
  const longitudeDelta = (second.longitude - first.longitude) * radians;
  const firstLatitude = first.latitude * radians;
  const secondLatitude = second.latitude * radians;
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return Math.round(
    2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine)),
  );
}

function asBrouterRoute(value: unknown): BrouterFeatureCollection | null {
  if (typeof value !== "object" || value === null) return null;

  const collection = value as Partial<BrouterFeatureCollection>;
  const feature = collection.features?.[0];
  const distance = Number(feature?.properties?.["track-length"]);
  const duration = Number(feature?.properties?.["total-time"]);
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
        position[0] >= -180 &&
        position[0] <= 180 &&
        Number.isFinite(position[1]) &&
        position[1] >= -90 &&
        position[1] <= 90,
    ) ||
    !Number.isFinite(distance) ||
    distance <= 0 ||
    !Number.isFinite(duration) ||
    duration <= 0
  ) {
    return null;
  }

  return collection as BrouterFeatureCollection;
}

function asFiniteNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function parseTags(value: unknown) {
  if (typeof value !== "string") return null;
  const tags = new Map<string, string>();

  for (const tag of value.split(/\s+/).filter(Boolean)) {
    const separator = tag.indexOf("=");
    if (separator <= 0) return null;
    tags.set(tag.slice(0, separator), tag.slice(separator + 1));
  }

  return tags;
}

function auditBrouterSegments(
  messages: unknown,
  geometry: LineString,
  totalDurationSeconds: number,
): {
  segments: AuditedRouteSegment[];
  approximateDurationSeconds: number;
  motorTrafficTravelDistanceMeters: number;
  motorRoadCrossingCount: number;
  motorRoadCrossingPenalty: number;
  unverifiedPassageDistanceMeters: number;
} | null {
  if (!Array.isArray(messages) || messages.length < 2) return null;
  const header = messages[0];
  if (!Array.isArray(header)) return null;

  const longitudeIndex = header.indexOf("Longitude");
  const latitudeIndex = header.indexOf("Latitude");
  const distanceIndex = header.indexOf("Distance");
  const wayTagsIndex = header.indexOf("WayTags");
  const nodeTagsIndex = header.indexOf("NodeTags");
  const timeIndex = header.indexOf("Time");
  if (
    longitudeIndex < 0 ||
    latitudeIndex < 0 ||
    distanceIndex < 0 ||
    wayTagsIndex < 0 ||
    nodeTagsIndex < 0 ||
    timeIndex < 0
  ) {
    return null;
  }

  const segments: AuditedRouteSegment[] = [];
  let geometryStartIndex = 0;
  let previousTime = 0;
  let auditedDuration = 0;
  let motorTrafficDistance = 0;
  let motorRoadCrossingCount = 0;
  let motorRoadCrossingPenalty = 0;
  let unverifiedDistance = 0;
  let finalSegmentUsesWalkBike = false;

  const rows = messages.slice(1);
  for (const [rowIndex, row] of rows.entries()) {
    if (!Array.isArray(row)) return null;
    const longitude = asFiniteNumber(row[longitudeIndex]);
    const latitude = asFiniteNumber(row[latitudeIndex]);
    const distance = asFiniteNumber(row[distanceIndex]);
    const cumulativeTime = asFiniteNumber(row[timeIndex]);
    const wayTags = parseTags(row[wayTagsIndex]);
    const nodeTags = parseTags(row[nodeTagsIndex]);
    const nextRow = rows[rowIndex + 1];
    const outgoingWayTags =
      nextRow === undefined
        ? null
        : Array.isArray(nextRow)
          ? parseTags(nextRow[wayTagsIndex])
          : null;
    if (
      longitude === null ||
      latitude === null ||
      distance === null ||
      distance <= 0 ||
      cumulativeTime === null ||
      cumulativeTime < previousTime ||
      !wayTags ||
      !nodeTags ||
      (nextRow !== undefined && !outgoingWayTags)
    ) {
      return null;
    }

    const geometryEndIndex = geometry.coordinates.findIndex(
      ([candidateLongitude, candidateLatitude], index) =>
        index > geometryStartIndex &&
        Math.round(candidateLongitude * 1_000_000) === longitude &&
        Math.round(candidateLatitude * 1_000_000) === latitude,
    );
    if (geometryEndIndex < 0) return null;

    const { classification, usesWalkBike } = auditPassage(wayTags, nodeTags);
    const { exposureTier, crossing, crossingPenalty } = auditMotorTraffic(
      wayTags,
      nodeTags,
      outgoingWayTags,
    );
    segments.push({
      classification,
      motorExposureTier: exposureTier,
      motorRoadCrossing: crossing,
      distanceMeters: distance,
      geometry: {
        type: "LineString",
        coordinates: geometry.coordinates.slice(geometryStartIndex, geometryEndIndex + 1),
      },
    });
    if (classification === "unverified-passage") {
      unverifiedDistance += distance;
    }
    if (exposureTier !== "none") {
      motorTrafficDistance += distance;
    }
    if (crossing !== "none" && crossing !== "grade-separated") {
      motorRoadCrossingCount += 1;
    }
    motorRoadCrossingPenalty += crossingPenalty;
    auditedDuration += approximatePassageDurationSeconds(
      distance,
      cumulativeTime - previousTime,
      usesWalkBike,
    );
    finalSegmentUsesWalkBike = usesWalkBike;
    previousTime = cumulativeTime;
    geometryStartIndex = geometryEndIndex;
  }

  if (geometryStartIndex !== geometry.coordinates.length - 1) return null;
  if (!finalSegmentUsesWalkBike) auditedDuration += totalDurationSeconds - previousTime;

  return {
    segments,
    approximateDurationSeconds: Math.round(auditedDuration),
    motorTrafficTravelDistanceMeters: motorTrafficDistance,
    motorRoadCrossingCount,
    motorRoadCrossingPenalty,
    unverifiedPassageDistanceMeters: unverifiedDistance,
  };
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
  url.searchParams.set("trackname", "spokes-route-plan");

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

  if (
    typeof body === "object" &&
    body !== null &&
    (body as { type?: unknown }).type === "FeatureCollection" &&
    Array.isArray((body as { features?: unknown }).features) &&
    (body as { features: unknown[] }).features.length === 0
  ) {
    throw new NoRouteError();
  }

  const route = asBrouterRoute(body);
  if (!route) {
    throw new RoutingServiceUnavailableError();
  }

  const feature = route.features[0];
  if (Number(feature.properties["track-length"]) > MAXIMUM_ROUTE_DISTANCE_METERS) {
    throw new RouteTooLongError();
  }

  const geometry: LineString = {
    type: "LineString",
    coordinates: feature.geometry.coordinates.map((position) => [
      position[0],
      position[1],
    ]),
  };
  const audit = auditBrouterSegments(
    feature.properties.messages,
    geometry,
    Number(feature.properties["total-time"]),
  );
  if (!audit) {
    throw new RoutingServiceUnavailableError();
  }
  if (audit.segments.some((segment) => segment.classification === "explicit-exclusion")) {
    throw new NoEligibleRouteError();
  }
  const snappedCoordinates = {
    start: {
      longitude: geometry.coordinates[0][0],
      latitude: geometry.coordinates[0][1],
    },
    destination: {
      longitude: geometry.coordinates.at(-1)![0],
      latitude: geometry.coordinates.at(-1)![1],
    },
  };
  const startConnectorDistance = distanceBetween(request.start, snappedCoordinates.start);
  const destinationConnectorDistance = distanceBetween(
    request.destination,
    snappedCoordinates.destination,
  );

  if (
    startConnectorDistance > MAXIMUM_SNAP_DISTANCE_METERS ||
    destinationConnectorDistance > MAXIMUM_SNAP_DISTANCE_METERS
  ) {
    throw new EndpointSnapExceededError();
  }

  const auditedDistanceMeters = audit.segments.reduce(
    (total, segment) => total + segment.distanceMeters,
    0,
  );

  return {
    role: "provisional",
    requestedCoordinates: {
      start: request.start,
      destination: request.destination,
    },
    snappedCoordinates,
    connectorDistanceMeters: {
      start: startConnectorDistance,
      destination: destinationConnectorDistance,
      total: startConnectorDistance + destinationConnectorDistance,
    },
    geometry,
    totalDistanceMeters: Number(feature.properties["track-length"]),
    approximateDurationSeconds: audit.approximateDurationSeconds,
    segments: audit.segments,
    motorTrafficTravelDistanceMeters: audit.motorTrafficTravelDistanceMeters,
    motorTrafficTravelPercentage: Number(
      ((audit.motorTrafficTravelDistanceMeters / auditedDistanceMeters) * 100).toFixed(1),
    ),
    motorRoadCrossingCount: audit.motorRoadCrossingCount,
    motorRoadCrossingPenalty: audit.motorRoadCrossingPenalty,
    unverifiedPassageDistanceMeters: audit.unverifiedPassageDistanceMeters,
  };
}
