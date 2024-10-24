import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { API_URL } from "../App";

const Logout: React.FC = () => {
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();  // You can use refreshAuth to reset the auth context after logout

  useEffect(() => {
    // Call the backend logout endpoint
    const handleLogout = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          credentials: "include",  // Include the cookies for logout
        });

        if (response.ok) {
          // Optionally clear local state or do something post-logout
          refreshAuth();  // Reset the auth context
          navigate("/");  // Redirect to the login page after logout
        } else {
          console.error("Logout failed");
        }
      } catch (error) {
        console.error("Error during logout:", error);
      }
    };

    handleLogout();  // Call the logout function when component mounts
  }, [navigate, refreshAuth]);

  return (
    <div>
      <p>Logging out...</p>
    </div>
  );
};

export default Logout;
