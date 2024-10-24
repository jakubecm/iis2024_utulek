import { jwtDecode } from "jwt-decode";
import React, { createContext, useContext, useState, useEffect } from "react";
import { DecodedJWT } from "./jwt";
import { API_URL } from "../App";

interface AuthContextType {
  role: number | null;
  isAuthenticated: boolean;
  refreshAuth: () => void;  // Add a function to refresh the authentication state
}

const AuthContext = createContext<AuthContextType>({
  role: null,
  isAuthenticated: false,
  refreshAuth: () => {},  // Placeholder function
});


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<number | null>(null);

  const fetchUserRole = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/role`, {
        method: "GET",
        credentials: "include",  // Include the HttpOnly cookies
      });

      if (response.ok) {
        const data = await response.json();
        setRole(data.role);  // Set the role in state
      } else {
        setRole(null);  // If not authenticated, set role to null
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      setRole(null);  // Clear role on error
    }

    console.log("role:", role);
  };

  // Function to manually refresh the auth context (can be used after login)
  const refreshAuth = () => {
    fetchUserRole();  // Fetch the user's role and update the context
  };

  // On initial load, refresh the auth context
  useEffect(() => {
    refreshAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ role, isAuthenticated: !!role, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
