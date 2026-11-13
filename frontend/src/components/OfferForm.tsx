import { useEffect, useState } from "react";
import { CourseSelect, type Course } from "@/components/CourseSelect";
import type { OfferCategory } from "@/components/OfferCard";
import {
  fetchCourseGroups,
  groupLabel,
  type CourseGroup,
} from "@/lib/course-groups";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-accent";

const fieldClass =
  "flex min-h-10 min-w-0 items-center gap-2 rounded-md border border-nav-border bg-[var(--bg)] px-3 py-1.5 text-sm text-nav-fg";

const rowLabelClass =
  "text-xs font-semibold tracking-wide text-nav-muted uppercase";

function GroupSelect({
  label,
  groups,
  value,
  onChange,
}: {
  label: string;
  groups: CourseGroup[];
  value: string;
  onChange: (groupId: string) => void;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={groups.length === 0}
      className={`${fieldClass} w-full cursor-pointer disabled:cursor-not-allowed disabled:text-nav-muted sm:w-48 ${focusRing}`}
    >
      <option value="">Grupa</option>
      {groups.map((group) => (
        <option key={group.id} value={group.id}>
          {groupLabel(group)}
          {group.lecturers.length > 0 && ` – ${group.lecturers.join(", ")}`}
        </option>
      ))}
    </select>
  );
}

function useCourseGroups(
  course: Course | null,
  onError: (message: string) => void,
) {
  const [groups, setGroups] = useState<CourseGroup[]>([]);
  const [loadedFor, setLoadedFor] = useState<Course | null>(null);

  useEffect(() => {
    if (!course) return;

    let cancelled = false;
    async function load(selected: Course) {
      try {
        const data = await fetchCourseGroups(selected.id);
        if (cancelled) return;
        setGroups(data);
        setLoadedFor(selected);
      } catch {
        if (!cancelled) onError("Nie udało się pobrać grup z USOS.");
      }
    }

    void load(course);

    return () => {
      cancelled = true;
    };
  }, [course, onError]);

  // Hide groups of a previously selected course until the new ones arrive.
  return course && loadedFor === course ? groups : [];
}

export function OfferForm({
  category,
  onCreated,
}: {
  category: OfferCategory;
  onCreated?: () => void;
}) {
  // Sport classes (WF) can be swapped between disciplines, i.e. different courses.
  const isSport = category === "SPORT";
  const [offeredCourse, setOfferedCourse] = useState<Course | null>(null);
  const [wantedCourse, setWantedCourse] = useState<Course | null>(null);
  const [offeredGroupId, setOfferedGroupId] = useState("");
  const [wantedGroupId, setWantedGroupId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const targetCourse = isSport ? wantedCourse : offeredCourse;
  const groups = useCourseGroups(offeredCourse, setError);
  const targetGroups = useCourseGroups(isSport ? wantedCourse : null, setError);

  function selectCourse(course: Course | null) {
    setOfferedCourse(course);
    setOfferedGroupId("");
    setWantedGroupId("");
  }

  function selectWantedCourse(course: Course | null) {
    setWantedCourse(course);
    setWantedGroupId("");
  }

  function selectOfferedGroup(groupId: string) {
    setOfferedGroupId(groupId);
    setWantedGroupId("");
  }

  // You can only swap into another group of the same class type (e.g. lab for lab).
  // Sport swaps may target a different course, so any of its groups will do.
  const offeredGroup = groups.find((group) => group.id === offeredGroupId);
  let wantedGroups: CourseGroup[] = [];
  if (offeredGroup && isSport) {
    wantedGroups = targetGroups.filter((group) => group.id !== offeredGroup.id);
  } else if (offeredGroup) {
    wantedGroups = groups.filter(
      (group) =>
        group.classType === offeredGroup.classType &&
        group.id !== offeredGroup.id,
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!offeredCourse || !targetCourse) {
      setError(isSport ? "Wybierz oba zajęcia." : "Wybierz przedmiot.");
      setReady(false);
      return;
    }

    if (!offeredGroupId || !wantedGroupId) {
      setError("Wybierz obie grupy.");
      setReady(false);
      return;
    }

    const offer = {
      offeredCourseId: offeredCourse.id,
      wantedCourseId: targetCourse.id,
      offeredGroupId,
      wantedGroupId,
      category,
    };

    setError(null);

    try {
      const response = await fetch("/api/offers", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(offer),
      });

      if (!response.ok) {
        throw new Error("Błąd sieci");
      }

      selectCourse(null);
      selectWantedCourse(null);
      setReady(true);
      onCreated?.();
    } catch {
      setError("Wystąpił błąd podczas tworzenia ogłoszenia.");
      setReady(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Nowe ogłoszenie wymiany"
      className="flex flex-col gap-2.5"
    >
      <div className="flex flex-col gap-1.5">
        <span className={rowLabelClass}>Oddajesz</span>
        <div className="flex flex-col gap-2 sm:flex-row">
          <CourseSelect
            label={isSport ? "Oddajesz – zajęcia" : "Oddajesz – przedmiot"}
            value={offeredCourse}
            onChange={selectCourse}
          />
          <GroupSelect
            label="Oddajesz – grupa"
            groups={groups}
            value={offeredGroupId}
            onChange={selectOfferedGroup}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className={rowLabelClass}>Chcesz</span>
        <div className="flex flex-col gap-2 sm:flex-row">
          {isSport ? (
            <CourseSelect
              label="Chcesz – zajęcia"
              value={wantedCourse}
              onChange={selectWantedCourse}
            />
          ) : (
            <div className={`${fieldClass} flex-1`}>
              {offeredCourse ? (
                <span
                  className="flex min-w-0 flex-col"
                  title={offeredCourse.name}
                >
                  <span className="truncate">{offeredCourse.name}</span>
                  <span className="truncate text-xs text-nav-muted">
                    {offeredCourse.id}
                  </span>
                </span>
              ) : (
                <span className="truncate text-nav-muted">
                  ten sam przedmiot co wyżej
                </span>
              )}
            </div>
          )}
          <GroupSelect
            label="Chcesz – grupa"
            groups={wantedGroups}
            value={wantedGroupId}
            onChange={setWantedGroupId}
          />
        </div>
      </div>

      <button
        type="submit"
        className={`min-h-10 cursor-pointer self-stretch rounded-md border-0 bg-[#9b1b30] px-5 text-sm font-semibold text-white hover:bg-[#7f1628] sm:self-end ${focusRing}`}
      >
        Dodaj ogłoszenie
      </button>

      {error && (
        <p className="m-0 text-sm font-semibold text-nav-accent" role="alert">
          {error}
        </p>
      )}

      {ready && !error && (
        <p className="m-0 text-sm text-nav-muted" role="status">
          Ogłoszenie dodane.
        </p>
      )}
    </form>
  );
}
