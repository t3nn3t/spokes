# 01 — Route one fixed Hertfordshire journey locally

**What to build:** Establish the first complete Spokes tracer bullet: from a clean local checkout, the Rider can open a minimal page and see one provisional route for the first Hertfordshire benchmark journey, produced by a local BRouter service through the Spokes Route Planning API and protected by an automated test at that API seam.

**Blocked by:** None — can start immediately.

**Status:** resolved

- [x] A clean development environment can start the web application and a separately running, pinned BRouter container using documented commands.
- [x] The routing service uses a versioned Hertfordshire data snapshot and a first Spokes-specific profile without committing large graph artifacts to ordinary source control.
- [x] The first benchmark pair produces route geometry through the Spokes Route Planning API rather than through a browser-to-BRouter call.
- [x] A minimal browser view renders that returned geometry and its provisional total distance.
- [x] The browser never receives a direct BRouter endpoint or credential.
- [x] The API returns a defined routing-service-unavailable response when BRouter cannot be reached.
- [x] An automated test drives the Route Planning API seam and proves the fixed journey response without depending on a public routing service.
- [x] The project includes only the minimum scaffolding, ignored generated artifacts, and repeatable checks needed to leave the tracer bullet green.

## Outcome

- Added a minimal Next.js and TypeScript application whose fixed Welwyn Garden City–Hatfield view calls only the Spokes Route Planning API and renders the returned geometry and distance.
- Added a server-only BRouter adapter, a defined `ROUTING_SERVICE_UNAVAILABLE` response, and deterministic API-seam coverage using a controlled BRouter response.
- Pinned BRouter 1.7.10 by immutable source commit, added the first `spokes-mtb` profile, and made the local graph reproducible from a checksummed, dated `hertfordshire-2026-08-13` source snapshot while keeping generated artifacts ignored.
- Documented the clean local data, routing-service, application, and verification commands.
