# Spokes

Spokes is an England-only route planner for one mountain-bike rider who strongly prefers passage away from motor traffic.

## Language

**Rider**:
The sole user of the planner: a mountain-bike rider who treats difficult off-road terrain as desirable and is willing to dismount or carry the bike when necessary.
_Avoid_: Cyclist, generic user

**Route Plan**:
A proposed journey of at most 100 kilometres between two exact map-selected endpoints, displayed with up to two alternatives and enough classification to distinguish Motor-Traffic Travel and Unverified Passage from other passage.
_Avoid_: Navigation, live directions, ride tracking

**Motor-Traffic Travel**:
Movement along a route section where the Rider is expected to share space with motor traffic. Expected traffic frequency matters more than surface material or legal road classification.
_Avoid_: Paved-road travel, on-road, tarmac

**Traffic-Avoidant Passage**:
A route section that does not ordinarily require the Rider to share space with motor traffic. It may be paved or unpaved.
_Avoid_: Off-road, trail, dirt

**Unverified Passage**:
A route section whose physical connectivity is known but whose permission for bringing a bicycle has not been established. Spokes offers ambiguous passage generously with a minimal label and only a small ranking penalty, so uncertainty does not force meaningful Motor-Traffic Travel; the Rider independently checks the route.
_Avoid_: Dismount section, legal footpath, forbidden path

**Explicit Exclusion**:
A route section whose current source data clearly and directly establishes that passage itself is private, prohibited, closed, locked, or impassable. Missing, indirect, contradictory, merely bicycle-restrictive, or physically challenging data is not an Explicit Exclusion.
_Avoid_: Unverified passage, bicycle restriction, low-confidence path

**Road Tolerance**:
The five-stop Rider-controlled preference that trades estimated journey time against Motor-Traffic Travel when generating a Route Plan: Maximum Avoidance, Strong Avoidance, Balanced, Faster, and Fastest. Strong Avoidance is the default, aims for less than 10% Motor-Traffic Travel, and accepts more only for a substantial estimated time saving.
_Avoid_: Road allowance, legality setting

**Motor-Road Crossing**:
An event where a Route Plan crosses motor traffic without travelling alongside it. Its risk is scored separately and does not add Motor-Traffic Travel distance.
_Avoid_: Road segment, road travel

**Least-Traffic Route**:
The candidate Route Plan with the lowest estimated Motor-Traffic Travel, regardless of whether another candidate is substantially faster.
_Avoid_: Safest route, off-road route

**Recommended Route**:
The candidate Route Plan selected by the current Road Tolerance. It may be identical to the Least-Traffic Route.
_Avoid_: Best route, default route

**Faster Route**:
A candidate Route Plan that materially reduces estimated journey time by accepting greater Motor-Traffic Travel than the Recommended Route.
_Avoid_: Fastest route, road route
