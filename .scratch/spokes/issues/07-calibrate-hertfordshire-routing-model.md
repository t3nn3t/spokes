# 07 — Calibrate and accept the Hertfordshire routing model

**What to build:** Tune the Spokes-specific BRouter profile and application calibration against the benchmark until the accepted routing gate passes, or stop with a clear no-go result before investing in the finished planner.

**Blocked by:** 06 — Generate the Hertfordshire benchmark report.

**Status:** ready-for-agent

- [ ] Calibration changes are made against the frozen snapshot and are attributable to a profile, eligibility, exposure, crossing, timing, or selection rule.
- [ ] Calibration never weakens Explicit Exclusions or hides Unverified Passage to improve the score.
- [ ] Least-Traffic Routes beat CycleStreets Quietest on estimated Motor-Traffic Travel for at least 16 of 20 journeys under the same audit.
- [ ] At least 16 of 20 journeys are presented for Rider inspection and recorded as usable.
- [ ] All accepted journeys remain free of known Explicit Exclusions and retain Unverified labels where required.
- [ ] Barrier, snapping, no-route, and diagnostic assertions continue to pass after tuning.
- [ ] Initial tuning values may change only when the resulting behavior still matches the accepted Road Tolerance meanings and ADRs.
- [ ] The accepted profile, calibration, snapshot identifier, benchmark results, and Rider judgments form a reproducible baseline for later regression.
- [ ] If the gate cannot pass within a focused calibration cycle, the outcome documents the blocking evidence and marks downstream product work as stopped rather than weakening the product premise.

