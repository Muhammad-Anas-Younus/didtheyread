import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import "./App.css";

export default function App() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  async function loginWithGoogle() {
    setIsLoggingIn(true);
    try {
      // Send message to background script to handle auth
      const response = await chrome.runtime.sendMessage({
        type: "GOOGLE_AUTH",
      });

      if (response.success && response.idToken) {
        // Use the ID token to sign in with Supabase
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: response.idToken,
        });

        if (error) {
          console.error("Supabase auth error:", error);
          alert("Authentication failed: " + error.message);
        } else {
          console.log("Authentication successful:", data);
          setUser(data.user);
          
          // Store session in Chrome storage for content script access
          if (data.session) {
            await chrome.storage.local.set({
              'supabase_session': data.session
            });
            console.log("Session stored in Chrome storage");
          }
          
          alert("Successfully logged in!");
        }
      } else {
        console.error("Auth failed:", response.error);
        alert("Authentication failed: " + response.error);
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      alert("Authentication error: " + (error as Error).message);
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error);
    } else {
      setUser(null);
      alert("Successfully logged out!");
    }
  }

  const checkIfUserIsLoggedIn = async () => {
    setIsLoading(true);
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      setUser(data.user);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkIfUserIsLoggedIn();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "300px",
        padding: "20px",
        gap: "10px",
      }}
    >
      {isLoading ? (
        <p>Loading...</p>
      ) : user ? (
        <div style={{ textAlign: "center" }}>
          <p>Welcome, {user.email}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button onClick={loginWithGoogle} disabled={isLoggingIn}>
            {isLoggingIn ? "Logging in..." : "Login with Google"}
          </button>
        </div>
      )}
    </div>
  );
}
