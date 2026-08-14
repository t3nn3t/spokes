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
        name: "spokes-route-plan",
        "track-length": "9342",
        "total-time": "2803",
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
  it("returns a defined invalid-input result for malformed JSON", async () => {
    const response = await POST(
      new Request("http://localhost/api/routes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{",
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: {
        code: "INVALID_ROUTE_REQUEST",
        message: "The route request is invalid.",
      },
    });
  });

  it("plans between two requested England points through BRouter", async () => {
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
      roadTolerance: "strong-avoidance",
      routes: [
        {
          role: "provisional",
          requestedCoordinates: {
            start: fixedJourneyRequest.start,
            destination: fixedJourneyRequest.destination,
          },
          snappedCoordinates: {
            start: fixedJourneyRequest.start,
            destination: fixedJourneyRequest.destination,
          },
          connectorDistanceMeters: {
            start: 0,
            destination: 0,
            total: 0,
          },
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
          approximateDurationSeconds: 2803,
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

  it("returns the defined unavailable result for malformed BRouter geometry", async () => {
    const malformedResponse = structuredClone(controlledBrouterResponse);
    malformedResponse.features[0].geometry.coordinates[0] = [999, 999, 91];
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(malformedResponse), { status: 200 }),
      ),
    );

    const response = await POST(routeRequest());

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: {
        code: "ROUTING_SERVICE_UNAVAILABLE",
        message: "The routing service is unavailable. Try again shortly.",
      },
    });
  });

  it("returns a defined validation result when an endpoint is missing", async () => {
    const { destination: _destination, ...requestWithoutDestination } = fixedJourneyRequest;

    const response = await POST(routeRequest(requestWithoutDestination));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: {
        code: "MISSING_ENDPOINTS",
        message: "Choose both a start and destination.",
      },
    });
  });

  it("returns a defined validation result for malformed coordinates", async () => {
    const response = await POST(
      routeRequest({
        ...fixedJourneyRequest,
        start: { latitude: 95, longitude: "not-a-longitude" },
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: {
        code: "MALFORMED_COORDINATES",
        message: "Coordinates must use valid latitude and longitude values.",
      },
    });
  });

  it("returns a defined validation result for identical endpoints", async () => {
    const response = await POST(
      routeRequest({
        ...fixedJourneyRequest,
        destination: fixedJourneyRequest.start,
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: {
        code: "IDENTICAL_ENDPOINTS",
        message: "Start and destination must be different points.",
      },
    });
  });

  it("returns an outside-scope result for an endpoint outside England", async () => {
    const response = await POST(
      routeRequest({
        ...fixedJourneyRequest,
        start: { latitude: 51.4816, longitude: -3.1791 },
      }),
    );

    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({
      error: {
        code: "OUTSIDE_ENGLAND",
        message: "Spokes currently plans routes only within England.",
      },
    });
  });

  it("keeps England and Wales distinct along the land border", async () => {
    const responseForChester = structuredClone(controlledBrouterResponse);
    responseForChester.features[0].geometry.coordinates[0] = [-2.89, 53.19, 20];
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(responseForChester), { status: 200 }),
      ),
    );

    const chesterResponse = await POST(
      routeRequest({
        ...fixedJourneyRequest,
        start: { latitude: 53.19, longitude: -2.89 },
      }),
    );
    const wrexhamResponse = await POST(
      routeRequest({
        ...fixedJourneyRequest,
        start: { latitude: 53.043, longitude: -2.993 },
      }),
    );

    expect(chesterResponse.status).toBe(200);
    expect(wrexhamResponse.status).toBe(422);
    expect(await wrexhamResponse.json()).toMatchObject({
      error: { code: "OUTSIDE_ENGLAND" },
    });
  });

  it("accepts representative English coastal and island points", async () => {
    const englishPoints = [
      { latitude: 50.8058, longitude: -1.0872 }, // Portsmouth
      { latitude: 53.8175, longitude: -3.0357 }, // Blackpool
      { latitude: 55.771, longitude: -2.007 }, // Berwick-upon-Tweed
      { latitude: 50.699, longitude: -1.295 }, // Isle of Wight
      { latitude: 49.9136, longitude: -6.315 }, // Isles of Scilly
    ];

    for (const start of englishPoints) {
      const responseForRequestedPoint = structuredClone(controlledBrouterResponse);
      responseForRequestedPoint.features[0].geometry.coordinates[0] = [
        start.longitude,
        start.latitude,
        20,
      ];
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          new Response(JSON.stringify(responseForRequestedPoint), { status: 200 }),
        ),
      );

      const response = await POST(routeRequest({ ...fixedJourneyRequest, start }));

      expect(response.status, `${start.latitude}, ${start.longitude}`).toBe(200);
    }
  });

  it("accepts a different pair of England coordinates", async () => {
    const destination = { latitude: 51.834048, longitude: -0.186474 };
    const responseForRequestedPoints = structuredClone(controlledBrouterResponse);
    responseForRequestedPoints.features[0].geometry.coordinates[3] = [
      destination.longitude,
      destination.latitude,
      75,
    ];
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(responseForRequestedPoints), { status: 200 }),
      ),
    );

    const response = await POST(routeRequest({ ...fixedJourneyRequest, destination }));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.routes[0].requestedCoordinates.destination).toEqual(destination);
  });

  it("reports snapped coordinates and measured endpoint connectors", async () => {
    const snappedResponse = structuredClone(controlledBrouterResponse);
    snappedResponse.features[0].geometry.coordinates[0] = [-0.150633, 51.797917, 91];
    snappedResponse.features[0].geometry.coordinates[3] = [-0.263146, 51.781007, 75];
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify(snappedResponse), { status: 200 })),
    );

    const response = await POST(routeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.routes[0].snappedCoordinates).toEqual({
      start: { latitude: 51.797917, longitude: -0.150633 },
      destination: { latitude: 51.781007, longitude: -0.263146 },
    });
    expect(body.routes[0].connectorDistanceMeters).toEqual({
      start: 22,
      destination: 21,
      total: 43,
    });
  });

  it("returns no route when BRouter snaps an endpoint by more than 100 metres", async () => {
    const distantSnapResponse = structuredClone(controlledBrouterResponse);
    distantSnapResponse.features[0].geometry.coordinates[0] = [-0.150633, 51.799717, 91];
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(distantSnapResponse), { status: 200 }),
      ),
    );

    const response = await POST(routeRequest());

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: {
        code: "NO_ROUTE",
        message: "No route was found within 100 metres of both selected points.",
      },
    });
  });

  it("returns a defined no-route result when BRouter finds no path", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ type: "FeatureCollection", features: [] }), {
          status: 200,
        }),
      ),
    );

    const response = await POST(routeRequest());

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: {
        code: "NO_ROUTE",
        message: "No route was found between the selected points.",
      },
    });
  });

  it("does not return a candidate journey over 100 kilometres", async () => {
    const overLimitResponse = structuredClone(controlledBrouterResponse);
    overLimitResponse.features[0].properties["track-length"] = "100001";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(overLimitResponse), { status: 200 }),
      ),
    );

    const response = await POST(routeRequest());

    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({
      error: {
        code: "ROUTE_TOO_LONG",
        message: "The available route is longer than 100 kilometres.",
      },
    });
  });
});
