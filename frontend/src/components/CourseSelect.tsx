import { useEffect, useId, useState } from "react";

export interface Course {
  id: string;
  name: string;
}

interface CourseSearchResult {
  courses: Course[];
  nextPage: boolean;
}

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-accent";

const fieldClass =
  "relative flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-md border border-nav-border bg-[var(--bg)] px-4 py-2 text-base text-nav-fg";

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 300;

async function fetchCourses(name: string, page: number) {
  const params = new URLSearchParams({ name, page: String(page) });
  const response = await fetch(`/api/courses/search?${params}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Błąd sieci");
  }

  return (await response.json()) as CourseSearchResult;
}

export function CourseSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Course | null;
  onChange: (course: Course | null) => void;
}) {
  const listId = useId();
  const [query, setQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [page, setPage] = useState(0);
  const [nextPage, setNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const trimmed = query.trim();

  useEffect(() => {
    if (trimmed.length < MIN_QUERY_LENGTH) return;

    let cancelled = false;
    const timeout = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCourses(trimmed, 0);
        if (cancelled) return;
        setCourses(data.courses);
        setNextPage(data.nextPage);
        setPage(0);
      } catch {
        if (!cancelled) setError("Nie udało się wyszukać przedmiotów.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [trimmed]);

  async function loadMore() {
    setLoading(true);
    try {
      const data = await fetchCourses(trimmed, page + 1);
      setCourses((current) => [...current, ...data.courses]);
      setNextPage(data.nextPage);
      setPage(page + 1);
    } catch {
      setError("Nie udało się wyszukać przedmiotów.");
    } finally {
      setLoading(false);
    }
  }

  function select(course: Course) {
    onChange(course);
    setQuery("");
    setOpen(false);
  }

  if (value) {
    return (
      <div className={fieldClass}>
        <span className="flex min-w-0 flex-1 flex-col" title={value.name}>
          <span className="truncate">{value.name}</span>
          <span className="truncate text-xs text-nav-muted">{value.id}</span>
        </span>
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label={`Wyczyść: ${label}`}
          className={`shrink-0 cursor-pointer border-0 bg-transparent p-0 text-nav-muted hover:text-nav-fg ${focusRing}`}
        >
          ✕
        </button>
      </div>
    );
  }

  const showList = open && trimmed.length >= MIN_QUERY_LENGTH;

  return (
    <div className={fieldClass}>
      <input
        aria-label={label}
        className={`min-w-0 flex-1 border-0 bg-transparent p-0 text-base text-nav-fg outline-none placeholder:text-nav-muted ${focusRing}`}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        placeholder="szukaj przedmiotu"
        autoComplete="off"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
      />

      {showList && (
        <ul
          id={listId}
          role="listbox"
          // Prevent input blur so clicks on options register.
          onMouseDown={(e) => e.preventDefault()}
          className="absolute top-full right-0 left-0 z-10 m-0 mt-1 max-h-64 list-none overflow-y-auto rounded border border-nav-border bg-[var(--bg)] p-1 shadow-lg"
        >
          {courses.map((course) => (
            <li key={course.id} role="option" aria-selected={false}>
              <button
                type="button"
                onClick={() => select(course)}
                className={`w-full cursor-pointer rounded border-0 bg-transparent px-2 py-1.5 text-left text-sm text-nav-fg hover:bg-nav-border ${focusRing}`}
              >
                {course.name}
                <span className="ml-2 text-xs text-nav-muted">{course.id}</span>
              </button>
            </li>
          ))}

          {loading && (
            <li className="px-2 py-1.5 text-sm text-nav-muted">Szukam…</li>
          )}

          {!loading && error && (
            <li className="px-2 py-1.5 text-sm text-nav-accent">{error}</li>
          )}

          {!loading && !error && courses.length === 0 && (
            <li className="px-2 py-1.5 text-sm text-nav-muted">
              Brak wyników.
            </li>
          )}

          {!loading && nextPage && (
            <li>
              <button
                type="button"
                onClick={loadMore}
                className={`w-full cursor-pointer rounded border-0 bg-transparent px-2 py-1.5 text-left text-sm font-semibold text-nav-accent hover:bg-nav-border ${focusRing}`}
              >
                Pokaż więcej
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
