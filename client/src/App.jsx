import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './routes/ProtectedRoute';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Layouts
import UserLayout from './components/layouts/UserLayout';
import AdminLayout from './components/layouts/AdminLayout';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import Profile from './pages/user/Profile';
import MyRoom from './pages/user/MyRoom';
import FoodMenu from './pages/user/FoodMenu';
import Gallery from './pages/user/Gallery';
import Laundry from './pages/user/Laundry';
import Complaints from './pages/user/Complaints';
import Games from './pages/user/Games';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageRooms from './pages/admin/ManageRooms';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* --- PUBLIC AUTH --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Redirect Root to User Dashboard */}
          <Route path="/" element={<Navigate to="/user/dashboard" replace />} />

          {/* --- USER ROUTES --- */}
          {/* Base Path: /user */}
          <Route path="/user" element={<UserLayout />}>
            {/* Redirect /user to /user/dashboard */}
            <Route index element={<Navigate to="/user/dashboard" replace />} />
            
            {/* Public Features */}
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="food" element={<FoodMenu />} />
            <Route path="gallery" element={<Gallery />} />

            {/* Protected Features */}
            <Route element={<ProtectedRoute />}>
              <Route path="rooms" element={<MyRoom />} />
              <Route path="laundry" element={<Laundry />} />
              <Route path="complaints" element={<Complaints />} />
              <Route path="games" element={<Games />} />
            </Route>
          </Route>

          {/* --- ADMIN ROUTES --- */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="rooms" element={<ManageRooms />} />
            </Route>
          </Route>

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;