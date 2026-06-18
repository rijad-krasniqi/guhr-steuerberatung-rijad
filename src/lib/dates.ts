// Small date helpers. Cards show a relative label ("Today", "3 days ago");
// the detail panel shows the full date. Both parse the stored ISO date as a
// local midnight to avoid timezone drift.

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parse(iso: string): Date {
  return new Date(iso + "T00:00:00");
}

/** Full date, e.g. "Jun 16, 2026". */
export function formatDate(iso: string): string {
  const d = parse(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/** Relative label used on cards: Today / Yesterday / N days ago / full date. */
export function relativeDay(iso: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - parse(iso).getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff > 1 && diff < 7) return `${diff} days ago`;
  return formatDate(iso);
}

/** Today as an ISO date string (YYYY-MM-DD), for newly added cards. */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
