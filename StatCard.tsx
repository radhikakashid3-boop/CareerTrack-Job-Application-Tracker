type Props = { label: string; value: string | number; hint: string };
export default function StatCard({ label, value, hint }: Props) {
  return <article className="stat-card"><span>{label}</span><strong>{value}</strong><small>{hint}</small></article>;
}
