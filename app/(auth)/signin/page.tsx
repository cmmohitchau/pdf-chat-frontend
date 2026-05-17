"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Lock, Mail, Layers } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/signin` , {
        method : 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body : JSON.stringify({ email , password})
      })
      const result = await response.json()
      console.log(result);

      if (result?.error) {
        setError("Invalid email or password.");
      } else {
        window.location.href = "/chat";
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn("google", { callbackUrl: "/chat" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl border border-black/10 p-10">

        {/* Logo */}
        <div className="w-9 h-9 bg-neutral-900 rounded-lg flex items-center justify-center mb-7">
          <Layers size={18} color="white" />
        </div>

        <h1 className="text-[22px] font-medium text-neutral-900 mb-1">Welcome back</h1>
        <p className="text-sm text-neutral-500 mb-8">Sign in to your account to continue</p>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailSignIn} noValidate className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-neutral-500 mb-1.5">
              Email address
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-black/15 rounded-lg text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-black/30 focus:ring-2 focus:ring-black/5 transition disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-neutral-500 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full pl-9 pr-10 py-2.5 text-sm bg-white border border-black/15 rounded-lg text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-black/30 focus:ring-2 focus:ring-black/5 transition disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <div className="flex justify-end mt-1.5">
              <a href="/forgot-password" className="text-xs text-neutral-500 hover:text-neutral-900 transition">
                Forgot password?
              </a>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-neutral-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-neutral-700 active:scale-[0.99] transition disabled:opacity-60 cursor-pointer mt-2"
          >
            {isLoading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-black/8" />
          <span className="text-xs text-neutral-400">or</span>
          <div className="flex-1 h-px bg-black/8" />
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2.5 border border-black/15 rounded-lg py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50 active:scale-[0.99] transition disabled:opacity-60 cursor-pointer"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        {/* Sign up */}
        <p className="text-center text-sm text-neutral-500 mt-6">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-neutral-900 font-medium hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}