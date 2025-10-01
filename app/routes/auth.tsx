import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

export const meta = () => {
  return [
    { title: "Auth | Resumark" },
    { name: "description", content: "Login to your Resumark account" },
  ];
};

const Auth = () => {
  const { isLoading, auth, error, puterReady } = usePuterStore();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const next = searchParams.get("next") || "/";
  const action = searchParams.get("action"); // 'login' or 'logout'
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // If authenticated and trying to login, redirect
    if (auth.isAuthenticated && action !== "logout") {
      navigate(next);
    }
  }, [auth.isAuthenticated, action, navigate, next]);

  // Auto-logout if action=logout is in URL
  useEffect(() => {
    if (action === "logout" && auth.isAuthenticated && !processing) {
      handleSignOut();
    }
  }, [action, auth.isAuthenticated]);

  const handleSignIn = async () => {
    console.log("Login clicked");
    console.log("Puter ready:", puterReady);
    
    setProcessing(true);
    try {
      await auth.signIn();
      console.log("Sign in completed");
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleSignOut = async () => {
    console.log("Logout clicked");
    setProcessing(true);
    try {
      await auth.signOut();
      console.log("Sign out completed");
      // Redirect to login page after logout
      navigate("/auth?action=login");
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setProcessing(false);
    }
  };

  // Show logout confirmation if user is authenticated and action is logout
  const showLogout = auth.isAuthenticated && (action === "logout" || action === null);
  const showLogin = !auth.isAuthenticated || action === "login";

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <div className="gradient-border shadow-lg">
        <section className="flex flex-col gap-8 bg-white rounded-2xl p-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <h1>Welcome</h1>
            <h2>
              {showLogout 
                ? "Sign out of your Resumark account"
                : "Login to your Resumark account to continue your job journey"
              }
            </h2>
            {error && (
              <p className="text-red-600 text-sm">Error: {error}</p>
            )}
            {!puterReady && (
              <p className="text-yellow-600 text-sm">Waiting for Puter.js to load...</p>
            )}
          </div>
          <div>
            {isLoading || processing ? (
              <button
                className="auth-button animate-pulse"
                type="button"
                disabled
              >
                <p>{processing ? (showLogout ? "Signing you out..." : "Opening sign in...") : "Loading..."}</p>
              </button>
            ) : showLogout ? (
              <button
                type="button"
                className="auth-button"
                onClick={handleSignOut}
              >
                <p>Sign Out</p>
              </button>
            ) : (
              <button
                type="button"
                className="auth-button"
                onClick={handleSignIn}
                disabled={!puterReady}
              >
                <p>Log In</p>
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default Auth;