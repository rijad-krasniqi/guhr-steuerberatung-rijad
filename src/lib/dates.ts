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

/** Compact relative time for the activity trail, e.g. "just now", "5m ago". */
export function relativeTime(ts: number): string {
  const sec = Math.round((Date.now() - ts) / 1000);
  if (sec < 45) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d ago`;
  const d = new Date(ts);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** Heading used to group activity entries by calendar day. */
export function dayHeading(ts: number): string {
  const day = new Date(ts);
  day.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - day.getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return formatDate(day.toISOString().slice(0, 10));
}

/** Full date + time for tooltips, e.g. "Jun 18, 2026, 14:32". */
export function formatDateTime(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${formatDate(d.toISOString().slice(0, 10))}, ${hh}:${mm}`;
}
