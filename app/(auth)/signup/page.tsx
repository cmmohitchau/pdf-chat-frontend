"use client"
import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, Layers } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setIsLoading(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/signup` , {
        method : 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body : JSON.stringify({ email , password , name})
      })
      const result = await response.json()

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl border border-black/10 p-10">

        <div className="w-9 h-9 bg-neutral-900 rounded-lg flex items-center justify-center mb-7">
          <Layers size={18} color="white" />
        </div>

        <h1 className="text-[22px] font-medium text-neutral-900 mb-1">Welcome back</h1>
        <p className="text-sm text-neutral-500 mb-8">Sign up to your account to continue</p>

        {error && (
          <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailSignUp} noValidate className="space-y-4">
          
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

          <div>
                <label htmlFor="name" className="block text-xs font-medium text-neutral-500 mb-1.5">
                Full Name
                </label>
                <div className="relative">
                <input
                    id="name"
                    type="text"
                    placeholder="Mohit Prasad Chaudhary"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-black/15 rounded-lg text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-black/30 focus:ring-2 focus:ring-black/5 transition disabled:opacity-50"
                />
                </div>
            </div>

          
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
                placeholder="Min 8 Characters"
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
            
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-neutral-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-neutral-700 active:scale-[0.99] transition disabled:opacity-60 cursor-pointer mt-2"
          >
            {isLoading ? "Creating account…" : "Sign up"}
          </button>
        </form>

        
      </div>
    </div>
  );
}
