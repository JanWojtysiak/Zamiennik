export const OFFER_FILTERS = [
  { id: "mine", label: "Tylko moje ogłoszenia" },
] as const;

export type OfferFilterId = (typeof OFFER_FILTERS)[number]["id"];

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-accent";

export function OfferFilters({
  active,
  onToggle,
}: {
  active: ReadonlySet<OfferFilterId>;
  onToggle: (id: OfferFilterId, checked: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="text-xs font-medium tracking-wider text-nav-muted uppercase">
        Filtry
      </span>
      <fieldset className="m-0 flex min-w-0 flex-wrap gap-2 border-0 p-0">
        <legend className="sr-only">Filtry ogłoszeń</legend>
        {OFFER_FILTERS.map((filter) => {
          const checked = active.has(filter.id);
          return (
            <label
              key={filter.id}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-nav-accent ${
                checked
                  ? "border-transparent bg-nav-accent-bg text-nav-accent"
                  : "border-nav-border bg-transparent text-nav-fg hover:bg-nav-hover"
              }`}
            >
              <input
                type="checkbox"
                className={`sr-only ${focusRing}`}
                checked={checked}
                onChange={(event) => onToggle(filter.id, event.target.checked)}
              />
              <span
                aria-hidden="true"
                className={`grid size-4 shrink-0 place-items-center rounded-[4px] border ${
                  checked
                    ? "border-nav-accent bg-nav-accent text-white"
                    : "border-nav-border bg-[var(--bg)]"
                }`}
              >
                {checked && <CheckIcon />}
              </span>
              {filter.label}
            </label>
          );
        })}
      </fieldset>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
      <path
        d="M3.5 8.2 6.4 11l6.1-6.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
