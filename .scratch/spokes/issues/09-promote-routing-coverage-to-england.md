# 09 — Promote routing coverage from Hertfordshire to England

**What to build:** Expand the accepted routing model to a versioned all-England OpenStreetMap snapshot while preserving the Hertfordshire baseline and making future monthly data promotion safe and repeatable.

**Blocked by:** 07 — Calibrate and accept the Hertfordshire routing model.

**Status:** ready-for-agent

- [ ] The routing service loads a versioned graph covering England without changing the jurisdiction-specific policy.
- [ ] Valid endpoint pairs across England can produce Route Plans subject to the same 100-kilometre, snapping, eligibility, audit, exposure, crossing, and Road Tolerance rules.
- [ ] Endpoints outside England remain rejected even when underlying source tiles extend beyond the boundary.
- [ ] The complete Hertfordshire benchmark reruns against the England snapshot and preserves the accepted regression thresholds.
- [ ] Graph artifacts remain outside ordinary source control while their source, version, integrity, and reproduction process are recorded.
- [ ] A candidate monthly snapshot is built and tested separately from the active snapshot.
- [ ] A snapshot is promoted only after automated checks and the Hertfordshire regression gate pass; failed candidates leave the active snapshot unchanged.
- [ ] Local-authority or Ordnance Survey geometry is not merged into the first-version routable graph.
- [ ] Routing responses expose the active snapshot identifier for reproducibility.

