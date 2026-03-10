import { useState } from "react";
import { registerUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/context/AuthContext";

export function RegisterForm({
  switchToLogin,
  onClose,
}: {
  switchToLogin: () => void;
  onClose: () => void;
}) {
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ─── Normal Register ───────────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await registerUser({ name, email, password });

      if (data?.token && data?.user) {
        // ✅ Saves token + user + userId to localStorage via AuthContext
        login(data.user, data.token);
        onClose();
      } else {
        setError(data?.message || "Registration failed");
      }
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Google Register ───────────────────────────────────────────────────────
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const credential = credentialResponse.credential;
      if (!credential) return;

      // Decode Google JWT to extract name + email
      const payload = JSON.parse(atob(credential.split(".")[1]));

      // ✅ Send to backend — creates user in MongoDB if new, finds if existing
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
        setError("Google sign-up failed. Try again.");
      }
    } catch {
      setError("Google sign-up failed. Try again.");
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-0 top-0 text-xl px-2 hover:text-red-500"
      >
        ×
      </button>

      <form onSubmit={handleRegister} className="space-y-4">
        <h2 className="text-xl font-bold text-center">Create Account</h2>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <Input
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          type="email"
          placeholder="Email"
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
          {loading ? "Creating account..." : "Register"}
        </Button>

        <p className="text-center text-sm text-gray-500">OR</p>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google sign-up failed.")}
          />
        </div>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <button
            type="button"
            onClick={switchToLogin}
            className="text-blue-600 underline"
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
}