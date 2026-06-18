import type { Client } from "../lib/types";
import { MANDATE, PRIORITY } from "../lib/brand";
import { relativeDay } from "../lib/dates";
import { Avatar, memberName } from "./Avatar";

interface CardProps {
  client: Client;
  /** True when this card sits in the paused column (renders muted). */
  paused: boolean;
  /** True while this card is the one being dragged. */
  dragging: boolean;
  onOpen: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

/**
 * Resolve the two-tone priority indicator (a small dot) for a card:
 * - high   → filled in the priority color
 * - normal → white center, colored ring
 * - low    → hollow with a muted ring
 * Paused cards desaturate the cue so the column reads as "parked".
 */
function priorityDot(priority: Client["priority"], paused: boolean) {
  const color = PRIORITY[priority].color;
  let fill: string;
  let ring: string;
  if (priority === "high") {
    fill = color;
    ring = color;
  } else if (priority === "low") {
    fill = "transparent";
    ring = "#cbc3b3";
  } else {
    fill = "#fff";
    ring = color;
  }
  if (paused) {
    fill = fill === "transparent" ? "transparent" : "#d5cebf";
    ring = "#d5cebf";
  }
  return { background: fill, border: `1.5px solid ${ring}` };
}

export function Card({ client, paused, dragging, onOpen, onDragStart, onDragEnd }: CardProps) {
  const mandate = MANDATE[client.mandate];
  const pri = PRIORITY[client.priority];
  const isHigh = client.priority === "high" && !paused;

  const checklist = client.checklist;
  const doneCount = checklist?.filter((i) => i.done).length ?? 0;

  const className = [
    "card",
    isHigh && "card--high",
    dragging && "card--dragging",
    paused && "card--paused",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={className}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onOpen}
    >
      <div className="card__top">
        <span className="tag" style={{ background: mandate.bg, color: mandate.color }}>
          {client.mandate}
        </span>
        <div className="card__meta">
          <span className="pri-dot" title={pri.label} style={priorityDot(client.priority, paused)} />
          <span className="card__date">{relativeDay(client.date)}</span>
        </div>
      </div>

      <div className="card__name">{client.name}</div>
      <div className="card__sub">{client.sub}</div>
      <div className="card__notes">{client.notes || "No notes."}</div>

      {checklist && checklist.length > 0 && (
        <div className="card__checklist">
          <div className="card__dots">
            {checklist.map((item, i) => (
              <span
                key={i}
                className="dot-square"
                style={{
                  background: item.done ? "#c3a35b" : "#fff",
                  border: `1px solid ${item.done ? "#c3a35b" : "#d2c9b6"}`,
                }}
              />
            ))}
          </div>
          <span className="card__checklist-label">
            {doneCount} / {checklist.length} complete
          </span>
        </div>
      )}

      <div className="card__footer">
        <Avatar member={client.member} />
        <span className="card__member-name">{memberName(client.member)}</span>
      </div>
    </div>
  );
}
