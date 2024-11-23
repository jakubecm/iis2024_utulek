import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './common/home';
import Sidebar from './components/sidebar';
import { SidebarProvider } from './common/sidebarContext';
import AuthForm from './auth/AuthForm';
import { AuthProvider } from './auth/AuthContext';
import Logout from './auth/Logout';
import ProtectedRoute from './auth/ProtectedRoute';
import UsersDashboard from './admin/UsersDashboard';
import SpeciesDashboard from './caregiver/SpeciesDashboard';
import HealthRecords from './vets/HealthRecords';
import { Role } from './auth/jwt';
import ReservationRequests from './caregiver/ReservationRequests';
import ExaminationRequests from './caregiver/ExaminationRequests';
import VolunteerDashboard from './caregiver/VolunteerDashboard';
import WalkReservations from './volunteer/WalkReservations';
import WalkHistory from './caregiver/WalkHistory';
import WalkHistoryVolunteer from './volunteer/WalkHistoryVolunteer';
import Forbidden from './volunteer/Forbidden';

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
                <Route element={<ProtectedRoute requiredRoles={[Role.ADMIN]} />}>
                  <Route path="/admin/users" element={<UsersDashboard />} />
                </Route>
                <Route element={<ProtectedRoute requiredRoles={[Role.ADMIN, Role.CAREGIVER]} />}>
                  <Route path="/caregiver/species" element={<SpeciesDashboard />} />
                </Route>
                <Route element={<ProtectedRoute requiredRoles={[Role.ADMIN, Role.CAREGIVER]} />}>
                  <Route path="/caregiver/reservations" element={<ReservationRequests />} />
                </Route>
                <Route element={<ProtectedRoute requiredRoles={[Role.VETS, Role.ADMIN, Role.CAREGIVER]} />}>
                  <Route path="/vets/HealthRecords" element={<HealthRecords />} />
                </Route>
                <Route element={<ProtectedRoute requiredRoles={[Role.VETS, Role.ADMIN, Role.CAREGIVER]} />}>
                  <Route path="/caregiver/examination_requests" element={<ExaminationRequests />} />
                </Route>
                <Route element={<ProtectedRoute requiredRoles={[Role.ADMIN, Role.CAREGIVER]} />}>
                  <Route path="/caregiver/volunteer_validation" element={<VolunteerDashboard />} />
                </Route>
                <Route element={<ProtectedRoute requiredRoles={[Role.ADMIN, Role.VERIFIED_VOLUNTEER]} />}>
                  <Route path="/volunteer/reservations" element={<WalkReservations />} />
                </Route>
                <Route element={<ProtectedRoute requiredRoles={[Role.ADMIN, Role.CAREGIVER]} />}>
                  <Route path="/caregiver/walks" element={<WalkHistory />} />
                </Route>
                <Route element={<ProtectedRoute requiredRoles={[Role.ADMIN, Role.VERIFIED_VOLUNTEER]} />}>
                  <Route path="/volunteer/walks" element={<WalkHistoryVolunteer />} />
                </Route>
                <Route element={<ProtectedRoute requiredRoles={[Role.VOLUNTEER]} />}>
                  <Route path="/volunteer/forbidden" element={<Forbidden />} />
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