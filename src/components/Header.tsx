/** App header: brand lockup, live pipeline stats, and the primary add action. */
export function Header({
  totalCount,
  phaseCount,
  onNewInquiry,
  onReset,
}: {
  totalCount: number;
  phaseCount: number;
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
        <button
          className="linklike"
          onClick={onReset}
          title="Restore the original sample data"
        >
          Reset
        </button>
        <button className="btn-primary" onClick={onNewInquiry}>
          <span className="plus">+</span> New inquiry
        </button>
      </div>
    </header>
  );
}
