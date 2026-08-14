import { RoutePlanner } from "@/components/route-planner";

export default function Home() {
  return (
    <main>
      <header className="masthead">
        <a className="wordmark" href="/" aria-label="Spokes home">
          Spokes
        </a>
        <span className="status-pill">England route planner</span>
      </header>

      <section className="intro" aria-labelledby="journey-title">
        <p className="eyebrow">Point-to-point route planning</p>
        <h1 id="journey-title">Choose the long way around.</h1>
        <p className="lede">
          Select an exact start and destination. Spokes will ask for one provisional
          Strong Avoidance Route Plan and keep your requested points in view.
        </p>
      </section>

      <RoutePlanner />

      <footer>
        Map and route data © OpenStreetMap contributors · Provisional Route Plans
      </footer>
    </main>
  );
}
