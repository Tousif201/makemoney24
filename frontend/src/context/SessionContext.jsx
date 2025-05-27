import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { getUserProfile } from "../../api/auth"; // Adjust path if needed

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const token = localStorage.getItem("authToken");

        if (!token) {
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }

        const decoded = jwtDecode(token);

        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
          console.warn("Token expired");
          localStorage.removeItem("authToken");
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }

        setSession(decoded);

        const userProfile = await getUserProfile(decoded.id);
        setUser(userProfile);
      } catch (err) {
        console.error("Session error:", err);
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, []);

  return (
    <SessionContext.Provider value={{ session, user, loading }}>
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
