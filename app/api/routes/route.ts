import {
  HERTFORDSHIRE_DATA_SNAPSHOT,
  INITIAL_ROAD_TOLERANCE,
  type Coordinate,
  type RoutePlanningError,
  type RoutePlanningRequest,
  type RoutePlanningResponse,
} from "@/lib/route-planning";
import { isInEngland } from "@/lib/england";
import {
  EndpointSnapExceededError,
  NoEligibleRouteError,
  NoRouteError,
  RouteTooLongError,
  requestProvisionalRoute,
  RoutingServiceUnavailableError,
} from "@/lib/server/brouter";

function isCoordinate(value: unknown): value is Coordinate {
  if (typeof value !== "object" || value === null) return false;
  const coordinate = value as Partial<Coordinate>;

  return (
    typeof coordinate.latitude === "number" &&
    Number.isFinite(coordinate.latitude) &&
    coordinate.latitude >= -90 &&
    coordinate.latitude <= 90 &&
    typeof coordinate.longitude === "number" &&
    Number.isFinite(coordinate.longitude) &&
    coordinate.longitude >= -180 &&
    coordinate.longitude <= 180
  );
}

function errorResponse(
  status: number,
  code: RoutePlanningError["error"]["code"],
  message: string,
) {
  return Response.json({ error: { code, message } } satisfies RoutePlanningError, {
    status,
  });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "INVALID_ROUTE_REQUEST", "The route request is invalid.");
  }

  if (
    typeof body === "object" &&
    body !== null &&
    (!("start" in body) || !("destination" in body) || body.start == null || body.destination == null)
  ) {
    return errorResponse(400, "MISSING_ENDPOINTS", "Choose both a start and destination.");
  }

  if (typeof body !== "object" || body === null) {
    return errorResponse(400, "INVALID_ROUTE_REQUEST", "The route request is invalid.");
  }

  const candidate = body as Partial<RoutePlanningRequest>;
  if (!isCoordinate(candidate.start) || !isCoordinate(candidate.destination)) {
    return errorResponse(
      400,
      "MALFORMED_COORDINATES",
      "Coordinates must use valid latitude and longitude values.",
    );
  }

  if (candidate.roadTolerance !== INITIAL_ROAD_TOLERANCE) {
    return errorResponse(400, "INVALID_ROUTE_REQUEST", "The route request is invalid.");
  }

  const routeRequest: RoutePlanningRequest = {
    start: candidate.start,
    destination: candidate.destination,
    roadTolerance: candidate.roadTolerance,
  };

  if (
    routeRequest.start.latitude === routeRequest.destination.latitude &&
    routeRequest.start.longitude === routeRequest.destination.longitude
  ) {
    return errorResponse(
      400,
      "IDENTICAL_ENDPOINTS",
      "Start and destination must be different points.",
    );
  }

  if (!isInEngland(routeRequest.start) || !isInEngland(routeRequest.destination)) {
    return errorResponse(
      422,
      "OUTSIDE_ENGLAND",
      "Spokes currently plans routes only within England.",
    );
  }

  try {
    const provisionalRoute = await requestProvisionalRoute(routeRequest);
    const response: RoutePlanningResponse = {
      dataSnapshot: HERTFORDSHIRE_DATA_SNAPSHOT,
      roadTolerance: routeRequest.roadTolerance,
      routes: [provisionalRoute],
    };

    return Response.json(response);
  } catch (error) {
    if (error instanceof EndpointSnapExceededError) {
      return errorResponse(
        404,
        "NO_ROUTE",
        "No route was found within 100 metres of both selected points.",
      );
    }

    if (error instanceof NoRouteError) {
      return errorResponse(
        404,
        "NO_ROUTE",
        "No route was found between the selected points.",
      );
    }

    if (error instanceof NoEligibleRouteError) {
      return errorResponse(
        404,
        "NO_ROUTE",
        "No eligible route remains after applying passage exclusions.",
      );
    }

    if (error instanceof RouteTooLongError) {
      return errorResponse(
        422,
        "ROUTE_TOO_LONG",
        "The available route is longer than 100 kilometres.",
      );
    }

    if (error instanceof RoutingServiceUnavailableError) {
      return errorResponse(
        503,
        "ROUTING_SERVICE_UNAVAILABLE",
        "The routing service is unavailable. Try again shortly.",
      );
    }

    throw error;
  }
}
