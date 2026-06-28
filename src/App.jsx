import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Config ────────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://kbjkswjmaskhwxxgyboa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtiamtzd2ptYXNraHd4eGd5Ym9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NTQxNDYsImV4cCI6MjA5ODIzMDE0Nn0.kskhoXne_sr6Nd8Bbg7xE56d4GwO3wK9xPvbtZ8RG8Y";
const API_BASE = "https://labari-insights-api.onrender.com";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Helpers ───────────────────────────────────────────────────────────────────
const SECTORS = ["All", "Fintech", "Healthtech", "Edtech", "Agritech", "Logistics", "E-commerce", "SaaS", "Media", "Energy"];
const COUNTRIES = ["All", "Ghana", "Nigeria", "Kenya", "South Africa", "Egypt", "Rwanda", "Senegal", "Ethiopia"];
const STAGES = ["All", "Pre-seed", "Seed", "Series A", "Series B", "Series C+", "Bootstrapped"];

function initials(name = "") {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

function formatAmount(amt) {
  if (!amt) return null;
  const n = parseFloat(amt);
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  navy: "#0D1B2A",
  navyMid: "#162336",
  amber: "#E8A020",
  amberLight: "#FFF3DC",
  ink: "#1A1A2E",
  muted: "#6B7280",
  border: "#E5E7EB",
  bg: "#F8F7F4",
  white: "#FFFFFF",
  green: "#16A34A",
  red: "#DC2626",
  tag: "#EEF2FF",
  tagText: "#3730A3",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${T.bg}; font-family: 'Inter', sans-serif; color: ${T.ink}; }
  
  .insights-header { background: ${T.navy}; padding: 0 24px; height: 58px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 50; }
  .insights-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 17px; color: #fff; letter-spacing: -0.3px; }
  .insights-logo span { color: ${T.amber}; }
  
  .hero { background: ${T.navy}; padding: 48px 24px 40px; text-align: center; border-bottom: 3px solid ${T.amber}; }
  .hero-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: ${T.amber}; margin-bottom: 12px; }
  .hero-title { font-family: 'Syne', sans-serif; font-size: clamp(28px, 5vw, 44px); font-weight: 800; color: #fff; line-height: 1.1; margin-bottom: 12px; }
  .hero-sub { font-size: 15px; color: #9CA3AF; max-width: 480px; margin: 0 auto; line-height: 1.6; }
  .hero-stats { display: flex; gap: 32px; justify-content: center; margin-top: 28px; flex-wrap: wrap; }
  .hero-stat { text-align: center; }
  .hero-stat-num { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; color: ${T.amber}; }
  .hero-stat-label { font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }

  .toolbar { background: ${T.white}; border-bottom: 1px solid ${T.border}; padding: 12px 24px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; position: sticky; top: 58px; z-index: 40; }
  .search-wrap { position: relative; flex: 1; min-width: 180px; max-width: 280px; }
  .search-wrap input { width: 100%; padding: 8px 12px 8px 34px; border: 1.5px solid ${T.border}; border-radius: 7px; font-size: 13px; font-family: 'Inter', sans-serif; outline: none; background: ${T.bg}; transition: border-color 0.15s; }
  .search-wrap input:focus { border-color: ${T.navy}; }
  .search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: ${T.muted}; pointer-events: none; }
  .filter-select { padding: 8px 10px; border: 1.5px solid ${T.border}; border-radius: 7px; font-size: 13px; font-family: 'Inter', sans-serif; background: ${T.bg}; outline: none; cursor: pointer; color: ${T.ink}; }
  .view-toggle { display: flex; border: 1.5px solid ${T.border}; border-radius: 7px; overflow: hidden; margin-left: auto; }
  .view-btn { padding: 7px 12px; background: none; border: none; cursor: pointer; display: flex; align-items: center; color: ${T.muted}; transition: all 0.15s; font-size: 13px; }
  .view-btn.active { background: ${T.navy}; color: #fff; }

  .main { max-width: 1200px; margin: 0 auto; padding: 24px 16px; }

  .tier-bar { display: flex; align-items: center; justify-content: space-between; background: ${T.amberLight}; border: 1px solid #FCD96A; border-radius: 8px; padding: 10px 16px; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
  .tier-bar-text { font-size: 13px; color: #92400E; }
  .tier-bar-text strong { color: #78350F; }
  .btn-unlock { padding: 7px 16px; background: ${T.amber}; color: ${T.navy}; border: none; border-radius: 6px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: 'Inter', sans-serif; transition: opacity 0.15s; }
  .btn-unlock:hover { opacity: 0.85; }

  .results-label { font-size: 12px; color: ${T.muted}; margin-bottom: 14px; }

  /* Card grid */
  .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
  .company-card { background: ${T.white}; border: 1px solid ${T.border}; border-radius: 10px; padding: 20px; display: flex; flex-direction: column; gap: 12px; transition: box-shadow 0.15s, transform 0.15s; cursor: default; }
  .company-card:hover { box-shadow: 0 4px 16px rgba(13,27,42,0.08); transform: translateY(-1px); }
  .card-top { display: flex; align-items: flex-start; gap: 12px; }
  .card-logo { width: 44px; height: 44px; border-radius: 8px; object-fit: contain; background: ${T.bg}; border: 1px solid ${T.border}; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: ${T.navy}; }
  .card-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: ${T.ink}; line-height: 1.2; }
  .card-meta { font-size: 12px; color: ${T.muted}; margin-top: 2px; }
  .card-desc { font-size: 12px; color: #4B5563; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  .card-tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .tag { padding: 3px 8px; background: ${T.tag}; color: ${T.tagText}; border-radius: 4px; font-size: 11px; font-weight: 600; }
  .tag.stage { background: #F0FDF4; color: #166534; }
  .tag.amount { background: #FFF7ED; color: #9A3412; }
  .card-footer { border-top: 1px solid ${T.border}; padding-top: 10px; display: flex; align-items: center; justify-content: space-between; }
  .card-year { font-size: 11px; color: ${T.muted}; }
  .card-link { font-size: 12px; color: ${T.navy}; font-weight: 600; text-decoration: none; }
  .card-link:hover { text-decoration: underline; }

  /* Locked card */
  .company-card.locked { filter: blur(4px); pointer-events: none; user-select: none; opacity: 0.6; }

  /* Lock overlay */
  .lock-section { position: relative; margin-top: 8px; }
  .lock-overlay { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(to bottom, transparent 0%, ${T.bg} 40%); z-index: 10; padding: 32px 16px; text-align: center; }
  .lock-icon { font-size: 28px; margin-bottom: 10px; }
  .lock-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: ${T.ink}; margin-bottom: 6px; }
  .lock-sub { font-size: 13px; color: ${T.muted}; margin-bottom: 16px; max-width: 280px; }
  .btn-primary { padding: 10px 24px; background: ${T.navy}; color: #fff; border: none; border-radius: 7px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; transition: opacity 0.15s; }
  .btn-primary:hover { opacity: 0.85; }
  .btn-secondary { padding: 10px 24px; background: transparent; color: ${T.navy}; border: 1.5px solid ${T.navy}; border-radius: 7px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; margin-left: 8px; transition: all 0.15s; }
  .btn-secondary:hover { background: ${T.navy}; color: #fff; }

  /* Table view */
  .table-wrap { overflow-x: auto; border: 1px solid ${T.border}; border-radius: 10px; background: ${T.white}; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  thead tr { border-bottom: 2px solid ${T.navy}; }
  th { text-align: left; padding: 11px 14px; font-size: 11px; font-weight: 700; color: ${T.muted}; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
  td { padding: 11px 14px; border-bottom: 1px solid ${T.border}; vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: ${T.bg}; }
  .table-logo { width: 28px; height: 28px; border-radius: 5px; object-fit: contain; background: ${T.bg}; border: 1px solid ${T.border}; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: ${T.navy}; font-family: 'Syne', sans-serif; flex-shrink: 0; }
  .table-name-cell { display: flex; align-items: center; gap: 10px; }
  .table-company-name { font-weight: 600; color: ${T.ink}; }
  .table-row.locked td { filter: blur(4px); pointer-events: none; user-select: none; opacity: 0.5; }

  /* Auth modal */
  .modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 16px; }
  .modal { background: ${T.white}; border-radius: 12px; padding: 32px 28px; width: 100%; max-width: 380px; position: relative; }
  .modal-close { position: absolute; top: 14px; right: 16px; background: none; border: none; font-size: 22px; cursor: pointer; color: ${T.muted}; line-height: 1; }
  .modal-title { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; color: ${T.ink}; margin-bottom: 6px; }
  .modal-sub { font-size: 13px; color: ${T.muted}; margin-bottom: 24px; line-height: 1.5; }
  .oauth-btn { display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px 16px; border: 1.5px solid ${T.border}; border-radius: 8px; background: ${T.white}; cursor: pointer; font-size: 14px; font-weight: 600; color: ${T.ink}; font-family: 'Inter', sans-serif; transition: border-color 0.15s; margin-bottom: 10px; }
  .oauth-btn:hover { border-color: ${T.navy}; }
  .modal-note { font-size: 11px; color: ${T.muted}; text-align: center; margin-top: 16px; border-top: 1px solid ${T.border}; padding-top: 14px; }

  .spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid #ffffff44; border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .empty { text-align: center; padding: 48px 16px; color: ${T.muted}; font-size: 14px; }
  .loading-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
  .skeleton { background: #E5E7EB; border-radius: 10px; height: 180px; animation: pulse 1.4s ease-in-out infinite; }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }

  @media (max-width: 600px) {
    .toolbar { gap: 8px; }
    .search-wrap { max-width: 100%; }
    .view-toggle { margin-left: 0; }
    .hero { padding: 32px 16px 28px; }
  }
`;

// ── OAuth buttons ─────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

// ── Auth Modal ────────────────────────────────────────────────────────────────
function AuthModal({ onClose }) {
  const [loading, setLoading] = useState(null);

  const signIn = async (provider) => {
    setLoading(provider);
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.href }
    });
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-title">Unlock full directory</div>
        <div className="modal-sub">Sign in to access all companies in the Labari Insights database — free.</div>
        <button className="oauth-btn" onClick={() => signIn("google")} disabled={!!loading}>
          <GoogleIcon />
          {loading === "google" ? "Connecting..." : "Continue with Google"}
        </button>
        <div className="modal-note">
          Free accounts see 15 companies. Upgrade to Pro for the full dataset.
        </div>
      </div>
    </div>
  );
}

// ── Logo component ────────────────────────────────────────────────────────────
function CompanyLogo({ url, name, size = 44 }) {
  const [err, setErr] = useState(false);
  const style = { width: size, height: size, borderRadius: size > 30 ? 8 : 5 };
  if (url && !err) {
    return <img src={url} alt={name} style={{ ...style, objectFit: "contain", background: T.bg, border: `1px solid ${T.border}` }} onError={() => setErr(true)} />;
  }
  return (
    <div className="card-logo" style={{ width: size, height: size, fontSize: size > 30 ? 14 : 10, borderRadius: size > 30 ? 8 : 5 }}>
      {initials(name)}
    </div>
  );
}

// ── Company Card ──────────────────────────────────────────────────────────────
function CompanyCard({ company, locked }) {
  if (locked) {
    return (
      <div className="company-card locked">
        <div className="card-top">
          <div className="card-logo">??</div>
          <div>
            <div className="card-name">Company Name Hidden</div>
            <div className="card-meta">Country · Sector</div>
          </div>
        </div>
        <div className="card-desc">This company profile is locked. Upgrade to access the full directory.</div>
      </div>
    );
  }

  const amount = formatAmount(company["Funding Amount"]);

  return (
    <div className="company-card">
      <div className="card-top">
        <CompanyLogo url={company["Logo"]} name={company["Name"]} />
        <div>
          <div className="card-name">{company["Name"]}</div>
          <div className="card-meta">{[company["Country"], company["Sector"]].filter(Boolean).join(" · ")}</div>
        </div>
      </div>
      {company["Description"] && <div className="card-desc">{company["Description"]}</div>}
      <div className="card-tags">
        {company["Funding Stage"] && <span className="tag stage">{company["Funding Stage"]}</span>}
        {amount && <span className="tag amount">{amount}</span>}
        {company["Founders"] && <span className="tag">👤 {company["Founders"].split(",")[0].trim()}</span>}
      </div>
      <div className="card-footer">
        <span className="card-year">{company["Founding Year"] ? `Est. ${company["Founding Year"]}` : ""}</span>
        {company["Website"] && (
          <a className="card-link" href={company["Website"].startsWith("http") ? company["Website"] : `https://${company["Website"]}`} target="_blank" rel="noopener noreferrer">
            Visit ↗
          </a>
        )}
      </div>
    </div>
  );
}

// ── Table Row ─────────────────────────────────────────────────────────────────
function TableRow({ company, locked }) {
  if (locked) {
    return (
      <tr className="table-row locked">
        <td><div className="table-name-cell"><div className="table-logo">?</div><span className="table-company-name">Hidden</span></div></td>
        <td>—</td><td>—</td><td>—</td><td>—</td><td>—</td>
      </tr>
    );
  }
  return (
    <tr className="table-row">
      <td>
        <div className="table-name-cell">
          <CompanyLogo url={company["Logo"]} name={company["Name"]} size={28} />
          <span className="table-company-name">{company["Name"]}</span>
        </div>
      </td>
      <td>{company["Country"] || "—"}</td>
      <td>{company["Sector"] || "—"}</td>
      <td>{company["Founding Year"] || "—"}</td>
      <td>{company["Funding Stage"] || "—"}</td>
      <td>{formatAmount(company["Funding Amount"]) || "—"}</td>
    </tr>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function LabariInsights() {
  const [session, setSession] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("grid"); // grid | table
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("All");
  const [country, setCountry] = useState("All");
  const [stage, setStage] = useState("All");
  const [showAuth, setShowAuth] = useState(false);

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  // Fetch companies
  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const headers = { "Content-Type": "application/json" };
      if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;
      const res = await fetch(`${API_BASE}/api/companies`, { headers });
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  // Filter visible companies
  const filtered = (data?.companies || []).filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c["Name"]?.toLowerCase().includes(q) || c["Country"]?.toLowerCase().includes(q) || c["Sector"]?.toLowerCase().includes(q);
    const matchSector = sector === "All" || c["Sector"] === sector;
    const matchCountry = country === "All" || c["Country"] === country;
    const matchStage = stage === "All" || c["Funding Stage"] === stage;
    return matchSearch && matchSector && matchCountry && matchStage;
  });

  const lockedCount = data?.locked_count || 0;
  const tier = data?.tier || "public";
  const total = data?.total || 0;
  const isLocked = lockedCount > 0;

  const handleSignOut = () => supabase.auth.signOut();

  return (
    <>
      <style>{css}</style>

      {/* Header */}
      <header className="insights-header">
        <div className="insights-logo">LABARI <span>INSIGHTS</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {session ? (
            <>
              <span style={{ fontSize: "13px", color: "#9CA3AF" }}>{session.user.email?.split("@")[0]}</span>
              <button onClick={handleSignOut} style={{ padding: "6px 12px", background: "transparent", border: "1px solid #374151", color: "#9CA3AF", borderRadius: "6px", fontSize: "12px", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>Sign out</button>
            </>
          ) : (
            <button onClick={() => setShowAuth(true)} style={{ padding: "7px 16px", background: T.amber, color: T.navy, border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
              Sign in
            </button>
          )}
        </div>
      </header>

      {/* Hero */}
      <div className="hero">
        <div className="hero-eyebrow">Labari Insights · Tech Companies</div>
        <h1 className="hero-title">African Tech Companies<br />Directory</h1>
        <p className="hero-sub">Startups, scaleups, and established players across Africa's tech ecosystem — curated by TechLabari.</p>
        {!loading && data && (
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-num">{total}+</div>
              <div className="hero-stat-label">Companies</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num">{COUNTRIES.length - 1}</div>
              <div className="hero-stat-label">Countries</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num">{SECTORS.length - 1}</div>
              <div className="hero-stat-label">Sectors</div>
            </div>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-wrap">
          <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input placeholder="Search companies..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={sector} onChange={e => setSector(e.target.value)}>
          {SECTORS.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={country} onChange={e => setCountry(e.target.value)}>
          {COUNTRIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="filter-select" value={stage} onChange={e => setStage(e.target.value)}>
          {STAGES.map(s => <option key={s}>{s}</option>)}
        </select>
        <div className="view-toggle">
          <button className={`view-btn ${view === "grid" ? "active" : ""}`} onClick={() => setView("grid")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          </button>
          <button className={`view-btn ${view === "table" ? "active" : ""}`} onClick={() => setView("table")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="main">

        {/* Tier bar */}
        {isLocked && (
          <div className="tier-bar">
            <div className="tier-bar-text">
              Showing <strong>15 of {total}</strong> companies. {session ? "Upgrade to Pro" : "Sign in free"} to unlock the full directory.
            </div>
            <button className="btn-unlock" onClick={() => setShowAuth(true)}>
              {session ? "Upgrade to Pro" : "Sign in — it's free"}
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading-grid">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton" />)}
          </div>
        ) : (
          <>
            <div className="results-label">{filtered.length} {filtered.length === 1 ? "company" : "companies"} shown</div>

            {/* Grid view */}
            {view === "grid" && (
              <>
                <div className="card-grid">
                  {filtered.map(c => <CompanyCard key={c.id} company={c} />)}
                  {isLocked && [...Array(Math.min(3, lockedCount))].map((_, i) => <CompanyCard key={`locked-${i}`} locked />)}
                </div>
                {isLocked && (
                  <div className="lock-section" style={{ marginTop: "0px" }}>
                    <div className="lock-overlay" style={{ paddingTop: "80px" }}>
                      <div className="lock-icon">🔒</div>
                      <div className="lock-title">{lockedCount} more companies</div>
                      <div className="lock-sub">Sign in free to access the full TechLabari database of African tech companies.</div>
                      <div>
                        <button className="btn-primary" onClick={() => setShowAuth(true)}>
                          {session ? "Upgrade to Pro" : "Sign in free"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Table view */}
            {view === "table" && (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Country</th>
                      <th>Sector</th>
                      <th>Founded</th>
                      <th>Stage</th>
                      <th>Funding</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(c => <TableRow key={c.id} company={c} />)}
                    {isLocked && [...Array(Math.min(5, lockedCount))].map((_, i) => <TableRow key={`locked-${i}`} locked />)}
                  </tbody>
                </table>
                {isLocked && (
                  <div style={{ textAlign: "center", padding: "24px", borderTop: `1px solid ${T.border}` }}>
                    <div style={{ fontSize: "14px", color: T.muted, marginBottom: "12px" }}>{lockedCount} more companies locked</div>
                    <button className="btn-primary" onClick={() => setShowAuth(true)}>
                      {session ? "Upgrade to Pro" : "Sign in free to unlock"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {filtered.length === 0 && !loading && (
              <div className="empty">No companies match your filters. Try adjusting your search.</div>
            )}
          </>
        )}
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
