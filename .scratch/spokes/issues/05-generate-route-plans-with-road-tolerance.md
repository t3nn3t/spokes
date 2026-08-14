# 05 — Generate meaningful Route Plans with Road Tolerance

**What to build:** Let the Rider choose among five understandable Road Tolerance settings and receive only materially distinct Least-Traffic, Recommended, and Faster Route Plans with compact, comparable metrics.

**Blocked by:** 04 — Measure Motor-Traffic Travel and Motor-Road Crossings.

**Status:** ready-for-agent

- [ ] The Road Tolerance control has exactly five stops: Maximum Avoidance, Strong Avoidance, Balanced, Faster, and Fastest.
- [ ] Strong Avoidance is selected initially and route generation occurs after the chosen stop settles, not continuously during movement.
- [ ] BRouter generates a candidate pool that Spokes audits before eligibility filtering, scoring, role assignment, and deduplication.
- [ ] Maximum Avoidance prioritizes minimum Motor-Traffic Travel before crossings, Unverified Passage, and approximate duration.
- [ ] Strong Avoidance aims for no more than 10% Motor-Traffic Travel and requires approximately 30% estimated time saving before choosing a more exposed candidate.
- [ ] Balanced begins with a 25% soft exposure target and 20% time-saving threshold; Faster begins with a 40% target and 10% threshold.
- [ ] Fastest selects the eligible candidate with minimum approximate duration and uses exposure and crossing cost only as tie-breakers.
- [ ] Minimum audited exposure determines the Least-Traffic Route and the selected setting determines the Recommended Route.
- [ ] A Faster Route is shown only when it materially reduces duration while accepting greater exposure.
- [ ] Substantially overlapping candidates with no meaningful time, exposure, or corridor difference are collapsed.
- [ ] When Least Traffic and Recommended are the same candidate, the UI presents one route rather than duplicate cards.
- [ ] Each visible candidate card contains only distance, approximate duration, Motor-Traffic Travel distance and percentage, Unverified Passage distance, and significant Motor-Road Crossing count.
- [ ] Changing Road Tolerance updates the Recommended Route without ever admitting an Explicit Exclusion.
- [ ] When a preferred target is impossible, Spokes returns the least-exposed eligible result and displays its actual compromise.
- [ ] API and browser tests cover all five settings, threshold boundaries, duplicates, missing Faster alternatives, combined roles, and no-route behavior.

