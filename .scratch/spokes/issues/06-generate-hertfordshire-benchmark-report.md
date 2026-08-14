# 06 — Generate the Hertfordshire benchmark report

**What to build:** Produce a reproducible diagnostic report for all 20 fixed Hertfordshire journeys, comparing Spokes with CycleStreets Quietest through the same audit and exposing enough evidence to calibrate the routing model.

**Blocked by:** 05 — Generate meaningful Route Plans with Road Tolerance.

**Status:** ready-for-agent

- [ ] The benchmark runs all 12 Rider-chosen and eight deliberately varied destinations against the fixed shared start.
- [ ] Every Spokes journey uses the same frozen, identified Hertfordshire routing snapshot.
- [ ] CycleStreets Quietest responses are captured as versioned benchmark inputs so ordinary reruns do not depend on live external availability.
- [ ] Spokes and CycleStreets candidates are processed through the same Spokes exposure and eligibility audit before comparison.
- [ ] The report shows per-journey geometry or an inspectable map, duration, Motor-Traffic Travel, Unverified Passage, Motor-Road Crossings, exclusions, endpoint snapping, and comparison outcome.
- [ ] Automated assertions detect geometric jumps across motorways, railways, and water without a mapped connecting edge.
- [ ] The report distinguishes expected no-route cases from routing-service or data failures.
- [ ] No reported candidate knowingly includes an Explicit Exclusion and every ambiguous segment is marked Unverified.
- [ ] Failed or surprising journeys retain segment source attributes and classifications sufficient to identify candidate-generation, auditing, exposure, crossing, timing, or selection faults.
- [ ] Running the benchmark is documented and produces a stable summary without modifying the accepted routing snapshot.
- [ ] This ticket reports the baseline honestly and does not claim the 16-of-20 acceptance gate merely because the automation runs.

