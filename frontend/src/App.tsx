import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { AuthPage } from "@/components/AuthPage";
import { Dashboard } from "@/components/Dashboard";

function App() {
  const { data: session, isPending } = authClient.useSession();

  const [loadedOnce, setLoadedOnce] = useState(false);
  if (!isPending && !loadedOnce) setLoadedOnce(true);

  if (isPending && !loadedOnce) return <p>Ładowanie...</p>;
  if (!session) return <AuthPage />;
  return <Dashboard user={session.user} />;
}

export default App;
