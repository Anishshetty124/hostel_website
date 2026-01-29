import Sudoku from './pages/user/Sudoku';
import GameArena from './pages/user/GameArena';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './routes/ProtectedRoute';
import { useContext } from 'react';
import LoadingSpinner from './components/LoadingSpinner';

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
import Feedback from './pages/user/Feedback';
import Complaints from './pages/user/Complaints';
import Games from './pages/user/Games';
import SnakeGame from './pages/user/SnakeGame';
import WhackAMole from './pages/user/WhackAMole';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageRooms from './pages/admin/ManageRooms';
import AdminComplaints from './pages/admin/AdminComplaints';

// Smart Redirect Component - default to public user dashboard, admins still go to /admin
const RootRedirect = () => {
  const { user, loading } = useContext(AuthContext);
  
  // Wait for context to load
  if (loading) {
    return <div className="p-6 text-center text-gray-600 dark:text-gray-300">Loading...</div>;
  }
  
  // If admin, go to admin dashboard
  if (user?.role === 'admin') {
    // User is admin, redirecting to /admin
    return <Navigate to="/admin" replace />;
  }
  
  // Everyone else (including logged-out) goes to the public user dashboard
  return <Navigate to="/user/dashboard" replace />;
};

// Wrap Routes inside AuthProvider to use Context
const AppRoutes = () => {
  const { user, loading } = useContext(AuthContext);
  
  // Show full-screen loading until auth context is ready
  if (loading) {
    return <LoadingSpinner fullScreen={true} />;
  }

  return (
    <Routes>
      {/* --- PUBLIC AUTH --- */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Smart Root Redirect: Admin → /admin, User → /user/dashboard, Not Logged In → /login */}
      {/* Smart Root Redirect: Admin → /admin, User → /user/dashboard, Not Logged In → /login */}
      <Route path="/" element={<RootRedirect />} />

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

        {/* Features (no protection needed) */}
        <Route path="rooms" element={<MyRoom />} />
        <Route path="laundry" element={<Feedback />} />
        <Route path="complaints" element={<Complaints />} />

        <Route path="games" element={<Games />} />
        <Route path="games/:gameType" element={<GameArena />} />
        <Route path="sudoku" element={<Sudoku />} />

      </Route>

      {/* --- ADMIN ROUTES --- */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="complaints" element={<AdminComplaints />} />
          <Route path="rooms" element={<ManageRooms />} />
        </Route>
      </Route>

    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;