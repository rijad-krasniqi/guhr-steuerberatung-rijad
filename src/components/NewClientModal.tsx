import { useState } from "react";
import type { ColumnId, MandateType, MemberId, NewClientDraft, Priority } from "../lib/types";
import { COLUMNS, MANDATE_TYPES, MEMBER_IDS, MEMBERS, PRIORITY } from "../lib/brand";

const PRIORITY_ORDER: Priority[] = ["high", "normal", "low"];

/**
 * Centered modal for creating a client. The original quick-add only captured a
 * name; this collects the fields a clerk actually knows up front (descriptor,
 * mandate, advisor, priority, contact details, phase) so new cards aren't blank.
 * Only the name is required — everything else has a sensible default.
 */
export function NewClientModal({
  initialColumn,
  onClose,
  onCreate,
}: {
  initialColumn: ColumnId;
  onClose: () => void;
  onCreate: (draft: NewClientDraft) => void;
}) {
  const [draft, setDraft] = useState<NewClientDraft>({
    name: "",
    sub: "",
    mandate: "Income Tax",
    member: null,
    priority: "normal",
    column: initialColumn,
    email: "",
    phone: "",
  });

  const set = <K extends keyof NewClientDraft>(key: K, value: NewClientDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const canSubmit = draft.name.trim().length > 0;

  const submit = () => {
    if (canSubmit) onCreate(draft);
  };

  return (
    <div className="overlay overlay--center" data-anim onClick={onClose}>
      <div className="modal" data-anim onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <div className="modal__title">New client</div>
          <button className="modal__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div
          className="modal__body"
          onKeyDown={(e) => {
            // Enter submits from any single-line input (but not the textarea-less form anyway).
            if (e.key === "Enter" && canSubmit) submit();
            if (e.key === "Escape") onClose();
          }}
        >
          <div className="form-field">
            <label className="field-label">Client name *</label>
            <input
              className="input"
              autoFocus
              value={draft.name}
              placeholder="e.g. Clara Brandt"
              onChange={(e) => set("name", e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="field-label">Business descriptor</label>
            <input
              className="input"
              value={draft.sub}
              placeholder="e.g. Freelancer · Graphic Design"
              onChange={(e) => set("sub", e.target.value)}
            />
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label className="field-label">Mandate type</label>
              <select
                className="select"
                value={draft.mandate}
                onChange={(e) => set("mandate", e.target.value as MandateType)}
              >
                {MANDATE_TYPES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label className="field-label">Advisor</label>
              <select
                className="select"
                value={draft.member ?? ""}
                onChange={(e) => set("member", (e.target.value || null) as MemberId | null)}
              >
                <option value="">Unassigned</option>
                {MEMBER_IDS.map((id) => (
                  <option key={id} value={id}>
                    {MEMBERS[id].name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-field">
            <label className="field-label">Priority</label>
            <div className="pri-group">
              {PRIORITY_ORDER.map((key) => {
                const p = PRIORITY[key];
                const active = draft.priority === key;
                return (
                  <button
                    key={key}
                    type="button"
                    className="pri-btn"
                    onClick={() => set("priority", key)}
                    style={active ? { background: p.color, color: "#fff", borderColor: p.color } : undefined}
                  >
                    {p.short}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label className="field-label">Email</label>
              <input
                className="input"
                value={draft.email}
                placeholder="name@example.de"
                onChange={(e) => set("email", e.target.value)}
              />
            </div>
            <div className="form-field">
              <label className="field-label">Phone</label>
              <input
                className="input"
                value={draft.phone}
                placeholder="+49 …"
                onChange={(e) => set("phone", e.target.value)}
              />
            </div>
          </div>

          <div className="form-field">
            <label className="field-label">Phase</label>
            <select
              className="select"
              value={draft.column}
              onChange={(e) => set("column", e.target.value as ColumnId)}
            >
              {COLUMNS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal__foot">
          <button className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={submit} disabled={!canSubmit}>
            Add client
          </button>
        </div>
      </div>
    </div>
  );
}
