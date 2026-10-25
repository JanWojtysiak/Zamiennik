import { useEffect, useState } from "react";
import type { User } from "@/lib/auth-client";
import { Navbar } from "@/components/Navbar";
import { OfferFilters, type OfferFilterId } from "@/components/OfferFilters";
import { OfferCard, type Offer } from "@/components/OfferCard";
import { OfferForm } from "@/components/OfferForm";

export function Dashboard({ user }: { user: User }) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [activeFilters, setActiveFilters] = useState<Set<OfferFilterId>>(
    () => new Set(),
  );
  const mineOnly = activeFilters.has("mine");

  function toggleFilter(id: OfferFilterId, checked: boolean) {
    setActiveFilters((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  useEffect(() => {
    let cancelled = false;

    async function loadOffers() {
      try {
        const response = await fetch(
          mineOnly ? "/api/offers/mine" : "/api/offers",
          { credentials: "include" },
        );
        if (!response.ok) {
          throw new Error(`status ${response.status}`);
        }

        const data = (await response.json()) as Offer[];
        if (cancelled) return;
        setOffers(data);
        setError(null);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Nie udało się załadować ogłoszeń.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadOffers();
    return () => {
      cancelled = true;
    };
  }, [mineOnly, reloadKey]);

  function reloadOffers() {
    setLoading(true);
    setReloadKey((key) => key + 1);
  }

  function toggleFilterAndReload(id: OfferFilterId, checked: boolean) {
    setLoading(true);
    toggleFilter(id, checked);
  }

  let content;
  if (loading && offers.length === 0) {
    content = <p className="m-0 text-nav-muted">Ładowanie ogłoszeń…</p>;
  } else if (error) {
    content = (
      <div className="flex flex-wrap items-center gap-3" role="alert">
        <p className="m-0 font-semibold text-nav-accent">{error}</p>
        <button
          type="button"
          onClick={reloadOffers}
          className="cursor-pointer rounded-md border border-nav-border bg-transparent px-3 py-1.5 text-sm font-semibold text-nav-fg hover:bg-nav-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-accent"
        >
          Spróbuj ponownie
        </button>
      </div>
    );
  } else if (offers.length === 0) {
    content = (
      <p className="m-0 text-nav-muted">
        {mineOnly ? "Nie masz jeszcze żadnych ogłoszeń." : "Brak ogłoszeń."}
      </p>
    );
  } else {
    content = (
      <ul
        className={`m-0 flex list-none flex-col gap-3 p-0 transition-opacity ${loading ? "opacity-60" : ""}`}
        aria-busy={loading}
      >
        {offers.map((offer) => (
          <li key={offer.id}>
            <OfferCard offer={offer} mine={offer.createdById === user.id} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <>
      <Navbar user={user} />
      <main
        id="ogloszenia"
        className="flex w-full flex-1 flex-col px-[clamp(16px,3vw,40px)] py-8 text-left font-roboto text-[15px] leading-snug"
      >
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6">
          <div className="flex flex-col gap-4">
            <h1
              style={{
                margin: 0,
                fontSize: 28,
                letterSpacing: "-0.02em",
                color: "var(--nav-fg)",
              }}
            >
              Ogłoszenia
            </h1>
            <OfferForm onCreated={reloadOffers} />
            <OfferFilters
              active={activeFilters}
              onToggle={toggleFilterAndReload}
            />
          </div>

          <section aria-label="Lista ogłoszeń">{content}</section>
        </div>
      </main>
    </>
  );
}
