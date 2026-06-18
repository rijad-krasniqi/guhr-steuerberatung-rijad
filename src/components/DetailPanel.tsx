import type { Client, ColumnId, Priority } from "../lib/types";
import { COLUMNS, MANDATE, PRIORITY } from "../lib/brand";
import { formatDate } from "../lib/dates";
import { Avatar, memberName } from "./Avatar";

interface DetailPanelProps {
  client: Client;
  onClose: () => void;
  onChange: (patch: Partial<Client>) => void;
  onToggleChecklistItem: (index: number) => void;
}

const PRIORITY_ORDER: Priority[] = ["high", "normal", "low"];

/**
 * Slide-in side panel showing the full record for one client. Every control
 * writes straight back through `onChange` / `onToggleChecklistItem`, so edits
 * are live and reflected on the board (and persisted) immediately.
 *
 * The overlay closes the panel on click; the panel itself stops propagation so
 * clicks inside it don't bubble up and close it.
 */
export function DetailPanel({
  client,
  onClose,
  onChange,
  onToggleChecklistItem,
}: DetailPanelProps) {
  const mandate = MANDATE[client.mandate];
  const pri = PRIORITY[client.priority];
  const checklist = client.checklist;
  const doneCount = checklist?.filter((i) => i.done).length ?? 0;

  return (
    <div className="overlay" data-anim onClick={onClose}>
      <div className="panel" data-anim onClick={(e) => e.stopPropagation()}>
        {/* ---- Gold header with badges + name ---- */}
        <div className="panel__head">
          <button className="panel__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
          <div className="panel__badges">
            <span className="panel__mandate" style={{ color: mandate.color }}>
              {client.mandate}
            </span>
            <span className="panel__priority">
              <span className="ring" style={{ background: pri.color }} />
              {pri.label}
            </span>
          </div>
          <div className="panel__name">{client.name}</div>
          <div className="panel__sub">{client.sub}</div>
        </div>

        {/* ---- Scrollable detail body ---- */}
        <div className="panel__body">
          <div className="panel__grid">
            <div>
              <div className="field-label">Email</div>
              <div className="field-value">{client.email || "—"}</div>
            </div>
            <div>
              <div className="field-label">Phone</div>
              <div className="field-value">{client.phone || "—"}</div>
            </div>
            <div>
              <div className="field-label">Advisor</div>
              <div className="field-advisor">
                <Avatar member={client.member} />
                <span className="field-value">{memberName(client.member)}</span>
              </div>
            </div>
            <div>
              <div className="field-label">Added on</div>
              <div className="field-value">{formatDate(client.date)}</div>
            </div>
          </div>

          <div className="panel__section">
            <div className="field-label">Phase</div>
            <select
              className="select"
              value={client.column}
              onChange={(e) => onChange({ column: e.target.value as ColumnId })}
            >
              {COLUMNS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="panel__section">
            <div className="field-label">Priority</div>
            <div className="pri-group">
              {PRIORITY_ORDER.map((key) => {
                const p = PRIORITY[key];
                const active = client.priority === key;
                return (
                  <button
                    key={key}
                    className="pri-btn"
                    onClick={() => onChange({ priority: key })}
                    style={
                      active
                        ? { background: p.color, color: "#fff", borderColor: p.color }
                        : undefined
                    }
                  >
                    {p.short}
                  </button>
                );
              })}
            </div>
          </div>

          {checklist && checklist.length > 0 && (
            <div className="panel__section">
              <div className="panel__section-head">
                <div className="field-label" style={{ marginBottom: 0 }}>
                  Required documents
                </div>
                <span className="checklist-progress">
                  {doneCount} / {checklist.length}
                </span>
              </div>
              <div className="checklist">
                {checklist.map((item, i) => (
                  <div
                    key={i}
                    className="checklist__item"
                    onClick={() => onToggleChecklistItem(i)}
                  >
                    <span
                      className="checklist__box"
                      style={{
                        border: `1.5px solid ${item.done ? "#9a7b22" : "#d2c9b6"}`,
                        background: item.done ? "#c3a35b" : "#fff",
                      }}
                    >
                      {item.done ? "✓" : ""}
                    </span>
                    <span
                      className="checklist__label"
                      style={{
                        color: item.done ? "#a79d8e" : "#3a352e",
                        textDecoration: item.done ? "line-through" : "none",
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="field-label">Notes / Next steps</div>
            <textarea
              className="textarea"
              value={client.notes}
              placeholder="Note the next steps …"
              onChange={(e) => onChange({ notes: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
