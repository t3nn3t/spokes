# 02 — Plan between two map-selected England points

**What to build:** Generalize the fixed tracer bullet so the Rider can select exact start and destination points on the map and receive one provisional Route Plan, with honest endpoint handling and clear validation or no-route feedback.

**Blocked by:** 01 — Route one fixed Hertfordshire journey locally.

**Status:** ready-for-agent

- [ ] The Rider can select a start and destination on the map and both requested markers remain visible.
- [ ] Strong Avoidance is the initial Road Tolerance carried by the request, even though alternative selection is deferred.
- [ ] The Route Planning API accepts the two requested coordinates and returns requested coordinates, snapped coordinates, connector distance, geometry, total distance, and approximate duration.
- [ ] Endpoint snapping is limited to 100 metres and excessive snapping returns a clear no-route result rather than moving a marker silently.
- [ ] Malformed coordinates, missing endpoints, and identical endpoints return defined validation results.
- [ ] Endpoints outside England return an outside-scope result.
- [ ] Candidate journeys over 100 kilometres are not returned as Route Plans.
- [ ] The page shows useful loading, invalid-input, routing-unavailable, and no-route states.
- [ ] Automated tests cover successful planning and every defined validation/failure category through the Route Planning API seam.

