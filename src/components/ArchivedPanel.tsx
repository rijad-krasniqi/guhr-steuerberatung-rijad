import type { Client } from "../lib/types";
import { MANDATE } from "../lib/brand";
import { Avatar, memberName } from "./Avatar";

/**
 * Slide-in list of archived clients. Archiving keeps a card's full record but
 * removes it from the active board; from here it can be restored or deleted for
 * good. This keeps the board uncluttered without losing history.
 */
export function ArchivedPanel({
  clients,
  onRestore,
  onDelete,
  onClose,
}: {
  clients: Client[];
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="overlay" data-anim onClick={onClose}>
      <div className="panel" data-anim onClick={(e) => e.stopPropagation()}>
        <div className="panel__head panel__head--plain">
          <button className="panel__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
          <div className="panel__eyebrow">Admin</div>
          <div className="panel__name panel__name--dark">Archived clients</div>
          <div className="panel__sub panel__sub--dark">
            Restore a card to the board, or delete it permanently
          </div>
        </div>

        <div className="panel__body">
          {clients.length === 0 ? (
            <div className="activity-empty">No archived clients.</div>
          ) : (
            clients.map((c) => {
              const mandate = MANDATE[c.mandate];
              return (
                <div key={c.id} className="arch-item">
                  <div className="arch-info">
                    <div className="arch-head">
                      <span className="tag" style={{ background: mandate.bg, color: mandate.color }}>
                        {c.mandate}
                      </span>
                      <span className="arch-name">{c.name}</span>
                    </div>
                    <div className="arch-meta">
                      <Avatar member={c.member} size={18} />
                      <span>{memberName(c.member)}</span>
                      <span className="dot">·</span>
                      <span>{c.sub}</span>
                    </div>
                  </div>
                  <div className="arch-actions">
                    <button className="btn-ghost btn-ghost--sm" onClick={() => onRestore(c.id)}>
                      Restore
                    </button>
                    <button
                      className="btn-danger-link"
                      onClick={() => {
                        if (confirm(`Permanently delete “${c.name}”? This cannot be undone.`)) {
                          onDelete(c.id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
