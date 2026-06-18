import { useEffect, useMemo, useState } from "react";
import { Header } from "./components/Header";
import { Column } from "./components/Column";
import { DetailPanel } from "./components/DetailPanel";
import { NewClientModal } from "./components/NewClientModal";
import { ActivityPanel } from "./components/ActivityPanel";
import { ArchivedPanel } from "./components/ArchivedPanel";
import { COLUMNS, PAUSED_COLUMN } from "./lib/brand";
import { useBoard } from "./lib/useBoard";
import { useDragAndDrop } from "./lib/useDragAndDrop";
import type { AdvisorFilter, Client, ColumnId } from "./lib/types";

/** Apply the advisor filter to a single card. */
function matchesFilter(card: Client, filter: AdvisorFilter): boolean {
  if (filter === "all") return true;
  if (filter === "unassigned") return card.member === null;
  return card.member === filter;
}

export default function App() {
  const board = useBoard();
  const drag = useDragAndDrop();

  // Which client's detail panel is open (null = closed).
  const [openId, setOpenId] = useState<string | null>(null);
  // When set, the new-client modal is open, pre-targeted to this column.
  const [addColumn, setAddColumn] = useState<ColumnId | null>(null);
  // Whether the activity / archived panels are open.
  const [activityOpen, setActivityOpen] = useState(false);
  const [archivedOpen, setArchivedOpen] = useState(false);
  // Advisor filter — "all" shows everything.
  const [filter, setFilter] = useState<AdvisorFilter>("all");

  const openClient = openId ? board.clients.find((c) => c.id === openId) ?? null : null;

  // Split clients into the active board vs. the archive once per change.
  const { active, archived, visible } = useMemo(() => {
    const active: Client[] = [];
    const archived: Client[] = [];
    for (const c of board.clients) (c.archived ? archived : active).push(c);
    const visible = active.filter((c) => matchesFilter(c, filter));
    return { active, archived, visible };
  }, [board.clients, filter]);

  // Close whichever overlay is open with Escape.
  useEffect(() => {
    const anyOpen = openClient || addColumn || activityOpen || archivedOpen;
    if (!anyOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpenId(null);
      setAddColumn(null);
      setActivityOpen(false);
      setArchivedOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openClient, addColumn, activityOpen, archivedOpen]);

  const handleDrop = (column: ColumnId) => {
    const id = drag.drop();
    if (id) board.moveClient(id, column);
  };

  return (
    <div className="app">
      <Header
        visibleCount={visible.length}
        totalCount={active.length}
        phaseCount={COLUMNS.length}
        filter={filter}
        onChangeFilter={setFilter}
        currentUser={board.currentUser}
        onChangeUser={board.setCurrentUser}
        archivedCount={archived.length}
        onOpenArchived={() => setArchivedOpen(true)}
        onOpenActivity={() => setActivityOpen(true)}
        onNewInquiry={() => setAddColumn("neu")}
        onReset={() => {
          if (confirm("Reset the board to the original sample data? This clears your changes.")) {
            board.resetBoard();
            setOpenId(null);
            setFilter("all");
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
            cards={visible.filter((c) => c.column === col.id)}
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
            // Clear any filter so the new card is visible, then open it.
            setFilter("all");
            setOpenId(id);
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

      {archivedOpen && (
        <ArchivedPanel
          clients={archived}
          onRestore={board.unarchiveClient}
          onDelete={board.deleteClient}
          onClose={() => setArchivedOpen(false)}
        />
      )}
    </div>
  );
}
