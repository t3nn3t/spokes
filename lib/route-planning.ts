export const HERTFORDSHIRE_DATA_SNAPSHOT = "hertfordshire-2026-08-13";

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
  roadTolerance: "strong-avoidance";
};

export type LineString = {
  type: "LineString";
  coordinates: [longitude: number, latitude: number][];
};

export type ProvisionalRoute = {
  role: "provisional";
  geometry: LineString;
  totalDistanceMeters: number;
};

export type RoutePlanningResponse = {
  dataSnapshot: typeof HERTFORDSHIRE_DATA_SNAPSHOT;
  routes: [ProvisionalRoute];
};

export type RoutePlanningError = {
  error: {
    code: "INVALID_ROUTE_REQUEST" | "ROUTING_SERVICE_UNAVAILABLE";
    message: string;
  };
};
