import { FixedJourney } from "@/components/fixed-journey";

export default function Home() {
  return (
    <main>
      <header className="masthead">
        <a className="wordmark" href="/" aria-label="Spokes home">
          Spokes
        </a>
        <span className="status-pill">Local tracer bullet</span>
      </header>

      <section className="intro" aria-labelledby="journey-title">
        <p className="eyebrow">First Hertfordshire benchmark journey</p>
        <h1 id="journey-title">Welwyn Garden City to Hatfield</h1>
        <p className="lede">
          One provisional route shaped for a Rider who would rather take the long
          way around than share it with motor traffic.
        </p>
      </section>

      <FixedJourney />

      <footer>
        Route data © OpenStreetMap contributors · Provisional route for local development
      </footer>
    </main>
  );
}
