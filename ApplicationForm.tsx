import { FormEvent, useState } from "react";
import type { Application, ApplicationInput, ApplicationStatus } from "../services/api";

type Props = { initial?: Application | null; onSave: (data: ApplicationInput) => Promise<void>; onCancel: () => void };
const statuses: ApplicationStatus[] = ["Wishlist", "Applied", "Interview", "Offer", "Rejected"];

export default function ApplicationForm({ initial, onSave, onCancel }: Props) {
  const [company, setCompany] = useState(initial?.company ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [location, setLocation] = useState(initial?.location ?? "Remote");
  const [jobUrl, setJobUrl] = useState(initial?.job_url ?? "");
  const [status, setStatus] = useState<ApplicationStatus>(initial?.status ?? "Wishlist");
  const [appliedDate, setAppliedDate] = useState(initial?.applied_date ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave({ company: company.trim(), role: role.trim(), location: location.trim() || "Remote",
        job_url: jobUrl.trim() || null, status, applied_date: appliedDate || null, notes });
    } finally { setSaving(false); }
  }

  return <form className="application-form" onSubmit={submit}>
    <div className="form-grid">
      <label>Company *<input required maxLength={120} value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Infosys" /></label>
      <label>Job title *<input required maxLength={120} value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Python Developer" /></label>
      <label>Location<input value={location} onChange={e => setLocation(e.target.value)} placeholder="Pune / Remote" /></label>
      <label>Status<select value={status} onChange={e => setStatus(e.target.value as ApplicationStatus)}>{statuses.map(s => <option key={s}>{s}</option>)}</select></label>
      <label>Application date<input type="date" value={appliedDate} onChange={e => setAppliedDate(e.target.value)} /></label>
      <label>Job posting URL<input type="url" value={jobUrl} onChange={e => setJobUrl(e.target.value)} placeholder="https://..." /></label>
      <label className="full">Notes<textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} maxLength={3000} placeholder="Recruiter, next step, interview notes..." /></label>
    </div>
    <div className="form-actions"><button type="button" className="button secondary" onClick={onCancel}>Cancel</button><button disabled={saving} className="button primary">{saving ? "Saving..." : "Save application"}</button></div>
  </form>;
}
