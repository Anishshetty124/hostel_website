import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './routes/ProtectedRoute';

// --- LAZY LOAD COMPONENTS (Performance Optimization) ---
// Auth Pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

// Layouts
const UserLayout = lazy(() => import('./components/layouts/UserLayout'));
const AdminLayout = lazy(() => import('./components/layouts/AdminLayout'));

// Dashboards
const UserDashboard = lazy(() => import('./pages/user/UserDashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

// Placeholder Pages (We will build these next)
const ManageRooms = lazy(() => import('./pages/admin/ManageRooms')); // Coming up
const MyRoom = lazy(() => import('./pages/user/MyRoom'));           // Coming up

// Loading Spinner
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 text-blue-600 font-semibold">
    Loading Application...
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* --- PUBLIC ROUTES --- */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to="/login" />} />

            {/* --- USER ROUTES (Student) --- */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<UserLayout />}>
                <Route index element={<UserDashboard />} />
                <Route path="rooms" element={<MyRoom />} />
                {/* Add Food, Complaints here later */}
              </Route>
            </Route>

            {/* --- ADMIN ROUTES (Warden) --- */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="rooms" element={<ManageRooms />} />
                {/* Add Students, Food, Complaints here later */}
              </Route>
            </Route>

            {/* --- 404 CATCH ALL --- */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;