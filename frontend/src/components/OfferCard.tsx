// Shape of an offer as returned by GET /api/offers (Prisma Offer serialized to JSON).
export interface Offer {
  id: string;
  title: string;
  offeredCourseId: string;
  wantedCourseId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

const dateFormat = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function OfferCard({ offer, mine }: { offer: Offer; mine: boolean }) {
  return (
    <article className="flex flex-col gap-2 rounded-md border border-nav-border bg-[var(--bg)] p-4">
      <div className="flex items-start justify-between gap-3">
        <h2 className="m-0 min-w-0 text-base font-semibold break-all text-nav-fg">
          {offer.offeredCourseId}
        </h2>
        {mine && (
          <span className="shrink-0 rounded-full bg-nav-accent-bg px-2.5 py-0.5 text-xs font-semibold text-nav-accent">
            Twoje
          </span>
        )}
      </div>

      {/* TODO: show offered → wanted group once the backend stores groups. */}
      <p className="m-0 text-sm text-nav-muted">Wymiana grupy zajęciowej</p>

      <time
        dateTime={offer.createdAt}
        className="text-xs text-nav-muted"
      >
        Dodano {dateFormat.format(new Date(offer.createdAt))}
      </time>
    </article>
  );
}
