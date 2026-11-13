import { useEffect, useState } from "react";
import {
  fetchCourse,
  fetchCourseGroups,
  groupLabel,
  type CourseGroup,
} from "@/lib/course-groups";

export type OfferCategory = "COURSE" | "SPORT";

// Shape of an offer as returned by GET /api/offers (Prisma Offer serialized to JSON).
export interface Offer {
  id: string;
  title: string;
  offeredCourseId: string;
  wantedCourseId: string;
  offeredGroupId: string | null;
  wantedGroupId: string | null;
  category: OfferCategory;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy: OfferAuthor;
}

// Public author data included with each offer (no email, only the index derived from it).
export interface OfferAuthor {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  image: string | null;
  studentIndex: string | null;
}

const dateFormat = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function useCourseName(courseId: string | null) {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;

    fetchCourse(courseId)
      .then((course) => {
        if (!cancelled) setName(course.name);
      })
      .catch((err) => {
        console.error(err);
        // Fall back to the course code so the card still says what it is about.
        if (!cancelled) setName(courseId);
      });

    return () => {
      cancelled = true;
    };
  }, [courseId]);

  return name;
}

function GroupName({ group }: { group: CourseGroup | undefined }) {
  if (!group) return <span>nieznana grupa</span>;

  return (
    <span
      className="font-semibold text-nav-fg"
      title={group.lecturers.join(", ") || undefined}
    >
      {groupLabel(group)}
    </span>
  );
}

async function fetchGroupsOf(courseIds: string[]) {
  const lists = await Promise.all(courseIds.map(fetchCourseGroups));
  return lists.flat();
}

function OfferGroups({
  offer,
  wantedCourseName,
}: {
  offer: Offer;
  // Set only when the wanted course differs from the offered one (sport swaps).
  wantedCourseName: string | null;
}) {
  const [groups, setGroups] = useState<CourseGroup[] | null>(null);
  const [error, setError] = useState(false);
  const { offeredCourseId, wantedCourseId } = offer;

  useEffect(() => {
    let cancelled = false;

    const courseIds =
      offeredCourseId === wantedCourseId
        ? [offeredCourseId]
        : [offeredCourseId, wantedCourseId];

    fetchGroupsOf(courseIds)
      .then((data) => {
        if (!cancelled) setGroups(data);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [offeredCourseId, wantedCourseId]);

  if (error) {
    return (
      <p className="m-0 text-sm text-nav-muted">
        Nie udało się pobrać grup z USOS.
      </p>
    );
  }

  if (!groups) {
    return <p className="m-0 text-sm text-nav-muted">Ładowanie grup…</p>;
  }

  const offered = groups.find((g) => g.id === offer.offeredGroupId);
  const wanted = groups.find((g) => g.id === offer.wantedGroupId);

  return (
    <p className="m-0 text-sm text-nav-muted">
     <span aria-label="na">Oddam</span> <GroupName group={offered} /> <span aria-label="na">za</span>{" "}
      {wantedCourseName && (
        <span className="text-nav-fg">{wantedCourseName}, </span>
      )}
      <GroupName group={wanted} />
    </p>
  );
}

function AuthorAvatar({ author }: { author: OfferAuthor }) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials =
    `${author.firstName.charAt(0)}${author.lastName.charAt(0)}`.toUpperCase();

  if (author.image && !imageFailed) {
    return (
      <img
        src={author.image}
        alt=""
        className="size-8 shrink-0 rounded-full object-cover"
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <span
      className="grid size-8 shrink-0 place-items-center rounded-full bg-nav-accent-bg text-xs font-bold text-nav-accent"
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

export function OfferCard({
  offer,
  mine,
  onDeleted,
}: {
  offer: Offer;
  mine: boolean;
  onDeleted: (id: string) => void;
}) {
  const courseName = useCourseName(offer.offeredCourseId);
  const differentCourses = offer.offeredCourseId !== offer.wantedCourseId;
  const wantedCourseName = useCourseName(
    differentCourses ? offer.wantedCourseId : null,
  );
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  async function deleteOffer() {
    if (!window.confirm("Usunąć to ogłoszenie?")) return;

    setDeleting(true);
    setDeleteError(false);
    try {
      const response = await fetch(
        `/api/offers/${encodeURIComponent(offer.id)}`,
        { method: "DELETE", credentials: "include" },
      );
      // 404 means the offer is already gone, so drop it from the list as well.
      if (!response.ok && response.status !== 404) {
        throw new Error(`status ${response.status}`);
      }
      onDeleted(offer.id);
    } catch (err) {
      console.error(err);
      setDeleteError(true);
      setDeleting(false);
    }
  }

  return (
    <article className="flex flex-col gap-2 rounded-md border border-nav-border bg-[var(--bg)] p-4">
      <div className="flex items-start justify-between gap-3">
        <h2 className="m-0 min-w-0 text-base font-semibold text-nav-fg">
          {courseName ?? "Ładowanie przedmiotu…"}
        </h2>
        {mine && (
          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-full bg-nav-accent-bg px-2.5 py-0.5 text-xs font-semibold text-nav-accent">
              Twoje
            </span>
            <button
              type="button"
              onClick={deleteOffer}
              disabled={deleting}
              className="cursor-pointer rounded-md border border-nav-border bg-transparent px-2.5 py-0.5 text-xs font-semibold text-nav-fg hover:bg-nav-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-accent disabled:cursor-default disabled:opacity-60"
            >
              {deleting ? "Usuwanie…" : "Usuń"}
            </button>
          </div>
        )}
      </div>

      {deleteError && (
        <p className="m-0 text-sm font-semibold text-nav-accent" role="alert">
          Nie udało się usunąć ogłoszenia.
        </p>
      )}

      <div className="flex min-w-0 items-center gap-2">
        <AuthorAvatar author={offer.createdBy} />
        <span className="truncate text-sm font-medium text-nav-fg">
          {offer.createdBy.firstName} {offer.createdBy.lastName}
        </span>
        {offer.createdBy.studentIndex && (
          <span className="shrink-0 text-xs text-nav-muted">
            {offer.createdBy.studentIndex}
          </span>
        )}
      </div>

      <OfferGroups
        offer={offer}
        wantedCourseName={
          differentCourses ? (wantedCourseName ?? offer.wantedCourseId) : null
        }
      />

      <time dateTime={offer.createdAt} className="text-xs text-nav-muted">
        Dodano {dateFormat.format(new Date(offer.createdAt))}
      </time>
    </article>
  );
}
