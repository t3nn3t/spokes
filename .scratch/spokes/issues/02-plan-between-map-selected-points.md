# 02 — Plan between two map-selected England points

**What to build:** Generalize the fixed tracer bullet so the Rider can select exact start and destination points on the map and receive one provisional Route Plan, with honest endpoint handling and clear validation or no-route feedback.

**Blocked by:** 01 — Route one fixed Hertfordshire journey locally.

**Status:** resolved

- [x] The Rider can select a start and destination on the map and both requested markers remain visible.
- [x] Strong Avoidance is the initial Road Tolerance carried by the request, even though alternative selection is deferred.
- [x] The Route Planning API accepts the two requested coordinates and returns requested coordinates, snapped coordinates, connector distance, geometry, total distance, and approximate duration.
- [x] Endpoint snapping is limited to 100 metres and excessive snapping returns a clear no-route result rather than moving a marker silently.
- [x] Malformed coordinates, missing endpoints, and identical endpoints return defined validation results.
- [x] Endpoints outside England return an outside-scope result.
- [x] Candidate journeys over 100 kilometres are not returned as Route Plans.
- [x] The page shows useful loading, invalid-input, routing-unavailable, and no-route states.
- [x] Automated tests cover successful planning and every defined validation/failure category through the Route Planning API seam.

## Outcome

- Replaced the fixed journey with a responsive MapLibre planner where the Rider selects canonical start and destination points, keeps both requested markers visible, and submits Strong Avoidance through the Route Planning API.
- Generalised the API for arbitrary England endpoints with an authoritative multi-polygon boundary, honest requested and snapped coordinates, measured connectors, a 100-metre snap limit, duration and distance totals, and the 100-kilometre route cap.
- Added clear validation, outside-scope, no-route, loading, and routing-unavailable states, including request cancellation so stale responses cannot detach from a newer map selection.
- Added deterministic API-seam coverage for successful planning and every defined validation or failure category; all 15 tests, type checking, production build, browser verification, and both review axes passed.
