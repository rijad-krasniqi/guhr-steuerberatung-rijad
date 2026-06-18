import { useEffect, useState } from "react";
import type { Client, ColumnId, MandateType, MemberId, Priority } from "../lib/types";
import type { BoardApi } from "../lib/useBoard";
import { COLUMNS, MANDATE, MANDATE_TYPES, MEMBER_IDS, MEMBERS, PRIORITY } from "../lib/brand";
import { formatDate } from "../lib/dates";
import { Avatar } from "./Avatar";

const PRIORITY_ORDER: Priority[] = ["high", "normal", "low"];

/**
 * A text field that looks like plain text until focused, and commits its value
 * on blur (or Enter) rather than on every keystroke — so the activity trail logs
 * one edit per change, not one per character. Escape cancels.
 */
function InlineText({
  value,
  placeholder,
  className,
  multiline = false,
  onCommit,
}: {
  value: string;
  placeholder?: string;
  className: string;
  multiline?: boolean;
  onCommit: (next: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  const commit = () => {
    if (draft !== value) onCommit(draft);
  };

  if (multiline) {
    // Newlines are allowed; only blur commits, Escape cancels.
    return (
      <textarea
        className={className}
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setDraft(value);
            e.currentTarget.blur();
          }
        }}
      />
    );
  }

  return (
    <input
      className={className}
      value={draft}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") {
          setDraft(value);
          e.currentTarget.blur();
        }
      }}
    />
  );
}

/** Small "assign advisor" dropdown reused by the card advisor field and tasks. */
function AssigneeSelect({
  value,
  onChange,
  className = "select",
}: {
  value: MemberId | null;
  onChange: (member: MemberId | null) => void;
  className?: string;
}) {
  return (
    <select
      className={className}
      value={value ?? ""}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        e.stopPropagation();
        onChange((e.target.value || null) as MemberId | null);
      }}
    >
      <option value="">Unassigned</option>
      {MEMBER_IDS.map((id) => (
        <option key={id} value={id}>
          {MEMBERS[id].name}
        </option>
      ))}
    </select>
  );
}

/**
 * Slide-in side panel: the full, editable record for one client. Every control
 * writes straight back through the board API, so edits are live on the board,
 * persisted, and recorded in the activity trail. The overlay closes the panel;
 * the panel stops click propagation so inside-clicks don't close it.
 */
export function DetailPanel({
  client,
  board,
  onClose,
}: {
  client: Client;
  board: BoardApi;
  onClose: () => void;
}) {
  const id = client.id;
  const mandate = MANDATE[client.mandate];
  const pri = PRIORITY[client.priority];
  const checklist = client.checklist ?? [];
  const doneCount = checklist.filter((i) => i.done).length;

  const [newTask, setNewTask] = useState("");
  const addTask = () => {
    if (newTask.trim()) {
      board.addTask(id, newTask);
      setNewTask("");
    }
  };

  return (
    <div className="overlay" data-anim onClick={onClose}>
      <div className="panel" data-anim onClick={(e) => e.stopPropagation()}>
        {/* ---- Gold header: badges + editable name/descriptor ---- */}
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
          <InlineText
            className="panel__name-input"
            value={client.name}
            placeholder="Client name"
            onCommit={(v) => board.editDetails(id, { name: v.trim() || client.name }, "name")}
          />
          <InlineText
            className="panel__sub-input"
            value={client.sub}
            placeholder="Business descriptor"
            onCommit={(v) => board.editDetails(id, { sub: v }, "descriptor")}
          />
        </div>

        {/* ---- Scrollable detail body ---- */}
        <div className="panel__body">
          <div className="panel__grid">
            <div>
              <div className="field-label">Email</div>
              <InlineText
                className="inline-input"
                value={client.email}
                placeholder="—"
                onCommit={(v) => board.editDetails(id, { email: v }, "email")}
              />
            </div>
            <div>
              <div className="field-label">Phone</div>
              <InlineText
                className="inline-input"
                value={client.phone}
                placeholder="—"
                onCommit={(v) => board.editDetails(id, { phone: v }, "phone")}
              />
            </div>
            <div>
              <div className="field-label">Advisor</div>
              <div className="field-advisor">
                <Avatar member={client.member} />
                <AssigneeSelect
                  value={client.member}
                  onChange={(m) => board.setAdvisor(id, m)}
                  className="select select--inline"
                />
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
              onChange={(e) => board.moveClient(id, e.target.value as ColumnId)}
            >
              {COLUMNS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="panel__section">
            <div className="field-label">Mandate type</div>
            <select
              className="select"
              value={client.mandate}
              onChange={(e) => board.setMandate(id, e.target.value as MandateType)}
            >
              {MANDATE_TYPES.map((m) => (
                <option key={m} value={m}>
                  {m}
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
                    onClick={() => board.setPriority(id, key)}
                    style={active ? { background: p.color, color: "#fff", borderColor: p.color } : undefined}
                  >
                    {p.short}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ---- Tasks / required documents ---- */}
          <div className="panel__section">
            <div className="panel__section-head">
              <div className="field-label" style={{ marginBottom: 0 }}>
                Tasks &amp; required documents
              </div>
              {checklist.length > 0 && (
                <span className="checklist-progress">
                  {doneCount} / {checklist.length}
                </span>
              )}
            </div>

            <div className="checklist">
              {checklist.map((item) => (
                <div key={item.id} className="task">
                  <button
                    className="task__main"
                    onClick={() => board.toggleTask(id, item.id)}
                    title={item.done ? "Mark as open" : "Mark as done"}
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
                  </button>
                  <div className="task__controls">
                    <AssigneeSelect
                      value={item.assignee}
                      onChange={(m) => board.assignTask(id, item.id, m)}
                      className="select select--task"
                    />
                    <button
                      className="task__delete"
                      onClick={() => board.removeTask(id, item.id)}
                      aria-label="Remove task"
                      title="Remove task"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add-task row — available on every card, so staff can build the
                document request list as they go. */}
            <div className="task-add">
              <input
                className="task-add__input"
                value={newTask}
                placeholder="Add a document or task …"
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addTask();
                }}
              />
              <button className="task-add__btn" onClick={addTask} disabled={!newTask.trim()}>
                Add
              </button>
            </div>
          </div>

          <div>
            <div className="field-label">Notes / Next steps</div>
            <InlineText
              className="textarea"
              multiline
              value={client.notes}
              placeholder="Note the next steps …"
              onCommit={(v) => board.updateNotes(id, v)}
            />
          </div>
        </div>

        {/* ---- Lifecycle actions ---- */}
        <div className="panel__foot">
          <button
            className="btn-ghost"
            onClick={() => {
              board.archiveClient(id);
              onClose();
            }}
          >
            Archive
          </button>
          <button
            className="btn-danger"
            onClick={() => {
              if (confirm(`Permanently delete “${client.name}”? This cannot be undone.`)) {
                board.deleteClient(id);
                onClose();
              }
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
