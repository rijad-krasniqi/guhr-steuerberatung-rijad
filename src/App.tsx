import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { Column } from "./components/Column";
import { DetailPanel } from "./components/DetailPanel";
import { NewClientModal } from "./components/NewClientModal";
import { ActivityPanel } from "./components/ActivityPanel";
import { COLUMNS, PAUSED_COLUMN } from "./lib/brand";
import { useBoard } from "./lib/useBoard";
import { useDragAndDrop } from "./lib/useDragAndDrop";
import type { ColumnId } from "./lib/types";

export default function App() {
  const board = useBoard();
  const drag = useDragAndDrop();

  // Which client's detail panel is open (null = closed).
  const [openId, setOpenId] = useState<string | null>(null);
  // When set, the new-client modal is open, pre-targeted to this column.
  const [addColumn, setAddColumn] = useState<ColumnId | null>(null);
  // Whether the activity (audit) panel is open.
  const [activityOpen, setActivityOpen] = useState(false);

  const openClient = openId ? board.clients.find((c) => c.id === openId) ?? null : null;

  // Close whichever overlay is open with Escape.
  useEffect(() => {
    const anyOpen = openClient || addColumn || activityOpen;
    if (!anyOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpenId(null);
      setAddColumn(null);
      setActivityOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openClient, addColumn, activityOpen]);

  const handleDrop = (column: ColumnId) => {
    const id = drag.drop();
    if (id) board.moveClient(id, column);
  };

  return (
    <div className="app">
      <Header
        totalCount={board.clients.length}
        phaseCount={COLUMNS.length}
        currentUser={board.currentUser}
        onChangeUser={board.setCurrentUser}
        onOpenActivity={() => setActivityOpen(true)}
        onNewInquiry={() => setAddColumn("neu")}
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
            onCardOpen={setOpenId}
            onCardDragStart={drag.startDrag}
            onCardDragEnd={drag.endDrag}
            onDragOver={() => drag.setOverColumn(col.id)}
            onDrop={() => handleDrop(col.id)}
            onAddCard={() => setAddColumn(col.id)}
          />
        ))}
      </div>

      {openClient && (
        // Keyed by id so the panel's inline editors reset cleanly between cards.
        <DetailPanel
          key={openClient.id}
          client={openClient}
          board={board}
          onClose={() => setOpenId(null)}
        />
      )}

      {addColumn && (
        <NewClientModal
          initialColumn={addColumn}
          onClose={() => setAddColumn(null)}
          onCreate={(draft) => {
            const id = board.addClient(draft);
            setAddColumn(null);
            setOpenId(id); // jump straight into the new card to fill in the rest
          }}
        />
      )}

      {activityOpen && (
        <ActivityPanel
          activity={board.activity}
          onClose={() => setActivityOpen(false)}
          onClear={board.clearActivity}
        />
      )}
    </div>
  );
}
