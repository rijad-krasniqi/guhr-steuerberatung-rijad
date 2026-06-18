import type { ActivityEntry, ActivityType } from "../lib/types";
import { MEMBERS } from "../lib/brand";
import { dayHeading, formatDateTime, relativeTime } from "../lib/dates";
import { Avatar } from "./Avatar";

// A small colored glyph per activity type, so the trail is scannable at a glance.
const ICON: Record<ActivityType, { glyph: string; color: string }> = {
  created: { glyph: "+", color: "#287A67" },
  moved: { glyph: "→", color: "#2E5C92" },
  priority: { glyph: "!", color: "#C25B4E" },
  advisor: { glyph: "@", color: "#5E4894" },
  mandate: { glyph: "#", color: "#B5722A" },
  details: { glyph: "✎", color: "#9A7B22" },
  notes: { glyph: "✎", color: "#9A7B22" },
  task_added: { glyph: "+", color: "#9A7B22" },
  task_removed: { glyph: "−", color: "#A8456A" },
  task_done: { glyph: "✓", color: "#287A67" },
  task_undone: { glyph: "↺", color: "#A79D8E" },
  task_assigned: { glyph: "@", color: "#5E4894" },
  archived: { glyph: "▢", color: "#8E8576" },
  unarchived: { glyph: "↩", color: "#287A67" },
  deleted: { glyph: "✕", color: "#C25B4E" },
  reset: { glyph: "↺", color: "#A79D8E" },
};

/**
 * Slide-in audit trail (the "admin panel" the brief asks for): a chronological,
 * append-only record of who changed what and when, newest first and grouped by
 * day. This is the accountability view — if a card moves unexpectedly, the trail
 * shows the actor and the change.
 */
export function ActivityPanel({
  activity,
  onClose,
  onClear,
}: {
  activity: ActivityEntry[];
  onClose: () => void;
  onClear: () => void;
}) {
  // Group consecutive entries by calendar day for readable section headers.
  const groups: { heading: string; entries: ActivityEntry[] }[] = [];
  for (const entry of activity) {
    const heading = dayHeading(entry.timestamp);
    const last = groups[groups.length - 1];
    if (last && last.heading === heading) last.entries.push(entry);
    else groups.push({ heading, entries: [entry] });
  }

  return (
    <div className="overlay" data-anim onClick={onClose}>
      <div className="panel" data-anim onClick={(e) => e.stopPropagation()}>
        <div className="panel__head panel__head--plain">
          <button className="panel__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
          <div className="panel__eyebrow">Admin</div>
          <div className="panel__name panel__name--dark">Activity log</div>
          <div className="panel__sub panel__sub--dark">
            Audit trail of every change to the board
          </div>
        </div>

        <div className="panel__body">
          {activity.length === 0 ? (
            <div className="activity-empty">No activity recorded yet.</div>
          ) : (
            groups.map((group) => (
              <div key={group.heading} className="activity-group">
                <div className="activity-day">{group.heading}</div>
                {group.entries.map((entry) => {
                  const icon = ICON[entry.type];
                  return (
                    <div key={entry.id} className="activity-item">
                      <span className="activity-icon" style={{ color: icon.color }}>
                        {icon.glyph}
                      </span>
                      <Avatar member={entry.actor} size={20} />
                      <div className="activity-text">
                        <span className="activity-actor">{MEMBERS[entry.actor].name}</span>{" "}
                        {entry.message}
                      </div>
                      <span className="activity-time" title={formatDateTime(entry.timestamp)}>
                        {relativeTime(entry.timestamp)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {activity.length > 0 && (
          <div className="panel__foot">
            <span className="panel__foot-note">{activity.length} entries</span>
            <button
              className="btn-ghost"
              onClick={() => {
                if (confirm("Clear the entire activity log? This cannot be undone.")) onClear();
              }}
            >
              Clear log
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
