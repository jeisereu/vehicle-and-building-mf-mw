import Link from "next/link";
import { ArrowRight, Building2, CarFront, ClipboardCheck } from "lucide-react";

export default function Home() {
  return (
    <main className="home-shell">
      <div className="home-panel">
        <header className="home-header">
          <div className="brand-mark" aria-hidden="true"><ClipboardCheck size={23} /></div>
          <div>
            <p className="eyebrow">DICT · Region 5 · Legazpi City</p>
            <p className="home-overline">Inspection management</p>
          </div>
        </header>

        <div className="home-intro">
          <p className="eyebrow">Daily operations</p>
          <h1>Inspection forms</h1>
          <p className="home-copy">Select an inspection form to begin recording condition, findings, and sign-off.</p>
        </div>

        <div className="inspection-options">
          <Link className="inspection-option active-option" href="/vehicle-maintenance">
            <span className="option-icon" aria-hidden="true"><CarFront size={25} /></span>
            <span className="option-content"><strong>Vehicle Inspection</strong><small>Vehicle Maintenance Daily Checklist</small></span>
            <ArrowRight className="option-arrow" size={19} aria-hidden="true" />
          </Link>
          <div className="inspection-option disabled-option" aria-disabled="true">
            <span className="option-icon" aria-hidden="true"><Building2 size={25} /></span>
            <span className="option-content"><strong>Building Inspection</strong><small>Form format to be added</small></span>
            <span className="coming-soon">Coming soon</span>
          </div>
        </div>

        <footer className="home-footer">
          <span>Controlled access</span>
          <span>FM-INS-001</span>
        </footer>
      </div>
    </main>
  );
}
