import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { Column } from "./components/Column";
import { DetailPanel } from "./components/DetailPanel";
import { COLUMNS, PAUSED_COLUMN } from "./lib/brand";
import { useBoard } from "./lib/useBoard";
import { useDragAndDrop } from "./lib/useDragAndDrop";
import type { ColumnId } from "./lib/types";

export default function App() {
  const board = useBoard();
  const drag = useDragAndDrop();

  // Which client's detail panel is open (null = closed).
  const [openId, setOpenId] = useState<string | null>(null);
  // Set when the header's "New inquiry" asks the New Inquiry column to open its
  // add form. The column consumes the flag and clears it.
  const [addRequestColumn, setAddRequestColumn] = useState<ColumnId | null>(null);

  const openClient = openId ? board.clients.find((c) => c.id === openId) ?? null : null;

  // Close the panel with Escape, the expected shortcut for a slide-in.
  useEffect(() => {
    if (!openClient) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openClient]);

  const handleDrop = (column: ColumnId) => {
    const id = drag.drop();
    if (id) board.moveClient(id, column);
  };

  return (
    <div className="app">
      <Header
        totalCount={board.clients.length}
        phaseCount={COLUMNS.length}
        onNewInquiry={() => setAddRequestColumn("neu")}
        onReset={() => {
          if (confirm("Reset the board to the original sample data? This clears your changes.")) {
            board.resetBoard();
            setOpenId(null);
          }
        }}
      />

      <div className="board">
        {COLUMNS.map((col) => (
          <Column
            key={col.id}
            id={col.id}
            title={col.title}
            paused={col.id === PAUSED_COLUMN}
            cards={board.clients.filter((c) => c.column === col.id)}
            draggingId={drag.draggingId}
            isDropTarget={drag.overColumn === col.id && drag.draggingId !== null}
            openAddForm={addRequestColumn === col.id}
            onCardOpen={setOpenId}
            onCardDragStart={drag.startDrag}
            onCardDragEnd={drag.endDrag}
            onDragOver={() => drag.setOverColumn(col.id)}
            onDrop={() => handleDrop(col.id)}
            onAddCard={(name) => board.addClient(col.id, name)}
            onAddFormConsumed={() => setAddRequestColumn(null)}
          />
        ))}
      </div>

      {openClient && (
        <DetailPanel
          client={openClient}
          onClose={() => setOpenId(null)}
          onChange={(patch) => board.updateClient(openClient.id, patch)}
          onToggleChecklistItem={(index) => board.toggleChecklistItem(openClient.id, index)}
        />
      )}
    </div>
  );
}
