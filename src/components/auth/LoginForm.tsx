import { useState } from "react";
import { loginUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";

export function LoginForm({
  switchToRegister,
  onClose,
}: {
  switchToRegister: () => void;
  onClose: () => void;
}) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ─── Normal Login ──────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await loginUser({ email, password });

      if (data?.token && data?.user) {
        login(data.user, data.token);
        onClose();
      } else {
        setError("Invalid email or password");
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Google Login ──────────────────────────────────────────────────────────
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const credential = credentialResponse.credential;
      if (!credential) return;

      // Decode Google JWT to extract name + email
      const payload = JSON.parse(atob(credential.split(".")[1]));

      // ✅ Send to backend — finds existing user or creates new one
      const res = await fetch("http://localhost:5000/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: payload.name, email: payload.email }),
      });

      const data = await res.json();

      if (data?.token && data?.user) {
        login(data.user, data.token);
        onClose();
      } else {
        setError("Google login failed. Try again.");
      }
    } catch {
      setError("Google login failed. Try again.");
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <h2 className="text-xl font-bold text-center">Login</h2>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      <Input
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </Button>

      <p className="text-center text-sm text-gray-500">OR</p>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError("Google login failed.")}
        />
      </div>

      <p className="text-center text-sm">
        No account?{" "}
        <button
          type="button"
          onClick={switchToRegister}
          className="text-blue-600 underline"
        >
          Register
        </button>
      </p>
    </form>
  );
}