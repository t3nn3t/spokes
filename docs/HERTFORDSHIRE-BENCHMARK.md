# Hertfordshire Routing Benchmark

This is the fixed 20-journey acceptance set for the first Spokes routing profile. All journeys use the shared start `///avoid.ranked.motor` at **51.797717, -0.150633**, near Welwyn Garden City.

## Rider-chosen destinations

| # | Destination | Latitude | Longitude | Approximate area |
|---|---|---:|---:|---|
| 1 | [`///vague.comet.bumpy`](https://what3words.com/vague.comet.bumpy) | 51.781007 | -0.263446 | Hatfield |
| 2 | [`///marked.origin.inspector`](https://what3words.com/marked.origin.inspector) | 51.834048 | -0.186474 | Welwyn |
| 3 | [`///goats.spray.linked`](https://what3words.com/goats.spray.linked) | 51.796154 | -0.107657 | Hertford |
| 4 | [`///intent.worm.froze`](https://what3words.com/intent.worm.froze) | 51.782786 | -0.109985 | Hertford |
| 5 | [`///slim.atom.views`](https://what3words.com/slim.atom.views) | 51.780819 | -0.091854 | Hertford |
| 6 | [`///pints.unions.shapes`](https://what3words.com/pints.unions.shapes) | 51.762142 | -0.112993 | Hertford |
| 7 | [`///priced.sock.atomic`](https://what3words.com/priced.sock.atomic) | 51.756347 | -0.061607 | Broxbourne |
| 8 | [`///sorters.tasty.defend`](https://what3words.com/sorters.tasty.defend) | 51.738101 | -0.091410 | Cuffley |
| 9 | [`///random.composers.sums`](https://what3words.com/random.composers.sums) | 51.712012 | -0.229123 | Potters Bar |
| 10 | [`///thing.asks.lights`](https://what3words.com/thing.asks.lights) | 51.782840 | -0.286720 | Wheathampstead |
| 11 | [`///memo.lied.poems`](https://what3words.com/memo.lied.poems) | 51.807527 | -0.124236 | Hertford |
| 12 | [`///laser.bags.asserts`](https://what3words.com/laser.bags.asserts) | 51.831110 | -0.088285 | Watton at Stone |

Coordinates were resolved from the first-party what3words page metadata. Spokes does not require what3words input; these coordinates are stored directly as benchmark fixtures.

## Deliberately varied destinations

| # | Destination | Latitude | Longitude | Primary stress case |
|---|---|---:|---:|---|
| 13 | Welwyn North west forecourt | 51.823191 | -0.191737 | East Coast Main Line crossing; never jump railway geometry |
| 14 | Ayot St Peter BR016 north end | 51.823965 | -0.256551 | A1(M) crossing, countryside and bridleway connectivity |
| 15 | Wrestlers Bridge / Alban Way end | 51.770351 | -0.216560 | Urban Hatfield, A414 and rail corridor, then traffic-free greenway |
| 16 | Hertingfordbury RB019 midpoint | 51.781539 | -0.119932 | Restricted byway south of A414; use a mapped crossing or underpass |
| 17 | Ware Priory | 51.811006 | -0.035130 | Long town–country–town route, rivers and towpath transitions |
| 18 | Waterford Heath | 51.817888 | -0.090355 | Nature-reserve/footpath last mile and legitimate no-route possibility |
| 19 | Bayford BOAT008 midpoint | 51.751904 | -0.102432 | BOAT, surface, access and barrier interpretation |
| 20 | Broxbourne Lee towpath | 51.746500 | -0.007000 | A10, railway, New River and Lee corridor crossings |

## Assertions

Every candidate is checked for the following:

- never cross a motorway, railway or body of water geometrically without a mapped connecting edge;
- never include an Explicit Exclusion;
- expose Motor-Traffic Travel, Unverified Passage and significant crossing metrics;
- snap endpoints only within a bounded radius;
- return an explicit no-route result rather than silently relaxing passage exclusions;
- compare Least Traffic with CycleStreets Quietest using the same Spokes exposure audit.

## Geographic evidence

- [Hertfordshire Rights of Way map](https://webmaps.hertfordshire.gov.uk/row/row.htm?layers=%5B1%3A0%2C1%2C2%2C3%2C4)
- [Hertfordshire rights-of-way categories](https://www.hertfordshire.gov.uk/services/Recycling-waste-and-environment/Countryside-access/Rights-of-Way/Rights-of-Way.aspx)
- [Ayot Greenway management plan](https://www.hertfordshire.gov.uk/media-library/documents/countryside/ayot-greenway-management-and-maintenance-plan-2025-2035.pdf)
- [Alban Way description](https://www.hertfordshire.gov.uk/media-library/documents/highways/urban-transport-plans/southern-st-albans-transport/southern-st-albans-urban-transport-plan.pdf)
- [Cole Green Way description](https://www.hertfordshire.gov.uk/media-library/documents/environment-and-planning/cms/cole-green-way-map-text-version.pdf)
- [Hertfordshire Rights of Way Improvement Plan](https://www.hertfordshire.gov.uk/media-library/documents/environment-and-planning/countryside-access-and-management/rights-of-way/improvement-plans/rights-of-way-improvement-plan-201718-202728.pdf)
- [Hoddesdon and Broxbourne transport plan](https://www.hertfordshire.gov.uk/media-library/documents/highways/urban-transport-plans/hoddesdon-and-broxbourne/hoddesdon-and-broxbourne-urban-transport-plan.pdf)
