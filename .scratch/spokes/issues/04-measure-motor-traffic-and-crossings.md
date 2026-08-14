# 04 — Measure Motor-Traffic Travel and Motor-Road Crossings

**What to build:** Make expected shared motor exposure visible and influential from routing through presentation, independently of pavement, while detecting significant crossings as a separate risk.

**Blocked by:** 03 — Apply generous passage eligibility.

**Status:** ready-for-agent

- [ ] Audited segments receive expected motor-exposure tiers derived from road class, motor access, speed and relevant local attributes rather than surface alone.
- [ ] Segregated and non-motor passage has no ordinary exposure; restricted service access can be rare; BOATs and motor-access tracks can be low; ordinary shared roads can be moderate; and major or high-speed roads can be high.
- [ ] A paved segregated cycleway is classified as Traffic-Avoidant Passage.
- [ ] An unpaved way with motor access is classified by expected traffic rather than assumed traffic-free.
- [ ] Each Route Plan reports Motor-Traffic Travel distance and percentage calculated from audited geometry.
- [ ] Motor-Road Crossings are detected and counted separately from longitudinal Motor-Traffic Travel.
- [ ] Grade-separated crossings have no at-grade conflict, controlled crossing facilities reduce the crossing penalty, and uncontrolled major-road crossings receive the strongest penalty.
- [ ] The custom routing profile materially prefers lower expected exposure while still returning enough candidates for later selection.
- [ ] The map distinguishes Motor-Traffic Travel from Traffic-Avoidant Passage and the candidate summary displays exposure and crossing metrics.
- [ ] Deterministic fixtures cover all exposure tiers, paved and unpaved counterexamples, bridges, tunnels, controlled crossings, and uncontrolled major-road crossings.

