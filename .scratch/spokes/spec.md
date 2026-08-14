# Spokes Implementation Specification

Status: ready-for-agent

## Problem Statement

The Rider wants to travel between two points in England by mountain bike while avoiding shared motor traffic far more aggressively than existing cycling planners do. Existing products may prefer quiet roads or off-road surfaces, but they still select substantial road sections when a longer connected route through cycleways, bridleways, byways, tracks, or ambiguous foot-accessible passage exists.

The Rider is comfortable with difficult terrain, climbing, gates, steps, carrying the bike, and checking uncertain access independently. Spokes must therefore optimize expected motor exposure rather than pavement, route difficulty, or generic cycling convenience. It must remain honest about Motor-Traffic Travel, Unverified Passage, Explicit Exclusions, Motor-Road Crossings, estimated time, and incomplete map data without turning the interface into a warning system.

## Solution

Spokes will be a private, England-only, point-to-point web route planner. The Rider selects two exact map points, chooses one of five Road Tolerance settings, and receives up to three materially distinct Route Plans: a Least-Traffic Route, a Recommended Route, and a Faster Route when one provides a meaningful alternative.

OpenStreetMap supplies the routable graph. A separately deployable BRouter service uses a Spokes-specific profile to generate candidates. The Spokes Route Planning API audits every returned segment, rejects only high-confidence Explicit Exclusions, classifies ambiguous passage as Unverified, estimates Motor-Traffic Travel and Motor-Road Crossings, calculates approximate duration, selects meaningful candidates, and returns GPX-ready geometry and compact comparison metrics.

The first routing model is tuned against a fixed 20-journey Hertfordshire benchmark and compared with CycleStreets Quietest. Only after that model proves convincingly tunable will the map interface be completed and all-England routing data loaded.

## User Stories

1. As the Rider, I want to select an exact start point on a map, so that Spokes begins where my journey actually begins.
2. As the Rider, I want to select an exact destination point on a map, so that Spokes plans the journey I intend to make.
3. As the Rider, I want my selected markers to remain visible, so that I can verify the requested journey before using a result.
4. As the Rider, I want unavoidable access from an endpoint to be included and measured, so that Spokes does not pretend a route begins somewhere else.
5. As the Rider, I want Spokes to reject endpoints outside England, so that it does not apply the England access policy in another jurisdiction.
6. As the Rider, I want routes limited to 100 kilometres, so that requests remain within the intended first-version use case.
7. As the Rider, I want Strong Avoidance selected initially, so that the default reflects my strong preference against motor traffic.
8. As the Rider, I want five understandable Road Tolerance settings, so that I can trade motor exposure against journey time without tuning technical weights.
9. As the Rider, I want route generation to occur after I settle on a Road Tolerance setting, so that dragging the control does not cause constant rerouting.
10. As the Rider, I want a clear loading state while routes are calculated, so that I know Spokes is working.
11. As the Rider, I want a Least-Traffic Route, so that I can see the minimum estimated motor exposure available within the product constraints.
12. As the Rider, I want a Recommended Route, so that I can see the candidate selected by my current Road Tolerance.
13. As the Rider, I want a Faster Route only when it is meaningfully quicker, so that alternatives are useful rather than decorative duplicates.
14. As the Rider, I want duplicate candidates collapsed, so that the same route is not presented under multiple names.
15. As the Rider, I want the selected candidate emphasized on the map, so that I can tell which Route Plan I am inspecting.
16. As the Rider, I want each candidate to show total distance, so that I can compare journey scale.
17. As the Rider, I want each candidate to show approximate duration, so that I can judge the time consequence of avoiding traffic.
18. As the Rider, I want each candidate to show estimated Motor-Traffic Travel distance and percentage, so that I can compare actual exposure rather than a vague quietness score.
19. As the Rider, I want each candidate to show Unverified Passage distance, so that I know how much of the journey requires my own access check.
20. As the Rider, I want each candidate to show significant Motor-Road Crossing count, so that a zero-distance road result cannot conceal dangerous crossings.
21. As the Rider, I want Motor-Traffic Travel styled distinctly on the map, so that I can see where exposure occurs.
22. As the Rider, I want Unverified Passage styled distinctly but minimally, so that uncertainty is visible without repeated warnings.
23. As the Rider, I want Traffic-Avoidant Passage to remain visually legible, so that the main character of the route is easy to inspect.
24. As the Rider, I want paved segregated cycleways treated as Traffic-Avoidant Passage, so that pavement is not confused with motor exposure.
25. As the Rider, I want unpaved BOATs and service tracks assessed by expected traffic rather than surface, so that low-frequency vehicle access is not treated like an ordinary road.
26. As the Rider, I want bridleways, restricted byways, cycleways, and suitable tracks to remain eligible, so that Spokes uses the connected non-road network.
27. As the Rider, I want foot-accessible paths with missing or ambiguous bicycle permission included as Unverified Passage, so that potentially useful connections remain visible.
28. As the Rider, I want a path marked only with a bicycle restriction to remain Unverified when foot passage exists, so that I can investigate walking or carrying the bicycle myself.
29. As the Rider, I want rough surfaces, steep gradients, steps, stiles, and gates to remain eligible unless clearly impassable, so that route difficulty is not mistaken for prohibition.
30. As the Rider, I want Spokes to exclude passage only when current data clearly establishes that passage itself is private, prohibited, closed, locked, or impassable, so that doubtful data does not remove useful paths.
31. As the Rider, I want ambiguous and conflicting access data treated as Unverified rather than excluded, so that Spokes remains deliberately generous about inclusion.
32. As the Rider, I want Explicit Exclusions to remain excluded at every Road Tolerance setting, so that Faster never silently changes the access policy.
33. As the Rider, I want verified bicycle passage preferred over Unverified Passage when candidates are otherwise close, so that uncertainty is used only when it offers a real benefit.
34. As the Rider, I want meaningful Motor-Traffic Travel avoided even when that requires Unverified Passage, so that the uncertainty preference cannot defeat Spokes' purpose.
35. As the Rider, I want difficult terrain and climbing to affect estimated time but not eligibility, so that physical challenge does not suppress enjoyable MTB routes.
36. As the Rider, I want Unverified and explicit walk-bike sections estimated at 7 km/h, so that timing is conservative without assuming a slow walking pace.
37. As the Rider, I want Maximum Avoidance to prioritize minimum exposure before journey time, so that I can request the strongest possible road avoidance.
38. As the Rider, I want Strong Avoidance to aim below 10% Motor-Traffic Travel, so that the normal result reflects my preferred exposure ceiling.
39. As the Rider, I want Strong Avoidance to accept more traffic only for a substantial estimated time saving, so that short convenience gains do not pull me onto roads.
40. As the Rider, I want Balanced, Faster, and Fastest to relax exposure progressively, so that I can recover a practical journey when the most avoidant route is excessive.
41. As the Rider, I want Spokes to return the least-exposed eligible result when a preferred target is impossible, so that the planner remains useful without hiding the compromise.
42. As the Rider, I want a clear no-route result when Explicit Exclusions disconnect the graph, so that Spokes never fabricates connectivity.
43. As the Rider, I want motorway, railway, and water crossings to require mapped connecting geometry, so that routes never jump physical barriers.
44. As the Rider, I want major-road crossings to prefer bridges, tunnels, signals, or islands, so that crossing risk affects route choice independently of road distance.
45. As the Rider, I want excessive endpoint snapping rejected, so that the reported route stays faithful to the points I selected.
46. As the Rider, I want invalid or unreachable requests explained briefly, so that I know whether to change an endpoint or Road Tolerance.
47. As the Rider, I want to download the selected Route Plan as standard GPX, so that I can follow it using an existing cycling device or application.
48. As the Rider, I want the GPX geometry to match the selected map route, so that export does not silently switch candidates.
49. As the Rider, I want the planning page to remain usable on a phone, so that I can inspect a route away from my desktop.
50. As the Rider, I want the first version to avoid building live navigation, so that development remains focused on routing quality.
51. As the Rider, I want Spokes to retain no server-side journey history, so that my requested locations are not accumulated by the application.
52. As the Rider, I want the deployed application protected from public access, so that a personal routing service is not exposed as a public utility.
53. As the Rider, I want map and data attribution displayed without obscuring the route, so that the application respects its source obligations.
54. As the maintainer, I want BRouter behind the Spokes backend rather than exposed to browsers, so that the routing service can be protected, replaced, and deployed independently.
55. As the maintainer, I want every BRouter result audited by Spokes, so that profile output cannot bypass eligibility and classification rules.
56. As the maintainer, I want routing responses associated with a versioned data snapshot, so that results and regressions can be reproduced.
57. As the maintainer, I want the Hertfordshire benchmark to run before map polish, so that the risky routing premise is proven before substantial interface work.
58. As the maintainer, I want the same exposure audit applied to Spokes and CycleStreets candidates, so that benchmark comparisons are fair.
59. As the maintainer, I want failed benchmark cases to expose segment classifications, so that profile or audit behavior can be diagnosed.
60. As the maintainer, I want monthly routing-data refreshes gated by the benchmark, so that new map data cannot silently degrade accepted behavior.
61. As the maintainer, I want the BRouter container deployable separately from Next.js, so that hosting limitations do not couple the web interface to the graph engine.
62. As the maintainer, I want a measurable cold-response threshold for hosted BRouter, so that an unsuitable serverless deployment can be replaced based on evidence.
63. As the maintainer, I want the same BRouter container movable to an always-on host, so that a hosting change does not require redesigning Spokes.
64. As the maintainer, I want all England routing data loaded only after Hertfordshire acceptance, so that early tuning remains fast while the final geographic scope is preserved.

## Implementation Decisions

- The product will be a Next.js application written in TypeScript, with MapLibre rendering the interactive map.
- The first version will have no application database. Current endpoints, Road Tolerance, candidates, and selection live only for the active browser session.
- The deployed web application will use private access protection or a single shared access gate rather than user accounts.
- The browser will call only the Spokes backend. BRouter will not be directly reachable from the browser.
- BRouter will run as a separately deployable Java container and will use a Spokes-specific routing profile over OpenStreetMap data.
- Local development will begin with the routing tile covering Hertfordshire. The first complete release will load all England routing data.
- The Spokes Route Planning API is the system's primary application boundary. A request contains start coordinates, destination coordinates, and one Road Tolerance value. A successful response contains the data-snapshot identifier and up to three audited Route Plans. A failure response distinguishes invalid input, outside-England input, over-limit input, unavailable routing service, and no eligible route.
- A Route Plan response contains its role, route geometry, total distance, approximate duration, Motor-Traffic Travel distance and percentage, Unverified Passage distance, significant Motor-Road Crossing count, per-segment classifications needed for map styling, and enough metadata to produce a matching GPX export.
- The API will validate coordinate ranges, require both endpoints inside England, and reject an endpoint pair whose viable Route Plans all exceed 100 kilometres.
- User-selected endpoint coordinates remain canonical for display and request identity. Routing may snap each endpoint to connected graph geometry only within an initial maximum radius of 100 metres. The response will preserve both requested and snapped coordinates and expose the connector distance. Requests without an acceptable snap return no route rather than silently moving the markers.
- BRouter will generate a wider candidate pool than the UI displays. Spokes will audit, reject, score, deduplicate, and label those candidates before selecting the visible Route Plans.
- Segment auditing will be independent of the BRouter cost score. It will interpret relevant way and node attributes for general access, foot access, bicycle access, designation, road class, motor-vehicle access, surface, smoothness, track type, MTB difficulty, gradient, bridges, tunnels, crossings, steps, fords, gates, barriers, and conditional restrictions.
- Eligibility has three outcomes: Eligible, Unverified Passage, and Explicit Exclusion.
- A current, direct general- or foot-passage prohibition, private passage marker, explicit closure, clearly locked critical barrier, or clearly impassable critical barrier can produce an Explicit Exclusion.
- A bicycle restriction alone does not produce an Explicit Exclusion when foot passage remains present or plausible. It produces Unverified Passage unless the data explicitly establishes that bringing the bicycle is prohibited.
- Missing, conflicting, indirect, or conditional access data produces Unverified Passage unless the condition is unambiguously active for the request. Because the first version has no departure-time input or live closure feed, ambiguous time-dependent restrictions will not be treated as definitive exclusions.
- Difficult terrain, steep gradients, steps, stiles, gates, and poor surfaces affect duration or classification but do not create Explicit Exclusions unless the route is clearly impassable.
- Expected motor exposure will use ordered static tiers rather than pretend to know live traffic volume. Segregated or non-motor passage has no ordinary exposure; restricted farm or forestry service access has rare exposure; BOATs, motor-access tracks, and similar ways have low exposure; ordinary residential and unclassified roads have moderate exposure; and higher road classes or high-speed shared carriageways have high exposure. Explicit access and local way attributes can adjust a default tier.
- A Motor-Road Crossing is calculated separately from longitudinal Motor-Traffic Travel. Mapped grade separation removes crossing conflict; controlled facilities reduce it; uncontrolled crossings of major roads receive the strongest crossing penalty.
- Approximate duration will use routing distance, elevation, gradient, surface, obstacles, and passage classification. Unverified Passage and explicit walk-bike passage use 7 km/h in the first model. Technical difficulty has no independent avoidance penalty.
- Unverified Passage receives a small ranking penalty so verified bicycle passage wins when candidates are otherwise close. The penalty must remain subordinate to meaningful Motor-Traffic Travel reduction.
- Road Tolerance is implemented as five calibrated settings rather than a continuous score. The UI control snaps to Maximum Avoidance, Strong Avoidance, Balanced, Faster, and Fastest and requests a new plan only after the selected stop settles.
- Maximum Avoidance orders candidates primarily by expected Motor-Traffic Travel, then crossing cost, Unverified Passage, and estimated duration, while retaining the 100-kilometre limit and all Explicit Exclusions.
- Strong Avoidance aims for no more than 10% Motor-Traffic Travel. A candidate exceeding that target replaces a lower-exposure candidate only when it reduces estimated duration by approximately 30% or more.
- Balanced begins with a 25% soft exposure target and a 20% substantial-time-saving threshold. Faster begins with a 40% soft exposure target and a 10% threshold. These are initial calibration values, not permanent product promises.
- Fastest chooses the eligible candidate with the lowest estimated duration, using exposure and crossing cost as tie-breakers rather than primary objectives.
- Visible candidates are assigned by behavior, not by raw BRouter alternative number: minimum audited exposure becomes Least Traffic; the current setting selects Recommended; a candidate becomes Faster only when it materially reduces estimated duration while accepting greater exposure.
- A duplicate candidate is suppressed when it substantially follows the same corridor and offers no meaningful choice. Initial materiality is a difference of at least 10% in estimated duration, at least two percentage points in Motor-Traffic Travel, or a clearly different mapped corridor. These thresholds are tuning parameters evaluated against the benchmark.
- When Least Traffic and Recommended are the same candidate, they appear once with the relevant combined meaning. When no Faster candidate is materially different, no Faster card is shown.
- The map will display requested endpoints, audited route geometry, and distinct restrained styles for selected route, unselected alternatives, Motor-Traffic Travel, and Unverified Passage. Labelling will remain compact and non-modal.
- Candidate cards will contain only distance, approximate duration, Motor-Traffic Travel distance and percentage, Unverified Passage distance, and significant Motor-Road Crossing count.
- GPX export will use the selected audited geometry, include basic route metadata and source attribution, and omit turn-by-turn navigation instructions.
- The MapLibre tile source will be configurable. The first version uses one path-focused basemap and does not couple routing classifications to basemap styling.
- OpenStreetMap attribution will be visible on the map and retained where appropriate in exported metadata. OpenStreetMap is the only first-version routable graph.
- CycleStreets will be queried only for controlled benchmarking. Its routes will be audited using the same Spokes classifier used for BRouter candidates; CycleStreets is not a runtime dependency for Rider requests.
- Routing snapshots will be versioned. The benchmark uses a frozen Hertfordshire snapshot during development; accepted production data refreshes monthly and must pass the regression gate before promotion.
- The Next.js application and BRouter container will run locally during development. The web application will deploy privately to Vercel.
- The routing container will first be evaluated as a separate Vercel container service. A cold route response above approximately ten seconds, unreliable two-gigabyte operation, or repeated lifecycle failures triggers deployment of the unchanged container to a small always-on host.
- Spokes will not intentionally persist route requests, endpoints, route history, or analytics. Necessary platform and process logs should minimize coordinate detail and follow the shortest practical retention.
- The first release is desktop-first with a responsive layout that remains functional on a phone. It does not install as an offline application and does not use device GPS.

## Testing Decisions

- A good Spokes test observes behavior at an external boundary rather than asserting internal helper calls, weight constants, or component structure.
- The primary seam is the Spokes Route Planning API. Tests submit endpoints and Road Tolerance and assert audited Route Plans or a defined failure result.
- Fast deterministic API tests will substitute controlled BRouter responses. They will verify eligibility, Explicit Exclusions, Unverified Passage, exposure tiers, crossing treatment, duration, candidate scoring, deduplication, role assignment, endpoint snapping, input validation, and failure behavior without depending on live map data.
- Contract tests will run against the supported BRouter version to verify request parameters, response geometry, required way and node attributes, failure translation, and profile compatibility.
- Integrated routing acceptance tests will drive the same API seam against the real BRouter container and the frozen Hertfordshire snapshot. They exercise the custom profile, graph, adapter, audit, selection, and response contract together.
- The fixed acceptance set contains the 12 Rider-chosen destinations and eight varied Hertfordshire destinations already recorded in the benchmark document.
- Each benchmark candidate must be checked for impossible motorway, railway, and water jumps; Explicit Exclusions; Unverified labelling; Motor-Traffic Travel; Motor-Road Crossings; bounded endpoint snapping; and correct no-route behavior.
- Least Traffic will be compared with CycleStreets Quietest after both are processed by the same Spokes exposure audit. External CycleStreets responses will be captured for the versioned benchmark run so ordinary automated tests are not network-dependent.
- Routing acceptance passes when at least 16 of 20 Least-Traffic routes beat CycleStreets Quietest on estimated motor exposure, at least 16 of 20 routes are judged usable by the Rider after map inspection, no result knowingly includes an Explicit Exclusion, and every ambiguous segment is classified as Unverified.
- A failed benchmark must preserve per-segment classifications and source attributes sufficient to diagnose whether the problem lies in BRouter candidate generation, access interpretation, exposure classification, crossing detection, time estimation, or candidate selection.
- Snapshot-refresh regression tests rerun the same 20 cases before promoting a monthly data update. A changed result is reviewed rather than accepted solely because the test process completed.
- API validation tests cover missing endpoints, malformed coordinates, equal endpoints, outside-England endpoints, excessive snapping, candidates over 100 kilometres, unavailable BRouter, malformed BRouter responses, and no eligible route.
- Eligibility fixtures cover explicit general-access prohibition, explicit foot prohibition, private passage, active closure, bicycle-only restriction, footpath with missing bicycle data, conflicting tags, conditional tags, steps, stiles, gates, locked barriers, and impassable barriers.
- Exposure fixtures cover segregated cycleways, bridleways, restricted byways, BOATs, farm and forestry service access, residential streets, quiet lanes, unclassified roads, and major roads on both paved and unpaved surfaces.
- Crossing fixtures cover bridges, tunnels, signals, islands, ordinary at-grade crossings, and uncontrolled major-road crossings.
- Candidate-selection fixtures cover two identical routes, Least Traffic equalling Recommended, absence of a meaningful Faster candidate, exposure below and above each soft target, the 30% Strong Avoidance threshold, and a no-route result that must not relax Explicit Exclusions.
- Duration fixtures verify 7 km/h for Unverified and explicit walk-bike passage and confirm that elevation, surface, and barriers alter time without changing eligibility solely for difficulty.
- GPX tests export a selected candidate, parse the resulting GPX as a standards-compliant document, and confirm that its coordinates correspond to the selected audited geometry rather than another alternative.
- A thin browser smoke test covers selecting two map points, retaining both markers, generating routes, changing Road Tolerance, switching candidates, seeing compact metrics and route styles, downloading GPX, and rendering the essential workflow at desktop and phone widths.
- Deployment verification measures BRouter cold and warm route responses, memory stability, backend-only reachability, and behavior after container scale-down. A cold response materially above ten seconds fails the preferred Vercel routing deployment.
- There is no existing code or testing prior art in this repository. The first ticket must establish the test harness around the Route Planning API seam rather than mirror an assumed internal architecture.
- Tests will not require live traffic data, live closures, physical ride completion, or perfect agreement with legal ground truth. They verify consistent behavior against versioned source data and the accepted Spokes policy.

## Out of Scope

- Place-name, postcode, address, or what3words search
- Via points, dragged route shaping, segment avoidance, and manual route editing
- Round-trip route generation
- Live turn-by-turn navigation
- GPS recording, location tracking, and off-route rerouting
- Offline maps or an installable mobile application
- Saved routes, favourites, route history, accounts, and collaboration
- Server-side journey storage and product analytics
- Live closures, traffic feeds, weather, or seasonal-condition services
- Satellite imagery, multiple basemaps, and elevation charts
- Crowdsourced path corrections or a replacement for editing OpenStreetMap
- Importing Ordnance Survey or local-authority rights-of-way geometry into the routing graph
- Claims that a Route Plan is legally guaranteed, physically passable, safe, or currently open
- Jurisdictions outside England
- A custom graph-search engine replacing BRouter
- Public routing API access or a public multi-user service
- More than 100 kilometres per Route Plan

## Further Notes

- Hertfordshire County Council states that a recorded public footpath does not automatically provide a right to ride or wheel a bicycle. Spokes therefore uses Unverified Passage rather than presenting such segments as lawful dismount connectors.
- The Rider is responsible for checking Unverified Passage before travelling. The interface should communicate this once and compactly rather than repeatedly interrupting route inspection.
- Static map attributes support an estimate of expected motor exposure, not a live traffic measurement. Product language must use “estimated” and avoid claims such as safest, legal, guaranteed, or traffic-free unless the underlying statement is actually established.
- The initial calibration values for Balanced and Faster, candidate materiality, endpoint snap radius, and exposure tiers are explicit starting points. They may be tuned through the frozen benchmark without reopening the accepted product intent.
- The routing-profile experiment is the delivery gate. If the 20-route benchmark shows that BRouter cannot generate sufficiently useful candidates for the audit and selector, implementation should stop and the engine or product premise should be revisited before map-interface investment.
- The accepted glossary and ADRs remain authoritative. If implementation discoveries contradict them, record and resolve the decision rather than silently changing behavior in code.
