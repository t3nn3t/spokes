# Spokes

Spokes is an England-only route planner for a mountain-bike Rider who strongly prefers passage away from motor traffic. Ticket 01 establishes one local Hertfordshire tracer bullet: Welwyn Garden City to Hatfield through the Spokes Route Planning API and a separately running BRouter service.

## Run the tracer bullet

Prerequisites: Node.js 22.9 or newer and Docker with Compose.

```sh
npm install
npm run routing:data
```

The data command downloads the durable, dated `hertfordshire-2026-08-13` OpenStreetMap extract, verifies its size and SHA-256 checksum, and builds the local BRouter graph using pinned BRouter 1.7.10 source. The source extract and generated `.rd5` graph stay under ignored directories. The accepted source, builder revision, and output tile are recorded in `routing/data/hertfordshire-2026-08-13.json`; `SPOKES_ROUTING_DATA_URL` may point at a mirror, but the checksum still enforces that exact snapshot.

Start BRouter in one terminal:

```sh
npm run routing:start
```

Start the web application in another:

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The page requests the fixed first benchmark journey from `/api/routes`; only the Next.js server knows the BRouter address. `BROUTER_URL` defaults to `http://127.0.0.1:17777` and can be changed using the server-only variable documented in `.env.example`.

## Repeatable checks

```sh
npm run typecheck
npm test
npm run build
```

The API test substitutes a controlled BRouter response at that external boundary, so ordinary checks never call a public routing service.
