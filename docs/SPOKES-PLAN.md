# Spokes Product and Delivery Plan

**Status:** Accepted on 6 August 2026. Implementation has not begun.

## Product

Spokes is a private, England-only web planner for a single mountain-bike rider. It finds point-to-point routes that minimize expected exposure to motor traffic, even when avoiding traffic requires a large detour or an ambiguous path that the Rider must check independently.

Its advantage over ordinary cycling planners is not generic “off-road” or “quiet” routing. It explicitly trades estimated journey time against expected motor-traffic exposure, admits Unverified Passage generously, and shows the consequence compactly.

## Rider

The sole Rider uses a mountain bike, welcomes difficult terrain, is willing to climb, carry, push, negotiate steps and gates, and does not need route difficulty protected against. The Rider will inspect Unverified Passage before travelling.

## First-version experience

1. The Rider selects exact start and destination points on a map.
2. Spokes generates only materially distinct candidates:
   - Least Traffic;
   - Recommended for the selected Road Tolerance;
   - Faster, when a meaningfully quicker candidate exists.
3. A five-stop **Avoid motor traffic** control provides Maximum Avoidance, Strong Avoidance, Balanced, Faster, and Fastest. Strong Avoidance is the default.
4. Each candidate shows distance, approximate duration, estimated motor-traffic distance and percentage, Unverified Passage distance, and significant motor-road crossing count.
5. Motor-Traffic Travel and Unverified Passage are visually distinguishable on the map without repeated warnings or legal ceremony.
6. The Rider can export the selected route as GPX.

The maximum point-to-point journey is 100 kilometres. The web interface is desktop-first but remains usable on a phone; it does not provide mobile or offline navigation.

## Route eligibility

Spokes uses a deliberately generous three-state policy:

1. **Eligible:** passage is physically connected and bicycle or general passage is supported by available data.
2. **Unverified:** passage is physically connected, but bicycle accompaniment or access is missing, ambiguous, conflicting, or merely bicycle-restrictive. This includes a foot-accessible segment tagged `bicycle=no`; it remains eligible for Rider review and is not presented as permitted cycling.
3. **Explicit Exclusion:** current data clearly establishes that passage itself is private, prohibited, closed, locked, or impassable.

Missing data, footpaths, rough terrain, steps, stiles, gates, and bicycle restrictions alone are not Explicit Exclusions. Known private/no-passage restrictions are never relaxed merely to connect a route.

## Routing objective

Surface is not the objective: a paved segregated cycleway is excellent, while an unpaved route shared with frequent motor traffic is not. Expected exposure is inferred conservatively from available map attributes rather than claimed as measured or live traffic.

Candidate scoring considers:

1. Explicit Exclusions as ineligible;
2. expected frequency and severity of shared motor traffic;
3. significant motor-road crossings, scored separately from distance;
4. approximate journey time from distance, gradient, surface, barriers, and passage type;
5. a small uncertainty penalty that prefers verified bicycle passage only when routes are otherwise close.

Unverified and explicit walk-bike sections use 7 km/h in the first time model. Difficult terrain and climbing affect estimated time but are never excluded or penalized merely for being difficult.

Strong Avoidance aims for under 10% Motor-Traffic Travel. It accepts greater exposure only when doing so produces a substantial estimated time reduction, initially calibrated around 30%. When the target cannot be met, Spokes returns the least-exposed eligible route and reports the result honestly.

## Data and routing architecture

- OpenStreetMap is the only first-version routable graph.
- A self-hosted BRouter instance performs graph search using a Spokes-specific profile.
- Spokes audits every returned segment independently to calculate exposure, uncertainty, exclusions, crossings, and summary metrics.
- CycleStreets Quietest is a benchmark, not the routing dependency; it does not minimize motor-traffic distance or expose a comparable preference control.
- Local-authority definitive-map data may later appear as a separate verification overlay. It is not merged into the first routing graph.
- MapLibre renders one clear, path-focused basemap. Its tile provider remains replaceable.
- Routing data is a versioned snapshot during tuning. After acceptance, it refreshes monthly and the benchmark runs before a new snapshot is promoted.

## Application architecture

- Next.js and TypeScript web interface on Vercel;
- no application database, server-side route history, analytics, accounts, or saved routes;
- private access protection rather than an account system;
- browser requests reach BRouter only through the Next.js backend;
- BRouter runs locally in a separate container during development;
- production first tests the separate BRouter container on Vercel, with a cold-response acceptance limit of roughly ten seconds;
- if Vercel memory or cold starts are unreliable, the unchanged container moves to a small always-on host while the web interface remains on Vercel.

Development begins with the BRouter data tile covering Hertfordshire. All England routing data is loaded before version one is declared complete.

## Validation

The primary benchmark contains 20 Hertfordshire journeys:

- 12 Rider-chosen destinations from the shared `///avoid.ranked.motor` start;
- eight deliberately varied cases covering towns, countryside, major-road crossings, railways, rivers, and weakly connected path networks.

The exact fixtures and geographic assertions are recorded in [HERTFORDSHIRE-BENCHMARK.md](./HERTFORDSHIRE-BENCHMARK.md).

Version one passes when:

- no route knowingly uses an Explicit Exclusion;
- every ambiguous segment is minimally labelled Unverified;
- at least 16 of 20 Least-Traffic routes beat CycleStreets Quietest on estimated motor exposure;
- at least 16 of 20 routes are judged usable by the Rider after map inspection;
- failures provide enough segment classification to tune or diagnose the profile.

The known stock-profile check establishes feasibility but not acceptance: BRouter's MTB profile reduced broad road-class use substantially relative to its trekking profile on the first two journeys, yet still produced roughly 17% road-class use and selected substantial uncertain passage. A custom profile and independent audit are therefore required.

## Delivery sequence

1. Establish the versioned Hertfordshire routing dataset.
2. Develop the custom BRouter profile and segment-audit model.
3. Run the 20-route benchmark against CycleStreets.
4. Stop or revisit the model if the core routing result is not convincingly tunable.
5. Build the local Next.js and MapLibre interface.
6. Add the five-stop Road Tolerance control, meaningful alternatives, compact metrics, and GPX export.
7. Rerun acceptance testing and load all England routing data.
8. Deploy privately to Vercel, test the routing container's cold behaviour, and move only that service if necessary.

## Explicitly deferred

Place or what3words search, via points, dragged route shaping, segment avoidance, manual editing, round trips, route history, favourites, accounts, collaboration, live navigation, GPS recording, offline use, live closures, weather, satellite imagery, elevation charts, and crowdsourced corrections are outside version one.

## Evidence behind the decisions

- [GOV.UK public rights-of-way categories](https://www.gov.uk/right-of-way-open-access-land/use-public-rights-of-way)
- [Natural England definitive-map responsibilities](https://www.gov.uk/guidance/public-rights-of-way-local-authority-responsibilities)
- [BRouter profile development guide](https://github.com/abrensch/brouter/blob/master/docs/developers/profile_developers_guide.md)
- [CycleStreets quietness model](https://www.cyclestreets.net/help/journey/howitworks/#quietness)
- [Vercel container Functions](https://vercel.com/changelog/bring-your-dockerfile-to-vercel-functions)
- [Vercel container lifecycle](https://vercel.com/kb/guide/docker)
