import { useState } from "react";
import { CourseSelect, type Course } from "@/components/CourseSelect";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-accent";

const fieldClass =
  "flex min-h-12 min-w-0 items-center gap-3 rounded-md border border-nav-border bg-[var(--bg)] px-4 py-2 text-base text-nav-fg";

const rowLabelClass =
  "text-xs font-semibold tracking-wide text-nav-muted uppercase";

// TODO: load class groups of the selected course once getCourseGroupsService is implemented.
function GroupSelect({ label }: { label: string }) {
  return (
    <select
      disabled
      aria-label={label}
      className={`${fieldClass} w-full cursor-not-allowed text-nav-muted sm:w-44`}
    >
      <option>Grupa – wkrótce</option>
    </select>
  );
}

export function OfferForm({ onCreated }: { onCreated?: () => void }) {
  const [offeredCourse, setOfferedCourse] = useState<Course | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!offeredCourse) {
      setError("Wybierz przedmiot.");
      setReady(false);
      return;
    }

    // Groups can only be swapped within the same course, so the wanted course is the offered one.
    const offer = {
      offeredCourseId: offeredCourse.id,
      wantedCourseId: offeredCourse.id,
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

      setOfferedCourse(null);
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
      className="flex flex-col gap-3"
    >
      <div className="flex flex-col gap-1.5">
        <span className={rowLabelClass}>Oddajesz</span>
        <div className="flex flex-col gap-2 sm:flex-row">
          <CourseSelect
            label="Oddajesz – przedmiot"
            value={offeredCourse}
            onChange={setOfferedCourse}
          />
          <GroupSelect label="Oddajesz – grupa" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className={rowLabelClass}>Chcesz</span>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className={`${fieldClass} flex-1`}>
            {offeredCourse ? (
              <span className="flex min-w-0 flex-col" title={offeredCourse.name}>
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
          <GroupSelect label="Chcesz – grupa" />
        </div>
      </div>

      <button
        type="submit"
        className={`mt-1 min-h-12 cursor-pointer self-stretch rounded-md border-0 bg-[#9b1b30] px-6 text-base font-semibold text-white hover:bg-[#7f1628] sm:self-end ${focusRing}`}
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
