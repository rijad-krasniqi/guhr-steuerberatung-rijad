import type { Client, ColumnId } from "../lib/types";
import { Card } from "./Card";

interface ColumnProps {
  id: ColumnId;
  title: string;
  paused: boolean;
  cards: Client[];
  /** Id of the card being dragged anywhere on the board (for the dim effect). */
  draggingId: string | null;
  /** True when a drag is hovering this column (highlights the drop zone). */
  isDropTarget: boolean;
  onCardOpen: (id: string) => void;
  onCardDragStart: (id: string) => void;
  onCardDragEnd: () => void;
  onDragOver: () => void;
  onDrop: () => void;
  /** Open the new-client form pre-targeted to this column. */
  onAddCard: () => void;
}

/** A single pipeline phase: header with live count, scrollable cards, add-card footer. */
export function Column({
  title,
  paused,
  cards,
  draggingId,
  isDropTarget,
  onCardOpen,
  onCardDragStart,
  onCardDragEnd,
  onDragOver,
  onDrop,
  onAddCard,
}: ColumnProps) {
  const countActive = cards.length > 0 && !paused;

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
        <button className="add-trigger" onClick={onAddCard}>
          <span className="plus">+</span> Add a card
        </button>
      </div>
    </div>
  );
}
