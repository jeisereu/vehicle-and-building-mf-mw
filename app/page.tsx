import Link from "next/link";

export default function Home() {
  return (
    <main className="home-shell">
      <div className="home-panel">
        <div className="brand-mark" aria-hidden="true">VM</div>
        <p className="eyebrow">Fleet operations</p>
        <h1>Vehicle maintenance, without the scroll.</h1>
        <p className="home-copy">
          A quick daily walkaround for capturing vehicle condition, findings, and sign-off in one place.
        </p>
        <Link className="primary-button" href="/vehicle-maintenance">
          Start daily inspection <span aria-hidden="true">→</span>
        </Link>
      </div>
    </main>
  );
}
