export const HERTFORDSHIRE_DATA_SNAPSHOT = "hertfordshire-2026-08-13";
export const INITIAL_ROAD_TOLERANCE = "strong-avoidance" as const;

export type RoadTolerance = typeof INITIAL_ROAD_TOLERANCE;

export const FIXED_HERTFORDSHIRE_JOURNEY = {
  start: { latitude: 51.797717, longitude: -0.150633 },
  destination: { latitude: 51.781007, longitude: -0.263446 },
  roadTolerance: "strong-avoidance",
} as const;

export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type RoutePlanningRequest = {
  start: Coordinate;
  destination: Coordinate;
  roadTolerance: RoadTolerance;
};

export type EndpointCoordinates = {
  start: Coordinate;
  destination: Coordinate;
};

export type LineString = {
  type: "LineString";
  coordinates: [longitude: number, latitude: number][];
};

export type PassageClassification =
  | "eligible"
  | "unverified-passage"
  | "explicit-exclusion";

export type MotorExposureTier = "none" | "rare" | "low" | "moderate" | "high";

export type MotorRoadCrossing =
  | "none"
  | "grade-separated"
  | "controlled"
  | "island"
  | "uncontrolled-major";

export type AuditedRouteSegment = {
  classification: PassageClassification;
  motorExposureTier: MotorExposureTier;
  motorRoadCrossing: MotorRoadCrossing;
  distanceMeters: number;
  geometry: LineString;
};

export type ProvisionalRoute = {
  role: "provisional";
  requestedCoordinates: EndpointCoordinates;
  snappedCoordinates: EndpointCoordinates;
  connectorDistanceMeters: {
    start: number;
    destination: number;
    total: number;
  };
  geometry: LineString;
  totalDistanceMeters: number;
  approximateDurationSeconds: number;
  segments: AuditedRouteSegment[];
  motorTrafficTravelDistanceMeters: number;
  motorTrafficTravelPercentage: number;
  motorRoadCrossingCount: number;
  motorRoadCrossingPenalty: number;
  unverifiedPassageDistanceMeters: number;
};

export type RoutePlanningResponse = {
  dataSnapshot: typeof HERTFORDSHIRE_DATA_SNAPSHOT;
  roadTolerance: RoadTolerance;
  routes: [ProvisionalRoute];
};

export type RoutePlanningError = {
  error: {
    code:
      | "INVALID_ROUTE_REQUEST"
      | "MISSING_ENDPOINTS"
      | "MALFORMED_COORDINATES"
      | "IDENTICAL_ENDPOINTS"
      | "OUTSIDE_ENGLAND"
      | "NO_ROUTE"
      | "ROUTE_TOO_LONG"
      | "ROUTING_SERVICE_UNAVAILABLE";
    message: string;
  };
};
