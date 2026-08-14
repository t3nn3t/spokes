import {
  FIXED_HERTFORDSHIRE_JOURNEY,
  HERTFORDSHIRE_DATA_SNAPSHOT,
  type Coordinate,
  type RoutePlanningError,
  type RoutePlanningRequest,
  type RoutePlanningResponse,
} from "@/lib/route-planning";
import {
  requestProvisionalRoute,
  RoutingServiceUnavailableError,
} from "@/lib/server/brouter";

function isCoordinate(value: unknown): value is Coordinate {
  if (typeof value !== "object" || value === null) return false;
  const coordinate = value as Partial<Coordinate>;

  return (
    typeof coordinate.latitude === "number" &&
    Number.isFinite(coordinate.latitude) &&
    typeof coordinate.longitude === "number" &&
    Number.isFinite(coordinate.longitude)
  );
}

function isRoutePlanningRequest(value: unknown): value is RoutePlanningRequest {
  if (typeof value !== "object" || value === null) return false;
  const request = value as Partial<RoutePlanningRequest>;

  return (
    isCoordinate(request.start) &&
    isCoordinate(request.destination) &&
    request.roadTolerance === "strong-avoidance"
  );
}

function isFixedJourney(request: RoutePlanningRequest) {
  return (
    request.start.latitude === FIXED_HERTFORDSHIRE_JOURNEY.start.latitude &&
    request.start.longitude === FIXED_HERTFORDSHIRE_JOURNEY.start.longitude &&
    request.destination.latitude === FIXED_HERTFORDSHIRE_JOURNEY.destination.latitude &&
    request.destination.longitude === FIXED_HERTFORDSHIRE_JOURNEY.destination.longitude
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

  if (!isRoutePlanningRequest(body)) {
    return errorResponse(400, "INVALID_ROUTE_REQUEST", "The route request is invalid.");
  }

  if (!isFixedJourney(body)) {
    return errorResponse(
      400,
      "INVALID_ROUTE_REQUEST",
      "Ticket 01 supports only the fixed Hertfordshire benchmark journey.",
    );
  }

  try {
    const provisionalRoute = await requestProvisionalRoute(body);
    const response: RoutePlanningResponse = {
      dataSnapshot: HERTFORDSHIRE_DATA_SNAPSHOT,
      routes: [provisionalRoute],
    };

    return Response.json(response);
  } catch (error) {
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
