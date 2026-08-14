import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const fixedJourneyRequest = {
  start: { latitude: 51.797717, longitude: -0.150633 },
  destination: { latitude: 51.781007, longitude: -0.263446 },
  roadTolerance: "strong-avoidance",
};

const controlledBrouterResponse = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        creator: "BRouter-1.7.10",
        name: "spokes-fixed-journey",
        "track-length": "9342",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [-0.150633, 51.797717, 91],
          [-0.1842, 51.7924, 87],
          [-0.2281, 51.7863, 79],
          [-0.263446, 51.781007, 75],
        ],
      },
    },
  ],
};

function routeRequest(body: unknown = fixedJourneyRequest) {
  return new Request("http://localhost/api/routes", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("POST /api/routes", () => {
  it("returns the fixed Hertfordshire journey from a controlled BRouter response", async () => {
    const brouterFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(controlledBrouterResponse), {
        status: 200,
        headers: { "content-type": "application/vnd.geo+json" },
      }),
    );
    vi.stubGlobal(
      "fetch",
      brouterFetch,
    );

    const response = await POST(routeRequest());

    const [requestedUrl] = brouterFetch.mock.calls[0];
    const brouterUrl = new URL(String(requestedUrl));
    expect(brouterUrl.origin).toBe("http://127.0.0.1:17777");
    expect(brouterUrl.pathname).toBe("/brouter");
    expect(brouterUrl.searchParams.get("lonlats")).toBe(
      "-0.150633,51.797717|-0.263446,51.781007",
    );
    expect(brouterUrl.searchParams.get("profile")).toBe("spokes-mtb");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      dataSnapshot: "hertfordshire-2026-08-13",
      routes: [
        {
          role: "provisional",
          geometry: {
            type: "LineString",
            coordinates: [
              [-0.150633, 51.797717],
              [-0.1842, 51.7924],
              [-0.2281, 51.7863],
              [-0.263446, 51.781007],
            ],
          },
          totalDistanceMeters: 9342,
        },
      ],
    });
  });

  it("returns the defined unavailable result when BRouter cannot be reached", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));

    const response = await POST(routeRequest());

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: {
        code: "ROUTING_SERVICE_UNAVAILABLE",
        message: "The routing service is unavailable. Try again shortly.",
      },
    });
  });

  it("keeps the tracer-bullet API limited to the fixed benchmark journey", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(controlledBrouterResponse), { status: 200 }),
      ),
    );

    const response = await POST(
      routeRequest({
        ...fixedJourneyRequest,
        destination: { latitude: 51.834048, longitude: -0.186474 },
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: {
        code: "INVALID_ROUTE_REQUEST",
        message: "Ticket 01 supports only the fixed Hertfordshire benchmark journey.",
      },
    });
  });
});
