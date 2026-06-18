import { useState } from "react";

/**
 * Inline "add a card" form shown at the bottom of a column. Submits on the
 * Add button or Enter; cancels on the ✕ button or Escape. Empty names are
 * ignored so a stray Enter never creates a blank card.
 */
export function AddCardForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (name: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");

  const submit = () => {
    if (name.trim()) onSubmit(name);
  };

  return (
    <div className="add-form">
      <input
        className="add-form__input"
        value={name}
        autoFocus
        placeholder="Client name …"
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
          if (e.key === "Escape") onCancel();
        }}
      />
      <div className="add-form__row">
        <button className="add-form__submit" onClick={submit}>
          Add
        </button>
        <button className="add-form__cancel" onClick={onCancel} aria-label="Cancel">
          ✕
        </button>
      </div>
    </div>
  );
}
