import React, { createContext, useContext, useState, useEffect } from "react";
import { API_URL } from "../App";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  role: number | null;
  userId: number | null,
  isAuthenticated: boolean;
  refreshAuth: () => void;  // Add a function to refresh the authentication state
}

const AuthContext = createContext<AuthContextType>({
  role: null,
  userId: null,
  isAuthenticated: false,
  refreshAuth: () => {},  // Placeholder function
});


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true); // New loading state
  const navigate = useNavigate();


  const fetchUserRole = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/role`, {
        method: "GET",
        credentials: "include",  // Include the HttpOnly cookies
      });

      if (response.ok) {
        const data = await response.json();
        if (data.expires_at) {
          setLogoutTimeout(data.expires_at);  // Set the logout timeout
        }

        setRole(data.role);  // Set the user role

        if (data.user_id) {
          setUserId(data.user_id);  // Set the user ID
        }
      } else {
        setRole(null);  // If not authenticated, set role to null
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      setRole(null);  // Clear role on error
    } finally {
      setLoading(false); // Indicate loading is complete
    }
  };

  const setLogoutTimeout = (expiresAt: number) => {
    const expirationTime = expiresAt * 1000; // convert to milliseconds
    const timeUntilExpiration = expirationTime - Date.now();

    if (timeUntilExpiration > 0) {
      setTimeout(() => navigate("/logout"), timeUntilExpiration);
    }
  };


  const refreshAuth = () => {
    setLoading(true); // Reset loading state when refreshing
    fetchUserRole();
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const isAuthenticated = role != null && role != -1;  // Check if the user is authenticated

  const contextValue = React.useMemo(() => ({ role, isAuthenticated, refreshAuth, userId }), [role, isAuthenticated]);

  if (loading) return null; // Wait until loading is done before rendering children
  // console.log("isAuthenticated:", isAuthenticated);
  // console.log("role:", role);


  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
