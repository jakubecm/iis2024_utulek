import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './common/home';
import Sidebar from './components/sidebar';
import { SidebarProvider } from './common/sidebarContext';
import AuthForm from './auth/AuthForm';
import { AuthProvider } from './auth/AuthContext';
import Logout from './auth/Logout';
import ProtectedRoute from './auth/ProtectedRoute';
import UsersDashboard from './admin/UsersDashboard';

export const API_URL = "http://127.0.0.1:5000";

function App() {

  return (
    <Router>
      <AuthProvider>
        <SidebarProvider>
          <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 p-4">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<AuthForm />} />
                <Route path="/logout" element={<Logout />} />

                {/* Protected routes */}
                <Route element={<ProtectedRoute requiredRole={0} />}>
                  <Route path="/admin/users" element={<UsersDashboard />} />
                </Route>
              </Routes>
            </div>
          </div>
        </SidebarProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;