import type { OfferCategory } from "@/components/OfferCard";

export interface Tab {
  path: string;
  label: string;
  heading: string;
  category: OfferCategory;
}

export const TABS: Tab[] = [
  {
    path: "/courses",
    label: "Przedmioty",
    heading: "Wymiany przedmiotów",
    category: "COURSE",
  },
  {
    path: "/sport",
    label: "WF i sport",
    heading: "Wymiany WF i sportu",
    category: "SPORT",
  },
];
