import { useState } from "react";
import { authClient } from "@/lib/auth-client";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await authClient.signUp.email({ email, password, name });
    if (error) alert(error.message);
    else alert("Konto utworzone");
  }

  return (
    <form onSubmit={handleSignUp}>
      <input
        placeholder="Imię"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Hasło"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Zarejestruj</button>
    </form>
  );
}

export default App;
