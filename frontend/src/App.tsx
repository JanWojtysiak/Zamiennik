import { useState } from "react";
import { Navigate, Route, Routes } from "react-router";
import { authClient } from "@/lib/auth-client";
import { TABS } from "@/lib/tabs";
import { AuthPage } from "@/components/AuthPage";
import { Dashboard } from "@/components/Dashboard";
import { Navbar } from "@/components/Navbar";

function App() {
  const { data: session, isPending } = authClient.useSession();

  const [loadedOnce, setLoadedOnce] = useState(false);
  if (!isPending && !loadedOnce) setLoadedOnce(true);

  if (isPending && !loadedOnce) return <p>Ładowanie...</p>;
  if (!session) return <AuthPage />;

  return (
    <>
      <Navbar user={session.user} />
      <Routes>
        {TABS.map((tab) => (
          <Route
            key={tab.path}
            path={tab.path}
            element={
              <Dashboard
                key={tab.path}
                user={session.user}
                category={tab.category}
                heading={tab.heading}
              />
            }
          />
        ))}
        <Route path="*" element={<Navigate to={TABS[0].path} replace />} />
      </Routes>
    </>
  );
}

export default App;
