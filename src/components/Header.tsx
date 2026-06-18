import type { AdvisorFilter, MemberId } from "../lib/types";
import { MEMBER_IDS, MEMBERS } from "../lib/brand";
import { Avatar } from "./Avatar";

/**
 * App header: brand lockup, live pipeline stats, the advisor **filter**, the
 * "acting as" identity switcher (which stamps the activity trail), Activity and
 * Archived panels, and the primary "New inquiry" action.
 */
export function Header({
  visibleCount,
  totalCount,
  phaseCount,
  filter,
  onChangeFilter,
  currentUser,
  onChangeUser,
  archivedCount,
  onOpenArchived,
  onOpenActivity,
  onNewInquiry,
  onReset,
}: {
  /** Cards currently visible (after filtering). */
  visibleCount: number;
  /** All active (non-archived) cards. */
  totalCount: number;
  phaseCount: number;
  filter: AdvisorFilter;
  onChangeFilter: (filter: AdvisorFilter) => void;
  currentUser: MemberId;
  onChangeUser: (member: MemberId) => void;
  archivedCount: number;
  onOpenArchived: () => void;
  onOpenActivity: () => void;
  onNewInquiry: () => void;
  onReset: () => void;
}) {
  const filtered = filter !== "all";

  return (
    <header className="header">
      <div className="header__brand">
        <img className="header__logo" src="/assets/logo.svg" alt="Guhr Steuerberatung" />
        <div className="header__divider" />
        <div className="header__titles">
          <span className="header__title">Client Onboarding</span>
          <span className="header__subtitle">New-client pipeline · Kanban</span>
        </div>
      </div>

      <div className="header__right">
        <div className="header__stats">
          <span>
            {/* When filtered, show "shown of total" so the count isn't confusing. */}
            <b>{filtered ? `${visibleCount} of ${totalCount}` : totalCount}</b> clients
          </span>
          <span className="dot">·</span>
          <span>
            <b>{phaseCount}</b> phases
          </span>
        </div>

        <div className="header__divider" />

        {/* Advisor filter — lets a colleague focus on just their own cards. */}
        <label className="picker" title="Show only one advisor's cards">
          <span className="picker__caption">View</span>
          <select
            className={filtered ? "picker__select picker__select--active" : "picker__select"}
            value={filter}
            onChange={(e) => onChangeFilter(e.target.value as AdvisorFilter)}
          >
            <option value="all">All advisors</option>
            <option value="unassigned">Unassigned</option>
            {MEMBER_IDS.map((id) => (
              <option key={id} value={id}>
                {MEMBERS[id].name}
                {id === currentUser ? " (you)" : ""}
              </option>
            ))}
          </select>
        </label>

        {/* "Acting as": who the activity trail attributes changes to. In a real
            deployment this would come from auth; here it's a simple switcher so
            the audit trail is meaningful in the demo. */}
        <label className="picker" title="Actions are recorded under this advisor">
          <span className="picker__caption">Acting as</span>
          <Avatar member={currentUser} size={24} />
          <select
            className="picker__select"
            value={currentUser}
            onChange={(e) => onChangeUser(e.target.value as MemberId)}
          >
            {MEMBER_IDS.map((id) => (
              <option key={id} value={id}>
                {MEMBERS[id].name}
              </option>
            ))}
          </select>
        </label>

        <div className="header__divider" />

        <button className="btn-secondary" onClick={onOpenActivity}>
          Activity
        </button>
        <button className="btn-secondary" onClick={onOpenArchived}>
          Archived{archivedCount > 0 ? ` · ${archivedCount}` : ""}
        </button>
        <button className="linklike" onClick={onReset} title="Restore the original sample data">
          Reset
        </button>
        <button className="btn-primary" onClick={onNewInquiry}>
          <span className="plus">+</span> New inquiry
        </button>
      </div>
    </header>
  );
}
