"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, Clock, AlertCircle, RefreshCw } from "lucide-react";

export default function CandidateAuthPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [blockInfo, setBlockInfo] = useState<any>(null); // ✅ Add this

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setBlockInfo(null); // ✅ Reset block info

    try {
      const url = isRegister
        ? "/api/candidate/auth/register"
        : "/api/candidate/auth/login";

      const body = isRegister ? { name, email, password } : { email, password };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        // ✅ Check if account is blocked
        if (data.error === "account_blocked") {
          setBlockInfo(data);
        } else {
          setError(
            data.error || (isRegister ? "Registration failed" : "Login failed")
          );
        }
        setLoading(false);
        return;
      }

      // ✅ for login, API returns token; for register, we directly login
      if (isRegister) {
        // after registration, auto-login
        const loginRes = await fetch("/api/candidate/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const loginData = await loginRes.json();

        if (!loginRes.ok) {
          // ✅ Check block on auto-login after registration
          if (loginData.error === "account_blocked") {
            setBlockInfo(loginData);
          } else {
            setError(loginData.error || "Login failed after registration");
          }
          setLoading(false);
          return;
        }

        localStorage.setItem("token", loginData.token);
      } else {
        localStorage.setItem("token", data.token);
      }

      router.push("/candidate/dashboard");
    } catch (err) {
      console.error("Auth error:", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 mx-4">
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">
          {isRegister ? "Candidate Register" : "Candidate Login"}
        </h1>
        <p className="mb-6 text-center text-sm text-gray-600">
          {isRegister ? "Create your account" : "Access your dashboard"}
        </p>

        {/* ✅ Block Message */}
        {blockInfo && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <Ban className="w-6 h-6 text-orange-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-bold text-orange-900 text-base mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Account Temporarily Blocked
                </h3>
                <p className="text-orange-800 text-sm mb-3 leading-relaxed">
                  {blockInfo.message}
                </p>

                <div className="bg-white rounded-lg p-3 mb-3 border border-orange-200">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-orange-700">
                      <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0"></div>
                      <p className="text-xs">
                        <strong>Reason:</strong> {blockInfo.reason}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-orange-700">
                      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                      <p className="text-xs">
                        <strong>Time remaining:</strong>{" "}
                        <span className="font-mono font-bold">
                          {blockInfo.timeRemaining?.hours}h{" "}
                          {blockInfo.timeRemaining?.minutes}m
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-100 rounded-lg p-2.5 border border-orange-200">
                  <p className="text-xs text-orange-800">
                    <strong>You can login again at:</strong>
                    <br />
                    <span className="font-mono text-xs">
                      {new Date(blockInfo.blockedUntil).toLocaleString(
                        "en-US",
                        {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Regular Error */}
        {error && !blockInfo && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="John Doe"
                required={isRegister}
                disabled={!!blockInfo}
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="your.email@example.com"
              required
              disabled={!!blockInfo}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="••••••••"
              required
              disabled={!!blockInfo}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !!blockInfo}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-white font-semibold transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                {isRegister ? "Registering..." : "Logging in..."}
              </span>
            ) : isRegister ? (
              "Register"
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* ✅ Show message when blocked */}
        {blockInfo && (
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-600">
              Please wait for the block period to end before trying again.
            </p>
          </div>
        )}

        {/* Toggle between login/register */}
        {!blockInfo && (
          <p className="mt-5 text-center text-sm text-gray-600">
            {isRegister ? "Already registered?" : "New candidate?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
                setBlockInfo(null);
              }}
              className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline transition"
            >
              {isRegister ? "Login here" : "Register here"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
