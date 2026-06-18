import { useState } from "react";
import type { Client, ColumnId } from "../lib/types";
import { Card } from "./Card";
import { AddCardForm } from "./AddCardForm";

interface ColumnProps {
  id: ColumnId;
  title: string;
  paused: boolean;
  cards: Client[];
  /** Id of the card being dragged anywhere on the board (for the dim effect). */
  draggingId: string | null;
  /** True when a drag is hovering this column (highlights the drop zone). */
  isDropTarget: boolean;
  /** Whether the add form was opened here via the header's "New inquiry" button. */
  openAddForm: boolean;
  onCardOpen: (id: string) => void;
  onCardDragStart: (id: string) => void;
  onCardDragEnd: () => void;
  onDragOver: () => void;
  onDrop: () => void;
  onAddCard: (name: string) => void;
  /** Called once the externally-requested add form has been shown. */
  onAddFormConsumed: () => void;
}

/** A single pipeline phase: header with live count, scrollable cards, add-card footer. */
export function Column({
  title,
  paused,
  cards,
  draggingId,
  isDropTarget,
  openAddForm,
  onCardOpen,
  onCardDragStart,
  onCardDragEnd,
  onDragOver,
  onDrop,
  onAddCard,
  onAddFormConsumed,
}: ColumnProps) {
  const [adding, setAdding] = useState(false);

  // The header's "New inquiry" button opens the add form in the New Inquiry
  // column from outside; honor that request once, then clear the flag.
  if (openAddForm && !adding) {
    setAdding(true);
    onAddFormConsumed();
  }

  const countActive = cards.length > 0 && !paused;

  const submit = (name: string) => {
    onAddCard(name);
    setAdding(false);
  };

  return (
    <div className={paused ? "column column--paused" : "column"}>
      <div className="column__head">
        <span className="column__title">{title}</span>
        <span className={countActive ? "column__count column__count--active" : "column__count"}>
          {cards.length}
        </span>
      </div>

      {/* The whole body is the drop zone. preventDefault on dragOver is what
          actually allows the drop event to fire in the HTML5 DnD API. */}
      <div
        className={isDropTarget ? "column__body column__body--drop" : "column__body"}
        onDragOver={(e) => {
          e.preventDefault();
          onDragOver();
        }}
        onDrop={(e) => {
          e.preventDefault();
          onDrop();
        }}
      >
        {cards.map((c) => (
          <Card
            key={c.id}
            client={c}
            paused={paused}
            dragging={draggingId === c.id}
            onOpen={() => onCardOpen(c.id)}
            onDragStart={() => onCardDragStart(c.id)}
            onDragEnd={onCardDragEnd}
          />
        ))}
      </div>

      <div className="column__foot">
        {adding ? (
          <AddCardForm onSubmit={submit} onCancel={() => setAdding(false)} />
        ) : (
          <button className="add-trigger" onClick={() => setAdding(true)}>
            <span className="plus">+</span> Add a card
          </button>
        )}
      </div>
    </div>
  );
}
