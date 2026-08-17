# 04 — Measure Motor-Traffic Travel and Motor-Road Crossings

**What to build:** Make expected shared motor exposure visible and influential from routing through presentation, independently of pavement, while detecting significant crossings as a separate risk.

**Blocked by:** 03 — Apply generous passage eligibility.

**Status:** resolved

- [x] Audited segments receive expected motor-exposure tiers derived from road class, motor access, speed and relevant local attributes rather than surface alone.
- [x] Segregated and non-motor passage has no ordinary exposure; restricted service access can be rare; BOATs and motor-access tracks can be low; ordinary shared roads can be moderate; and major or high-speed roads can be high.
- [x] A paved segregated cycleway is classified as Traffic-Avoidant Passage.
- [x] An unpaved way with motor access is classified by expected traffic rather than assumed traffic-free.
- [x] Each Route Plan reports Motor-Traffic Travel distance and percentage calculated from audited geometry.
- [x] Motor-Road Crossings are detected and counted separately from longitudinal Motor-Traffic Travel.
- [x] Grade-separated crossings have no at-grade conflict, controlled crossing facilities reduce the crossing penalty, and uncontrolled major-road crossings receive the strongest penalty.
- [x] The custom routing profile materially prefers lower expected exposure while still returning enough candidates for later selection.
- [x] The map distinguishes Motor-Traffic Travel from Traffic-Avoidant Passage and the candidate summary displays exposure and crossing metrics.
- [x] Deterministic fixtures cover all exposure tiers, paved and unpaved counterexamples, bridges, tunnels, controlled crossings, and uncontrolled major-road crossings.

## Outcome

- Added independent expected motor-exposure auditing, audited geometry metrics, crossing classifications, and compact estimated Rider-facing summaries and map styles.
- Added a pinned BRouter graph and traversal patch so through-crossings are detected topologically and penalized only when the Route Plan crosses a major road rather than joins or travels along it.
- Calibrated finite exposure and crossing costs in the Spokes profile, preserved the required lookup attributes, and used the same multi-stage patched BRouter build for graph creation and runtime routing.
- Verified 48 deterministic Route Planning API cases, TypeScript and production build checks, BRouter 12.1 profile parsing and cost ordering, patched Java compilation and traversal fixtures, Compose configuration, and the desktop browser planning flow.
- Fixed-point Standards and Spec reviews against `a4d1e5cfab31a86e3746ca10165142dc04c5e6cc` completed with zero findings.
