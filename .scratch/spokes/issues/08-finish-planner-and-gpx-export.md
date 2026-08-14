# 08 — Finish the Rider-ready planner and GPX export

**What to build:** Turn the accepted routing model into the complete first-version planning experience: a clear desktop-first map that remains usable on a phone, presents compact Route Plan comparisons, handles failures gracefully, and exports the selected audited route as GPX without retaining journey history.

**Blocked by:** 07 — Calibrate and accept the Hertfordshire routing model.

**Status:** ready-for-agent

- [ ] The essential workflow—select endpoints, choose Road Tolerance, generate, compare, select, inspect, and export—works coherently without exposing implementation diagnostics.
- [ ] Requested markers, selected Route Plan, unselected alternatives, Motor-Traffic Travel, Traffic-Avoidant Passage, and Unverified Passage remain visually distinguishable.
- [ ] Unverified Passage is explained once in compact language and does not trigger repeated modal warnings.
- [ ] Loading, invalid-input, outside-England, over-limit, unavailable-service, excessive-snap, and no-route states are clear and recoverable.
- [ ] Only materially distinct candidate cards appear and selecting a card emphasizes the matching route geometry.
- [ ] GPX export uses the selected audited geometry, includes basic metadata and attribution, and omits turn-by-turn navigation instructions.
- [ ] An automated test parses the GPX and confirms that its geometry matches the selected Route Plan rather than another candidate.
- [ ] OpenStreetMap and relevant basemap attribution remain visible without obscuring route inspection.
- [ ] The layout preserves the full planning workflow at representative desktop and phone widths without adding GPS or offline behavior.
- [ ] Spokes has no application database, analytics, account system, saved routes, or server-side route history.
- [ ] A browser smoke test covers the complete Rider workflow and GPX download at desktop and phone widths.

