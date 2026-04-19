const SECTIONS = [
  { id: "profile", label: "Profile" },
  { id: "orders", label: "Orders" },
  { id: "security", label: "Security" },
];

/** Account navigation. Uses GET /api/account. */
export function AccountNav({ activeSection, onSectionChange }) {
  return (
    <aside className="panelBox accountNav">
      <p className="panelTitle">Menu</p>
      <div className="accountNavButtons" role="tablist" aria-label="Account sections">
        {SECTIONS.map(({ id, label }) => {
          const selected = activeSection === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={`accountNavButton${selected ? " accountNavButtonActive" : ""}`}
              onClick={() => onSectionChange(id)}
            >
              {label}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
