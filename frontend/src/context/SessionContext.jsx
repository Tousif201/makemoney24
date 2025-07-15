"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { jwtDecode } from "jwt-decode";
import { getUserProfile } from "../../api/auth"; // Adjust path if needed
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom

const SessionContext = createContext(null);

// Define a polling interval (e.g., every 5 minutes)
const POLLING_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Initialize useNavigate hook

  // useCallback to memoize the refreshSession function, preventing unnecessary re-renders
  // and ensuring it's stable across renders.
  const refreshSession = useCallback(async () => {
    setLoading(true); // Set loading to true while refreshing
    try {
      const token = localStorage.getItem("authToken");
      const isOnDashboardRoute =
        window.location.pathname.startsWith("/dashboard");

      if (!token) {
        setSession(null);
        setUser(null);
        // If no token, and on a dashboard route, terminate session and redirect
        if (isOnDashboardRoute) {
          alert("Your session has ended. Please log in again."); // Show alert
          navigate("/login"); // Navigate to login page
        }
        return;
      }

      const decoded = jwtDecode(token);

      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        console.warn("Token expired during refresh");
        localStorage.removeItem("authToken");
        setSession(null);
        setUser(null);
        // If token expired, and on a dashboard route, terminate session and redirect
        if (isOnDashboardRoute) {
          alert("Your session has expired. Please log in again."); // Show alert
          navigate("/login"); // Navigate to login page
        }
        return;
      }

      setSession(decoded); // Ensure session is up-to-date if token hasn't changed
      const userProfile = await getUserProfile(decoded.id);
      // console.log(userProfile,decoded.id,"context session")

      // Check if userProfile exists and if the account status is suspended
      if (userProfile && userProfile.accountStatus === "suspended") {
        console.warn("User account is suspended. Terminating session.");
        localStorage.removeItem("authToken"); // Remove token
        setSession(null); // Clear session
        setUser(null); // Clear user data
        alert("Your account has been suspended. You have been logged out."); // Show alert
        navigate("/login"); // Navigate to login page
        return; // Stop further processing
      }

      setUser(userProfile);
    } catch (err) {
      console.error("Error refreshing session:", err);
      const isOnDashboardRoute =
        window.location.pathname.startsWith("/dashboard");

      // If there's an error fetching user profile (e.g., token invalid on server)
      if (err.response && err.response.status === 401) {
        // Assuming 401 for unauthorized/invalid token
        console.warn(
          "Authentication error during session refresh. Terminating session."
        );
        localStorage.removeItem("authToken");
        setSession(null);
        setUser(null);
        if (isOnDashboardRoute) {
          alert("There was an issue with your session. Please log in again.");
          navigate("/login");
        }
      } else {
        setSession(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]); // Add navigate to the dependency array

  useEffect(() => {
    // Initial session load
    refreshSession();

    // Set up polling to refresh the session periodically
    const intervalId = setInterval(() => {
      refreshSession();
    }, POLLING_INTERVAL_MS);

    // Clean up the interval when the component unmounts or dependencies change
    return () => clearInterval(intervalId);
  }, [refreshSession]); // Dependency on refreshSession to ensure it runs on mount

  return (
    <SessionContext.Provider value={{ session,user, loading, refreshSession, }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
