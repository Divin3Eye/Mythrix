"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/Logo";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  function sanitizeAuthError(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes("invalid login credentials")) return "Invalid email or password.";
    if (lower.includes("email not confirmed")) return "Please confirm your email before signing in.";
    if (lower.includes("user already registered")) return "An account with this email already exists.";
    if (lower.includes("rate limit")) return "Too many attempts. Please try again later.";
    if (lower.includes("weak")) return "Password is too weak. Use at least 8 characters with a mix of letters, numbers, and symbols.";
    return "Registration failed. Please try again.";
  }

  function validateForm(): boolean {
    const errors: Record<string, string> = {};
    if (username.length < 3) errors.username = "Username must be at least 3 characters.";
    if (username.length > 30) errors.username = "Username must be at most 30 characters.";
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) errors.username = "Username can only contain letters, numbers, hyphens, and underscores.";
    if (password.length < 8) errors.password = "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(password)) errors.password = "Password must contain at least one uppercase letter.";
    if (!/[0-9]/.test(password)) errors.password = "Password must contain at least one number.";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setValidationErrors({});

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(sanitizeAuthError(error.message));
      setLoading(false);
      return;
    }

    // If session exists immediately (email confirmation disabled), redirect
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setSuccess("Check your email for a confirmation link.");
    setLoading(false);
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="auth-page">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="auth-container">
        {/* Left — Visual Panel */}
        <div className="auth-visual-panel">
          <div className="visual-content">
            <div className="visual-orb visual-orb-1" />
            <div className="visual-orb visual-orb-2" />
            <div className="visual-orb visual-orb-3" />

            <Logo size={80} className="visual-logo" />

            <div className="visual-bottom">
              <p className="visual-label">Start your journey</p>
              <h2 className="visual-heading">
                Create your account and unlock your research workspace
              </h2>
            </div>
          </div>
        </div>

        {/* Right — Form Panel */}
        <div className="auth-form-panel">
          <div className="auth-form-inner">
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">
              Sign up to start your research workflow
            </p>

            {error && <div className="auth-error" role="alert">{error}</div>}
            {success && <div className="auth-success" role="status">{success}</div>}

            <form onSubmit={handleSignup} className="auth-form">
              <div className="input-group">
                <label className="input-label">Username</label>
                <input
                  type="text"
                  placeholder="Your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  maxLength={30}
                  pattern="^[a-zA-Z0-9_-]+$"
                  className={`auth-input ${validationErrors.username ? "input-error" : ""}`}
                  autoComplete="username"
                />
                {validationErrors.username && (
                  <span className="field-error" role="alert">{validationErrors.username}</span>
                )}
              </div>

              <div className="input-group">
                <label className="input-label">Your email</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="auth-input"
                  autoComplete="email"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className={`auth-input ${validationErrors.password ? "input-error" : ""}`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {validationErrors.password && (
                  <span className="field-error" role="alert">{validationErrors.password}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-button"
              >
                {loading ? (
                  <span className="button-loader" />
                ) : (
                  <>
                    Sign Up
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>or continue with</span>
            </div>

            <div className="social-buttons">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="social-button"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button type="button" className="social-button" aria-label="Sign up with LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                </svg>
              </button>
              <button type="button" className="social-button" aria-label="Sign up with Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </button>
            </div>

            <p className="auth-footer">
              Already have an account?{" "}
              <Link href="/login" className="auth-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
