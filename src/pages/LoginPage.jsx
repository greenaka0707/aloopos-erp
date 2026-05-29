import { useState } from "react";

import { useAuth } from "@/providers/AuthProvider";

import Button from "@/shared/components/common/Button";
import Input from "@/shared/components/common/Input";

export default function LoginPage() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const { error } = await login(email, password);

    if (error) {
      alert(error.message);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

        <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <Button type="submit">Login</Button>
      </form>
    </div>
  );
}
