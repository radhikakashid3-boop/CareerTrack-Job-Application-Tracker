import { useCallback, useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, Plus, Search, Trash2, Pencil, ExternalLink, RefreshCw, ChartNoAxesCombined, Download, LogOut } from "lucide-react";
import ApplicationForm from "../components/ApplicationForm";
import StatCard from "../components/StatCard";
import { api, getToken, type Application, type ApplicationInput, type ApplicationStatus, type User } from "../services/api";

const statuses: Array<"" | ApplicationStatus> = ["", "Wishlist", "Applied", "Interview", "Offer", "Rejected"];

export default function Dashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<{ total: number; by_status: Record<ApplicationStatus, number>; interview_rate: number } | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"" | ApplicationStatus>("");
  const [editing, setEditing] = useState<Application | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [liveStatus, setLiveStatus] = useState("Connecting live updates…");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [items, summary] = await Promise.all([api.list(search, filter), api.stats()]);
      setApplications(items); setStats(summary); setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load applications. Is the API running?");
    } finally { setLoading(false); }
  }, [search, filter]);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
    const wsBase = apiBase.replace(/^http/, "ws").replace(/\/api$/, "");
    const ws = new WebSocket(`${wsBase}/ws/notifications?token=${encodeURIComponent(getToken())}`);
    ws.onopen = () => setLiveStatus("Live connection active");
    ws.onmessage = () => setLiveStatus("Live connection active");
    ws.onerror = () => setLiveStatus("Live updates unavailable");
    ws.onclose = () => setLiveStatus("Live connection closed");
    return () => ws.close();
  }, []);
  async function exportCsv() {
    try {
      const response = await fetch(api.exportUrl(), { headers: { Authorization: `Bearer ${getToken()}` } });
      if (!response.ok) throw new Error("Could not export CSV");
      const blob = await response.blob(); const url = URL.createObjectURL(blob); const a = document.createElement("a");
      a.href = url; a.download = "careertrack-applications.csv"; a.click(); URL.revokeObjectURL(url);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not export CSV"); }
  }

  async function save(data: ApplicationInput) {
    try {
      if (editing) await api.update(editing.id, data); else await api.create(data);
      setShowForm(false); setEditing(null); await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save application"); throw e; }
  }

  async function remove(item: Application) {
    if (!window.confirm(`Delete the application at ${item.company}?`)) return;
    try { await api.remove(item.id); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not delete application"); }
  }

  const recent = useMemo(() => applications.slice(0, 5), [applications]);
  const openForm = (item: Application | null = null) => { setEditing(item); setShowForm(true); };

  return <main className="shell">
    <header className="topbar">
      <a className="brand" href="#"><span className="brand-icon"><BriefcaseBusiness size={20} /></span><span>careertrack<small>YOUR CAREER, ORGANIZED</small></span></a>
      <div className="top-actions"><span className="status-dot">● {user.email}</span><button className="button secondary" onClick={() => void exportCsv()} title="Export CSV"><Download size={16} /> Export</button><button className="button secondary" onClick={onLogout} title="Sign out"><LogOut size={16} /> Sign out</button><button className="button primary" onClick={() => openForm()}><Plus size={17} /> Add application</button></div>
    </header>
    <section className="welcome">
      <div><p className="eyebrow">JOB SEARCH WORKSPACE</p><h1>Make your next move.</h1><p className="muted">One clear view of every opportunity, interview, and offer.</p><p className="live-label" aria-live="polite">● {liveStatus}</p></div>
      <div className="welcome-art"><ChartNoAxesCombined size={48} strokeWidth={1.3} /><span>Progress, not guesswork.</span></div>
    </section>
    {error && <div className="alert" role="alert"><span>{error}</span><button onClick={() => void refresh()}>Retry</button></div>}
    <section className="stats-grid" aria-label="Application statistics">
      <StatCard label="Total applications" value={stats?.total ?? "—"} hint="All tracked opportunities" />
      <StatCard label="In progress" value={stats ? stats.by_status.Applied + stats.by_status.Interview : "—"} hint="Applied or interviewing" />
      <StatCard label="Interviews" value={stats?.by_status.Interview ?? "—"} hint="Conversations underway" />
      <StatCard label="Offers" value={stats?.by_status.Offer ?? "—"} hint="Celebrate your progress" />
    </section>
    {showForm && <section className="panel form-panel"><div className="section-heading"><div><p className="eyebrow">{editing ? "UPDATE DETAILS" : "NEW OPPORTUNITY"}</p><h2>{editing ? "Edit application" : "Add an application"}</h2></div></div><ApplicationForm key={editing?.id ?? "new"} initial={editing} onSave={save} onCancel={() => { setShowForm(false); setEditing(null); }} /></section>}
    <section className="panel">
      <div className="section-heading"><div><p className="eyebrow">YOUR PIPELINE</p><h2>Applications <span className="count">{stats?.total ?? 0}</span></h2></div><button className="icon-button" onClick={() => void refresh()} aria-label="Refresh applications"><RefreshCw size={17} /></button></div>
      <div className="toolbar"><label className="search-box"><Search size={17} /><input aria-label="Search company or role" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search company or role..." /></label><select aria-label="Filter by status" value={filter} onChange={e => setFilter(e.target.value as "" | ApplicationStatus)}>{statuses.map(s => <option key={s} value={s}>{s || "All statuses"}</option>)}</select></div>
      {loading ? <div className="empty-state">Loading your applications…</div> : applications.length === 0 ? <div className="empty-state"><BriefcaseBusiness size={30} /><h3>{search || filter ? "No matching applications" : "Your next opportunity starts here"}</h3><p>{search || filter ? "Try changing your search or filter." : "Add the roles you are interested in and keep every next step in one place."}</p>{!search && !filter && <button className="button primary" onClick={() => openForm()}><Plus size={17} /> Add your first application</button>}</div> :
      <div className="table-wrap"><table><thead><tr><th>Company / role</th><th>Location</th><th>Status</th><th>Applied</th><th className="actions-head">Actions</th></tr></thead><tbody>{applications.map(item => <tr key={item.id}><td><div className="company-cell"><span className="company-avatar">{item.company.slice(0,1).toUpperCase()}</span><span><strong>{item.company}</strong><small>{item.role}</small></span></div>{item.job_url && <a className="job-link" href={item.job_url} target="_blank" rel="noreferrer">View posting <ExternalLink size={12} /></a>}</td><td>{item.location || "Remote"}</td><td><span className={`badge ${item.status.toLowerCase()}`}>{item.status}</span></td><td>{item.applied_date || "—"}</td><td><div className="row-actions"><button className="icon-button" aria-label={`Edit ${item.company}`} onClick={() => openForm(item)}><Pencil size={16} /></button><button className="icon-button danger" aria-label={`Delete ${item.company}`} onClick={() => void remove(item)}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div>}
    </section>
    <footer><span>CareerTrack · Week 12 Capstone Project</span><span>Built to help you move forward.</span></footer>
  </main>;
}
