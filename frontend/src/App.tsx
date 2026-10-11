import { authClient } from "@/lib/auth-client";
import { AuthPage } from "@/components/AuthPage";
import { Dashboard } from "@/components/Dashboard";

function App() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return <p>Ładowanie...</p>;
  if (!session) return <AuthPage />;
  return <Dashboard user={session.user} />;
}

export default App;
