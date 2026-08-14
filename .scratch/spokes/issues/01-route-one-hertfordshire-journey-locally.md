# 01 — Route one fixed Hertfordshire journey locally

**What to build:** Establish the first complete Spokes tracer bullet: from a clean local checkout, the Rider can open a minimal page and see one provisional route for the first Hertfordshire benchmark journey, produced by a local BRouter service through the Spokes Route Planning API and protected by an automated test at that API seam.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] A clean development environment can start the web application and a separately running, pinned BRouter container using documented commands.
- [ ] The routing service uses a versioned Hertfordshire data snapshot and a first Spokes-specific profile without committing large graph artifacts to ordinary source control.
- [ ] The first benchmark pair produces route geometry through the Spokes Route Planning API rather than through a browser-to-BRouter call.
- [ ] A minimal browser view renders that returned geometry and its provisional total distance.
- [ ] The browser never receives a direct BRouter endpoint or credential.
- [ ] The API returns a defined routing-service-unavailable response when BRouter cannot be reached.
- [ ] An automated test drives the Route Planning API seam and proves the fixed journey response without depending on a public routing service.
- [ ] The project includes only the minimum scaffolding, ignored generated artifacts, and repeatable checks needed to leave the tracer bullet green.

