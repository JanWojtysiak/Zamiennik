import { useState } from "react";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-accent";

const fieldClass =
  "flex min-w-0 flex-1 items-center gap-2 rounded border border-nav-border bg-[var(--bg)] px-3 py-1.5 text-sm text-nav-fg";

export function OfferForm() {
  const [offeredCourseId, setOfferedCourseId] = useState("");
  const [wantedCourseId, setWantedCourseId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const offer = {
      offeredCourseId: offeredCourseId.trim(),
      wantedCourseId: wantedCourseId.trim(),
    };

    if (!offer.offeredCourseId || !offer.wantedCourseId) {
      setError("Uzupełnij oba identyfikatory przedmiotów.");
      setReady(false);
      return;
    }

    if (offer.offeredCourseId === offer.wantedCourseId) {
      setError("Wybierz dwa różne przedmioty.");
      setReady(false);
      return;
    }

    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/offer`, {
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

      setOfferedCourseId("");
      setWantedCourseId("");
      setReady(true);
    } catch {
      setError("Wystąpił błąd podczas tworzenia ogłoszenia.");
      setReady(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Nowe ogłoszenie wymiany"
      className="flex flex-col gap-2"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className={fieldClass}>
          <span className="shrink-0 text-nav-muted">Oddajesz</span>
          <input
            className={`min-w-0 flex-1 border-0 bg-transparent p-0 text-[15px] text-nav-fg outline-none placeholder:text-nav-muted ${focusRing}`}
            name="offeredCourseId"
            value={offeredCourseId}
            onChange={(e) => setOfferedCourseId(e.target.value)}
            placeholder="id przedmiotu"
            autoComplete="off"
            required
          />
        </label>

        <span className="hidden text-nav-muted sm:inline" aria-hidden="true">
          →
        </span>

        <label className={fieldClass}>
          <span className="shrink-0 text-nav-muted">Chcesz</span>
          <input
            className={`min-w-0 flex-1 border-0 bg-transparent p-0 text-[15px] text-nav-fg outline-none placeholder:text-nav-muted ${focusRing}`}
            name="wantedCourseId"
            value={wantedCourseId}
            onChange={(e) => setWantedCourseId(e.target.value)}
            placeholder="id przedmiotu"
            autoComplete="off"
            required
          />
        </label>

        <button
          type="submit"
          className={`shrink-0 cursor-pointer rounded border-0 bg-[#9b1b30] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#7f1628] ${focusRing}`}
        >
          Dodaj
        </button>
      </div>

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
