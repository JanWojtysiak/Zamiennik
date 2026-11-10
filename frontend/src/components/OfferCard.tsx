import { useEffect, useState } from "react";

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

// Shape of a group as returned by GET /api/courses/:courseId/groups.
interface CourseGroup {
  id: string;
  unitId: string;
  groupNumber: number;
  classType: string;
  lecturers: string[];
}

function WantedGroups({ courseId }: { courseId: string }) {
  const [groups, setGroups] = useState<CourseGroup[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadGroups() {
      try {
        const response = await fetch(
          `/api/courses/${encodeURIComponent(courseId)}/groups`,
          { credentials: "include" },
        );
        if (!response.ok) {
          throw new Error(`status ${response.status}`);
        }

        const data = (await response.json()) as CourseGroup[];
        if (!cancelled) setGroups(data);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError(true);
      }
    }

    loadGroups();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  if (error) {
    return (
      <p className="m-0 text-xs text-nav-muted">
        Nie udało się pobrać grup z USOS.
      </p>
    );
  }

  if (!groups) {
    return <p className="m-0 text-xs text-nav-muted">Ładowanie grup…</p>;
  }

  if (groups.length === 0) {
    return (
      <p className="m-0 text-xs text-nav-muted">
        Brak grup w bieżącym semestrze.
      </p>
    );
  }

  return (
    <ul className="m-0 flex list-none flex-col gap-1 p-0 text-xs text-nav-muted">
      {groups.map((group) => (
        <li key={group.id}>
          <span className="font-semibold text-nav-fg">
            {group.classType} gr. {group.groupNumber}
          </span>
          {group.lecturers.length > 0 && ` – ${group.lecturers.join(", ")}`}
        </li>
      ))}
    </ul>
  );
}

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

      <p className="m-0 text-sm text-nav-muted">Wymiana grupy zajęciowej</p>
      <WantedGroups courseId={offer.wantedCourseId} />

      <time
        dateTime={offer.createdAt}
        className="text-xs text-nav-muted"
      >
        Dodano {dateFormat.format(new Date(offer.createdAt))}
      </time>
    </article>
  );
}
