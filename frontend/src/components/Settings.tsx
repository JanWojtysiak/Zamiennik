import type { User } from "@/lib/auth-client";

export function Settings({ user }: { user: User }) {
  return (
    <main className="flex w-full flex-1 flex-col px-[clamp(16px,3vw,40px)] py-8 text-left font-roboto text-[15px] leading-snug">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6">
        <h1
          style={{
            margin: 0,
            fontSize: 28,
            letterSpacing: "-0.02em",
            color: "var(--nav-fg)",
          }}
        >
          Ustawienia konta
        </h1>

        <dl className="m-0 grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 rounded-md border border-nav-border bg-[var(--bg)] p-4">
          <dt className="text-nav-muted">Imię i nazwisko</dt>
          <dd className="m-0 font-medium text-nav-fg">
            {user.firstName} {user.lastName}
          </dd>
          <dt className="text-nav-muted">E-mail</dt>
          <dd className="m-0 font-medium break-all text-nav-fg">
            {user.email}
          </dd>
        </dl>
      </div>
    </main>
  );
}
