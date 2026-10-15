import { useEffect, useState } from "react";
import type { User } from "@/lib/auth-client";
import { Navbar } from "@/components/Navbar";
import { OfferFilters, type OfferFilterId } from "@/components/OfferFilters";
import { OfferForm } from "@/components/OfferForm";

export function Dashboard({ user }: { user: User }) {
  const [offers, setOffers] = useState<any[]>([]);
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
    async function loadOffers() {
      try {
        const response = await fetch("/api/offers", {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
          const error = await response.json().catch(() => null);
          throw new Error(
            error?.message || "Wystąpił błąd podczas ładowania ogłoszeń",
          );
        }

        const data = await response.json();
        setOffers(data);
      } catch (error) {
        console.error(error instanceof Error ? error.message : "Wystąpił błąd");
      }
    }

    loadOffers();
  }, []);

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
            <OfferForm />
            <OfferFilters active={activeFilters} onToggle={toggleFilter} />
          </div>

          <section aria-label="...">
            {offers.length === 0 ? (
              <p>Brak ogłoszeń.</p>
            ) : (
              <ul>
                {offers.map((offer) => (
                  <li key={offer.id}>{/* jedno ogłoszenie */}</li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
