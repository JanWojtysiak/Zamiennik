import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Logo } from "@/components/Logo";

type Mode = "signIn" | "signUp";

const errorMessages: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Nieprawidłowy email lub hasło",
  USER_ALREADY_EXISTS: "Konto z tym adresem email już istnieje",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    "Konto z tym adresem email już istnieje",
  PASSWORD_TOO_SHORT: "Hasło musi mieć co najmniej 8 znaków",
  PASSWORD_TOO_LONG: "Hasło jest za długie",
  INVALID_EMAIL: "Nieprawidłowy adres email",
};

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-accent";

const fieldClass =
  "mt-1 w-full rounded border border-nav-border bg-[var(--bg)] px-3 py-2 text-[15px] text-nav-fg placeholder:text-nav-muted " +
  focusRing;

export function AuthPage() {
  const [mode, setMode] = useState<Mode>("signIn");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } =
      mode === "signUp"
        ? await authClient.signUp.email({
            email,
            password,
            name: `${firstName} ${lastName}`,
            firstName,
            lastName,
          })
        : await authClient.signIn.email({ email, password });

    setLoading(false);
    if (error) {
      setError(
        errorMessages[error.code ?? ""] ??
          error.message ??
          "Coś poszło nie tak",
      );
    }
  }

  function switchMode() {
    setMode(mode === "signUp" ? "signIn" : "signUp");
    setError(null);
  }

  return (
    <div className="flex min-h-svh flex-col bg-[var(--bg)] text-left font-roboto text-[15px] leading-snug text-nav-fg">
      <header className="w-full bg-nav-bg/88 text-nav-fg shadow-[0_3px_6px_rgb(6_6_51_/_0.12)] backdrop-blur-md backdrop-saturate-150">
        <div className="flex h-16 items-center px-[clamp(16px,3vw,40px)]">
          <span className="flex items-center gap-3">
            <Logo className="size-[38px] text-[#111111]" />
            <span className="flex flex-col leading-tight">
              <span className="text-[20px] font-bold tracking-tight">
                Zamiennik
              </span>
              <span className="text-xs font-medium text-nav-muted">
                Stworzony przez studenta dla studentów
              </span>
            </span>
          </span>
        </div>
      </header>

      <main className="flex flex-1 justify-center px-[clamp(16px,3vw,40px)] py-10">
        <form
          onSubmit={handleSubmit}
          className="flex h-fit w-full max-w-[400px] flex-col gap-4 rounded-lg border border-nav-border bg-[var(--bg)] px-6 py-7 text-left shadow-[0_3px_6px_rgb(6_6_51_/_0.12)]"
        >
          <h1
            className="border-b-[3px] border-nav-accent pb-2 font-bold text-nav-fg"
            style={{
              margin: 0,
              fontSize: 28,
              letterSpacing: "-0.02em",
              fontWeight: 700,
            }}
          >
            {mode === "signUp" ? "Rejestracja" : "Logowanie"}
          </h1>

          {mode === "signUp" && (
            <>
              <label className="flex flex-col text-sm font-semibold text-nav-muted">
                Imię
                <input
                  className={fieldClass}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                  required
                />
              </label>
              <label className="flex flex-col text-sm font-semibold text-nav-muted">
                Nazwisko
                <input
                  className={fieldClass}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                  required
                />
              </label>
            </>
          )}

          <label className="flex flex-col text-sm font-semibold text-nav-muted">
            Adres e-mail (@pwr.edu.pl)
            <input
              className={fieldClass}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label className="flex flex-col text-sm font-semibold text-nav-muted">
            Hasło
            <input
              className={fieldClass}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={
                mode === "signUp" ? "new-password" : "current-password"
              }
              required
            />
          </label>

          {error && (
            <p className="m-0 text-sm font-semibold text-nav-accent" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`mt-1 w-fit cursor-pointer rounded border-0 bg-[#9b1b30] px-5 py-2 text-sm font-semibold text-white hover:bg-[#7f1628] disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
          >
            {loading
              ? "Proszę czekać…"
              : mode === "signUp"
                ? "Zarejestruj się"
                : "Zaloguj się"}
          </button>

          <button
            type="button"
            onClick={switchMode}
            className={`cursor-pointer self-start border-0 bg-transparent p-0 text-sm font-semibold text-nav-accent hover:underline ${focusRing}`}
          >
            {mode === "signUp"
              ? "Masz już konto? Zaloguj się"
              : "Nie masz konta? Zarejestruj się"}
          </button>
        </form>
      </main>
    </div>
  );
}
