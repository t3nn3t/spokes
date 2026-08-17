"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { RouteMap, type SelectedEndpoints } from "@/components/route-map";
import {
  INITIAL_ROAD_TOLERANCE,
  type Coordinate,
  type RoutePlanningError,
  type RoutePlanningResponse,
} from "@/lib/route-planning";

type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; response: RoutePlanningResponse }
  | { status: "error"; error: RoutePlanningError["error"] };

function formatCoordinate(coordinate: Coordinate | null) {
  if (!coordinate) return "Not selected";
  return `${coordinate.latitude.toFixed(5)}, ${coordinate.longitude.toFixed(5)}`;
}

function formatDistance(metres: number) {
  if (metres < 1000) return `${metres} m`;
  return `${(metres / 1000).toFixed(1)} km`;
}

function formatDuration(seconds: number) {
  const totalMinutes = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours ? `${hours} hr ${minutes} min` : `${minutes} min`;
}

function stateHeading(code: RoutePlanningError["error"]["code"]) {
  if (code === "ROUTING_SERVICE_UNAVAILABLE") return "Routing unavailable";
  if (code === "NO_ROUTE" || code === "ROUTE_TOO_LONG") return "No route";
  if (code === "OUTSIDE_ENGLAND") return "Outside England";
  return "Invalid input";
}

export function RoutePlanner() {
  const [endpoints, setEndpoints] = useState<SelectedEndpoints>({
    start: null,
    destination: null,
  });
  const [state, setState] = useState<RequestState>({ status: "idle" });
  const clickTargetRef = useRef<"start" | "destination">("start");
  const requestVersionRef = useRef(0);
  const activeRequestRef = useRef<AbortController | null>(null);

  useEffect(() => () => activeRequestRef.current?.abort(), []);

  const selectEndpoint = useCallback((coordinate: Coordinate) => {
    activeRequestRef.current?.abort();
    activeRequestRef.current = null;
    requestVersionRef.current += 1;
    setState({ status: "idle" });

    if (clickTargetRef.current === "start") {
      setEndpoints({ start: coordinate, destination: null });
      clickTargetRef.current = "destination";
    } else {
      setEndpoints((current) => ({ ...current, destination: coordinate }));
      clickTargetRef.current = "start";
    }
  }, []);

  async function planRoute() {
    if (!endpoints.start || !endpoints.destination) return;

    activeRequestRef.current?.abort();
    const controller = new AbortController();
    const requestVersion = requestVersionRef.current + 1;
    requestVersionRef.current = requestVersion;
    activeRequestRef.current = controller;
    setState({ status: "loading" });

    try {
      const response = await fetch("/api/routes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          start: endpoints.start,
          destination: endpoints.destination,
          roadTolerance: INITIAL_ROAD_TOLERANCE,
        }),
        signal: controller.signal,
      });
      const body = (await response.json()) as RoutePlanningResponse | RoutePlanningError;
      if (requestVersionRef.current !== requestVersion) return;

      if (!response.ok || "error" in body) {
        setState({
          status: "error",
          error:
            "error" in body
              ? body.error
              : { code: "ROUTING_SERVICE_UNAVAILABLE", message: "Routing is unavailable." },
        });
        return;
      }

      setState({ status: "ready", response: body });
    } catch {
      if (controller.signal.aborted || requestVersionRef.current !== requestVersion) return;
      setState({
        status: "error",
        error: {
          code: "ROUTING_SERVICE_UNAVAILABLE",
          message: "The routing service is unavailable. Try again shortly.",
        },
      });
    } finally {
      if (activeRequestRef.current === controller) activeRequestRef.current = null;
    }
  }

  const route = state.status === "ready" ? state.response.routes[0] : null;

  return (
    <section className="planner-layout" aria-label="Route planner">
      <div className="map-panel">
        <div className="map-instruction" aria-live="polite">
          {endpoints.start && !endpoints.destination
            ? "Now select the destination"
            : "Select a start, then a destination"}
        </div>
        <RouteMap
          endpoints={endpoints}
          response={state.status === "ready" ? state.response : null}
          onSelect={selectEndpoint}
        />
        {route && (
          <div className="map-legend" aria-label="Route passage legend">
            <span><i className="passage-swatch traffic-avoidant-swatch" />Traffic-Avoidant Passage</span>
            <span><i className="passage-swatch motor-traffic-swatch" />Motor-Traffic Travel</span>
            <span><i className="passage-swatch unverified-swatch" />Unverified Passage</span>
          </div>
        )}
      </div>

      <aside className="planning-panel">
        <div>
          <p className="panel-kicker">Route request</p>
          <h2>Choose two points</h2>
        </div>

        <dl className="endpoint-list">
          <div>
            <dt><span className="endpoint-dot start-dot" />Requested start</dt>
            <dd>{formatCoordinate(endpoints.start)}</dd>
          </div>
          <div>
            <dt><span className="endpoint-dot destination-dot" />Requested destination</dt>
            <dd>{formatCoordinate(endpoints.destination)}</dd>
          </div>
          <div>
            <dt>Road Tolerance</dt>
            <dd>Strong Avoidance</dd>
          </div>
        </dl>

        <button
          type="button"
          disabled={!endpoints.start || !endpoints.destination || state.status === "loading"}
          onClick={() => void planRoute()}
        >
          {state.status === "loading" ? "Planning route…" : "Plan route"}
        </button>

        <div className="result-state" aria-live="polite">
          {state.status === "idle" && <p>Both requested markers remain on the map while Spokes plans.</p>}
          {state.status === "loading" && (
            <p className="loading-message"><span className="spinner" aria-hidden="true" />Finding a provisional Route Plan…</p>
          )}
          {state.status === "error" && (
            <div className="feedback error-feedback">
              <strong>{stateHeading(state.error.code)}</strong>
              <p>{state.error.message}</p>
            </div>
          )}
          {route && (
            <div className="route-result">
              <p className="panel-kicker">Provisional Route Plan</p>
              <p className="route-distance">{formatDistance(route.totalDistanceMeters)}</p>
              <p className="route-duration">Approximately {formatDuration(route.approximateDurationSeconds)}</p>
              <dl className="route-details">
                <div><dt>Start connector</dt><dd>{formatDistance(route.connectorDistanceMeters.start)}</dd></div>
                <div><dt>Destination connector</dt><dd>{formatDistance(route.connectorDistanceMeters.destination)}</dd></div>
                <div>
                  <dt><span className="passage-swatch motor-traffic-swatch" />Estimated Motor-Traffic Travel</dt>
                  <dd>
                    {formatDistance(route.motorTrafficTravelDistanceMeters)} · {route.motorTrafficTravelPercentage}%
                  </dd>
                </div>
                <div>
                  <dt>Estimated Motor-Road Crossings</dt>
                  <dd>{route.motorRoadCrossingCount}</dd>
                </div>
                <div>
                  <dt><span className="passage-swatch unverified-swatch" />Unverified Passage</dt>
                  <dd>{formatDistance(route.unverifiedPassageDistanceMeters)}</dd>
                </div>
              </dl>
              <p className="connector-note">Dashed connectors show any gap between your markers and the routed graph.</p>
              {route.unverifiedPassageDistanceMeters > 0 && (
                <p className="unverified-note">
                  Unverified Passage is physically connected, but check bicycle access before travelling.
                </p>
              )}
            </div>
          )}
        </div>
      </aside>
    </section>
  );
}
