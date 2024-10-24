import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Home from './common/home';
import Sidebar from './components/sidebar';
import { SidebarProvider } from './common/sidebarContext';
import Login from './common/login';
import AuthForm from './auth/AuthForm';
import { AuthProvider } from './auth/AuthContext';
import Logout from './auth/Logout';

export const API_URL = "http://127.0.0.1:5000";

function App() {
  // useEffect(() => {
  //   // Fetch the user's role from backend or get it from login response
  //   fetch('http://127.0.0.1:5000/auth/login', {
  //     method: 'POST',
  //     body: JSON.stringify({
  //       "password": "string",
  //       "username": "string"
  //     }),
  //     headers: { 'Content-Type': 'application/json' },
  //     credentials: 'include'  // Include cookies in the request
  //   }).then(response => {
  //     console.log(response);
  //     console.log(response.json());
  //   });
  // }, []);

  return (
    <AuthProvider>
      <SidebarProvider>
        <Router>
          <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 p-4">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<AuthForm />} />
                <Route path="/logout" element={<Logout/>} />
              </Routes>
            </div>
          </div>
        </Router>
      </SidebarProvider>
    </AuthProvider>
  );
}

export default App;