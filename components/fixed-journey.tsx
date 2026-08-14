"use client";

import { useCallback, useEffect, useState } from "react";

import {
  FIXED_HERTFORDSHIRE_JOURNEY,
  type RoutePlanningError,
  type RoutePlanningResponse,
} from "@/lib/route-planning";

type RequestState =
  | { status: "loading" }
  | { status: "ready"; response: RoutePlanningResponse }
  | { status: "error"; message: string };

function projectRoute(coordinates: [number, number][]) {
  const padding = 42;
  const width = 920;
  const height = 410;
  const longitudes = coordinates.map(([longitude]) => longitude);
  const latitudes = coordinates.map(([, latitude]) => latitude);
  const minimumLongitude = Math.min(...longitudes);
  const maximumLongitude = Math.max(...longitudes);
  const minimumLatitude = Math.min(...latitudes);
  const maximumLatitude = Math.max(...latitudes);
  const longitudeRange = maximumLongitude - minimumLongitude || 1;
  const latitudeRange = maximumLatitude - minimumLatitude || 1;

  const points = coordinates.map(([longitude, latitude]) => {
    const x =
      padding + ((longitude - minimumLongitude) / longitudeRange) * (width - padding * 2);
    const y =
      padding + ((maximumLatitude - latitude) / latitudeRange) * (height - padding * 2);
    return { x, y };
  });

  return {
    path: points
      .map(({ x, y }, index) => `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`)
      .join(" "),
    start: points[0],
    finish: points.at(-1)!,
  };
}

function formatDistance(metres: number) {
  return `${(metres / 1000).toFixed(1)} km`;
}

export function FixedJourney() {
  const [retryCount, setRetryCount] = useState(0);
  const [state, setState] = useState<RequestState>({ status: "loading" });

  const loadRoute = useCallback(async (signal: AbortSignal) => {
    setState({ status: "loading" });

    try {
      const response = await fetch("/api/routes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(FIXED_HERTFORDSHIRE_JOURNEY),
        signal,
      });
      const body = (await response.json()) as RoutePlanningResponse | RoutePlanningError;

      if (!response.ok || "error" in body) {
        throw new Error(
          "error" in body ? body.error.message : "The provisional route could not be loaded.",
        );
      }

      setState({ status: "ready", response: body });
    } catch (error) {
      if (signal.aborted) return;
      setState({
        status: "error",
        message:
          error instanceof Error ? error.message : "The provisional route could not be loaded.",
      });
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadRoute(controller.signal);
    return () => controller.abort();
  }, [retryCount, loadRoute]);

  if (state.status === "loading") {
    return (
      <section className="route-shell loading-card" aria-live="polite">
        <span className="spinner" aria-hidden="true" />
        <p>Asking the local routing service for a provisional route…</p>
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section className="route-shell error-card" aria-live="polite">
        <p>{state.message}</p>
        <button type="button" onClick={() => setRetryCount((value) => value + 1)}>
          Try again
        </button>
      </section>
    );
  }

  const route = state.response.routes[0];
  const drawing = projectRoute(route.geometry.coordinates);

  return (
    <section className="route-layout" aria-label="Provisional route">
      <div className="route-canvas">
        <div className="canvas-key">
          <span className="key-line" aria-hidden="true" />
          Provisional route geometry
        </div>
        <svg viewBox="0 0 920 410" role="img" aria-label="Route geometry from Welwyn Garden City to Hatfield">
          <defs>
            <pattern id="grid" width="46" height="46" patternUnits="userSpaceOnUse">
              <path d="M 46 0 L 0 0 0 46" className="grid-line" />
            </pattern>
          </defs>
          <rect width="920" height="410" fill="url(#grid)" />
          <path d={drawing.path} className="route-shadow" />
          <path d={drawing.path} className="route-line" />
          <circle cx={drawing.start.x} cy={drawing.start.y} r="11" className="endpoint start" />
          <circle cx={drawing.finish.x} cy={drawing.finish.y} r="11" className="endpoint finish" />
        </svg>
        <span className="place-label start-label">Welwyn Garden City</span>
        <span className="place-label finish-label">Hatfield</span>
      </div>

      <aside className="route-card">
        <p className="card-kicker">Provisional route</p>
        <p className="distance">{formatDistance(route.totalDistanceMeters)}</p>
        <dl>
          <div>
            <dt>Road Tolerance</dt>
            <dd>Strong Avoidance</dd>
          </div>
          <div>
            <dt>Routing data</dt>
            <dd>{state.response.dataSnapshot}</dd>
          </div>
        </dl>
        <p className="note">This first slice shows BRouter geometry and total distance only.</p>
      </aside>
    </section>
  );
}
