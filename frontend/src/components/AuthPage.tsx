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
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

const fieldClass =
  "mt-1 w-full rounded border border-white/40 bg-white px-3 py-2 text-[15px] text-[#06022e] placeholder:text-[rgb(6_2_46_/_0.4)] " +
  focusRing;

const onPhoto =
  "[text-shadow:0_1px_2px_rgb(0_0_0_/_0.7),0_4px_18px_rgb(0_0_0_/_0.45)]";

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
    <div className="auth-campus flex min-h-svh flex-col text-left font-roboto text-[15px] leading-snug text-white [color-scheme:light]">
      <header className="w-full">
        <div className="flex h-16 items-center px-[clamp(16px,3vw,40px)]">
          <span className="flex items-center gap-3">
            <Logo className="size-[38px] text-white drop-shadow-[0_2px_6px_rgb(0_0_0_/_0.55)]" />
            <span className="flex flex-col leading-tight">
              <span
                className={`text-[20px] font-bold tracking-wide text-white ${onPhoto}`}
              >
                Zamiennik
              </span>
              <span className={`text-xs font-medium text-white/90 ${onPhoto}`}>
                Stworzony przez studenta dla studentów
              </span>
            </span>
          </span>
        </div>
      </header>

      <main className="flex flex-1 justify-center px-4 py-14">
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-[360px] flex-col gap-4 text-left"
        >
          <h1
            className={`font-bold ${onPhoto}`}
            style={{
              margin: 0,
              fontSize: 28,
              letterSpacing: "0.04em",
              color: "#fff",
              fontWeight: 700,
            }}
          >
            {mode === "signUp" ? "Rejestracja" : "Logowanie"}
          </h1>

          {mode === "signUp" && (
            <>
              <label className={`flex flex-col text-sm font-semibold ${onPhoto}`}>
                Imię
                <input
                  className={fieldClass}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                  required
                />
              </label>
              <label className={`flex flex-col text-sm font-semibold ${onPhoto}`}>
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

          <label className={`flex flex-col text-sm font-semibold ${onPhoto}`}>
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

          <label className={`flex flex-col text-sm font-semibold ${onPhoto}`}>
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
            <p
              className={`m-0 text-sm font-semibold text-[#ffb3be] ${onPhoto}`}
              role="alert"
            >
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
            className={`cursor-pointer self-start border-0 bg-transparent p-0 text-sm font-semibold text-white hover:underline ${onPhoto} ${focusRing}`}
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
