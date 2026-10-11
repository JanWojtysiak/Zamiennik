import type { User } from "@/lib/auth-client";
import { Navbar } from "@/components/Navbar";

export function Dashboard({ user }: { user: User }) {
  return (
    <>
      <Navbar user={user} />
      <main>
        <h1>Dashboard</h1>
        <p>
          Witaj, {user.firstName} {user.lastName} ({user.email})
        </p>
      </main>
    </>
  );
}
