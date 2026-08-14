# 10 — Deploy Spokes privately

**What to build:** Deploy the completed England planner for the sole Rider, with a protected Vercel web application, a browser-inaccessible BRouter service, measured cold and warm behavior, and an evidence-based fallback to an always-on routing host.

**Blocked by:** 08 — Finish the Rider-ready planner and GPX export; 09 — Promote routing coverage from Hertfordshire to England.

**Status:** ready-for-agent

- [ ] The Next.js application is deployed to Vercel behind private access protection or a single shared access gate without introducing user accounts.
- [ ] Browser clients can call only the Spokes backend and cannot reach BRouter directly or obtain routing-service credentials.
- [ ] The separately deployable BRouter container is first evaluated in the agreed Vercel container environment with the accepted England snapshot and profile.
- [ ] Cold and warm route responses are measured using representative accepted journeys, including behavior after the container scales down.
- [ ] The preferred Vercel routing deployment passes only when cold responses remain roughly within ten seconds and memory is reliable under the available limit.
- [ ] If the Vercel criteria fail, the unchanged routing container is deployed to a small always-on host while the web application remains on Vercel.
- [ ] Secrets and internal service locations are held server-side and absent from browser bundles and committed source.
- [ ] Production behavior intentionally stores no application route history or analytics and minimizes coordinate detail in necessary logs.
- [ ] The deployed application shows required source attribution and exposes the active routing snapshot identifier for diagnosis.
- [ ] End-to-end verification covers private access, endpoint selection, all Road Tolerance settings, alternative comparison, failure handling, GPX download, and representative desktop and phone layouts.
- [ ] Deployment and rollback procedures are documented sufficiently for the sole maintainer to repeat them.
