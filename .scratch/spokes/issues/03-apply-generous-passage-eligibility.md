# 03 — Apply generous passage eligibility

**What to build:** Audit every routed segment according to the accepted generous policy, so the Rider can use ambiguous connections as minimally labelled Unverified Passage while Spokes removes only high-confidence Explicit Exclusions.

**Blocked by:** 02 — Plan between two map-selected England points.

**Status:** ready-for-agent

- [ ] Every returned segment is classified as Eligible, Unverified Passage, or Explicit Exclusion independently of BRouter's aggregate score.
- [ ] A clear current general- or foot-passage prohibition, private passage marker, explicit closure, clearly locked critical barrier, or clearly impassable critical barrier produces an Explicit Exclusion.
- [ ] Bicycle-only restrictions with plausible foot passage remain eligible as Unverified Passage rather than becoming Explicit Exclusions.
- [ ] Missing, conflicting, indirect, or ambiguous conditional access data becomes Unverified Passage.
- [ ] Footpaths, steps, stiles, gates, poor surfaces, and difficult gradients remain eligible unless source data clearly establishes impassability.
- [ ] No Route Plan returned to the Rider contains an Explicit Exclusion at any Road Tolerance.
- [ ] A journey disconnected by Explicit Exclusions returns no route rather than relaxing the exclusion policy.
- [ ] Route Plan data includes audited segment classifications and total Unverified Passage distance.
- [ ] Unverified Passage and explicit walk-bike passage use 7 km/h in the approximate duration model.
- [ ] The map distinguishes Unverified Passage with restrained styling and one compact explanation rather than repeated warnings.
- [ ] Deterministic API fixtures cover the full agreed eligibility matrix, including bicycle-only restriction, conflicting data, ordinary and locked barriers, and private passage.

