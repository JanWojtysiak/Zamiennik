import { useState } from "react";
import { authClient, type User } from "@/lib/auth-client";
import { Logo } from "@/components/Logo";

const NAV_ITEMS = [
  { id: "pulpit", label: "Pulpit" },
  { id: "kursy", label: "Katalog kursów" },
  { id: "zamienniki", label: "Zamienniki" },
  { id: "wnioski", label: "Moje wnioski" },
];

const focusRing =
  "focus-visible:rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-accent";

export function Navbar({ user }: { user: User }) {
  const [active, setActive] = useState(NAV_ITEMS[0].id);
  const [menuOpen, setMenuOpen] = useState(false);
  const initials =
    `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  function navigate(id: string) {
    setActive(id);
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-21 w-full bg-nav-bg/88 font-roboto text-[15px] leading-snug text-nav-fg text-left shadow-[0_3px_6px_rgb(6_6_51_/_0.12)] backdrop-blur-md backdrop-saturate-150">
      <div className="flex h-16 items-center gap-10 px-[clamp(16px,3vw,40px)]">
        <a
          href="#pulpit"
          className={`flex shrink-0 items-center gap-3 no-underline text-inherit ${focusRing}`}
          onClick={() => navigate("pulpit")}
        >
          <Logo className="size-[38px] text-[#111111]" />
          <span className="flex flex-col leading-tight">
            <span className="text-lg font-bold tracking-tight">Zamiennik</span>
            <span className="text-xs text-nav-muted">
              Stworzony przez studenta
            </span>
            <span className="text-xs text-nav-muted">dla studentów</span>
          </span>
        </a>

        <button
          type="button"
          className={`ml-auto inline-flex size-10 items-center justify-center rounded-lg border-0 bg-transparent p-0 text-inherit lg:hidden hover:bg-nav-hover ${focusRing}`}
          aria-label={menuOpen ? "Zamknij menu" : "Otwórz menu"}
          aria-expanded={menuOpen}
          aria-controls="navbar-menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        <div
          id="navbar-menu"
          className={`${
            menuOpen ? "flex" : "hidden lg:flex"
          } min-w-0 flex-1 items-center justify-between gap-6 lg:h-full max-lg:absolute max-lg:inset-x-0 max-lg:top-full max-lg:h-auto max-lg:flex-col max-lg:items-stretch max-lg:gap-3 max-lg:border-t max-lg:border-nav-border max-lg:bg-nav-bg max-lg:px-[clamp(16px,3vw,40px)] max-lg:pt-2 max-lg:pb-4 max-lg:shadow-[0_6px_12px_rgb(6_6_51_/_0.12)]`}
        >
          <nav className="h-full max-lg:h-auto" aria-label="Główna nawigacja">
            <ul className="m-0 flex h-full list-none gap-1 p-0 max-lg:h-auto max-lg:flex-col max-lg:gap-0.5">
              {NAV_ITEMS.map((item) => (
                <li key={item.id} className="flex">
                  <a
                    href={`#${item.id}`}
                    className={`relative flex h-full items-center px-3.5 text-[13px] font-medium tracking-wider uppercase whitespace-nowrap no-underline transition-colors duration-200 text-nav-muted hover:text-nav-fg after:absolute after:inset-x-3.5 after:bottom-0 after:h-[3px] after:origin-center after:scale-x-0 after:rounded-t after:bg-nav-accent after:opacity-50 after:transition after:duration-200 hover:after:scale-x-[0.4] aria-[current=page]:text-nav-accent aria-[current=page]:after:scale-x-100 aria-[current=page]:after:opacity-100 max-lg:w-full max-lg:rounded-lg max-lg:px-4 max-lg:py-3 max-lg:hover:bg-nav-hover max-lg:after:inset-y-2.5 max-lg:after:left-0 max-lg:after:right-auto max-lg:after:h-auto max-lg:after:w-[3px] max-lg:after:rounded-none max-lg:after:rounded-r max-lg:after:scale-x-100 max-lg:after:scale-y-0 max-lg:hover:after:scale-y-0 max-lg:aria-[current=page]:bg-nav-accent-bg max-lg:aria-[current=page]:after:scale-y-100 ${focusRing}`}
                    aria-current={item.id === active ? "page" : undefined}
                    onClick={() => navigate(item.id)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex min-w-0 items-center gap-3 max-lg:border-t max-lg:border-nav-border max-lg:pt-3">
            <span
              className="grid size-9 shrink-0 place-items-center rounded-full bg-nav-accent-bg text-[13px] font-bold text-nav-accent"
              aria-hidden="true"
            >
              {initials}
            </span>
            <span className="flex min-w-0 max-w-[220px] flex-col max-lg:max-w-none max-lg:flex-1 lg:hidden xl:flex">
              <span className="truncate font-medium">
                {user.firstName} {user.lastName}
              </span>
              <span className="truncate text-xs text-nav-muted">
                {user.email}
              </span>
            </span>
            <button
              type="button"
              className={`inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-nav-border bg-transparent px-3.5 py-2 text-sm font-medium text-inherit transition-colors duration-200 hover:border-transparent hover:bg-nav-accent-bg hover:text-nav-accent ${focusRing}`}
              onClick={() => authClient.signOut()}
            >
              <LogoutIcon />
              <span>Wyloguj</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
