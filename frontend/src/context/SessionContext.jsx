import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react"; // Added useCallback
import { jwtDecode } from "jwt-decode";
import { getUserProfile } from "../../api/auth"; // Adjust path if needed

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // useCallback to memoize the refreshSession function, preventing unnecessary re-renders
  // and ensuring it's stable across renders.
  const refreshSession = useCallback(async () => {
    setLoading(true); // Set loading to true while refreshing
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        setSession(null);
        setUser(null);
        return;
      }

      const decoded = jwtDecode(token);

      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        console.warn("Token expired during refresh");
        localStorage.removeItem("authToken");
        setSession(null);
        setUser(null);
        return;
      }

      setSession(decoded); // Ensure session is up-to-date if token hasn't changed
      const userProfile = await getUserProfile(decoded.id);
      setUser(userProfile);
    } catch (err) {
      console.error("Error refreshing session:", err);
      setSession(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array means this function is created once

  useEffect(() => {
    // Initial session load
    refreshSession();
  }, [refreshSession]); // Dependency on refreshSession to ensure it runs on mount

  return (
    <SessionContext.Provider value={{ session, user, loading, refreshSession }}>
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
