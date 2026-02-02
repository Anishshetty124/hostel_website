import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './routes/ProtectedRoute';
import { useContext, useEffect, useState, Suspense, lazy } from 'react';
import { subscribeUserToPush } from './utils/push';
const PUBLIC_VAPID_KEY = 'BKk5EmsV8gS6MkGUE7hZf5DjKD6JsinOPfzVPH3xFK1WF9vNRcsLR5u1rTSzrMhgwIcstnloUHKMdD5rgZXX6D8';

import LoadingSpinner from './components/LoadingSpinner';

// Auth Pages - Load immediately
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Layouts - Load immediately
import UserLayout from './components/layouts/UserLayout';
import AdminLayout from './components/layouts/AdminLayout';

// Code-split User Pages (lazy load non-critical routes)
const UserDashboard = lazy(() => import('./pages/user/UserDashboard'));
const Profile = lazy(() => import('./pages/user/Profile'));
const MyRoom = lazy(() => import('./pages/user/MyRoom'));
const FoodMenu = lazy(() => import('./pages/user/FoodMenu'));
const Gallery = lazy(() => import('./pages/user/Gallery'));
const Feedback = lazy(() => import('./pages/user/Feedback'));
const Complaints = lazy(() => import('./pages/user/Complaints'));
const Games = lazy(() => import('./pages/user/Games'));
const GameArena = lazy(() => import('./pages/user/GameArena'));
const MemoryMatch = lazy(() => import('./pages/user/MemoryMatch'));
const LightsOutGame = lazy(() => import('./pages/user/LightsOutGame'));
const Sudoku = lazy(() => import('./pages/user/Sudoku'));
const Notifications = lazy(() => import('./pages/Notifications'));

// Code-split Admin Pages (lazy load non-critical routes)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ManageRooms = lazy(() => import('./pages/admin/ManageRooms'));
const AdminComplaints = lazy(() => import('./pages/admin/AdminComplaints'));
const AdminFoodMenu = lazy(() => import('./pages/admin/AdminFoodMenu'));
const SendNotice = lazy(() => import('./pages/admin/SendNotice'));

// Lazy load suspense fallback
const LazyLoader = () => <LoadingSpinner fullScreen={false} />;


// Use logo192.png for notifications and PWA
const LOGO_URL = '/logo192.png';
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
      <Route path="/" element={<RootRedirect />} />

      {/* --- USER ROUTES --- */}
      {/* Base Path: /user */}
      <Route path="/user" element={<UserLayout />}>
        {/* Notifications route (global, not just user) */}
        <Route path="notifications" element={<Suspense fallback={<LazyLoader />}><Notifications /></Suspense>} />
        {/* Redirect /user to /user/dashboard */}
        <Route index element={<Navigate to="/user/dashboard" replace />} />
        
        {/* Public Features */}
        <Route path="dashboard" element={<Suspense fallback={<LazyLoader />}><UserDashboard /></Suspense>} />
        <Route path="profile" element={<Suspense fallback={<LazyLoader />}><Profile /></Suspense>} />
        <Route path="food" element={<Suspense fallback={<LazyLoader />}><FoodMenu /></Suspense>} />
        <Route path="gallery" element={<Suspense fallback={<LazyLoader />}><Gallery /></Suspense>} />

        {/* Features (no protection needed) */}
        <Route path="rooms" element={<Suspense fallback={<LazyLoader />}><MyRoom /></Suspense>} />
        <Route path="laundry" element={<Suspense fallback={<LazyLoader />}><Feedback /></Suspense>} />
        <Route path="complaints" element={<Suspense fallback={<LazyLoader />}><Complaints /></Suspense>} />

        <Route path="games" element={<Suspense fallback={<LazyLoader />}><Games /></Suspense>} />
        <Route path="games/:gameType" element={<Suspense fallback={<LazyLoader />}><GameArena /></Suspense>} />
        <Route path="sudoku" element={<Suspense fallback={<LazyLoader />}><Sudoku /></Suspense>} />
        <Route path="MemoryMatch" element={<Suspense fallback={<LazyLoader />}><MemoryMatch /></Suspense>} />
        <Route path="LightsOutGame" element={<Suspense fallback={<LazyLoader />}><LightsOutGame /></Suspense>} />



      </Route>

      {/* --- ADMIN ROUTES --- */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Suspense fallback={<LazyLoader />}><AdminDashboard /></Suspense>} />
          <Route path="complaints" element={<Suspense fallback={<LazyLoader />}><AdminComplaints /></Suspense>} />
          <Route path="rooms" element={<Suspense fallback={<LazyLoader />}><ManageRooms /></Suspense>} />
          <Route path="food-menu" element={<Suspense fallback={<LazyLoader />}><AdminFoodMenu /></Suspense>} />
          <Route path="send-notice" element={<Suspense fallback={<LazyLoader />}><SendNotice /></Suspense>} />
        </Route>
      </Route>

    </Routes>
  );
};

function App() {
  // Request notification permission when app loads
  const { user, token } = useContext(AuthContext) || {};
  
  useEffect(() => {
    // Request notification permission if not already granted or denied
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        Notification.requestPermission();
      } catch (err) {
        console.error('Notification permission request failed:', err);
      }
    }
  }, []);

  // Subscribe user to push notifications on login
  useEffect(() => {
    async function subscribe() {
      if (user && token) {
        try {
          const subscription = await subscribeUserToPush(PUBLIC_VAPID_KEY);
          await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/push/subscribe`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(subscription)
          });
        } catch (err) {
          // Ignore if denied or not supported
        }
      }
    }
    subscribe();
  }, [user, token]);

  // Prefetch common route chunks after initial load to reduce navigation lag
  useEffect(() => {
    const prefetch = () => {
      import('./pages/user/Profile');
      import('./pages/user/MyRoom');
      import('./pages/user/FoodMenu');
      import('./pages/user/Gallery');
      import('./pages/user/Feedback');
      import('./pages/user/Complaints');
      import('./pages/user/Games');
      import('./pages/user/GameArena');
      import('./pages/Notifications');

      import('./pages/admin/AdminDashboard');
      import('./pages/admin/ManageRooms');
      import('./pages/admin/AdminComplaints');
      import('./pages/admin/AdminFoodMenu');
      import('./pages/admin/SendNotice');
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const id = window.requestIdleCallback(prefetch, { timeout: 2000 });
      return () => window.cancelIdleCallback?.(id);
    }

    const id = setTimeout(prefetch, 1500);
    return () => clearTimeout(id);
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;