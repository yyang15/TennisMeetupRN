/** Format ISO date (2026-04-05) into readable string */
export function formatDate(date: string): string {
  // If already a relative string like "Today", return as-is
  if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) return date;

  const d = new Date(date + 'T00:00:00');
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (target.getTime() === today.getTime()) return 'Today';
  if (target.getTime() === tomorrow.getTime()) return 'Tomorrow';

  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
