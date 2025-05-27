import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { getUserProfile } from "../../api/auth";

export function useSession() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null); // Store full user profile
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

        // ✅ Important: Pass { userId } to getUserProfile
        const userProfile = await getUserProfile(decoded.id );
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

  return { session, user, loading };
}
