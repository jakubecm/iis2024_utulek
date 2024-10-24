import React, { useEffect, useState } from "react";
import { Button, Input, Typography } from "@material-tailwind/react";
import { API_URL } from "../App";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const AuthForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [isRegistering, setIsRegistering] = useState(false); // Toggle between login/register
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // New state for success message
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();


  const handleRegister = async () => {
    const payload = {
      email,
      username,
      password,
      first_name: firstName,
      last_name: lastName,
    };

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (response.status === 201) {
        setSuccessMessage("Registration successful! Logging in...");
        setTimeout(() => {
          handleLogin();
        }, 2000); // Delay redirection to show the success message
      } else {
        const data = await response.json();
        setError(data.msg || "Registration failed");
      }
    } catch (err) {
      setError("Something went wrong");
    }
  };

  const handleLogin = async () => {
    const payload = {
      username,
      password,
    };

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        refreshAuth();
        navigate("/");  // Redirect to login page after success
        // Optionally handle token here if using local storage/cookies
      } else {
        const data = await response.json();
        setError(data.msg || "Login failed");
      }
    } catch (err) {
      setError("Something went wrong");
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);  // Reset error on submit

    if (isRegistering) {
      handleRegister();
    } else {
      handleLogin();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <Typography variant="h4" color="blue-gray" className="mb-4 text-center">
          {isRegistering ? "Register" : "Sign In"}
        </Typography>
        <form onSubmit={handleSubmit} className="space-y-6">
          {isRegistering && (
            <>
              <Input
                label="First Name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required={isRegistering}
              />
              <Input
                label="Last Name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required={isRegistering}
              />

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </>
          )}
          <Input
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required={isRegistering}
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full">
            {isRegistering ? "Register" : "Login"}
          </Button>
        </form>
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        {successMessage && <p className="text-green-500 text-center mt-4">{successMessage}</p>}
        <div className="text-center mt-4">
          <Button
            variant="text"
            className="text-blue-500"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(null); // Clear errors when switching
              setSuccessMessage(null); // Clear success message when switching
            }}
          >
            {isRegistering
              ? "Already have an account? Sign In"
              : "Don't have an account? Register"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
