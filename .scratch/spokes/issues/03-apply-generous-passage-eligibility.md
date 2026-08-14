# 03 — Apply generous passage eligibility

**What to build:** Audit every routed segment according to the accepted generous policy, so the Rider can use ambiguous connections as minimally labelled Unverified Passage while Spokes removes only high-confidence Explicit Exclusions.

**Blocked by:** 02 — Plan between two map-selected England points.

**Status:** resolved

- [x] Every returned segment is classified as Eligible, Unverified Passage, or Explicit Exclusion independently of BRouter's aggregate score.
- [x] A clear current general- or foot-passage prohibition, private passage marker, explicit closure, clearly locked critical barrier, or clearly impassable critical barrier produces an Explicit Exclusion.
- [x] Bicycle-only restrictions with plausible foot passage remain eligible as Unverified Passage rather than becoming Explicit Exclusions.
- [x] Missing, conflicting, indirect, or ambiguous conditional access data becomes Unverified Passage.
- [x] Footpaths, steps, stiles, gates, poor surfaces, and difficult gradients remain eligible unless source data clearly establishes impassability.
- [x] No Route Plan returned to the Rider contains an Explicit Exclusion at any Road Tolerance.
- [x] A journey disconnected by Explicit Exclusions returns no route rather than relaxing the exclusion policy.
- [x] Route Plan data includes audited segment classifications and total Unverified Passage distance.
- [x] Unverified Passage and explicit walk-bike passage use 7 km/h in the approximate duration model.
- [x] The map distinguishes Unverified Passage with restrained styling and one compact explanation rather than repeated warnings.
- [x] Deterministic API fixtures cover the full agreed eligibility matrix, including bicycle-only restriction, conflicting data, ordinary and locked barriers, and private passage.

## Outcome

- Added an independent per-segment passage audit at the Route Planning API boundary, including conservative 7 km/h timing for Unverified and explicit walk-bike passage and a no-route result whenever an Explicit Exclusion remains.
- Added a versioned BRouter lookup/build path that preserves the required way and node attributes, distinguishes private from ambiguous access, recognizes always-active restrictions, and keeps passable construction ways available for audit.
- Added audited segment geometry and total Unverified Passage to Route Plans, with restrained dashed map styling and one compact Rider-facing explanation.
- Covered the agreed eligibility matrix with deterministic API fixtures. The full type-check, 20-test suite, production build, container configuration, lookup transformation, browser smoke check, and fixed-point standards/spec reviews pass.
