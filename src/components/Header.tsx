import type { MemberId } from "../lib/types";
import { MEMBER_IDS, MEMBERS } from "../lib/brand";
import { Avatar } from "./Avatar";

/**
 * App header: brand lockup, live pipeline stats, the "acting as" identity
 * switcher (which stamps the activity trail), an Activity button, and the
 * primary "New inquiry" action.
 */
export function Header({
  totalCount,
  phaseCount,
  currentUser,
  onChangeUser,
  onOpenActivity,
  onNewInquiry,
  onReset,
}: {
  totalCount: number;
  phaseCount: number;
  currentUser: MemberId;
  onChangeUser: (member: MemberId) => void;
  onOpenActivity: () => void;
  onNewInquiry: () => void;
  onReset: () => void;
}) {
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
            <b>{totalCount}</b> clients
          </span>
          <span className="dot">·</span>
          <span>
            <b>{phaseCount}</b> phases
          </span>
        </div>

        <div className="header__divider" />

        {/* "Acting as": who the activity trail attributes changes to. In a real
            deployment this would come from auth; here it's a simple switcher so
            the audit trail is meaningful in the demo. */}
        <label className="user-switch" title="Actions are recorded under this advisor">
          <span className="user-switch__caption">Acting as</span>
          <Avatar member={currentUser} size={24} />
          <select
            className="user-switch__select"
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

        <button className="btn-secondary" onClick={onOpenActivity}>
          Activity
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
